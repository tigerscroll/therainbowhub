export const QUIZ_TEMPLATE_CONTRACTS = {
  "single-stage-rewarded-v1": {
    stageCount: 1,
    questionsPerStage: 10,
    flow: "linear",
  },
  "ten-stage-seven-question-v1": {
    stageCount: 10,
    questionsPerStage: 7,
    flow: "staged",
  },
};

export function quizTemplateContract(template) {
  return QUIZ_TEMPLATE_CONTRACTS[template];
}
