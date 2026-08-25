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
const path = "/cellulite";
const landingTitle = "Cellulite Reduction Treatments: What Actually Works?";
const description = "Compare common cellulite treatments, what current evidence says, how long improvements may last and what to ask before booking a procedure.";

const sections: ArticleSection[] = [
  {
    title: "10 Cellulite Treatment Options Explained",
    intro: "Cellulite is extremely common and harmless. Some treatments can make dimpling less noticeable, but results vary and are often temporary.",
    points: [
      {
        title: "Acoustic wave therapy",
        paragraphs: ["A handheld device delivers sound waves through the skin. Studies suggest it can reduce the appearance of cellulite, but several sessions are usually needed and results vary."],
      },
      {
        title: "Subcision",
        paragraphs: ["A clinician places a small instrument beneath the skin to release fibrous bands that pull down and create dimples. Results can last longer than many surface treatments, but bruising, discomfort and recovery should be discussed."],
      },
      {
        title: "Minimally invasive laser treatment",
        paragraphs: ["A small laser fibre is inserted beneath the skin to target fibrous bands and stimulate thicker-looking skin. Some people see improvement lasting a year or longer, although more research is still needed."],
      },
      {
        title: "Vacuum-assisted tissue release",
        paragraphs: ["This procedure uses a device beneath the skin to release the bands responsible for individual dimples. Small studies suggest improvements may last for years, but suitability and risks require a professional assessment."],
      },
      {
        title: "Radiofrequency treatment",
        paragraphs: ["Radiofrequency devices heat tissue and may temporarily tighten skin or soften the look of dimples. Several sessions may be needed, and possible effects include pain, swelling, burns, colour changes or scarring."],
      },
      {
        title: "Mechanical massage or vacuum treatment",
        paragraphs: ["Rollers, vibration or suction can temporarily improve the appearance of cellulite in some people. Any benefit usually fades after treatment stops, so maintenance sessions may be required."],
      },
      {
        title: "Caffeine and retinol creams",
        paragraphs: ["Caffeine products may briefly make dimpling less obvious, while a 0.3% retinol product may modestly improve appearance after months of regular use. Patch-test first because irritation or allergic reactions can occur."],
      },
      {
        title: "Carboxytherapy",
        paragraphs: ["This procedure injects carbon dioxide gas beneath the skin. Early, small studies suggest possible improvement, but the evidence is limited and temporary bruising or discomfort can occur."],
      },
      {
        title: "Exercise and body-composition changes",
        paragraphs: ["Building muscle may make the skin look firmer, and weight changes can alter how visible cellulite appears. Neither approach removes the fibrous structure that creates cellulite, and weight loss can sometimes make dimpling more noticeable if skin loosens."],
      },
      {
        title: "Treatments that target fat instead",
        paragraphs: ["Liposuction, fat freezing and ultrasound used alone target fat rather than the bands that create cellulite. They should not be assumed to remove dimpling, and liposuction can sometimes make it look more obvious."],
      },
    ],
    next: {
      eyebrow: "Next section",
      title: "Which options compare best?",
      copy: "Compare evidence, longevity, downtime and the commitment different treatments may require.",
      cta: "Compare Treatments",
    },
  },
  {
    title: "How Cellulite Treatments Compare",
    intro: "There is no universal winner. The right comparison depends on whether a treatment targets fibrous bands, skin texture, fluid or fat, and how much downtime and maintenance you accept.",
    points: [
      {
        title: "Treating the bands beneath dimples",
        paragraphs: ["Subcision, minimally invasive laser procedures and vacuum-assisted tissue release directly address the fibrous bands involved in distinct dimples. They are more invasive than surface treatments and require an experienced medical practitioner."],
      },
      {
        title: "Choosing a non-invasive option",
        paragraphs: ["Acoustic wave, radiofrequency and mechanical treatments avoid incisions. They may be easier to fit around daily life, but often need a course of sessions and may produce subtler or shorter-lived changes."],
      },
      {
        title: "How long improvements may last",
        paragraphs: ["Massage-based effects can fade quickly, while some band-release procedures have shown improvements lasting years. No duration is guaranteed, and published results for one device do not automatically apply to every similar-sounding treatment."],
      },
      {
        title: "How many sessions may be needed",
        paragraphs: ["Many non-invasive treatments require repeated appointments before a visible change appears. Ask for the complete proposed course rather than comparing the price of one session."],
      },
      {
        title: "Downtime and recovery",
        paragraphs: ["Surface treatments may cause temporary redness, soreness or bruising. Procedures performed beneath the skin can involve more bruising, swelling and recovery, so clarify activity restrictions and aftercare in advance."],
      },
      {
        title: "Cellulite is not the same as body fat",
        paragraphs: ["A treatment that reduces a small fat bulge may not improve dimpling. Ask whether the proposed treatment is authorised and supported specifically for improving the appearance of cellulite."],
      },
      {
        title: "Topical products offer modest changes",
        paragraphs: ["Creams are less invasive and less expensive than procedures, but improvements are usually limited and depend on continued use. Strong claims of permanent removal are not realistic."],
      },
      {
        title: "Practitioner skill changes the risk",
        paragraphs: ["The experience and clinical training of the person performing an invasive or energy-based procedure matter. Results and complications cannot be judged from the device name alone."],
      },
      {
        title: "Maintenance can change the real cost",
        paragraphs: ["A lower-priced treatment can become expensive when it requires repeated sessions indefinitely. Compare the initial course, expected maintenance and what happens when treatment stops."],
      },
      {
        title: "The best choice depends on your goal",
        paragraphs: ["A few deep dimples, widespread texture and loose skin are different concerns. A qualified clinician should explain what the treatment is intended to change, what it cannot change and whether doing nothing is also reasonable."],
      },
    ],
    next: {
      eyebrow: "Final section",
      title: "Thinking about booking?",
      copy: "See the questions, safety checks and warning signs worth reviewing before treatment.",
      cta: "See Booking Checklist",
    },
  },
  {
    title: "Before You Book a Cellulite Treatment",
    intro: "Cosmetic treatment is optional, and every option has limits. A careful consultation should make the likely benefit, total commitment and possible risks clear before you agree.",
    points: [
      {
        title: "Define the change you actually want",
        paragraphs: ["Point out the exact dimples or texture that concern you. Ask whether the proposed treatment targets cellulite, loose skin, a fat bulge or a different issue."],
      },
      {
        title: "Check the practitioner’s qualifications",
        paragraphs: ["Ask who will assess you, who will perform the procedure and what training they have with that specific treatment. Invasive and energy-based procedures deserve qualified medical oversight."],
      },
      {
        title: "Identify the exact device and intended use",
        paragraphs: ["Request the manufacturer and model, then check whether the device is authorised by the relevant regulator for the proposed cosmetic use and body area. Registration alone is not proof that a device is effective."],
      },
      {
        title: "Share your complete medical history",
        paragraphs: ["Tell the provider about medical conditions, previous surgery, scars, implants, metal beneath the skin, pregnancy, skin problems and any history of abnormal healing."],
      },
      {
        title: "Review medicines and sensitivities",
        paragraphs: ["Some medicines and health conditions can affect bruising, healing, infection risk or sensitivity to light and heat. Do not stop prescribed medication unless the appropriate clinician advises it."],
      },
      {
        title: "Ask about every material risk",
        paragraphs: ["Depending on the treatment, risks may include pain, bruising, swelling, burns, infection, nodules, colour changes, contour irregularity or scarring. Ask how complications are handled and who provides follow-up care."],
      },
      {
        title: "Request evidence for the exact treatment",
        paragraphs: ["Ask for evidence relevant to the named device or procedure, not just the general technology. Be cautious when testimonials or edited images are presented as proof."],
      },
      {
        title: "Judge before-and-after images carefully",
        paragraphs: ["Useful photographs should use consistent lighting, posture, distance and timing. Different angles or shadows can exaggerate a change in skin texture."],
      },
      {
        title: "Calculate the complete cost",
        paragraphs: ["Include consultation, the full initial course, anaesthesia if relevant, aftercare, maintenance and treatment of complications. Ask what is refundable if the course changes."],
      },
      {
        title: "Walk away from pressure or guarantees",
        paragraphs: ["Be cautious of permanent-removal promises, guaranteed outcomes, urgency discounts or a provider who dismisses risks. You should have enough time to consider the information and seek another opinion."],
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

export default function CelluliteArticlePage() {
  const referenceQuiz = getQuizBySlug("nursing", locale);
  if (!referenceQuiz) notFound();

  const articleTheme = {
    ...referenceQuiz.theme,
    id: "cellulite-guide",
    colors: {
      ...referenceQuiz.theme.colors,
      page: "#2f2028",
      pageAlt: "#6e4352",
      surface: "#fff9f4",
      surfaceRaised: "#f8e7e5",
      text: "#321d26",
      muted: "#755e68",
      primary: "#8f3d62",
      primaryText: "#ffffff",
      border: "#d8a9b8",
      incorrect: "#8f3d62",
    },
    header: {
      background: "linear-gradient(90deg, #3b1d2b, #8f3d62)",
      text: "#ffffff",
      border: "#c99c4e",
      shadow: "0 8px 26px rgba(58, 25, 43, 0.28)",
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: landingTitle,
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
      <style dangerouslySetInnerHTML={{ __html: `html,body{background:${articleTheme.colors.page}}` }} />
      <QuizThemeBoundary
        shellCssHref={referenceQuiz.shellCssHref}
        theme={articleTheme}
        themeCssHref={referenceQuiz.themeCssHref}
      >
        <ArticleExperience
          adElementPrefix="cellulite"
          adNote="One short ad, then see the treatment guide."
          articleTitle={sections[0].title}
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="See Treatment Options"
          disclaimer="General educational information only. Cellulite is a common cosmetic concern, and this guide is not medical advice or a recommendation for any procedure. Discuss suitability, benefits and risks with a qualified healthcare professional."
          icon="✨"
          intro="Which cellulite treatments really work? Compare the options, evidence and limitations before spending money."
          landingTitle={landingTitle}
          points={sections[0].points}
          sections={sections}
          socialProofCount="168,000+"
          socialProofLabel="read this today"
          sources={[
            { label: "American Academy of Dermatology", url: "https://www.aad.org/public/cosmetic/fat-removal/cellulite-treatments-what-really-works" },
            { label: "FDA body-contouring guidance", url: "https://www.fda.gov/medical-devices/aesthetic-cosmetic-devices/non-invasive-body-contouring-technologies" },
            { label: "Mayo Clinic", url: "https://www.mayoclinic.org/diseases-conditions/cellulite/diagnosis-treatment/drc-20354949" },
          ]}
        />
      </QuizThemeBoundary>
    </SiteShell>
  );
}
