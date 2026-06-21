import type { Metadata } from "next";

import { BreastCancerSignsArticle } from "@/components/BreastCancerSignsArticle";
import articleData from "@/data/articles/breast-cancer-signs.json";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: "/breast-cancer-signs",
  },
  description: articleData.summary,
  locale,
  path: "/breast-cancer-signs",
  title: `${articleData.title} - The Rainbow Hub`,
});

export default function BreastCancerSignsPage() {
  return (
    <SiteShell currentPath="/breast-cancer-signs" locale={locale} translations={translations}>
      <BreastCancerSignsArticle rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
