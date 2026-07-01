import Image from "next/image";
import { site } from "@/lib/content";
import { cn } from "@/lib/utils";

interface LogoImageProps {
  className?: string;
  priority?: boolean;
  /** Decorative logos keep alt text for crawlers but hide from screen readers. */
  decorative?: boolean;
}

/** Renders the official brand logo PNG (black bg blends with site #0a0f1a) */
export function LogoImage({
  className,
  priority = false,
  decorative = false,
}: LogoImageProps) {
  const alt = decorative ? `${site.name} logo` : site.name;

  return (
    <Image
      src="/logo-source.png"
      alt={alt}
      width={120}
      height={140}
      priority={priority}
      sizes="(max-width: 640px) 24px, 160px"
      className={cn("block object-contain", className)}
      style={{ width: "auto", maxWidth: "100%" }}
      {...(decorative ? { "aria-hidden": true } : {})}
    />
  );
}
