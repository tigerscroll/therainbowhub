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

export function getCareerResultBand(correct: number, total: number): "high" | "medium" | "low" {
  if (!Number.isInteger(correct) || !Number.isInteger(total) || total <= 0 || correct < 0 || correct > total) {
    throw new Error("Career result scores must be valid whole-number totals.");
  }
  if (correct >= Math.ceil(total * 0.8)) return "high";
  if (correct >= Math.ceil(total * 0.5)) return "medium";
  return "low";
}
