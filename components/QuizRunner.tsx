"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { ResultScreen } from "@/components/ResultScreen";
import { StageResultScreen } from "@/components/StageResultScreen";
import {
  showRewardedAdBeforeFinalResults,
  showRewardedAdBeforeStageResults,
  showRewardedAdBeforeStart,
} from "@/lib/rewardedAds";
import {
  trackQuestionAnswered,
  trackQuizComplete,
  trackQuizStart,
  trackStageComplete,
} from "@/lib/tracking";
import type { SupportedLocale, Translations } from "@/lib/i18n";
import type { Quiz } from "@/lib/quizzes";

type QuizRunnerProps = {
  locale: SupportedLocale;
  quiz: Quiz;
  translations: Translations;
};

type QuizScreen = "start" | "question" | "stage-gate" | "result-gate" | "results";

const correctAnswerDelayMs = 950;
const wrongAnswerDelayMs = 1150;
const stageEncouragement = [
  "You cleared the warm-up. Next comes pattern speed.",
  "Good pattern work. Next comes visual reasoning.",
  "Nice focus. The next round checks close attention.",
  "Your score is building. Next comes number logic.",
  "Strong pace. The next round moves into word codes.",
  "You’re deep into the test now. Next comes deduction.",
  "Only focused players reach this point. Next comes lateral thinking.",
  "Final stretch. The last round is the scholar challenge.",
];

export function QuizRunner({ quiz, translations }: QuizRunnerProps) {
  const [screen, setScreen] = useState<QuizScreen>("start");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [hasUnlockedReview, setHasUnlockedReview] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStageLoading, setIsStageLoading] = useState(false);
  const [isRevealingResults, setIsRevealingResults] = useState(false);
  const [isUnlockingReview, setIsUnlockingReview] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressKey = `rainbowHub:${quiz.slug}:${quiz.questions.length}:progress`;

  const score = useMemo(
    () =>
      quiz.questions.reduce(
        (total, question, index) => total + (answers[index] === question.answerIndex ? 1 : 0),
        0,
      ),
    [answers, quiz.questions],
  );

  const answeredCount = Object.keys(answers).length;
  const stageIndexes = useMemo(
    () => Array.from(new Set(quiz.questions.map((quizQuestion) => quizQuestion.stage ?? 0))).sort((a, b) => a - b),
    [quiz.questions],
  );
  const question = quiz.questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];
  const hasAnsweredCurrent = selectedAnswer !== undefined;
  const stageName = quiz.stages[question.stage ?? 0] ?? quiz.stages[0] ?? quiz.title;
  const currentStage = question.stage ?? 0;
  const currentStageQuestions = quiz.questions
    .map((quizQuestion, index) => ({ quizQuestion, index }))
    .filter(({ quizQuestion }) => (quizQuestion.stage ?? 0) === currentStage);
  const currentStagePosition = currentStageQuestions.findIndex(({ index }) => index === currentQuestion) + 1;
  const currentStageTotal = currentStageQuestions.length || 1;
  const currentStageProgress = Math.max(0, Math.round(((currentStagePosition - 1) / currentStageTotal) * 100));
  const firstStageQuestionCount = quiz.questions.filter(
    (quizQuestion) => (quizQuestion.stage ?? 0) === (quiz.questions[0]?.stage ?? 0),
  ).length;
  const completedStage = Math.max(0, quiz.questions[Math.max(0, currentQuestion - 1)]?.stage ?? 0);
  const completedStageName = quiz.stages[completedStage] ?? quiz.title;
  const completedStageQuestions = quiz.questions
    .map((quizQuestion, index) => ({ quizQuestion, index }))
    .filter(({ quizQuestion }) => (quizQuestion.stage ?? 0) === completedStage);
  const completedStageScore = completedStageQuestions.reduce(
    (total, { quizQuestion, index }) => total + (answers[index] === quizQuestion.answerIndex ? 1 : 0),
    0,
  );
  const nextStage = stageIndexes.find((stage) => stage > completedStage);
  const nextStageName = nextStage !== undefined ? quiz.stages[nextStage] ?? `${translations.quiz.round} ${nextStage + 1}` : null;
  const stageBadge =
    completedStageScore >= Math.ceil(completedStageQuestions.length * 0.75)
      ? translations.results.excellent
      : completedStageScore >= Math.ceil(completedStageQuestions.length * 0.5)
        ? translations.results.strong
        : translations.results.keepGoing;

  function clearAdvanceTimer() {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }

  function saveProgress(nextCurrentQuestion = currentQuestion, nextAnswers = answers, nextScreen = screen) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      progressKey,
      JSON.stringify({
        answers: nextAnswers,
        currentQuestion: nextCurrentQuestion,
        screen: nextScreen,
        timestamp: Date.now(),
      }),
    );
  }

  function clearProgress() {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(progressKey);
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return clearAdvanceTimer;
    }

    try {
      const saved = window.localStorage.getItem(progressKey);

      if (!saved) {
        return clearAdvanceTimer;
      }

      const parsed = JSON.parse(saved) as {
        answers?: Record<string, number>;
        currentQuestion?: number;
        screen?: QuizScreen;
      };
      const savedAnswers = parsed.answers ?? {};
      const savedCurrent = parsed.currentQuestion ?? 0;

      if (!Number.isInteger(savedCurrent) || savedCurrent < 0 || savedCurrent >= quiz.questions.length) {
        clearProgress();
        return clearAdvanceTimer;
      }

      setAnswers(
        Object.fromEntries(
          Object.entries(savedAnswers)
            .map(([key, value]) => [Number(key), value])
            .filter(([key, value]) => Number.isInteger(key) && typeof value === "number"),
        ) as Record<number, number>,
      );
      setCurrentQuestion(savedCurrent);
      setScreen(parsed.screen === "stage-gate" || parsed.screen === "result-gate" ? parsed.screen : "question");
    } catch {
      clearProgress();
    }

    return clearAdvanceTimer;
  }, []);

  async function startQuiz() {
    clearAdvanceTimer();
    setIsStarting(true);
    await showRewardedAdBeforeStart();
    trackQuizStart({
      quiz_slug: quiz.slug,
      quiz_title: quiz.title,
      question_count: quiz.questions.length,
    });
    setCurrentQuestion(0);
    setAnswers({});
    setHasUnlockedReview(false);
    saveProgress(0, {}, "question");
    setScreen("question");
    setIsStarting(false);
  }

  function answerQuestion(choiceIndex: number) {
    if (hasAnsweredCurrent || screen !== "question") {
      return;
    }

    clearAdvanceTimer();
    const isCorrect = question.answerIndex === choiceIndex;
    const nextAnswers = { ...answers, [currentQuestion]: choiceIndex };
    setAnswers(nextAnswers);
    saveProgress(currentQuestion, nextAnswers, "question");
    trackQuestionAnswered({
      quiz_slug: quiz.slug,
      question_index: currentQuestion,
      stage: question.stage ?? 0,
      selected_answer_index: choiceIndex,
      correct: isCorrect,
    });

    advanceTimer.current = setTimeout(() => {
      advanceAfterAnswer(choiceIndex);
    }, isCorrect ? correctAnswerDelayMs : wrongAnswerDelayMs);
  }

  function advanceAfterAnswer(choiceIndex: number) {
    const currentStage = question.stage ?? 0;
    const nextQuestion = quiz.questions[currentQuestion + 1];
    const nextStage = nextQuestion?.stage ?? currentStage;
    const nextAnswers = { ...answers, [currentQuestion]: choiceIndex };
    const nextScore = quiz.questions.reduce(
      (total, quizQuestion, index) => total + (nextAnswers[index] === quizQuestion.answerIndex ? 1 : 0),
      0,
    );

    if (!nextQuestion) {
      trackStageComplete({
        quiz_slug: quiz.slug,
        stage: currentStage,
        stage_name: stageName,
        score: nextScore,
      });
      setScreen("result-gate");
      saveProgress(currentQuestion, nextAnswers, "result-gate");
      return;
    }

    if (nextStage !== currentStage) {
      const stageQuestions = quiz.questions.filter((quizQuestion) => (quizQuestion.stage ?? 0) === currentStage);
      const stageScore = quiz.questions.reduce((total, quizQuestion, index) => {
        if ((quizQuestion.stage ?? 0) !== currentStage) {
          return total;
        }

        return total + (nextAnswers[index] === quizQuestion.answerIndex ? 1 : 0);
      }, 0);

      trackStageComplete({
        quiz_slug: quiz.slug,
        stage: currentStage,
        stage_name: stageName,
        stage_score: stageScore,
        stage_question_count: stageQuestions.length,
      });
      setCurrentQuestion((value) => value + 1);
      setScreen("stage-gate");
      saveProgress(currentQuestion + 1, nextAnswers, "stage-gate");
      return;
    }

    setCurrentQuestion((value) => value + 1);
    saveProgress(currentQuestion + 1, nextAnswers, "question");
  }

  async function continueFromStageGate() {
    setIsStageLoading(true);
    await showRewardedAdBeforeStageResults();
    setScreen("question");
    saveProgress(currentQuestion, answers, "question");
    setIsStageLoading(false);
  }

  async function revealResults() {
    setIsRevealingResults(true);
    await showRewardedAdBeforeFinalResults();
    trackQuizComplete({
      quiz_slug: quiz.slug,
      quiz_title: quiz.title,
      score,
      question_count: quiz.questions.length,
    });
    setScreen("results");
    clearProgress();
    setIsRevealingResults(false);
  }

  async function unlockReview() {
    setIsUnlockingReview(true);
    await showRewardedAdBeforeFinalResults();
    setHasUnlockedReview(true);
    setIsUnlockingReview(false);
  }

  function restartQuiz() {
    clearAdvanceTimer();
    clearProgress();
    setScreen("start");
    setCurrentQuestion(0);
    setAnswers({});
    setHasUnlockedReview(false);
    setIsStageLoading(false);
    setIsRevealingResults(false);
    setIsUnlockingReview(false);
  }

  return (
    <div className={`legacy-quiz legacy-quiz--${quiz.slug}`} style={{ "--quiz-accent": quiz.accent } as CSSProperties}>
      <main className="legacy-main">
        {screen === "start" ? (
          <section className="legacy-card legacy-start">
            <div className="legacy-badge" aria-hidden="true">
              <span>{quiz.cardIcon}</span>
            </div>
            <h1>{quiz.pageTitle}</h1>
            <p className="legacy-sub">
              {translations.quiz.quickQuestionsPrefix} {firstStageQuestionCount} {translations.quiz.quickQuestionsSuffix}
              <br />
              {translations.quiz.neverReachPrefix} {quiz.stages.at(-1) ?? "final"} {translations.quiz.neverReachSuffix}
            </p>
            <div className="legacy-social">
              <div className="legacy-avatars" aria-hidden="true">
                <span className="legacy-avatar legacy-avatar--one" />
                <span className="legacy-avatar legacy-avatar--two" />
                <span className="legacy-avatar legacy-avatar--three" />
                <span className="legacy-avatar legacy-avatar--four" />
              </div>
              <div>
                <strong>{translations.quiz.peopleTried}</strong>
              </div>
            </div>
            <button className="legacy-primary" type="button" disabled={isStarting} onClick={startQuiz}>
              <span aria-hidden="true">▶</span> {isStarting ? translations.quiz.preparing : translations.quiz.startTest}
            </button>
            <div className="legacy-ad-note">
              <span className="legacy-shield" aria-hidden="true">✓</span>
              <span>
                {translations.quiz.shortAd} — <b>{translations.quiz.thenBegins}</b>
              </span>
            </div>
          </section>
        ) : null}

        {screen === "question" ? (
          <>
            <div className="legacy-progress">
              <div className="legacy-progress__row">
                <strong>{translations.quiz.round} {(question.stage ?? 0) + 1}</strong>
                <span>
                  {stageName} · {translations.quiz.question} {currentStagePosition}/{currentStageTotal}
                </span>
              </div>
              <div className="legacy-bar">
                <span style={{ width: `${currentStageProgress}%` }} />
              </div>
            </div>

            <article className="legacy-card legacy-question">
              <p className="legacy-count">
                {translations.quiz.question} {currentQuestion + 1} {translations.quiz.of} {quiz.questions.length}
              </p>
              <h2>{question.prompt}</h2>
              {question.visual ? (
                <div
                  className="legacy-visual"
                  dangerouslySetInnerHTML={{ __html: question.visual }}
                />
              ) : null}
              <div className="legacy-answers">
                {question.choices.map((choice, choiceIndex) => {
                  const isSelected = selectedAnswer === choiceIndex;
                  const isCorrect = question.answerIndex === choiceIndex;
                  const revealCorrect = hasAnsweredCurrent && isCorrect;
                  const revealWrong = hasAnsweredCurrent && isSelected && !isCorrect;

                  return (
                    <button
                      key={`${choice}-${choiceIndex}`}
                      type="button"
                      disabled={hasAnsweredCurrent}
                      onClick={() => answerQuestion(choiceIndex)}
                      className={[
                        "legacy-answer",
                        isSelected ? "selected" : "",
                        revealCorrect ? "correct" : "",
                        revealWrong ? "wrong" : "",
                        hasAnsweredCurrent && !isSelected ? "is-dimmed" : "",
                      ].join(" ")}
                    >
                      <small>{String.fromCharCode(65 + choiceIndex)}</small>
                      {choice}
                    </button>
                  );
                })}
              </div>
            </article>
          </>
        ) : null}

        {screen === "stage-gate" ? (
          <StageResultScreen
            badge={stageBadge}
            buttonLabel={
              nextStageName
                ? `${translations.results.nextStage}: ${nextStageName} →`
                : `${translations.results.viewResults} →`
            }
            copy={`${stageEncouragement[Math.min(completedStage, stageEncouragement.length - 1)]} ${nextStageName ? `Next: ${nextStageName}` : ""}`}
            helperText={translations.rewardedAd.helper}
            isLoading={isStageLoading}
            scoreLabel={`${score}/${currentQuestion}`}
            stageName={completedStageName}
            title={`${translations.quiz.round} ${completedStage + 1} ${translations.results.stageComplete}`}
            translations={translations}
            onContinue={continueFromStageGate}
          />
        ) : null}

        {screen === "result-gate" ? (
          <section className="legacy-card legacy-result">
            <span className="legacy-profile-badge">{translations.quiz.profileReady}</span>
            <h2>
              {translations.quiz.your} {quiz.title.replace(" Test", "").replace(" Check", "")} {translations.quiz.profile}
            </h2>
            <p className="legacy-sub">{translations.rewardedAd.helper}</p>
            <button
              type="button"
              disabled={answeredCount !== quiz.questions.length || isRevealingResults}
              onClick={revealResults}
              className="legacy-primary"
            >
              {isRevealingResults
                ? translations.quiz.preparingResults
                : `${translations.quiz.revealPrefix} ${quiz.title.replace(" Test", "").replace(" Check", "")} ${translations.quiz.profile} →`}
            </button>
          </section>
        ) : null}

        {screen === "results" ? (
          <ResultScreen
            answers={answers}
            hasUnlockedReview={hasUnlockedReview}
            isUnlockingReview={isUnlockingReview}
            quiz={quiz}
            score={score}
            translations={translations}
            onUnlockReview={unlockReview}
          />
        ) : null}
      </main>
      {quiz.infoPanel ? (
        <section className="legacy-card quiz-info-panel">
          <h2>{quiz.infoPanel.title}</h2>
          <p>{quiz.infoPanel.intro}</p>
          <div className="quiz-info-panel__columns">
            {quiz.infoPanel.columns.map((column) => (
              <div key={column.title}>
                <h3>{column.title}</h3>
                <p>{column.body}</p>
              </div>
            ))}
          </div>
          <div className="quiz-info-panel__footer">
            <h3>{quiz.infoPanel.footerTitle}</h3>
            <p>{quiz.infoPanel.footerBody}</p>
          </div>
          <button type="button" onClick={restartQuiz} className="legacy-primary legacy-restart">
            {translations.quiz.restartTest}
          </button>
        </section>
      ) : null}
    </div>
  );
}
