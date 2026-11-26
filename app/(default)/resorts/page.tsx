import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { SiteShell } from "@/components/SiteShell";
import { resortsGuide } from "@/lib/campaignGuides";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  ...resortsGuide,
  alternates: { canonical: absoluteUrl(resortsGuide.path) },
});

export default function ResortsGuidePage() {
  const locale = getDefaultLocale();

  return (
    <SiteShell availableLocales={[locale]} currentPath={resortsGuide.path} locale={locale} translations={getTranslations(locale)}>
      <CampaignGuideEntry guide={resortsGuide} actionTone="red">
        <section>
          <h2>1. Find out what “adults only” covers</h2>
          <p>Ask the property for its minimum guest age and whether the policy applies to the whole resort or just certain areas. If a private stretch of beach or a quiet pool matters to you, ask whether either is shared with a neighbouring hotel or open to day visitors.</p>
        </section>
        <section>
          <h2>2. Look past the pool photos</h2>
          <p>Ask the resort for a sample activity schedule. Where does the evening entertainment take place, and when does it finish? If you’d rather have an early night, check where your room sits in relation to the bars and event spaces. For a more social trip, check which activities actually run on your dates.</p>
        </section>
        <section>
          <h2>3. Check what your rate includes</h2>
          <p>Compare the total for the same dates and room type. Ask whether restaurant bookings, drinks, transfers, beach loungers or spa access cost extra. If the rate is all-inclusive, ask which dining venues are covered and whether any need advance reservations.</p>
        </section>
        <section>
          <h2>4. Ask the last questions before paying</h2>
          <p>Confirm the cancellation deadline, any local charges and whether the facilities you care about will be open during your stay. If you need step-free access, ask about the route from your room to the restaurants and pool rather than just whether accessible rooms are available.</p>
        </section>
      </CampaignGuideEntry>
    </SiteShell>
  );
}
