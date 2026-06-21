import { getPortalSession } from "@/lib/portal/auth";
import { AssistantChat } from "@/components/portal/AssistantChat";

export default async function AssistantPage() {
  const session = await getPortalSession();

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
        />
      )}
    </div>
  );
}
