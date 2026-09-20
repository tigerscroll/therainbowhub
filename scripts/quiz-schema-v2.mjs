import fs from "node:fs";
import path from "node:path";

function compact(value) {
  if (Array.isArray(value)) return value.map(compact);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .map(([key, item]) => [key, compact(item)]));
}

function sharedQuizCopy(locale) {
  const i18nRoot = path.join(process.cwd(), "data", "i18n");
  const english = JSON.parse(fs.readFileSync(path.join(i18nRoot, "en.json"), "utf8"));
  const localizedFile = path.join(i18nRoot, `${locale}.json`);
  const localized = fs.existsSync(localizedFile)
    ? JSON.parse(fs.readFileSync(localizedFile, "utf8"))
    : english;
  return { ...english.quiz, ...localized.quiz };
}

export function expandQuizLocale(manifest, text, locale) {
  if (manifest?.schemaVersion !== 2) return text;
  const shared = sharedQuizCopy(locale);
  const structure = manifest.structure;
  const stages = structure.stages.map((stage) => {
    const stageCopy = text.stages[stage.id];
    return compact({
      title: stageCopy.title,
      complete: stageCopy.complete,
      questions: stage.questionIds.map((questionId) => {
        const logic = structure.questions[questionId];
        const copy = stageCopy.questions[questionId];
        const answerIds = logic.answerIds;
        const answerLabels = copy.answers === undefined ? undefined : answerIds.map((answerId) => copy.answers[answerId]);
        const answers = answerLabels === undefined ? undefined : logic.choiceMeanings
          ? Object.fromEntries(answerIds.map((answerId, index) => [answerLabels[index], logic.choiceMeanings[answerId]]))
          : answerLabels;
        return compact({
          id: questionId,
          answerIds,
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
          icons: logic.icons ? answerIds.map((answerId) => logic.icons[answerId]) : undefined,
          memoryItems: copy.memoryItems,
          continueLabel: copy.continueLabel,
          study: logic.study || copy.study ? { ...copy.study, ...logic.study } : undefined,
          calibration: logic.calibration ? answerIds.map((answerId) => logic.calibration[answerId]) : undefined,
          delay: logic.delay,
          correctAnswerId: logic.correctAnswerId,
          correct: logic.correctAnswerId === undefined ? undefined : answerIds.indexOf(logic.correctAnswerId),
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
    correctLabel: shared.scoreCorrect,
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
    const resolved = compact({
      ...copy,
      preAdButton: copy.preAdButton ?? (manifest.engine.scoring === "correct-answer" ? shared.revealMyResults : undefined),
      next: copy.next && nextStageCopy && nextCareerCopy ? {
        ...copy.next,
        title: uppercase ? nextStageCopy.title.toLocaleUpperCase(locale) : nextStageCopy.title,
        difficulty: uppercase ? nextCareerCopy.difficulty.toLocaleUpperCase(locale) : nextCareerCopy.difficulty,
      } : undefined,
    });
    if (manifest.engine.scoring === "correct-answer" && resolved.preAdChecks?.length === 2) {
      resolved.preAdChecks = [...resolved.preAdChecks, shared.finalScoreCalculated];
    }
    return resolved;
  });
  return compact({
    ...text,
    about: text.about ? {
      ...text.about,
      howToPlay: text.about.howToPlay ? {
        title: text.about.howToPlay.title ?? shared.howToPlayTitle,
        ...text.about.howToPlay,
      } : undefined,
    } : undefined,
    checkpoint: text.checkpoint || structure.checkpoint ? { ...text.checkpoint, ...structure.checkpoint } : undefined,
    career: { ...text.career, resultProgressComplete: shared.progressComplete, stages: careerStages },
    results: { ...text.results, profiles, dimensions, score, estimate, profileReveal, match },
    stages,
  });
}
