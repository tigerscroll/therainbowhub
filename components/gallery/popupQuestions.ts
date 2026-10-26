export type PopupQuestion = {
  id: string;
  prompt: string;
  choices: { id: string; label: string }[];
};

export type ArticlePopupQuestions = {
  questionCount: number;
  requiredQuestionIds?: string[];
  title: string;
  instruction: string;
  progressLabel: string;
  readyTitle: string;
  readyCopy: string;
  cta: string;
  adNote: string;
  requireReward?: boolean;
  unavailableCopy?: string;
  questions: PopupQuestion[];
};

export type PopupQuestionProgress = {
  questionIds: string[];
  answers: Record<string, string>;
};

const nonempty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

export function isArticlePopupQuestions(value: unknown): value is ArticlePopupQuestions {
  if (!value || typeof value !== "object") return false;
  const config = value as ArticlePopupQuestions;
  if (!Number.isInteger(config.questionCount) || config.questionCount < 1 || config.questionCount > 20
    || ![config.title, config.instruction, config.progressLabel, config.readyTitle, config.readyCopy, config.cta, config.adNote].every(nonempty)
    || !config.progressLabel.includes("{current}") || !config.progressLabel.includes("{total}")
    || !Array.isArray(config.questions) || config.questions.length < config.questionCount) return false;
  if ((config.requireReward !== undefined && typeof config.requireReward !== "boolean")
    || (config.unavailableCopy !== undefined && !nonempty(config.unavailableCopy))
    || (config.requireReward === true && !nonempty(config.unavailableCopy))) return false;
  const required = config.requiredQuestionIds ?? [];
  if (!Array.isArray(required) || required.length > config.questionCount || new Set(required).size !== required.length
    || !required.every(id => nonempty(id) && config.questions.some(question => question?.id === id))) return false;
  return config.questions.every(question => question && nonempty(question.id) && nonempty(question.prompt)
    && Array.isArray(question.choices) && question.choices.length >= 2 && question.choices.length <= 4
    && question.choices.every(choice => choice && nonempty(choice.id) && nonempty(choice.label))
    && new Set(question.choices.map(choice => choice.id)).size === question.choices.length)
    && new Set(config.questions.map(question => question.id)).size === config.questions.length;
}

export function createPopupQuestionProgress(config: ArticlePopupQuestions, random = Math.random): PopupQuestionProgress {
  const required = config.requiredQuestionIds ?? [];
  const ids = config.questions.map(question => question.id).filter(id => !required.includes(id));
  for (let index = ids.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [ids[index], ids[other]] = [ids[other], ids[index]];
  }
  return { questionIds: [...required, ...ids.slice(0, config.questionCount - required.length)], answers: {} };
}

export function isPopupQuestionProgress(config: ArticlePopupQuestions, value: unknown): value is PopupQuestionProgress {
  if (!value || typeof value !== "object") return false;
  const progress = value as PopupQuestionProgress;
  if (!Array.isArray(progress.questionIds) || progress.questionIds.length !== config.questionCount
    || new Set(progress.questionIds).size !== config.questionCount
    || !progress.answers || typeof progress.answers !== "object" || Array.isArray(progress.answers)) return false;
  if (!(config.requiredQuestionIds ?? []).every((id, index) => progress.questionIds[index] === id)) return false;
  let unanswered = false;
  for (const id of progress.questionIds) {
    const question = config.questions.find(item => item.id === id);
    if (!question) return false;
    const answer = progress.answers[id];
    if (answer === undefined) unanswered = true;
    else if (unanswered || !question.choices.some(choice => choice.id === answer)) return false;
  }
  return Object.keys(progress.answers).every(id => progress.questionIds.includes(id));
}

export function getCurrentPopupQuestion(config: ArticlePopupQuestions, progress: PopupQuestionProgress): PopupQuestion | undefined {
  const id = progress.questionIds.find(questionId => progress.answers[questionId] === undefined);
  return config.questions.find(question => question.id === id);
}

// Preserve answers when fixed-order flows append a
// question. Invalid, reordered or unrelated saved selections still start fresh.
export function restorePopupQuestionProgress(config: ArticlePopupQuestions, value: unknown): PopupQuestionProgress | null {
  if (isPopupQuestionProgress(config, value)) return value;
  if (!value || typeof value !== "object") return null;
  const saved = value as PopupQuestionProgress;
  const required = config.requiredQuestionIds;
  if (!required || required.length !== config.questionCount || !Array.isArray(saved.questionIds)
    || saved.questionIds.length === 0 || saved.questionIds.length >= required.length
    || !saved.questionIds.every((id, index) => id === required[index])
    || !saved.answers || typeof saved.answers !== "object" || Array.isArray(saved.answers)
    || !Object.keys(saved.answers).every(id => saved.questionIds.includes(id))) return null;
  const restored = {questionIds: [...required], answers: {...saved.answers}};
  return isPopupQuestionProgress(config, restored) ? restored : null;
}

export function answerPopupQuestion(config: ArticlePopupQuestions, progress: PopupQuestionProgress, questionId: string, answerId: string): PopupQuestionProgress {
  const question = getCurrentPopupQuestion(config, progress);
  if (question?.id !== questionId || !question.choices.some(choice => choice.id === answerId)) return progress;
  return { questionIds: [...progress.questionIds], answers: { ...progress.answers, [questionId]: answerId } };
}
