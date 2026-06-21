"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LogoImage } from "@/components/logo/LogoImage";
import { cn } from "@/lib/utils";

const COLS = 12;
const ROWS = 9;
const TOTAL = COLS * ROWS;

function StampCell({ index }: { index: number }) {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const delay = (col + row) * 0.04;
  const tilt = ((index * 7) % 5) - 2;

  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.15, rotate: tilt - 6 }}
      animate={{ opacity: 0.24, scale: 1, rotate: tilt }}
      transition={{
        delay,
        duration: 0.45,
        type: "spring",
        stiffness: 420,
        damping: 24,
      }}
    >
      <LogoImage className="h-full max-h-10 w-auto sm:max-h-12" />
    </motion.div>
  );
}

interface PortalLoadingScreenProps {
  fullScreen?: boolean;
}

export function PortalLoadingScreen({ fullScreen = false }: PortalLoadingScreenProps) {
  const reducedMotion = useReducedMotion();
  const minHeight = fullScreen ? "min-h-dvh" : "min-h-[calc(100dvh-10rem)]";
  const inset = fullScreen ? "" : "-mx-4 -my-8 sm:-mx-6";

  if (reducedMotion) {
    return (
      <div
        className={cn("flex items-center justify-center", minHeight)}
        aria-busy
        aria-label="Loading"
      >
        <LogoImage className="logo-pulse h-16 w-auto" priority />
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden", minHeight, inset)}
      aria-busy
      aria-label="Loading"
    >
      <div
        className="absolute inset-0 grid gap-1 p-3 sm:gap-1.5 sm:p-4"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: TOTAL }, (_, index) => (
          <StampCell key={index} index={index} />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_88%)]" />

      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
      >
        <div className="relative">
          <div className="absolute inset-0 scale-150 rounded-full bg-bolt-glow/20 blur-3xl" />
          <LogoImage
            className="logo-pulse relative h-20 w-auto drop-shadow-[0_0_28px_rgba(96,165,250,0.45)] sm:h-24"
            priority
          />
        </div>
      </motion.div>
    </div>
  );
}
