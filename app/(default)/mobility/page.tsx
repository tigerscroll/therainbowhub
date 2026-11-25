import { SiteShell } from "@/components/SiteShell";
import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { mobilityGuide } from "@/lib/campaignGuides";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  ...mobilityGuide,
  alternates: { canonical: absoluteUrl(mobilityGuide.path) },
});

export default function MobilityGuidePage() {
  const locale = getDefaultLocale();

  return (
    <SiteShell availableLocales={[locale]} currentPath={mobilityGuide.path} locale={locale} translations={getTranslations(locale)}>
      <CampaignGuideEntry guide={mobilityGuide}>
        <section>
          <h2>1. Find out what your local programme covers</h2>
          <p>Start with your health insurer, public health service or local disability equipment programme. Ask whether it covers mobility scooters, how much it pays, and whether it provides a purchase, a rental or a loan. If there’s a shortfall, ask about local charities or equipment loan schemes.</p>
        </section>
        <section>
          <h2>2. Ask about an assessment before buying</h2>
          <p>Some providers require an assessment, written recommendation or approval before you order. Ask which professionals can assess you and which suppliers are approved. If possible, try the scooter where you plan to use it or ask how to arrange a trial.</p>
        </section>
        <section>
          <h2>3. Get the full cost in writing</h2>
          <p>Ask what you would pay after funding, and whether the quote includes delivery, batteries and repairs. Check whether the scheme is a grant, a loan or a lease that uses part of a benefit. Don’t assume a scooter is free until the funding provider confirms the total in writing.</p>
        </section>
        <section>
          <h2>Official places to start</h2>
          <ul>
            <li><a href="https://www.medicare.gov/coverage/wheelchairs-scooters">United States: Medicare wheelchair and scooter coverage</a></li>
            <li><a href="https://www.nhs.uk/social-care-and-support/care-services-equipment-and-care-homes/walking-aids-wheelchairs-and-mobility-scooters/">United Kingdom: NHS mobility scooter and funding information</a></li>
            <li><a href="https://www.ontario.ca/page/mobility-aids">Canada (Ontario): Assistive Devices Program for mobility aids</a></li>
            <li><a href="https://ndis.gov.au/participants/assistive-technology/assistive-technology-and-advisors/guide-assistive-technology">Australia: NDIS guide to assistive technology</a></li>
          </ul>
          <p>Elsewhere, contact your national health or disability service. This guide is not an application and does not determine eligibility.</p>
        </section>
      </CampaignGuideEntry>
    </SiteShell>
  );
}
