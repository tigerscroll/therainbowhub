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
  hiddenSignal?: string;
  wildcard?: string;
  alternativeMatch?: string;
  wildcardMatch?: string;
  wildcardReason?: string;
  preferredStyle?: string;
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

export function rankProfileRevealDimensions(
  dimensions: Quiz["result"]["scoreDimensions"],
  profileWeights: Record<string, number>,
  winningProfileId?: string,
) {
  const ranked = dimensions.map((dimension, order) => ({
    label: dimension.label,
    order,
    score: dimension.categories.reduce((sum, profileId) => sum + Math.max(0, profileWeights[profileId] ?? 0), 0),
    containsWinner: Boolean(winningProfileId && dimension.categories.includes(winningProfileId)),
  })).sort((left, right) => right.score - left.score || left.order - right.order);
  return {
    strongestEnergy: ranked[0]?.label,
    hiddenEnergy: ranked.find((dimension) => !dimension.containsWinner)?.label,
  };
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
    const ratio = matching.length ? correct / matching.length : 0;
    return { label: dimension.label, attempts: matching.length, ratio, score: Math.round(ratio * 100) };
  });
  const dimensionScores = Object.fromEntries(dimensions.map((dimension) => [dimension.label, dimension.score]));
  const attemptedDimensions = dimensions.filter((dimension) => dimension.attempts > 0);
  const dimensionTieStats = quiz.result.scoreDimensions.map((dimension, order) => {
    const matching = answered.filter((question) => question.category && dimension.categories.includes(question.category));
    const correctQuestions = matching.filter((question) => answers[question.id] === question.answerIndex);
    return {
      label: dimension.label,
      order,
      ratio: matching.length ? correctQuestions.length / matching.length : 0,
      difficulty: correctQuestions.reduce((sum, question) => sum + quiz.questions.findIndex((item) => item.id === question.id) + 1, 0),
    };
  }).filter((dimension) => attemptedDimensions.some((attempted) => attempted.label === dimension.label));
  const rankedBest = quiz.engine.tieBreaks?.categories === "harder-correct"
    ? [...dimensionTieStats].sort((a, b) => b.ratio - a.ratio || b.difficulty - a.difficulty || a.order - b.order)
    : [...attemptedDimensions].sort((a, b) => b.ratio - a.ratio);
  const rankedWorst = quiz.engine.tieBreaks?.categories === "harder-correct"
    ? [...dimensionTieStats].sort((a, b) => a.ratio - b.ratio || a.difficulty - b.difficulty || a.order - b.order)
    : [...attemptedDimensions].sort((a, b) => a.ratio - b.ratio);
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
  const profileRevealSignals = quiz.result.profileReveal
    ? rankProfileRevealDimensions(quiz.result.scoreDimensions, weights, winningId)
    : undefined;

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
    strongestSignal: profileRevealSignals?.strongestEnergy ?? dimensions.strongestSignal,
    hiddenSignal: profileRevealSignals?.hiddenEnergy,
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

function cosineSimilarity(left: Record<string, number>, right: Record<string, number>, keys: string[]) {
  const dot = keys.reduce((sum, key) => sum + (left[key] ?? 0) * (right[key] ?? 0), 0);
  const leftMagnitude = Math.sqrt(keys.reduce((sum, key) => sum + (left[key] ?? 0) ** 2, 0));
  const rightMagnitude = Math.sqrt(keys.reduce((sum, key) => sum + (right[key] ?? 0) ** 2, 0));
  return leftMagnitude && rightMagnitude ? dot / (leftMagnitude * rightMagnitude) : 0;
}

export function scoreHybridMatch(quiz: Quiz, answers: QuizAnswers): QuizScore {
  const config = quiz.engine.match;
  if (!config) throw new Error(`${quiz.slug}: hybrid-match scoring needs match configuration.`);
  const scored = quiz.questions.filter((question) => question.answerIndex !== undefined);
  const answeredScored = scored.filter((question) => answers[question.id] !== undefined);
  const score = answeredScored.filter((question) => answers[question.id] === question.answerIndex).length;
  const ratio = scored.length ? score / scored.length : 0;
  const categoryAccuracy = Object.fromEntries(config.categories.map((category) => {
    const questions = scored.filter((question) => question.category === category);
    const correct = questions.filter((question) => answers[question.id] === question.answerIndex).length;
    return [category, questions.length ? correct / questions.length : 0];
  }));
  const styleVector: Record<string, number> = Object.fromEntries(config.traits.map((trait) => [trait, 0]));
  quiz.questions.filter((question) => question.answerIndex === undefined).forEach((question) => {
    const selected = answers[question.id];
    if (selected === undefined) return;
    Object.entries(question.choiceWeights?.[selected] ?? {}).forEach(([trait, weight]) => {
      styleVector[trait] = (styleVector[trait] ?? 0) + weight;
    });
  });
  const ranked = config.candidates.map((candidate, order) => {
    const academicWeightTotal = config.categories.reduce((sum, category) => sum + candidate.academicWeights[category], 0);
    const academicMatch = config.categories.reduce((sum, category) => sum + categoryAccuracy[category] * candidate.academicWeights[category], 0) / academicWeightTotal;
    const styleMatch = cosineSimilarity(styleVector, candidate.styleWeights, config.traits);
    return { ...candidate, order, academicMatch, styleMatch, finalMatch: academicMatch * config.academicWeight + styleMatch * config.styleWeight };
  }).sort((a, b) => b.finalMatch - a.finalMatch || b.academicMatch - a.academicMatch || b.styleMatch - a.styleMatch || a.order - b.order);
  const winner = ranked[0];
  const alternative = ranked[1];
  const wildcardPool = ranked.slice(2);
  const positiveWildcard = [...wildcardPool].filter((candidate) => candidate.styleMatch - candidate.academicMatch > 0)
    .sort((a, b) => (b.styleMatch - b.academicMatch) - (a.styleMatch - a.academicMatch) || b.finalMatch - a.finalMatch || a.order - b.order)[0];
  const wildcard = positiveWildcard ?? wildcardPool[0];
  const hasStyleAnswers = Object.values(styleVector).some((value) => value > 0);
  const preferredTrait = [...config.traits].sort((a, b) => hasStyleAnswers
    ? styleVector[b] - styleVector[a] || config.traits.indexOf(a) - config.traits.indexOf(b)
    : (winner?.styleWeights[b] ?? 0) - (winner?.styleWeights[a] ?? 0) || config.traits.indexOf(a) - config.traits.indexOf(b))[0];
  const wildcardTrait = wildcard ? [...config.traits].sort((a, b) => wildcard.styleWeights[b] - wildcard.styleWeights[a] || config.traits.indexOf(a) - config.traits.indexOf(b))[0] : undefined;
  const profile = quiz.result.profiles.find((item) => item.id === winner?.id) ?? fallbackProfile(quiz);
  const dimensions = quiz.result.scoreDimensions.map((dimension) => {
    const categories = dimension.categories.filter((category) => category in categoryAccuracy);
    const value = categories.length ? categories.reduce((sum, category) => sum + categoryAccuracy[category], 0) / categories.length : 0;
    return { label: dimension.label, value };
  });
  const rankedDimensions = [...dimensions].sort((a, b) => b.value - a.value || dimensions.indexOf(a) - dimensions.indexOf(b));
  const stageScores = quiz.stages.map((label, stage) => {
    const questions = scored.filter((question) => question.stage === stage);
    const correct = questions.filter((question) => answers[question.id] === question.answerIndex).length;
    return { label, ratio: questions.length ? correct / questions.length : 0 };
  });
  const bestStage = [...stageScores].sort((a, b) => b.ratio - a.ratio || quiz.stages.indexOf(b.label) - quiz.stages.indexOf(a.label))[0]?.label;
  const traitLabels = quiz.result.match?.traitLabels ?? {};
  return {
    answered: Object.keys(answers).length,
    dimensionScores: Object.fromEntries(dimensions.map((dimension) => [dimension.label, Math.round(dimension.value * 100)])),
    profile,
    ratio,
    score,
    total: scored.length,
    strongestSignal: rankedDimensions[0]?.label,
    weakestSignal: [...rankedDimensions].reverse()[0]?.label,
    bestStage,
    alternativeMatch: quiz.result.profiles.find((item) => item.id === alternative?.id)?.title,
    wildcardMatch: quiz.result.profiles.find((item) => item.id === wildcard?.id)?.title,
    preferredStyle: preferredTrait ? traitLabels[preferredTrait] ?? preferredTrait : undefined,
    wildcardReason: wildcardTrait ? traitLabels[wildcardTrait] ?? wildcardTrait : undefined,
    percentage: Math.round(ratio * 100),
    targetStatus: "reachable",
    scoreBand: "onTrack",
    consistency: "mixed",
    trend: "steady",
    brainCorrect: score,
    adjustments: { personality: 0, brain: 0, calibration: 0 },
  };
}

const scoringStrategies = {
  "correct-answer": scoreCorrectAnswers,
  "weighted-profile": scoreWeightedProfile,
  "hybrid-match": scoreHybridMatch,
} satisfies Record<Quiz["engine"]["scoring"]["type"], (quiz: Quiz, answers: QuizAnswers) => QuizScore>;

export function scoreQuiz(quiz: Quiz, answers: QuizAnswers) {
  return scoringStrategies[quiz.engine.scoring.type](quiz, answers);
}
