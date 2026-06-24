import type { Metadata } from "next";

import { CatWarningSignsArticle } from "@/components/CatWarningSignsArticle";
import articleData from "@/data/articles/cat.json";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: "/cat",
  },
  description: articleData.summary,
  locale,
  path: "/cat",
  title: `${articleData.title} - The Rainbow Hub`,
});

export default function CatWarningSignsPage() {
  return (
    <SiteShell currentPath="/cat" locale={locale} translations={translations}>
      <CatWarningSignsArticle rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
