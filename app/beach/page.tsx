import type { Metadata } from "next";

import { BeachArticle } from "@/components/BeachArticle";
import articleData from "@/data/articles/beach.json";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: "/beach",
  },
  description: articleData.summary,
  locale,
  path: "/beach",
  title: `${articleData.title} - The Rainbow Hub`,
});

export default function BeachPage() {
  return (
    <SiteShell currentPath="/beach" locale={locale} translations={translations}>
      <BeachArticle rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
