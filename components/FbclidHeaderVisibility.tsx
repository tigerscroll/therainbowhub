"use client";

import { useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const TRAFFIC_CLASS = "fbclid-traffic";

export function FbclidHeaderVisibility() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasFbclid = searchParams.has("fbclid");

  useLayoutEffect(() => {
    document.documentElement.classList.toggle(TRAFFIC_CLASS, hasFbclid);
    return () => document.documentElement.classList.remove(TRAFFIC_CLASS);
  }, [hasFbclid, pathname]);

  return null;
}
