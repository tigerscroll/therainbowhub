import type { Metadata } from "next";

import { FacebookReelsArticle } from "@/components/FacebookReelsArticle";
import articleData from "@/data/articles/facebook-reels.json";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: "/facebook-reels",
  },
  description: articleData.summary,
  locale,
  path: "/facebook-reels",
  title: `${articleData.title} - The Rainbow Hub`,
});

export default function FacebookReelsPage() {
  return (
    <SiteShell currentPath="/facebook-reels" locale={locale} translations={translations}>
      <FacebookReelsArticle rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
