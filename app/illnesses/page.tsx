import type { Metadata } from "next";

import articleData from "@/data/articles/illnesses.json";
import { IllnessesArticle } from "@/components/IllnessesArticle";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: "/illnesses",
  },
  description: articleData.summary,
  locale,
  path: "/illnesses",
  title: `${articleData.title} - The Rainbow Hub`,
});

export default function IllnessesPage() {
  return (
    <SiteShell currentPath="/illnesses" locale={locale} translations={translations}>
      <IllnessesArticle rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
