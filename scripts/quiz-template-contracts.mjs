export const QUIZ_TEMPLATE_CONTRACTS = {
  "single-stage-display-manual-v1": {
    stageCount: 1,
    questionsPerStage: 30,
    flow: "linear",
    advance: "manual",
    startOnLoad: true,
    rewardedStart: false,
  },
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
  "five-stage-eight-question-v1": {
    stageCount: 5,
    questionsPerStage: 8,
    flow: "staged",
  },
};

export function quizTemplateContract(template) {
  return QUIZ_TEMPLATE_CONTRACTS[template];
}
