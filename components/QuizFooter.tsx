import type { Quiz, QuizFooterContent } from "@/lib/quizzes";
import type { Translations } from "@/lib/i18n";

type QuizFooterProps = {
  footer: QuizFooterContent;
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

export function QuizFooter({ footer, translations }: QuizFooterProps) {
  const template = translations.quizFooter;
  const skillIcons: InfoIconType[] = ["brain", "search", "bolt"];

  return (
    <section className="legacy-card quiz-info-panel">
      <div className="quiz-info-panel__intro">
        <span className="quiz-info-panel__icon quiz-info-panel__icon--primary">
          <InfoIcon type="building" />
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
          <h3>{template.howItWorksTitle}</h3>
          <p>{template.howItWorksBody}</p>
        </div>
        <div className="quiz-info-panel__column">
          <span className="quiz-info-panel__icon">
            <InfoIcon type="brain" />
          </span>
          <h3>{template.whatThisTestsTitle}</h3>
          <p>{template.whatThisTestsBody}</p>
          <ul className="quiz-info-panel__checks">
            {template.testBullets.map((bullet) => (
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
          <h3>{template.scoringTitle}</h3>
          <p>{template.scoringBody}</p>
        </div>
      </div>

      <div className="quiz-info-panel__notice">
        <span>
          <InfoIcon type="star" />
        </span>
        <strong>{template.passFailNotice}</strong>
      </div>

      <div className="quiz-info-panel__skills">
        {template.featureCards.slice(0, 3).map((card, index) => (
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
        <span aria-hidden="true">▶</span> {translations.quiz.restartTest}
      </button>
      <p className="quiz-info-panel__restart-note">{template.restartNote}</p>
    </section>
  );
}
