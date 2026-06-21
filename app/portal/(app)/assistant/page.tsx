import { AssistantChat } from "@/components/portal/AssistantChat";
import { getCachedOrgFaqQuestions } from "@/lib/assistant/faq";
import { getAuthenticatedSupabase, getPortalSession } from "@/lib/portal/auth";

export default async function AssistantPage() {
  const session = await getPortalSession();
  const suggestedQuestions =
    session?.organization.assistant_enabled && session.organization.github_repo_url
      ? await getCachedOrgFaqQuestions(
          session.organization,
          await getAuthenticatedSupabase()
        )
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assistant</h1>
        <p className="mt-1 text-sm text-muted">
          Plain-English help for using your Salesforce org — grounded in your organization guide.
        </p>
      </div>
      {session && (
        <AssistantChat
          initialMeta={{
            assistantPersona: session.assistantPersona,
            assistantEnabled: session.organization.assistant_enabled,
            assistantLastIndexedAt: session.organization.assistant_last_indexed_at,
          }}
          suggestedQuestions={suggestedQuestions}
          canChangePersona={session.role === "administrator"}
        />
      )}
    </div>
  );
}
