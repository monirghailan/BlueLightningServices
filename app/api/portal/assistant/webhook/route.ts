import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { indexOrgGuide } from "@/lib/assistant/index-repo";
import { getServiceSupabase } from "@/lib/portal/auth";

function verifyGitHubSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature?.startsWith("sha256=")) return false;
  const digest = createHmac("sha256", secret).update(payload).digest("hex");
  const expected = `sha256=${digest}`;
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const payload = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyGitHubSignature(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = request.headers.get("x-github-event");
  if (event !== "push") {
    return NextResponse.json({ ok: true, skipped: true, reason: "ignored event" });
  }

  let body: {
    repository?: { html_url?: string; full_name?: string };
    ref?: string;
  };

  try {
    body = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const repoUrl = body.repository?.html_url;
  if (!repoUrl) {
    return NextResponse.json({ error: "Missing repository." }, { status: 400 });
  }

  const supabase = await getServiceSupabase();
  const normalizedUrl = repoUrl.replace(/\.git$/, "").replace(/\/$/, "");

  const { data: orgs } = await supabase
    .from("organizations")
    .select("*")
    .not("github_repo_url", "is", null);

  const org = (orgs ?? []).find((row) => {
    const configured = (row.github_repo_url ?? "").replace(/\.git$/, "").replace(/\/$/, "");
    return configured.toLowerCase() === normalizedUrl.toLowerCase();
  });

  if (!org) {
    return NextResponse.json({ ok: true, skipped: true, reason: "no matching organization" });
  }

  try {
    const result = await indexOrgGuide(supabase, org);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Reindex failed." },
      { status: 500 }
    );
  }
}
