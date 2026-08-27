import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleExperience, type ArticlePoint, type ArticleSection } from "@/components/article/ArticleExperience";
import { ExperienceThemeBoundary } from "@/components/experience/ExperienceThemeBoundary";
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

export const sections: ArticleSection[] = [
  {
    title: "Prostate Cancer Warning Signs",
    intro: "Early prostate cancer often causes no symptoms. When changes do appear, they can overlap with common non-cancerous conditions, so symptoms alone cannot tell you the cause.",
    points,
    next: {
      eyebrow: "Next section",
      title: "Could you be at higher risk?",
      copy: "See the established factors linked with a higher chance of prostate cancer.",
      cta: "See Risk Factors",
    },
  },
  {
    title: "Prostate Cancer Risk Factors",
    intro: "Some risk factors are well established, but none can predict an individual diagnosis. Here are the factors a healthcare professional may consider.",
    points: [
      { title: "Getting older", paragraphs: ["Age is the clearest established risk factor. Prostate cancer is uncommon in younger adults and becomes increasingly common with age, particularly after 50."] },
      { title: "A close relative with prostate cancer", paragraphs: ["Risk can be higher when a father, brother or son has been diagnosed. Most people who develop prostate cancer still have no known family history."] },
      { title: "Several affected relatives", paragraphs: ["A pattern involving several relatives can be more significant than one isolated diagnosis, especially when cases occur on the same side of a family."] },
      { title: "A relative diagnosed at a younger age", paragraphs: ["Family history can carry more weight when prostate cancer was found relatively early. A clinician may ask how old relatives were when they were diagnosed."] },
      { title: "Inherited BRCA gene changes", paragraphs: ["Harmful inherited changes in BRCA1 or BRCA2 can raise prostate cancer risk. BRCA2 changes have the stronger established association."] },
      { title: "Other inherited cancer syndromes", paragraphs: ["Lynch syndrome and changes in certain DNA-repair genes can also increase risk. These inherited causes account for only a minority of prostate cancers."] },
      { title: "A wider pattern of cancers in the family", paragraphs: ["A family history that includes prostate cancer alongside breast, ovarian, pancreatic or colorectal cancer may sometimes suggest an inherited cancer pattern worth discussing."] },
      { title: "Black or African ancestry", paragraphs: ["Prostate cancer occurs more often among Black men and may be diagnosed at a younger age. The reasons are complex and can involve genetic, environmental and healthcare factors."] },
      { title: "Benign prostate problems are different", paragraphs: ["Benign prostate enlargement and prostatitis can cause symptoms, but they are not themselves prostate cancer risk factors. Similar symptoms still need proper assessment."] },
      { title: "Risk is not a diagnosis", paragraphs: ["Having one or several risk factors does not mean cancer will develop, and prostate cancer can occur without obvious risk factors. Personal screening decisions should be discussed with a healthcare professional."] },
    ],
    next: {
      eyebrow: "Final section",
      title: "What happens next?",
      copy: "See how prostate symptoms and test results may be checked.",
      cta: "See How A Check Works",
    },
  },
  {
    title: "What Happens at a Prostate Check?",
    intro: "There is no single test that answers every question. A prostate assessment usually combines symptoms, history and test results before deciding what should happen next.",
    points: [
      { title: "Describe what has changed", paragraphs: ["A clinician will usually ask when symptoms began, how often they happen, whether they are worsening and how they affect sleep or daily life."] },
      { title: "Review medical and family history", paragraphs: ["Medicines, previous urinary problems, infections and relevant cancers in close relatives can all help place symptoms and risk in context."] },
      { title: "Check for other possible causes", paragraphs: ["Urinary symptoms are often caused by conditions other than cancer. A urine test may be used to look for infection, blood or other clues."] },
      { title: "Carry out a physical examination", paragraphs: ["Depending on the situation, a clinician may examine the abdomen and discuss or perform a rectal examination to assess the prostate."] },
      { title: "Discuss a PSA blood test", paragraphs: ["A prostate-specific antigen test measures PSA in the blood. It can support an assessment, but it is not a stand-alone cancer test."] },
      { title: "Interpret PSA carefully", paragraphs: ["PSA can rise because of benign enlargement, inflammation, infection and other factors. A lower result does not completely rule out cancer either."] },
      { title: "Repeat or review initial tests", paragraphs: ["A clinician may repeat a PSA test or review results over time before deciding whether specialist assessment is needed."] },
      { title: "Use MRI when appropriate", paragraphs: ["An MRI can provide detailed images of the prostate and help identify areas that may need closer investigation. Not everyone follows exactly the same testing pathway."] },
      { title: "Consider a biopsy if needed", paragraphs: ["A biopsy takes small tissue samples for examination under a microscope. It may be recommended when the overall assessment suggests that cancer needs to be confirmed or excluded."] },
      { title: "Discuss the result and next steps", paragraphs: ["Results are considered together rather than in isolation. The next step might be reassurance, monitoring, additional testing or a discussion of treatment options if cancer is found."] },
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
      <ExperienceThemeBoundary
        shellCssHref={referenceQuiz.shellCssHref}
        theme={articleTheme}
        themeCssHref={referenceQuiz.themeCssHref}
      >
        <ArticleExperience
          articleSlug="prostate"
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="See Warning Signs"
          icon="⚠️"
          intro="Some warning signs are surprisingly easy to miss. See which 10 changes deserve attention."
          landingTitle={landingTitle}
          sectionCount={sections.length}
          sources={[
            { label: "NHS symptoms", url: "https://www.nhs.uk/conditions/prostate-cancer/symptoms/" },
            { label: "NCI prostate changes", url: "https://www.cancer.gov/types/prostate/understanding-prostate-changes" },
            { label: "NCI PSA test", url: "https://www.cancer.gov/types/prostate/psa-fact-sheet" },
            { label: "ACS risk factors", url: "https://www.cancer.org/cancer/types/prostate-cancer/causes-risks-prevention/risk-factors.html" },
            { label: "ACS diagnosis and tests", url: "https://www.cancer.org/cancer/types/prostate-cancer/detection-diagnosis-staging/how-diagnosed.html" },
          ]}
        />
      </ExperienceThemeBoundary>
    </SiteShell>
  );
}
