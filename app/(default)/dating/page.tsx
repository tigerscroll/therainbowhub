import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { SiteShell } from "@/components/SiteShell";
import { datingGuide } from "@/lib/campaignGuides";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  ...datingGuide,
  alternates: { canonical: absoluteUrl(datingGuide.path) },
});

export default function DatingGuidePage() {
  const locale = getDefaultLocale();

  return (
    <SiteShell availableLocales={[locale]} currentPath={datingGuide.path} locale={locale} translations={getTranslations(locale)}>
      <CampaignGuideEntry guide={datingGuide} actionTone="red">
        <section>
          <h2>1. Pick a way to meet that suits you</h2>
          <p>Dating apps give you time to chat before you meet. Speed dating lets you find out in a few minutes whether a conversation feels natural. And a friend’s introduction or a group activity can take some pressure off if you’d rather meet without making the whole evening about dating.</p>
        </section>
        <section>
          <h2>2. Ask one direct question early</h2>
          <p>Try “What are you hoping to find right now?” It’s a low-pressure way to find out whether you’re both looking for a relationship, something casual, or just seeing what happens. There’s no right answer, but an honest mismatch now is easier than a confusing first date later.</p>
        </section>
        <section>
          <h2>3. Share less until you’re comfortable</h2>
          <p>Keep early chats on the app if you prefer not to share your phone number. Leave your address, workplace and daily routine out of your profile. If someone keeps pushing to switch apps or asks for details you’d rather keep private, you don’t owe them an explanation.</p>
        </section>
        <section>
          <h2>4. Make the first date easy to leave</h2>
          <p>Choose a public spot you know, make your own travel plans and tell a friend where you’ll be. A coffee or a short lunch gives you enough time to talk without committing to an entire evening. If you feel uncomfortable, you can leave, even if you only just arrived.</p>
          <p>For more ways to protect your privacy and set boundaries, see the <a href="https://www.esafety.gov.au/key-topics/staying-safe/online-dating">eSafety Commissioner’s online dating guide</a>.</p>
        </section>
        <section>
          <h2>5. Watch for pressure, especially around money</h2>
          <p>An urgent request for travel money, a gift card or help with a crypto investment is a reason to pause, not proof that someone trusts you. Don’t send money or gifts to an online match you haven’t met. If you think it’s a scam, stop responding and report the profile. If you already paid, contact your bank or payment provider promptly.</p>
          <p>See the <a href="https://consumer.ftc.gov/articles/what-know-about-romance-scams">FTC guide to romance scams</a> for common stories scammers use and what to do if you’ve sent money.</p>
        </section>
        <section>
          <h2>6. Decide whether you want a second date</h2>
          <p>Instead of asking “Did they like me?”, ask “Did I enjoy myself, and did they respect my pace?” A little awkwardness is normal. Feeling pressured isn’t something you have to talk yourself out of. If there’s no spark, a simple “Thanks for meeting me, but I don’t think we’re a match” is enough.</p>
        </section>
      </CampaignGuideEntry>
    </SiteShell>
  );
}
