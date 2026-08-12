"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { SupportedLocale, Translations } from "@/lib/i18n";
import type { Quiz, QuizQuestion } from "@/lib/quizzes";
import { siteConfig } from "@/lib/siteConfig";
import { requestRewardedAd } from "./rewardedAds";
import { scoreQuiz, type QuizAnswers } from "./scoring";

type QuizEngineProps = {
  locale: SupportedLocale;
  quiz: Quiz;
  translations: Translations;
};

type QuizScreen = "landing" | "question" | "checkpoint" | "results";
type SavedScreen = Exclude<QuizScreen, "landing">;

type SavedProgress = {
  version: 2;
  signature: string;
  answers: QuizAnswers;
  questionIndex: number;
  completedStage: number;
  screen: SavedScreen;
  updatedAt: string;
};

const STORAGE_VERSION = 2;

function trackQuizEvent(name: string, quiz: Quiz, locale: SupportedLocale) {
  if (typeof window === "undefined") return;
  window.fbq?.("trackCustom", name, { quiz_slug: quiz.slug, locale });
}

type QuestionRendererProps = {
  answer?: number;
  feedback: Quiz["engine"]["flow"]["feedback"];
  onAnswer: (choiceIndex: number) => void;
  question: QuizQuestion;
};

function ChoiceQuestion({
  answer,
  feedback,
  onAnswer,
  question,
}: QuestionRendererProps) {
  return (
    <div className={`quiz-engine__answers quiz-engine__answers--${question.presentation}`} role={question.presentation === "scale" ? "radiogroup" : undefined}>
      {question.choices.map((choice, index) => {
        const selected = answer === index;
        const revealCorrectness = feedback === "instant" && answer !== undefined && question.answerIndex !== undefined;
        const correct = revealCorrectness && index === question.answerIndex;
        const incorrect = revealCorrectness && selected && index !== question.answerIndex;

        return (
          <button
            aria-checked={question.presentation === "scale" ? selected : undefined}
            className="quiz-engine__answer"
            data-correct={correct || undefined}
            data-incorrect={incorrect || undefined}
            data-selected={selected || undefined}
            disabled={answer !== undefined}
            key={`${choice}-${index}`}
            onClick={() => onAnswer(index)}
            role={question.presentation === "scale" ? "radio" : undefined}
            type="button"
          >
            {question.presentation === "icons" ? <span className="quiz-engine__answer-icon" aria-hidden="true">{question.icons?.[index]}</span> : null}
            {question.presentation === "text" ? <span>{String.fromCharCode(65 + index)}</span> : null}
            {question.presentation === "scale" ? <span className="quiz-engine__scale-dot" aria-hidden="true" /> : null}
            <strong>{choice}</strong>
          </button>
        );
      })}
    </div>
  );
}

function MemoryCueQuestion({ answer, onAnswer, question }: QuestionRendererProps) {
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), 2000);
    return () => window.clearTimeout(timer);
  }, [question.id]);

  return (
    <div className="quiz-engine__memory">
      <div className="quiz-engine__memory-items" aria-label={question.memoryItems?.join(", ")}>
        {question.memoryItems?.map((item) => <strong key={item}>{item}</strong>)}
      </div>
      <button className="quiz-engine__primary" disabled={!ready || answer !== undefined} onClick={() => onAnswer(0)} type="button">
        {question.continueLabel}
      </button>
    </div>
  );
}

function QuestionRenderer(props: QuestionRendererProps) {
  return props.question.presentation === "memory-cue" ? <MemoryCueQuestion {...props} /> : <ChoiceQuestion {...props} />;
}

function SocialProof({ avatars, text }: { avatars: string[]; text: string }) {
  const availableAvatars = avatars ?? [];
  const count = text.match(/\d[\d\s,.\u00a0'’]*\+?/);
  const start = count?.index ?? 0;
  const end = start + (count?.[0].length ?? text.length);

  return (
    <div className="quiz-engine__social">
      {availableAvatars.length ? (
        <div aria-hidden="true" className="quiz-engine__avatars">
          {availableAvatars.map((avatar, index) => (
            <span key={index} style={{ backgroundImage: `url(${avatar})` }} />
          ))}
        </div>
      ) : null}
      <div className="quiz-engine__social-text">
        {start > 0 ? <span>{text.slice(0, start)}</span> : null}
        <strong>{text.slice(start, end)}</strong>
        {end < text.length ? <span>{text.slice(end)}</span> : null}
      </div>
    </div>
  );
}

function QuizAbout({ label, onRestart, quiz, title }: { label?: string; onRestart?: () => void; quiz: Quiz; title: string }) {
  if (!quiz.footer) return null;
  return (
    <aside className="quiz-engine__about">
      <h2>{title}</h2>
      {quiz.footer.topicText ? <p>{quiz.footer.topicText}</p> : null}
      <p>{quiz.footer.aboutText}</p>
      {onRestart && label ? <button className="quiz-engine__secondary quiz-engine__about-restart" onClick={onRestart} type="button">{label}</button> : null}
    </aside>
  );
}

function safeSavedProgress(raw: unknown, quiz: Quiz, signature: string): SavedProgress | null {
  if (!raw || typeof raw !== "object") return null;
  const saved = raw as Partial<SavedProgress>;
  if (saved.version !== STORAGE_VERSION || saved.signature !== signature) return null;
  if (!Number.isInteger(saved.questionIndex) || saved.questionIndex! < 0 || saved.questionIndex! >= quiz.questions.length) return null;
  if (!Number.isInteger(saved.completedStage) || saved.completedStage! < 0 || saved.completedStage! >= quiz.stages.length) return null;
  if (!saved.screen || !["question", "checkpoint", "results"].includes(saved.screen)) return null;

  const answers: QuizAnswers = {};
  if (saved.answers && typeof saved.answers === "object") {
    quiz.questions.forEach((question) => {
      const answer = saved.answers?.[question.id];
      if (Number.isInteger(answer) && answer! >= 0 && answer! < question.choices.length) answers[question.id] = answer!;
    });
  }

  return { ...saved, answers } as SavedProgress;
}

export function QuizEngine({ locale, quiz, translations }: QuizEngineProps) {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [completedStage, setCompletedStage] = useState(0);
  const [screen, setScreen] = useState<QuizScreen>("landing");
  const [hydrated, setHydrated] = useState(false);
  const [adBusy, setAdBusy] = useState(false);
  const adRequestActive = useRef(false);

  const progressSignature = useMemo(
    () => quiz.questions.map((question) => JSON.stringify([
      question.id,
      question.presentation,
      question.choices,
      question.memoryItems,
      question.answerIndex,
      question.calibrationValues,
      question.choiceProfileIds,
      question.choiceWeights,
    ])).join("|"),
    [quiz.questions],
  );
  const storageKey = `rainbowhub:quiz-progress:v${STORAGE_VERSION}:${quiz.slug}:${locale}`;
  const currentQuestion = quiz.questions[questionIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const currentStage = currentQuestion?.stage ?? 0;
  const stageQuestions = quiz.questions.filter((question) => question.stage === currentStage);
  const stageQuestionIndex = Math.max(0, stageQuestions.findIndex((question) => question.id === currentQuestion?.id));
  const progress = stageQuestions.length ? Math.round(((stageQuestionIndex + 1) / stageQuestions.length) * 100) : 0;
  const result = useMemo(() => scoreQuiz(quiz, answers), [answers, quiz]);

  useLayoutEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      const saved = stored ? safeSavedProgress(JSON.parse(stored), quiz, progressSignature) : null;
      if (saved) {
        setAnswers(saved.answers);
        setQuestionIndex(saved.questionIndex);
        setCompletedStage(saved.completedStage);
        setScreen(saved.screen);
      } else if (stored) {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      try { window.localStorage.removeItem(storageKey); } catch { /* Storage can be unavailable in private contexts. */ }
    } finally {
      setHydrated(true);
      document.documentElement.classList.remove("quiz-resuming");
      document.documentElement.style.removeProperty("background");
      document.body.style.removeProperty("background");
    }
  }, [progressSignature, quiz, storageKey]);

  useEffect(() => {
    if (!hydrated || screen === "landing") return;
    const saved: SavedProgress = {
      version: STORAGE_VERSION,
      signature: progressSignature,
      answers,
      questionIndex,
      completedStage,
      screen,
      updatedAt: new Date().toISOString(),
    };
    try { window.localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { /* The quiz still works if storage is blocked. */ }
  }, [answers, completedStage, hydrated, progressSignature, questionIndex, screen, storageKey]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  async function runRewardedGate(onComplete: () => void) {
    if (adRequestActive.current) return;
    adRequestActive.current = true;
    setAdBusy(true);
    let outcome;
    try {
      outcome = await requestRewardedAd({
        adUnitPath: siteConfig.rewardedAdUnitPath,
        attempts: quiz.engine.rewarded.attempts,
      });
    } catch {
      adRequestActive.current = false;
      setAdBusy(false);
      return;
    }

    adRequestActive.current = false;
    if (outcome === "closed") {
      setAdBusy(false);
      return;
    }

    flushSync(() => {
      onComplete();
      setAdBusy(false);
    });
    scrollToTop();
  }

  function moveForward() {
    const nextIndex = questionIndex + 1;
    if (nextIndex >= quiz.questions.length) {
      setCompletedStage(currentStage);
      setScreen("checkpoint");
      scrollToTop();
      return;
    }

    const nextQuestion = quiz.questions[nextIndex];
    setQuestionIndex(nextIndex);
    if (quiz.engine.flow.type === "staged" && nextQuestion.stage !== currentStage) {
      setCompletedStage(currentStage);
      setScreen("checkpoint");
    } else {
      setScreen("question");
    }
    scrollToTop();
  }

  useEffect(() => {
    if (screen !== "question" || selectedAnswer === undefined || quiz.engine.flow.advance !== "automatic") return;
    const delay = currentQuestion.advanceDelayMs ?? quiz.engine.advanceDelayMs;
    const timer = window.setTimeout(moveForward, quiz.engine.flow.feedback === "instant" ? 800 : delay);
    return () => window.clearTimeout(timer);
    // moveForward intentionally uses the current question state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnswer, screen, currentQuestion?.advanceDelayMs, quiz.engine.advanceDelayMs]);

  function answerQuestion(choiceIndex: number) {
    if (!currentQuestion || selectedAnswer !== undefined) return;
    setAnswers((current) => ({ ...current, [currentQuestion.id]: choiceIndex }));
  }

  function beginQuiz() {
    setScreen("question");
    trackQuizEvent("QuizStart", quiz, locale);
  }

  function startQuiz() {
    if (quiz.engine.rewarded.start) void runRewardedGate(beginQuiz);
    else beginQuiz();
  }

  function continueAfterCheckpoint() {
    const isFinalStage = completedStage >= quiz.stages.length - 1;
    const next = () => {
      if (isFinalStage) {
        setScreen("results");
        trackQuizEvent("QuizComplete", quiz, locale);
      } else {
        setScreen("question");
      }
    };
    if (quiz.engine.rewarded.stages) void runRewardedGate(next);
    else next();
  }

  function restartQuiz() {
    try { window.localStorage.removeItem(storageKey); } catch { /* Storage can be unavailable. */ }
    setAnswers({});
    setQuestionIndex(0);
    setCompletedStage(0);
    setScreen("landing");
    scrollToTop();
  }

  if (screen === "landing") {
    return (
      <>
      <section className="quiz-engine__landing">
        <div className="quiz-engine__landing-copy">
          <div aria-hidden="true" className="quiz-engine__landing-badge"><span>{quiz.cardIcon}</span></div>
          <span className="quiz-engine__eyebrow">{quiz.eyebrow}</span>
          <h1>{quiz.title}</h1>
          <p className="quiz-engine__lede">{quiz.summary}</p>
          <div className="quiz-engine__landing-meta">
            <span>{quiz.duration}</span>
          </div>
          <p className="quiz-engine__quick-start">{quiz.landing.quickStartText}</p>
          {quiz.landing.socialProof ? <SocialProof avatars={quiz.landing.socialAvatars} text={quiz.landing.socialProof} /> : null}
          <button className="quiz-engine__primary" disabled={adBusy} onClick={startQuiz} type="button">
            <span aria-hidden="true" className="quiz-engine__primary-icon">▶</span>
            {adBusy ? translations.ad.loading : quiz.landing.ctaLabel ?? translations.quiz.startTest}
          </button>
          {quiz.engine.rewarded.start ? <p className="quiz-engine__ad-note"><span>✓</span>{translations.ad.startNote}</p> : null}
        </div>
        {quiz.theme.artwork?.landing ? (
          <div className="quiz-engine__landing-art" aria-hidden="true">
            <img alt="" src={quiz.theme.artwork.landing} />
          </div>
        ) : (
          <div className="quiz-engine__landing-symbol" aria-hidden="true">
            {quiz.theme.artwork?.icon ?? quiz.cardIcon}
          </div>
        )}
      </section>
      <QuizAbout quiz={quiz} title={translations.quiz.aboutTitle} />
      </>
    );
  }

  if (screen === "checkpoint") {
    const isFinalStage = completedStage >= quiz.stages.length - 1;
    const checkpoint = quiz.checkpoint;
    const reveal = checkpoint?.reveals[completedStage];
    const revealKey = reveal?.signal === "trend" ? result.trend : reveal?.signal === "consistency" ? result.consistency : "fixed";
    const revealMessage = reveal?.signal === "fixed" ? reveal.message : reveal?.variants?.[revealKey];
    return (
      <>
      <section className="quiz-engine__checkpoint quiz-engine__card">
        <span className="quiz-engine__eyebrow">{isFinalStage && checkpoint ? checkpoint.finalBadge : translations.results.stageComplete}</span>
        <div className="quiz-engine__checkpoint-icon" aria-hidden="true">{isFinalStage ? "✦" : "✓"}</div>
        <h2>{isFinalStage && checkpoint ? checkpoint.finalTitle : quiz.stages[completedStage]}</h2>
        {isFinalStage && checkpoint ? <p>{checkpoint.finalCopy}</p> : quiz.engine.checkpoint !== "ai" ? <p>{quiz.stageEncouragement[completedStage]}</p> : null}
        {quiz.engine.checkpoint === "ai" && checkpoint ? (
          <div className="quiz-engine__ai-panel">
            <div className="quiz-engine__ai-top"><span aria-hidden="true" /><strong>{reveal?.title}</strong></div>
            <p>{revealMessage}</p>
          </div>
        ) : null}
        {isFinalStage && checkpoint ? (
          <ul className="quiz-engine__checklist">
            {checkpoint.finalChecklist.map((item) => <li key={item}><span>✓</span>{item}</li>)}
          </ul>
        ) : null}
        {!isFinalStage ? (
          <div className="quiz-engine__checkpoint-next">
            <span>{checkpoint?.nextPrefix ?? translations.results.nextStage}</span>
            <strong>{quiz.stages[completedStage + 1]}</strong>
          </div>
        ) : null}
        <button className="quiz-engine__primary" disabled={adBusy} onClick={continueAfterCheckpoint} type="button">
          {adBusy ? translations.ad.loading : isFinalStage && checkpoint ? checkpoint.finalButton : translations.quiz.continue}
        </button>
        {!isFinalStage && quiz.engine.rewarded.stages && checkpoint ? <p className="quiz-engine__checkpoint-ad-note">{checkpoint.adNote}</p> : null}
      </section>
      <QuizAbout label={translations.quiz.restartTest} onRestart={restartQuiz} quiz={quiz} title={translations.quiz.aboutTitle} />
      </>
    );
  }

  if (screen === "results") {
    const estimate = quiz.result.estimate;
    const consistency = estimate?.consistencyLabels[result.consistency];
    return (
      <>
      <section className="quiz-engine__results quiz-engine__card">
        <div className="quiz-engine__result-icon" aria-hidden="true">
          {quiz.theme.artwork?.icon ?? quiz.cardIcon}
        </div>
        <span className="quiz-engine__eyebrow">{estimate?.eyebrow ?? quiz.result.profileName}</span>
        {result.estimatedAge !== undefined ? <div className="quiz-engine__result-age"><strong>{result.estimatedAge}</strong><span>{estimate?.ageSuffix}</span></div> : null}
        <h2>{result.profile.title}</h2>
        {estimate ? (
          <dl className="quiz-engine__result-signals">
            <div><dt>{estimate.strongestSignal}</dt><dd>{result.strongestSignal}</dd></div>
            <div><dt>{estimate.wildcard}</dt><dd>{result.wildcard}</dd></div>
            <div><dt>{estimate.consistency}</dt><dd>{consistency}</dd></div>
          </dl>
        ) : <p className="quiz-engine__result-tier">{result.profile.tier}</p>}
        <p className="quiz-engine__result-copy">{result.profile.copy}</p>
        {!estimate ? <div className="quiz-engine__result-summary" data-single={quiz.engine.scoring.type === "weighted-profile" || undefined}>
          {quiz.engine.scoring.type === "correct-answer" ? <div>
            <strong>{result.answered}/{result.total}</strong>
            <span>{translations.quiz.finalScore}</span>
          </div> : null}
          <div>
            <strong>{result.profile.percentile}</strong>
            <span>{translations.quiz.profile}</span>
          </div>
        </div> : null}
        {!estimate && Object.keys(result.dimensionScores).length ? (
          <div className="quiz-engine__dimensions">
            {Object.entries(result.dimensionScores).map(([label, value]) => (
              <div className="quiz-engine__dimension" key={label}>
                <div><span>{label}</span><strong>{value}%</strong></div>
                <i><b style={{ width: `${value}%` }} /></i>
              </div>
            ))}
          </div>
        ) : null}
        {estimate ? <p className="quiz-engine__disclaimer">{estimate.disclaimer}</p> : null}
        <button className="quiz-engine__secondary" onClick={restartQuiz} type="button">
          {translations.quiz.restartTest}
        </button>
      </section>
      <QuizAbout label={translations.quiz.restartTest} onRestart={restartQuiz} quiz={quiz} title={translations.quiz.aboutTitle} />
      </>
    );
  }

  return (
    <>
    <section className="quiz-engine__question-shell">
      <div className="quiz-engine__progress-head">
        <span>{translations.quiz.round} {currentStage + 1}</span>
        <strong>{quiz.stages[currentStage]}</strong>
      </div>
      <div className="quiz-engine__progress" aria-label={`${progress}% ${translations.results.complete}`}>
        <i style={{ width: `${progress}%` }} />
      </div>
      <article className="quiz-engine__question quiz-engine__card">
        <h1>{currentQuestion.prompt}</h1>
        <QuestionRenderer
          answer={selectedAnswer}
          feedback={quiz.engine.flow.feedback}
          onAnswer={answerQuestion}
          question={currentQuestion}
        />
        {selectedAnswer !== undefined && quiz.engine.flow.feedback === "instant" && currentQuestion.explanation ? (
          <p className="quiz-engine__explanation">{currentQuestion.explanation}</p>
        ) : null}
        {selectedAnswer !== undefined && quiz.engine.flow.advance === "manual" ? (
          <button className="quiz-engine__primary" onClick={moveForward} type="button">
            {questionIndex === quiz.questions.length - 1 ? translations.results.viewResults : translations.quiz.continue}
          </button>
        ) : null}
      </article>
    </section>
    <QuizAbout label={translations.quiz.restartTest} onRestart={restartQuiz} quiz={quiz} title={translations.quiz.aboutTitle} />
    </>
  );
}
