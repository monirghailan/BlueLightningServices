"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

/** Footer lives inside snap sections on / and /portal; other routes use the layout footer. */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/portal") return null;
  if (pathname.startsWith("/portal")) return null;
  return <Footer />;
}
