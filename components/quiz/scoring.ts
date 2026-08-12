import type { Quiz, QuizDerivedScoreConfig, QuizEstimateConfig, QuizResultProfile } from "@/lib/quizzes";

export type QuizAnswers = Record<string, number>;
export type AnswerConsistency = "high" | "medium" | "mixed";
export type EstimateTrend = "up" | "steady" | "down";
export type TargetStatus = "achieved" | "reachable" | "unreachable";
export type ScoreBand = "onTrack" | "needsBoost";

export type QuizScore = {
  answered: number;
  dimensionScores: Record<string, number>;
  profile: QuizResultProfile;
  ratio: number;
  score: number;
  total: number;
  estimatedAge?: number;
  derivedScore?: number;
  strongestSignal?: string;
  wildcard?: string;
  weakestSignal?: string;
  bestStage?: string;
  percentage: number;
  targetStatus: TargetStatus;
  scoreBand: ScoreBand;
  consistency: AnswerConsistency;
  trend: EstimateTrend;
  brainCorrect: number;
  adjustments: { personality: number; brain: number; calibration: number };
};

function fallbackProfile(quiz: Quiz) {
  return quiz.result.profiles[quiz.result.profiles.length - 1];
}

export function answerConsistencyFromShares(top: number, second: number, total: number): AnswerConsistency {
  const gap = total ? (top - second) / total * 100 : 0;
  if (gap >= 12) return "high";
  if (gap >= 6) return "medium";
  return "mixed";
}

function consistencyFromWeights(weights: Record<string, number>): AnswerConsistency {
  const ranked = Object.values(weights).map((value) => Math.max(0, value)).sort((a, b) => b - a);
  const total = ranked.reduce((sum, value) => sum + value, 0);
  return answerConsistencyFromShares(ranked[0] ?? 0, ranked[1] ?? 0, total);
}

export function rankDimensions(dimensionScores: Record<string, number>) {
  const ranked = Object.entries(dimensionScores).sort((a, b) => b[1] - a[1]);
  return { strongestSignal: ranked[0]?.[0], wildcard: ranked[1]?.[0] };
}

export function getTargetStatus(score: number, answered: number, total: number, targetRatio: number): TargetStatus {
  const target = Math.ceil(total * targetRatio);
  if (score >= target) return "achieved";
  return score + Math.max(0, total - answered) >= target ? "reachable" : "unreachable";
}

export function calculateEstimatedAge(
  estimate: QuizEstimateConfig,
  adjustments: { personality: number; brain: number; calibration: number },
) {
  return Math.min(estimate.maxAge, Math.max(estimate.minAge, Math.round(
    estimate.baseAge + adjustments.personality + adjustments.brain + adjustments.calibration,
  )));
}

export function calculateDerivedScore(config: QuizDerivedScoreConfig, ratio: number) {
  const points = [...config.breakpoints].sort((a, b) => a.ratio - b.ratio);
  const first = points[0];
  const last = points[points.length - 1];
  const clampedRatio = Math.min(last.ratio, Math.max(first.ratio, ratio));
  let lower = first;
  let upper = last;
  for (let index = 1; index < points.length; index += 1) {
    if (clampedRatio <= points[index].ratio) {
      lower = points[index - 1];
      upper = points[index];
      break;
    }
  }
  const span = upper.ratio - lower.ratio;
  const progress = span ? (clampedRatio - lower.ratio) / span : 0;
  const interpolated = lower.value + (upper.value - lower.value) * progress;
  const rounded = Math.round((interpolated + Number.EPSILON) / config.roundTo) * config.roundTo;
  return Math.min(Math.max(first.value, last.value), Math.max(Math.min(first.value, last.value), rounded));
}

function dimensionSummary(quiz: Quiz, weights: Record<string, number>, positiveTotal: number) {
  const dimensionScores = Object.fromEntries(
    quiz.result.scoreDimensions.map((dimension) => {
      const value = dimension.categories.reduce((sum, id) => sum + Math.max(0, weights[id] ?? 0), 0);
      return [dimension.label, positiveTotal ? Math.round((value / positiveTotal) * 100) : 0];
    }),
  );
  return { dimensionScores, ...rankDimensions(dimensionScores) };
}

function scoreCorrectAnswers(quiz: Quiz, answers: QuizAnswers): QuizScore {
  const scored = quiz.questions.filter((question) => question.answerIndex !== undefined);
  const score = scored.reduce((total, question) => total + (answers[question.id] === question.answerIndex ? 1 : 0), 0);
  const ratio = scored.length ? score / scored.length : 0;
  const answered = scored.filter((question) => answers[question.id] !== undefined);
  const targetRatio = quiz.engine.targetRatio ?? 1;
  const profile = [...quiz.result.profiles].sort((a, b) => b.minRatio - a.minRatio).find((item) => ratio >= item.minRatio) ?? fallbackProfile(quiz);
  const dimensions = quiz.result.scoreDimensions.map((dimension) => {
    const matching = answered.filter((question) => question.category && dimension.categories.includes(question.category));
    const correct = matching.filter((question) => answers[question.id] === question.answerIndex).length;
    return { label: dimension.label, attempts: matching.length, score: matching.length ? Math.round((correct / matching.length) * 100) : 0 };
  });
  const dimensionScores = Object.fromEntries(dimensions.map((dimension) => [dimension.label, dimension.score]));
  const attemptedDimensions = dimensions.filter((dimension) => dimension.attempts > 0);
  const dimensionTieStats = quiz.result.scoreDimensions.map((dimension, order) => {
    const matching = answered.filter((question) => question.category && dimension.categories.includes(question.category));
    const correctQuestions = matching.filter((question) => answers[question.id] === question.answerIndex);
    return {
      label: dimension.label,
      order,
      correct: correctQuestions.length,
      difficulty: correctQuestions.reduce((sum, question) => sum + quiz.questions.findIndex((item) => item.id === question.id) + 1, 0),
    };
  }).filter((dimension) => attemptedDimensions.some((attempted) => attempted.label === dimension.label));
  const rankedBest = quiz.engine.tieBreaks?.categories === "harder-correct"
    ? [...dimensionTieStats].sort((a, b) => b.correct - a.correct || b.difficulty - a.difficulty || a.order - b.order)
    : [...attemptedDimensions].sort((a, b) => b.score - a.score);
  const rankedWorst = quiz.engine.tieBreaks?.categories === "harder-correct"
    ? [...dimensionTieStats].sort((a, b) => a.correct - b.correct || a.difficulty - b.difficulty || a.order - b.order)
    : [...attemptedDimensions].sort((a, b) => a.score - b.score);
  const stageScores = quiz.stages.map((label, stage) => {
    const matching = answered.filter((question) => question.stage === stage);
    const correct = matching.filter((question) => answers[question.id] === question.answerIndex).length;
    return { label, attempts: matching.length, score: matching.length ? correct / matching.length : -1 };
  }).filter((stage) => stage.attempts > 0);
  const bestStage = [...stageScores].sort((a, b) => b.score - a.score || (quiz.engine.tieBreaks?.bestRound === "later" ? quiz.stages.indexOf(b.label) - quiz.stages.indexOf(a.label) : 0))[0]?.label;
  return {
    answered: answered.length,
    dimensionScores,
    profile,
    ratio,
    score,
    total: scored.length,
    derivedScore: quiz.engine.derivedScore ? calculateDerivedScore(quiz.engine.derivedScore, ratio) : undefined,
    strongestSignal: rankedBest[0]?.label,
    weakestSignal: rankedWorst[0]?.label,
    bestStage,
    percentage: Math.round(ratio * 100),
    targetStatus: getTargetStatus(score, answered.length, scored.length, targetRatio),
    scoreBand: answered.length && score / answered.length >= targetRatio ? "onTrack" : "needsBoost",
    consistency: "mixed",
    trend: "steady",
    brainCorrect: score,
    adjustments: { personality: 0, brain: 0, calibration: 0 },
  };
}

function scoreWeightedProfile(quiz: Quiz, answers: QuizAnswers): QuizScore {
  const weights: Record<string, number> = {};
  quiz.result.profiles.forEach((profile) => { if (profile.id) weights[profile.id] = 0; });

  let personalityAdjustmentTotal = 0;
  let personalityAdjustmentCount = 0;
  const estimate = quiz.engine.estimate;

  quiz.questions.forEach((question) => {
    const choiceIndex = answers[question.id];
    if (choiceIndex === undefined) return;
    const profileId = question.choiceProfileIds?.[choiceIndex];
    const choiceWeights = question.choiceWeights?.[choiceIndex];
    if (profileId) weights[profileId] = (weights[profileId] ?? 0) + 1;
    Object.entries(choiceWeights ?? {}).forEach(([id, weight]) => { weights[id] = (weights[id] ?? 0) + weight; });

    if (!question.calibrationValues && question.answerIndex === undefined && estimate) {
      if (profileId && estimate.profileAdjustments[profileId] !== undefined) {
        personalityAdjustmentTotal += estimate.profileAdjustments[profileId];
        personalityAdjustmentCount += 1;
      } else if (choiceWeights) {
        const entries = Object.entries(choiceWeights).filter(([id, value]) => value > 0 && estimate.profileAdjustments[id] !== undefined);
        const totalWeight = entries.reduce((sum, [, value]) => sum + value, 0);
        if (totalWeight) {
          personalityAdjustmentTotal += entries.reduce((sum, [id, value]) => sum + estimate.profileAdjustments[id] * value, 0) / totalWeight;
          personalityAdjustmentCount += 1;
        }
      }
    }
  });

  const rankedProfiles = Object.entries(weights).sort((a, b) => b[1] - a[1]);
  const winningId = rankedProfiles[0]?.[0];
  const profile = quiz.result.profiles.find((item) => item.id === winningId) ?? fallbackProfile(quiz);
  const positiveTotal = Object.values(weights).reduce((sum, weight) => sum + Math.max(0, weight), 0);
  const winningScore = winningId ? Math.max(0, weights[winningId] ?? 0) : 0;
  const dimensions = dimensionSummary(quiz, weights, positiveTotal);

  const personality = personalityAdjustmentCount ? personalityAdjustmentTotal / personalityAdjustmentCount : 0;
  const brainQuestions = quiz.questions.filter((question) => question.answerIndex !== undefined);
  const answeredBrain = brainQuestions.filter((question) => answers[question.id] !== undefined);
  const brainCorrect = answeredBrain.filter((question) => answers[question.id] === question.answerIndex).length;
  const brain = estimate && answeredBrain.length === brainQuestions.length ? estimate.brainAdjustments[String(brainCorrect)] ?? 0 : 0;
  const calibrationQuestions = quiz.questions.filter((question) => question.calibrationValues);
  const calibrationValues = calibrationQuestions.flatMap((question) => {
    const selected = answers[question.id];
    return selected === undefined ? [] : [question.calibrationValues?.[selected] ?? 0];
  });
  const calibration = estimate && calibrationValues.length
    ? calibrationValues.reduce((sum, value) => sum + value, 0) / calibrationValues.length * estimate.calibrationMax
    : 0;
  const estimatedAge = estimate ? calculateEstimatedAge(estimate, { personality, brain, calibration }) : undefined;

  return {
    answered: Object.keys(answers).length,
    dimensionScores: dimensions.dimensionScores,
    profile,
    ratio: positiveTotal ? winningScore / positiveTotal : 0,
    score: winningScore,
    total: Object.keys(answers).length,
    estimatedAge,
    strongestSignal: dimensions.strongestSignal,
    wildcard: dimensions.wildcard,
    weakestSignal: undefined,
    bestStage: undefined,
    percentage: Math.round((positiveTotal ? winningScore / positiveTotal : 0) * 100),
    targetStatus: "reachable",
    scoreBand: "onTrack",
    consistency: consistencyFromWeights(weights),
    trend: personality > 0.75 ? "up" : personality < -0.75 ? "down" : "steady",
    brainCorrect,
    adjustments: { personality, brain, calibration },
  };
}

const scoringStrategies = {
  "correct-answer": scoreCorrectAnswers,
  "weighted-profile": scoreWeightedProfile,
} satisfies Record<Quiz["engine"]["scoring"]["type"], (quiz: Quiz, answers: QuizAnswers) => QuizScore>;

export function scoreQuiz(quiz: Quiz, answers: QuizAnswers) {
  return scoringStrategies[quiz.engine.scoring.type](quiz, answers);
}
