import { redirect } from "next/navigation";
import { requirePortalAdmin } from "@/lib/portal/auth";

export default async function TicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requirePortalAdmin();
  } catch {
    redirect("/portal/assistant");
  }

  return children;
}
