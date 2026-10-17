"use client";

import { useLayoutEffect } from "react";

import type { SupportedLocale } from "@/lib/i18n";
import { localeLanguageTag } from "@/lib/localeConfig";

export function DocumentLocale({ direction, locale }: { direction: string; locale: SupportedLocale }) {
  useLayoutEffect(() => {
    document.documentElement.lang = localeLanguageTag(locale);
    document.documentElement.dir = direction;
  }, [direction, locale]);

  return null;
}
