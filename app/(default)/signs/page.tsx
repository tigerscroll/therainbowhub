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
const path = "/signs";
const landingTitle = "10 Signs You Are Close To Death";
const description = "Learn common changes that may occur in the last days and hours of life, how families can offer comfort and when to contact healthcare or hospice professionals.";

export const sections: ArticleSection[] = [
  {
    title: "10 Signs Someone May Be In The Last Days Of Life",
    intro: "These changes are most meaningful when a healthcare team already expects that someone is dying. No single sign can predict the exact time, and not everyone experiences every change.",
    points: [
      {
        title: "Sleeping much more",
        paragraphs: ["The person may become increasingly drowsy, spend most of the day asleep and move in and out of consciousness. They may respond slowly or stop responding even though they may still be aware of familiar voices."],
      },
      {
        title: "Profound weakness",
        paragraphs: ["Standing, walking, washing or changing position may become difficult or impossible. The person may remain in bed and need much more help because the body has very little energy."],
      },
      {
        title: "Little interest in food or drink",
        paragraphs: ["Appetite and thirst commonly fall as the body slows down. Families should not force food or fluid; the care team can suggest mouth care, safe sips or other ways to ease dryness."],
      },
      {
        title: "Difficulty swallowing",
        paragraphs: ["Tablets, food and drinks may become hard to swallow. Tell the healthcare team, because medicines may need to be changed to another form and unsafe feeding can cause choking or aspiration."],
      },
      {
        title: "Irregular breathing or long pauses",
        paragraphs: ["Breathing may alternate between shallow and deeper breaths, become slower or include pauses. This can be distressing to witness, but the person may not experience it in the same way observers do."],
      },
      {
        title: "Noisy breathing",
        paragraphs: ["Saliva or mucus can collect when someone is too weak to cough or swallow effectively, creating a rattling sound. Repositioning and medicines may help, so contact the care team for guidance."],
      },
      {
        title: "Confusion, restlessness or unusual experiences",
        paragraphs: ["The person may not recognise people or places, speak to someone others cannot see, pick at bedding or try to get up. Pain, medicines, infection or chemical changes can contribute and should be assessed."],
      },
      {
        title: "Cold, pale, blue or mottled skin",
        paragraphs: ["Hands and feet may become cool as circulation changes. Skin can look pale, bluish or patchy, with colour changes sometimes easier to see around the lips, mouth, ears, knees or feet."],
      },
      {
        title: "Passing much less urine",
        paragraphs: ["Urine may become darker and less frequent as drinking decreases and kidney function changes. The care team can explain whether this is expected or whether another cause needs attention."],
      },
      {
        title: "Withdrawing from people and surroundings",
        paragraphs: ["Someone may speak less, lose interest in usual activities or focus inward. This is not necessarily rejection, anger or depression; quiet presence and familiar voices can still be comforting."],
      },
    ],
    next: {
      eyebrow: "What happens next",
      title: "How quickly can these changes happen?",
      copy: "See how the final weeks, days and hours may differ—and why exact timing remains uncertain.",
      cta: "See The Timeline",
    },
  },
  {
    title: "What The Final Weeks, Days And Hours May Look Like",
    intro: "Dying does not follow a fixed countdown. Changes can appear gradually, come and go, or happen quickly depending on the illness and the person.",
    points: [
      {
        title: "Weeks before death can look different for everyone",
        paragraphs: ["Increasing tiredness, weakness, reduced appetite and needing more help with daily tasks may develop over weeks. These changes alone cannot prove that death is imminent."],
      },
      {
        title: "Daily activities often become harder",
        paragraphs: ["Washing, dressing, walking and using the toilet may require assistance. Equipment, community nursing and hospice support can reduce strain and help preserve dignity."],
      },
      {
        title: "Food and fluid usually reduce gradually",
        paragraphs: ["The body needs and processes less nutrition as death approaches. Comfort-focused care usually follows the person's cues instead of setting food or drink targets designed for recovery."],
      },
      {
        title: "Wakeful periods may become shorter",
        paragraphs: ["Conversation can become brief, delayed or tiring. A person may have a temporary period of clarity, but this does not necessarily mean the underlying condition has reversed."],
      },
      {
        title: "Medicines may need a different route",
        paragraphs: ["When swallowing becomes difficult, clinicians can use liquids, patches, injections or a syringe driver where appropriate. Do not crush tablets or change doses without professional advice."],
      },
      {
        title: "Breathing patterns may change over hours or days",
        paragraphs: ["Shallow breaths, deeper rapid breaths and pauses can occur. The rhythm may change repeatedly, and noisy secretions may appear near the end."],
      },
      {
        title: "Circulation gradually slows",
        paragraphs: ["Blood pressure often falls, the pulse may become weak or irregular, and the extremities can cool or change colour. Blankets can provide comfort, but avoid heating pads that may burn fragile skin."],
      },
      {
        title: "Awareness may be limited but hearing may remain",
        paragraphs: ["A person who cannot speak or open their eyes may still find a calm voice, gentle touch or familiar music reassuring. Speak naturally and avoid discussing distressing matters as though they are absent."],
      },
      {
        title: "The last breaths may be far apart",
        paragraphs: ["Near death, breaths may become separated by longer pauses. There can occasionally be one or two reflex breaths after what seemed to be the final breath."],
      },
      {
        title: "Only the care team can interpret the whole picture",
        paragraphs: ["Clinicians consider the illness, repeated observations, responsiveness, breathing, circulation, urine output and other changes together. Even experienced teams cannot always give an exact time."],
      },
    ],
    next: {
      eyebrow: "Help them feel safe",
      title: "What can families do for comfort?",
      copy: "Ten gentle, practical actions can make the final days calmer without forcing or overwhelming the person.",
      cta: "See Comfort Steps",
    },
  },
  {
    title: "10 Ways To Comfort Someone Near The End Of Life",
    intro: "Comfort care should follow the person's wishes and the plan agreed with their healthcare team. Small, calm actions often matter more than trying to correct every change.",
    points: [
      {
        title: "Keep talking in a familiar voice",
        paragraphs: ["Introduce yourself, explain what you are doing and share ordinary memories. Hearing may continue after someone can no longer respond, and a calm voice can provide reassurance."],
      },
      {
        title: "Follow their lead on touch",
        paragraphs: ["Holding a hand, gently stroking an arm or sitting nearby may feel comforting. Stop if the person appears tense or uncomfortable, and respect cultural and personal preferences."],
      },
      {
        title: "Offer mouth and lip care",
        paragraphs: ["Dryness can be eased with the products and techniques recommended by the care team. If swallowing is unsafe, moistening the mouth may be more comfortable than offering a drink."],
      },
      {
        title: "Do not force food or fluid",
        paragraphs: ["Pressure to eat can cause distress, nausea or choking when the body no longer wants or manages food. Offer only what is wanted and safe under the care plan."],
      },
      {
        title: "Adjust position gently",
        paragraphs: ["Pillows and careful repositioning may ease pressure, breathlessness or noisy secretions. Ask nurses how often and how to move the person without causing pain or injury."],
      },
      {
        title: "Keep the room calm",
        paragraphs: ["Reduce harsh lighting, sudden noise and too many conversations at once. Familiar music, photographs, scents or a quiet open window may help if the person previously enjoyed them."],
      },
      {
        title: "Use prescribed comfort medicines correctly",
        paragraphs: ["Follow the written plan for pain, breathlessness, nausea, agitation or secretions. Contact the team if a medicine is unavailable, cannot be swallowed or does not appear to help."],
      },
      {
        title: "Protect dignity and privacy",
        paragraphs: ["Explain personal care, cover the body appropriately and limit visitors when needed. Continue treating the person as an adult with preferences, even when they cannot communicate."],
      },
      {
        title: "Include spiritual or cultural wishes",
        paragraphs: ["Prayer, music, rituals, silence or contact with a faith or community leader may be important. Ask rather than assume, and tell the care team about practices the family wants respected."],
      },
      {
        title: "Let carers rest without guilt",
        paragraphs: ["Families cannot watch continuously. Arrange shifts, accept practical help and sleep when possible. Stepping away briefly does not mean abandoning the person."],
      },
    ],
    next: {
      eyebrow: "Know when to call",
      title: "Which changes need professional help now?",
      copy: "See when to contact the hospice or care team—and when sudden symptoms should be treated as an emergency.",
      cta: "See When To Call",
    },
  },
  {
    title: "When To Call The Care Team Or Emergency Services",
    intro: "Expected dying changes still deserve support. Use the contact plan supplied by the healthcare team, and seek urgent help for sudden symptoms when death is not already expected.",
    points: [
      {
        title: "New or uncontrolled pain",
        paragraphs: ["Contact the care team if pain appears, worsens or is not settling with the prescribed plan. They may need to assess the cause or change the medicine, dose or delivery method."],
      },
      {
        title: "Distressing breathlessness",
        paragraphs: ["Call for advice if breathing appears uncomfortable, frightened or suddenly worse. Positioning, airflow, reassurance and prescribed medicines may help, but the plan should be individual."],
      },
      {
        title: "Severe agitation or confusion",
        paragraphs: ["Restlessness can have treatable contributors such as pain, urinary retention, medicines or infection. Seek help if the person is distressed, unsafe or cannot be settled."],
      },
      {
        title: "Medicines cannot be given",
        paragraphs: ["If swallowing fails, vomiting continues, equipment stops working or essential medicines run out, contact the team promptly rather than improvising a dose or route."],
      },
      {
        title: "Heavy bleeding, repeated vomiting or a seizure",
        paragraphs: ["Use the urgent instructions in the person's care plan and contact the designated professional immediately. If no expected-death plan exists, call emergency services."],
      },
      {
        title: "A fall or possible injury",
        paragraphs: ["Do not lift someone alone after a fall. Check the agreed contact plan and seek assessment, particularly after a head impact, severe pain or an obvious injury."],
      },
      {
        title: "The person or family feels unsafe",
        paragraphs: ["Call the care team if symptoms, equipment, medication or exhaustion make home care feel unsafe. Asking for more support is appropriate and may prevent a crisis."],
      },
      {
        title: "You are unsure whether death has occurred",
        paragraphs: ["Follow the number and instructions provided by the hospice, community nurse, doctor or care home. A qualified professional can guide you through confirmation and the next steps."],
      },
      {
        title: "Sudden symptoms in someone not expected to die",
        paragraphs: ["Collapse, severe breathing difficulty, chest pain, stroke signs, heavy bleeding or unresponsiveness are emergencies when there is no established end-of-life plan. Call your local emergency number immediately."],
      },
      {
        title: "When in doubt, make the call",
        paragraphs: ["You do not need to identify the cause before asking for help. Describe what changed, when it began, the person's diagnosis and the medicines already given."],
      },
    ],
    next: {
      eyebrow: "Be prepared",
      title: "What should families arrange before the final hours?",
      copy: "A simple checklist can reduce uncertainty, protect the person's wishes and make urgent decisions easier.",
      cta: "See Family Checklist",
    },
  },
  {
    title: "10 Things Families Can Prepare For The Final Days",
    intro: "Planning cannot remove grief, but it can reduce avoidable uncertainty. Ask the healthcare team which steps apply in your area and situation.",
    points: [
      {
        title: "Keep the important phone numbers visible",
        paragraphs: ["Write down daytime, out-of-hours, hospice, community nursing and emergency contacts. Make sure every main carer knows which number to use in different situations."],
      },
      {
        title: "Review the symptom plan",
        paragraphs: ["Ask what to do for pain, breathlessness, nausea, agitation and secretions, where medicines are stored and who to call if the first step does not work."],
      },
      {
        title: "Check equipment and supplies",
        paragraphs: ["Confirm that beds, pressure-relieving equipment, continence supplies, mouth-care items and medication equipment are present and working before they are urgently needed."],
      },
      {
        title: "Understand the person's wishes",
        paragraphs: ["Discuss preferred place of care, visitors, privacy, music, spiritual support and who should speak for the person if they lose capacity. Record wishes through the appropriate local process."],
      },
      {
        title: "Clarify emergency and resuscitation decisions",
        paragraphs: ["Ask the clinical team to explain any documented treatment-escalation or resuscitation plan, where it should be kept and what carers should say if emergency services are contacted."],
      },
      {
        title: "Choose who needs to be contacted",
        paragraphs: ["Keep a short list of relatives, close friends, faith leaders or others the person wants involved. One family contact can update others and reduce repeated calls into the room."],
      },
      {
        title: "Ask what happens after an expected death",
        paragraphs: ["Procedures differ by location and place of care. The nurse, doctor or hospice can explain who confirms the death, which service to call and when a funeral director becomes involved."],
      },
      {
        title: "Make room for cultural and religious practices",
        paragraphs: ["Tell professionals in advance about timing, washing, touching, positioning, prayers or other practices that matter after death so they can be respected where possible."],
      },
      {
        title: "Plan support for children and vulnerable adults",
        paragraphs: ["Use clear, honest language appropriate to their understanding and arrange a trusted person who can support them. Healthcare, hospice and bereavement teams may have specialist resources."],
      },
      {
        title: "Remember that carers need care too",
        paragraphs: ["Eat, rest, accept help and speak to someone you trust. Contact a healthcare professional or bereavement service if distress feels unmanageable or you are struggling to stay safe."],
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

export default function SignsArticlePage() {
  const referenceQuiz = getQuizBySlug("nursing", locale);
  if (!referenceQuiz) notFound();

  const articleTheme = {
    ...referenceQuiz.theme,
    id: "end-of-life-signs",
    colors: {
      ...referenceQuiz.theme.colors,
      page: "#20222d",
      pageAlt: "#544354",
      surface: "#fbf6eb",
      surfaceRaised: "#f1e8db",
      text: "#29242c",
      muted: "#6b626a",
      primary: "#694a66",
      primaryText: "#fffaf0",
      border: "#ac9166",
      correct: "#47705e",
      incorrect: "#8c4050",
    },
    header: {
      background: "linear-gradient(90deg, #242533, #514253)",
      text: "#fff9ee",
      border: "#b99a5f",
      shadow: "0 8px 26px rgba(25, 24, 34, 0.32)",
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Signs Someone May Be Near The End Of Life",
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
          articleSlug="signs"
          adNote="One short ad, then see the signs."
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="See The Signs →"
          disclaimer="General educational information about expected dying only. These changes do not prove that a person is close to death and must be interpreted by their healthcare or hospice team. Sudden collapse, severe breathing difficulty, chest pain, stroke signs, heavy bleeding, a seizure or unresponsiveness in someone not expected to be dying requires immediate emergency help."
          icon="🕯️"
          intro="Families often notice the same 10 changes near the end. These signs apply to expected end-of-life care; sudden symptoms may need urgent medical help."
          landingTitle={landingTitle}
          sectionCount={sections.length}
          showCtaIcon={false}
          socialProofCount="184,000+"
          socialProofLabel="read this today"
          sources={[
            { label: "NHS: changes in the last hours and days", url: "https://www.nhs.uk/tests-and-treatments/end-of-life-care/your-wellbeing/changes-in-the-last-hours-and-days/" },
            { label: "NHS: what end-of-life care involves", url: "https://www.nhs.uk/tests-and-treatments/end-of-life-care/what-it-involves-and-when-it-starts/" },
            { label: "National Cancer Institute: last days of life", url: "https://www.cancer.gov/about-cancer/advanced-cancer/caregivers/planning/last-days-pdq" },
            { label: "National Cancer Institute: end-of-life care", url: "https://www.cancer.gov/about-cancer/advanced-cancer/care-choices/care-fact-sheet" },
            { label: "Marie Curie: stages of dying", url: "https://www.mariecurie.org.uk/information/end-of-life/stages-of-dying" },
            { label: "Hospice UK: the last moments before death", url: "https://www.hospiceuk.org/information-and-support/death-and-dying-what-expect/last-moments" },
          ]}
        />
      </ExperienceThemeBoundary>
    </SiteShell>
  );
}
