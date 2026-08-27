import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleExperience, type ArticleSection } from "@/components/article/ArticleExperience";
import { ExperienceThemeBoundary } from "@/components/experience/ExperienceThemeBoundary";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { getQuizBySlug } from "@/lib/quizzes";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);
const path = "/beach";
const landingTitle = "Beaches For Adults";
const description = "Discover ten adults-only beachfront escapes, compare quiet, romantic, party and clothing-optional experiences, and check the rules before booking.";

export const sections: ArticleSection[] = [
  {
    title: "10 Adults-Only Beach Escapes",
    intro: "Most places on this list are adults-only resorts or controlled beach areas—not public shorelines where children are legally banned. Age limits, access and guest policies can change, so verify them directly before booking.",
    points: [
      {
        title: "Bucuti & Tara — Eagle Beach, Aruba",
        paragraphs: ["This intimate resort is reserved for guests aged 18 and over and is designed around quiet couples' stays. Its loungers, facilities and service areas are adults-only, although Eagle Beach itself remains public under Aruban law."],
      },
      {
        title: "Komandoo Island Resort — Maldives",
        paragraphs: ["Komandoo welcomes guests aged 18 and above. The small island combines long white-sand beaches, a lagoon, reef access and a calmer atmosphere than a family-focused Maldivian resort."],
      },
      {
        title: "Galley Bay Resort — Antigua",
        paragraphs: ["Galley Bay is an adults-only, all-inclusive resort set between a white-sand beach and tropical gardens. Beachfront rooms and direct access make the shore the centre of the stay."],
      },
      {
        title: "Excellence Playa Mujeres — Mexico",
        paragraphs: ["This adults-only all-inclusive sits north of Cancun in Playa Mujeres. It leans towards polished pools, large suites, ocean views and resort entertainment rather than a completely secluded beach experience."],
      },
      {
        title: "Secrets Cap Cana — Dominican Republic",
        paragraphs: ["Secrets Cap Cana is an adults-only resort facing Juanillo Beach. It combines a white-sand Caribbean setting with an all-inclusive format, restaurants, entertainment and a strong couples-focused atmosphere."],
      },
      {
        title: "Secrets Akumal — Riviera Maya, Mexico",
        paragraphs: ["This adults-only resort sits on Akumal Beach, an area known for calm Caribbean water and sea turtles. The appeal is a mix of romance, snorkelling and a full-service all-inclusive stay."],
      },
      {
        title: "Couples Tower Isle — Jamaica",
        paragraphs: ["The beachfront couples resort has a private offshore island reserved for au-naturel sunbathing. The island has its own pool and bar, while the main resort provides a more conventional beach experience."],
      },
      {
        title: "Hedonism II — Negril, Jamaica",
        paragraphs: ["Hedonism II is an adults-only, clothing-optional resort on Negril's coastline. It is built around social energy, nightlife and lifestyle-friendly spaces rather than quiet, understated romance."],
      },
      {
        title: "Sandals Negril — Jamaica",
        paragraphs: ["Sandals Negril is an adults-only all-inclusive set along Jamaica's Seven Mile Beach. It is aimed at couples and combines a long sandy shoreline with dining, drinks and water activities."],
      },
      {
        title: "Secrets Aura Cozumel — Mexico",
        paragraphs: ["This adults-only island resort combines white-sand beach areas with reefs, calm water and an on-site dive focus. It suits travellers who want an all-inclusive base with more time in the sea."],
      },
    ],
    next: {
      eyebrow: "Pick your atmosphere",
      title: "Quiet, wild or clothing optional?",
      copy: "Adults-only can mean completely different things. Find the beach style that actually matches the trip you want.",
      cta: "Find Your Beach Style",
    },
  },
  {
    title: "Which Adults-Only Beach Style Is Right For You?",
    intro: "The words “adults-only” describe an age policy, not the mood. Two resorts with the same label can feel completely different after sunset—or even on the sand.",
    points: [
      { title: "Silent and romantic", paragraphs: ["Choose a small couples-focused property with limited groups, restrained entertainment and rules designed around quiet. Bucuti & Tara is the clearest example on this list."] },
      { title: "Luxury all-inclusive", paragraphs: ["Excellence and Secrets properties bundle dining, drinks and organised activities into a polished resort setting. Compare what is truly included rather than relying on the phrase “all-inclusive.”"] },
      { title: "Social and high-energy", paragraphs: ["If meeting people, themed nights and late entertainment matter more than silence, a socially focused property such as Hedonism II may fit better than a romance retreat."] },
      { title: "Clothing optional", paragraphs: ["Clothing-optional and au-naturel areas have specific etiquette and access rules. Hedonism II and Couples Tower Isle offer different versions of the experience, so read each policy carefully."] },
      { title: "Private-island feeling", paragraphs: ["A one-resort island such as Komandoo creates a stronger sense of separation than a resort beside a public shoreline. Transfers are usually more involved and should be included in the budget."] },
      { title: "Snorkelling from the beach", paragraphs: ["Secrets Akumal and Secrets Aura Cozumel appeal to travellers who want reef or marine-life access near the property. Conditions and wildlife sightings are never guaranteed."] },
      { title: "Beachfront rooms", paragraphs: ["Galley Bay highlights rooms and suites with direct beach access. Check whether “ocean view,” “oceanfront” and “beachfront” describe genuinely different locations before paying more."] },
      { title: "Couples-only rather than simply adults-only", paragraphs: ["Some adult resorts market specifically to couples or restrict certain areas to couples. Solo travellers and groups should confirm eligibility instead of assuming every 18+ guest is accepted."] },
      { title: "Full resort or adult zone", paragraphs: ["A family resort may advertise an adults-only pool, wing or beach section. That does not create the same atmosphere as a property where every room and facility is adult-only."] },
      { title: "Beach first or resort first", paragraphs: ["Decide whether the shoreline itself is the priority. Large pools, restaurants and nightlife can make an excellent adult resort even when the beach is narrow, seasonal or publicly accessible."] },
    ],
    next: {
      eyebrow: "Before you pay",
      title: "The small print can change everything",
      copy: "Age limits, public access and dress rules are easy to miss. Check these ten details before booking an adults-only escape.",
      cta: "See What To Check",
    },
  },
  {
    title: "10 Checks Before Booking An Adults-Only Beach",
    intro: "Policies and conditions change. Confirm the details with the property and destination using your exact travel dates before making a non-refundable booking.",
    points: [
      { title: "Confirm the exact minimum age", paragraphs: ["“Adults-only” may mean 16+, 18+ or another threshold. Check the rule for every guest on the date of arrival, not only at the time of booking."] },
      { title: "Ask whether the shoreline is public", paragraphs: ["A resort can reserve its grounds and loungers for adults while the waterline remains open to families and local visitors. Aruba's Eagle Beach is a clear example."] },
      { title: "Separate adults-only from couples-only", paragraphs: ["Solo travellers, friends and groups may not fit a resort designed exclusively for couples. Check room occupancy, group limits and access rules before paying."] },
      { title: "Read clothing-optional rules in full", paragraphs: ["Find out where nudity is allowed or required, whether photography is prohibited, who may access the area and what etiquette the resort enforces."] },
      { title: "Check whether day guests are admitted", paragraphs: ["Day passes, cruise visitors or neighbouring-resort access can change how private a property feels. Ask specifically about the beach, pools and evening venues."] },
      { title: "Research the beach during your month", paragraphs: ["Wind, waves, rainfall, seaweed and beach width can vary seasonally. Recent reviews and official notices are more useful than a brochure photo taken in ideal conditions."] },
      { title: "Understand what all-inclusive excludes", paragraphs: ["Premium restaurants, spa treatments, motorised water sports, private dinners, transfers and excursions may cost extra even at an all-inclusive resort."] },
      { title: "Price the transfer before committing", paragraphs: ["Island resorts may require a seaplane, domestic flight or speedboat. Late international arrivals can affect whether the final transfer is possible that day."] },
      { title: "Check dress codes beyond the beach", paragraphs: ["A relaxed adult beach can still have evening restaurant rules covering footwear, cover-ups, collared shirts or long trousers. Pack for both parts of the property."] },
      { title: "Recheck policies just before travel", paragraphs: ["Age rules, renovation schedules, beach access and local requirements can change after booking. Confirm the latest details with the property and keep the written response."] },
    ],
  },
];

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: absoluteUrl(path),
    languages: { en: absoluteUrl(path), "x-default": absoluteUrl(path) },
  },
  description,
  locale,
  path,
  title: landingTitle,
});

export default function BeachArticlePage() {
  const referenceQuiz = getQuizBySlug("marry", locale);
  if (!referenceQuiz) notFound();

  const articleTheme = {
    ...referenceQuiz.theme,
    id: "adult-beaches",
    colors: {
      ...referenceQuiz.theme.colors,
      page: "#1c0c0f",
      pageAlt: "#68171f",
      surface: "#fff7f1",
      surfaceRaised: "#f6ddda",
      text: "#2b1518",
      muted: "#745d60",
      primary: "#c4162f",
      primaryText: "#ffffff",
      border: "#be6a72",
      correct: "#307359",
      incorrect: "#b4142c",
    },
    header: {
      background: "linear-gradient(90deg, #240c11, #74151f)",
      text: "#fff8f1",
      border: "#ef4a55",
      shadow: "0 8px 26px rgba(43, 10, 16, 0.35)",
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    name: landingTitle,
    description,
    inLanguage: "en",
    url: absoluteUrl(path),
    dateModified: "2026-08-27",
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
  };

  return (
    <SiteShell
      availableLocales={[locale]}
      currentPath={path}
      locale={locale}
      quizTheme={articleTheme}
      translations={translations}
    >
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        type="application/ld+json"
      />
      <style dangerouslySetInnerHTML={{ __html: `html,body{background:${articleTheme.colors.page}}` }} />
      <ExperienceThemeBoundary
        shellCssHref={referenceQuiz.shellCssHref}
        theme={articleTheme}
        themeCssHref={referenceQuiz.themeCssHref}
      >
        <ArticleExperience
          articleSlug="beach"
          adNote="One short ad, then see the beaches."
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="See Adult Beaches →"
          disclaimer="Travel information and age policies can change. “Adults-only” often applies to a resort, its facilities or a controlled beach area—not necessarily the public shoreline. Verify minimum ages, guest eligibility, clothing policies, beach access, seasonal conditions, inclusions and total costs directly with the property before booking."
          icon="🔞"
          intro="These strictly adult beach escapes range from private couples-only hideaways to clothing-optional shores—and some have rules you won't expect."
          landingTitle={landingTitle}
          sectionCount={sections.length}
          showCtaIcon={false}
          socialProofCount="264,000+"
          socialProofLabel="viewed this today"
          sources={[
            { label: "Bucuti & Tara adults-only policy", url: "https://www.bucuti.com/what-we-are-not" },
            { label: "Komandoo Maldives", url: "https://www.komandoo.com/" },
            { label: "Galley Bay Resort", url: "https://www.galleybayresort.com/" },
            { label: "Excellence Playa Mujeres", url: "https://www.excellenceresorts.com/cancun/excellence-playa-mujeres/" },
            { label: "Secrets Cap Cana", url: "https://www.hyattinclusivecollection.com/en/resorts-hotels/secrets/dominican-republic/cap-cana-resort-spa/about/" },
            { label: "Secrets Akumal", url: "https://www.hyattinclusivecollection.com/en/resorts-hotels/secrets/mexico/akumal-riviera-maya/" },
            { label: "Couples Tower Isle", url: "https://couples.com/resorts/tower-isle" },
            { label: "Hedonism II", url: "https://hedonism.com/" },
            { label: "Sandals Negril", url: "https://www.sandals.com/negril/" },
            { label: "Secrets Aura Cozumel", url: "https://www.hyattinclusivecollection.com/en/resorts-hotels/secrets/mexico/aura-cozumel/" },
          ]}
        />
      </ExperienceThemeBoundary>
    </SiteShell>
  );
}
