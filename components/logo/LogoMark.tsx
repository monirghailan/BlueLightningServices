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
  logoClassName = "h-10 w-9",
}: LogoMarkProps) {
  return (
    <Link
      href="/"
      className={cn("group flex h-full max-h-full items-center gap-3", className)}
    >
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden",
          logoClassName
        )}
      >
        <LogoImage
          className="logo-pulse h-full max-h-full w-auto object-contain"
          priority
          decorative={showText}
        />
      </span>
      {showText && (
        <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
          {site.name}
        </span>
      )}
    </Link>
  );
}
