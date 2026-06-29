import type { Metadata } from "next";

import { BeachGalleryArticle } from "@/components/BeachGalleryArticle";
import articleData from "@/data/articles/beach.json";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: "/beach2",
  },
  description: articleData.summary,
  locale,
  path: "/beach2",
  title: `${articleData.title} - The Rainbow Hub`,
});

export default function Beach2Page() {
  return (
    <SiteShell currentPath="/beach2" locale={locale} translations={translations}>
      <BeachGalleryArticle rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
