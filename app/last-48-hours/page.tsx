import type { Metadata } from "next";

import articleData from "@/data/articles/last-48-hours.json";
import { Last48HoursArticle } from "@/components/Last48HoursArticle";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: "/last-48-hours",
  },
  description: articleData.summary,
  locale,
  path: "/last-48-hours",
  title: `${articleData.title} - The Rainbow Hub`,
});

export default function Last48HoursPage() {
  return (
    <SiteShell currentPath="/last-48-hours" locale={locale} translations={translations}>
      <Last48HoursArticle rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
