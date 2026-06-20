import { getPortalSession } from "@/lib/portal/auth";
import { redirect } from "next/navigation";
import { AssistantChat } from "@/components/portal/AssistantChat";

export default async function AssistantPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assistant</h1>
        <p className="mt-1 text-sm text-muted">
          Plain-English help for using your Salesforce org — grounded in your organization guide.
        </p>
      </div>
      <AssistantChat />
    </div>
  );
}
