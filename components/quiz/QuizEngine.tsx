"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";

import type { SupportedLocale, Translations } from "@/lib/i18n";
import type { Quiz, QuizQuestion } from "@/lib/quizzes";
import { siteConfig } from "@/lib/siteConfig";
import { getStageCompletionPercentage } from "./engineState";
import { requestRewardedAd } from "./rewardedAds";
import { getQuizStorageKey, isProgressTimestampFresh, STORAGE_VERSION } from "./progressStorage";
import { scoreQuiz, type QuizAnswers } from "./scoring";

type QuizEngineProps = {
  locale: SupportedLocale;
  quiz: Quiz;
  translations: Translations;
};

type QuizScreen = "landing" | "question" | "checkpoint" | "results";
type SavedScreen = Exclude<QuizScreen, "landing">;

type SavedProgress = {
  version: 3;
  signature: string;
  answers: QuizAnswers;
  questionIndex: number;
  completedStage: number;
  screen: SavedScreen;
  studiedQuestions?: string[];
  updatedAt: string;
};

function trackQuizEvent(name: string, quiz: Quiz, locale: SupportedLocale) {
  if (typeof window === "undefined") return;
  window.fbq?.("trackCustom", name, { quiz_slug: quiz.slug, locale });
}

type QuestionRendererProps = {
  answer?: number;
  feedback: Quiz["engine"]["flow"]["feedback"];
  onAnswer: (choiceIndex: number) => void;
  onStudyComplete: () => void;
  question: QuizQuestion;
  studyComplete: boolean;
};

function QuestionVisual({ question }: { question: QuizQuestion }) {
  const visual = question.visual;
  if (!visual) return null;

  const columnCount = visual.columns
    ?? (question.presentation === "code" ? Math.min(visual.items.length, 2) : visual.items.length);
  const isVerboseSequence = question.presentation === "sequence"
    && (
      visual.items.some((item) => item.length > 18)
      || (visual.items.length >= 4 && visual.items.some((item) => item.length > 10))
      || visual.items.join("").length > 42
    );
  const isCompactSequence = question.presentation === "sequence"
    && visual.items.every((item) => item.length <= 7);
  const isMathSequence = question.presentation === "sequence" && visual.separator === "+";
  const isDenseSequence = question.presentation === "sequence" && visual.items.length >= 4;
  const needsMobileTwoColumns = question.presentation !== "sequence"
    && question.presentation !== "code"
    && columnCount >= 4
    && visual.items.some((item) => item.length > 6);
  const hasUnbalancedLastTile = columnCount === 2 && visual.items.length % 2 === 1;
  const visualStyle = {
    "--quiz-visual-columns": Math.max(1, columnCount),
  } as CSSProperties;

  return (
    <div
      aria-label={visual.ariaLabel}
      className={`quiz-engine__visual quiz-engine__visual--${question.presentation}${isVerboseSequence ? " quiz-engine__visual--verbose-sequence" : ""}${isCompactSequence ? " quiz-engine__visual--compact-sequence" : ""}${isMathSequence ? " quiz-engine__visual--math-sequence" : ""}${isDenseSequence ? " quiz-engine__visual--dense-sequence" : ""}${needsMobileTwoColumns ? " quiz-engine__visual--mobile-two-columns" : ""}${hasUnbalancedLastTile ? " quiz-engine__visual--balanced-last-tile" : ""}`}
      style={visualStyle}
    >
      {visual.items.map((item, index) => (
        <span key={`${item}-${index}`}>
          <strong>{item}</strong>
          {question.presentation === "sequence" && index < visual.items.length - 1 ? <i aria-hidden="true">{visual.separator ?? "→"}</i> : null}
        </span>
      ))}
    </div>
  );
}

function ChoiceQuestion({
  answer,
  feedback,
  onAnswer,
  question,
}: QuestionRendererProps) {
  return (
    <>
    <QuestionVisual question={question} />
    <div className={`quiz-engine__answers quiz-engine__answers--${question.presentation}`} role={question.presentation === "scale" ? "radiogroup" : undefined}>
      {question.choices.map((choice, index) => {
        const selected = answer === index;
        const icon = question.icons?.[index];
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
            key={`${question.id}-${index}`}
            onClick={(event) => {
              // Mobile Safari can preserve focus/hover paint on a tapped button
              // while React advances. Blur before updating so interaction state
              // cannot visually leak into the next question.
              event.currentTarget.blur();
              onAnswer(index);
            }}
            role={question.presentation === "scale" ? "radio" : undefined}
            type="button"
          >
            {question.presentation === "icons" ? (
              <span className="quiz-engine__answer-icon" aria-hidden="true">
                {typeof icon === "string" && icon.startsWith("/quizzes/")
                  ? <img alt="" decoding="async" src={icon} />
                  : icon}
              </span>
            ) : null}
            {question.presentation !== "icons" && question.presentation !== "scale" ? <span>{String.fromCharCode(65 + index)}</span> : null}
            {question.presentation === "scale" ? <span className="quiz-engine__scale-dot" aria-hidden="true" /> : null}
            <strong>{choice}</strong>
          </button>
        );
      })}
    </div>
    </>
  );
}

function StudyCue({ onStudyComplete, question }: QuestionRendererProps) {
  const [ready, setReady] = useState(false);
  const study = question.study!;

  useLayoutEffect(() => {
    if (study.mode === "manual") {
      setReady(true);
      return;
    }
    setReady(false);
    const timer = window.setTimeout(() => {
      setReady(true);
      onStudyComplete();
    }, study.durationMs);
    return () => window.clearTimeout(timer);
    // The cue is restarted only when its content changes, not when the parent rerenders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, study.durationMs, study.mode]);

  return (
    <div className={`quiz-engine__study quiz-engine__study--${study.presentation}`}>
      {study.mode === "automatic" ? (
        <div aria-hidden="true" className="quiz-engine__study-progress">
          <i style={{ animationDuration: `${study.durationMs}ms` }} />
        </div>
      ) : null}
      {study.instruction ? <p>{study.instruction}</p> : null}
      <div className="quiz-engine__study-items" aria-label={study.ariaLabel ?? study.items.join(", ")}>
        {study.items.map((item, index) => <strong key={`${item}-${index}`}>{item}</strong>)}
      </div>
      {study.mode === "manual" ? (
        <button className="quiz-engine__primary" disabled={!ready} onClick={onStudyComplete} type="button">
          {study.continueLabel}
        </button>
      ) : <span className="quiz-engine__study-timer" aria-live="polite">{ready ? "" : "•••"}</span>}
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
  if (props.question.study && !props.studyComplete) return <StudyCue {...props} />;
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
  const topicParagraphs = quiz.footer.topicText?.split(/\n\s*\n/).filter(Boolean) ?? [];
  const aboutParagraphs = quiz.footer.aboutText.split(/\n\s*\n/).filter(Boolean);
  return (
    <aside className="quiz-engine__about">
      <h2>{title}</h2>
      {topicParagraphs.map((paragraph, index) => <p key={`topic-${index}`}>{paragraph}</p>)}
      {quiz.footer.howToPlay ? (
        <section className="quiz-engine__how-to-play">
          <h3>{quiz.footer.howToPlay.title}</h3>
          <ol>
            {quiz.footer.howToPlay.steps.map((step, index) => (
              <li key={step}>
                <span aria-hidden="true">{index + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      {aboutParagraphs.map((paragraph, index) => <p className="quiz-engine__about-disclaimer" key={`about-${index}`}>{paragraph}</p>)}
      {onRestart && label ? <button className="quiz-engine__secondary quiz-engine__about-restart" onClick={onRestart} type="button">{label}</button> : null}
    </aside>
  );
}

function safeSavedProgress(raw: unknown, quiz: Quiz, signature: string): SavedProgress | null {
  if (!raw || typeof raw !== "object") return null;
  const saved = raw as Partial<SavedProgress>;
  if (saved.version !== STORAGE_VERSION || saved.signature !== signature) return null;
  if (!isProgressTimestampFresh(saved.updatedAt)) return null;
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
  const [screen, setScreen] = useState<QuizScreen>(() => quiz.engine.startOnLoad ? "question" : "landing");
  const [hydrated, setHydrated] = useState(false);
  const [adBusy, setAdBusy] = useState(false);
  const [startPromptOpen, setStartPromptOpen] = useState(false);
  const [studiedQuestions, setStudiedQuestions] = useState<string[]>([]);
  const adRequestActive = useRef(false);
  const adRequestController = useRef<AbortController | null>(null);
  const adRequestGeneration = useRef(0);

  const progressSignature = useMemo(
    () => JSON.stringify({
      engine: {
        flow: quiz.engine.flow,
        scoring: quiz.engine.scoring,
        startOnLoad: quiz.engine.startOnLoad,
        targetRatio: quiz.engine.targetRatio,
        estimate: quiz.engine.estimate,
        derivedScore: quiz.engine.derivedScore,
        tieBreaks: quiz.engine.tieBreaks,
        match: quiz.engine.match,
      },
      stages: quiz.stages,
      questions: quiz.questions.map((question) => [
        question.id,
        question.stage,
        question.presentation,
        question.context,
        question.visual,
        question.prompt,
        question.choices,
        question.icons,
        question.memoryItems,
        question.study ? [question.study.presentation, question.study.items, question.study.durationMs, question.study.mode] : null,
        question.answerIndex,
        question.calibrationValues,
        question.choiceProfileIds,
        question.choiceWeights,
        question.category,
        question.reasoningSteps,
      ]),
      results: {
        profiles: quiz.result.profiles.map((profile) => [profile.id, profile.minRatio]),
        dimensions: quiz.result.scoreDimensions,
      },
    }),
    [quiz],
  );
  const storageKey = getQuizStorageKey(quiz.slug, locale);
  const currentQuestion = quiz.questions[questionIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const studyComplete = currentQuestion ? studiedQuestions.includes(currentQuestion.id) : true;
  const currentStage = currentQuestion?.stage ?? 0;
  const stageQuestions = quiz.questions.filter((question) => question.stage === currentStage);
  const stageQuestionIndex = Math.max(0, stageQuestions.findIndex((question) => question.id === currentQuestion?.id));
  const progress = getStageCompletionPercentage(quiz.questions, answers, currentStage);
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
        setStudiedQuestions((saved.studiedQuestions ?? []).filter((id) => quiz.questions.some((question) => question.id === id && question.study)));
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
      studiedQuestions,
      updatedAt: new Date().toISOString(),
    };
    try { window.localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { /* The quiz still works if storage is blocked. */ }
  }, [answers, completedStage, hydrated, progressSignature, questionIndex, screen, storageKey, studiedQuestions]);

  useEffect(() => () => {
    adRequestGeneration.current += 1;
    adRequestController.current?.abort();
  }, []);

  useEffect(() => {
    if (!startPromptOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [startPromptOpen]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "auto" });
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }

  async function runRewardedGate(onComplete: () => void) {
    if (adRequestActive.current) return;
    const generation = ++adRequestGeneration.current;
    const controller = new AbortController();
    adRequestController.current = controller;
    adRequestActive.current = true;
    setAdBusy(true);
    let outcome;
    try {
      outcome = await requestRewardedAd({
        adUnitPath: siteConfig.rewardedAdUnitPath,
        attempts: quiz.engine.rewarded.attempts,
        signal: controller.signal,
      });
    } catch {
      if (generation !== adRequestGeneration.current) return;
      adRequestController.current = null;
      adRequestActive.current = false;
      setAdBusy(false);
      return;
    }

    if (generation !== adRequestGeneration.current) return;
    adRequestController.current = null;
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

  function completeStudy() {
    if (!currentQuestion?.study) return;
    setStudiedQuestions((current) => current.includes(currentQuestion.id) ? current : [...current, currentQuestion.id]);
    scrollToTop();
  }

  function beginQuiz() {
    setStartPromptOpen(false);
    setScreen("question");
    trackQuizEvent("QuizStart", quiz, locale);
  }

  function startQuiz() {
    if (quiz.engine.rewarded.start && quiz.landing.startPrompt) setStartPromptOpen(true);
    else if (quiz.engine.rewarded.start) void runRewardedGate(beginQuiz);
    else beginQuiz();
  }

  function confirmStartQuiz() {
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
    adRequestGeneration.current += 1;
    adRequestController.current?.abort();
    adRequestController.current = null;
    adRequestActive.current = false;
    try { window.localStorage.removeItem(storageKey); } catch { /* Storage can be unavailable. */ }
    setAdBusy(false);
    setStartPromptOpen(false);
    setAnswers({});
    setQuestionIndex(0);
    setCompletedStage(0);
    setStudiedQuestions([]);
    setScreen(quiz.engine.startOnLoad ? "question" : "landing");
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
          {quiz.landing.infoBadge ? <p className="quiz-engine__info-badge">{quiz.landing.infoBadge}</p> : null}
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
      {startPromptOpen && quiz.landing.startPrompt ? (
        <div className="quiz-engine__reward-prompt" role="presentation">
          <section aria-labelledby="quiz-reward-prompt-title" aria-modal="true" className="quiz-engine__reward-prompt-card quiz-engine__card" role="dialog">
            <span className="quiz-engine__eyebrow">{quiz.landing.startPrompt.eyebrow}</span>
            <div className="quiz-engine__reward-prompt-icon" aria-hidden="true">{quiz.landing.startPrompt.icon}</div>
            <h2 id="quiz-reward-prompt-title">{quiz.landing.startPrompt.title}</h2>
            <p>{quiz.landing.startPrompt.copy}</p>
            <button className="quiz-engine__primary" disabled={adBusy} onClick={confirmStartQuiz} type="button">
              <span aria-hidden="true" className="quiz-engine__primary-icon">▶</span>
              {adBusy ? translations.ad.loading : quiz.landing.startPrompt.button}
            </button>
          </section>
        </div>
      ) : null}
      <QuizAbout quiz={quiz} title={translations.quiz.aboutTitle} />
      </>
    );
  }

  if (screen === "checkpoint") {
    const isFinalStage = completedStage >= quiz.stages.length - 1;
    const checkpoint = quiz.checkpoint;
    const checkpointTitle = isFinalStage && checkpoint ? checkpoint.finalTitle : quiz.stages[completedStage];
    const checkpointCopy = isFinalStage
      ? checkpoint?.finalCopy ?? translations.results.complete
      : quiz.engine.checkpoint !== "ai" ? quiz.stageEncouragement[completedStage] : undefined;
    const checkpointButton = isFinalStage
      ? checkpoint?.finalButton ?? translations.results.viewResults
      : translations.quiz.continue;
    const reveal = checkpoint?.reveals[completedStage];
    const revealKey = reveal?.signal === "trend" ? result.trend
      : reveal?.signal === "consistency" ? result.consistency
        : reveal?.signal === "score-band" ? result.scoreBand
          : reveal?.signal === "target-status" ? result.targetStatus
            : "fixed";
    const revealMessage = reveal?.signal === "fixed" ? reveal.message
      : reveal?.signal === "strongest-dimension" ? reveal.template?.replace("{value}", result.strongestSignal ?? "—")
        : reveal?.variants?.[revealKey];
    const completedStageCount = completedStage + 1;
    const checkpointPercent = Math.round((completedStageCount / quiz.stages.length) * 100);
    return (
      <>
      <section className="quiz-engine__checkpoint quiz-engine__card">
        <span className="quiz-engine__eyebrow">{isFinalStage && checkpoint ? checkpoint.finalBadge : reveal?.badge ?? translations.results.stageComplete}</span>
        <div className="quiz-engine__checkpoint-icon" aria-hidden="true">{isFinalStage ? checkpoint?.finalIcon ?? "✦" : reveal?.icon ?? "✓"}</div>
        <h2>{checkpointTitle}</h2>
        {checkpointCopy ? <p>{checkpointCopy}</p> : null}
        {quiz.engine.checkpoint === "ai" && checkpoint ? (
          <div className="quiz-engine__ai-panel">
            <div className="quiz-engine__ai-top"><span aria-hidden="true" /><strong>{reveal?.title}</strong></div>
            <p>{revealMessage}</p>
          </div>
        ) : null}
        {checkpoint?.progressLabel && checkpoint.progressComplete ? (
          <div className="quiz-engine__checkpoint-progress">
            <div className="quiz-engine__checkpoint-progress-copy">
              <strong>{checkpoint.progressLabel}</strong>
              <span>{checkpoint.progressComplete.replace("{value}", String(checkpointPercent))}</span>
            </div>
            <div
              aria-label={`${completedStageCount} of ${quiz.stages.length} complete`}
              className="quiz-engine__checkpoint-progress-track"
              role="progressbar"
              aria-valuemax={quiz.stages.length}
              aria-valuemin={0}
              aria-valuenow={completedStageCount}
              style={{ gridTemplateColumns: `repeat(${quiz.stages.length}, minmax(0, 1fr))` }}
            >
              {quiz.stages.map((stage, index) => (
                <i aria-hidden="true" data-complete={index < completedStageCount ? "true" : undefined} key={stage} />
              ))}
            </div>
          </div>
        ) : null}
        {isFinalStage && checkpoint && checkpoint.finalChecklist.length ? (
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
          {checkpoint?.buttonIcon ? <span aria-hidden="true" className="quiz-engine__primary-icon">{checkpoint.buttonIcon}</span> : null}
          {adBusy ? translations.ad.loading : checkpointButton}
        </button>
        {quiz.engine.rewarded.stages && checkpoint ? <p className="quiz-engine__checkpoint-ad-note">{checkpoint.adNote}</p> : null}
      </section>
      <QuizAbout label={translations.quiz.restartTest} onRestart={restartQuiz} quiz={quiz} title={translations.quiz.aboutTitle} />
      </>
    );
  }

  if (screen === "results") {
    const estimate = quiz.result.estimate;
    const scoreCopy = quiz.result.score;
    const matchCopy = quiz.result.match;
    const profileReveal = quiz.result.profileReveal;
    const profileArtwork = result.profile.id ? quiz.theme.artwork?.profiles?.[result.profile.id] : undefined;
    const hasDerivedScore = result.derivedScore !== undefined && Boolean(scoreCopy?.derivedLabel);
    const consistency = estimate?.consistencyLabels[result.consistency];
    const revealConsistency = profileReveal?.consistencyLabels[result.consistency];
    return (
      <>
      <section
        className={`quiz-engine__results quiz-engine__card${profileReveal ? " quiz-engine__profile-reveal" : ""}`}
        data-profile-id={profileReveal ? result.profile.id : undefined}
      >
        {profileReveal ? (
          <>
            <span className="quiz-engine__eyebrow">{profileReveal.eyebrow}</span>
            {profileArtwork ? <div className="quiz-engine__profile-portrait"><img alt="" src={profileArtwork} /></div> : null}
            <div className="quiz-engine__profile-animal">{result.profile.tier}</div>
            <h2 className="quiz-engine__profile-title">{result.profile.title}</h2>
            <p className="quiz-engine__profile-aura">
              {profileReveal.auraLabelFirst ? (
                <><span>{profileReveal.auraLabel}</span><span>{result.profile.aura}</span></>
              ) : (
                <><span>{result.profile.aura}</span><span>{profileReveal.auraLabel}</span></>
              )}
            </p>
            <p className="quiz-engine__profile-traits">{result.profile.traits?.join(" · ")}</p>
            <dl className="quiz-engine__result-signals">
              <div><dt>{profileReveal.strongestEnergy}</dt><dd>{result.strongestSignal}</dd></div>
              <div><dt>{profileReveal.hiddenEnergy}</dt><dd>{result.hiddenSignal}</dd></div>
              <div><dt>{profileReveal.consistency}</dt><dd>{revealConsistency}</dd></div>
            </dl>
            <p className="quiz-engine__result-copy">{result.profile.copy}</p>
            <p className="quiz-engine__disclaimer">{profileReveal.disclaimer}</p>
          </>
        ) : (
          <>
        <div className="quiz-engine__result-icon" aria-hidden="true">
          {quiz.theme.artwork?.icon ?? quiz.cardIcon}
        </div>
        <span className="quiz-engine__eyebrow">{hasDerivedScore ? scoreCopy?.derivedLabel : estimate?.eyebrow ?? quiz.result.profileName}</span>
        {matchCopy ? <div className="quiz-engine__match-name">{result.profile.title}</div> : null}
        {result.estimatedAge !== undefined ? <div className="quiz-engine__result-age"><strong>{result.estimatedAge}</strong><span>{estimate?.ageSuffix}</span></div> : null}
        {hasDerivedScore ? <div className="quiz-engine__result-derived"><strong>{result.derivedScore}</strong></div> : matchCopy ? null : scoreCopy?.showPercentage !== false ? <div className="quiz-engine__result-percentage"><strong>{result.percentage}%</strong></div> : null}
        <h2>{matchCopy ? result.profile.tier : hasDerivedScore ? result.profile.title : scoreCopy ? (result.targetStatus === "achieved" ? scoreCopy.passed : scoreCopy.finished) : result.profile.title}</h2>
        {matchCopy ? <p className="quiz-engine__result-fraction"><span>{matchCopy.academicChallenge}: </span><strong>{result.percentage}% — {result.score} / {result.total}</strong> {matchCopy.correctLabel}</p> : null}
        {scoreCopy ? <p className="quiz-engine__result-fraction"><strong>{result.score} / {result.total}</strong> {scoreCopy.correctLabel}</p> : null}
        {scoreCopy && !hasDerivedScore ? <h3 className="quiz-engine__result-profile">{result.profile.title}</h3> : null}
        {estimate ? (
          <dl className="quiz-engine__result-signals">
            <div><dt>{estimate.strongestSignal}</dt><dd>{result.strongestSignal}</dd></div>
            <div><dt>{estimate.wildcard}</dt><dd>{result.wildcard}</dd></div>
            <div><dt>{estimate.consistency}</dt><dd>{consistency}</dd></div>
          </dl>
        ) : !scoreCopy ? <p className="quiz-engine__result-tier">{result.profile.tier}</p> : null}
        <p className="quiz-engine__result-copy">{result.profile.copy}</p>
        {matchCopy ? (
          <dl className="quiz-engine__result-signals quiz-engine__result-signals--match">
            <div><dt>{matchCopy.strongest}</dt><dd>{result.strongestSignal}</dd></div>
            <div><dt>{matchCopy.preferredStyle}</dt><dd>{result.preferredStyle}</dd></div>
            <div><dt>{matchCopy.alternative}</dt><dd>{result.alternativeMatch}</dd></div>
            <div><dt>{matchCopy.wildcard}</dt><dd>{result.wildcardMatch}<small>{matchCopy.wildcardTemplate.replace("{value}", result.wildcardReason ?? "—")}</small></dd></div>
            <div><dt>{matchCopy.bestRound}</dt><dd>{result.bestStage}</dd></div>
          </dl>
        ) : null}
        {scoreCopy ? (
          <dl className="quiz-engine__result-signals quiz-engine__result-signals--score">
            <div><dt>{scoreCopy.strongest}</dt><dd>{result.strongestSignal}</dd></div>
            <div><dt>{scoreCopy.trickiest}</dt><dd>{result.weakestSignal}</dd></div>
            {scoreCopy.showBestRound !== false ? <div><dt>{scoreCopy.bestRound}</dt><dd>{result.bestStage}</dd></div> : null}
          </dl>
        ) : null}
        {!estimate && !scoreCopy ? <div className="quiz-engine__result-summary" data-single={quiz.engine.scoring.type === "weighted-profile" || undefined}>
          {quiz.engine.scoring.type === "correct-answer" ? <div>
            <strong>{result.score}/{result.total}</strong>
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
        {estimate || scoreCopy || matchCopy ? <p className="quiz-engine__disclaimer">{estimate?.disclaimer ?? scoreCopy?.disclaimer ?? matchCopy?.disclaimer}</p> : null}
          </>
        )}
        <button className={`quiz-engine__secondary${scoreCopy?.retryLabel ? " quiz-engine__retry" : ""}`} onClick={restartQuiz} type="button">
          {scoreCopy?.retryLabel ?? translations.quiz.restartTest}
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
        <span>{quiz.progressLabel ? `${progress}% ${quiz.progressLabel}` : `${translations.quiz.round} ${currentStage + 1}`}</span>
        <strong>{quiz.stages[currentStage]}</strong>
      </div>
      <div className="quiz-engine__progress">
        <i style={{ width: `${progress}%` }} />
      </div>
      <article className="quiz-engine__question quiz-engine__card">
        {currentQuestion.context && (!currentQuestion.study || studyComplete) ? <p className="quiz-engine__question-context">{currentQuestion.context}</p> : null}
        <h1>{currentQuestion.study && !studyComplete ? currentQuestion.study.title : currentQuestion.prompt}</h1>
        <QuestionRenderer
          answer={selectedAnswer}
          feedback={quiz.engine.flow.feedback}
          key={currentQuestion.id}
          onAnswer={answerQuestion}
          onStudyComplete={completeStudy}
          question={currentQuestion}
          studyComplete={studyComplete}
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
