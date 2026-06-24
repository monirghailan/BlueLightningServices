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
  const delay = (col + row) * 0.03;
  const tilt = ((index * 7) % 5) - 2;

  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ opacity: 0, rotate: tilt - 4 }}
      animate={{ opacity: 0.22, rotate: tilt }}
      transition={{
        delay,
        duration: 0.35,
        ease: "easeOut",
      }}
    >
      <LogoImage className="h-full max-h-10 w-auto sm:max-h-12" />
    </motion.div>
  );
}

function CenterLogo() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 scale-150 rounded-full bg-bolt-glow/20 blur-3xl" />
        <LogoImage
          className="logo-pulse relative h-20 w-auto drop-shadow-[0_0_28px_rgba(96,165,250,0.45)] sm:h-24"
          priority
        />
      </div>
    </div>
  );
}

function StampPatternLoader({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)} aria-busy aria-label="Loading">
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
      <CenterLogo />
    </div>
  );
}

interface PortalLoadingScreenProps {
  fullScreen?: boolean;
}

export function PortalLoadingScreen({ fullScreen = false }: PortalLoadingScreenProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          fullScreen ? "min-h-dvh" : "h-full min-h-48"
        )}
        aria-busy
        aria-label="Loading"
      >
        <LogoImage className="logo-pulse h-16 w-auto" priority />
      </div>
    );
  }

  return (
    <StampPatternLoader
      className={fullScreen ? "min-h-dvh w-full" : "h-full w-full min-h-48"}
    />
  );
}

/** Header stays visible; loader fills only the main content slot below it. */
export function PortalContentLoadingLayout({
  header,
}: {
  header: React.ReactNode;
}) {
  return (
    <div className="portal-shell grid h-dvh grid-rows-[auto_minmax(0,1fr)] bg-background text-foreground">
      {header}
      <main data-portal-main className="relative min-h-0 overflow-hidden">
        <PortalLoadingScreen />
      </main>
    </div>
  );
}
