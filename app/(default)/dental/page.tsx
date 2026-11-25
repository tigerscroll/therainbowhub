import { SiteShell } from "@/components/SiteShell";
import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { dentalGuide } from "@/lib/campaignGuides";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  ...dentalGuide,
  alternates: { canonical: absoluteUrl(dentalGuide.path) },
});

export default function DentalGuidePage() {
  const locale = getDefaultLocale();

  return (
    <SiteShell availableLocales={[locale]} currentPath={dentalGuide.path} locale={locale} translations={getTranslations(locale)}>
      <CampaignGuideEntry guide={dentalGuide} publicNotice={
        <aside><strong>Need urgent care?</strong> Contact a local dental service for severe tooth pain. If you have swelling and trouble breathing, call your local emergency number. <a href="https://www.nhs.uk/nhs-services/dentists/how-to-find-an-nhs-dentist-in-an-emergency/">NHS urgent dental advice</a>.</aside>
      }>
        <section>
          <h2>1. Check for help where you live</h2>
          <p>Start with your local health authority. Ask whether there are public dental clinics, reduced fees, or help for older adults or people on a low income. Retirement alone does not guarantee free care. If you have cover through a former employer, pension plan or insurer, ask what it actually pays for before booking.</p>
        </section>
        <section>
          <h2>2. Call a community clinic or dental school</h2>
          <p>Some community clinics offer reduced fees, and some university dental clinics provide lower-cost treatment supervised by qualified dentists. Ask if they accept new patients, what the first visit costs, and whether they can provide the specific treatment you need. <a href="https://www.nidcr.nih.gov/health-info/finding-dental-care">See the NIDCR guide to lower-cost dental care</a>.</p>
        </section>
        <section>
          <h2>3. Get the costs in writing</h2>
          <p>Ask for an itemised quote that includes any exams, X-rays and follow-up visits. Ask which treatment is urgent, whether there is a lower-cost alternative, and whether care can safely be done in stages. If you’re offered instalments, check the total amount you would repay, including interest and fees.</p>
        </section>
        <section>
          <h2>Official places to start</h2>
          <ul>
            <li><a href="https://www.hrsa.gov/oral-health/how-to-find-dental-care">United States: HRSA guide to finding dental care</a></li>
            <li><a href="https://www.gov.uk/help-nhs-costs">United Kingdom: GOV.UK help with NHS costs</a></li>
            <li><a href="https://www.canada.ca/en/services/benefits/dental/dental-care-plan.html">Canada: Canadian Dental Care Plan</a></li>
            <li><a href="https://www.healthdirect.gov.au/healthcare-and-services/costs-and-financial-support/cost-of-dental-care">Australia: Healthdirect guide to dental costs</a></li>
          </ul>
          <p>Elsewhere, start with your national health ministry or local public health office. This guide is information only, not an application or a decision about eligibility.</p>
        </section>
      </CampaignGuideEntry>
    </SiteShell>
  );
}
