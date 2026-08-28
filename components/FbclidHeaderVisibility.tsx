"use client";

import { useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const TRAFFIC_CLASS = "fbclid-traffic";
const TRAFFIC_STORAGE_KEY = "rainbowhub:fbclid-traffic";

export function FbclidHeaderVisibility() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useLayoutEffect(() => {
    const hasFbclid = searchParams.has("fbclid");
    let isFacebookTraffic = hasFbclid;
    try {
      if (hasFbclid) sessionStorage.setItem(TRAFFIC_STORAGE_KEY, "1");
      isFacebookTraffic ||= sessionStorage.getItem(TRAFFIC_STORAGE_KEY) === "1";
    } catch {
      // The URL check still works when browser storage is unavailable.
    }
    document.documentElement.classList.toggle(TRAFFIC_CLASS, isFacebookTraffic);
  }, [pathname, searchParams]);

  return null;
}
