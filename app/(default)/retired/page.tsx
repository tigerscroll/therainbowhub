import { SiteShell } from "@/components/SiteShell";
import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { retiredGuide } from "@/lib/campaignGuides";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  ...retiredGuide,
  alternates: { canonical: absoluteUrl(retiredGuide.path) },
});

export default function RetiredGuidePage() {
  const locale = getDefaultLocale();

  return (
    <SiteShell availableLocales={[locale]} currentPath={retiredGuide.path} locale={locale} translations={getTranslations(locale)}>
      <CampaignGuideEntry guide={retiredGuide}>
        <section>
          <h2>1. Choose work that fits your week</h2>
          <p>Want regular hours? Look for part-time reception, customer service or school support roles. Prefer occasional projects? Try tutoring, bookkeeping or consulting in a field you know. If you want to avoid a commute, search for remote roles and confirm whether training has to be done in person.</p>
        </section>
        <section>
          <h2>2. Look for real openings</h2>
          <p>Start with your public employment service, employers’ own careers pages and former colleagues. Search using a job title plus terms such as “part-time”, “flexible hours” or “seasonal”. Update your résumé or CV with the skills that match the role and a clear note on when you’re available.</p>
          <ul>
            <li><a href="https://www.usa.gov/job-help">United States: USAGov job search resources</a></li>
            <li><a href="https://www.gov.uk/find-a-job">Great Britain: GOV.UK Find a job</a></li>
            <li><a href="https://www.canada.ca/en/services/jobs.html">Canada: official job search resources</a></li>
            <li><a href="https://www.dewr.gov.au/workforce-australia">Australia: Workforce Australia</a></li>
          </ul>
        </section>
        <section>
          <h2>3. Check what you’ll earn and keep</h2>
          <p>Ask for the pay, expected hours and employment terms in writing. Allow for travel or equipment costs. Before accepting, check with your pension or benefits provider and local tax authority about how extra earnings could affect you. Rules vary by country and by programme. See the <a href="https://www.ssa.gov/benefits/retirement/planner/whileworking.html">U.S. Social Security guidance</a> or <a href="https://www.gov.uk/working-retirement-pension-age">UK guidance on working after State Pension age</a> for local examples.</p>
        </section>
        <section>
          <h2>4. Watch for job scams</h2>
          <p>Check that the company and the vacancy are real using contact details you find independently. Don’t send money to secure a job, and don’t share bank details with an unverified recruiter. If you’re asked to deposit a payment and send part of it back, stop. See the <a href="https://consumer.ftc.gov/articles/job-scams">FTC’s job scam checklist</a>.</p>
        </section>
      </CampaignGuideEntry>
    </SiteShell>
  );
}
