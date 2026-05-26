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

function getProfileName(quiz: Quiz) {
  return quiz.title.replace(" Test", "").replace(" Check", "");
}

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

function getResultProfile(score: number, total: number, strongestStage: StageScore, profileName: string) {
  const ratio = total ? score / total : 0;

  if (ratio >= 0.8) {
    return {
      tier: `Final 4% ${profileName}`,
      title: "You beat the test.",
      copy: `Exceptional reasoning across the full challenge. Your strongest area was ${strongestStage.name}.`,
      percentile: "Top 4%",
    };
  }

  if (ratio >= 0.725) {
    return {
      tier: `${profileName} Candidate`,
      title: "Elite reasoning.",
      copy: `You stayed sharp through the harder rounds. Your strongest area was ${strongestStage.name}.`,
      percentile: "Top 7%",
    };
  }

  if (ratio >= 0.625) {
    return {
      tier: "Scholar Tier",
      title: "Sharp under pressure.",
      copy: `Strong performance across the skill rounds, led by ${strongestStage.name}.`,
      percentile: "Top 15%",
    };
  }

  if (ratio >= 0.5) {
    return {
      tier: "Pattern Strategist",
      title: "Above-average reasoning.",
      copy: `You showed good instincts, especially in ${strongestStage.name}.`,
      percentile: "Top 31%",
    };
  }

  if (ratio >= 0.375) {
    return {
      tier: "Logical Mind",
      title: "Solid score.",
      copy: `You handled several rounds well. Your strongest area was ${strongestStage.name}.`,
      percentile: "Top 55%",
    };
  }

  return {
    tier: "Rising Scholar",
    title: "Keep sharpening.",
    copy: `The hardest rounds reward calm pattern memory. Your best area was ${strongestStage.name}.`,
    percentile: "Top 78%",
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
  const profileName = getProfileName(quiz);
  const stageScores = getStageScores(quiz, answers);
  const strongestStage = getStrongestStage(stageScores);
  const profile = getResultProfile(score, quiz.questions.length, strongestStage, profileName);
  const cognitiveScores = [
    { label: "Pattern", value: scoreForCategories(quiz, answers, ["visual", "word", "pattern", "attention"]) },
    { label: "Number Logic", value: scoreForCategories(quiz, answers, ["number"]) },
    { label: "Deduction", value: scoreForCategories(quiz, answers, ["deduction", "logic"]) },
    { label: "Lateral Thinking", value: scoreForCategories(quiz, answers, ["lateral"]) },
  ];
  const missedQuestions = quiz.questions
    .map((question, index) => ({ question, index }))
    .filter(({ question, index }) => answers[index] !== question.answerIndex);

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
        <h3>{missedQuestions.length ? "Want to see what you missed?" : "Perfect score!"}</h3>
        <p>
          {missedQuestions.length
            ? `${missedQuestions.length} missed ${missedQuestions.length === 1 ? "question" : "questions"} ready to review after one short ad.`
            : "You answered every question correctly."}
        </p>
        {missedQuestions.length ? (
          <button
            type="button"
            disabled={hasUnlockedReview || isUnlockingReview}
            onClick={onUnlockReview}
            className="legacy-primary"
          >
            {hasUnlockedReview
              ? "✓ Incorrect Answers Unlocked"
              : isUnlockingReview
                ? translations.loading.ad
                : "Show My Missed Answers →"}
          </button>
        ) : null}
      </div>
      {hasUnlockedReview && missedQuestions.length ? (
        <div className="legacy-review">
          {missedQuestions.map(({ question, index }) => (
            <div key={`${question.prompt}-${index}`} className="legacy-miss">
              <strong>{index + 1}. {question.prompt}</strong>
              <p>
                Your answer: {question.choices[answers[index]] ?? "Not answered"}
                <br />
                Correct answer: {question.choices[question.answerIndex]}
              </p>
              {question.explanation ? <p>{question.explanation}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
