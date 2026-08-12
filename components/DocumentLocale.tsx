"use client";

import { useLayoutEffect } from "react";

import type { SupportedLocale } from "@/lib/i18n";

export function DocumentLocale({ direction, locale }: { direction: string; locale: SupportedLocale }) {
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [direction, locale]);

  return null;
}
