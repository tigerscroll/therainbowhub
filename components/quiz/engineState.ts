import type { QuizQuestion } from "@/lib/quizzes";
import type { QuizAnswers } from "./scoring";

export function getStageCompletionPercentage(
  questions: Pick<QuizQuestion, "id" | "stage">[],
  answers: QuizAnswers,
  stage: number,
) {
  const stageQuestions = questions.filter((question) => question.stage === stage);
  if (!stageQuestions.length) return 0;
  const completed = stageQuestions.filter((question) => answers[question.id] !== undefined).length;
  return Math.round((completed / stageQuestions.length) * 100);
}
