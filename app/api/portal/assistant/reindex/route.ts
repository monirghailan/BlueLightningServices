import { NextRequest, NextResponse } from "next/server";
import { indexOrgGuide } from "@/lib/assistant/index-repo";
import { getServiceSupabase, portalErrorResponse } from "@/lib/portal/auth";

function isAuthorizedReindex(request: NextRequest): boolean {
  const secret = process.env.ASSISTANT_REINDEX_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedReindex(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const serviceSupabase = await getServiceSupabase();
    const body = await request.json().catch(() => ({}));
    let organizationId =
      typeof body.organizationId === "string" ? body.organizationId : undefined;

    if (!organizationId) {
      const slug = typeof body.slug === "string" ? body.slug : undefined;
      if (slug) {
        const { data: org } = await serviceSupabase
          .from("organizations")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        organizationId = org?.id;
      }
    }

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId or slug required." }, { status: 400 });
    }

    const { data: org, error: orgError } = await serviceSupabase
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .maybeSingle();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found." }, { status: 404 });
    }

    if (!org.github_repo_url) {
      return NextResponse.json(
        { error: "Organization has no github_repo_url configured." },
        { status: 400 }
      );
    }

    const result = await indexOrgGuide(serviceSupabase, org);

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return portalErrorResponse(error);
  }
}
