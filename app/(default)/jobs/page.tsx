import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { SiteShell } from "@/components/SiteShell";
import { jobsGuide } from "@/lib/campaignGuides";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  ...jobsGuide,
  alternates: { canonical: absoluteUrl(jobsGuide.path) },
});

export default function JobsGuidePage() {
  const locale = getDefaultLocale();

  return (
    <SiteShell availableLocales={[locale]} currentPath={jobsGuide.path} locale={locale} translations={getTranslations(locale)}>
      <CampaignGuideEntry guide={jobsGuide} actionTone="red">
        <section>
          <h2>1. Start with live listings near you</h2>
          <p>Choose a job board for your location and filter by your town, city or commuting distance. These official starting points lead to current job searches. Check the closing date and the employer’s own application page before sending anything.</p>
          <ul>
            <li><a href="https://www.usa.gov/job-help">United States: USAGov job search resources</a></li>
            <li><a href="https://www.gov.uk/find-a-job">Great Britain: GOV.UK Find a job</a></li>
            <li><a href="https://www.jobapplyni.com/">Northern Ireland: JobApplyNI</a></li>
            <li><a href="https://www.canada.ca/en/services/jobs.html">Canada: Job Bank and government job searches</a></li>
            <li><a href="https://www.dewr.gov.au/workforce-australia">Australia: Workforce Australia</a></li>
            <li><a href="https://eures.europa.eu/index_en">Europe: EURES job search</a></li>
          </ul>
          <p>If your country isn’t listed, try your national or local public employment service. This is a job-search guide, not an application form or a guarantee of work. Individual listings can close at any time.</p>
        </section>
        <section>
          <h2>2. Search by role, not just “hiring now”</h2>
          <p>Start with one job title and one location. Use a title that matches what you can do and the hours you can work. These are examples to look for, not claims that they’re open everywhere:</p>
          <ul>
            <li><strong>Retail and hospitality:</strong> retail assistant, server, kitchen assistant or hotel housekeeping.</li>
            <li><strong>Warehouse and operations:</strong> warehouse assistant, order picker, stockroom assistant or dispatch assistant.</li>
            <li><strong>Office and support:</strong> receptionist, customer service adviser, data entry assistant or temporary administrator.</li>
            <li><strong>Local services:</strong> cleaner, facilities assistant or event crew. Check what training, licences or checks each role requires.</li>
          </ul>
          <p>Save two searches: one for a role you’ve done before, and one for a related role that uses the same skills. That’s more useful than sending the same application to every result for “urgent jobs”.</p>
        </section>
        <section>
          <h2>3. Find employers that can start you sooner</h2>
          <p>Sort by newest first. Where the board allows it, filter to recent posts, then try terms such as “immediate start”, “temporary cover”, “seasonal” or “start this week”. Search for the job title without the urgency term as well: some employers put the start date in the description instead of the headline.</p>
          <p>Look for a clear opening, a realistic start date and a named employer or staffing agency. An advert that says “immediate start” can still involve an interview, a right-to-work check, references or onboarding. Ask the recruiter what the earliest realistic first shift is.</p>
        </section>
        <section>
          <h2>4. Check whether it’s worth applying</h2>
          <p>Read for four details before opening the application form: where the work is, which hours are required, how pay is described and what experience or qualifications are essential. If the listing is vague, check the employer’s own careers page or ask one specific question rather than assuming.</p>
          <p>For remote work, check whether the employer only hires in certain locations, whether training is in person, and what hours they expect you to be online. For an on-site role, work out how you’d get there for the earliest or latest shift before you apply.</p>
        </section>
        <section>
          <h2>5. Make it easy for the recruiter to call you</h2>
          <p>Keep a current résumé or CV ready and tailor the first few lines to the role. Instead of saying you’re flexible, state the shifts you can reliably work, the area you can travel to and the earliest date you can start. Mention one relevant example from a past job, volunteering or training.</p>
          <p>A short application note might read: “I’m applying for the customer service role. I’ve handled phone and in-person enquiries, I can work weekday mornings, and I’m available from Monday. I’ve attached my CV and can speak this afternoon.” Replace the example details with your own.</p>
        </section>
        <section>
          <h2>6. Keep track and follow up once</h2>
          <p>Save the job title, employer, posting link, date you applied and closing date. If the advert lists a contact and invites questions, a short follow-up can confirm whether the position is still open. Keep applying elsewhere while you wait rather than counting on one response.</p>
        </section>
        <section>
          <h2>7. Confirm the terms before accepting</h2>
          <p>Get the employer name, pay rate, expected hours, location and proposed start date in writing. Ask whether it’s a permanent position, a temporary assignment or work booked shift by shift. If an agency is involved, check who employs you, who pays you and who to contact if shifts change.</p>
        </section>
        <section>
          <h2>8. Walk away from job scams</h2>
          <p>Find the organisation’s contact details independently and check the vacancy through its official site or main number. Don’t pay someone to secure a job, deposit a cheque and send part back, or share bank details with an unverified recruiter. See the <a href="https://consumer.ftc.gov/articles/job-scams">FTC’s job scam checklist</a> for more warning signs.</p>
        </section>
      </CampaignGuideEntry>
    </SiteShell>
  );
}
