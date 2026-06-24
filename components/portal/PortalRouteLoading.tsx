"use client";

import { useLayoutEffect } from "react";
import { usePortalNavigation } from "@/components/portal/PortalNavigationProvider";

/** Signals route-level loading so the shell keeps one persistent loader visible. */
export function PortalRouteLoading() {
  const { beginRouteLoading, endRouteLoading } = usePortalNavigation();

  useLayoutEffect(() => {
    beginRouteLoading();
    return () => endRouteLoading();
  }, [beginRouteLoading, endRouteLoading]);

  return null;
}
