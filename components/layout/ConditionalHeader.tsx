"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";

function isPublicPortalLanding(pathname: string) {
  return pathname === "/portal";
}

export function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/portal") && !isPublicPortalLanding(pathname)) return null;
  return <Header />;
}
