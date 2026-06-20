import type { Metadata } from "next";

import { HistoricalArticle } from "@/components/HistoricalArticle";
import articleData from "@/data/articles/historical.json";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: "/historical",
  },
  description: articleData.summary,
  locale,
  path: "/historical",
  title: `${articleData.title} - The Rainbow Hub`,
});

export default function HistoricalPage() {
  return (
    <SiteShell currentPath="/historical" locale={locale} translations={translations}>
      <HistoricalArticle rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
