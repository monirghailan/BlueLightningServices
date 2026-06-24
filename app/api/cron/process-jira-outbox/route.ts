import { NextRequest, NextResponse } from "next/server";
import { processJiraOutbox } from "@/lib/jira/sync/process-outbox";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processJiraOutbox();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Jira outbox cron error:", error);
    return NextResponse.json({ error: "Outbox processing failed." }, { status: 500 });
  }
}
