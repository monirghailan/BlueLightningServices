import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  return NextResponse.json({
    urlConfigured: Boolean(url),
    serviceRoleConfigured: Boolean(serviceRoleKey),
    anonKeyConfigured: Boolean(anonKey),
    urlHost: url ? new URL(url).host : null,
  });
}
