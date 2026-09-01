import fs from "node:fs";
import path from "node:path";
import { SOCIAL_PROOF_COUNTS } from "./social-proof.mjs";
import { expandQuizLocale } from "./quiz-schema-v2.mjs";

const root = path.join(process.cwd(), "data", "quizzes");
const supportedLocales = new Set(fs.readdirSync(path.join(process.cwd(), "data", "i18n"))
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.replace(/\.json$/, "")));
const multilingualQuizzes = new Set(["memory", "years-left"]);
const errors = [];
const folders = fs.readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, entry.name, "quiz.json")));

fail(
  new Set(Object.values(SOCIAL_PROOF_COUNTS)).size === Object.values(SOCIAL_PROOF_COUNTS).length,
  "Every quiz must have a different stable social-proof count.",
);
fail(
  folders.every((folder) => Number.isInteger(SOCIAL_PROOF_COUNTS[folder.name])),
  "Every active quiz must have a stable social-proof count in scripts/social-proof.mjs.",
);

function read(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { errors.push(`${path.relative(process.cwd(), file)}: ${error.message}`); return null; }
}

function fail(condition, message) { if (!condition) errors.push(message); }

function validateTextOnlyLocale(value, config, location) {
  fail(value?.schemaVersion === 2, `${location}: locale schemaVersion must be 2.`);
  fail(typeof value?.eyebrow === "string" && Boolean(value.eyebrow.trim()), `${location}: eyebrow is required.`);
  const stageIds = config.structure?.stages?.map((stage) => stage.id) ?? [];
  fail(value?.stages && !Array.isArray(value.stages), `${location}: locale stages must be keyed by stable stage IDs.`);
  fail(JSON.stringify(Object.keys(value?.stages ?? {}).sort()) === JSON.stringify([...stageIds].sort()), `${location}: locale stage IDs must exactly match quiz.json.`);
  const forbiddenQuestionKeys = ["id", "presentation", "icons", "calibration", "delay", "correct", "category", "reasoningSteps", "interactionStyle"];
  for (const stage of config.structure?.stages ?? []) {
    const localizedStage = value?.stages?.[stage.id];
    fail(JSON.stringify(Object.keys(localizedStage?.questions ?? {}).sort()) === JSON.stringify([...stage.questionIds].sort()), `${location}: ${stage.id} question IDs must exactly match quiz.json.`);
    for (const questionId of stage.questionIds) {
      const question = localizedStage?.questions?.[questionId] ?? {};
      fail(forbiddenQuestionKeys.every((key) => question[key] === undefined), `${location}: ${questionId} repeats logic owned by quiz.json.`);
      fail(question.visual?.columns === undefined && question.visual?.separator === undefined, `${location}: ${questionId} visual geometry belongs in quiz.json.`);
      fail(question.image?.src === undefined, `${location}: ${questionId} image paths belong in quiz.json.`);
      fail(question.study?.presentation === undefined && question.study?.durationMs === undefined && question.study?.mode === undefined, `${location}: ${questionId} study mechanics belong in quiz.json.`);
    }
  }
  fail(value?.results?.profiles && !Array.isArray(value.results.profiles), `${location}: result profiles must be keyed text, not duplicated logic arrays.`);
  fail(value?.results?.dimensions && !Array.isArray(value.results.dimensions), `${location}: result dimensions must be keyed text, not duplicated logic arrays.`);
}

function leafStringPaths(value, prefix = "") {
  if (typeof value === "string") return [prefix];
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value).flatMap(([key, child]) => leafStringPaths(child, prefix ? `${prefix}.${key}` : key));
}

function validateResultProfiles(value, scoring, location) {
  const profiles = value.results?.profiles;
  fail(Array.isArray(profiles) && profiles.length > 0, `${location}: result profiles are required.`);
  if (!Array.isArray(profiles)) return [];
  profiles.forEach((profile, index) => {
    fail(profile && typeof profile === "object" && !Array.isArray(profile), `${location}: result profile ${index + 1} must be an object.`);
    for (const key of ["tier", "title", "copy"]) {
      fail(typeof profile?.[key] === "string" && Boolean(profile[key].trim()), `${location}: result profile ${index + 1} needs ${key}.`);
    }
    if (["weighted-profile", "hybrid-match"].includes(scoring)) {
      fail(typeof profile?.id === "string" && Boolean(profile.id.trim()), `${location}: profile or match result ${index + 1} needs an id.`);
    } else {
      fail(typeof profile?.min === "number" && profile.min >= 0 && profile.min <= 1, `${location}: result profile ${index + 1} needs a min ratio from zero to one.`);
    }
  });
  if (["weighted-profile", "hybrid-match"].includes(scoring)) {
    const ids = profiles.map((profile) => profile?.id);
    fail(new Set(ids).size === ids.length, `${location}: weighted result profile ids must be unique.`);
  } else {
    const thresholds = profiles.map((profile) => profile?.min);
    fail(thresholds.every((min, index) => index === 0 || min < thresholds[index - 1]), `${location}: result profile thresholds must be strictly descending.`);
    fail(thresholds.at(-1) === 0, `${location}: final result profile must begin at zero.`);
  }
  return profiles.map((profile) => ({ id: profile?.id ?? null, min: profile?.min ?? null }));
}

function validateWeightedReferences(value, location) {
  const profileIds = new Set((value.results?.profiles ?? []).map((profile) => profile.id).filter(Boolean));
  const expectedExposure = Object.fromEntries([...profileIds].map((id) => [id, 0]));
  for (const question of (value.stages ?? []).flatMap((stage) => stage.questions ?? [])) {
    if (!question.answers || Array.isArray(question.answers)) continue;
    const meanings = Object.values(question.answers);
    meanings.forEach((meaning, answerIndex) => {
      if (typeof meaning === "string") {
        if (question.correct === undefined) fail(profileIds.has(meaning), `${location}: ${question.id} answer ${answerIndex + 1} references unknown profile ${meaning}.`);
        return;
      }
      fail(meaning && typeof meaning === "object" && !Array.isArray(meaning), `${location}: ${question.id} answer ${answerIndex + 1} needs a profile id or weight map.`);
      if (!meaning || typeof meaning !== "object" || Array.isArray(meaning)) return;
      const entries = Object.entries(meaning);
      fail(entries.length > 0, `${location}: ${question.id} answer ${answerIndex + 1} has an empty weight map.`);
      for (const [profileId, weight] of entries) {
        fail(profileIds.has(profileId), `${location}: ${question.id} answer ${answerIndex + 1} references unknown profile ${profileId}.`);
        fail(typeof weight === "number" && Number.isFinite(weight) && weight > 0, `${location}: ${question.id} answer ${answerIndex + 1} has an invalid weight for ${profileId}.`);
        if (profileId in expectedExposure && typeof weight === "number") expectedExposure[profileId] += weight / meanings.length;
      }
    });
  }
  const exposure = Object.values(expectedExposure);
  if (exposure.length > 1 && exposure.every((value) => value > 0)) {
    fail(Math.max(...exposure) - Math.min(...exposure) <= 0.05, `${location}: weighted profile opportunity is imbalanced under uniform answer selection.`);
  }
}

function validateStudy(study, location) {
  if (study === undefined) return;
  fail(study && typeof study === "object" && !Array.isArray(study), `${location}: study must be an object.`);
  if (!study || typeof study !== "object" || Array.isArray(study)) return;
  fail(typeof study.title === "string" && Boolean(study.title.trim()), `${location}: study.title is required.`);
  fail(["text", "icons"].includes(study.presentation ?? "text"), `${location}: study.presentation must be text or icons.`);
  fail(Array.isArray(study.items) && study.items.length >= 2 && study.items.length <= 8, `${location}: study.items must contain 2–8 items.`);
  fail(Number.isInteger(study.durationMs ?? 2000) && (study.durationMs ?? 2000) >= 1000 && (study.durationMs ?? 2000) <= 6000, `${location}: study.durationMs must be 1000–6000ms.`);
  fail(["manual", "automatic"].includes(study.mode ?? "manual"), `${location}: study.mode must be manual or automatic.`);
  if ((study.mode ?? "manual") === "manual") {
    fail(typeof study.continueLabel === "string" && Boolean(study.continueLabel.trim()), `${location}: manual study cues need continueLabel.`);
  }
}

const referenceUi = read(path.join(process.cwd(), "data", "i18n", "en.json"));
const requiredUiKeys = referenceUi ? leafStringPaths(referenceUi).sort() : [];
fail(referenceUi?.ad?.startNote === "One short ad, then you’ll begin.", "Shared rewarded Start note must use the universal template copy.");
fail(referenceUi?.ad?.resultsNote === "One short ad, then your results.", "Shared rewarded results note must use the universal template copy.");

for (const locale of supportedLocales) {
  const ui = read(path.join(process.cwd(), "data", "i18n", `${locale}.json`));
  if (!ui) continue;
  fail(ui.locale?.code === locale, `data/i18n/${locale}.json: locale.code must match the filename.`);
  const localizedUiKeys = leafStringPaths(ui).sort();
  fail(JSON.stringify(localizedUiKeys) === JSON.stringify(requiredUiKeys), `data/i18n/${locale}.json: shared UI leaf-string structure differs from en.json.`);
  for (const key of requiredUiKeys) {
    const value = key.split(".").reduce((current, part) => current?.[part], ui);
    fail(typeof value === "string" && Boolean(value.trim()), `data/i18n/${locale}.json: missing shared UI translation ${key}.`);
  }
}

for (const folder of folders) {
  const directory = path.join(root, folder.name);
  const config = read(path.join(directory, "quiz.json"));
  if (!config) continue;
  const expectedStageCount = 1;
  const expectedQuestionsPerStage = 10;
  const expectedQuestionTotal = expectedStageCount * expectedQuestionsPerStage;
  fail(config.schemaVersion === 2, `${folder.name}/quiz.json: schemaVersion 2 is required.`);
  fail(config.listing?.duration === undefined, `${folder.name}/quiz.json: duration is derived/unused and must not be stored.`);
  fail(config.structure?.stages?.length === expectedStageCount && config.structure.stages.every((stage) => stage.questionIds?.length === expectedQuestionsPerStage), `${folder.name}/quiz.json: structure does not match ${config.template}.`);
  fail(Object.keys(config.structure?.questions ?? {}).length === expectedQuestionTotal, `${folder.name}/quiz.json: structure must contain exactly ${expectedQuestionTotal} question definitions.`);
  const manifestEngine = config.engine ?? {};
  const templateKeys = ["flow", "advance", "feedback", "checkpoint", "startOnLoad", "rewarded", "advanceDelayMs"];
  fail(config.template === "single-stage-rewarded-v1", `${folder.name}: every quiz must use the shared single-stage rewarded template.`);
  fail(templateKeys.every((key) => manifestEngine[key] === undefined), `${folder.name}: shared flow settings must come from the template, not individual manifests.`);
  config.engine = {
    flow: "linear",
    advance: "automatic",
    feedback: "selection-only",
    checkpoint: "ai",
    startOnLoad: false,
    rewarded: { start: true, stages: true, attempts: 3, confirmStart: false },
    advanceDelayMs: 450,
    ...manifestEngine,
  };
  fail(config.slug === folder.name, `${folder.name}: quiz.json slug must match its folder.`);
  fail(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(config.slug ?? ""), `${folder.name}: slug must use lowercase URL-safe words separated by hyphens.`);
  fail(!new Set([...supportedLocales, "info", "api", "_next"]).has(config.slug), `${folder.name}: slug ${config.slug} is reserved by site routing.`);
  fail(config.engine?.flow && config.engine?.scoring, `${folder.name}: quiz.json needs engine flow and scoring.`);
  fail(config.engine.flow === "linear"
    && config.engine.advance === "automatic"
    && config.engine.feedback === "selection-only"
    && config.engine.checkpoint === "ai"
    && config.engine.startOnLoad === false
    && config.engine.advanceDelayMs === 450
    && JSON.stringify(config.engine.rewarded) === JSON.stringify({ start: true, stages: true, attempts: 3, confirmStart: false }), `${folder.name}: every quiz must resolve to the identical shared linear engine.`);
  fail(config.listing?.socialProofCount === SOCIAL_PROOF_COUNTS[folder.name], `${folder.name}/quiz.json: listing.socialProofCount must use the shared stable quiz count.`);
  fail(config.listing?.showSocialProof === undefined || typeof config.listing.showSocialProof === "boolean", `${folder.name}/quiz.json: listing.showSocialProof must be a boolean when provided.`);
  fail(config.engine?.resultAds === undefined && config.engine?.questionAd === undefined, `${folder.name}: display ads are not part of the shared quiz template.`);
  fail([undefined, "strict", "independent"].includes(config.engine?.localeParity), `${folder.name}: engine.localeParity must be strict or independent.`);
  if (config.engine?.targetRatio !== undefined) fail(config.engine.targetRatio > 0 && config.engine.targetRatio <= 1, `${folder.name}: targetRatio must be greater than zero and no more than one.`);
  if (config.engine?.derivedScore) {
    const points = config.engine.derivedScore.breakpoints;
    fail(Array.isArray(points) && points.length >= 2, `${folder.name}: derivedScore needs at least two breakpoints.`);
    fail(points?.every((point) => typeof point.ratio === "number" && point.ratio >= 0 && point.ratio <= 1 && typeof point.value === "number"), `${folder.name}: derivedScore breakpoints need numeric ratios from zero to one and numeric values.`);
    fail(points?.every((point, index) => index === 0 || point.ratio > points[index - 1].ratio), `${folder.name}: derivedScore breakpoints must be strictly ordered.`);
    fail(typeof config.engine.derivedScore.roundTo === "number" && config.engine.derivedScore.roundTo > 0, `${folder.name}: derivedScore roundTo must be greater than zero.`);
  }
  if (config.engine?.checkpoint === "ai") fail(config.engine?.rewarded, `${folder.name}: AI checkpoint quizzes need rewarded-ad settings.`);
  fail(config.theme?.colors && config.theme?.layout, `${folder.name}: quiz.json needs theme colors and layouts.`);

  const themeFile = path.join(directory, "theme.css");
  if (fs.existsSync(themeFile)) {
    const css = fs.readFileSync(themeFile, "utf8");
    fail(css.includes(`[data-quiz-theme="${folder.name}"]`), `${folder.name}/theme.css must be scoped to its quiz theme.`);
    fail(!/(?:^|[}\s])(?:body|html|:root|\.hub-header|\.site-footer)\b/m.test(css), `${folder.name}/theme.css must not style the shared header, footer, html or body.`);
  }

  const localeFiles = fs.readdirSync(directory)
    .filter((file) => file.endsWith(".json") && file !== "quiz.json");
  const invalid = localeFiles.filter((file) => !supportedLocales.has(file.replace(/\.json$/, "")));
  fail(!invalid.length, `${folder.name}: unsupported locale files: ${invalid.join(", ")}.`);
  fail(localeFiles.includes("en.json"), `${folder.name}: en.json is required.`);
  const sortedLocaleFiles = [...localeFiles].sort();
  const expectedLocaleFiles = multilingualQuizzes.has(folder.name)
    ? [...supportedLocales].map((locale) => `${locale}.json`).sort()
    : ["en.json"];
  fail(
    JSON.stringify(sortedLocaleFiles) === JSON.stringify(expectedLocaleFiles),
    `${folder.name}: locale files must be exactly ${expectedLocaleFiles.join(", ")}.`,
  );

  const sourceRaw = read(path.join(directory, "en.json"));
  if (sourceRaw) validateTextOnlyLocale(sourceRaw, config, `${folder.name}/en.json`);
  const source = sourceRaw ? expandQuizLocale(config, sourceRaw, "en") : null;
  if (!source) continue;
  fail(!source.landing?.intro?.includes("—"), `${folder.name}/en.json: landing subtitles must not use em dashes.`);
  const sourceQuestions = (source.stages ?? []).flatMap((stage) => stage.questions ?? []);
  const sourceQuestionIds = sourceQuestions.map((question) => question.id);
  fail(sourceQuestionIds.every((id) => typeof id === "string" && Boolean(id.trim())), `${folder.name}/en.json: every question needs a stable id.`);
  fail(new Set(sourceQuestionIds).size === sourceQuestionIds.length, `${folder.name}/en.json: question ids must be unique.`);
  const sourceProfileStructure = validateResultProfiles(source, config.engine?.scoring, `${folder.name}/en.json`);
  if (config.engine?.scoring === "weighted-profile") validateWeightedReferences(source, `${folder.name}/en.json`);
  if (config.engine?.checkpoint === "ai") fail(source.stages?.every((stage) => stage.complete === undefined), `${folder.name}/en.json: AI checkpoint stages must not contain unused complete copy.`);
  fail(Boolean(source.title && source.summary), `${folder.name}/en.json: title and summary are required.`);
  fail(sourceQuestions.length > 0, `${folder.name}/en.json: at least one question is required.`);
  fail(source.stages?.length === expectedStageCount && source.stages.every((stage) => stage.questions?.length === expectedQuestionsPerStage), `${folder.name}/en.json: quiz content does not match ${config.template}.`);
  fail(sourceQuestions.length === expectedQuestionTotal, `${folder.name}/en.json: quiz must contain exactly ${expectedQuestionTotal} questions.`);
  fail(sourceQuestions.every((question) => typeof question.headerLabel === "string" && question.headerLabel.trim()), `${folder.name}/en.json: every question needs a concise question-type header.`);
  fail(config.engine?.questionAd === undefined && config.engine?.resultAds === undefined, `${folder.name}: display-ad flow variants are not part of the shared quiz template.`);
  fail(JSON.stringify(config.theme?.layout) === JSON.stringify({ landing: "split", questions: "card", results: "immersive" }), `${folder.name}: landing, question and result layouts must use the shared template.`);
  fail(config.theme?.artwork?.landing === undefined, `${folder.name}: landing artwork panels are not supported by the shared landing template.`);
  const obsoleteCareerKeys = ["hideJourneyLength", "continuousShell", "showStageResults", "stageResultMode", "showCurrentScore", "showResultProgress", "currentScoreLabel", "levelLabel", "scoreSuffix", "journeyLabel", "kitchensCleared", "currentRank", "ranks", "unlockEyebrow", "unlockTitle", "unlockCopy", "finalEyebrow", "finalCareerTitle", "strongestLabel", "compactGate"];
  fail(Boolean(source.career) && obsoleteCareerKeys.every((key) => source.career?.[key] === undefined), `${folder.name}/en.json: shared shell geometry and flow settings must not be repeated in locale content.`);
  fail(typeof source.career?.resultProgressLabel === "string" && source.career?.resultProgressComplete?.includes("{value}"), `${folder.name}/en.json: checkpoint progress copy is required.`);
  fail(source.career?.stages?.length === expectedStageCount, `${folder.name}/en.json: shared career/checkpoint data must match the quiz stages.`);
  fail(source.career?.stages?.slice(0, -1).every((stage) => (
    stage.preAdButton === undefined
      && stage.preAdChecks === undefined
      && stage.next?.button === undefined
  )), `${folder.name}/en.json: the first four checkpoints must use the shared progress-only Continue flow.`);
  fail(source.career?.stages?.every((stage) => stage.preAdBadge === undefined), `${folder.name}/en.json: result-ready screens must not include a completion eyebrow.`);
  fail(source.career?.stages?.at(-1)?.preAdChecks?.length === 3, `${folder.name}/en.json: only the final checkpoint may use the three-row result checklist.`);
  fail(source.checkpoint?.reveals === undefined && source.checkpoint?.nextPrefix === undefined, `${folder.name}/en.json: duplicate checkpoint progression copy must not be retained.`);
  fail(typeof source.landing?.cta === "string" && source.landing.cta.trim(), `${folder.name}/en.json: configurable landing CTA copy is required.`);
  fail(JSON.stringify(Object.keys(source.landing ?? {}).sort()) === JSON.stringify(["cta", "intro"]), `${folder.name}/en.json: landing content may contain only intro and CTA copy; social proof is shared i18n.`);
  fail(source.landing?.startNote === undefined && source.landing?.startPrompt === undefined, `${folder.name}/en.json: rewarded Start helper copy must come from the shared template.`);
  fail(sourceRaw.checkpoint === undefined, `${folder.name}/en.json: rewarded results helper copy must come from the shared template.`);
  fail(sourceQuestions.every((question) => question.explanation === undefined), `${folder.name}/en.json: question explanations are no longer supported.`);
  fail(sourceQuestions.every((question) => (
    question.visual?.columns === undefined
      || (Number.isInteger(question.visual.columns) && question.visual.columns >= 1 && question.visual.columns <= 8)
  )), `${folder.name}/en.json: visual.columns must be an integer from 1 to 8.`);
  fail(source.results?.score?.reviewUnlock === undefined && source.career?.reportUnlock === undefined, `${folder.name}/en.json: shared breakdown-unlock copy must not be duplicated in quiz data.`);
  if (config.engine?.scoring === "correct-answer") {
    fail(sourceQuestions.every((question) => (
      Array.isArray(question.answers)
        && question.answers.length === 4
        && new Set(question.answers).size === 4
        && question.answers.every((answer) => typeof answer === "string" && answer.trim())
        && Number.isInteger(question.correct)
        && question.correct >= 0
        && question.correct < 4
    )), `${folder.name}/en.json: every scored question needs four unique choices and one valid answer.`);
    const sharedPositions = sourceQuestions.reduce((positions, question) => {
      positions[question.correct] += 1;
      return positions;
    }, [0, 0, 0, 0]);
    const expectedPositions = [3, 3, 2, 2];
    fail(JSON.stringify(sharedPositions) === JSON.stringify(expectedPositions), `${folder.name}/en.json: answer positions must match the shared template balance.`);
    fail(source.results?.score?.showBestRound === false, `${folder.name}/en.json: single-stage quizzes must not show a redundant best-round module.`);
    const questionCategories = [...new Set(sourceQuestions.map((question) => question.category).filter(Boolean))].sort();
    const dimensionCategories = (source.results?.dimensions ?? []).flatMap((dimension) => dimension.categories ?? []).sort();
    fail(JSON.stringify(dimensionCategories) === JSON.stringify(questionCategories), `${folder.name}/en.json: every scored category must appear in exactly one result dimension.`);
  }
  if (folder.name === "marry") {
    const expectedProfiles = ["warm_anchor", "playful_spark", "quiet_creative", "grounded_builder", "magnetic_connector", "curious_explorer", "thoughtful_dreamer", "ambitious_teammate"];
    const selector = config.engine?.profileArtworkSelector;
    const selectorQuestion = sourceQuestions[0];
    fail(config.template === "single-stage-rewarded-v1" && config.engine?.scoring === "weighted-profile", "marry: must use the shared single-stage weighted-profile engine.");
    fail(JSON.stringify(sortedLocaleFiles) === JSON.stringify(["en.json"]), "marry: must remain worldwide-English only.");
    fail(sourceQuestions.length === 10 && sourceQuestions[0]?.id === "marry-r1q1", "marry: needs the approved ten-choice sequence beginning with the portrait selector.");
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.id)) === JSON.stringify(expectedProfiles), "marry: archetype set or fixed tie order changed.");
    fail(selector?.questionId === "marry-r1q1" && selector?.fallback === "stable-answer-hash", "marry: profile artwork selector is missing or invalid.");
    fail(JSON.stringify(selector?.fixedVariants) === JSON.stringify({ 0: "masculine", 1: "feminine", 2: "androgynous" }), "marry: fixed presentation mappings changed.");
    fail(JSON.stringify(selectorQuestion?.calibration) === JSON.stringify([0, 0, 0, 0]) && selectorQuestion?.correct === undefined, "marry: Q1 must be the only unscored selector.");
    fail(sourceQuestions.slice(1).every((question) => question.calibration === undefined && question.correct === undefined), "marry: relationship choices must not use answer keys or calibration.");
    fail(sourceQuestions.every((question) => typeof question.headerLabel === "string" && question.headerLabel.trim()), "marry: every choice needs a question-type header.");
    fail(sourceQuestions.slice(1).every((question) => {
      const answers = question.answers && !Array.isArray(question.answers) ? Object.values(question.answers) : [];
      const seen = new Set();
      const valid = answers.length === 4 && answers.every((weights) => {
        const entries = weights && typeof weights === "object" && !Array.isArray(weights) ? Object.entries(weights) : [];
        return entries.length === 2 && entries.every(([profile, weight]) => {
          seen.add(profile);
          return expectedProfiles.includes(profile) && weight === 0.5;
        });
      });
      return valid && seen.size === 8;
    }), "marry: every scored choice must partition all eight archetypes with equal signals.");
    fail(config.theme?.artwork?.checkpoints?.length === 1, "marry: single-stage flow needs one completed checkpoint artwork.");
    fail(Object.values(config.theme?.artwork?.checkpointVariants ?? {}).every((assets) => Array.isArray(assets) && assets.length === 1), "marry: each portrait presentation needs one completed checkpoint artwork.");
    fail(source.career?.stages?.[0]?.preAdTitle === "Your portrait match is ready" && source.career?.stages?.[0]?.preAdButton === "Reveal My Portrait", "marry: final portrait reveal gate changed.");
    fail(config.listing?.thumbnail === "assets/thumbnail.webp", "marry: listing must use the optimized WebP thumbnail.");
    fail(source.results?.profiles?.find((profile) => profile.id === "curious_explorer")?.firstFeature === "their curious, adventurous gaze.", "marry: Curious Explorer feature copy must match all portrait variants.");
  }
  if (folder.name === "firefighter") {
    const firefighterCategories = ["fire_smoke_science", "scene_hazard_awareness", "equipment_mechanical_reasoning", "numeracy_spatial_awareness", "communication_incident_judgement"];
    const expectedQuestionIds = [
      "firefighter-s1q1",
      "firefighter-s1q2",
      "firefighter-s2q2",
      "firefighter-s1q5",
      "firefighter-s3q6",
      "firefighter-s3q2",
      "firefighter-s4q7",
      "firefighter-s5q5",
      "firefighter-s5q6",
      "firefighter-s5q8",
    ];
    const categoryCounts = Object.fromEntries(firefighterCategories.map((category) => [
      category,
      sourceQuestions.filter((question) => question.category === category).length,
    ]));
    const expectedProfiles = [
      "The Entrance Exam Standout",
      "The Sharp Incident Thinker",
      "The Calm Incident Solver",
      "The Steady Crew Candidate",
      "The Promising Recruit",
      "The First-Alarm Explorer",
    ];
    const forbiddenOperationalCopy = /forced entry|force entry|ventilat(?:e|ion)|breathing apparatus|ladder position|structural entry|fire attack/i;
    const questionsById = Object.fromEntries(sourceQuestions.map((question) => [question.id, question]));
    const firefighterThemeCss = fs.readFileSync(path.join(directory, "theme.css"), "utf8");
    const firefighterLandingBlocks = [...firefighterThemeCss.matchAll(/\[data-quiz-theme="firefighter"\] \.quiz-engine__landing\s*\{([^}]*)\}/g)]
      .map((match) => match[1]);
    fail(config.engine?.targetRatio === 0.8 && config.engine?.scoring === "correct-answer", "firefighter: must use correct-answer scoring and an 80% target.");
    fail(config.template === "single-stage-rewarded-v1", "firefighter: must use the shared single-stage rewarded template.");
    fail(source.title === "Only 11% Can Pass This Firefighter Entrance Exam", "firefighter/en.json: title changed.");
    fail(source.landing?.cta === "Start Test" && config.listing?.socialProofCount === 268000, "firefighter: landing CTA and social proof must match the approved launch copy.");
    fail(JSON.stringify(sourceQuestionIds) === JSON.stringify(expectedQuestionIds), "firefighter/en.json: approved ten-question set or order changed.");
    fail(firefighterCategories.every((category) => categoryCounts[category] === 2), "firefighter/en.json: every entrance area must appear exactly twice.");
    fail(sourceQuestions.every((question) => typeof question.headerLabel === "string" && question.headerLabel.trim()), "firefighter/en.json: every question needs a distinct header label.");
    fail(source.career?.stages?.[0]?.preAdTitle === "Your results are ready" && source.career?.stages?.[0]?.preAdButton === "Reveal My Results", "firefighter/en.json: final reveal gate must match the single-stage flow.");
    fail(JSON.stringify(source.career?.stages?.[0]?.preAdChecks) === JSON.stringify(["10 answers checked", "Five entrance areas compared", "Your final score calculated"]), "firefighter/en.json: final result checklist changed.");
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.title)) === JSON.stringify(expectedProfiles), "firefighter/en.json: candidate profile names changed.");
    fail(new Set(sourceQuestions.map((question) => question.interactionStyle)).size >= 8, "firefighter/en.json: the short challenge must retain varied reasoning styles.");
    fail(sourceQuestions.slice(-3).every((question) => question.reasoningSteps === 2 && /synthesis/.test(question.interactionStyle ?? "")), "firefighter/en.json: the final three questions must retain two-step reasoning.");
    fail(!forbiddenOperationalCopy.test(sourceQuestions.map((question) => `${question.question} ${question.answers.join(" ")}`).join(" ")), "firefighter/en.json: operational firefighting instruction is outside the quiz scope.");
    fail(source.results?.score?.reviewUnlock === undefined && source.career?.reportUnlock === undefined, "firefighter/en.json: shared breakdown-unlock copy must not be duplicated in quiz data.");
    fail(questionsById["firefighter-s3q6"]?.question === "A hot surface warms your face from several metres away without contact. Which heat-transfer process best explains this?", "firefighter/en.json: the radiation question must remain unambiguous.");
    fail(questionsById["firefighter-s3q2"]?.answers?.[1] === "60 metres" && questionsById["firefighter-s5q6"]?.answers?.[3] === "12", "firefighter/en.json: approved numeracy answers changed.");
    fail(!/40 varied questions|five exam sections/i.test(source.about?.body ?? ""), "firefighter/en.json: About copy must describe the ten-question format.");
    fail(firefighterLandingBlocks.length > 0 && firefighterLandingBlocks.every((block) => !/(?:^|;)\s*(?:grid-template-columns|width|padding(?:-[a-z]+)?)\s*:/m.test(block)), "firefighter/theme.css: shared landing grid, width and padding must not be overridden.");
  }
  if (["oxford", "cambridge", "harvard", "nursing", "paramedic", "midwifery", "chef"].includes(folder.name)) {
    fail(source.career?.stages?.length === 1, `${folder.name}/en.json: entrance challenge must use one final result gate.`);
    fail(source.career?.stages?.[0]?.preAdTitle === "Your results are ready", `${folder.name}/en.json: result-ready title changed.`);
    fail(JSON.stringify(source.career?.stages?.[0]?.preAdChecks)?.includes("10 answers checked"), `${folder.name}/en.json: ten-answer final checklist changed.`);
  }
  if (folder.name === "years-left") {
    const expectedIds = ["r1q3", "r2q1", "r3q2", "r4q3", "r4q2", "r6q6", "r7q4", "r8q1", "r9q5", "r10q6"];
    const expectedHeaderLabels = ["EVERYDAY RHYTHM", "FOOD AND FUEL", "DAILY MOVEMENT", "SLEEP AND RECOVERY", "STRESS RESPONSE", "SOCIAL CONNECTION", "ADAPTABILITY", "EVERYDAY JOY", "FUTURE SELF", "FINAL PREDICTION"];
    const byId = new Map(sourceQuestions.map((question) => [question.id, question]));
    fail(config.template === "single-stage-rewarded-v1" && config.engine?.flow === "linear" && source.progressLabel === "complete", "years-left: must use the shared single-stage prediction flow.");
    fail(source.stages?.length === 1 && source.stages[0]?.questions?.length === 10 && source.stages[0]?.title === "Lifestyle Prediction", "years-left/en.json: must contain one ten-question Lifestyle Prediction stage.");
    fail(JSON.stringify(sourceQuestionIds) === JSON.stringify(expectedIds), "years-left/en.json: compact question selection or order changed.");
    fail(JSON.stringify(sourceQuestions.map((question) => question.headerLabel)) === JSON.stringify(expectedHeaderLabels), "years-left/en.json: question-type labels changed.");
    fail(sourceQuestions.length === 10 && new Set(sourceQuestionIds).size === 10, "years-left/en.json: must contain ten unique interactions.");
    fail(sourceQuestions.every((question) => question.context === undefined && question.contextRequired === undefined), "years-left/en.json: compact screens must not use separate context banners.");
    fail(sourceQuestions.every((question) => question.delay === undefined), "years-left/en.json: questions must inherit the shared advance delay.");
    fail(sourceQuestions.every((question) => question.question.trim().split(/\s+/).length <= 20), "years-left/en.json: compact prompts must stay at 20 words or fewer.");
    fail(sourceQuestions.every((question) => {
      const answers = Object.keys(question.answers ?? {});
      return answers.length >= 3 && answers.length <= 5 && new Set(answers).size === answers.length;
    }), "years-left/en.json: every interaction needs three to five unique choices.");
    fail(config.engine?.advanceDelayMs === 450, "years-left: default advance delay must remain 450ms.");
    fail(config.engine?.startOnLoad === false && config.engine?.rewarded?.start === true && config.engine?.rewarded?.confirmStart === false, "years-left: must open on its landing and use the direct rewarded Start flow.");
    fail(config.engine?.rewarded?.stages === true && config.engine?.rewarded?.attempts === 3, "years-left: needs one rewarded result gate after the ten questions.");
    fail(source.title === "How Long Do You Have Left To Live?", "years-left/en.json: title changed.");
    fail(source.landing?.startPrompt === undefined && source.landing?.startNote === undefined, "years-left/en.json: rewarded Start helper must use the shared template.");
    fail(source.results?.estimate?.reviewUnlock?.button === "See What Shaped It", "years-left/en.json: choice-impact reveal copy is incomplete.");
    fail(source.results?.estimate?.reviewUnlock?.rewarded === true, "years-left/en.json: choice-impact details must use the shared rewarded breakdown gate.");
    fail(config.engine?.estimate?.baseAge === 84 && config.engine?.estimate?.minAge === 73 && config.engine?.estimate?.maxAge === 95, "years-left: estimate base and safety clamp are incorrect.");
    fail(config.engine?.estimate?.calibrationMax === 1 && JSON.stringify(config.engine?.estimate?.brainAdjustments) === JSON.stringify({ "0": 0 }), "years-left: compact estimate calibration is incorrect.");
    fail(byId.get("r2q1")?.presentation === "icons" && byId.get("r2q1")?.icons?.length === 4, "years-left: snack-table interaction needs four aligned icons.");
    fail(byId.get("r4q3")?.presentation === "scale" && Object.keys(byId.get("r4q3")?.answers ?? {}).length === 5, "years-left: rested interaction must remain a five-stop scale.");
    fail(byId.get("r6q6")?.presentation === "scale" && Object.keys(byId.get("r6q6")?.answers ?? {}).length === 5, "years-left: social connection must remain a five-stop scale.");
    fail(byId.get("r3q2")?.presentation === "icons" && JSON.stringify(byId.get("r3q2")?.icons) === JSON.stringify(["🚗", "🚌", "🚶", "🚲"]), "years-left: everyday activity icons changed.");
    fail(sourceQuestions.every((question) => question.presentation !== "memory-cue" && question.correct === undefined), "years-left: lifestyle flow must not contain unrelated Brain Check scoring.");
    fail(sourceQuestions.filter((question) => question.calibration !== undefined).length === 1 && byId.get("r10q6")?.calibration?.length === 4, "years-left: final calibration values must match every answer.");
    const gate = source.career?.stages?.[0];
    fail(source.career?.stages?.length === 1 && gate?.preAdChecks?.length === 3 && gate?.next === undefined, "years-left/en.json: needs one final rewarded estimate gate.");
    fail(gate?.preAdBadge === undefined && gate?.preAdTitle === "Your estimate is ready" && gate?.preAdCopy === "Your age estimate and lifestyle profile are ready to reveal." && gate?.preAdButton === "Reveal My Estimate", "years-left/en.json: estimate-ready gate hierarchy changed.");
    fail(source.about?.body?.split(/\n\s*\n/).length === 3 && source.about?.howToPlay?.steps?.length === 3, "years-left/en.json: needs the full compact About and How to Play copy.");
  }
  if (folder.name === "memory") {
    const categories = new Set(["word_recall", "visual", "numbers", "working_memory", "association", "attention"]);
    const ids = sourceQuestions.map((question) => question.id);
    const correctPositions = [0, 1, 2, 3].map((index) => sourceQuestions.filter((question) => question.correct === index).length);
    const categoryCounts = sourceQuestions.reduce((counts, question) => ({
      ...counts,
      [question.category]: (counts[question.category] ?? 0) + 1,
    }), {});
    const expectedHeaderLabels = [
      "WORD RECALL",
      "VISUAL MEMORY",
      "NUMBER RECALL",
      "CODE MATCH",
      "WORKING MEMORY",
      "ORDER RECALL",
      "DETAIL MEMORY",
      "QUICK ATTENTION",
      "DELAYED RECALL",
      "FINAL MEMORY TEST",
    ];
    fail(config.template === "single-stage-rewarded-v1" && config.engine?.flow === "linear", `${folder.name}: English Memory must use the shared single-stage rewarded flow.`);
    fail(source.stages?.length === 1 && source.stages[0]?.questions?.length === 10, `${folder.name}/en.json: Memory must contain one stage of ten questions.`);
    fail(source.stages?.[0]?.title === "Memory Challenge", `${folder.name}/en.json: Memory stage title changed.`);
    fail(ids.length === 10 && new Set(ids).size === 10, `${folder.name}/en.json: Memory needs ten unique scored questions.`);
    fail(JSON.stringify(sourceQuestions.map((question) => question.headerLabel)) === JSON.stringify(expectedHeaderLabels), `${folder.name}/en.json: Memory question-type header labels changed.`);
    fail(sourceQuestions.every((question) => question.context === undefined && question.contextRequired === undefined), `${folder.name}/en.json: compact Memory screens must not use separate context banners.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.answers?.length === 4 && new Set(question.answers).size === question.answers.length), `${folder.name}/en.json: every Memory question needs four unique choices and one valid answer.`);
    fail(JSON.stringify(correctPositions) === JSON.stringify([3, 3, 2, 2]), `${folder.name}/en.json: Memory correct positions must remain balanced 3/3/2/2.`);
    fail(sourceQuestions.every((question) => categories.has(question.category)), `${folder.name}/en.json: every Memory question needs an approved category.`);
    fail(JSON.stringify(categoryCounts) === JSON.stringify({ word_recall: 2, visual: 2, numbers: 1, attention: 2, working_memory: 1, association: 2 }), `${folder.name}/en.json: Memory category distribution changed.`);
    fail(sourceQuestions[0]?.study?.mode === "manual" && sourceQuestions.slice(1).every((question) => question.study?.mode !== "manual"), `${folder.name}/en.json: only the opening cue may be untimed.`);
    fail(sourceQuestions[0]?.study?.rewarded === true, `${folder.name}: must bypass the landing page and reward-gate the opening I’m ready action.`);
    fail(sourceQuestions.every((question) => !question.study || question.study.items?.length <= 4), `${folder.name}/en.json: Memory study cues may never exceed four separate items.`);
    fail(sourceQuestions.every((question) => question.study?.mode !== "automatic" || (question.study.durationMs >= 3000 && question.study.durationMs <= 6000)), `${folder.name}/en.json: automatic study cues must remain between 3000ms and 6000ms.`);
    fail(sourceQuestions.filter((question) => question.study).length === 5, `${folder.name}/en.json: Memory needs exactly five concise study moments.`);
    fail(config.engine?.targetRatio === 0.8 && config.engine?.rewarded?.start === true && config.engine?.rewarded?.stages === true && config.engine?.rewarded?.attempts === 3, `${folder.name}: Memory target and rewarded flow changed.`);
    fail(source.career?.stages?.length === 1 && source.career.stages[0]?.preAdChecks?.length === 3 && source.career.stages[0]?.next === undefined, `${folder.name}/en.json: Memory needs one final rewarded result gate.`);
    const gate = source.career?.stages?.[0];
    fail(gate?.preAdBadge === undefined && gate?.preAdTitle === "Your results are ready" && gate?.preAdCopy === "Your memory score and breakdown across three areas are ready to reveal." && gate?.preAdButton === "Reveal My Results", `${folder.name}/en.json: Memory result-ready gate hierarchy changed.`);
    fail(source.results?.score?.reviewUnlock === undefined && source.career?.reportUnlock === undefined, `${folder.name}/en.json: Memory must use the shared breakdown unlock without duplicate copy.`);
    fail(source.results?.score?.showBestRound === false, `${folder.name}/en.json: single-stage Memory must not show a redundant best-round module.`);
    fail(sourceQuestions[0]?.study?.items?.includes("PURPLE ELEPHANT") && sourceQuestions[8]?.answers?.[sourceQuestions[8]?.correct] === "Purple", `${folder.name}/en.json: opening elephant seed and delayed callback must remain aligned.`);
    fail(/Sarah/.test(sourceQuestions[6]?.study?.items?.join(" ") ?? "") && sourceQuestions[9]?.answers?.[sourceQuestions[9]?.correct] === "08:40", `${folder.name}/en.json: Sarah seed and delayed callback must remain aligned.`);
    fail(sourceQuestions[2]?.answers?.[sourceQuestions[2]?.correct] === "5837" && sourceQuestions[3]?.answers?.[sourceQuestions[3]?.correct] === "K7M2Q" && sourceQuestions[4]?.answers?.[sourceQuestions[4]?.correct] === "2 – 9 – 4", `${folder.name}/en.json: core number, attention or working-memory answers changed.`);
  }
  if (folder.name === "iq") {
    const expectedIds = ["iq-s1q1", "iq-s1q4", "iq-s2q2", "iq-s2q6", "iq-s3q2", "iq-s3q4", "iq-s4q1", "iq-s4q4", "iq-s5q2", "iq-s5q8"];
    fail(config.template === "single-stage-rewarded-v1" && config.engine?.targetRatio === 0.8, "iq: must use the shared single-stage engine and 80% target.");
    fail(JSON.stringify(sourceQuestionIds) === JSON.stringify(expectedIds), "iq/en.json: approved ten-question sequence changed.");
    fail(sourceQuestions.every((question) => typeof question.headerLabel === "string" && question.headerLabel.trim()), "iq/en.json: every puzzle needs a question-type header.");
    fail(source.career?.stages?.[0]?.preAdTitle === "Your results are ready" && source.career?.stages?.[0]?.preAdButton === "Reveal My Results", "iq/en.json: final result gate changed.");
    fail(source.results?.score?.showBestRound === false, "iq/en.json: a single-stage quiz must not show a redundant best-round module.");
    fail(source.title === "Only 7% Pass This Intelligence Test", "iq/en.json: title changed.");
  }
  for (const localeFile of localeFiles) {
    const localizedRaw = read(path.join(directory, localeFile));
    if (localizedRaw) validateTextOnlyLocale(localizedRaw, config, `${folder.name}/${localeFile}`);
    const localized = localizedRaw ? expandQuizLocale(config, localizedRaw, localeFile.replace(/\.json$/, "")) : null;
    if (!localized) continue;
    const questions = (localized.stages ?? []).flatMap((stage) => stage.questions ?? []);
    const questionIds = questions.map((question) => question.id);
    fail(questionIds.every((id) => typeof id === "string" && Boolean(id.trim())), `${folder.name}/${localeFile}: every question needs a stable id.`);
    fail(new Set(questionIds).size === questionIds.length, `${folder.name}/${localeFile}: question ids must be unique.`);
    const localizedProfileStructure = validateResultProfiles(localized, config.engine?.scoring, `${folder.name}/${localeFile}`);
    fail(JSON.stringify(localizedProfileStructure) === JSON.stringify(sourceProfileStructure), `${folder.name}/${localeFile}: result profile ids and thresholds differ from English.`);
    if (config.engine?.scoring === "weighted-profile") validateWeightedReferences(localized, `${folder.name}/${localeFile}`);
    if (folder.name === "iq") {
      fail(!/\b(?:5|10|40)\b/.test(localized.landing?.intro ?? ""), `${folder.name}/${localeFile}: landing intro must describe the challenge without exposing its stage or question count.`);
      const mirror = questions.find((question) => question.id === "iq-s1q4");
      fail(mirror?.presentation === "spatial" && mirror?.correct === 2 && mirror?.visual?.items?.[1]?.includes("│"), `${folder.name}/${localeFile}: vertical-mirror question must preserve the reflected direction and answer index.`);
      const letterCode = questions.find((question) => question.id === "iq-s2q2");
      const demonstratedCode = letterCode?.visual?.items?.[1]?.split("→")?.[1]?.trim();
      fail(Boolean(demonstratedCode) && !letterCode?.answers?.includes(demonstratedCode), `${folder.name}/${localeFile}: letter-code demonstration must not reveal one of the question answers.`);
    }
    if (config.engine?.checkpoint === "ai") {
      fail(localized.stages?.every((stage) => stage.complete === undefined), `${folder.name}/${localeFile}: AI checkpoint stages must not contain unused complete copy.`);
      fail(localized.career?.stages?.at(-1)?.preAdChecks?.length >= 3 && localized.career.stages.at(-1).preAdChecks.length <= 8, `${folder.name}/${localeFile}: final checklist must contain three to eight items.`);
    }
    fail(JSON.stringify((localized.results?.dimensions ?? []).map((dimension) => dimension.categories)) === JSON.stringify((source.results?.dimensions ?? []).map((dimension) => dimension.categories)), `${folder.name}/${localeFile}: internal result dimension category IDs differ from English.`);
    fail((localized.stages ?? []).length === (source.stages ?? []).length, `${folder.name}/${localeFile}: stage count differs from English.`);
    fail(
      JSON.stringify((localized.stages ?? []).map((stage) => stage.questions?.length ?? 0))
        === JSON.stringify((source.stages ?? []).map((stage) => stage.questions?.length ?? 0)),
      `${folder.name}/${localeFile}: per-stage question counts differ from English.`,
    );
    fail(questions.length === sourceQuestions.length, `${folder.name}/${localeFile}: question count differs from English.`);
    fail(questions.every((question) => question.explanation === undefined), `${folder.name}/${localeFile}: question explanations are no longer supported.`);
    if (config.engine?.scoring === "correct-answer") {
      fail(questions.every((question) => (
        Array.isArray(question.answers)
          && question.answers.length === 4
          && question.answers.every((answer) => typeof answer === "string" && Boolean(answer.trim()))
          && new Set(question.answers).size === 4
          && Number.isInteger(question.correct)
          && question.correct >= 0
          && question.correct < 4
      )), `${folder.name}/${localeFile}: every localized scored question needs four unique choices and one valid answer.`);
      const localizedPositions = questions.reduce((positions, question) => {
        positions[question.correct] += 1;
        return positions;
      }, [0, 0, 0, 0]);
      const sourcePositions = sourceQuestions.reduce((positions, question) => {
        positions[question.correct] += 1;
        return positions;
      }, [0, 0, 0, 0]);
      fail(JSON.stringify(localizedPositions) === JSON.stringify(sourcePositions), `${folder.name}/${localeFile}: correct-answer position balance differs from English.`);
    }
    questions.forEach((question, index) => {
      const sourceQuestion = sourceQuestions[index];
      const answers = Array.isArray(question.answers) ? question.answers : Object.keys(question.answers ?? {});
      const sourceAnswers = Array.isArray(sourceQuestion?.answers) ? sourceQuestion.answers : Object.keys(sourceQuestion?.answers ?? {});
      validateStudy(question.study, `${folder.name}/${localeFile}: question ${index + 1}`);
      fail(question.id === sourceQuestion?.id, `${folder.name}/${localeFile}: question ${index + 1} id or order differs from English.`);
      fail(answers.length === sourceAnswers.length, `${folder.name}/${localeFile}: question ${index + 1} answer count differs from English.`);
      fail((question.presentation ?? "text") === (sourceQuestion?.presentation ?? "text"), `${folder.name}/${localeFile}: question ${index + 1} presentation differs from English.`);
      fail(question.correct === sourceQuestion?.correct, `${folder.name}/${localeFile}: question ${index + 1} correct answer differs from English.`);
      fail(Boolean(question.context) === Boolean(sourceQuestion?.context), "Question context structure differs from English.");
      fail(question.category === sourceQuestion?.category, `${folder.name}/${localeFile}: question ${index + 1} category differs from English.`);
      fail(question.interactionStyle === sourceQuestion?.interactionStyle, `${folder.name}/${localeFile}: question ${index + 1} interaction style differs from English.`);
      fail(JSON.stringify(question.calibration) === JSON.stringify(sourceQuestion?.calibration), `${folder.name}/${localeFile}: question ${index + 1} calibration differs from English.`);
      fail(JSON.stringify(question.icons) === JSON.stringify(sourceQuestion?.icons), `${folder.name}/${localeFile}: question ${index + 1} icons differ from English.`);
      fail(JSON.stringify(question.visual ? {
        items: question.visual.items?.length,
        columns: question.visual.columns,
        separator: question.visual.separator,
      } : undefined) === JSON.stringify(sourceQuestion?.visual ? {
        items: sourceQuestion.visual.items?.length,
        columns: sourceQuestion.visual.columns,
        separator: sourceQuestion.visual.separator,
      } : undefined), `${folder.name}/${localeFile}: question ${index + 1} visual structure differs from English.`);
      const imageStructureMatches = JSON.stringify(question.image ? {
        src: question.image.src,
        alt: Boolean(question.image.alt),
      } : undefined) === JSON.stringify(sourceQuestion?.image ? {
        src: sourceQuestion.image.src,
        alt: Boolean(sourceQuestion.image.alt),
      } : undefined);
      const localizedVisionFoldAsset = folder.name === "vision"
        && question.id === "vision-r10q4"
        && Boolean(question.image?.alt)
        && new RegExp(`paper-fold-punch-${localeFile.replace(".json", "")}\\.svg(?:\\?|$)`).test(question.image?.src ?? "");
      fail(imageStructureMatches || localizedVisionFoldAsset, `${folder.name}/${localeFile}: question ${index + 1} image structure differs from English.`);
      fail(question.delay === sourceQuestion?.delay, `${folder.name}/${localeFile}: question ${index + 1} delay differs from English.`);
      fail(question.reasoningSteps === sourceQuestion?.reasoningSteps, `${folder.name}/${localeFile}: question ${index + 1} reasoning-step structure differs from English.`);
      fail(question.targetIdiom === sourceQuestion?.targetIdiom, `${folder.name}/${localeFile}: question ${index + 1} targetIdiom differs from English.`);
      fail(JSON.stringify(question.study ? {
        presentation: question.study.presentation ?? "text",
        items: question.study.items?.length,
        durationMs: question.study.durationMs ?? 2000,
        mode: question.study.mode ?? "manual",
      } : undefined) === JSON.stringify(sourceQuestion?.study ? {
        presentation: sourceQuestion.study.presentation ?? "text",
        items: sourceQuestion.study.items?.length,
        durationMs: sourceQuestion.study.durationMs ?? 2000,
        mode: sourceQuestion.study.mode ?? "manual",
      } : undefined), `${folder.name}/${localeFile}: question ${index + 1} study structure differs from English.`);
      if (config.engine.scoring === "weighted-profile" && !Array.isArray(question.answers)) {
        const meanings = Object.values(question.answers ?? {});
        const sourceMeanings = Object.values(sourceQuestion?.answers ?? {});
        fail(JSON.stringify(meanings) === JSON.stringify(sourceMeanings), `${folder.name}/${localeFile}: question ${index + 1} scoring differs from English.`);
      }
    });
  }
}

if (errors.length) {
  console.error(`Quiz validation failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Quiz validation passed. Checked ${folders.length} quiz folder(s).`);
