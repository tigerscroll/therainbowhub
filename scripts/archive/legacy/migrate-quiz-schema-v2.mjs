import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.env.QUIZ_DATA_ROOT
  ? path.resolve(process.env.QUIZ_DATA_ROOT)
  : path.join(process.cwd(), "data", "quizzes");
const locales = ["en", "fr", "de", "it", "nl", "es", "pt"];

function compact(value) {
  if (Array.isArray(value)) return value.map(compact);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .map(([key, item]) => [key, compact(item)]));
}

function questionStructure(question, localizedQuestions) {
  const answers = Array.isArray(question.answers) ? question.answers : Object.keys(question.answers ?? {});
  const weightedAnswers = Array.isArray(question.answers) ? undefined : Object.values(question.answers ?? {});
  const localizedImageSources = Object.fromEntries(localizedQuestions
    .map(({ locale, question: localized }) => [locale, localized.image?.src])
    .filter(([, source]) => source && source !== question.image?.src));
  return compact({
    presentation: question.presentation,
    visual: question.visual ? {
      columns: question.visual.columns,
      separator: question.visual.separator,
    } : undefined,
    image: question.image ? {
      src: question.image.src,
      localizedSrc: Object.keys(localizedImageSources).length ? localizedImageSources : undefined,
    } : undefined,
    icons: question.icons,
    study: question.study ? {
      presentation: question.study.presentation,
      durationMs: question.study.durationMs,
      mode: question.study.mode,
    } : undefined,
    calibration: question.calibration,
    delay: question.delay,
    correct: question.correct,
    category: question.category,
    reasoningSteps: question.reasoningSteps,
    interactionStyle: question.interactionStyle,
    choiceCount: answers.length || (question.presentation === "memory-cue" ? 1 : 0),
    choiceMeanings: weightedAnswers,
  });
}

function questionText(question) {
  const answers = Array.isArray(question.answers) ? question.answers : Object.keys(question.answers ?? {});
  return compact({
    context: question.context,
    visual: question.visual ? {
      items: question.visual.items,
      ariaLabel: question.visual.ariaLabel,
    } : undefined,
    image: question.image ? { alt: question.image.alt } : undefined,
    question: question.question,
    answers: question.presentation === "memory-cue" ? undefined : answers,
    trapdoorErrors: question.trapdoorErrors,
    memoryItems: question.memoryItems,
    continueLabel: question.continueLabel,
    study: question.study ? {
      title: question.study.title,
      instruction: question.study.instruction,
      items: question.study.items,
      continueLabel: question.study.continueLabel,
      ariaLabel: question.study.ariaLabel,
    } : undefined,
  });
}

function profileKey(profile, index) {
  return profile.id ?? `profile-${index + 1}`;
}

function dimensionKey(index) {
  return `dimension-${index + 1}`;
}

function buildStructure(manifest, source, localizedFiles) {
  const stages = source.stages.map((stage, stageIndex) => ({
    id: `stage-${stageIndex + 1}`,
    difficultyLevel: ["foundation", "developing", "skilled", "advanced", "final"][stageIndex],
    questionIds: stage.questions.map((question) => question.id),
    uppercaseNextForLocales: stageIndex < source.stages.length - 1
      ? localizedFiles
        .filter(({ locale, data }) => data.career.stages[stageIndex].next?.title
          === data.stages[stageIndex + 1].title.toLocaleUpperCase(locale))
        .map(({ locale }) => locale)
      : undefined,
  }));
  const questions = Object.fromEntries(source.stages.flatMap((stage, stageIndex) => stage.questions.map((question, questionIndex) => {
    const localizedQuestions = localizedFiles.map(({ locale, data }) => ({
      locale,
      question: data.stages[stageIndex].questions[questionIndex],
    }));
    return [question.id, questionStructure(question, localizedQuestions)];
  })));
  const profiles = source.results.profiles.map((profile, index) => compact({
    key: profileKey(profile, index),
    id: profile.id,
    min: profile.min,
  }));
  const dimensions = (source.results.dimensions ?? []).map((dimension, index) => compact({
    key: dimensionKey(index),
    profiles: dimension.profiles,
    categories: dimension.categories,
  }));
  return compact({
    stages,
    questions,
    checkpoint: {
      finalIcon: source.checkpoint?.finalIcon,
      buttonIcon: source.checkpoint?.buttonIcon,
    },
    results: {
      profiles,
      dimensions,
      score: source.results.score ? {
        showPercentage: source.results.score.showPercentage,
        showBestRound: source.results.score.showBestRound,
      } : undefined,
      estimate: source.results.estimate?.reviewUnlock?.rewarded === undefined ? undefined : {
        reviewUnlockRewarded: source.results.estimate.reviewUnlock.rewarded,
      },
      profileReveal: source.results.profileReveal?.auraLabelFirst === undefined ? undefined : {
        auraLabelFirst: source.results.profileReveal.auraLabelFirst,
      },
    },
  });
}

function stripResultLogic(results, about, structure) {
  const profiles = Object.fromEntries(results.profiles.map((profile, index) => {
    const { id: _id, min: _min, ...copy } = profile;
    return [structure.results.profiles[index].key, copy];
  }));
  const dimensions = Object.fromEntries((results.dimensions ?? []).map((dimension, index) => {
    const { profiles: _profiles, categories: _categories, ...copy } = dimension;
    return [structure.results.dimensions[index].key, copy];
  }));
  const score = results.score ? { ...results.score } : undefined;
  if (score) {
    delete score.showPercentage;
    delete score.showBestRound;
    if (score.disclaimer === about?.disclaimer) delete score.disclaimer;
  }
  const estimate = results.estimate ? structuredClone(results.estimate) : undefined;
  if (estimate?.reviewUnlock) delete estimate.reviewUnlock.rewarded;
  if (estimate?.disclaimer === about?.disclaimer) delete estimate.disclaimer;
  const profileReveal = results.profileReveal ? { ...results.profileReveal } : undefined;
  if (profileReveal) {
    delete profileReveal.auraLabelFirst;
    if (profileReveal.disclaimer === about?.disclaimer) delete profileReveal.disclaimer;
  }
  const match = results.match ? { ...results.match } : undefined;
  if (match?.disclaimer === about?.disclaimer) delete match.disclaimer;
  return compact({ ...results, profiles, dimensions, score, estimate, profileReveal, match });
}

function buildTextFile(data, structure) {
  const stageEntries = structure.stages.map((stage, stageIndex) => {
    const sourceStage = data.stages[stageIndex];
    return [stage.id, compact({
      title: sourceStage.title,
      complete: sourceStage.complete,
      questions: Object.fromEntries(stage.questionIds.map((questionId, questionIndex) => [
        questionId,
        questionText(sourceStage.questions[questionIndex]),
      ])),
    })];
  });
  const careerStages = Object.fromEntries(structure.stages.map((stage, stageIndex) => {
    const source = data.career.stages[stageIndex];
    return [stage.id, compact({
      difficulty: source.difficulty,
      preAdBadge: source.preAdBadge,
      preAdTitle: source.preAdTitle,
      preAdCopy: source.preAdCopy,
      preAdChecks: source.preAdChecks,
      preAdButton: source.preAdButton,
      next: source.next ? {
        eyebrow: source.next.eyebrow,
        tagline: source.next.tagline,
        copy: source.next.copy,
      } : undefined,
    })];
  }));
  return compact({
    schemaVersion: 2,
    title: data.title,
    eyebrow: data.eyebrow,
    summary: data.summary,
    progressLabel: data.progressLabel,
    nextQuestionLabel: data.nextQuestionLabel,
    landing: data.landing,
    about: data.about,
    career: {
      resultProgressLabel: data.career.resultProgressLabel,
      resultProgressComplete: data.career.resultProgressComplete,
      stages: careerStages,
    },
    results: stripResultLogic(data.results, data.about, structure),
    stages: Object.fromEntries(stageEntries),
  });
}

function upper(value, locale) {
  return value.toLocaleUpperCase(locale);
}

function canonicalLegacy(value) {
  const copy = structuredClone(value);
  for (const stage of copy.career?.stages ?? []) delete stage.preAdEyebrow;
  return compact(copy);
}

function expandTextFile(text, manifest, locale) {
  const structure = manifest.structure;
  const stages = structure.stages.map((stage, stageIndex) => {
    const copy = text.stages[stage.id];
    return compact({
      title: copy.title,
      complete: copy.complete,
      questions: stage.questionIds.map((questionId) => {
        const logic = structure.questions[questionId];
        const question = copy.questions[questionId];
        const meanings = logic.choiceMeanings;
        const answers = question.answers === undefined ? undefined : meanings
          ? Object.fromEntries(question.answers.map((answer, index) => [answer, meanings[index]]))
          : question.answers;
        return compact({
          id: questionId,
          context: question.context,
          visual: logic.visual || question.visual ? {
            items: question.visual?.items,
            columns: logic.visual?.columns,
            separator: logic.visual?.separator,
            ariaLabel: question.visual?.ariaLabel,
          } : undefined,
          image: logic.image || question.image ? {
            src: logic.image?.localizedSrc?.[locale] ?? logic.image?.src,
            alt: question.image?.alt,
          } : undefined,
          question: question.question,
          presentation: logic.presentation,
          answers,
          trapdoorErrors: question.trapdoorErrors,
          icons: logic.icons,
          memoryItems: question.memoryItems,
          continueLabel: question.continueLabel,
          study: logic.study || question.study ? {
            title: question.study?.title,
            instruction: question.study?.instruction,
            presentation: logic.study?.presentation,
            items: question.study?.items,
            durationMs: logic.study?.durationMs,
            mode: logic.study?.mode,
            continueLabel: question.study?.continueLabel,
            ariaLabel: question.study?.ariaLabel,
          } : undefined,
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
  const profileReveal = text.results.profileReveal ? {
    ...text.results.profileReveal,
    ...structure.results.profileReveal,
    disclaimer: text.results.profileReveal.disclaimer ?? text.about?.disclaimer,
  } : undefined;
  const match = text.results.match ? {
    ...text.results.match,
    disclaimer: text.results.match.disclaimer ?? text.about?.disclaimer,
  } : undefined;
  const careers = structure.stages.map((stage, stageIndex) => {
    const copy = text.career.stages[stage.id];
    const nextStage = structure.stages[stageIndex + 1];
    const nextCopy = nextStage ? text.stages[nextStage.id] : undefined;
    const nextCareer = nextStage ? text.career.stages[nextStage.id] : undefined;
    return compact({
      ...copy,
      next: copy.next && nextCopy && nextCareer ? {
        ...copy.next,
        title: stage.uppercaseNextForLocales?.includes(locale) ? upper(nextCopy.title, locale) : nextCopy.title,
        difficulty: stage.uppercaseNextForLocales?.includes(locale) ? upper(nextCareer.difficulty, locale) : nextCareer.difficulty,
      } : undefined,
    });
  });
  return compact({
    ...text,
    schemaVersion: undefined,
    checkpoint: text.checkpoint || structure.checkpoint ? {
      ...text.checkpoint,
      finalIcon: structure.checkpoint?.finalIcon,
      buttonIcon: structure.checkpoint?.buttonIcon,
    } : undefined,
    career: {
      ...text.career,
      stages: careers,
    },
    results: {
      ...text.results,
      profiles,
      dimensions,
      score,
      estimate,
      profileReveal,
      match,
    },
    stages,
  });
}

for (const entry of fs.readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
  if (!entry.isDirectory()) continue;
  const directory = path.join(root, entry.name);
  const manifestPath = path.join(directory, "quiz.json");
  if (!fs.existsSync(manifestPath)) continue;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.schemaVersion === 2) {
    if (manifest.listing?.duration !== undefined) {
      delete manifest.listing.duration;
      fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      console.log(`Removed legacy duration metadata from ${entry.name}.`);
    }
    continue;
  }
  const localizedFiles = locales
    .filter((locale) => fs.existsSync(path.join(directory, `${locale}.json`)))
    .map((locale) => ({ locale, data: JSON.parse(fs.readFileSync(path.join(directory, `${locale}.json`), "utf8")) }));
  const source = localizedFiles.find(({ locale }) => locale === "en")?.data;
  if (!source) throw new Error(`${entry.name}: en.json is required.`);
  const structure = buildStructure(manifest, source, localizedFiles);
  const nextManifest = compact({ schemaVersion: 2, ...manifest, listing: { ...manifest.listing, duration: undefined }, structure });
  const textFiles = localizedFiles.map(({ locale, data }) => ({ locale, old: data, text: buildTextFile(data, structure) }));
  for (const item of textFiles) {
    const expanded = expandTextFile(item.text, nextManifest, item.locale);
    assert.deepEqual(expanded, canonicalLegacy(item.old), `${entry.name}/${item.locale}.json did not round-trip.`);
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`);
  for (const { locale, text } of textFiles) {
    fs.writeFileSync(path.join(directory, `${locale}.json`), `${JSON.stringify(text, null, 2)}\n`);
  }
  console.log(`Migrated ${entry.name} to quiz schema v2 (${textFiles.length} locale files).`);
}
