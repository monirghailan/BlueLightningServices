import { NextRequest, NextResponse } from "next/server";
import { deleteIssueByKey } from "@/lib/jira/sync/upsert-issue";
import { deleteCommentByJiraId, syncIssueByKey } from "@/lib/jira/sync/upsert-comment";
import { verifyJiraWebhookAuth } from "@/lib/jira/sync/verify-webhook";

export async function POST(request: NextRequest) {
  if (!process.env.JIRA_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const payload = await request.text();

  if (!verifyJiraWebhookAuth(payload, request.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    webhookEvent?: string;
    issue?: { key: string };
    comment?: { id: string; self?: string };
  };

  try {
    body = JSON.parse(payload);
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

    if (event === "comment_deleted" && body.comment?.id) {
      const deleted = await deleteCommentByJiraId(body.comment.id);
      return NextResponse.json({ ok: true, action: "comment_deleted", deleted });
    }

    if (
      issueKey &&
      (event === "jira:issue_created" ||
        event === "jira:issue_updated" ||
        event === "comment_created" ||
        event === "comment_updated")
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
