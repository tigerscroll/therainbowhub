import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleExperience, type ArticlePoint } from "@/components/article/ArticleExperience";
import { QuizThemeBoundary } from "@/components/quiz/QuizThemeBoundary";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { getQuizBySlug } from "@/lib/quizzes";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);
const path = "/prostate";
const landingTitle = "10 Prostate Cancer Warning Signs You Shouldn't Ignore";
const description = "Learn ten prostate changes worth discussing with a healthcare professional, why symptoms do not confirm cancer and when to seek medical advice.";

const points: ArticlePoint[] = [
  {
    title: "Difficulty starting urination",
    paragraphs: [
      "Taking longer than usual to begin urinating, needing to strain or finding that the flow is slow to start can happen when the prostate affects the tube carrying urine out of the bladder.",
      "This is common with benign prostate enlargement too, but a new or persistent change deserves assessment.",
    ],
  },
  {
    title: "A weak or interrupted urine stream",
    paragraphs: [
      "A stream that is weaker than usual, stops and starts, or takes longer to finish is another urinary change worth noticing. The pattern matters more than a single isolated episode.",
    ],
  },
  {
    title: "Urinating more often, especially at night",
    paragraphs: [
      "Needing to urinate more frequently or repeatedly waking during the night can be linked to several prostate and bladder conditions. Keep track of whether the change is persistent and whether it is disrupting sleep or daily life.",
    ],
  },
  {
    title: "A sudden or difficult-to-control urge",
    paragraphs: [
      "Feeling an urgent need to urinate, particularly when this is new, can signal a urinary or prostate problem. Infection, medicines and bladder conditions can also cause urgency, so the symptom needs context rather than self-diagnosis.",
    ],
  },
  {
    title: "Feeling that the bladder has not emptied",
    paragraphs: [
      "You may finish urinating but still feel that you need to go, or need to return soon afterwards. This incomplete-emptying sensation should be checked if it keeps happening.",
    ],
  },
  {
    title: "Pain or burning when urinating",
    paragraphs: [
      "Pain or a burning sensation is more often associated with infection or inflammation than prostate cancer, but it is still a reason to seek medical advice rather than ignore the change.",
    ],
  },
  {
    title: "Blood in the urine",
    paragraphs: [
      "Urine that looks pink, red or brown, or blood found on a urine test, has many possible causes. Visible blood should be assessed even if it happens once or is not painful.",
    ],
  },
  {
    title: "Blood in semen or pain with ejaculation",
    paragraphs: [
      "Blood in semen and painful ejaculation can occur with infection, inflammation and other prostate conditions. They are not proof of cancer, but new or repeated episodes should be discussed with a clinician.",
    ],
  },
  {
    title: "New erectile difficulties",
    paragraphs: [
      "Difficulty getting or maintaining an erection has many common physical and psychological causes. In some people it can occur alongside prostate disease, so a new persistent change is worth mentioning during a medical assessment.",
    ],
  },
  {
    title: "Persistent pain or wider body changes",
    paragraphs: [
      "Prostate cancer that has spread may cause persistent pain in the lower back, hips or pelvis. Unexplained weight loss, marked tiredness, leg weakness or numbness, and changes in bladder or bowel control can also occur with advanced disease.",
      "These symptoms can have other explanations, but they should not be dismissed. New neurological symptoms or loss of bladder or bowel control need urgent medical advice.",
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

export default function ProstateArticlePage() {
  const referenceQuiz = getQuizBySlug("nursing", locale);
  if (!referenceQuiz) notFound();

  const articleTheme = {
    ...referenceQuiz.theme,
    id: "prostate-warning",
    colors: {
      ...referenceQuiz.theme.colors,
      page: "#2a1719",
      pageAlt: "#563036",
      surface: "#fff8f2",
      surfaceRaised: "#fbe9e4",
      text: "#2b1718",
      muted: "#705b5b",
      primary: "#aa2531",
      primaryText: "#ffffff",
      border: "#d6a39f",
      incorrect: "#aa2531",
    },
    header: {
      background: "linear-gradient(90deg, #381418, #861f29)",
      text: "#ffffff",
      border: "#dca84a",
      shadow: "0 8px 26px rgba(50, 12, 18, 0.28)",
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Prostate Cancer Warning Signs",
    description,
    inLanguage: "en",
    url: absoluteUrl(path),
    lastReviewed: "2026-08-25",
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
      <style
        dangerouslySetInnerHTML={{ __html: `html,body{background:${articleTheme.colors.page}}` }}
      />
      <QuizThemeBoundary
        shellCssHref={referenceQuiz.shellCssHref}
        theme={articleTheme}
        themeCssHref={referenceQuiz.themeCssHref}
      >
        <ArticleExperience
          articleTitle="Prostate Cancer Warning Signs"
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="See Warning Signs"
          icon="⚠️"
          intro="Some warning signs are surprisingly easy to miss. See which 10 changes deserve attention."
          landingTitle={landingTitle}
          points={points}
          sources={[
            { label: "NHS symptoms", url: "https://www.nhs.uk/conditions/prostate-cancer/symptoms/" },
            { label: "NCI prostate changes", url: "https://www.cancer.gov/types/prostate/understanding-prostate-changes" },
            { label: "NCI PSA test", url: "https://www.cancer.gov/types/prostate/psa-fact-sheet" },
            { label: "ACS risk factors", url: "https://www.cancer.org/cancer/types/prostate-cancer/causes-risks-prevention/risk-factors.html" },
            { label: "ACS diagnosis and tests", url: "https://www.cancer.org/cancer/types/prostate-cancer/detection-diagnosis-staging/how-diagnosed.html" },
          ]}
        />
      </QuizThemeBoundary>
    </SiteShell>
  );
}
