import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import {
  ASSISTANT_STATUS_LABELS,
  type AssistantChatMessage,
} from "@/lib/assistant/chat-types";
import { resolveAssistantConversation } from "@/lib/assistant/conversation";
import { fetchCachedGuideFile } from "@/lib/assistant/guide-file-cache";
import {
  fetchRepoFile,
  getGitHubClient,
  parseGitHubRepoUrl,
} from "@/lib/assistant/github";
import {
  collectSourcesFromResults,
  findHowToPath,
  prefetchGuideFile,
} from "@/lib/assistant/prefetch";
import { buildAssistantSystemPrompt } from "@/lib/assistant/prompts";
import { isChatRateLimited } from "@/lib/assistant/rate-limit";
import { searchOrgGuide } from "@/lib/assistant/search";
import { trimChatMessages } from "@/lib/assistant/trim-messages";
import {
  portalErrorResponse,
  requirePortalSession,
  getAuthenticatedSupabase,
} from "@/lib/portal/auth";
import { chatSchema } from "@/lib/validations/portal";

export const maxDuration = 60;

function getAssistantServerConfigErrors(): string[] {
  const missing: string[] = [];
  if (!process.env.OPENAI_API_KEY) missing.push("OPENAI_API_KEY");
  if (!process.env.GITHUB_PAT && !process.env.GITHUB_APP_TOKEN) {
    missing.push("GITHUB_PAT");
  }
  return missing;
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function writeAssistantStatus(
  writer: { write: (part: { type: "data-assistantStatus"; data: { label: string }; transient: true }) => void },
  label: string
) {
  writer.write({
    type: "data-assistantStatus",
    data: { label },
    transient: true,
  });
}

export async function POST(request: Request) {
  try {
    const session = await requirePortalSession();

    if (isChatRateLimited(session.userId)) {
      return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const org = session.organization;

    if (!org.assistant_enabled || !org.github_repo_url) {
      return Response.json(
        { error: "The assistant is not configured for your organization yet." },
        { status: 503 }
      );
    }

    const serverConfigErrors = getAssistantServerConfigErrors();
    if (serverConfigErrors.length > 0) {
      console.error("Assistant server misconfiguration:", serverConfigErrors.join(", "));
      return Response.json(
        {
          error:
            "The assistant is temporarily unavailable due to a server configuration issue. Please contact Blue Lightning Services.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = chatSchema.safeParse({
      messages: (body.messages as UIMessage[] | undefined)?.map((message) => ({
        role: message.role,
        content: getMessageText(message),
      })),
      conversationId: body.conversationId,
    });

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid chat request." },
        { status: 400 }
      );
    }

    const uiMessages = trimChatMessages(body.messages as AssistantChatMessage[]);
    const lastUser = uiMessages.filter((message) => message.role === "user").at(-1);
    const lastUserText = lastUser ? getMessageText(lastUser) : "";
    const conversationTitle =
      parsed.data.messages.filter((message) => message.role === "user").at(-1)?.content.slice(0, 80) ??
      "Assistant chat";

    const supabase = await getAuthenticatedSupabase();
    const repoRef = parseGitHubRepoUrl(org.github_repo_url, org.github_default_branch ?? "main");

    const [conversationId, searchResults] = await Promise.all([
      resolveAssistantConversation(supabase, {
        conversationId: parsed.data.conversationId,
        userId: session.userId,
        organizationId: org.id,
        title: conversationTitle,
      }),
      lastUserText
        ? searchOrgGuide(supabase, {
            organizationId: org.id,
            question: lastUserText,
            persona: session.assistantPersona,
          })
        : Promise.resolve([]),
    ]);

    if (lastUserText) {
      void supabase
        .from("assistant_messages")
        .insert({
          conversation_id: conversationId,
          role: "user",
          content: lastUserText,
        })
        .then(({ error: insertError }) => {
          if (insertError) {
            console.error("Failed to save user message:", insertError);
          }
        });
    }

    const howToPath = findHowToPath(searchResults);

    const [prefetchedFile, modelMessages] = await Promise.all([
      howToPath
        ? prefetchGuideFile({
            orgId: org.id,
            repoRef,
            path: howToPath,
          })
        : Promise.resolve(null),
      convertToModelMessages(uiMessages),
    ]);

    const collectedSources = collectSourcesFromResults(searchResults, prefetchedFile);

    const stream = createUIMessageStream<AssistantChatMessage>({
      execute: ({ writer }) => {
        writeAssistantStatus(writer, ASSISTANT_STATUS_LABELS.drafting);

        const result = streamText({
          model: openai("gpt-4o-mini"),
          system: buildAssistantSystemPrompt({
            org,
            persona: session.assistantPersona,
            searchResults,
            prefetchedFile,
          }),
          messages: modelMessages,
          stopWhen: stepCountIs(3),
          tools: {
            searchOrgGuide: tool({
              description:
                "Search this organization's curated Salesforce guide for relevant information. Use only when the pre-search results are insufficient.",
              inputSchema: z.object({
                question: z.string().describe("The user's question or search query"),
              }),
              execute: async ({ question }) => {
                const results = await searchOrgGuide(supabase, {
                  organizationId: org.id,
                  question,
                  persona: session.assistantPersona,
                });

                for (const item of results) {
                  if (!collectedSources.some((source) => source.path === item.path)) {
                    collectedSources.push({ path: item.path, title: item.title });
                  }
                }

                if (results.length === 0) {
                  return { found: false, results: [] };
                }

                return {
                  found: true,
                  results: results.map((item) => ({
                    path: item.path,
                    title: item.title,
                    content: item.content,
                    similarity: item.similarity,
                  })),
                };
              },
            }),
            fetchGuideFile: tool({
              description:
                "Fetch the full content of a guide file by path. Use when you need complete step-by-step instructions not already in the pre-loaded content.",
              inputSchema: z.object({
                path: z.string().describe("Relative repo path, e.g. how-to/create-a-lead.md"),
              }),
              execute: async ({ path }) => {
                const content = await fetchCachedGuideFile(org.id, repoRef, path, () =>
                  fetchRepoFile(getGitHubClient(), repoRef, path)
                );

                if (!collectedSources.some((source) => source.path === path)) {
                  collectedSources.push({
                    path,
                    title: path.split("/").pop() ?? path,
                  });
                }

                return { path, content: content.slice(0, 12_000) };
              },
            }),
          },
          experimental_onToolCallStart: ({ toolCall }) => {
            if (toolCall.toolName === "searchOrgGuide") {
              writeAssistantStatus(writer, ASSISTANT_STATUS_LABELS.searching);
            }

            if (toolCall.toolName === "fetchGuideFile") {
              writeAssistantStatus(writer, ASSISTANT_STATUS_LABELS.loadingSteps);
            }
          },
          onFinish: async ({ text }) => {
            const { data: savedMessage, error: saveError } = await supabase
              .from("assistant_messages")
              .insert({
                conversation_id: conversationId,
                role: "assistant",
                content: text,
                sources: collectedSources,
              })
              .select("id")
              .single();

            if (saveError) {
              console.error(saveError);
            }

            await supabase
              .from("assistant_conversations")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", conversationId);

            if (savedMessage) {
              writer.write({
                type: "message-metadata",
                messageMetadata: {
                  dbMessageId: savedMessage.id,
                  feedback: null,
                },
              });
            }
          },
        });

        writer.merge(
          result.toUIMessageStream({
            originalMessages: uiMessages,
          })
        );
      },
    });

    return createUIMessageStreamResponse({
      stream,
      headers: {
        "X-Conversation-Id": conversationId,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Failed to start conversation.") {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return portalErrorResponse(error);
  }
}
