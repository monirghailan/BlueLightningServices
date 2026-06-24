import { NextRequest, NextResponse } from "next/server";
import { deleteIssueByKey } from "@/lib/jira/sync/upsert-issue";
import { syncIssueByKey } from "@/lib/jira/sync/upsert-comment";
import { createServiceClient } from "@/lib/supabase/server";

function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = process.env.JIRA_WEBHOOK_SECRET;
  if (!secret) return false;
  const header = request.headers.get("x-jira-webhook-secret");
  return header === secret;
}

export async function POST(request: NextRequest) {
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    webhookEvent?: string;
    issue?: { key: string };
    comment?: { id: string; self?: string };
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const event = body.webhookEvent ?? "";
  const issueKey = body.issue?.key;

  try {
    if (event === "jira:issue_deleted" && issueKey) {
      await deleteIssueByKey(issueKey);
      return NextResponse.json({ ok: true, action: "deleted" });
    }

    if (
      issueKey &&
      (event === "jira:issue_created" ||
        event === "jira:issue_updated" ||
        event.startsWith("comment_"))
    ) {
      const result = await syncIssueByKey(issueKey);
      return NextResponse.json({ ok: true, synced: !!result });
    }

    return NextResponse.json({ ok: true, skipped: true, event });
  } catch (error) {
    console.error("Jira webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
