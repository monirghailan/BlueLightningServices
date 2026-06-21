import Link from "next/link";
import { LogoMark } from "@/components/logo/LogoMark";

export function PortalAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <LogoMark className="mb-8" logoClassName="h-8 w-7 sm:h-9 sm:w-8" />
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8">
        {children}
      </div>
    </div>
  );
}

export function PortalBackToWebsiteLink() {
  return (
    <p className="mt-6 text-center text-xs text-muted">
      <Link href="/" className="text-bolt-outline hover:underline">
        ← Back to website
      </Link>
    </p>
  );
}
