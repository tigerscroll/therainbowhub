import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { SiteShell } from "@/components/SiteShell";
import { escapesGuide } from "@/lib/campaignGuides";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  ...escapesGuide,
  alternates: { canonical: absoluteUrl(escapesGuide.path) },
});

export default function EscapesGuidePage() {
  const locale = getDefaultLocale();

  return (
    <SiteShell availableLocales={[locale]} currentPath={escapesGuide.path} locale={locale} translations={getTranslations(locale)}>
      <CampaignGuideEntry guide={escapesGuide} actionTone="red">
        <section>
          <h2>1. Ask for the room map</h2>
          <p>Start with the exact room category you’re about to book. Look for it on the property map, then find the nearest bar, main walkway and event space. A photo can show you the view from the terrace. The map tells you what’s behind it.</p>
          <p>If the room type is spread across several buildings, ask which locations are possible and whether your preferred one is guaranteed or simply a request.</p>
        </section>
        <section>
          <h2>2. Check who can see that “private” terrace</h2>
          <p>A private pool can be yours to use without being hidden from neighbouring balconies. A swim-up terrace can open straight onto a pool that several rooms share. If you want to read or have coffee outside without an audience, ask whether the space is overlooked or next to a public walkway.</p>
        </section>
        <section>
          <h2>3. Find the quiet pool before you pay for one</h2>
          <p>The pool in the first photo might be in a wing that costs extra. Ask which pools your room rate includes, whether any are reserved for certain guests, and where the daytime activities take place. If a shaded lounger matters more than a sea view, check whether one is included or needs a separate booking.</p>
        </section>
        <section>
          <h2>4. Check what changes after sunset</h2>
          <p>Look up the evening schedule for the actual nights you’ll be there. Search recent reviews for “bass,” “quiet room,” or the name of the bar. One complaint might be a fluke; several guests describing the same building and the same noise are more useful.</p>
          <p>If you’re going for the nightlife, check the reverse: a resort can advertise evening entertainment that only runs on nights you’ll miss.</p>
        </section>
        <section>
          <h2>5. Price the evening you actually want</h2>
          <p>If a dinner on the beach or a spa session sold you on the trip, ask what it costs and whether there’s space on your dates. Compare the room, transport and the extras you’d really buy. A cheaper room rate isn’t a better deal if it leaves out the one thing you came for.</p>
        </section>
        <section>
          <h2>6. Make sure “adults only” applies where you’ll spend time</h2>
          <p>Check the minimum guest age and whether it applies to the entire property or just one wing. The hotel’s pool can be reserved for adult guests while the beach or restaurants are shared. If that distinction matters to you, ask about each space instead of relying on the booking label.</p>
        </section>
        <section>
          <h2>7. Send this before you book</h2>
          <p>“I’m looking at this room category for these dates. Which buildings could it be in? Is the terrace overlooked? Which pools are included? Where does the evening entertainment take place, and when does it finish?” Add the one experience you don’t want to miss and ask for its price and availability.</p>
          <p>If the answer still leaves the important bits unclear, compare another property before paying a non-refundable rate.</p>
        </section>
      </CampaignGuideEntry>
    </SiteShell>
  );
}
