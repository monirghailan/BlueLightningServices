import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  AssistantPersona,
  MemberRole,
  Organization,
} from "@/lib/supabase/database.types";

export interface PortalSession {
  userId: string;
  email: string;
  organization: Organization;
  role: MemberRole;
  assistantPersona: AssistantPersona;
}

export async function getPortalSession(): Promise<PortalSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership, error } = await supabase
    .from("organization_members")
    .select("role, organization_id, assistant_persona")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error || !membership) return null;

  const member = membership as {
    role: MemberRole;
    organization_id: string;
    assistant_persona: AssistantPersona | null;
  };

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", member.organization_id)
    .maybeSingle();

  if (orgError || !org) return null;

  const organization = org as Organization;
  if (organization.status !== "active") return null;

  return {
    userId: user.id,
    email: user.email ?? "",
    organization,
    role: member.role,
    assistantPersona: member.assistant_persona ?? "general",
  };
}

export async function requirePortalSession(): Promise<PortalSession> {
  const session = await getPortalSession();
  if (!session) {
    throw new PortalAuthError("Unauthorized", 401);
  }
  return session;
}

export async function requirePortalAdmin(): Promise<PortalSession> {
  const session = await requirePortalSession();
  if (session.role !== "administrator") {
    throw new PortalAuthError("Forbidden", 403);
  }
  return session;
}

export class PortalAuthError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "PortalAuthError";
  }
}

export function portalErrorResponse(error: unknown) {
  if (error instanceof PortalAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Internal server error." }, { status: 500 });
}

export async function getServiceSupabase() {
  const { createServiceClient } = await import("@/lib/supabase/server");
  return createServiceClient();
}

export async function getAuthenticatedSupabase() {
  return createClient();
}
