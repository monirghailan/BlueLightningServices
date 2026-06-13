"use client";

import { ChevronDown } from "lucide-react";
import {
  Children,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

function getHeaderOffset() {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    "--header-offset"
  );
  return parseFloat(value) || 0;
}

function findActiveSectionIndex(sections: Element[]) {
  if (sections.length === 0) return 0;

  const headerOffset = getHeaderOffset();
  let active = 0;
  let bestDistance = Infinity;

  for (let i = 0; i < sections.length; i++) {
    const distance = Math.abs(sections[i].getBoundingClientRect().top - headerOffset);
    if (distance < bestDistance) {
      bestDistance = distance;
      active = i;
    }
  }

  return active;
}

function KeepScrollingHint({ visible }: { visible: boolean }) {
  return (
    <div
      className={cn(
        "keep-scrolling-hint pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-6 sm:pb-8",
        visible && "keep-scrolling-hint--visible"
      )}
      aria-hidden={!visible}
    >
      <div className="keep-scrolling-hint__pill flex items-center gap-2 rounded-full border border-white/10 bg-background/70 px-4 py-2 text-xs font-medium tracking-wide text-muted backdrop-blur-md sm:text-sm">
        <span>Keep scrolling</span>
        <ChevronDown className="keep-scrolling-hint__icon size-4 text-bolt-glow" strokeWidth={2} />
      </div>
    </div>
  );
}

function getSectionForSnapTarget(target: Element | null) {
  if (!target) return null;
  if (target.classList.contains("snap-section")) return target;
  return target.closest(".snap-section");
}

export function SnapScrollRoot({ children }: { children: ReactNode }) {
  const sectionCount = Children.count(children);
  const [activeIndex, setActiveIndex] = useState(0);
  const [settled, setSettled] = useState(true);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    document.documentElement.classList.add("snap-scroll");

    const getSections = () =>
      Array.from(document.querySelectorAll<HTMLElement>(".snap-section"));

    const syncActive = () => {
      setActiveIndex(findActiveSectionIndex(getSections()));
      setSettled(true);
    };

    const onSnapChange = (event: Event) => {
      const snapEvent = event as Event & { snapTargetBlock?: Element | null };
      const target = snapEvent.snapTargetBlock;

      if (target) {
        const section = getSectionForSnapTarget(target);
        const index = section ? getSections().indexOf(section as HTMLElement) : -1;
        if (index >= 0) {
          setActiveIndex(index);
          setSettled(true);
          return;
        }
      }

      syncActive();
    };

    const onScroll = () => {
      setSettled(false);
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(syncActive, 180);
    };

    document.documentElement.addEventListener("scrollsnapchange", onSnapChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    syncActive();

    return () => {
      document.documentElement.classList.remove("snap-scroll");
      document.documentElement.removeEventListener("scrollsnapchange", onSnapChange);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimeout.current);
    };
  }, []);

  const showHint = settled && activeIndex < sectionCount - 1;

  return (
    <>
      {children}
      <KeepScrollingHint visible={showHint} />
    </>
  );
}

export function SnapSection({
  children,
  isLast = false,
}: {
  children: ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className={cn("snap-section", isLast && "snap-section--last")}>
      {children}
    </div>
  );
}
