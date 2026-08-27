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
const path = "/mobilityscooter";
const landingTitle = "Claim Your Free Mobility Scooter";
const description = "See legitimate UK routes that may fund a mobility scooter, check eligibility, prepare an application and avoid misleading free-scooter offers.";

export const sections: ArticleSection[] = [
  {
    title: "10 Ways A Mobility Scooter May Be Funded",
    intro: "There is no universal free-scooter programme. Depending on your benefits, work needs, finances and location, one of these routes may fund all or part of suitable mobility equipment—or provide a different solution.",
    points: [
      {
        title: "Lease one through the Motability Scheme",
        paragraphs: ["People receiving a qualifying higher or enhanced mobility allowance with at least 12 months remaining may be able to lease a scooter. This is not a free gift: some or all of the mobility allowance pays for the lease, and the scooter is not normally yours to keep."],
      },
      {
        title: "Ask Access to Work about a work-related need",
        paragraphs: ["Access to Work may fund specialist equipment, and its staff guidance specifically allows electric scooters to be considered where there is a clear work-related need. It does not replace equipment needed mainly for social or general daily use."],
      },
      {
        title: "Search charitable grants through Turn2us",
        paragraphs: ["The Turn2us Grants Search matches people to charitable funds based on circumstances such as disability, health condition, previous occupation, location or financial need. A fund may contribute towards equipment, but an award is never guaranteed."],
      },
      {
        title: "Try a condition-specific charity",
        paragraphs: ["Some charities support people with a particular diagnosis or impairment and may consider essential mobility equipment. Check exactly what the fund covers and whether an occupational therapist or other professional must support the request."],
      },
      {
        title: "Check occupational and benevolent funds",
        paragraphs: ["Charities linked to a trade, profession, employer, union, armed service or religious community sometimes help current or former members and their families. Your work history can uncover funds that a general search misses."],
      },
      {
        title: "Request a local social-care assessment",
        paragraphs: ["A council assessment can identify equipment or support needed for safe daily living. Local criteria and available equipment vary, and the assessed solution may be a wheelchair, adaptation or support plan rather than a mobility scooter."],
      },
      {
        title: "Ask for an NHS wheelchair-service assessment",
        paragraphs: ["The NHS may provide a wheelchair or powered wheelchair after an assessment when local eligibility rules are met. Mobility scooters are not usually the standard NHS provision, but the assessment may identify a safer or more appropriate funded alternative."],
      },
      {
        title: "Explore Motability Foundation grants",
        paragraphs: ["The Motability Foundation offers means-tested help through Scheme-related and Access to Mobility grants. The support is targeted and does not mean every applicant receives a scooter or has every cost covered."],
      },
      {
        title: "Use disability VAT relief to reduce the price",
        paragraphs: ["Eligible disabled or chronically sick people may buy certain mobility scooters without VAT for personal or domestic use. This reduces the price rather than making the scooter free, and the supplier is responsible for applying the correct treatment."],
      },
      {
        title: "Look for a verified donation or reuse scheme",
        paragraphs: ["Some local charities, community equipment services and reuse organisations redistribute donated mobility equipment. Confirm the scooter has been safety checked, the battery is serviceable and ownership is properly transferred before relying on it."],
      },
    ],
    next: {
      eyebrow: "Check before applying",
      title: "Could you actually qualify?",
      copy: "These ten checks reveal which funding route is realistic—and which applications are likely to fail.",
      cta: "Check Your Eligibility",
    },
  },
  {
    title: "10 Eligibility Checks That Matter",
    intro: "Each programme uses different rules. Work through the checks that match your route before submitting forms or paying anyone to ‘help’ with an application.",
    points: [
      {
        title: "Identify the mobility problem the scooter must solve",
        paragraphs: ["Describe where walking becomes difficult, how far you can usually move, what happens afterwards and which essential journeys are affected. Focus on real functional needs rather than the brand or model you want."],
      },
      {
        title: "Check for a qualifying mobility allowance",
        paragraphs: ["Motability accepts specified higher or enhanced mobility components, including qualifying awards under PIP, DLA, Adult Disability Payment and certain armed-forces schemes. Lower mobility rates and Attendance Allowance do not qualify for the Scheme."],
      },
      {
        title: "Check how long remains on the award",
        paragraphs: ["The Motability Scheme requires at least 12 months left on a qualifying allowance when applying. Read the current award letter rather than assuming an indefinite or previously renewed benefit will be accepted."],
      },
      {
        title: "Separate work need from everyday need",
        paragraphs: ["Access to Work considers the extra support needed to get or stay in work. Explain the tasks, workplace distances or travel barriers involved; an item wanted mainly for general life may fall outside that programme."],
      },
      {
        title: "Match every charitable criterion",
        paragraphs: ["Grant funds may restrict awards by age, diagnosis, postcode, household income, occupation or membership. A strong need does not override a fund's written rules, so screen each match carefully."],
      },
      {
        title: "Expect a financial assessment",
        paragraphs: ["Some grants examine income, savings, benefits, essential spending and other available help. Prepare accurate figures and disclose other funding applications; incomplete or conflicting information can delay a decision."],
      },
      {
        title: "Gather supporting professional evidence",
        paragraphs: ["A GP, physiotherapist, occupational therapist, employer or support worker may need to explain the condition, functional impact and why the proposed equipment is appropriate. Ask the fund exactly whose evidence it accepts."],
      },
      {
        title: "Prove you can store and charge it safely",
        paragraphs: ["Assessors and dealers may ask about secure storage, a suitable charging point, access width, steps and fire safety. Tenants should check landlord or building rules before ordering a large powered device."],
      },
      {
        title: "Confirm you can operate the controls safely",
        paragraphs: ["Steering, vision, reaction time, posture, transfers and cognitive ability can affect which device is safe. A demonstration or clinical assessment may point towards a different scooter or a powered wheelchair."],
      },
      {
        title: "Choose the correct legal class",
        paragraphs: ["Class 2 scooters are generally limited to 4mph and used on pavements; Class 3 models can travel up to 8mph and may be used on roads, subject to additional rules and DVLA registration. The intended journeys should drive the choice."],
      },
    ],
    next: {
      eyebrow: "Build a stronger claim",
      title: "What should you put in the application?",
      copy: "Use this practical checklist to prepare the evidence, quote and explanation decision-makers expect.",
      cta: "See How To Apply",
    },
  },
  {
    title: "How To Apply For Mobility Scooter Funding",
    intro: "The precise form depends on the programme, but a complete and specific application is easier to assess than a vague request for a free scooter.",
    points: [
      {
        title: "Start with an independent needs assessment",
        paragraphs: ["Ask an occupational therapist, physiotherapist, wheelchair service or reputable mobility specialist to assess whether a scooter is suitable. This can prevent an application for equipment that is unsafe or unlikely to meet the need."],
      },
      {
        title: "Choose the correct funding route",
        paragraphs: ["Use Motability for a qualifying allowance lease, Access to Work for a genuine work need, local services for assessed care or wheelchair provision, and charitable funds for grants that match your circumstances."],
      },
      {
        title: "Write a short functional-impact statement",
        paragraphs: ["Explain the essential journeys you cannot complete, what currently happens without equipment and how the recommended scooter would change daily life, work or independence. Use concrete examples and realistic distances."],
      },
      {
        title: "Copy the current benefit evidence",
        paragraphs: ["Provide the requested pages of an award notice showing the benefit component, rate and end date. Do not send original documents unless the programme explicitly requires them."],
      },
      {
        title: "Request a supporting letter",
        paragraphs: ["Ask the relevant professional to describe functional limitations and the suitability of the recommended equipment, not merely repeat a diagnosis. Give them the fund's criteria and deadline."],
      },
      {
        title: "Get a written itemised quotation",
        paragraphs: ["The quote should name the model and include delivery, accessories, battery, warranty, servicing and VAT treatment. If the scooter must fit a vehicle, doorway or storage area, include the measurements."],
      },
      {
        title: "Explain why a cheaper option is unsuitable",
        paragraphs: ["If the selected scooter costs more than an obvious alternative, document the reason—such as posture, safe user weight, terrain, range, transportability or access—rather than relying on preference."],
      },
      {
        title: "List other contributions and applications",
        paragraphs: ["A charity may ask whether statutory services, benefits, savings or another fund can contribute. State what you have tried, what was declined and whether partial funding would make the purchase possible."],
      },
      {
        title: "Submit through the required channel",
        paragraphs: ["Some charities accept direct applications; others require a professional or advice organisation to apply for you. Follow the exact route, retain copies and save the submission reference."],
      },
      {
        title: "Wait for written approval before ordering",
        paragraphs: ["Do not assume a grant will reimburse something already bought. Many funds pay the supplier directly or require approval before purchase, and an early order can make the expense ineligible."],
      },
    ],
    next: {
      eyebrow: "Before accepting",
      title: "A ‘free scooter’ can still cost you",
      copy: "Check the ownership, battery, servicing and legal details before you sign or take delivery.",
      cta: "See The Final Checks",
    },
  },
  {
    title: "10 Final Checks Before Taking A Mobility Scooter",
    intro: "Funding approval is only useful if the scooter is safe, suitable and affordable to keep using. Confirm these details before signing a lease, accepting a grant or taking a donated model.",
    points: [
      {
        title: "Confirm whether you own or lease it",
        paragraphs: ["A charitable purchase may become yours, while a Motability scooter is leased in exchange for qualifying allowance. Ask what happens if the benefit ends, your needs change or you want to leave the arrangement early."],
      },
      {
        title: "Take a proper test drive",
        paragraphs: ["Try turns, slopes, kerbs, stopping and the controls in a realistic setting. Motability says its dealers can arrange home demonstrations, which helps confirm the scooter fits both the user and the environment."],
      },
      {
        title: "Check user weight and seating support",
        paragraphs: ["The stated maximum load includes the user and anything carried. Seat width, back support, suspension and transfer height matter as much as speed or appearance."],
      },
      {
        title: "Measure storage, doors and turning space",
        paragraphs: ["Measure the full scooter, not just the seat. Include ramps, gates, lifts, hallways, charging clearance and the space needed to manoeuvre without blocking an escape route."],
      },
      {
        title: "Test transportability before relying on it",
        paragraphs: ["A folding or dismantling scooter may still be too heavy for one person to lift. Check the heaviest component, boot dimensions and whether a hoist, ramp or different vehicle is needed."],
      },
      {
        title: "Understand real-world battery range",
        paragraphs: ["Published range can fall with hills, cold weather, user weight, tyre pressure and battery age. Plan journeys with a safety margin and ask how replacement batteries are funded."],
      },
      {
        title: "Know what servicing and breakdown cover include",
        paragraphs: ["Check call-out charges, routine service intervals, punctures, accidental damage and temporary replacement equipment. Motability leases include support, but donated or independently funded scooters may not."],
      },
      {
        title: "Complete registration where required",
        paragraphs: ["Class 3 scooters must be registered with DVLA for road use. New dealers often handle registration, but verify it rather than assuming the paperwork is complete."],
      },
      {
        title: "Consider insurance even when optional",
        paragraphs: ["GOV.UK states insurance is not required for Class 2 or Class 3 scooters, although it is recommended. Compare public-liability, theft, damage and breakdown cover for the way the scooter will be used."],
      },
      {
        title: "Reject pressure, fees and guaranteed claims",
        paragraphs: ["Be suspicious of adverts promising everyone a free scooter, demanding an application fee, asking for bank passwords or creating false urgency. Verify the organisation independently and never pay merely to access a government benefit form."],
      },
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

export default function MobilityScooterArticlePage() {
  const referenceQuiz = getQuizBySlug("nursing", locale);
  if (!referenceQuiz) notFound();

  const articleTheme = {
    ...referenceQuiz.theme,
    id: "mobility-scooter-funding",
    colors: {
      ...referenceQuiz.theme.colors,
      page: "#12334a",
      pageAlt: "#2d7180",
      surface: "#fffdf7",
      surfaceRaised: "#e3f2ee",
      text: "#15313d",
      muted: "#5c6f75",
      primary: "#087f67",
      primaryText: "#ffffff",
      border: "#73aab1",
      correct: "#087f67",
      incorrect: "#b43648",
    },
    header: {
      background: "linear-gradient(90deg, #12344b, #28717a)",
      text: "#ffffff",
      border: "#f0c34c",
      shadow: "0 8px 26px rgba(13, 47, 63, 0.3)",
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    name: landingTitle,
    description,
    inLanguage: "en-GB",
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
          articleSlug="mobilityscooter"
          adNote="One short ad, then check then see the options."
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="Apply Now →"
          disclaimer="UK general information only. No route guarantees a free mobility scooter. Motability is normally a lease paid from a qualifying mobility allowance; statutory services may provide different equipment; and charitable awards depend on individual criteria and available funds. Rules, benefits and programme terms can change. Verify current eligibility with the official provider before applying, ordering equipment or sharing personal or financial information."
          icon={<img alt="Realistic blue mobility scooter" className="article-engine__mobility-scooter-photo" src="/article-icons/mobility-scooter-realistic.png" />}
          intro="Learn how you can apply for a free mobility scooter in 2026."
          landingTitle={landingTitle}
          sectionCount={sections.length}
          showCtaIcon={false}
          socialProofCount="217,000+"
          socialProofLabel="applied today"
          sources={[
            { label: "Motability qualifying allowances", url: "https://www.motability.co.uk/how-it-works/allowances" },
            { label: "Motability scooters and powered wheelchairs", url: "https://www.motability.co.uk/whats-available/scooters-wheelchairs" },
            { label: "GOV.UK Access to Work", url: "https://www.gov.uk/access-to-work" },
            { label: "GOV.UK Access to Work staff guidance", url: "https://www.gov.uk/government/publications/access-to-work-staff-guide/access-to-work-staff-guide" },
            { label: "Turn2us charitable grants", url: "https://www.turn2us.org.uk/get-support/apply-for-grants" },
            { label: "NHS mobility equipment guidance", url: "https://www.nhs.uk/social-care-and-support/care-services-equipment-and-care-homes/walking-aids-wheelchairs-and-mobility-scooters/" },
            { label: "GOV.UK disability VAT relief", url: "https://www.gov.uk/guidance/vat-relief-on-certain-goods-if-you-have-a-disability" },
            { label: "GOV.UK mobility scooter rules", url: "https://www.gov.uk/mobility-scooters-and-powered-wheelchairs-rules" },
          ]}
        />
      </ExperienceThemeBoundary>
    </SiteShell>
  );
}
