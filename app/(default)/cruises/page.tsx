import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { SiteShell } from "@/components/SiteShell";
import { cruisesGuide } from "@/lib/campaignGuides";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  ...cruisesGuide,
  alternates: { canonical: absoluteUrl(cruisesGuide.path) },
});

export default function CruisesGuidePage() {
  const locale = getDefaultLocale();

  return (
    <SiteShell availableLocales={[locale]} currentPath={cruisesGuide.path} locale={locale} translations={getTranslations(locale)}>
      <CampaignGuideEntry guide={cruisesGuide} actionTone="red">
        <section>
          <h2>1. Is it the whole ship or just one deck?</h2>
          <p>Start by checking where the age restriction applies. <a href="https://www.virginvoyages.com/faq/before-you-sail/pre-voyage-policies">Virgin Voyages’ minimum-age policy</a> covers the entire sailing. By contrast, <a href="https://www.royalcaribbean.com/experience/adults-only">Royal Caribbean describes designated adults-only spaces</a> on its ships. An adults-only pool doesn’t mean the restaurants, corridors or rest of the ship will be adults-only.</p>
          <p>Look up the policy for the exact ship and sailing, and check whether the space you care about is included or requires a separate booking.</p>
        </section>
        <section>
          <h2>2. Read the decks above and below your cabin</h2>
          <p>Find your cabin on the deck plan, then check the same spot one deck up and one deck down. A nightclub, theatre or busy pool deck can matter more than another few square metres of cabin space if you want to sleep early. Also look for lifts, late-night food and through-corridors near the door.</p>
          <p>If the fare lets the cruise line assign your cabin, ask what it actually guarantees. A balcony category doesn’t necessarily guarantee a particular deck or an unobstructed view.</p>
        </section>
        <section>
          <h2>3. Find out what really happens after dark</h2>
          <p>Look for a sample evening schedule for that ship rather than a highlight reel for the whole fleet. Does the night end with a cocktail and live music, or does the dance floor fill up when the show ends? Check whether a show or restaurant needs a reservation, and when booking opens.</p>
          <p>If you want both a late night and a quiet place to retreat, look for a cabin a deck or two away from the main entertainment venues.</p>
        </section>
        <section>
          <h2>4. Work out what you’d actually pay on board</h2>
          <p>Take the fare for the exact dates and cabin, then add what you’d use: drinks, specialty dining, Wi-Fi, service charges and excursions. For example, <a href="https://www.virginvoyages.com/ticket-contract">Virgin Voyages’ ticket contract</a> lists items that may be charged separately, such as alcoholic drinks and shore excursions. Use the terms for your own fare and market.</p>
          <p>If you’re travelling alone, compare the total for one person in the cabin, not the advertised price per person based on two sharing.</p>
        </section>
        <section>
          <h2>5. Read the hours in port, not just the port names</h2>
          <p>The same destination can mean a morning ashore, a full afternoon, or a late departure that leaves time for dinner. Look at the planned arrival and departure, the location of the terminal, and whether you’ll need a small boat to reach shore. Allow time for the transfer and check the ship’s all-aboard time before making independent plans.</p>
        </section>
        <section>
          <h2>6. Ask four questions before you book</h2>
          <p>“Is the entire sailing adults-only? What’s above and below this cabin? Is access to the quiet deck included? What would I pay separately for the things I plan to use?” Add one question about the experience you’d hate to miss, whether it’s a late-night show, a dinner reservation or more time ashore.</p>
        </section>
      </CampaignGuideEntry>
    </SiteShell>
  );
}
