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
const path = "/nervous";
const landingTitle = "Don't Ignore These Nervous Breakdown Signs";
const description = "Learn ten signs that severe or prolonged stress may be overwhelming your ability to cope, practical next steps and when to seek urgent mental health support.";

export const sections: ArticleSection[] = [
  {
    title: "10 Signs Of A Nervous Breakdown",
    intro: "“Nervous breakdown” is not a medical diagnosis. People often use the phrase when stress, anxiety, low mood or exhaustion has become so intense that ordinary life feels hard to manage.",
    points: [
      {
        title: "Everything suddenly feels overwhelming",
        paragraphs: ["Tasks you normally handle may begin to feel impossible, even when they are small. You might feel permanently behind, unable to prioritise or as though one more demand will push you past your limit."],
      },
      {
        title: "Your concentration is disappearing",
        paragraphs: ["Reading the same sentence repeatedly, forgetting simple details, losing your train of thought and struggling to make decisions can happen when prolonged stress consumes your attention."],
      },
      {
        title: "Sleep is no longer restoring you",
        paragraphs: ["You may lie awake with racing thoughts, wake repeatedly, sleep far more than usual or still feel exhausted after a full night. A sustained change in sleep is worth taking seriously."],
      },
      {
        title: "Your body is sounding the alarm",
        paragraphs: ["Headaches, dizziness, muscle tension, stomach problems, a racing heartbeat and unexplained aches can accompany stress. New, severe or worrying physical symptoms still need medical assessment rather than being assumed to be stress."],
      },
      {
        title: "You are unusually irritable or emotional",
        paragraphs: ["Snapping at people, crying unexpectedly, feeling intense anger or reacting strongly to minor problems may mean your emotional reserves are depleted."],
      },
      {
        title: "You are withdrawing from everyone",
        paragraphs: ["Avoiding calls, cancelling plans, staying in one room or dreading ordinary interaction can be a sign that coping has become difficult, especially if isolation is increasing."],
      },
      {
        title: "Normal responsibilities are slipping",
        paragraphs: ["Missing work, ignoring bills, struggling with hygiene, leaving messages unanswered or being unable to complete basic household tasks can signal that distress is affecting day-to-day functioning."],
      },
      {
        title: "You feel numb, hopeless or detached",
        paragraphs: ["Some people feel tearful and panicked; others feel emotionally blank, disconnected or unable to care about things that normally matter. Either pattern can deserve support."],
      },
      {
        title: "Your coping habits are becoming risky",
        paragraphs: ["Drinking, smoking, gambling, misusing medicines or taking drugs more often to switch off can worsen mental health and make it harder to recognise how much help is needed."],
      },
      {
        title: "You no longer feel able to keep going normally",
        paragraphs: ["The clearest warning sign is often not one symptom but the point where you cannot function, feel unable to cope or fear you may not stay safe. That is a reason to seek help now, not a personal failure."],
      },
    ],
    next: {
      eyebrow: "What is behind it?",
      title: "Why can the pressure suddenly become too much?",
      copy: "The final trigger is often only the last part of a much bigger build-up. See the common pressures hiding underneath.",
      cta: "See What May Be Driving It",
    },
  },
  {
    title: "10 Pressures That Can Push Coping Past Its Limit",
    intro: "Severe distress often develops from several pressures at once. Identifying the pattern can help you explain what is happening and decide what support is most useful.",
    points: [
      { title: "Relentless pressure at work", paragraphs: ["Heavy workloads, low control, conflict, job insecurity and never mentally switching off can leave the stress response activated for long periods."] },
      { title: "Caring without enough support", paragraphs: ["Looking after a child, partner, parent or someone who is ill can create constant responsibility, disrupted sleep and little time to recover."] },
      { title: "Money worries", paragraphs: ["Debt, rising bills, unstable income or fear of losing housing can keep the mind locked onto threat and make every new expense feel like a crisis."] },
      { title: "Relationship strain or loneliness", paragraphs: ["Conflict, separation, bereavement, isolation or feeling unsupported can remove the relationships that would normally help absorb stress."] },
      { title: "Illness, pain or a frightening diagnosis", paragraphs: ["Health problems can affect sleep, independence, finances and hope at the same time. Supporting someone else through illness can be similarly exhausting."] },
      { title: "Too many major changes at once", paragraphs: ["Moving, becoming a parent, changing jobs, retirement or even positive events can overload attention when several happen close together."] },
      { title: "Perfectionism and impossible standards", paragraphs: ["Feeling that every task must be flawless—or that asking for help means failure—can turn ordinary demands into continuous pressure."] },
      { title: "Months without real recovery", paragraphs: ["Short breaks may not offset persistent stress if evenings, weekends and holidays are still filled with worry, care duties or digital interruptions."] },
      { title: "Alcohol, stimulants or other substances", paragraphs: ["Alcohol can disrupt sleep and mood, while excess caffeine or stimulants may increase anxiety and a racing heartbeat. Other substances can make symptoms less predictable."] },
      { title: "An underlying mental or physical health problem", paragraphs: ["Anxiety, depression, trauma, hormonal changes, medication effects and physical illness can overlap with stress. A qualified professional can assess the wider picture." ] },
    ],
    next: {
      eyebrow: "Do this first",
      title: "What can help in the next 24 hours?",
      copy: "When everything feels too much, the goal is not to fix your whole life. Start with ten actions that reduce pressure and create support.",
      cta: "See The 24-Hour Plan",
    },
  },
  {
    title: "10 Steps To Take When You Feel Close To Breaking Point",
    intro: "These steps are not a substitute for professional care. They are a way to make the immediate situation safer and more manageable while you arrange the right support.",
    points: [
      { title: "Tell one trusted person plainly", paragraphs: ["Say more than “I am stressed.” Try: “I am not coping and I need support today.” A clear sentence helps someone understand the seriousness without making you explain everything at once."] },
      { title: "Cancel what is not essential", paragraphs: ["Reduce the next 24 hours to safety, basic needs and truly unavoidable responsibilities. Postponing non-urgent tasks is a practical response to overload."] },
      { title: "Write down the three biggest pressures", paragraphs: ["Getting the problems out of your head can make them feel less tangled. Mark what must happen today, what can wait and what another person could handle."] },
      { title: "Eat, drink and take prescribed medicine", paragraphs: ["Aim for simple food, water and medicines exactly as directed. Skipping basic needs can intensify shakiness, headaches, exhaustion and emotional volatility."] },
      { title: "Lower stimulation for a while", paragraphs: ["Step away from upsetting news, work notifications, arguments and constant scrolling. A quieter room and fewer inputs can make it easier to think clearly."] },
      { title: "Slow your breathing", paragraphs: ["Gentle, unforced breathing can help settle the physical stress response. If focusing on breathing makes you more anxious, switch to naming things you can see, hear and feel around you."] },
      { title: "Avoid trying to switch off with substances", paragraphs: ["Alcohol, recreational drugs and extra medication can worsen judgement, sleep and mood. If stopping a substance could cause withdrawal, seek medical advice rather than stopping abruptly alone."] },
      { title: "Make tonight easier, not perfect", paragraphs: ["Dim lights, reduce caffeine, prepare what you need for morning and aim for rest. Do not turn falling asleep into another test you have to pass."] },
      { title: "Arrange professional support", paragraphs: ["Contact a GP, mental health service or talking-therapy provider and explain how your symptoms are affecting daily life. Ask for an urgent appointment if you cannot cope safely while waiting."] },
      { title: "Use urgent help if safety is in doubt", paragraphs: ["If you may harm yourself or someone else, cannot keep yourself safe, or there is immediate danger, call emergency services or go to the nearest emergency department now." ] },
    ],
    next: {
      eyebrow: "Know the threshold",
      title: "When does stress need professional help?",
      copy: "Some warning signs should not be managed alone. See when to book support, request urgent help or treat the situation as an emergency.",
      cta: "See When To Get Help",
    },
  },
  {
    title: "10 Signs It Is Time To Get Professional Help",
    intro: "You do not have to wait until you have completely stopped functioning. Earlier support can help identify stress, anxiety, depression, burnout or another condition and build a suitable plan.",
    points: [
      { title: "Distress is disrupting daily life", paragraphs: ["Seek help when sleep, work, study, relationships, self-care or basic responsibilities are repeatedly affected—even if you cannot identify one clear cause."] },
      { title: "Self-help is not making enough difference", paragraphs: ["If rest, boundaries, talking and practical changes are not helping, a clinician can assess what else may be contributing and discuss treatment options."] },
      { title: "Symptoms are persistent or worsening", paragraphs: ["Stress that keeps intensifying, returns quickly or lasts for weeks deserves attention rather than another attempt to push through it alone."] },
      { title: "Panic or physical symptoms feel frightening", paragraphs: ["Chest pain, fainting, severe breathing difficulty and other new or severe physical symptoms need appropriate medical assessment. Do not assume they are caused by anxiety."] },
      { title: "You are barely sleeping", paragraphs: ["Several nights with almost no sleep, rapidly worsening agitation or unusually energised behaviour can require urgent assessment, particularly if thoughts or behaviour feel out of character."] },
      { title: "Substances are becoming your main coping method", paragraphs: ["Tell a professional honestly what you use and how often. Support can address both the distress and the substance use without expecting you to solve one before the other."] },
      { title: "You hear, see or strongly believe things others do not", paragraphs: ["Hallucinations or fixed unusual beliefs should be assessed promptly, especially when they are new, frightening or affecting behaviour."] },
      { title: "You need urgent help but there is no immediate danger", paragraphs: ["In England, contact NHS 111 online or call 111 and select the mental health option. Elsewhere, use your local urgent mental health or medical service."] },
      { title: "You cannot keep yourself or someone else safe", paragraphs: ["Call emergency services or go to an emergency department now if life is at risk, serious self-harm has occurred or you cannot maintain immediate safety."] },
      { title: "Prepare one honest summary for the appointment", paragraphs: ["Note when the change began, the effect on sleep and functioning, medicines and substances, major pressures and any safety concerns. You do not need to diagnose yourself to ask for help." ] },
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

export default function NervousArticlePage() {
  const referenceQuiz = getQuizBySlug("memory", locale);
  if (!referenceQuiz) notFound();

  const articleTheme = {
    ...referenceQuiz.theme,
    id: "nervous-breakdown",
    colors: {
      ...referenceQuiz.theme.colors,
      page: "#2b1834",
      pageAlt: "#ee8a55",
      surface: "#fff8ed",
      surfaceRaised: "#f7e6d1",
      text: "#281b2d",
      muted: "#695b69",
      primary: "#d94e35",
      primaryText: "#fffaf2",
      border: "#8f4771",
      correct: "#3e765f",
      incorrect: "#a6344c",
    },
    header: {
      background: "linear-gradient(90deg, #321a3b, #71324f)",
      text: "#fff8e9",
      border: "#f3a33f",
      shadow: "0 8px 26px rgba(42, 22, 51, 0.34)",
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
          articleSlug="nervous"
          adNote="One short ad, then see the signs."
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="See The Signs →"
          disclaimer="General educational information only. “Nervous breakdown” is not a medical diagnosis, and these signs can have many mental or physical causes. Contact a qualified healthcare professional if you are struggling to cope. If you may harm yourself or someone else, cannot stay safe or there is immediate danger, call emergency services or go to an emergency department now."
          icon={(
            <img
              alt=""
              className="article-engine__nervous-icon"
              height="512"
              src="/article-icons/nervous-woman.png"
              width="512"
            />
          )}
          intro="The warning signs often appear before everything stops. See the 10 changes that can mean stress is pushing you past your limit."
          landingTitle={landingTitle}
          sectionCount={sections.length}
          showCtaIcon={false}
          socialProofCount="217,000+"
          socialProofLabel="read this today"
          sources={[
            { label: "NHS: symptoms of stress and where to get help", url: "https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/stress/" },
            { label: "NHS Every Mind Matters: dealing with stress", url: "https://www.nhs.uk/every-mind-matters/mental-health-issues/stress/" },
            { label: "NHS: where to get urgent mental health help", url: "https://www.nhs.uk/nhs-services/mental-health-services/where-to-get-urgent-help-for-mental-health/" },
            { label: "NHS: mental health services", url: "https://www.nhs.uk/nhs-services/mental-health-services/" },
          ]}
        />
      </ExperienceThemeBoundary>
    </SiteShell>
  );
}
