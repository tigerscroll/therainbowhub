import type { Metadata } from "next";

import { ScandalNovel } from "@/components/ScandalNovel";
import articleData from "@/data/articles/scandal";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: "/scandal",
  },
  description: articleData.summary,
  locale,
  path: "/scandal",
  title: `${articleData.title} - The Rainbow Hub`,
});

export default function ScandalPage() {
  return (
    <SiteShell currentPath="/scandal" locale={locale} translations={translations}>
      <ScandalNovel rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
