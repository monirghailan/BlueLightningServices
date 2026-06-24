import { NextRequest, NextResponse } from "next/server";
import { computeAllOrgMetrics } from "@/lib/jira/sync/compute-metrics-db";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await computeAllOrgMetrics();
    return NextResponse.json({ computed: count });
  } catch (error) {
    console.error("Org metrics cron error:", error);
    return NextResponse.json({ error: "Metrics computation failed." }, { status: 500 });
  }
}
