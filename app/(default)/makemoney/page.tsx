import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { SiteShell } from "@/components/SiteShell";
import { makeMoneyGuide } from "@/lib/campaignGuides";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  ...makeMoneyGuide,
  alternates: { canonical: absoluteUrl(makeMoneyGuide.path) },
});

export default function MakeMoneyGuidePage() {
  const locale = getDefaultLocale();

  return (
    <SiteShell availableLocales={[locale]} currentPath={makeMoneyGuide.path} locale={locale} translations={getTranslations(locale)}>
      <CampaignGuideEntry guide={makeMoneyGuide} actionTone="red">
        <section>
          <h2>1. Compare take-home pay, not the headline number</h2>
          <p>Before picking a gig, subtract platform fees, supplies and delivery costs from what you’d be paid. Then divide what remains by all the time it takes, including finding clients, answering messages and making revisions. If a project pays 40, costs 10 and takes three hours, you keep 10 an hour before tax. Use that figure to compare it with your other options.</p>
        </section>
        <section>
          <h2>2. Sell one service you already know how to do</h2>
          <p>Start with a specific task: proofread a short document, format a spreadsheet, edit a video clip or tidy up product listings. Make one sample and explain exactly what the customer gets, when it’ll be ready and how many revisions are included. A small, clearly priced project is easier to quote than a promise to do anything a client needs.</p>
        </section>
        <section>
          <h2>3. Tutor or teach a practical skill online</h2>
          <p>Pick a topic you can explain well, such as conversational English, basic maths or spreadsheet skills. Outline one lesson that helps a learner achieve something concrete. Before signing up to a tutoring platform, check its requirements, commission and cancellation terms. Count preparation time as part of the job.</p>
        </section>
        <section>
          <h2>4. Resell things you already own</h2>
          <p>Start with an item you no longer use rather than buying stock. Compare completed sales where possible, photograph the condition honestly and estimate fees, packing and shipping before setting a price. Keep messages and payment on the platform if that’s how its seller protection works. Selling things you own can bring in extra cash, but it isn’t automatically a repeatable income stream.</p>
        </section>
        <section>
          <h2>5. Test a small digital product</h2>
          <p>A useful template, printable or worksheet can solve a specific problem. Try one that you can make with tools you already have, and show it to a few people who would actually use it. Check the marketplace’s fees, refund rules and licensing terms. Don’t spend on ads or a large catalogue before you’ve seen evidence of demand.</p>
        </section>
        <section>
          <h2>6. Look for verified remote jobs or research studies</h2>
          <p>If you want regular hours, look for part-time remote customer support, scheduling or administration through an employer or a public job board. Our <a href="/jobs">guide to finding current job openings</a> lists places to start. Paid research or usability studies are another option for occasional work, but invitations aren’t predictable. Check the organisation, the payment terms and how it handles your personal information.</p>
        </section>
        <section>
          <h2>7. Spot the deals that cost you money</h2>
          <p>Don’t pay to unlock wages, withdraw supposed earnings or secure a job. Walk away from offers that require a deposit to complete online tasks, ask you to move money for someone else, or promise large returns for simple clicks. Verify employers independently and read the <a href="https://consumer.ftc.gov/consumer-alerts/2025/08/how-spot-avoid-task-scams">FTC guide to spotting task scams</a>.</p>
        </section>
        <section>
          <h2>8. Start with a small test and track the result</h2>
          <p>Pick one option you can try without buying equipment, inventory or a course. Track time, payments, costs and what you actually keep. Then decide whether to repeat it, change the price or try something else. Check your local tax authority for reporting rules; the <a href="https://www.irs.gov/businesses/gig-economy-tax-center">IRS gig economy tax centre</a> and <a href="https://www.gov.uk/check-additional-income-tax">HMRC’s additional-income checker</a> are starting points for readers in the U.S. and UK.</p>
        </section>
      </CampaignGuideEntry>
    </SiteShell>
  );
}
