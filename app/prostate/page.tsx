import type { Metadata } from "next";

import { ProstateCancerWarningSignsArticle } from "@/components/ProstateCancerWarningSignsArticle";
import articleData from "@/data/articles/prostate.json";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: "/prostate",
  },
  description: articleData.summary,
  locale,
  path: "/prostate",
  title: `${articleData.title} - The Rainbow Hub`,
});

export default function ProstateCancerWarningSignsPage() {
  return (
    <SiteShell currentPath="/prostate" locale={locale} translations={translations}>
      <ProstateCancerWarningSignsArticle rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
