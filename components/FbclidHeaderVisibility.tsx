"use client";

import { useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { hasAdClickId, TRAFFIC_HEADER_CLASS, TRAFFIC_HEADER_STORAGE_KEY } from "@/lib/trafficHeader";

export function FbclidHeaderVisibility() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useLayoutEffect(() => {
    const hasClickId = hasAdClickId(searchParams);
    let isAdTraffic = hasClickId;
    try {
      if (hasClickId) sessionStorage.setItem(TRAFFIC_HEADER_STORAGE_KEY, "1");
      isAdTraffic ||= sessionStorage.getItem(TRAFFIC_HEADER_STORAGE_KEY) === "1";
    } catch {
      // The URL check still works when browser storage is unavailable.
    }
    document.documentElement.classList.toggle(TRAFFIC_HEADER_CLASS, isAdTraffic);
  }, [pathname, searchParams]);

  return null;
}
