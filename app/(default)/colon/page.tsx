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
const path = "/colon";
const landingTitle = "10 Colon Cancer Warning Signs You Shouldn't Ignore";
const description = "Learn ten bowel changes and other possible colon cancer warning signs worth discussing with a healthcare professional, plus risk factors and what a check may involve.";

export const sections: ArticleSection[] = [
  {
    title: "Colon Cancer Warning Signs",
    intro: "Colon cancer may cause no symptoms at first. When symptoms do appear, they can have many non-cancerous causes, so a healthcare professional needs to assess the whole picture.",
    points: [
      {
        title: "Blood in or on your stool",
        paragraphs: [
          "Blood may look bright red, dark red or make a stool appear unusually dark or black. Haemorrhoids and other common conditions can also cause bleeding, but visible or repeated blood should not be self-diagnosed.",
        ],
      },
      {
        title: "Bleeding from the rectum",
        paragraphs: [
          "Bleeding noticed in the toilet or on paper is another change worth discussing. Seek urgent medical advice for heavy bleeding, bloody diarrhoea, or black or dark-red stool.",
        ],
      },
      {
        title: "A persistent change in bowel habits",
        paragraphs: [
          "New diarrhoea, constipation, softer stool, or going more or less often than is normal for you can be significant when the pattern persists rather than settling quickly.",
        ],
      },
      {
        title: "Stools that look narrower or different",
        paragraphs: [
          "A lasting change in stool shape or calibre can occur for several reasons. What matters is a noticeable change from your usual pattern, especially when it appears with bleeding, pain or weight loss.",
        ],
      },
      {
        title: "Feeling that your bowel has not emptied",
        paragraphs: [
          "You may still feel an urge to have a bowel movement immediately after going. A repeated sensation of incomplete emptying deserves assessment if it is new or persistent.",
        ],
      },
      {
        title: "Abdominal pain or cramping that does not settle",
        paragraphs: [
          "Ongoing stomach or abdominal aches, cramps, gas pains or discomfort can have many explanations. Pain that continues, worsens or occurs with other bowel changes should be checked.",
        ],
      },
      {
        title: "Persistent bloating or fullness",
        paragraphs: [
          "Frequent bloating or a feeling of fullness may accompany changes in the bowel. A new pattern that does not resolve is more important than occasional bloating after food.",
        ],
      },
      {
        title: "Unexplained tiredness or shortness of breath",
        paragraphs: [
          "Slow blood loss from the bowel can sometimes lead to iron-deficiency anaemia. This may cause unusual fatigue, weakness, breathlessness, dizziness or paleness and can be detected with a blood test.",
        ],
      },
      {
        title: "Losing weight without trying",
        paragraphs: [
          "Unintended weight loss can have many medical causes. It should be discussed with a healthcare professional, particularly when it occurs with appetite loss, bowel changes, bleeding or persistent discomfort.",
        ],
      },
      {
        title: "A lump or swelling in the abdomen",
        paragraphs: [
          "A new abdominal lump, swelling or persistent area of fullness needs medical assessment. Do not wait for a lump to become painful before seeking advice.",
        ],
      },
    ],
    next: {
      eyebrow: "Next section",
      title: "Could you be at higher risk?",
      copy: "See the factors that can affect colon and colorectal cancer risk.",
      cta: "See Risk Factors",
    },
  },
  {
    title: "Colon Cancer Risk Factors",
    intro: "Risk factors cannot predict who will develop colon cancer, and people without obvious risk factors can still be diagnosed. They can, however, affect screening and assessment decisions.",
    points: [
      { title: "Getting older", paragraphs: ["Colon and colorectal cancer risk rises with age, although younger adults can also be affected. Screening recommendations vary by country, age and personal risk."] },
      { title: "A previous colorectal polyp", paragraphs: ["Some types of polyps can become cancerous over time. A history of adenomatous polyps may mean that follow-up colonoscopies are recommended more often."] },
      { title: "Previous colon or rectal cancer", paragraphs: ["People previously treated for colorectal cancer need an individual follow-up plan because they have a higher risk of another colorectal tumour."] },
      { title: "A close family history", paragraphs: ["Risk can be higher when a parent, sibling or child has had colorectal cancer or certain polyps, particularly if diagnosis occurred at a younger age or several relatives are affected."] },
      { title: "Inherited cancer syndromes", paragraphs: ["Lynch syndrome and familial adenomatous polyposis are uncommon inherited conditions that substantially increase colorectal cancer risk and usually require specialist surveillance."] },
      { title: "Long-standing inflammatory bowel disease", paragraphs: ["Ulcerative colitis and Crohn’s disease involving the colon can increase risk over time. This is different from irritable bowel syndrome, which does not cause the same inflammation."] },
      { title: "Type 2 diabetes", paragraphs: ["Type 2 diabetes is associated with a higher risk of colorectal cancer. Individual risk still depends on many factors and should not be inferred from one condition alone."] },
      { title: "Smoking and heavier alcohol use", paragraphs: ["Tobacco use and heavier alcohol consumption are linked with increased colorectal cancer risk as well as other health harms."] },
      { title: "Weight, activity and diet patterns", paragraphs: ["Low physical activity, excess body weight, and diets high in processed or red meat are associated with greater risk. These are population-level associations, not a diagnosis for an individual."] },
      { title: "Risk should guide a conversation", paragraphs: ["Tell a healthcare professional about relevant bowel disease, polyps and family cancer history. People at increased risk may need earlier or different testing than standard population screening."] },
    ],
    next: {
      eyebrow: "Final section",
      title: "What happens next?",
      copy: "See how bowel symptoms and abnormal screening results may be checked.",
      cta: "See How A Check Works",
    },
  },
  {
    title: "What Happens at a Colon Check?",
    intro: "The pathway depends on symptoms, age, medical history and local guidance. A clinician combines information from several steps rather than relying on one symptom or test.",
    points: [
      { title: "Describe the change clearly", paragraphs: ["A clinician may ask when symptoms started, whether they are continuous or intermittent, what your normal bowel pattern is and whether you have noticed bleeding, pain, appetite changes or weight loss."] },
      { title: "Review personal and family history", paragraphs: ["Previous polyps, bowel disease, medicines, anaemia and colorectal cancer in close relatives can influence which tests are appropriate and how quickly they are arranged."] },
      { title: "Have a physical examination", paragraphs: ["The abdomen may be examined for tenderness, swelling or a lump. Depending on the symptoms, a rectal examination may also be discussed."] },
      { title: "Check blood tests", paragraphs: ["A full blood count can identify anaemia, while other blood tests may help assess general health. Blood tests alone cannot diagnose or rule out colon cancer."] },
      { title: "Use a stool test when appropriate", paragraphs: ["A faecal immunochemical test, often called FIT, looks for small amounts of blood in stool. It can support referral or screening decisions, but the result must be interpreted in context."] },
      { title: "Follow up an abnormal screening result", paragraphs: ["An abnormal stool-based screening result does not prove cancer. It usually means further investigation, commonly colonoscopy, is needed to find the cause."] },
      { title: "Look inside the colon", paragraphs: ["Colonoscopy uses a flexible camera to inspect the colon and rectum. It can identify inflammation, polyps, cancer and other causes of bleeding or bowel changes."] },
      { title: "Remove polyps or take biopsies", paragraphs: ["During colonoscopy, some polyps can be removed and suspicious areas can be sampled. Laboratory examination of tissue is what determines whether cancer cells are present."] },
      { title: "Use imaging when needed", paragraphs: ["CT colonography or other scans may be used in some circumstances. If cancer is diagnosed, imaging can help determine its location and whether it has spread."] },
      { title: "Discuss results and next steps", paragraphs: ["The outcome may be reassurance, treatment for another condition, surveillance after polyp removal, more tests or referral to a specialist cancer team. The plan should be explained in terms you understand."] },
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

export default function ColonArticlePage() {
  const referenceQuiz = getQuizBySlug("nursing", locale);
  if (!referenceQuiz) notFound();

  const articleTheme = {
    ...referenceQuiz.theme,
    id: "colon-warning",
    colors: {
      ...referenceQuiz.theme.colors,
      page: "#24151d",
      pageAlt: "#5c293d",
      surface: "#fff8f3",
      surfaceRaised: "#f8e5e9",
      text: "#2c1720",
      muted: "#735b64",
      primary: "#b51f3f",
      primaryText: "#ffffff",
      border: "#d3a0ad",
      incorrect: "#b51f3f",
    },
    header: {
      background: "linear-gradient(90deg, #341420, #7f1f3d)",
      text: "#ffffff",
      border: "#d9a44b",
      shadow: "0 8px 26px rgba(49, 13, 28, 0.28)",
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Colon Cancer Warning Signs",
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
          articleSlug="colon"
          adNote="One short ad, then see the warning signs."
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="See Warning Signs"
          disclaimer="General educational information only. These signs do not prove that someone has colon cancer and this guide is not a diagnosis or substitute for care from a qualified healthcare professional. Seek urgent medical advice for heavy bleeding, bloody diarrhoea, black or dark-red stool, severe worsening pain, persistent vomiting or signs of bowel obstruction."
          icon={(
            <svg className="article-engine__colon-icon" focusable="false" viewBox="0 0 72 72">
              <path className="article-engine__colon-outline" d="M16 48V25c0-8 5-12 13-12 8 1 15-2 23 0 6 1 9 6 9 13v18c0 7-5 11-12 10-6-1-10-1-14 3-3 3-2 7 2 9" />
              <path className="article-engine__colon-tube" d="M16 48V25c0-8 5-12 13-12 8 1 15-2 23 0 6 1 9 6 9 13v18c0 7-5 11-12 10-6-1-10-1-14 3-3 3-2 7 2 9" />
              <path className="article-engine__colon-detail" d="M11 28h10m-10 10h10M27 8v11m11-10v10m12-10v11m6 8h10m-10 10h10m-15 11 3 10m-15-7 5 8" />
              <path className="article-engine__colon-appendix" d="M13 48c-3 5-2 10 1 13" />
              <circle className="article-engine__colon-cecum" cx="16" cy="48" r="7" />
            </svg>
          )}
          intro="These warning signs can be easy to dismiss. If a change is new or persistent, don't put off checking what it could mean."
          landingTitle={landingTitle}
          sectionCount={sections.length}
          socialProofCount="132,000+"
          socialProofLabel="read this today"
          sources={[
            { label: "NHS bowel cancer symptoms", url: "https://www.nhs.uk/conditions/bowel-cancer/symptoms/" },
            { label: "National Cancer Institute", url: "https://www.cancer.gov/types/colorectal/patient/colon-treatment-pdq" },
            { label: "CDC colorectal cancer symptoms", url: "https://www.cdc.gov/colorectal-cancer/symptoms/index.html" },
            { label: "American Cancer Society signs and symptoms", url: "https://www.cancer.org/cancer/types/colon-rectal-cancer/detection-diagnosis-staging/signs-and-symptoms.html" },
            { label: "American Cancer Society colonoscopy guide", url: "https://www.cancer.org/cancer/diagnosis-staging/tests/endoscopy/colonoscopy.html" },
          ]}
        />
      </ExperienceThemeBoundary>
    </SiteShell>
  );
}
