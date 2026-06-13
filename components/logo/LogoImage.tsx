import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoImageProps {
  className?: string;
  priority?: boolean;
}

/** Renders the official brand logo PNG (black bg blends with site #0a0f1a) */
export function LogoImage({ className, priority = false }: LogoImageProps) {
  return (
    <Image
      src="/logo-source.png"
      alt=""
      width={120}
      height={140}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
      aria-hidden
    />
  );
}
