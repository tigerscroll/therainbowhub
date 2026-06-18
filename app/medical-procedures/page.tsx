import type { Metadata } from "next";

import { SiteShell } from "@/components/SiteShell";
import { TimedPhotosDemo } from "@/components/TimedPhotosDemo";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: "/medical-procedures",
  },
  description: "Demo article flow for Procedures That Should Be Avoided After Age 70, with rewarded unlock gates between sections.",
  locale,
  path: "/medical-procedures",
  title: "Procedures That Should Be Avoided After Age 70 - The Rainbow Hub",
});

export default function MedicalProceduresPage() {
  return (
    <SiteShell currentPath="/medical-procedures" locale={locale} translations={translations}>
      <TimedPhotosDemo rewardedAdUnitPath={siteConfig.googleAdManagerRewardedAdUnitPath} />
    </SiteShell>
  );
}
