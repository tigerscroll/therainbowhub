import fs from "node:fs";
import path from "node:path";

import en from "@/data/i18n/en.json";
import {
  defaultLocale,
  isSupportedLocale,
} from "@/lib/localeConfig";

export {
  getDefaultLocale,
  getLocaleOptions,
  getLocalePath,
  getSupportedLocales,
  isSupportedLocale,
  type SupportedLocale,
} from "@/lib/localeConfig";

export type Translations = typeof en;
const i18nDirectory = path.join(process.cwd(), "data", "i18n");

export function getLocaleDirection(locale: string) {
  return getTranslations(locale).locale.direction;
}

export function getTranslations(locale: string): Translations {
  const safeLocale = isSupportedLocale(locale) ? locale : defaultLocale;
  const filePath = path.join(i18nDirectory, `${safeLocale}.json`);

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as Translations;
}
