import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { SiteShell } from "@/components/SiteShell";
import { governmentHelpGuide } from "@/lib/campaignGuides";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  ...governmentHelpGuide,
  alternates: { canonical: absoluteUrl(governmentHelpGuide.path) },
});

export default function GovernmentHelpGuidePage() {
  const locale = getDefaultLocale();

  return (
    <SiteShell availableLocales={[locale]} currentPath={governmentHelpGuide.path} locale={locale} translations={getTranslations(locale)}>
      <CampaignGuideEntry guide={governmentHelpGuide} actionTone="red">
        <section>
          <h2>1. Start with an official benefits finder</h2>
          <p>Use the tool for your country before chasing a programme name from an advert. Check both national and local services: the agency that handles rent or energy costs may be different from the one that handles income support.</p>
          <ul>
            <li><a href="https://www.usa.gov/benefit-finder">United States: USAGov Benefit Finder</a></li>
            <li><a href="https://www.gov.uk/check-benefits-financial-support">United Kingdom: GOV.UK benefits and financial support checker</a></li>
            <li><a href="https://www.canada.ca/en/services/benefits.html">Canada: Government of Canada benefits</a></li>
            <li><a href="https://www.servicesaustralia.gov.au/payment-and-service-finder">Australia: Services Australia Payment and Service Finder</a></li>
            <li><a href="https://www.workandincome.govt.nz/online-services/eligibility/index.html">New Zealand: Work and Income eligibility guide</a></li>
          </ul>
          <p>Elsewhere, start with your government’s social services ministry or local authority. A screening result is a starting point, not an approval. This independent guide does not accept applications or determine eligibility.</p>
        </section>
        <section>
          <h2>2. Food and other essentials</h2>
          <p>Look for food assistance, school meal programmes and emergency help with essential costs. Ask the local agency whether it offers short-term help while a longer application is being processed. If food is needed urgently, contact local social services directly and ask what is available today.</p>
        </section>
        <section>
          <h2>3. Rent, housing and household bills</h2>
          <p>Check for rent assistance, emergency housing support, utility discounts and grants or rebates for home energy improvements. If you’re facing a disconnection or a housing deadline, contact your provider or local housing service now and ask about urgent help. Check whether any assistance goes to you or straight to the provider.</p>
        </section>
        <section>
          <h2>4. Healthcare, disability and carers</h2>
          <p>Look for reduced-cost prescriptions, public health coverage, dental support, mobility equipment and help for unpaid carers. Ask if you need a referral, assessment or written approval before paying for equipment or treatment. Our <a href="/dental">dental care guide</a> and <a href="/mobility">mobility scooter guide</a> explain what to ask about those costs.</p>
        </section>
        <section>
          <h2>5. Children, childcare and education</h2>
          <p>Check for family payments, childcare subsidies, parental leave benefits and help with school expenses. If you are taking a course or training for work, ask the official provider whether the help is a grant, a loan or a fee reduction. Confirm what’s covered and whether you would need to repay anything.</p>
        </section>
        <section>
          <h2>6. Work, unemployment and retirement</h2>
          <p>If your hours have been cut, you’ve lost a job or your household income has changed, look up the local rules for income support and job training. If you’re retired, check separately for public pensions and help with living costs. Don’t assume one application checks every programme, or that one refusal means none of the others apply.</p>
        </section>
        <section>
          <h2>7. What to check before applying</h2>
          <p>Read the official eligibility criteria and check which documents the agency wants. Depending on the programme, it may ask for proof of address, income, household circumstances or the cost you need help with. Use the agency’s verified site or office, save your application reference, and ask how to correct missing information or request a review if needed.</p>
        </section>
        <section>
          <h2>8. Be careful with “free government money” offers</h2>
          <p>Be wary of messages claiming you’ve already been approved or asking you to pay to release a grant. Don’t give banking details or identity documents to someone who contacts you unexpectedly. Find the agency independently and confirm the offer using its official contact number. See the <a href="https://consumer.ftc.gov/consumer-alerts/2026/03/how-avoid-government-grant-scams-offer-free-money-personal-expenses">FTC’s government grant scam warnings</a>.</p>
        </section>
      </CampaignGuideEntry>
    </SiteShell>
  );
}
