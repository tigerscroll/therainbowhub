import type { Quiz } from "@/lib/quizzes";

import type { QuizAnswers } from "./scoring";

function stableAnswerHash(answers: QuizAnswers, excludedQuestionId: string) {
  const input = Object.entries(answers)
    .filter(([questionId]) => questionId !== excludedQuestionId)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([questionId, choice]) => `${questionId}:${choice}`)
    .join("|");
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

export function resolveProfileArtwork(quiz: Quiz, answers: QuizAnswers, profileId?: string) {
  if (!profileId) return undefined;
  const selector = quiz.engine.profileArtworkSelector;
  const variants = quiz.theme.artwork?.profileVariants?.[profileId];
  if (!selector || !variants) return quiz.theme.artwork?.profiles?.[profileId];

  const selectorChoice = answers[selector.questionId];
  const fixedVariant = selector.fixedVariants[String(selectorChoice)];
  if (fixedVariant && variants[fixedVariant]) return variants[fixedVariant];

  const availableVariants = Object.keys(variants).sort();
  if (!availableVariants.length) return quiz.theme.artwork?.profiles?.[profileId];
  const variant = availableVariants[stableAnswerHash(answers, selector.questionId) % availableVariants.length];
  return variants[variant] ?? quiz.theme.artwork?.profiles?.[profileId];
}
