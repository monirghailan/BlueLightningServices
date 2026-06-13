"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LogoImage } from "@/components/logo/LogoImage";
import { cn } from "@/lib/utils";

interface LogoHeroProps {
  className?: string;
  compact?: boolean;
  /** Compact animated logo for mobile hero — scales with viewport height */
  inline?: boolean;
}

export function LogoHero({
  className,
  compact = false,
  inline = false,
}: LogoHeroProps) {
  const reducedMotion = useReducedMotion();

  const sizeClass = inline
    ? "hero-logo-inline__img"
    : compact
      ? "h-28 w-auto sm:h-32 xl:h-40"
      : "h-36 w-auto sm:h-40 xl:h-52";

  const containerClass = inline
    ? "hero-logo-inline__box"
    : compact
      ? "h-32 w-32 sm:h-36 sm:w-36 xl:h-44 xl:w-44"
      : "h-40 w-40 sm:h-44 sm:w-44 xl:h-56 xl:w-56";

  if (reducedMotion) {
    return (
      <div className={cn("flex items-center justify-center", containerClass, className)}>
        <LogoImage className={sizeClass} priority />
      </div>
    );
  }

  return (
    <div
      className={cn("relative flex items-center justify-center", containerClass, className)}
      style={{ perspective: 900 }}
    >
      <motion.div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full",
          inline ? "blur-2xl" : "blur-3xl"
        )}
        style={{
          background:
            "radial-gradient(circle, rgba(96,165,250,0.3) 0%, transparent 68%)",
        }}
        animate={{ opacity: [0.45, 0.75, 0.45], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          rotateY: inline ? [-6, 6, -6] : [-10, 10, -10],
          rotateX: inline ? [2, -2, 2] : [3, -3, 3],
          y: inline ? [0, -2, 0] : [0, -4, 0],
        }}
        transition={{
          opacity: { duration: 0.6 },
          scale: { duration: 0.6 },
          rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          rotateX: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <LogoImage
          className={cn(
            "relative object-contain",
            inline
              ? "drop-shadow-[0_0_14px_rgba(96,165,250,0.35)]"
              : "drop-shadow-[0_0_24px_rgba(96,165,250,0.4)]",
            sizeClass
          )}
          priority
        />
      </motion.div>
    </div>
  );
}
