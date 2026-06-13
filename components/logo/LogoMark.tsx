import Link from "next/link";
import { LogoImage } from "@/components/logo/LogoImage";
import { site } from "@/lib/content";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  showText?: boolean;
  className?: string;
  logoClassName?: string;
}

export function LogoMark({
  showText = true,
  className = "",
  logoClassName = "h-10 w-auto",
}: LogoMarkProps) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)}>
      <LogoImage
        className={cn("logo-pulse shrink-0", logoClassName)}
        priority
      />
      {showText && (
        <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
          {site.name}
        </span>
      )}
    </Link>
  );
}
