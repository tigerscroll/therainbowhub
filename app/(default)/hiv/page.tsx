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
const path = "/hiv";
const landingTitle = "10 Early HIV Symptoms In Women";
const description = "Learn ten possible symptoms of early HIV infection, when different HIV tests can detect infection and what women should know about testing, treatment and pregnancy.";

export const sections: ArticleSection[] = [
  {
    title: "10 Early HIV Symptoms In Women",
    intro: "Early HIV symptoms are generally the same in women and men. They often resemble flu or another viral illness, and some people have no symptoms at all. Only an HIV test can show whether someone has HIV.",
    points: [
      {
        title: "A fever that appears after a possible exposure",
        paragraphs: ["A raised temperature can occur during acute HIV infection, often within roughly two to four weeks of infection. Fever is extremely common in many other illnesses, so timing and testing matter more than the symptom alone."],
      },
      {
        title: "Chills or drenching night sweats",
        paragraphs: ["Feeling unusually cold, shivery or waking with soaked clothing or bedding can occur with an acute viral illness. Night sweats also have many unrelated causes, including other infections, medicines and hormonal changes."],
      },
      {
        title: "A new unexplained rash",
        paragraphs: ["Acute HIV can cause a widespread rash, sometimes on the trunk. A rash cannot identify HIV and may instead come from an allergy, medicine, skin condition or another infection."],
      },
      {
        title: "A persistent sore throat",
        paragraphs: ["Inflammation or pain in the throat may appear as part of the early flu-like illness. COVID-19, influenza, glandular fever and many routine infections can look similar."],
      },
      {
        title: "Swollen lymph nodes",
        paragraphs: ["Tender or enlarged glands may be noticed in the neck, armpits or groin as the immune system responds to infection. Swollen nodes are common and do not point to HIV by themselves."],
      },
      {
        title: "Extreme or unusual tiredness",
        paragraphs: ["Fatigue can feel more intense than ordinary tiredness and may arrive alongside fever or aches. Stress, anaemia, pregnancy, sleep problems and many other conditions can cause the same change."],
      },
      {
        title: "Muscle or joint aches",
        paragraphs: ["Generalised aching can accompany the body's early immune response. The symptom is nonspecific and is also common with flu, COVID-19 and other viral illnesses."],
      },
      {
        title: "Headaches",
        paragraphs: ["A persistent or unusual headache can occur during acute HIV infection, usually as one part of a wider flu-like pattern. A severe sudden headache or one with neurological symptoms needs urgent medical assessment."],
      },
      {
        title: "Mouth ulcers",
        paragraphs: ["Painful sores inside the mouth may occur in acute infection. They are also common after minor injury, stress, nutritional deficiencies and many infections, so they cannot diagnose HIV."],
      },
      {
        title: "Diarrhoea, nausea or digestive upset",
        paragraphs: ["Some people experience diarrhoea, nausea or reduced appetite during early infection. These symptoms are common in stomach bugs and many other conditions; a correctly timed test is the deciding step."],
      },
    ],
    next: {
      eyebrow: "Timing matters",
      title: "Could a test be too early?",
      copy: "Different tests detect HIV at different times. See the window periods and what to do after a recent exposure.",
      cta: "See When To Test",
    },
  },
  {
    title: "10 Things To Know Before Taking An HIV Test",
    intro: "Testing is the only way to know your HIV status. The right test depends partly on how recently a possible exposure occurred and whether preventive medicine was used.",
    points: [
      {
        title: "Symptoms cannot confirm or rule out HIV",
        paragraphs: ["Many people with acute HIV have a flu-like illness, while others feel completely well. The presence or absence of symptoms should never replace testing."],
      },
      {
        title: "PEP is time-critical after a recent exposure",
        paragraphs: ["Post-exposure prophylaxis, or PEP, may prevent HIV after a possible exposure, but it must be started as soon as possible and no later than 72 hours. Seek urgent medical advice rather than waiting for symptoms."],
      },
      {
        title: "NAT can detect infection earliest",
        paragraphs: ["A nucleic acid test looks for HIV in the blood and can usually detect infection about 10 to 33 days after exposure. It is not the routine first test for everyone, but a clinician may use it when very early infection is suspected."],
      },
      {
        title: "Laboratory antigen/antibody tests detect earlier than many rapid tests",
        paragraphs: ["A laboratory test using blood from a vein can usually detect HIV about 18 to 45 days after exposure. It looks for both p24 antigen and antibodies."],
      },
      {
        title: "Finger-prick and antibody tests can have longer windows",
        paragraphs: ["Finger-prick antigen/antibody tests can take about 18 to 90 days, while antibody-only tests usually detect HIV about 23 to 90 days after exposure. Follow the instructions for the exact test used."],
      },
      {
        title: "A negative early test may need repeating",
        paragraphs: ["A negative result during a test's window period may not be conclusive. A healthcare professional or testing service can tell you when to repeat it based on the exposure and test type."],
      },
      {
        title: "A reactive screening result needs confirmation",
        paragraphs: ["A first reactive result is normally followed by supplemental laboratory testing. Do not assume a preliminary or self-test result is a final diagnosis before the recommended confirmation process."],
      },
      {
        title: "Pregnancy is a reason to test—not a barrier",
        paragraphs: ["HIV testing is offered during pregnancy because treatment protects the woman's health and greatly reduces the chance of transmission to the baby. Recent exposure during pregnancy may require additional testing."],
      },
      {
        title: "PrEP or PEP can affect the testing plan",
        paragraphs: ["Tell the testing clinician if you use pre-exposure prophylaxis or recently took PEP. Antiretroviral medicines can change which tests and follow-up schedule are appropriate."],
      },
      {
        title: "Ask for a full sexual-health check when appropriate",
        paragraphs: ["Other sexually transmitted infections can occur without obvious symptoms and may overlap with parts of the same history. A clinic can recommend HIV testing alongside tests suited to your circumstances."],
      },
    ],
    next: {
      eyebrow: "What happens next?",
      title: "What if the result is positive?",
      copy: "Modern treatment has transformed HIV. See what confirmation, care, pregnancy planning and undetectable viral load mean.",
      cta: "See The Next Steps",
    },
  },
  {
    title: "10 Things Women Should Know After An HIV Result",
    intro: "A positive result is not an AIDS diagnosis. Confirmatory testing and prompt specialist care allow treatment to begin, protect the immune system and support a long, healthy life.",
    points: [
      {
        title: "A screening result is confirmed first",
        paragraphs: ["The clinic follows a testing algorithm to confirm HIV and identify the type. If results suggest very early infection, an HIV RNA test may be part of the assessment."],
      },
      {
        title: "Treatment should begin as soon as possible",
        paragraphs: ["Antiretroviral therapy is recommended for everyone with HIV, including during early infection. Treatment lowers the amount of virus, protects immune function and prevents illness."],
      },
      {
        title: "Undetectable means sexually untransmittable",
        paragraphs: ["A person who takes treatment and maintains an undetectable viral load has no risk of transmitting HIV to sexual partners. This is known as U=U—undetectable equals untransmittable."],
      },
      {
        title: "Pregnancy can be planned safely",
        paragraphs: ["With specialist care and effective treatment, the chance of passing HIV to a baby can be reduced dramatically. Discuss conception, pregnancy, birth and infant feeding with the HIV and maternity teams."],
      },
      {
        title: "Routine blood tests guide treatment",
        paragraphs: ["Viral load shows how much HIV is in the blood, while a CD4 count helps describe immune health. Other tests check general health and help the team choose suitable medicines."],
      },
      {
        title: "Other medicines and contraception should be reviewed",
        paragraphs: ["Tell the HIV team about prescriptions, supplements, contraception and pregnancy plans. Some medicines interact, but the team can usually select an effective combination."],
      },
      {
        title: "Cervical screening remains important",
        paragraphs: ["Women with HIV may receive screening advice tailored to their age, health and local guidance because HIV can affect the body's response to human papillomavirus, or HPV."],
      },
      {
        title: "Partners can be offered testing and prevention",
        paragraphs: ["A clinic can explain confidential partner notification, testing and PrEP for HIV-negative partners. You do not have to manage those conversations without support."],
      },
      {
        title: "Mental-health and peer support are part of care",
        paragraphs: ["Shock, fear and stigma can feel overwhelming after a diagnosis. Specialist teams, counsellors and peer organisations can provide accurate information and support without judgement."],
      },
      {
        title: "HIV is treatable long-term",
        paragraphs: ["Modern treatment can reduce HIV to undetectable levels and allow people to live long, healthy lives. Staying connected with care and taking treatment consistently are the key steps."],
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

export default function HivArticlePage() {
  const referenceQuiz = getQuizBySlug("nursing", locale);
  if (!referenceQuiz) notFound();

  const articleTheme = {
    ...referenceQuiz.theme,
    id: "hiv-women",
    colors: {
      ...referenceQuiz.theme.colors,
      page: "#351625",
      pageAlt: "#7e284b",
      surface: "#fff8f4",
      surfaceRaised: "#fbe4ea",
      text: "#301a25",
      muted: "#735d67",
      primary: "#bc2147",
      primaryText: "#ffffff",
      border: "#d99aab",
      correct: "#30765f",
      incorrect: "#a61d40",
    },
    header: {
      background: "linear-gradient(90deg, #461729, #8a2449)",
      text: "#fff9f5",
      border: "#ef9fae",
      shadow: "0 8px 26px rgba(57, 18, 34, 0.3)",
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: landingTitle,
    description,
    inLanguage: "en",
    url: absoluteUrl(path),
    lastReviewed: "2026-08-27",
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
          articleSlug="hiv"
          adNote="One short ad, then see the symptoms."
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="See The Symptoms →"
          disclaimer="General educational information only. Early HIV symptoms are nonspecific, can occur in people of any sex and cannot diagnose HIV. Some people have no early symptoms. Only an appropriately timed HIV test can show whether someone has HIV. Seek urgent medical advice immediately after a possible exposure because PEP must be started as soon as possible and no later than 72 hours."
          icon={(
            <svg className="article-engine__hiv-icon" focusable="false" viewBox="0 0 72 72">
              <path className="article-engine__hiv-vulva" d="M36 7C24 13 17 25 17 39c0 13 8 24 19 28 11-4 19-15 19-28 0-14-7-26-19-32Z" />
              <path className="article-engine__hiv-inner" d="M36 18c-7 7-10 14-9 23 1 8 5 14 9 18 4-4 8-10 9-18 1-9-2-16-9-23Z" />
              <path className="article-engine__hiv-centre" d="M36 25c-3 5-4 10-3 16 0 5 2 9 3 12 1-3 3-7 3-12 1-6 0-11-3-16Z" />
              <circle className="article-engine__hiv-detail" cx="36" cy="20" r="2.5" />
            </svg>
          )}
          intro="Early HIV can look like flu—or cause no symptoms at all. See the 10 changes and the testing window many people miss."
          landingTitle={landingTitle}
          sectionCount={sections.length}
          showCtaIcon={false}
          socialProofCount="193,000+"
          socialProofLabel="read this today"
          sources={[
            { label: "NIH: early HIV infection", url: "https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-arv/special-populations-early-acute-recent-hiv-infection" },
            { label: "CDC: HIV testing and window periods", url: "https://www.cdc.gov/hivnexus/hcp/diagnosis-testing/index.html" },
            { label: "CDC: how to know whether you have HIV", url: "https://hivrisk.cdc.gov/how-do-i-know-if-i-have-hiv/" },
            { label: "NHS: HIV and AIDS", url: "https://www.nhs.uk/conditions/hiv-and-aids/" },
            { label: "HIV.gov: flu and early HIV", url: "https://www.hiv.gov/hiv-basics/staying-in-hiv-care/other-related-health-issues/flu-and-people-with-hiv" },
          ]}
        />
      </ExperienceThemeBoundary>
    </SiteShell>
  );
}
