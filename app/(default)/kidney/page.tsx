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
const path = "/kidney";
const landingTitle = "10 Warning Signs Your Kidneys Aren't Working Properly";
const description = "Learn ten possible kidney disease warning signs, who may be at higher risk and what blood, urine and imaging checks may involve.";

export const sections: ArticleSection[] = [
  {
    title: "Kidney Disease Warning Signs",
    intro: "Early kidney disease often causes no symptoms, and these changes can have many other explanations. Blood and urine tests are the only way to assess how well the kidneys are working.",
    points: [
      {
        title: "Urine that stays unusually foamy",
        paragraphs: [
          "Persistent foam or clusters of bubbles can sometimes occur when protein leaks into urine. Occasional bubbles may be harmless, but a repeated change can be checked with a simple urine albumin test.",
        ],
      },
      {
        title: "Blood in your urine",
        paragraphs: [
          "Urine may look pink, red or brown, although blood can also be present without being visible. Infection, stones and other urinary conditions can cause bleeding too, so the cause needs proper assessment.",
        ],
      },
      {
        title: "A lasting change in how often you urinate",
        paragraphs: [
          "Going more or less often than usual, waking repeatedly at night, or producing noticeably more or less urine can be worth discussing when the pattern is new or persistent.",
        ],
      },
      {
        title: "Swelling around the ankles, feet, hands or eyes",
        paragraphs: [
          "Kidneys that cannot remove enough salt and fluid may contribute to swelling, called oedema. Puffiness around the eyes can also occur when substantial protein is being lost in urine.",
        ],
      },
      {
        title: "Persistent tiredness or weakness",
        paragraphs: [
          "Reduced kidney function can allow waste products to build up and can contribute to anaemia. Both may cause unusual fatigue, weakness or reduced energy, but these symptoms have many possible causes.",
        ],
      },
      {
        title: "Trouble concentrating or sleeping",
        paragraphs: [
          "Some people with advanced kidney disease report difficulty concentrating or disrupted sleep. Neither symptom is specific to the kidneys, so the wider pattern and test results matter.",
        ],
      },
      {
        title: "Poor appetite, nausea or unexplained weight loss",
        paragraphs: [
          "A buildup of waste products in advanced kidney disease may affect appetite or cause nausea, vomiting and weight loss. New or persistent digestive symptoms should not be attributed to one condition without assessment.",
        ],
      },
      {
        title: "Dry or persistently itchy skin",
        paragraphs: [
          "Kidney disease can disturb the balance of minerals and nutrients in the blood, which may contribute to dry or itchy skin. Skin conditions, allergies and medicines are among many other possible explanations.",
        ],
      },
      {
        title: "Frequent muscle cramps",
        paragraphs: [
          "Changes in fluid, minerals or electrolytes can contribute to muscle cramps when kidney disease is advanced. Recurrent cramps still need context because activity, circulation and medicines can also play a part.",
        ],
      },
      {
        title: "Shortness of breath or chest discomfort",
        paragraphs: [
          "Advanced kidney problems can contribute to fluid buildup, anaemia and heart complications, which may cause breathlessness or chest discomfort. New chest pain or severe breathing difficulty requires urgent medical care.",
        ],
      },
    ],
    next: {
      eyebrow: "Next section",
      title: "Could you be at higher risk?",
      copy: "See the health conditions and history that can affect kidney disease risk.",
      cta: "See Risk Factors",
    },
  },
  {
    title: "Kidney Disease Risk Factors",
    intro: "Risk factors cannot diagnose kidney disease, but they can help determine who may benefit from regular blood and urine testing.",
    points: [
      { title: "Diabetes", paragraphs: ["Diabetes is a leading cause of chronic kidney disease. High blood glucose over time can damage the kidneys' filtering units, which is why regular kidney checks are commonly recommended for people with diabetes."] },
      { title: "High blood pressure", paragraphs: ["High blood pressure can damage blood vessels in the kidneys, and kidney disease can also make blood pressure harder to control. The relationship can work in both directions."] },
      { title: "Heart and blood vessel disease", paragraphs: ["Heart disease, heart failure and other cardiovascular conditions are linked closely with kidney health. A clinician may consider both systems when deciding how often testing is needed."] },
      { title: "A family history of kidney failure", paragraphs: ["Risk can be higher when a close relative has kidney failure or an inherited kidney condition. Tell a healthcare professional what condition affected the family and, if known, when it was diagnosed."] },
      { title: "Getting older", paragraphs: ["Kidney function can decline with age, and chronic kidney disease becomes more common in older adults. Age alone does not establish a diagnosis, but it may influence testing decisions alongside other factors."] },
      { title: "A previous acute kidney injury", paragraphs: ["Acute kidney injury is a sudden reduction in kidney function caused by illness, injury, dehydration or some medicines. Recovery is possible, but a previous episode can increase the risk of later chronic kidney problems."] },
      { title: "Kidney stones, infections or urinary blockage", paragraphs: ["Repeated kidney stones, urinary infections or conditions that obstruct urine flow can sometimes affect the kidneys. An enlarged prostate is one possible cause of blockage in some people."] },
      { title: "Autoimmune and inflammatory conditions", paragraphs: ["Conditions such as lupus and some forms of blood-vessel inflammation can affect kidney tissue. Monitoring depends on the specific disease, medicines and previous test results."] },
      { title: "Medicines that may affect kidney function", paragraphs: ["Some medicines can affect the kidneys, particularly in certain doses, combinations or medical situations. Do not stop prescribed treatment on your own; ask a clinician or pharmacist whether monitoring is appropriate."] },
      { title: "Risk is not a diagnosis", paragraphs: ["Someone can have several risk factors and normal kidney tests, while kidney disease can occur without an obvious risk factor. Testing—not a checklist—shows whether there is evidence of reduced function or kidney damage."] },
    ],
    next: {
      eyebrow: "Final section",
      title: "What happens next?",
      copy: "See how kidney symptoms and abnormal results may be checked.",
      cta: "See How A Check Works",
    },
  },
  {
    title: "What Happens at a Kidney Check?",
    intro: "A kidney assessment usually combines medical history, blood pressure, blood tests and urine tests. No single symptom can replace these checks.",
    points: [
      { title: "Describe what has changed", paragraphs: ["A clinician may ask when symptoms began, whether they are worsening and whether you have noticed swelling, urinary changes, breathlessness, appetite changes or recent illness."] },
      { title: "Review health history and medicines", paragraphs: ["Diabetes, blood pressure, heart disease, previous kidney injury, urinary problems and relevant family history can shape the assessment. Bring an accurate list of prescribed and non-prescribed medicines."] },
      { title: "Check blood pressure and examine for swelling", paragraphs: ["Blood pressure is closely linked with kidney health. A clinician may also look for fluid retention, listen to the heart and lungs, and assess other findings suggested by the symptoms."] },
      { title: "Measure creatinine and estimate eGFR", paragraphs: ["A blood creatinine result is used to estimate glomerular filtration rate, or eGFR. This provides an estimate of how effectively the kidneys are filtering blood and must be interpreted for the individual."] },
      { title: "Test urine for albumin", paragraphs: ["A urine albumin-to-creatinine ratio, often called UACR or ACR, checks whether albumin is leaking into urine. Persistent albumin can be a marker of kidney damage even when eGFR is relatively preserved."] },
      { title: "Check urine for blood or infection", paragraphs: ["A dipstick or laboratory urinalysis can look for blood, protein, white blood cells and other clues. Further urine testing may be arranged depending on what is found."] },
      { title: "Repeat an abnormal result", paragraphs: ["One unusual result does not always mean chronic kidney disease. Tests may be repeated because hydration, infection, recent illness and medicines can temporarily alter results; chronic disease generally requires persistent evidence over time."] },
      { title: "Use additional blood tests when needed", paragraphs: ["Tests may assess electrolytes, urea, blood count, glucose, calcium and other measures. The selection depends on the suspected cause, severity and whether complications need to be checked."] },
      { title: "Arrange an ultrasound or other imaging", paragraphs: ["Imaging can show kidney size and structure and may identify stones, cysts or a blockage. Not everyone with an abnormal blood or urine result needs the same scan."] },
      { title: "Agree monitoring, treatment or referral", paragraphs: ["The next step may involve repeat monitoring, blood-pressure or diabetes treatment, medicine changes, advice tailored to the results, or referral to a kidney specialist when appropriate."] },
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

export default function KidneyArticlePage() {
  const referenceQuiz = getQuizBySlug("nursing", locale);
  if (!referenceQuiz) notFound();

  const articleTheme = {
    ...referenceQuiz.theme,
    id: "kidney-warning",
    colors: {
      ...referenceQuiz.theme.colors,
      page: "#142629",
      pageAlt: "#31575a",
      surface: "#fffaf3",
      surfaceRaised: "#e8f3ef",
      text: "#1b2b2d",
      muted: "#627170",
      primary: "#a82f49",
      primaryText: "#ffffff",
      border: "#9db8b0",
      incorrect: "#a82f49",
    },
    header: {
      background: "linear-gradient(90deg, #173437, #35656a)",
      text: "#ffffff",
      border: "#d6aa58",
      shadow: "0 8px 26px rgba(11, 39, 42, 0.28)",
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Kidney Disease Warning Signs",
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
          articleSlug="kidney"
          adNote="One short ad, then see the warning signs."
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="See Warning Signs"
          disclaimer="General educational information only. These signs do not prove that someone has kidney disease, and this guide is not a diagnosis or substitute for care from a qualified healthcare professional. Seek urgent medical care for new chest pain, severe breathing difficulty, confusion, a sudden major reduction in urine, or rapidly worsening swelling or illness."
          icon={(
            <svg className="article-engine__kidney-icon" focusable="false" viewBox="0 0 72 72">
              <path className="article-engine__kidney-organ" d="M25 8c-9-2-16 6-16 18 0 13 7 22 16 21 7-1 10-7 8-14-2-6-2-10 1-15 4-7 0-9-9-10Z" />
              <path className="article-engine__kidney-organ" d="M47 8c9-2 16 6 16 18 0 13-7 22-16 21-7-1-10-7-8-14 2-6 2-10-1-15-4-7 0-9 9-10Z" />
              <path className="article-engine__kidney-hilum" d="M28 18c-6 4-7 13-2 19M44 18c6 4 7 13 2 19" />
              <path className="article-engine__kidney-ureter" d="M27 38c0 11 3 18 7 26M45 38c0 11-3 18-7 26" />
            </svg>
          )}
          intro="Some kidney changes are easy to miss. See which 10 warning signs deserve attention."
          landingTitle={landingTitle}
          sectionCount={sections.length}
          socialProofCount="129,000+"
          socialProofLabel="read this today"
          sources={[
            { label: "NIDDK chronic kidney disease overview", url: "https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd/what-is-chronic-kidney-disease" },
            { label: "NIDDK kidney tests and diagnosis", url: "https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd/tests-diagnosis" },
            { label: "NHS chronic kidney disease", url: "https://www.nhs.uk/conditions/kidney-disease/" },
            { label: "NHS diagnosis and testing", url: "https://www.nhs.uk/conditions/kidney-disease/diagnosis/" },
            { label: "National Kidney Foundation warning signs", url: "https://www.kidney.org/kidney-topics/signs-and-symptoms-kidney-disease" },
          ]}
        />
      </ExperienceThemeBoundary>
    </SiteShell>
  );
}
