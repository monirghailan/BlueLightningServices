import { NextRequest, NextResponse } from "next/server";
import { reconcileAllOrgs } from "@/lib/jira/sync/reconcile-org";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await reconcileAllOrgs(false);
    return NextResponse.json({ reconciled: results.length, results });
  } catch (error) {
    console.error("Jira mirror sync cron error:", error);
    return NextResponse.json({ error: "Mirror sync failed." }, { status: 500 });
  }
}
