import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const pathname = request.nextUrl.pathname;

  // Optional subdomain alias — canonical portal URL is /portal on the main domain
  if (hostname.startsWith("portal.") && pathname === "/") {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  if (
    pathname.startsWith("/portal") ||
    pathname.startsWith("/api/portal")
  ) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      if (pathname.startsWith("/api/portal")) {
        return NextResponse.json(
          { error: "Portal is not configured." },
          { status: 503 }
        );
      }
    } else {
      return updateSession(request);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/portal/:path*",
    "/api/portal/:path*",
    {
      source: "/",
      has: [{ type: "host", value: "portal.bluelightningservices.com" }],
    },
  ],
};
