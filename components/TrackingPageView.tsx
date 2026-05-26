"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackPageView } from "@/lib/tracking";

export function TrackingPageView() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView({ page_path: pathname });
  }, [pathname]);

  return null;
}
