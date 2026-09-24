import type { QuizQuestion } from "@/lib/quizzes";

/** A chapter preview must reflect that chapter, not earlier answers. */
export function getChapterAnswers(questions: QuizQuestion[], answers: Record<string, number>, stage: number) {
  return Object.fromEntries(questions.flatMap((question) =>
    question.stage === stage && answers[question.id] !== undefined
      ? [[question.id, answers[question.id]]]
      : [],
  ));
}
