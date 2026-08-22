"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";

import type { SupportedLocale, Translations } from "@/lib/i18n";
import type { Quiz, QuizQuestion } from "@/lib/quizzes";
import { siteConfig } from "@/lib/siteConfig";
import { getCareerResultBand, getStageCompletionPercentage } from "./engineState";
import { mountDisplayAd, mountStickyDisplayAd, requestRewardedAd } from "./rewardedAds";
import { getQuizStorageKey, isProgressTimestampFresh, STORAGE_VERSION } from "./progressStorage";
import { scoreQuiz, type QuizAnswers } from "./scoring";

type QuizEngineProps = {
  locale: SupportedLocale;
  quiz: Quiz;
  translations: Translations;
};

type QuizScreen = "landing" | "question" | "checkpoint" | "stage-result" | "results";
type SavedScreen = Exclude<QuizScreen, "landing">;

type SavedProgress = {
  version: 3;
  signature: string;
  answers: QuizAnswers;
  questionIndex: number;
  completedStage: number;
  screen: SavedScreen;
  studiedQuestions?: string[];
  reportUnlocked?: boolean;
  rewardClosedSent?: boolean;
  reviewUnlocked?: boolean;
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

function QuestionDisplayAd({ config, placement, questionId }: { config: NonNullable<Quiz["engine"]["questionAd"]>; placement: "below-question" | "below-answers"; questionId: string }) {
  const reactId = useId().replaceAll(":", "");
  const elementId = `quiz-question-ad-${placement}-${reactId}`;
  const controllerRef = useRef<ReturnType<typeof mountDisplayAd> | null>(null);
  const previousQuestionRef = useRef<string | null>(null);

  useEffect(() => {
    controllerRef.current = mountDisplayAd({
      adUnitPath: config.adUnitPath,
      elementId,
      sizes: config.sizes,
    });
    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [config.adUnitPath, config.sizes, elementId]);

  useEffect(() => {
    if (previousQuestionRef.current !== null && previousQuestionRef.current !== questionId) {
      controllerRef.current?.refresh();
    }
    previousQuestionRef.current = questionId;
  }, [questionId]);

  return (
    <div className="quiz-engine__question-ad" data-display-ad data-placement={placement}>
      <div id={elementId} />
    </div>
  );
}

function ResultDisplayAd({ config, placement }: { config: NonNullable<Quiz["engine"]["resultAds"]>; placement: string }) {
  const reactId = useId().replaceAll(":", "");
  const elementId = `quiz-result-ad-${placement}-${reactId}`;

  useEffect(() => {
    const controller = mountDisplayAd({
      adUnitPath: config.adUnitPath,
      elementId,
      sizes: config.sizes,
    });
    return () => controller.destroy();
  }, [config.adUnitPath, config.sizes, elementId]);

  return (
    <div className="quiz-engine__result-ad" data-display-ad data-placement={placement}>
      <div id={elementId} />
    </div>
  );
}

function ResultStickyAd({ adUnitPath }: { adUnitPath: string }) {
  useEffect(() => {
    const controller = mountStickyDisplayAd({ adUnitPath });
    return () => controller.destroy();
  }, [adUnitPath]);
  return <span aria-hidden="true" className="quiz-engine__sticky-ad-anchor" />;
}

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
  const isWordSequence = question.presentation === "sequence"
    && visual.items.some((item) => /[A-Za-z]{8,}/.test(item));
  const isMathSequence = question.presentation === "sequence" && visual.separator === "+";
  const isDenseSequence = question.presentation === "sequence" && visual.items.length >= 4;
  const isVeryDenseSequence = question.presentation === "sequence" && visual.items.length >= 7;
  const isFourStepSequence = question.presentation === "sequence" && visual.items.length === 4;
  const isSixStepSequence = question.presentation === "sequence" && visual.items.length === 6;
  const isTextualCode = question.presentation === "code"
    && visual.items.some((item) => /[A-Za-z]/.test(item));
  const codeRows = question.presentation === "code"
    ? visual.items.map((item) => item.split("::").map((part) => part.trim()))
    : [];
  const isObservationBoard = codeRows.length > 0 && codeRows.every((parts) => parts.length === 3 && parts.every(Boolean));
  const isKeyValueBoard = codeRows.length > 0 && codeRows.every((parts) => parts.length === 2 && parts.every(Boolean));
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
      className={`quiz-engine__visual quiz-engine__visual--${question.presentation}${isVerboseSequence ? " quiz-engine__visual--verbose-sequence" : ""}${isCompactSequence ? " quiz-engine__visual--compact-sequence" : ""}${isWordSequence ? " quiz-engine__visual--word-sequence" : ""}${isMathSequence ? " quiz-engine__visual--math-sequence" : ""}${isDenseSequence ? " quiz-engine__visual--dense-sequence" : ""}${isVeryDenseSequence ? " quiz-engine__visual--very-dense-sequence" : ""}${isFourStepSequence ? " quiz-engine__visual--four-step-sequence" : ""}${isSixStepSequence ? " quiz-engine__visual--six-step-sequence" : ""}${isTextualCode ? " quiz-engine__visual--textual-code" : ""}${needsMobileTwoColumns ? " quiz-engine__visual--mobile-two-columns" : ""}${hasUnbalancedLastTile ? " quiz-engine__visual--balanced-last-tile" : ""}${isObservationBoard ? " quiz-engine__visual--observation-board" : ""}${isKeyValueBoard ? " quiz-engine__visual--key-value-board" : ""}`}
      style={visualStyle}
    >
      {visual.items.map((item, index) => (
        <span key={`${item}-${index}`}>
          {isObservationBoard ? (
            <strong><b>{codeRows[index][0]}</b><em>{codeRows[index][1]}</em><small aria-hidden="true">→</small><em>{codeRows[index][2]}</em></strong>
          ) : isKeyValueBoard ? (
            <strong><b>{codeRows[index][0]}</b><em>{codeRows[index][1]}</em></strong>
          ) : <strong>{item}</strong>}
          {question.presentation === "sequence" && index < visual.items.length - 1 ? <i aria-hidden="true">{visual.separator ?? "→"}</i> : null}
        </span>
      ))}
    </div>
  );
}

function QuestionImage({ question }: { question: QuizQuestion }) {
  if (!question.image) return null;
  return (
    <figure className="quiz-engine__question-image">
      <img alt={question.image.alt} decoding="async" src={question.image.src} />
    </figure>
  );
}

function ChoiceQuestion({
  answer,
  feedback,
  onAnswer,
  question,
}: QuestionRendererProps) {
  const hasAnswerIcons = question.icons?.length === question.choices.length;
  const usesCompactMobileGrid = question.choices.length === 4
    && question.choices.every((choice) => choice.length <= 22);
  const hasLongUnbrokenChoice = question.choices.some((choice) =>
    choice.split(/\s+/).some((word) => word.length > 8)
  );
  return (
    <>
    <QuestionImage question={question} />
    <QuestionVisual question={question} />
    <div className={`quiz-engine__answers quiz-engine__answers--${question.presentation}${hasAnswerIcons ? " quiz-engine__answers--icons" : ""}${usesCompactMobileGrid ? " quiz-engine__answers--compact-grid" : ""}${hasLongUnbrokenChoice ? " quiz-engine__answers--long-word" : ""}`} role={question.presentation === "scale" ? "radiogroup" : undefined}>
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
            {hasAnswerIcons ? (
              <span className="quiz-engine__answer-icon" aria-hidden="true">
                {typeof icon === "string" && icon.startsWith("/quizzes/")
                  ? <img alt="" decoding="async" src={icon} />
                  : icon}
              </span>
            ) : null}
            {!hasAnswerIcons && question.presentation !== "scale" ? <span>{String.fromCharCode(65 + index)}</span> : null}
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
  if (!saved.screen || !["question", "checkpoint", "stage-result", "results"].includes(saved.screen)) return null;
  if (saved.reportUnlocked !== undefined && typeof saved.reportUnlocked !== "boolean") return null;
  if (saved.rewardClosedSent !== undefined && typeof saved.rewardClosedSent !== "boolean") return null;
  if (saved.reviewUnlocked !== undefined && typeof saved.reviewUnlocked !== "boolean") return null;

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
  const [studiedQuestions, setStudiedQuestions] = useState<string[]>([]);
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [rewardClosedSent, setRewardClosedSent] = useState(false);
  const [reviewUnlocked, setReviewUnlocked] = useState(false);
  const [showStartPrompt, setShowStartPrompt] = useState(false);
  const adRequestActive = useRef(false);
  const adRequestController = useRef<AbortController | null>(null);
  const adRequestGeneration = useRef(0);
  const progressSignature = useMemo(
    () => JSON.stringify({
      engine: {
        flow: quiz.engine.flow,
        scoring: quiz.engine.scoring,
        startOnLoad: quiz.engine.startOnLoad,
        questionAd: quiz.engine.questionAd,
        resultAds: quiz.engine.resultAds,
        targetRatio: quiz.engine.targetRatio,
        estimate: quiz.engine.estimate,
        derivedScore: quiz.engine.derivedScore,
        tieBreaks: quiz.engine.tieBreaks,
        match: quiz.engine.match,
        career: quiz.career,
      },
      stages: quiz.stages,
      questions: quiz.questions.map((question) => [
        question.id,
        question.stage,
        question.presentation,
        question.context,
        question.visual,
        question.image,
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
        question.interactionStyle,
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
  const stagePositionProgress = stageQuestions.length > 0
    ? Math.round(((stageQuestionIndex + 1) / stageQuestions.length) * 100)
    : 0;
  const displayedStageProgress = quiz.career?.continuousShell ? progress : stagePositionProgress;
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
        setReportUnlocked(saved.reportUnlocked ?? false);
        setRewardClosedSent(saved.rewardClosedSent ?? false);
        setReviewUnlocked(saved.reviewUnlocked ?? false);
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
      reportUnlocked,
      rewardClosedSent,
      reviewUnlocked,
      updatedAt: new Date().toISOString(),
    };
    try { window.localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { /* The quiz still works if storage is blocked. */ }
  }, [answers, completedStage, hydrated, progressSignature, questionIndex, reportUnlocked, rewardClosedSent, reviewUnlocked, screen, storageKey, studiedQuestions]);

  useEffect(() => () => {
    adRequestGeneration.current += 1;
    adRequestController.current?.abort();
  }, []);

  useEffect(() => {
    if (!showStartPrompt) return;
    document.documentElement.classList.add("quiz-reward-prompt-open");
    document.body.classList.add("quiz-reward-prompt-open");
    return () => {
      document.documentElement.classList.remove("quiz-reward-prompt-open");
      document.body.classList.remove("quiz-reward-prompt-open");
    };
  }, [showStartPrompt]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "auto" });
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }

  async function runRewardedGate(onComplete: () => void, scrollAfter = true) {
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
        onRewardClosed: () => setRewardClosedSent(true),
        rewardClosedAlreadySent: rewardClosedSent,
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
    if (scrollAfter) scrollToTop();
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
    setScreen("question");
  }

  function startQuiz() {
    if (quiz.engine.rewarded.start && quiz.engine.rewarded.confirmStart && quiz.landing.startPrompt) {
      setShowStartPrompt(true);
    }
    else if (quiz.engine.rewarded.start) void runRewardedGate(beginQuiz);
    else beginQuiz();
  }

  function confirmQuizStart() {
    void runRewardedGate(() => {
      setShowStartPrompt(false);
      beginQuiz();
    });
  }

  function continueAfterCheckpoint() {
    const isFinalStage = completedStage >= quiz.stages.length - 1;
    const next = () => {
      if (quiz.career && quiz.career.showStageResults !== false && !isFinalStage) {
        setScreen("stage-result");
      } else if (isFinalStage) {
        setScreen("results");
        trackQuizEvent("QuizComplete", quiz, locale);
      } else {
        setScreen("question");
      }
    };
    if (quiz.engine.rewarded.stages) void runRewardedGate(next);
    else next();
  }

  function enterNextCareerStage() {
    setScreen("question");
    scrollToTop();
  }

  function unlockFullReport() {
    void runRewardedGate(() => setReportUnlocked(true));
  }

  function unlockIncorrectAnswers() {
    void runRewardedGate(() => setReviewUnlocked(true), false);
  }

  function restartQuiz() {
    adRequestGeneration.current += 1;
    adRequestController.current?.abort();
    adRequestController.current = null;
    adRequestActive.current = false;
    try { window.localStorage.removeItem(storageKey); } catch { /* Storage can be unavailable. */ }
    setAdBusy(false);
    setAnswers({});
    setQuestionIndex(0);
    setCompletedStage(0);
    setStudiedQuestions([]);
    setReportUnlocked(false);
    setRewardClosedSent(false);
    setReviewUnlocked(false);
    setShowStartPrompt(false);
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
          {quiz.engine.rewarded.start && !quiz.engine.rewarded.confirmStart ? <p className="quiz-engine__ad-note"><span>✓</span>{quiz.landing.startNote ?? translations.ad.startNote}</p> : null}
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
      {showStartPrompt && quiz.landing.startPrompt ? (
        <div className="quiz-engine__reward-prompt">
          <section
            aria-labelledby="quiz-start-prompt-title"
            aria-modal="true"
            className="quiz-engine__reward-prompt-card quiz-engine__card"
            role="dialog"
          >
            <span className="quiz-engine__eyebrow">{quiz.landing.startPrompt.eyebrow}</span>
            <div aria-hidden="true" className="quiz-engine__reward-prompt-icon">{quiz.landing.startPrompt.icon}</div>
            <h2 id="quiz-start-prompt-title">{quiz.landing.startPrompt.title}</h2>
            <p>{quiz.landing.startPrompt.copy}</p>
            <button autoFocus className="quiz-engine__primary" disabled={adBusy} onClick={confirmQuizStart} type="button">
              {adBusy ? "Loading Ad…" : quiz.landing.startPrompt.button}
            </button>
          </section>
        </div>
      ) : null}
      </>
    );
  }

  if (screen === "checkpoint") {
    const isFinalStage = completedStage >= quiz.stages.length - 1;
    const checkpoint = quiz.checkpoint;
    const careerStage = quiz.career?.stages[completedStage];
    const checkpointTitle = isFinalStage && checkpoint ? checkpoint.finalTitle : quiz.stages[completedStage];
    const checkpointCopy = isFinalStage
      ? checkpoint?.finalCopy ?? translations.results.complete
      : quiz.engine.checkpoint !== "ai" ? quiz.stageEncouragement[completedStage] : undefined;
    const checkpointButton = isFinalStage
      ? checkpoint?.finalButton ?? translations.results.viewResults
      : translations.quiz.continue;
    const compactCareerGate = careerStage && quiz.career?.compactGate && !isFinalStage
      ? quiz.career.compactGate
      : undefined;
    const progressOnlyCareerGate = Boolean(careerStage && quiz.career?.showStageResults === false);
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
      <section className={`quiz-engine__checkpoint quiz-engine__card${quiz.career?.continuousShell ? " quiz-engine__continuous-shell" : ""}${compactCareerGate ? " quiz-engine__checkpoint--compact-career" : ""}${progressOnlyCareerGate ? " quiz-engine__checkpoint--progress-career" : ""}`} data-round={completedStage + 1}>
        {compactCareerGate ? (
          <span className="quiz-engine__eyebrow">{compactCareerGate.eyebrow}</span>
        ) : !isFinalStage ? (
          <span className="quiz-engine__eyebrow">{careerStage?.preAdBadge ?? reveal?.badge ?? translations.results.stageComplete}</span>
        ) : progressOnlyCareerGate ? (
          <span className="quiz-engine__eyebrow">{careerStage?.preAdBadge ?? checkpoint?.finalBadge}</span>
        ) : null}
        <div className="quiz-engine__checkpoint-icon" aria-hidden="true">{careerStage ? careerStage.resultIcon : isFinalStage ? checkpoint?.finalIcon ?? "✦" : reveal?.icon ?? "✓"}</div>
        <h2>{compactCareerGate ? compactCareerGate.title.replace("{stage}", quiz.stages[completedStage]) : careerStage?.preAdTitle ?? checkpointTitle}</h2>
        {compactCareerGate ? <p>{compactCareerGate.copy}</p> : careerStage?.preAdCopy ? <p>{careerStage.preAdCopy}</p> : checkpointCopy ? <p>{checkpointCopy}</p> : null}
        {careerStage ? (!compactCareerGate && careerStage.preAdChecks?.length ? (
          <ul className="quiz-engine__checklist quiz-engine__career-checklist">
            {careerStage.preAdChecks.map((item) => <li key={item}><span>✓</span>{item}</li>)}
          </ul>
        ) : null) : quiz.engine.checkpoint === "ai" && checkpoint ? (
          <div className="quiz-engine__ai-panel">
            <div className="quiz-engine__ai-top"><span aria-hidden="true" /><strong>{reveal?.title}</strong></div>
            <p>{revealMessage}</p>
          </div>
        ) : null}
        {progressOnlyCareerGate ? (
          <section className="quiz-engine__career-result-progress quiz-engine__checkpoint-journey-progress" style={{ "--career-result-progress": `${checkpointPercent}%` } as CSSProperties}>
            <div>
              <span>{quiz.career?.resultProgressLabel ?? "Challenge progress"}</span>
              <strong>{(quiz.career?.resultProgressComplete ?? "{value}% complete").replace("{value}", String(checkpointPercent))}</strong>
            </div>
            <i aria-hidden="true"><b /></i>
          </section>
        ) : null}
        {!careerStage && checkpoint?.progressLabel && checkpoint.progressComplete ? (
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
        {!careerStage && isFinalStage && checkpoint && checkpoint.finalChecklist.length ? (
          <ul className="quiz-engine__checklist quiz-engine__checklist--final-compact">
            {checkpoint.finalChecklist.map((item) => <li key={item}><span>✓</span>{item}</li>)}
          </ul>
        ) : null}
        {!careerStage && !isFinalStage ? (
          <div className="quiz-engine__checkpoint-next">
            <span>{checkpoint?.nextPrefix ?? translations.results.nextStage}</span>
            <strong>{quiz.stages[completedStage + 1]}</strong>
          </div>
        ) : progressOnlyCareerGate && !isFinalStage && careerStage?.next ? (
          <div className="quiz-engine__checkpoint-next quiz-engine__checkpoint-next--career">
            <span>{careerStage.next.eyebrow}</span>
            <strong>{careerStage.next.title}</strong>
            <small>{careerStage.next.tagline}</small>
          </div>
        ) : null}
        <button className="quiz-engine__primary" disabled={adBusy} onClick={continueAfterCheckpoint} type="button">
          {checkpoint?.buttonIcon ? <span aria-hidden="true" className="quiz-engine__primary-icon">{checkpoint.buttonIcon}</span> : null}
          {adBusy ? translations.ad.loading : compactCareerGate?.button ?? careerStage?.preAdButton ?? checkpointButton}
          {!isFinalStage && !adBusy ? (
            <span aria-hidden="true" className="quiz-engine__primary-arrow">
              <svg focusable="false" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          ) : null}
        </button>
        {quiz.engine.rewarded.stages && checkpoint ? <p className="quiz-engine__checkpoint-ad-note">{isFinalStage ? checkpoint.finalAdNote ?? checkpoint.adNote : checkpoint.adNote}</p> : null}
      </section>
      <QuizAbout label={translations.quiz.restartTest} onRestart={restartQuiz} quiz={quiz} title={translations.quiz.aboutTitle} />
      </>
    );
  }

  if (screen === "stage-result" && quiz.career) {
    const stageCopy = quiz.career.stages[completedStage];
    const completedQuestions = quiz.questions.filter((question) => question.stage === completedStage);
    const completionBasedResult = quiz.career.stageResultMode === "completion";
    const stageCorrect = completionBasedResult
      ? completedQuestions.filter((question) => answers[question.id] !== undefined).length
      : completedQuestions.filter((question) => answers[question.id] === question.answerIndex).length;
    const stageBand = stageCopy.resultBands[getCareerResultBand(stageCorrect, completedQuestions.length)];
    const cleared = completedStage + 1;
    const completedSoFar = quiz.questions.filter((question) => question.stage <= completedStage);
    const cumulativeCorrect = completedSoFar.filter((question) => answers[question.id] === question.answerIndex).length;
    const cumulativePercentage = completedSoFar.length ? Math.round((cumulativeCorrect / completedSoFar.length) * 100) : 0;
    const overallProgress = Math.round((cleared / quiz.stages.length) * 100);
    const currentRank = [...quiz.career.ranks].reverse().find((rank) => cleared >= rank.afterStage)?.label ?? quiz.career.ranks[0].label;
    return (
      <>
      <section className={`quiz-engine__stage-result quiz-engine__card${quiz.career.continuousShell ? " quiz-engine__continuous-shell" : ""}`} data-round={cleared}>
        <span className="quiz-engine__eyebrow">{quiz.career.hideJourneyLength ? stageCopy.resultLabel : completedStage === 0 ? quiz.career.unlockEyebrow : stageCopy.resultLabel}</span>
        <div className="quiz-engine__stage-result-icon" aria-hidden="true">{stageCopy.resultIcon}</div>
        <div className="quiz-engine__stage-score"><strong>{stageCorrect}</strong><span>/ {completedQuestions.length}</span></div>
        <h2>{stageBand.title}</h2>
        <p className="quiz-engine__stage-insight">{stageBand.insight}</p>

        {quiz.career.hideJourneyLength && quiz.career.showCurrentScore !== false ? (
          <section className="quiz-engine__career-current-score" style={{ "--career-score": `${cumulativePercentage}%` } as CSSProperties}>
            <span>{quiz.career.currentScoreLabel ?? "CURRENT SCORE"}</span>
            <strong>{cumulativePercentage}%</strong>
          </section>
        ) : null}

        {quiz.career.showResultProgress ? (
          <section className="quiz-engine__career-result-progress" style={{ "--career-result-progress": `${overallProgress}%` } as CSSProperties}>
            <div>
              <span>{quiz.career.resultProgressLabel ?? "CHALLENGE PROGRESS"}</span>
              <strong>{(quiz.career.resultProgressComplete ?? "{value}% COMPLETE").replace("{value}", String(overallProgress))}</strong>
            </div>
            <i aria-hidden="true"><b /></i>
          </section>
        ) : null}

        {completedStage === 0 && !quiz.career.hideJourneyLength ? (
          <section className="quiz-engine__career-unlock">
            <span>{quiz.career.unlockEyebrow}</span>
            <h3>{quiz.career.unlockTitle}</h3>
            <p>{quiz.career.unlockCopy}</p>
          </section>
        ) : null}

        {stageCopy.promotion && !quiz.career.hideJourneyLength ? (
          <section className="quiz-engine__career-promotion">
            <span>{stageCopy.promotion.eyebrow}</span>
            <h3>{stageCopy.promotion.title}</h3>
            <p>{stageCopy.promotion.copy}</p>
          </section>
        ) : null}

        {!quiz.career.hideJourneyLength ? <section className="quiz-engine__career-progress">
          <div><span>{quiz.career.journeyLabel}</span><strong>{quiz.career.kitchensCleared.replace("{value}", String(cleared)).replace("{total}", String(quiz.stages.length))}</strong></div>
          <div className="quiz-engine__career-dots" aria-label={`${cleared} of ${quiz.stages.length} complete`} style={{ gridTemplateColumns: `repeat(${quiz.stages.length}, minmax(0, 1fr))` }}>
            {quiz.stages.map((stage, index) => <i aria-hidden="true" data-complete={index < cleared ? "true" : undefined} key={stage} />)}
          </div>
          <p><span>{quiz.career.currentRank}</span><strong>{currentRank}</strong></p>
          <div className="quiz-engine__career-ladder" aria-label={quiz.career.ranks.map((rank) => rank.label).join(", ")}>
            {quiz.career.ranks.map((rank, index) => <span data-active={rank.label === currentRank ? "true" : undefined} key={rank.label}>{rank.label}{index < quiz.career!.ranks.length - 1 ? <i>→</i> : null}</span>)}
          </div>
        </section> : null}

        {stageCopy.next ? (
          <>
            <section className="quiz-engine__career-next">
              <span>{stageCopy.next.eyebrow}</span>
              <h3>{stageCopy.next.title}</h3>
              <b>{stageCopy.next.difficulty}</b>
              <p><strong>{stageCopy.next.tagline}</strong>{stageCopy.next.copy}</p>
              {!quiz.career.hideJourneyLength ? <button className="quiz-engine__primary" onClick={enterNextCareerStage} type="button">{stageCopy.next.button}</button> : null}
            </section>
            {quiz.career.hideJourneyLength ? (
              <button className="quiz-engine__primary quiz-engine__career-next-action" onClick={enterNextCareerStage} type="button">{stageCopy.next.button}</button>
            ) : null}
          </>
        ) : null}
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
    const scoreInsights = scoreCopy?.insights;
    const estimateInsights = estimate?.insights;
    const resultInsights = scoreInsights ?? estimateInsights;
    const career = quiz.career;
    const careerReport = career?.reportUnlock;
    const incorrectQuestions = quiz.engine.scoring.type === "correct-answer"
      ? quiz.questions.filter((question) => answers[question.id] !== question.answerIndex)
      : [];
    const reviewUnlockCopy = scoreCopy?.reviewUnlock;
    const estimateReviewUnlockCopy = estimate?.reviewUnlock;
    const detailedResults = Boolean(reviewUnlockCopy || estimateReviewUnlockCopy);
    const requiresReviewUnlock = Boolean(
      reviewUnlockCopy
      && incorrectQuestions.length
      && !reviewUnlocked,
    );
    const requiresEstimateReviewUnlock = Boolean(
      quiz.engine.scoring.type === "weighted-profile"
      && estimateReviewUnlockCopy
      && !reviewUnlocked,
    );
    const estimateChoiceImpacts = quiz.engine.scoring.type === "weighted-profile" && quiz.engine.estimate
      ? quiz.questions.flatMap((question) => {
          const choiceIndex = answers[question.id];
          if (choiceIndex === undefined) return [];
          const weightedImpact = Object.entries(question.choiceWeights?.[choiceIndex] ?? {}).reduce(
            (sum, [profileId, weight]) => sum + weight * (quiz.engine.estimate?.profileAdjustments[profileId] ?? 0),
            0,
          );
          const impact = weightedImpact + (question.calibrationValues?.[choiceIndex] ?? 0);
          const direction = impact > 0.05 ? "raised" : impact < -0.05 ? "lowered" : "neutral";
          return [{ question, choiceIndex, direction }];
        })
      : [];
    if (careerReport && !reportUnlocked) {
      const report = careerReport;
      return (
        <>
        <section className={`quiz-engine__career-final quiz-engine__card${career?.continuousShell ? " quiz-engine__continuous-shell" : ""}`} data-round={quiz.stages.length}>
          <span className="quiz-engine__eyebrow">{career!.finalEyebrow}</span>
          <div className="quiz-engine__result-icon" aria-hidden="true">{quiz.theme.artwork?.icon ?? quiz.cardIcon}</div>
          <div className="quiz-engine__result-percentage"><strong>{result.percentage}%</strong></div>
          <h2>{result.profile.title}</h2>
          <p className="quiz-engine__result-fraction"><strong>{result.score} / {result.total}</strong> {scoreCopy?.correctLabel}</p>
          <section className="quiz-engine__career-complete">
            <span>✓</span>
            <div><small>{career!.currentRank}</small><strong>{career!.finalCareerTitle}</strong></div>
          </section>
          <dl className="quiz-engine__result-signals quiz-engine__result-signals--score">
            <div><dt>{career!.strongestLabel}</dt><dd>{result.strongestSignal}</dd></div>
          </dl>
          <p className="quiz-engine__result-copy">{result.profile.copy}</p>
          <section className="quiz-engine__report-unlock">
            <span>{report.eyebrow}</span>
            <h3>{report.title}</h3>
            <p>{report.copy}</p>
            <ul>{report.checks.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul>
            <button className="quiz-engine__primary" disabled={adBusy} onClick={unlockFullReport} type="button">
              <span aria-hidden="true" className="quiz-engine__primary-icon">▶</span>
              {adBusy ? translations.ad.loading : report.button}
            </button>
            <p className="quiz-engine__checkpoint-ad-note">{report.adNote}</p>
          </section>
          <p className="quiz-engine__disclaimer">{scoreCopy?.disclaimer}</p>
        </section>
        <QuizAbout label={translations.quiz.restartTest} onRestart={restartQuiz} quiz={quiz} title={translations.quiz.aboutTitle} />
        </>
      );
    }
    return (
      <>
      {quiz.engine.resultAds && quiz.engine.resultAds.inlinePlacements > 0
        ? <ResultDisplayAd config={quiz.engine.resultAds} placement="header" />
        : null}
      <section
        className={`quiz-engine__results quiz-engine__card${profileReveal ? " quiz-engine__profile-reveal" : ""}${detailedResults ? " quiz-engine__results--detailed" : ""}${career?.continuousShell ? " quiz-engine__continuous-shell" : ""}`}
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
        {hasDerivedScore ? <div className="quiz-engine__result-derived"><strong>{result.derivedScore}</strong></div> : matchCopy ? null : scoreCopy && scoreCopy.showPercentage !== false ? <div className="quiz-engine__result-percentage"><strong>{result.percentage}%</strong></div> : null}
        <h2>{matchCopy ? result.profile.tier : hasDerivedScore ? result.profile.title : scoreCopy ? (result.targetStatus === "achieved" ? scoreCopy.passed : scoreCopy.finished) : result.profile.title}</h2>
        {matchCopy ? <p className="quiz-engine__result-fraction"><span>{matchCopy.academicChallenge}: </span><strong>{result.percentage}% — {result.score} / {result.total}</strong> {matchCopy.correctLabel}</p> : null}
        {scoreCopy ? <p className="quiz-engine__result-fraction"><strong>{result.score} / {result.total}</strong> {scoreCopy.correctLabel}</p> : null}
        {scoreCopy && !hasDerivedScore ? <h3 className="quiz-engine__result-profile">{result.profile.title}</h3> : null}
        {detailedResults && quiz.engine.scoring.type === "correct-answer" && requiresReviewUnlock ? (
          <section className="quiz-engine__answer-review-unlock">
            <div aria-hidden="true" className="quiz-engine__answer-review-lock">🔒</div>
            <span>{translations.quiz.answersToReview}</span>
            <h3>{reviewUnlockCopy?.title ?? translations.quiz.answersToReview}</h3>
            {reviewUnlockCopy?.copy ? <p>{reviewUnlockCopy.copy}</p> : null}
            <button className="quiz-engine__primary" disabled={adBusy} onClick={unlockIncorrectAnswers} type="button">
              {adBusy ? translations.ad.loading : reviewUnlockCopy?.button ?? translations.results.viewResults}
            </button>
            <small>{reviewUnlockCopy?.adNote ?? translations.ad.stepOne}</small>
          </section>
        ) : detailedResults && quiz.engine.scoring.type === "correct-answer" ? (
          <section className="quiz-engine__answer-review">
            <h3>{translations.quiz.answersToReview}</h3>
            {incorrectQuestions.length === 0 ? (
              <p>{translations.quiz.perfectReview}</p>
            ) : (
              <div>
                {incorrectQuestions.map((question) => (
                  <article key={question.id}>
                    <span>{quiz.stages[question.stage]}</span>
                    <h4>{question.prompt}</h4>
                    <dl>
                      <div><dt>{translations.quiz.yourAnswer}</dt><dd>{question.choices[answers[question.id]] ?? "—"}</dd></div>
                      <div><dt>{translations.quiz.correctAnswer}</dt><dd>{question.answerIndex === undefined ? "—" : question.choices[question.answerIndex]}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : detailedResults && quiz.engine.scoring.type === "weighted-profile" && requiresEstimateReviewUnlock ? (
          <section className="quiz-engine__answer-review-unlock">
            <div aria-hidden="true" className="quiz-engine__answer-review-lock">🔒</div>
            <span>{estimateReviewUnlockCopy?.reviewTitle}</span>
            <h3>{estimateReviewUnlockCopy?.title}</h3>
            <p>{estimateReviewUnlockCopy?.copy}</p>
            <button
              className="quiz-engine__primary"
              disabled={adBusy}
              onClick={estimateReviewUnlockCopy?.rewarded === false ? () => setReviewUnlocked(true) : unlockIncorrectAnswers}
              type="button"
            >
              {adBusy ? translations.ad.loading : estimateReviewUnlockCopy?.button}
            </button>
            {estimateReviewUnlockCopy?.rewarded === false ? null : <small>{estimateReviewUnlockCopy?.adNote}</small>}
          </section>
        ) : detailedResults && quiz.engine.scoring.type === "weighted-profile" && estimateReviewUnlockCopy ? (
          <section className="quiz-engine__answer-review quiz-engine__answer-review--impact">
            <h3>{estimateReviewUnlockCopy.reviewTitle}</h3>
            <div>
              {estimateChoiceImpacts.map(({ question, choiceIndex, direction }) => {
                const label = direction === "raised" ? estimateReviewUnlockCopy.raised : direction === "lowered" ? estimateReviewUnlockCopy.lowered : estimateReviewUnlockCopy.neutral;
                const copy = direction === "raised" ? estimateReviewUnlockCopy.raisedCopy : direction === "lowered" ? estimateReviewUnlockCopy.loweredCopy : estimateReviewUnlockCopy.neutralCopy;
                return (
                  <article data-impact={direction} key={question.id}>
                    <span>{label}</span>
                    <h4>{question.prompt}</h4>
                    <dl><div><dt>{estimateReviewUnlockCopy.yourChoice}</dt><dd>{question.choices[choiceIndex]}</dd></div></dl>
                    <p>{copy}</p>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
        {quiz.engine.resultAds && quiz.engine.resultAds.inlinePlacements > 1
          ? <ResultDisplayAd config={quiz.engine.resultAds} placement="after-unlock" />
          : null}
        {estimate ? (
          <dl className="quiz-engine__result-signals">
            <div><dt>{estimate.strongestSignal}</dt><dd>{result.strongestSignal}</dd></div>
            <div><dt>{estimate.wildcard}</dt><dd>{result.wildcard}</dd></div>
            <div><dt>{estimate.consistency}</dt><dd>{consistency}</dd></div>
          </dl>
        ) : !scoreCopy ? <p className="quiz-engine__result-tier">{result.profile.tier}</p> : null}
        {!detailedResults ? <p className="quiz-engine__result-copy">{result.profile.copy}</p> : null}
        {matchCopy ? (
          <dl className="quiz-engine__result-signals quiz-engine__result-signals--match">
            <div><dt>{matchCopy.strongest}</dt><dd>{result.strongestSignal}</dd></div>
            <div><dt>{matchCopy.preferredStyle}</dt><dd>{result.preferredStyle}</dd></div>
            <div><dt>{matchCopy.alternative}</dt><dd>{result.alternativeMatch}</dd></div>
            <div><dt>{matchCopy.wildcard}</dt><dd>{result.wildcardMatch}<small>{matchCopy.wildcardTemplate.replace("{value}", result.wildcardReason ?? "—")}</small></dd></div>
            <div><dt>{matchCopy.bestRound}</dt><dd>{result.bestStage}</dd></div>
          </dl>
        ) : null}
        {scoreCopy && !detailedResults ? (
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
        {(!estimate || detailedResults) && Object.keys(result.dimensionScores).length ? (
          <div className={`quiz-engine__dimensions${detailedResults && scoreCopy ? " quiz-engine__dimensions--summary" : ""}`}>
            {detailedResults && resultInsights ? <h3>{resultInsights.breakdown}</h3> : null}
            {detailedResults && scoreCopy ? (
              <dl className="quiz-engine__result-signals quiz-engine__result-signals--score">
                <div><dt>{scoreCopy.strongest}</dt><dd>{result.strongestSignal}</dd></div>
                <div><dt>{scoreCopy.trickiest}</dt><dd>{result.weakestSignal}</dd></div>
                {scoreCopy.showBestRound !== false ? <div><dt>{scoreCopy.bestRound}</dt><dd>{result.bestStage}</dd></div> : null}
              </dl>
            ) : null}
            {Object.entries(result.dimensionScores).map(([label, value]) => (
              <div className="quiz-engine__dimension" key={label}>
                <div><span>{label}</span><strong>{value}%</strong></div>
                <i><b style={{ width: `${value}%` }} /></i>
              </div>
            ))}
          </div>
        ) : null}
        {quiz.engine.resultAds && quiz.engine.resultAds.inlinePlacements > 2
          ? <ResultDisplayAd config={quiz.engine.resultAds} placement="after-breakdown" />
          : null}
        {!detailedResults && quiz.engine.scoring.type === "correct-answer" && requiresReviewUnlock ? (
          <section className="quiz-engine__answer-review-unlock">
            <div aria-hidden="true" className="quiz-engine__answer-review-lock">🔒</div>
            <span>{translations.quiz.answersToReview}</span>
            <h3>{reviewUnlockCopy?.title ?? translations.quiz.answersToReview}</h3>
            {reviewUnlockCopy?.copy ? <p>{reviewUnlockCopy.copy}</p> : null}
            <button className="quiz-engine__primary" disabled={adBusy} onClick={unlockIncorrectAnswers} type="button">
              {adBusy ? translations.ad.loading : reviewUnlockCopy?.button ?? translations.results.viewResults}
            </button>
            <small>{reviewUnlockCopy?.adNote ?? translations.ad.stepOne}</small>
          </section>
        ) : !detailedResults && quiz.engine.scoring.type === "correct-answer" ? (
          <section className="quiz-engine__answer-review">
            <h3>{translations.quiz.answersToReview}</h3>
            {incorrectQuestions.length === 0 ? (
              <p>{translations.quiz.perfectReview}</p>
            ) : (
              <div>
                {incorrectQuestions.map((question) => (
                  <article key={question.id}>
                    <span>{quiz.stages[question.stage]}</span>
                    <h4>{question.prompt}</h4>
                    <dl>
                      <div><dt>{translations.quiz.yourAnswer}</dt><dd>{question.choices[answers[question.id]] ?? "—"}</dd></div>
                      <div><dt>{translations.quiz.correctAnswer}</dt><dd>{question.answerIndex === undefined ? "—" : question.choices[question.answerIndex]}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}
        {detailedResults && resultInsights ? (
          <section className="quiz-engine__result-takeaway">
            <h3>{resultInsights.snapshot}</h3>
            <p className="quiz-engine__result-copy">{result.profile.copy}</p>
          </section>
        ) : null}
        {quiz.engine.resultAds && quiz.engine.resultAds.inlinePlacements > 3
          ? <ResultDisplayAd config={quiz.engine.resultAds} placement="after-summary" />
          : null}
          </>
        )}
      </section>
      {quiz.engine.resultAds?.sticky ? <ResultStickyAd adUnitPath={quiz.engine.resultAds.adUnitPath} /> : null}
      <QuizAbout label={translations.quiz.restartTest} onRestart={restartQuiz} quiz={quiz} title={translations.quiz.aboutTitle} />
      </>
    );
  }

  return (
    <>
    <section className={`quiz-engine__question-shell${quiz.career?.continuousShell ? " quiz-engine__continuous-shell" : ""}`} data-round={currentStage + 1}>
      <div className="quiz-engine__progress-head">
        <span>{quiz.career
          ? quiz.career.hideJourneyLength ? quiz.career.stages[currentStage].difficulty : currentStage === 0 ? quiz.career.stages[0].difficulty : `${quiz.career.levelLabel} ${currentStage + 1} / ${quiz.stages.length}`
          : quiz.progressLabel ? `${progress}% ${quiz.progressLabel}` : `${translations.quiz.round} ${currentStage + 1}`}</span>
        <strong>{quiz.stages[currentStage]}</strong>
        {quiz.career ? <em>{quiz.career.hideJourneyLength ? `${stageQuestionIndex + 1} of ${stageQuestions.length}` : currentStage > 0 ? quiz.career.stages[currentStage].difficulty : `${stageQuestionIndex + 1} of ${stageQuestions.length}`}</em> : null}
      </div>
      <div className="quiz-engine__progress" data-complete={quiz.career && displayedStageProgress === 100 ? true : undefined}>
        <i style={{ width: `${quiz.career ? displayedStageProgress : progress}%` }} />
      </div>
      <article className="quiz-engine__question quiz-engine__card" data-question-id={currentQuestion.id}>
        {currentQuestion.context && (!currentQuestion.study || studyComplete) ? <p className="quiz-engine__question-context">{currentQuestion.context}</p> : null}
        <h1>{currentQuestion.study && !studyComplete ? currentQuestion.study.title : currentQuestion.prompt}</h1>
        {quiz.engine.questionAd && questionIndex + 1 >= quiz.engine.questionAd.fromQuestion
          ? <QuestionDisplayAd config={quiz.engine.questionAd} placement="below-question" questionId={currentQuestion.id} />
          : null}
        <QuestionRenderer
          answer={selectedAnswer}
          feedback={quiz.engine.flow.feedback}
          onAnswer={answerQuestion}
          onStudyComplete={completeStudy}
          question={currentQuestion}
          studyComplete={studyComplete}
        />
        {quiz.engine.questionAd && questionIndex + 1 >= quiz.engine.questionAd.fromQuestion
          ? <QuestionDisplayAd config={quiz.engine.questionAd} placement="below-answers" questionId={currentQuestion.id} />
          : null}
        {quiz.engine.flow.advance === "manual" ? (
          <button
            aria-hidden={selectedAnswer === undefined || undefined}
            className="quiz-engine__primary quiz-engine__next-question"
            data-ready={selectedAnswer !== undefined}
            disabled={selectedAnswer === undefined}
            onClick={moveForward}
            tabIndex={selectedAnswer === undefined ? -1 : undefined}
            type="button"
          >
            {questionIndex === quiz.questions.length - 1 ? translations.results.viewResults : quiz.nextQuestionLabel ?? translations.quiz.continue}
          </button>
        ) : null}
      </article>
    </section>
    <QuizAbout label={translations.quiz.restartTest} onRestart={restartQuiz} quiz={quiz} title={translations.quiz.aboutTitle} />
    </>
  );
}
