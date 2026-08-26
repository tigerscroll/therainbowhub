import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleExperience, type ArticleSection } from "@/components/article/ArticleExperience";
import { QuizThemeBoundary } from "@/components/quiz/QuizThemeBoundary";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { getQuizBySlug } from "@/lib/quizzes";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);
const path = "/mcdonalds";
const landingTitle = "Jobs Available At McDonald's";
const description = "Explore common McDonald’s job roles, how to find official openings, what an application may ask and how to prepare for an interview.";

const sections: ArticleSection[] = [
  {
    title: "10 McDonald’s Jobs You Can Search For",
    intro: "Job titles and responsibilities vary by country, restaurant and franchise. These are common paths worth looking for on the official careers site.",
    points: [
      {
        title: "Crew Member",
        paragraphs: ["Crew Members can work across food preparation, service, tills, order assembly and keeping work areas clean. It is a common entry point for applicants building their first customer-service experience."],
      },
      {
        title: "Customer Care Assistant",
        paragraphs: ["This customer-facing role is typically centred on the dining area: welcoming customers, maintaining cleanliness and helping create a comfortable restaurant experience."],
      },
      {
        title: "Customer Experience Leader",
        paragraphs: ["Customer Experience Leaders focus on hospitality and smooth customer journeys. The role can involve helping with kiosks, resolving straightforward concerns and supporting busy service periods."],
      },
      {
        title: "Overnight Crew",
        paragraphs: ["Some restaurants recruit specifically for late-night or overnight shifts. Duties can combine service, preparation, cleaning and getting the restaurant ready for the next trading period."],
      },
      {
        title: "Maintenance Person",
        paragraphs: ["Maintenance roles help keep the building, equipment areas and surroundings in good order. Listings may mention cleaning, stock rotation, basic upkeep or outside tasks depending on the restaurant."],
      },
      {
        title: "Shift Leader",
        paragraphs: ["Shift Leaders help organise people and priorities during a shift. Employers commonly look for calm communication, reliability and the ability to maintain service and quality standards under pressure."],
      },
      {
        title: "People Manager",
        paragraphs: ["People-focused management roles can support recruitment, training, development and employee experience. The exact title and seniority differ between markets and restaurant operators."],
      },
      {
        title: "Restaurant Management",
        paragraphs: ["Assistant and restaurant-management positions oversee larger parts of daily operations, including team performance, customer experience, standards and commercial results. Previous leadership experience may be expected."],
      },
      {
        title: "Apprenticeships and Early Careers",
        paragraphs: ["In some countries McDonald’s offers apprenticeships, internships or structured early-career programmes. Availability, age requirements and qualifications depend on the programme and location."],
      },
      {
        title: "Corporate Roles",
        paragraphs: ["McDonald’s also recruits beyond restaurants in areas such as technology, finance, marketing, operations, property, supply chain and people functions. These vacancies use a separate corporate job search in some markets."],
      },
    ],
    next: {
      eyebrow: "Next section",
      title: "Ready to apply?",
      copy: "See how to find a genuine opening and prepare a stronger application.",
      cta: "See How to Apply",
    },
  },
  {
    title: "How to Apply for a McDonald’s Job",
    intro: "The exact process varies, but a careful search and a complete, accurate application will give the restaurant the information it needs to assess you.",
    points: [
      {
        title: "Start with the official careers site",
        paragraphs: ["Use McDonald’s official careers website and select your country or region. This is the safest way to find current listings and avoid outdated third-party advertisements."],
      },
      {
        title: "Search by a realistic location",
        paragraphs: ["Enter a town, city or postcode and choose a distance you could reliably travel. A wider search can reveal nearby restaurants that use different shift patterns or role titles."],
      },
      {
        title: "Read the complete job listing",
        paragraphs: ["Check the duties, working pattern, location, contract type and any age, availability or experience requirements. Do not assume two similarly named roles have identical conditions."],
      },
      {
        title: "Check who is employing you",
        paragraphs: ["Many restaurants are operated by independent franchisees. The listing should identify the employer, and employment terms, benefits and hiring processes can differ between operators."],
      },
      {
        title: "Prepare your basic work history",
        paragraphs: ["Have the names and dates of previous jobs, education and relevant responsibilities ready. If this would be your first job, include school, volunteering, clubs or responsibilities that demonstrate reliability."],
      },
      {
        title: "Be clear about availability",
        paragraphs: ["Restaurants often need to understand when you can work. Give accurate availability and consider travel time, school, caring responsibilities and any other commitments before selecting shifts."],
      },
      {
        title: "Show useful transferable skills",
        paragraphs: ["Examples of teamwork, punctuality, customer service, learning quickly and staying organised can be relevant even if you have never worked in a restaurant."],
      },
      {
        title: "Answer application questions honestly",
        paragraphs: ["Keep answers direct and truthful. Avoid copying generic claims that you could not explain later; a simple real example is usually more convincing than exaggerated language."],
      },
      {
        title: "Check every contact detail",
        paragraphs: ["Review your phone number and email address before submitting. Monitor messages and voicemail afterwards, including filtered email folders, so an invitation is not missed."],
      },
      {
        title: "Never pay to submit an application",
        paragraphs: ["Be cautious of messages requesting application fees, gift cards, banking passwords or unusual personal information. Return to the official careers site if a message or link looks suspicious."],
      },
    ],
    next: {
      eyebrow: "Final section",
      title: "Got an interview?",
      copy: "See the questions and preparation that can help you walk in more confidently.",
      cta: "See Interview Tips",
    },
  },
  {
    title: "Before Your McDonald’s Interview",
    intro: "Interviews differ between restaurants, but good preparation makes it easier to give clear examples and show that you understand the role.",
    points: [
      {
        title: "Read the vacancy one more time",
        paragraphs: ["Review the responsibilities and working pattern before the interview. Be ready to explain why that particular role and location suit you."],
      },
      {
        title: "Prepare a simple reason for applying",
        paragraphs: ["A credible answer might connect the role with customer service, teamwork, flexible work, learning new skills or gaining responsibility. Keep it personal and specific."],
      },
      {
        title: "Think of a teamwork example",
        paragraphs: ["Choose a real situation from work, school, sport, volunteering or home life. Explain what the group needed, what you did and what happened as a result."],
      },
      {
        title: "Prepare for a customer scenario",
        paragraphs: ["You may be asked how you would respond to a frustrated customer. Focus on listening, staying polite, solving what you can and involving the appropriate manager when needed."],
      },
      {
        title: "Show that you can handle busy periods",
        paragraphs: ["Use an example of staying organised when several things needed attention. Prioritising, communicating and asking for help appropriately are stronger than claiming pressure never affects you."],
      },
      {
        title: "Confirm your real availability",
        paragraphs: ["Be ready to discuss days, evenings, weekends or overnight work where relevant. Do not promise availability that you will be unable to maintain after being hired."],
      },
      {
        title: "Plan the journey in advance",
        paragraphs: ["Check the interview location, route and travel time. Aim to arrive a little early, but follow any specific arrival or check-in instructions in the invitation."],
      },
      {
        title: "Choose clean, practical clothing",
        paragraphs: ["Unless the invitation says otherwise, neat and comfortable clothing is usually appropriate. The goal is to look prepared and professional rather than overly formal."],
      },
      {
        title: "Bring anything requested",
        paragraphs: ["Check whether the employer asked for identification, right-to-work evidence, availability details or another document. Requirements vary, so rely on the invitation rather than assumptions."],
      },
      {
        title: "Ask one useful question",
        paragraphs: ["Consider asking what training looks like, what a typical shift involves or when applicants should expect an update. It shows interest and gives you information needed to judge the opportunity."],
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
  title: `${landingTitle} — Application Guide`,
});

export default function McDonaldsJobsPage() {
  const referenceQuiz = getQuizBySlug("nursing", locale);
  if (!referenceQuiz) notFound();

  const articleTheme = {
    ...referenceQuiz.theme,
    id: "mcdonalds-jobs",
    colors: {
      ...referenceQuiz.theme.colors,
      page: "#2a1711",
      pageAlt: "#6d1b14",
      surface: "#fff9e9",
      surfaceRaised: "#fff0bd",
      text: "#241912",
      muted: "#67584c",
      primary: "#d52218",
      primaryText: "#ffffff",
      border: "#d8ad48",
      correct: "#1f7a4d",
      incorrect: "#b61e17",
    },
    header: {
      background: "linear-gradient(90deg, #9f1711, #da291c)",
      text: "#ffffff",
      border: "#ffc72c",
      shadow: "0 8px 26px rgba(78, 14, 10, 0.3)",
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "McDonald’s Jobs and Application Guide",
    description,
    inLanguage: "en",
    url: absoluteUrl(path),
    dateModified: "2026-08-26",
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
      <QuizThemeBoundary
        shellCssHref={referenceQuiz.shellCssHref}
        theme={articleTheme}
        themeCssHref={referenceQuiz.themeCssHref}
      >
        <ArticleExperience
          adElementPrefix="mcdonalds"
          adNote="One short ad, then see the jobs."
          articleTitle={sections[0].title}
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="See Jobs"
          disclaimer="Independent employment guide only. The Rainbow Hub is not affiliated with, endorsed by or recruiting for McDonald’s. Roles, availability, requirements, pay and benefits vary by country, restaurant and franchise. Confirm every vacancy and application detail on the official McDonald’s careers website. McDonald’s and its related marks belong to their respective owner."
          icon="M"
          iconVariant="golden-arches"
          intro="See the roles people overlook, what the application asks and how to find current openings near you."
          landingTitle={landingTitle}
          points={sections[0].points}
          sections={sections}
          socialProofCount="10 roles"
          socialProofLabel="and application tips inside"
          sources={[
            { label: "McDonald’s global careers", url: "https://careers.mcdonalds.com/" },
            { label: "Choose your location", url: "https://careers.mcdonalds.com/choose-location" },
            { label: "McDonald’s UK restaurant careers", url: "https://people.mcdonalds.co.uk/opportunities/restaurant" },
            { label: "McDonald’s UK job search", url: "https://people.mcdonalds.co.uk/job-search?country=uk" },
          ]}
        />
      </QuizThemeBoundary>
    </SiteShell>
  );
}
