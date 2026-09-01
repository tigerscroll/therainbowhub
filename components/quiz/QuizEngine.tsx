"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { ExperienceLanding } from "@/components/experience/ExperienceLanding";
import { useRewardedGate } from "@/components/experience/useRewardedGate";
import type { SupportedLocale, Translations } from "@/lib/i18n";
import type { Quiz, QuizQuestion, QuizRecommendation } from "@/lib/quizzes";
import { getStageCompletionPercentage } from "./engineState";
import { getQuizStorageKey, isProgressTimestampFresh, STORAGE_VERSION } from "./progressStorage";
import { QuestionRenderer } from "./QuestionRenderer";
import { QuizAbout } from "./QuizAbout";
import { resolveArtworkVariant, resolveProfileArtwork } from "./profileArtwork";
import { QuizRecommendations } from "./QuizRecommendations";
import { scoreQuiz, type QuizAnswers } from "./scoring";

type QuizEngineProps = {
  locale: SupportedLocale;
  quiz: Quiz;
  recommendations: QuizRecommendation[];
  startInstructionEnabled: boolean;
  translations: Translations;
};

type QuizScreen = "landing" | "question" | "preparing" | "checkpoint" | "results";
type SavedScreen = Exclude<QuizScreen, "landing">;

const RESULT_PREPARATION_FALLBACK_MS = 1600;
const RESULT_READY_CTA_DELAY_MS = 600;

type SavedProgress = {
  version: 3;
  signature: string;
  answers: QuizAnswers;
  questionIndex: number;
  completedStage: number;
  screen: SavedScreen;
  studiedQuestions?: string[];
  rewardClosedSent?: boolean;
  reviewUnlocked?: boolean;
  updatedAt: string;
};

function trackQuizEvent(name: string, quiz: Quiz, locale: SupportedLocale) {
  if (typeof window === "undefined") return;
  window.fbq?.("trackCustom", name, { quiz_slug: quiz.slug, locale });
}

function formatSocialProof(template: string, count: number, locale: SupportedLocale) {
  return template.replace("{count}", new Intl.NumberFormat(locale).format(count));
}

function safeSavedProgress(raw: unknown, quiz: Quiz, signature: string): SavedProgress | null {
  if (!raw || typeof raw !== "object") return null;
  const saved = raw as Partial<SavedProgress>;
  if (saved.version !== STORAGE_VERSION || saved.signature !== signature) return null;
  if (!isProgressTimestampFresh(saved.updatedAt)) return null;
  if (!Number.isInteger(saved.questionIndex) || saved.questionIndex! < 0 || saved.questionIndex! >= quiz.questions.length) return null;
  if (!Number.isInteger(saved.completedStage) || saved.completedStage! < 0 || saved.completedStage! >= quiz.stages.length) return null;
  if (!saved.screen || !["question", "preparing", "checkpoint", "results"].includes(saved.screen)) return null;
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

export function QuizEngine({ locale, quiz, recommendations, startInstructionEnabled, translations }: QuizEngineProps) {
  const startsOnQuestion = quiz.engine.startOnLoad || Boolean(quiz.questions[0]?.study?.rewarded);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [completedStage, setCompletedStage] = useState(0);
  const [screen, setScreen] = useState<QuizScreen>(() => startsOnQuestion ? "question" : "landing");
  const [hydrated, setHydrated] = useState(false);
  const [studiedQuestions, setStudiedQuestions] = useState<string[]>([]);
  const [rewardClosedSent, setRewardClosedSent] = useState(false);
  const [reviewUnlocked, setReviewUnlocked] = useState(false);
  const [showStartPrompt, setShowStartPrompt] = useState(false);
  const [startPromptMinHeight, setStartPromptMinHeight] = useState<number | null>(null);
  const [checkpointCtaReady, setCheckpointCtaReady] = useState(false);
  const landingShellRef = useRef<HTMLElement | null>(null);
  const preloadedArtwork = useRef(new Set<string>());
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
        question.study ? [question.study.presentation, question.study.items, question.study.durationMs, question.study.mode, question.study.rewarded] : null,
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
  const { busy: adBusy, cancelGate, runGate } = useRewardedGate({
    attempts: quiz.engine.rewarded.attempts,
    onRewardClosed: () => setRewardClosedSent(true),
    rewardClosedAlreadySent: rewardClosedSent,
  });
  const currentQuestion = quiz.questions[questionIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const studyComplete = currentQuestion ? studiedQuestions.includes(currentQuestion.id) : true;
  const currentStage = currentQuestion?.stage ?? 0;
  const stageQuestions = quiz.questions.filter((question) => question.stage === currentStage);
  const stageQuestionIndex = Math.max(0, stageQuestions.findIndex((question) => question.id === currentQuestion?.id));
  const progress = getStageCompletionPercentage(quiz.questions, answers, currentStage);
  const displayedStageProgress = progress;
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
      rewardClosedSent,
      reviewUnlocked,
      updatedAt: new Date().toISOString(),
    };
    try { window.localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { /* The quiz still works if storage is blocked. */ }
  }, [answers, completedStage, hydrated, progressSignature, questionIndex, rewardClosedSent, reviewUnlocked, screen, storageKey, studiedQuestions]);

  useEffect(() => {
    // Portrait-library quizzes warm only the next visual interaction. This keeps
    // answer artwork instant without downloading an unreached stage up front.
    if (!quiz.theme.artwork?.profileVariants) return;
    const targetStage = screen === "checkpoint"
      ? Math.min(completedStage + 1, quiz.stages.length - 1)
      : currentStage;
    const stageVisualQuestions = quiz.questions
      .filter((question) => question.stage === targetStage && Boolean(question.image || question.icons?.some((icon) => icon.startsWith("/quizzes/"))));
    const firstUpcomingVisual = screen === "question"
      ? stageVisualQuestions.find((question) => quiz.questions.indexOf(question) > questionIndex)
      : stageVisualQuestions[0];
    const preloadQuestions = screen === "question"
      ? [currentQuestion, firstUpcomingVisual].filter((question): question is QuizQuestion => Boolean(question))
      : firstUpcomingVisual ? [firstUpcomingVisual] : [];
    const sources = preloadQuestions
      .flatMap((question) => [question.image?.src, ...(question.icons ?? [])])
      .filter((source): source is string => typeof source === "string" && source.startsWith("/quizzes/"));
    const checkpointVariantAssets = quiz.theme.artwork.checkpointVariants;
    const checkpointVariant = checkpointVariantAssets
      ? resolveArtworkVariant(quiz, answers, Object.keys(checkpointVariantAssets))
      : undefined;
    const checkpoint = (checkpointVariant ? checkpointVariantAssets?.[checkpointVariant]?.[currentStage] : undefined)
      ?? quiz.theme.artwork.checkpoints?.[currentStage];
    if (screen === "question" && checkpoint) sources.push(checkpoint);

    sources.forEach((source) => {
      if (preloadedArtwork.current.has(source)) return;
      preloadedArtwork.current.add(source);
      const image = new window.Image();
      image.decoding = "async";
      image.src = source;
    });
  }, [answers, completedStage, currentQuestion, currentStage, questionIndex, quiz, screen]);

  useEffect(() => {
    if (!showStartPrompt || startInstructionEnabled) return;
    document.documentElement.classList.add("quiz-reward-prompt-open");
    document.body.classList.add("quiz-reward-prompt-open");
    return () => {
      document.documentElement.classList.remove("quiz-reward-prompt-open");
      document.body.classList.remove("quiz-reward-prompt-open");
    };
  }, [showStartPrompt, startInstructionEnabled]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "auto" });
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }

  async function runRewardedGate(onComplete: () => void, scrollAfter = true) {
    await runGate(onComplete, { scrollAfter });
  }

  function moveForward() {
    const nextIndex = questionIndex + 1;
    if (nextIndex >= quiz.questions.length) {
      setCompletedStage(currentStage);
      setScreen("preparing");
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

  useEffect(() => {
    if (screen !== "preparing") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const reducedMotionTimer = window.setTimeout(() => setScreen("checkpoint"), 0);
      return () => window.clearTimeout(reducedMotionTimer);
    }
    const timer = window.setTimeout(() => setScreen("checkpoint"), RESULT_PREPARATION_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [screen]);

  function completeResultPreparation() {
    setScreen((current) => current === "preparing" ? "checkpoint" : current);
  }

  useEffect(() => {
    if (screen !== "checkpoint") {
      setCheckpointCtaReady(false);
      return;
    }
    if (completedStage < quiz.stages.length - 1) {
      setCheckpointCtaReady(true);
      return;
    }
    const timer = window.setTimeout(() => setCheckpointCtaReady(true), RESULT_READY_CTA_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [completedStage, quiz.stages.length, screen]);

  function answerQuestion(choiceIndex: number) {
    if (!currentQuestion || selectedAnswer !== undefined) return;
    setAnswers((current) => ({ ...current, [currentQuestion.id]: choiceIndex }));
  }

  function completeStudy() {
    if (!currentQuestion?.study) return;
    const complete = () => {
      setStudiedQuestions((current) => current.includes(currentQuestion.id) ? current : [...current, currentQuestion.id]);
      scrollToTop();
    };
    if (currentQuestion.study.rewarded) void runRewardedGate(complete);
    else complete();
  }

  function beginQuiz() {
    setScreen("question");
  }

  function startQuiz() {
    if (quiz.engine.rewarded.start && startInstructionEnabled) {
      setStartPromptMinHeight(landingShellRef.current?.getBoundingClientRect().height ?? null);
      setShowStartPrompt(true);
      scrollToTop();
    }
    else if (quiz.engine.rewarded.start && quiz.engine.rewarded.confirmStart && quiz.landing.startPrompt) {
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

  function unlockIncorrectAnswers() {
    void runRewardedGate(() => setReviewUnlocked(true), false);
  }

  function restartQuiz() {
    cancelGate();
    try { window.localStorage.removeItem(storageKey); } catch { /* Storage can be unavailable. */ }
    setAnswers({});
    setQuestionIndex(0);
    setCompletedStage(0);
    setStudiedQuestions([]);
    setRewardClosedSent(false);
    setReviewUnlocked(false);
    setStartPromptMinHeight(null);
    setShowStartPrompt(false);
    setScreen(startsOnQuestion ? "question" : "landing");
    scrollToTop();
  }

  if (screen === "landing") {
    if (showStartPrompt && startInstructionEnabled && quiz.engine.rewarded.start) {
      return (
        <>
        <section
          className="quiz-engine__landing quiz-engine__landing--start-instruction"
          data-start-instruction="true"
          style={startPromptMinHeight ? { minHeight: `${startPromptMinHeight}px` } : undefined}
        >
          <div aria-live="polite" className="quiz-engine__start-instruction">
            <div aria-hidden="true" className="quiz-engine__landing-badge quiz-engine__start-instruction-icon"><span>✓</span></div>
            <h1>{translations.ad.readyTitle}</h1>
            <p className="quiz-engine__quick-start quiz-engine__start-instruction-copy">{translations.ad.readyCopy}</p>
            <p className="quiz-engine__quick-start quiz-engine__start-instruction-return">
              <span>{translations.ad.returnInstructionBefore} </span>
              <strong>{translations.ad.returnInstructionAction}</strong>
              <br />
              <span>{translations.ad.returnInstructionAfter}</span>
            </p>
            <button autoFocus className="quiz-engine__primary" disabled={adBusy} onClick={confirmQuizStart} type="button">
              <span aria-hidden="true" className="quiz-engine__primary-icon">▶</span>
              {adBusy ? translations.ad.loading : translations.ad.watchAdStart}
            </button>
            <p className="quiz-engine__ad-note quiz-engine__start-instruction-reassurance">{translations.ad.startsImmediately}</p>
          </div>
        </section>
        <QuizAbout quiz={quiz} title={translations.quiz.aboutTitle} />
        </>
      );
    }
    return (
      <>
      <ExperienceLanding
        adNote={quiz.engine.rewarded.start && !quiz.engine.rewarded.confirmStart && !startInstructionEnabled ? translations.ad.startNote : undefined}
        avatars={quiz.landing.socialAvatars}
        busy={adBusy}
        busyLabel={translations.ad.loading}
        ctaLabel={quiz.landing.ctaLabel ?? translations.quiz.startTest}
        icon={quiz.cardIcon}
        intro={quiz.landing.quickStartText}
        onStart={startQuiz}
        ref={landingShellRef}
        showSocialProof={quiz.landing.showSocialProof}
        socialProofText={formatSocialProof(translations.quiz.socialProofTaken, quiz.landing.socialProofCount, locale)}
        title={quiz.title}
      />
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
              {adBusy ? translations.ad.loading : quiz.landing.startPrompt.button}
            </button>
          </section>
        </div>
      ) : null}
      </>
    );
  }

  if (screen === "preparing") {
    return (
      <section
        aria-busy="true"
        aria-live="polite"
        className="quiz-engine__preparing quiz-engine__card quiz-engine__continuous-shell"
        role="status"
      >
        <div aria-hidden="true" className="quiz-engine__result-icon quiz-engine__preparing-icon">
          {quiz.theme.artwork?.icon ?? quiz.cardIcon}
        </div>
        <h2>{translations.quiz.preparingResultTitle}</h2>
        <p>{translations.quiz.preparingResultCopy}</p>
        <div aria-hidden="true" className="quiz-engine__preparing-mark"><span /><span /><span /></div>
        <div aria-hidden="true" className="quiz-engine__preparing-progress">
          <i onAnimationEnd={completeResultPreparation} />
        </div>
      </section>
    );
  }

  if (screen === "checkpoint") {
    const isFinalStage = completedStage >= quiz.stages.length - 1;
    const isSingleStage = quiz.stages.length === 1;
    const checkpoint = quiz.checkpoint!;
    const career = quiz.career!;
    const careerStage = career.stages[completedStage];
    const checkpointButton = isFinalStage
      ? careerStage.preAdButton ?? translations.results.viewResults
      : translations.quiz.continue;
    const completedStageCount = completedStage + 1;
    const checkpointPercent = Math.round((completedStageCount / quiz.stages.length) * 100);
    const checkpointVariantAssets = quiz.theme.artwork?.checkpointVariants;
    const checkpointAdNote = isFinalStage ? translations.ad.resultsNote : translations.ad.continueNote;
    const checkpointVariant = checkpointVariantAssets
      ? resolveArtworkVariant(quiz, answers, Object.keys(checkpointVariantAssets))
      : undefined;
    const checkpointArtwork = (checkpointVariant ? checkpointVariantAssets?.[checkpointVariant]?.[completedStage] : undefined)
      ?? quiz.theme.artwork?.checkpoints?.[completedStage];
    return (
      <>
      <section
        className={`quiz-engine__checkpoint quiz-engine__card quiz-engine__continuous-shell quiz-engine__checkpoint--progress-career${isSingleStage ? " quiz-engine__checkpoint--single-stage" : ""}`}
        data-cta-ready={isFinalStage ? checkpointCtaReady : undefined}
        data-round={completedStage + 1}
      >
        {checkpointArtwork ? (
          <div className="quiz-engine__checkpoint-artwork" aria-hidden="true">
            <img alt="" decoding="async" src={checkpointArtwork} />
          </div>
        ) : (
          <div className="quiz-engine__checkpoint-icon" aria-hidden="true">{isFinalStage ? checkpoint.finalIcon ?? "✦" : "✓"}</div>
        )}
        <h2>{careerStage.preAdTitle}</h2>
        {careerStage.preAdCopy ? <p>{careerStage.preAdCopy}</p> : null}
        {careerStage.preAdChecks?.length ? (
          <ul className="quiz-engine__checklist quiz-engine__career-checklist">
            {careerStage.preAdChecks.map((item) => <li key={item}><span>✓</span>{item}</li>)}
          </ul>
        ) : null}
        {!isSingleStage ? (
          <section className="quiz-engine__career-result-progress quiz-engine__checkpoint-journey-progress" style={{ "--career-result-progress": `${checkpointPercent}%` } as CSSProperties}>
            <div>
              <span>{career.resultProgressLabel ?? translations.quiz.challengeProgress}</span>
              <strong>{(career.resultProgressComplete ?? translations.quiz.progressComplete).replace("{value}", String(checkpointPercent))}</strong>
            </div>
            <i aria-hidden="true"><b /></i>
          </section>
        ) : null}
        {!isFinalStage && careerStage.next ? (
          <div className="quiz-engine__checkpoint-next quiz-engine__checkpoint-next--career">
            <span>{careerStage.next.eyebrow}</span>
            <strong>{careerStage.next.title}</strong>
            <small>{careerStage.next.tagline}</small>
          </div>
        ) : null}
        <button className="quiz-engine__primary" disabled={adBusy || (isFinalStage && !checkpointCtaReady)} onClick={continueAfterCheckpoint} type="button">
          {checkpoint?.buttonIcon ? <span aria-hidden="true" className="quiz-engine__primary-icon">{checkpoint.buttonIcon}</span> : null}
          {adBusy ? translations.ad.loading : careerStage.preAdButton ?? checkpointButton}
          {!isFinalStage && !adBusy ? (
            <span aria-hidden="true" className="quiz-engine__primary-arrow">
              <svg focusable="false" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          ) : null}
        </button>
        {quiz.engine.rewarded.stages && checkpoint ? (
          <p className="quiz-engine__ad-note quiz-engine__checkpoint-ad-note">
            <span aria-hidden="true">✓</span>
            {checkpointAdNote}
          </p>
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
    const profileArtwork = resolveProfileArtwork(quiz, answers, result.profile.id);
    const hasDerivedScore = result.derivedScore !== undefined && Boolean(scoreCopy?.derivedLabel);
    const consistency = estimate?.consistencyLabels[result.consistency];
    const revealConsistency = profileReveal?.consistencyLabels[result.consistency];
    const scoreInsights = scoreCopy?.insights;
    const estimateInsights = estimate?.insights;
    const resultInsights = scoreInsights ?? estimateInsights;
    const supportsAnswerReview = quiz.engine.scoring.type === "correct-answer" || quiz.engine.scoring.type === "hybrid-match";
    const incorrectQuestions = supportsAnswerReview
      ? quiz.questions.filter((question) => answers[question.id] !== question.answerIndex)
      : [];
    const reviewUnlockCopy = scoreCopy?.reviewUnlock;
    const estimateReviewUnlockCopy = estimate?.reviewUnlock;
    const detailedResults = supportsAnswerReview || Boolean(estimateReviewUnlockCopy);
    const requiresReviewUnlock = Boolean(
      supportsAnswerReview && !reviewUnlocked,
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
    return (
      <>
      <section
        className={`quiz-engine__results quiz-engine__card quiz-engine__continuous-shell${profileReveal ? " quiz-engine__profile-reveal" : ""}`}
        data-profile-id={profileReveal ? result.profile.id : undefined}
      >
        {profileReveal ? (
          <>
            <span className="quiz-engine__eyebrow">{profileReveal.eyebrow}</span>
            {profileArtwork ? (
              <div className="quiz-engine__profile-portrait">
                <img
                  alt={(profileReveal.portraitAlt ?? "{profile}").replace("{profile}", result.profile.title)}
                  decoding="async"
                  src={profileArtwork}
                />
              </div>
            ) : null}
            <div className="quiz-engine__profile-animal">{result.profile.tier}</div>
            <h2 className="quiz-engine__profile-title">{result.profile.title}</h2>
            <p className="quiz-engine__profile-aura">
              {profileReveal.auraLabelFirst ? (
                <><span>{profileReveal.auraLabel}</span><span>{result.profile.aura}</span></>
              ) : (
                <><span>{result.profile.aura}</span><span>{profileReveal.auraLabel}</span></>
              )}
            </p>
            <p className="quiz-engine__result-copy">{result.profile.copy}</p>
            {!reviewUnlocked ? (
              <section className="quiz-engine__answer-review-unlock">
                <div aria-hidden="true" className="quiz-engine__answer-review-lock">🔒</div>
                <span>{translations.results.matchBreakdown.eyebrow}</span>
                <h3>{translations.results.matchBreakdown.title}</h3>
                <p>{translations.results.matchBreakdown.copy}</p>
                <button className="quiz-engine__primary" disabled={adBusy} onClick={unlockIncorrectAnswers} type="button">
                  {adBusy ? translations.ad.loading : translations.results.matchBreakdown.button}
                </button>
                <small>{translations.results.matchBreakdown.adNote}</small>
              </section>
            ) : (
              <>
                <p className="quiz-engine__profile-chemistry"><span>{profileReveal.consistency}</span><strong>{revealConsistency}</strong></p>
                <p className="quiz-engine__profile-traits" aria-label={profileReveal.traitsLabel}>
                  {result.profile.traits?.map((trait) => <span key={trait}>{trait}</span>)}
                </p>
                <dl className="quiz-engine__result-signals">
                  <div><dt>{profileReveal.strongestEnergy}</dt><dd>{result.strongestSignal}</dd></div>
                  <div><dt>{profileReveal.hiddenEnergy}</dt><dd>{result.hiddenSignal}</dd></div>
                </dl>
                {Object.keys(result.dimensionScores).length ? (
                  <div className="quiz-engine__dimensions quiz-engine__dimensions--summary">
                    <h3>{translations.results.matchBreakdown.heading}</h3>
                    {Object.entries(result.dimensionScores).map(([label, value]) => (
                      <div className="quiz-engine__dimension" key={label}>
                        <div><span>{label}</span><strong>{value}%</strong></div>
                        <i><b style={{ width: `${value}%` }} /></i>
                      </div>
                    ))}
                  </div>
                ) : null}
                {profileReveal.firstFeatureLabel && result.profile.firstFeature ? (
                  <p className="quiz-engine__profile-first-feature"><strong>{profileReveal.firstFeatureLabel}</strong> {result.profile.firstFeature}</p>
                ) : null}
              </>
            )}
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
        <p className="quiz-engine__result-copy">{result.profile.copy}</p>
        {supportsAnswerReview && requiresReviewUnlock ? (
          <section className="quiz-engine__answer-review-unlock">
            <div aria-hidden="true" className="quiz-engine__answer-review-lock">🔒</div>
            <span>{translations.results.fullBreakdown.eyebrow}</span>
            <h3>{reviewUnlockCopy?.title ?? translations.results.fullBreakdown.title}</h3>
            <p>{reviewUnlockCopy?.copy ?? translations.results.fullBreakdown.copy}</p>
            <button className="quiz-engine__primary" disabled={adBusy} onClick={unlockIncorrectAnswers} type="button">
              {adBusy ? translations.ad.loading : reviewUnlockCopy?.button ?? translations.results.fullBreakdown.button}
            </button>
            <small>{reviewUnlockCopy?.adNote ?? translations.results.fullBreakdown.adNote}</small>
          </section>
        ) : supportsAnswerReview && reviewUnlocked ? (
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
        {estimate && (!detailedResults || reviewUnlocked) ? (
          <dl className="quiz-engine__result-signals">
            <div><dt>{estimate.strongestSignal}</dt><dd>{result.strongestSignal}</dd></div>
            <div><dt>{estimate.wildcard}</dt><dd>{result.wildcard}</dd></div>
            <div><dt>{estimate.consistency}</dt><dd>{consistency}</dd></div>
          </dl>
        ) : !estimate && !scoreCopy && !matchCopy ? <p className="quiz-engine__result-tier">{result.profile.tier}</p> : null}
        {matchCopy && reviewUnlocked ? (
          <dl className="quiz-engine__result-signals quiz-engine__result-signals--match">
            <div><dt>{matchCopy.strongest}</dt><dd>{result.strongestSignal}</dd></div>
            <div><dt>{matchCopy.preferredStyle}</dt><dd>{result.preferredStyle}</dd></div>
            <div><dt>{matchCopy.alternative}</dt><dd>{result.alternativeMatch}</dd></div>
            <div><dt>{matchCopy.wildcard}</dt><dd>{result.wildcardMatch}<small>{matchCopy.wildcardTemplate.replace("{value}", result.wildcardReason ?? "—")}</small></dd></div>
            <div><dt>{matchCopy.bestRound}</dt><dd>{result.bestStage}</dd></div>
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
        {reviewUnlocked && Object.keys(result.dimensionScores).length ? (
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
          </>
        )}
        {recommendations.length ? (
          <QuizRecommendations
            labels={{
              eyebrow: translations.quiz.recommendationsEyebrow,
              label: translations.quiz.recommendationsLabel,
              title: translations.quiz.recommendationsTitle,
            }}
            recommendations={recommendations}
          />
        ) : null}
      </section>
      <QuizAbout label={translations.quiz.restartTest} onRestart={restartQuiz} quiz={quiz} title={translations.quiz.aboutTitle} />
      </>
    );
  }

  return (
    <>
    <section className="quiz-engine__question-shell quiz-engine__continuous-shell" data-round={currentStage + 1}>
      <div className="quiz-engine__progress-head">
        <span>{quiz.career
          ? `${stageQuestionIndex + 1} ${translations.quiz.of} ${stageQuestions.length}`
          : quiz.progressLabel ? `${progress}% ${quiz.progressLabel}` : `${translations.quiz.round} ${currentStage + 1}`}</span>
        <strong>{currentQuestion.headerLabel ?? quiz.stages[currentStage]}</strong>
      </div>
      <div className="quiz-engine__progress" data-complete={quiz.career && displayedStageProgress === 100 ? true : undefined}>
        <i style={{ width: `${quiz.career ? displayedStageProgress : progress}%` }} />
      </div>
      <article className="quiz-engine__question quiz-engine__card" data-question-id={currentQuestion.id}>
        {currentQuestion.context && (!currentQuestion.study || studyComplete) ? <p className="quiz-engine__question-context">{currentQuestion.context}</p> : null}
        <h1>{currentQuestion.study && !studyComplete ? currentQuestion.study.title : currentQuestion.prompt}</h1>
        <QuestionRenderer
          answer={selectedAnswer}
          feedback={quiz.engine.flow.feedback}
          onAnswer={answerQuestion}
          onStudyComplete={completeStudy}
          question={currentQuestion}
          studyBusy={adBusy}
          studyBusyLabel={translations.ad.loading}
          studyComplete={studyComplete}
        />
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
