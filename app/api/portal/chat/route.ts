import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import {
  portalErrorResponse,
  requirePortalSession,
  getAuthenticatedSupabase,
} from "@/lib/portal/auth";
import { buildAssistantSystemPrompt } from "@/lib/assistant/prompts";
import { isChatRateLimited } from "@/lib/assistant/rate-limit";
import { searchOrgGuide } from "@/lib/assistant/search";
import {
  fetchRepoFile,
  getGitHubClient,
  parseGitHubRepoUrl,
} from "@/lib/assistant/github";
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

    const supabase = await getAuthenticatedSupabase();
    let conversationId = parsed.data.conversationId;

    if (conversationId) {
      const { data: existing } = await supabase
        .from("assistant_conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", session.userId)
        .eq("organization_id", org.id)
        .maybeSingle();

      if (!existing) {
        conversationId = undefined;
      }
    }

    if (!conversationId) {
      const lastUserMessage = parsed.data.messages.filter((m) => m.role === "user").at(-1);
      const { data: created, error } = await supabase
        .from("assistant_conversations")
        .insert({
          organization_id: org.id,
          user_id: session.userId,
          title: lastUserMessage?.content.slice(0, 80) ?? "Assistant chat",
        })
        .select("id")
        .single();

      if (error || !created) {
        console.error(error);
        return Response.json({ error: "Failed to start conversation." }, { status: 500 });
      }

      conversationId = created.id;
    }

    const uiMessages = body.messages as UIMessage[];
    const lastUser = uiMessages.filter((m) => m.role === "user").at(-1);
    const lastUserText = lastUser ? getMessageText(lastUser) : "";

    if (lastUserText) {
      await supabase.from("assistant_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: lastUserText,
      });
    }

    const repoRef = parseGitHubRepoUrl(org.github_repo_url, org.github_default_branch ?? "main");
    const collectedSources: Array<{ path: string; title: string }> = [];

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: buildAssistantSystemPrompt({
        org,
        persona: session.assistantPersona,
      }),
      messages: await convertToModelMessages(uiMessages),
      stopWhen: stepCountIs(5),
      tools: {
        searchOrgGuide: tool({
          description:
            "Search this organization's curated Salesforce guide for relevant information.",
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
              if (!collectedSources.some((s) => s.path === item.path)) {
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
            "Fetch a specific markdown file from the org guide repository by path.",
          inputSchema: z.object({
            path: z.string().describe("Relative repo path, e.g. how-to/create-a-lead.md"),
          }),
          execute: async ({ path }) => {
            const content = await fetchRepoFile(getGitHubClient(), repoRef, path);
            collectedSources.push({
              path,
              title: path.split("/").pop() ?? path,
            });
            return { path, content: content.slice(0, 12000) };
          },
        }),
      },
      onFinish: async ({ text }) => {
        await supabase.from("assistant_messages").insert({
          conversation_id: conversationId!,
          role: "assistant",
          content: text,
          sources: collectedSources,
        });

        await supabase
          .from("assistant_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId!);
      },
    });

    const response = result.toUIMessageStreamResponse({
      headers: {
        "X-Conversation-Id": conversationId!,
      },
    });

    return response;
  } catch (error) {
    return portalErrorResponse(error);
  }
}
