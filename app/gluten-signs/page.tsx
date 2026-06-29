import type { Metadata } from "next";

import { GlutenSignsArticle } from "@/components/GlutenSignsArticle";
import articleData from "@/data/articles/gluten-signs.json";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: "/gluten-signs",
  },
  description: articleData.summary,
  locale,
  path: "/gluten-signs",
  title: `${articleData.title} - The Rainbow Hub`,
});

export default function GlutenSignsPage() {
  return (
    <SiteShell currentPath="/gluten-signs" locale={locale} translations={translations}>
      <GlutenSignsArticle rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
