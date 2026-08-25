function compact(value) {
  if (Array.isArray(value)) return value.map(compact);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .map(([key, item]) => [key, compact(item)]));
}

export function expandQuizLocale(manifest, text, locale) {
  if (manifest?.schemaVersion !== 2 || text?.schemaVersion !== 2) return text;
  const structure = manifest.structure;
  const stages = structure.stages.map((stage) => {
    const stageCopy = text.stages[stage.id];
    return compact({
      title: stageCopy.title,
      complete: stageCopy.complete,
      questions: stage.questionIds.map((questionId) => {
        const logic = structure.questions[questionId];
        const copy = stageCopy.questions[questionId];
        const answers = copy.answers === undefined ? undefined : logic.choiceMeanings
          ? Object.fromEntries(copy.answers.map((answer, index) => [answer, logic.choiceMeanings[index]]))
          : copy.answers;
        return compact({
          id: questionId,
          context: copy.context,
          visual: logic.visual || copy.visual ? { ...copy.visual, ...logic.visual } : undefined,
          image: logic.image || copy.image ? {
            src: logic.image?.localizedSrc?.[locale] ?? logic.image?.src,
            alt: copy.image?.alt,
          } : undefined,
          question: copy.question,
          headerLabel: copy.headerLabel,
          presentation: logic.presentation,
          answers,
          trapdoorErrors: copy.trapdoorErrors,
          icons: logic.icons,
          memoryItems: copy.memoryItems,
          continueLabel: copy.continueLabel,
          study: logic.study || copy.study ? { ...copy.study, ...logic.study } : undefined,
          calibration: logic.calibration,
          delay: logic.delay,
          correct: logic.correct,
          category: logic.category,
          reasoningSteps: logic.reasoningSteps,
          interactionStyle: logic.interactionStyle,
        });
      }),
    });
  });
  const profiles = structure.results.profiles.map((profile) => compact({
    id: profile.id,
    min: profile.min,
    ...text.results.profiles[profile.key],
  }));
  const dimensions = structure.results.dimensions.map((dimension) => compact({
    ...text.results.dimensions[dimension.key],
    profiles: dimension.profiles,
    categories: dimension.categories,
  }));
  const score = text.results.score ? {
    ...text.results.score,
    ...structure.results.score,
    disclaimer: text.results.score.disclaimer ?? text.about?.disclaimer,
  } : undefined;
  const estimate = text.results.estimate ? structuredClone(text.results.estimate) : undefined;
  if (estimate) {
    estimate.disclaimer ??= text.about?.disclaimer;
    if (estimate.reviewUnlock && structure.results.estimate?.reviewUnlockRewarded !== undefined) {
      estimate.reviewUnlock.rewarded = structure.results.estimate.reviewUnlockRewarded;
    }
  }
  const profileReveal = text.results.profileReveal ? compact({
    ...text.results.profileReveal,
    ...structure.results.profileReveal,
    disclaimer: text.results.profileReveal.disclaimer ?? text.about?.disclaimer,
  }) : undefined;
  const match = text.results.match ? compact({
    ...text.results.match,
    disclaimer: text.results.match.disclaimer ?? text.about?.disclaimer,
  }) : undefined;
  const careerStages = structure.stages.map((stage, stageIndex) => {
    const copy = text.career.stages[stage.id];
    const nextStage = structure.stages[stageIndex + 1];
    const nextStageCopy = nextStage ? text.stages[nextStage.id] : undefined;
    const nextCareerCopy = nextStage ? text.career.stages[nextStage.id] : undefined;
    const uppercase = stage.uppercaseNextForLocales?.includes(locale) ?? false;
    return compact({
      ...copy,
      next: copy.next && nextStageCopy && nextCareerCopy ? {
        ...copy.next,
        title: uppercase ? nextStageCopy.title.toLocaleUpperCase(locale) : nextStageCopy.title,
        difficulty: uppercase ? nextCareerCopy.difficulty.toLocaleUpperCase(locale) : nextCareerCopy.difficulty,
      } : undefined,
    });
  });
  return compact({
    ...text,
    schemaVersion: undefined,
    checkpoint: text.checkpoint || structure.checkpoint ? { ...text.checkpoint, ...structure.checkpoint } : undefined,
    career: { ...text.career, stages: careerStages },
    results: { ...text.results, profiles, dimensions, score, estimate, profileReveal, match },
    stages,
  });
}
