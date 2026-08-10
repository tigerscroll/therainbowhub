import type { Quiz, QuizFooterContent } from "@/lib/quizzes";
import type { Translations } from "@/lib/i18n";

type QuizFooterProps = {
  footer: QuizFooterContent;
  quizSlug: string;
  translations: Translations;
};

type InfoIconType = "building" | "path" | "brain" | "report" | "search" | "bolt" | "star";

function InfoIcon({ type }: { type: InfoIconType }) {
  if (type === "building") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M8 40h32M12 36V18m8 18V18m8 18V18m8 18V18M7 18h34L24 8 7 18Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.5"
        />
      </svg>
    );
  }

  if (type === "path") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 33c7-11 13 3 20-8s11-4 12-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
        <path
          d="M32 8v18m0-16h9l-3 4 3 4h-9"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.5"
        />
        <circle cx="8" cy="33" r="3" fill="currentColor" />
        <circle cx="28" cy="25" r="3" fill="currentColor" />
      </svg>
    );
  }

  if (type === "brain") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M19 10c-5 0-8 4-8 9-4 2-5 8-1 12-1 5 3 9 8 9 3 0 5-2 6-4 1 2 3 4 6 4 5 0 9-4 8-9 4-4 3-10-1-12 0-5-3-9-8-9-3 0-5 2-6 4-1-2-3-4-6-4Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.5"
        />
        <path d="M24 14v22M17 21h7m0 7h-7m14-7h-7m7 7h-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
      </svg>
    );
  }

  if (type === "report") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M13 6h17l7 7v29H13V6Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="3.5" />
        <path d="M29 6v9h8M18 24h10M18 31h7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
        <circle cx="34" cy="34" r="8" fill="white" stroke="currentColor" strokeWidth="3.5" />
        <path d="m30 34 3 3 6-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
      </svg>
    );
  }

  if (type === "search") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="21" cy="21" r="12" fill="none" stroke="currentColor" strokeWidth="3.5" />
        <path d="m30 30 10 10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
      </svg>
    );
  }

  if (type === "bolt") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M27 4 10 27h13l-2 17 17-24H25l2-16Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="3.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="m24 7 5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1 5-11Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
    </svg>
  );
}

export function getQuizFooterContent(quiz: Quiz): QuizFooterContent | null {
  if (quiz.footer) {
    return quiz.footer;
  }

  if (quiz.infoPanel) {
    return {
      aboutTitle: quiz.infoPanel.title,
      aboutText: quiz.infoPanel.intro,
    };
  }

  return null;
}

export function QuizFooter({ footer, quizSlug, translations }: QuizFooterProps) {
  const template = translations.quizFooter;
  const skillIcons: InfoIconType[] = ["brain", "search", "bolt"];
  const isParamedicQuiz = quizSlug === "paramedic";
  const isTrainQuiz = quizSlug === "train";
  const isBarristerQuiz = quizSlug === "barrister";
  const isChefQuiz = quizSlug === "chef";
  const isMechanicQuiz = quizSlug === "mechanic";
  const customFooter = isParamedicQuiz
    ? {
        icon: "bolt" as InfoIconType,
        howTitle: "From Arrival to Handover",
        howBody: "Every call presents four fast choices. Read the scene, identify the useful facts, and choose the clearest next step as the pressure builds.",
        testsTitle: "Skills On Call",
        testsBody: "The scenarios explore practical thinking and human skills that help a response team stay coordinated:",
        bullets: ["Scanning a scene before acting", "Communicating clearly and inclusively", "Prioritizing useful facts under pressure", "Supporting teammates and clean handovers", "Respecting scope and seeking support"],
        scoringTitle: "Your Response Profile",
        scoringBody: "Your entertainment-only result combines accuracy across awareness, communication, decision-making, and professional thinking. It is a challenge profile, not a clinical or employment assessment.",
        cards: [{ title: "Scene Awareness", body: "Spot risks and key details." }, { title: "Clear Communication", body: "Get and give usable information." }, { title: "Calm Decisions", body: "Choose practical next steps." }],
        restart: "Restart the shift from the first call.",
      }
    : isTrainQuiz
      ? {
          icon: "path" as InfoIconType,
          howTitle: "From Platform Scan to Final Run",
          howBody: "Every section presents four fast choices. Read the board, apply the stated rule, and keep the route clear as timing and signal clues become more demanding.",
          testsTitle: "Skills On The Route",
          testsBody: "The fictional railway scenarios explore the focus and logic needed to keep changing information organized:",
          bullets: ["Reading boards and spotting changes", "Working with time and route constraints", "Applying fictional signal rules exactly", "Sequencing checks in the correct order", "Prioritizing confirmed information under pressure"],
          scoringTitle: "Your Driver Focus Profile",
          scoringBody: "Your entertainment-only result combines attention, timing, route logic, signal rules, sequencing, and calm decisions. It is a challenge profile, not a railway qualification or recruitment result.",
          cards: [{ title: "Signal Focus", body: "Apply each stated rule." }, { title: "Timing & Routes", body: "Track time, stops, and direction." }, { title: "Calm Control", body: "Prioritize reliable information." }],
          restart: "Restart the run from the first platform.",
        }
      : isBarristerQuiz
        ? {
            icon: "building" as InfoIconType,
            howTitle: "From Case File to Final Hearing",
            howBody: "Every case presents four fast choices. Track the facts, test the argument, and choose the clearest response as the hearing becomes more demanding.",
            testsTitle: "Skills In Chambers",
            testsBody: "The fictional cases explore worldwide-friendly reasoning and advocacy skills with every special rule stated in the question:",
            bullets: ["Separating fact from assumption", "Following timelines and evidence details", "Testing argument structure", "Choosing precise, neutral questions", "Staying fair and composed under pressure"],
            scoringTitle: "Your Advocate Profile",
            scoringBody: "Your entertainment-only result combines evidence focus, language, logic, structure, and professional judgment. It is not legal education, career advice, certification, or a real barrister assessment.",
            cards: [{ title: "Evidence Focus", body: "Spot the fact that changes the case." }, { title: "Argument Logic", body: "Test reasons and conclusions." }, { title: "Calm Advocacy", body: "Choose clear, fair responses." }],
            restart: "Restart from the first case file.",
          }
        : isChefQuiz
          ? {
              icon: "star" as InfoIconType,
              howTitle: "From Prep List to Final Service",
              howBody: "Every station presents four fast choices. Read the order, control the timing, and keep service moving as the kitchen pressure rises.",
              testsTitle: "Skills In The Kitchen",
              testsBody: "The fictional kitchen scenarios use globally readable terms and metric quantities to explore practical thinking:",
              bullets: ["Planning prep in a useful order", "Tracking ingredients and ratios", "Coordinating timing and heat", "Communicating clear kitchen updates", "Protecting hygiene and quality under pressure"],
              scoringTitle: "Your Chef Profile",
              scoringBody: "Your entertainment-only result combines preparation, timing, ingredient focus, communication, and calm decisions. It is not culinary training, food-safety guidance, certification, or an employment assessment.",
              cards: [{ title: "Prep Control", body: "Plan the work before service." }, { title: "Timing & Ratios", body: "Keep quantities and clocks aligned." }, { title: "Service Focus", body: "Stay clear when orders build." }],
              restart: "Restart service from the first prep list.",
            }
          : isMechanicQuiz
            ? {
                icon: "bolt" as InfoIconType,
                howTitle: "From Workshop Scan to Final Repair",
                howBody: "Every bay presents four fast choices. Read the job card, spot the useful detail, and trace the fault as the workshop pressure builds.",
                testsTitle: "Skills In The Workshop",
                testsBody: "The fictional scenarios use worldwide-friendly language and self-contained rules to explore practical mechanic-style thinking:",
                bullets: ["Matching tools and parts to a stated job", "Reading measurements and simple ratios", "Following repair sequences exactly", "Tracing faults from clear evidence", "Giving calm, useful workshop handovers"],
                scoringTitle: "Your Mechanic Profile",
                scoringBody: "Your entertainment-only result combines observation, tool knowledge, measurement, fault logic, communication, and calm judgment. It is not repair advice, safety guidance, professional training, certification, or an employment assessment.",
                cards: [{ title: "Tools & Detail", body: "Spot the part or tool that matters." }, { title: "Measure & Sequence", body: "Keep values and steps in order." }, { title: "Fault Logic", body: "Follow the evidence to the cause." }],
                restart: "Restart from the first workshop scan.",
              }
          : null;
  const howItWorksTitle = customFooter?.howTitle ?? template.howItWorksTitle;
  const howItWorksBody = customFooter?.howBody ?? template.howItWorksBody;
  const whatThisTestsTitle = customFooter?.testsTitle ?? template.whatThisTestsTitle;
  const whatThisTestsBody = customFooter?.testsBody ?? template.whatThisTestsBody;
  const testBullets = customFooter?.bullets ?? template.testBullets;
  const scoringTitle = customFooter?.scoringTitle ?? template.scoringTitle;
  const scoringBody = customFooter?.scoringBody ?? template.scoringBody;
  const featureCards = customFooter?.cards ?? template.featureCards.slice(0, 3);

  return (
    <section className="legacy-card quiz-info-panel">
      <div className="quiz-info-panel__intro">
        <span className="quiz-info-panel__icon quiz-info-panel__icon--primary">
          <InfoIcon type={customFooter?.icon ?? "building"} />
        </span>
        <div>
          <h2>{footer.aboutTitle}</h2>
          <p>{footer.aboutText}</p>
        </div>
      </div>

      <div className="quiz-info-panel__columns">
        <div className="quiz-info-panel__column">
          <span className="quiz-info-panel__icon">
            <InfoIcon type="path" />
          </span>
          <h3>{howItWorksTitle}</h3>
          <p>{howItWorksBody}</p>
        </div>
        <div className="quiz-info-panel__column">
          <span className="quiz-info-panel__icon">
            <InfoIcon type="brain" />
          </span>
          <h3>{whatThisTestsTitle}</h3>
          <p>{whatThisTestsBody}</p>
          <ul className="quiz-info-panel__checks">
            {testBullets.map((bullet) => (
              <li key={bullet}>
                <span aria-hidden="true">✓</span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="quiz-info-panel__scoring">
        <span className="quiz-info-panel__icon quiz-info-panel__icon--purple">
          <InfoIcon type="report" />
        </span>
        <div>
          <h3>{scoringTitle}</h3>
          <p>{scoringBody}</p>
        </div>
      </div>

      <div className="quiz-info-panel__skills">
        {featureCards.map((card, index) => (
          <div key={card.title} className={`quiz-info-panel__skill quiz-info-panel__skill--${index + 1}`}>
            <span className="quiz-info-panel__skill-icon">
              <InfoIcon type={skillIcons[index] || "star"} />
            </span>
            <strong>{card.title}</strong>
            <small>{card.body}</small>
          </div>
        ))}
      </div>

      <button type="button" data-action="restart" className="legacy-primary legacy-restart">
        <span aria-hidden="true">↻</span> {translations.quiz.restartTest}
      </button>
      <p className="quiz-info-panel__restart-note">
        {customFooter?.restart ?? template.restartNote}
      </p>
    </section>
  );
}
