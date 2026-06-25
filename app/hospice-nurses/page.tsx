import type { Metadata } from "next";

import { HospiceNursesArticle } from "@/components/HospiceNursesArticle";
import articleData from "@/data/articles/hospice-nurses.json";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: "/hospice-nurses",
  },
  description: articleData.summary,
  locale,
  path: "/hospice-nurses",
  title: `${articleData.title} - The Rainbow Hub`,
});

export default function HospiceNursesPage() {
  return (
    <SiteShell currentPath="/hospice-nurses" locale={locale} translations={translations}>
      <HospiceNursesArticle rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
