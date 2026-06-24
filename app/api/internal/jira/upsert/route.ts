import { NextRequest, NextResponse } from "next/server";
import { syncIssueByKey } from "@/lib/jira/sync/upsert-comment";
import { persistOrgMetrics } from "@/lib/jira/sync/compute-metrics-db";
import { createServiceClient } from "@/lib/supabase/server";
import type { Organization } from "@/lib/supabase/database.types";

function verifySyncSecret(request: NextRequest): boolean {
  const secret = process.env.JIRA_SYNC_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!verifySyncSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { issueKey?: string; organizationId?: string; recomputeMetrics?: boolean };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (!body.issueKey) {
    return NextResponse.json({ error: "issueKey is required." }, { status: 400 });
  }

  try {
    const result = await syncIssueByKey(body.issueKey, body.organizationId ?? null);

    if (body.recomputeMetrics && result?.organizationId) {
      const supabase = createServiceClient();
      const { data: org } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", result.organizationId)
        .maybeSingle();

      if (org) {
        await persistOrgMetrics(org as Organization);
      }
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Jira upsert error:", error);
    return NextResponse.json({ error: "Upsert failed." }, { status: 500 });
  }
}
