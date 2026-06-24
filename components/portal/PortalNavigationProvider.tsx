"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter } from "next/navigation";

interface PortalNavigationContextValue {
  isNavigating: boolean;
  startNavigation: () => void;
  push: (href: string) => void;
  refresh: () => void;
  beginRouteLoading: () => void;
  endRouteLoading: () => void;
}

const PortalNavigationContext = createContext<PortalNavigationContextValue | null>(
  null
);

function isPortalNavigation(href: string, pathname: string) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(href, window.location.origin);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin || !url.pathname.startsWith("/portal")) {
    return false;
  }

  return url.pathname !== pathname || url.search !== window.location.search;
}

export function PortalNavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [clicked, setClicked] = useState(false);
  const [routeLoadingCount, setRouteLoadingCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const routeLoadingCountRef = useRef(0);

  const startNavigation = useCallback(() => {
    setClicked(true);
  }, []);

  const beginRouteLoading = useCallback(() => {
    setRouteLoadingCount((count) => {
      const next = count + 1;
      routeLoadingCountRef.current = next;
      return next;
    });
  }, []);

  const endRouteLoading = useCallback(() => {
    setRouteLoadingCount((count) => {
      const next = Math.max(0, count - 1);
      routeLoadingCountRef.current = next;
      return next;
    });
  }, []);

  const push = useCallback(
    (href: string) => {
      startNavigation();
      router.push(href);
    },
    [router, startNavigation]
  );

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  useEffect(() => {
    if (routeLoadingCount === 0) {
      setClicked(false);
    }
  }, [routeLoadingCount]);

  useLayoutEffect(() => {
    if (!clicked) return;
    if (routeLoadingCountRef.current === 0) {
      setClicked(false);
    }
  }, [pathname, clicked]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element).closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || !isPortalNavigation(href, pathname)) {
        return;
      }

      startNavigation();
    }

    function handlePopState() {
      startNavigation();
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname, startNavigation]);

  const isNavigating = clicked || routeLoadingCount > 0 || isPending;

  const value = useMemo(
    () => ({
      isNavigating,
      startNavigation,
      push,
      refresh,
      beginRouteLoading,
      endRouteLoading,
    }),
    [isNavigating, push, refresh, startNavigation, beginRouteLoading, endRouteLoading]
  );

  return (
    <PortalNavigationContext.Provider value={value}>
      {children}
    </PortalNavigationContext.Provider>
  );
}

export function usePortalNavigation() {
  const context = useContext(PortalNavigationContext);
  if (!context) {
    throw new Error("usePortalNavigation must be used within PortalNavigationProvider");
  }
  return context;
}
