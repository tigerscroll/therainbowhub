import type { Metadata } from "next";

import { GalleryRewardDemo } from "@/components/GalleryRewardDemo";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { siteConfig } from "@/lib/siteConfig";

const articleTitle = "Understanding Cat Affection: How Your Pet Shows Love";

export const metadata: Metadata = {
  title: {
    absolute: articleTitle,
  },
};

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export default function CatArticlePage() {
  return (
    <SiteShell currentPath="/cat" locale={locale} translations={translations}>
      <GalleryRewardDemo rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
