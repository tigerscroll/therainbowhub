import type { Quiz } from "@/lib/quizzes";

import type { QuizAnswers } from "./scoring";

function stableAnswerHash(answers: QuizAnswers, excludedQuestionId: string) {
  const firstScoredAnswer = Object.entries(answers)
    .filter(([questionId]) => questionId !== excludedQuestionId)
    .sort(([left], [right]) => left.localeCompare(right))
    .at(0);
  const input = firstScoredAnswer ? `${firstScoredAnswer[0]}:${firstScoredAnswer[1]}` : excludedQuestionId;
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

export function resolveArtworkVariant(quiz: Quiz, answers: QuizAnswers, availableVariants: string[]) {
  const selector = quiz.engine.profileArtworkSelector;
  if (!selector || !availableVariants.length) return undefined;

  const selectorChoice = answers[selector.questionId];
  const fixedVariant = selector.fixedVariants[String(selectorChoice)];
  if (fixedVariant && availableVariants.includes(fixedVariant)) return fixedVariant;

  const variants = [...availableVariants].sort();
  return variants[stableAnswerHash(answers, selector.questionId) % variants.length];
}

export function resolveProfileArtwork(quiz: Quiz, answers: QuizAnswers, profileId?: string) {
  if (!profileId) return undefined;
  const selector = quiz.engine.profileArtworkSelector;
  const variants = quiz.theme.artwork?.profileVariants?.[profileId];
  if (!selector || !variants) return quiz.theme.artwork?.profiles?.[profileId];

  const availableVariants = Object.keys(variants).sort();
  if (!availableVariants.length) return quiz.theme.artwork?.profiles?.[profileId];
  const variant = resolveArtworkVariant(quiz, answers, availableVariants);
  if (!variant) return quiz.theme.artwork?.profiles?.[profileId];
  return variants[variant] ?? quiz.theme.artwork?.profiles?.[profileId];
}
