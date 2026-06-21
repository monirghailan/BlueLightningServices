"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

function isPublicPortalLanding(pathname: string) {
  return pathname === "/portal";
}

/** Footer lives inside the homepage snap section; other routes use the layout footer. */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  if (pathname.startsWith("/portal") && !isPublicPortalLanding(pathname)) return null;
  return <Footer />;
}
