import { SiteShell } from "@/components/SiteShell";
import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { retreatsGuide } from "@/lib/campaignGuides";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  ...retreatsGuide,
  alternates: { canonical: absoluteUrl(retreatsGuide.path) },
});

export default function RetreatsGuidePage() {
  const locale = getDefaultLocale();

  return (
    <SiteShell availableLocales={[locale]} currentPath={retreatsGuide.path} locale={locale} translations={getTranslations(locale)}>
      <CampaignGuideEntry guide={retreatsGuide} actionTone="red">
        <section>
          <h2>1. Decide what the team needs to get done</h2>
          <p>Pick one main goal, such as agreeing next quarter’s priorities or getting a new team working well together. Plan the work sessions around that goal. For example, finish a planning session with three decisions, who owns each one and when they’ll check back in.</p>
        </section>
        <section>
          <h2>2. Make sure the venue fits the group</h2>
          <p>Ask what “adults only” means at that property, including the minimum guest age and whether it applies to the whole venue or just certain areas. Check that everyone can attend. Confirm accessible rooms and routes, a private meeting space, reliable Wi‑Fi and what’s needed to run presentations or video calls.</p>
        </section>
        <section>
          <h2>3. Leave room in the schedule</h2>
          <p>Try one focused work block in the morning and a shorter session after lunch. Leave time to rest and make social activities optional. A walk, a cooking class or a shared meal can work just as well as a late night out. Check dietary needs and offer an alcohol-free option.</p>
        </section>
        <section>
          <h2>4. Compare the full quote before booking</h2>
          <p>Ask for the total cost in writing, including rooms, meeting space, equipment, meals, transfers, taxes and service charges. Check the deposit, the deadline to change your headcount and the cancellation terms. Compare the cost per person using the same inclusions for each venue.</p>
        </section>
      </CampaignGuideEntry>
    </SiteShell>
  );
}
