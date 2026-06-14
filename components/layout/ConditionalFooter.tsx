"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

/** Footer lives inside the homepage snap section; other routes use the layout footer. */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/portal")) return null;
  return <Footer />;
}
