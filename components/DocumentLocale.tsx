"use client";

import { useEffect } from "react";
import type { SupportedLocale } from "@/lib/i18n";

type DocumentLocaleProps = {
  direction: "ltr" | "rtl";
  locale: SupportedLocale;
};

export function DocumentLocale({ direction, locale }: DocumentLocaleProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [direction, locale]);

  return null;
}
