import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPortalSession, getPortalHomePath } from "@/lib/portal/auth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/portal";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      let destination = nextParam;
      if (nextParam === "/portal") {
        const session = await getPortalSession();
        destination = session ? getPortalHomePath(session.role) : "/portal/assistant";
      }
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/portal/login?error=auth`);
}
