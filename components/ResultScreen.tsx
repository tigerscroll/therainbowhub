import type { Translations } from "@/lib/i18n";
import type { Quiz } from "@/lib/quizzes";

type ResultScreenProps = {
  answers: Record<number, number>;
  hasUnlockedReview: boolean;
  isUnlockingReview: boolean;
  quiz: Quiz;
  score: number;
  translations: Translations;
  onUnlockReview: () => void;
};

type StageScore = {
  name: string;
  correct: number;
  total: number;
  ratio: number;
};

function getStageScores(quiz: Quiz, answers: Record<number, number>) {
  return quiz.stages.map((name, stage) => {
    const questions = quiz.questions
      .map((question, index) => ({ question, index }))
      .filter(({ question }) => (question.stage ?? 0) === stage);
    const correct = questions.reduce(
      (total, { question, index }) => total + (answers[index] === question.answerIndex ? 1 : 0),
      0,
    );

    return {
      name,
      correct,
      total: questions.length,
      ratio: questions.length ? correct / questions.length : 0,
    };
  });
}

function getStrongestStage(stageScores: StageScore[]) {
  return [...stageScores].sort((a, b) => b.ratio - a.ratio || b.correct - a.correct)[0];
}

function formatTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function getResultProfile(quiz: Quiz, score: number, total: number, strongestStage: StageScore) {
  const ratio = total ? score / total : 0;
  const withStage = (template: string) => formatTemplate(template, { stage: strongestStage.name });
  const profile = [...quiz.result.profiles]
    .sort((a, b) => b.minRatio - a.minRatio)
    .find((item) => ratio >= item.minRatio) ?? quiz.result.profiles[quiz.result.profiles.length - 1];

  return {
    tier: profile.tier,
    title: profile.title,
    copy: withStage(profile.copy),
    percentile: profile.percentile,
  };
}

function scoreForCategories(quiz: Quiz, answers: Record<number, number>, categories: string[]) {
  const items = quiz.questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => question.category && categories.includes(question.category));

  if (!items.length) {
    return 0;
  }

  const correct = items.reduce(
    (total, { question, index }) => total + (answers[index] === question.answerIndex ? 1 : 0),
    0,
  );

  return Math.round(45 + (correct / items.length) * 55);
}

export function ResultScreen({
  answers,
  hasUnlockedReview,
  isUnlockingReview,
  quiz,
  score,
  translations,
  onUnlockReview,
}: ResultScreenProps) {
  const stageScores = getStageScores(quiz, answers);
  const strongestStage = getStrongestStage(stageScores);
  const profile = getResultProfile(quiz, score, quiz.questions.length, strongestStage);
  const cognitiveScores = quiz.result.scoreDimensions.map((dimension) => ({
    label: dimension.label,
    value: scoreForCategories(quiz, answers, dimension.categories),
  }));
  const missedQuestions = quiz.questions
    .map((question, index) => ({ question, index }))
    .filter(({ question, index }) => answers[index] !== question.answerIndex);
  const missedQuestionLabel =
    missedQuestions.length === 1
      ? translations.results.review.missedQuestionSingular
      : translations.results.review.missedQuestionPlural;

  return (
    <section className="legacy-card legacy-result">
      <span className="legacy-profile-badge">{profile.tier} • {strongestStage.name}</span>
      <h2>{profile.title}</h2>
      <p className="legacy-sub">{profile.copy}</p>
      <div className="legacy-score">
        <strong>{score}/{quiz.questions.length}</strong>
        <span>{translations.quiz.finalScore}</span>
      </div>
      <div className="legacy-score">
        <strong>{profile.percentile}</strong>
        <span>{translations.quiz.profile}</span>
      </div>
      <div className="legacy-cognitive-scores">
        {cognitiveScores.map((item) => (
          <div key={item.label} className="legacy-cog-item">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="legacy-unlock-panel">
        <h3>{missedQuestions.length ? translations.results.review.wantMissed : translations.results.review.perfectScore}</h3>
        <p>
          {missedQuestions.length
            ? `${missedQuestions.length} ${missedQuestionLabel} ${translations.results.review.readyToReview}`
            : translations.results.review.perfectCopy}
        </p>
        {missedQuestions.length ? (
          <button
            type="button"
            disabled={hasUnlockedReview || isUnlockingReview}
            onClick={onUnlockReview}
            className="legacy-primary"
          >
            {hasUnlockedReview
              ? translations.results.review.unlockDone
              : isUnlockingReview
                ? translations.loading.ad
                : translations.results.review.unlockButton}
          </button>
        ) : null}
      </div>
      {hasUnlockedReview && missedQuestions.length ? (
        <div className="legacy-review">
          {missedQuestions.map(({ question, index }) => (
            <div key={`${question.prompt}-${index}`} className="legacy-miss">
              <strong>{index + 1}. {question.prompt}</strong>
              <p>
                {translations.results.review.yourAnswer}: {question.choices[answers[index]] ?? translations.results.review.notAnswered}
                <br />
                {translations.results.review.correctAnswer}: {question.choices[question.answerIndex]}
              </p>
              {question.explanation ? <p>{question.explanation}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
