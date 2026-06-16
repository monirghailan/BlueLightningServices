import { NextRequest, NextResponse } from "next/server";
import { formatJiraError } from "@/lib/jira/provisioning";
import { provisionClientOrganization } from "@/lib/portal/provision-client";
import { slugifyCompany, uniqueOrgSlug } from "@/lib/portal/slug";
import { createServiceClient } from "@/lib/supabase/server";
import type { Lead, LeadProvisioningJob } from "@/lib/supabase/database.types";

const MAX_ATTEMPTS = 5;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: jobs, error: jobsError } = await supabase
    .from("lead_provisioning_jobs")
    .select("*")
    .is("processed_at", null)
    .lt("attempt_count", MAX_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(10);

  if (jobsError) {
    console.error(jobsError);
    return NextResponse.json({ error: "Failed to fetch jobs." }, { status: 500 });
  }

  const results: { leadId: string; status: "processed" | "failed" | "skipped" }[] = [];

  for (const job of (jobs ?? []) as LeadProvisioningJob[]) {
    const outcome = await processJob(supabase, job);
    results.push({ leadId: job.lead_id, status: outcome });
  }

  return NextResponse.json({ processed: results.length, results });
}

async function processJob(
  supabase: ReturnType<typeof createServiceClient>,
  job: LeadProvisioningJob
): Promise<"processed" | "failed" | "skipped"> {
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", job.lead_id)
    .maybeSingle();

  if (leadError || !lead) {
    await markJobFailed(supabase, job.lead_id, leadError?.message ?? "Lead not found.");
    return "failed";
  }

  const leadRow = lead as Lead;

  if (leadRow.status !== "Qualified" || leadRow.organization_id) {
    await supabase
      .from("lead_provisioning_jobs")
      .update({ processed_at: new Date().toISOString() })
      .eq("lead_id", job.lead_id);
    return "skipped";
  }

  await supabase
    .from("lead_provisioning_jobs")
    .update({ attempt_count: job.attempt_count + 1 })
    .eq("lead_id", job.lead_id);

  try {
    const baseSlug = slugifyCompany(leadRow.company);
    const slug = await uniqueOrgSlug(supabase, baseSlug);

    const result = await provisionClientOrganization(supabase, {
      name: leadRow.company,
      slug,
      adminEmail: leadRow.email,
      adminName: leadRow.name,
    });

    const now = new Date().toISOString();

    await supabase
      .from("leads")
      .update({
        organization_id: result.organizationId,
        provisioned_at: now,
        provisioning_error: null,
      })
      .eq("id", leadRow.id);

    await supabase
      .from("lead_provisioning_jobs")
      .update({ processed_at: now, error: null })
      .eq("lead_id", job.lead_id);

    return "processed";
  } catch (error) {
    const message = formatJiraError(error);
    await markJobFailed(supabase, job.lead_id, message, leadRow.id);
    return "failed";
  }
}

async function markJobFailed(
  supabase: ReturnType<typeof createServiceClient>,
  leadId: string,
  message: string,
  leadRowId?: string
) {
  await supabase
    .from("lead_provisioning_jobs")
    .update({ error: message })
    .eq("lead_id", leadId);

  if (leadRowId) {
    await supabase
      .from("leads")
      .update({ provisioning_error: message })
      .eq("id", leadRowId);
  }
}
