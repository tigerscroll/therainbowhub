import type { Metadata } from "next";

import { HouseholdBrandsArticle } from "@/components/HouseholdBrandsArticle";
import { SiteShell } from "@/components/SiteShell";
import articleData from "@/data/articles/household-brands.json";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: "/household-brands",
  },
  description: articleData.summary,
  locale,
  path: "/household-brands",
  title: `${articleData.title} - The Rainbow Hub`,
});

export default function HouseholdBrandsPage() {
  return (
    <SiteShell currentPath="/household-brands" locale={locale} translations={translations}>
      <HouseholdBrandsArticle rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
