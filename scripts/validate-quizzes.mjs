import fs from "node:fs";
import path from "node:path";
import { SOCIAL_PROOF_COUNTS } from "./social-proof.mjs";
import { expandQuizLocale } from "./quiz-schema-v2.mjs";

const root = path.join(process.cwd(), "data", "quizzes");
const supportedLocales = new Set(fs.readdirSync(path.join(process.cwd(), "data", "i18n"))
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.replace(/\.json$/, "")));
const requiredQuizLocaleFiles = ["de.json", "en.json", "es.json", "fr.json", "it.json", "nl.json", "pt.json"];
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
  const isSingleStageTemplate = config.template === "single-stage-rewarded-v1";
  const expectedStageCount = isSingleStageTemplate ? 1 : 5;
  const expectedQuestionsPerStage = isSingleStageTemplate ? 10 : 8;
  const expectedQuestionTotal = expectedStageCount * expectedQuestionsPerStage;
  fail(config.schemaVersion === 2, `${folder.name}/quiz.json: schemaVersion 2 is required.`);
  fail(config.listing?.duration === undefined, `${folder.name}/quiz.json: duration is derived/unused and must not be stored.`);
  fail(config.structure?.stages?.length === expectedStageCount && config.structure.stages.every((stage) => stage.questionIds?.length === expectedQuestionsPerStage), `${folder.name}/quiz.json: structure does not match ${config.template}.`);
  fail(Object.keys(config.structure?.questions ?? {}).length === expectedQuestionTotal, `${folder.name}/quiz.json: structure must contain exactly ${expectedQuestionTotal} question definitions.`);
  const manifestEngine = config.engine ?? {};
  const templateKeys = ["flow", "advance", "feedback", "checkpoint", "startOnLoad", "rewarded", "advanceDelayMs"];
  fail(["five-stage-rewarded-v1", "single-stage-rewarded-v1"].includes(config.template), `${folder.name}: quiz must declare an approved shared rewarded template.`);
  fail(templateKeys.every((key) => manifestEngine[key] === undefined), `${folder.name}: shared flow settings must come from the template, not individual manifests.`);
  config.engine = {
    flow: isSingleStageTemplate ? "linear" : "staged",
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
  fail(config.listing?.socialProofCount === SOCIAL_PROOF_COUNTS[folder.name], `${folder.name}/quiz.json: listing.socialProofCount must use the shared stable quiz count.`);
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
  fail(
    JSON.stringify(sortedLocaleFiles) === JSON.stringify(["en.json"])
      || JSON.stringify(sortedLocaleFiles) === JSON.stringify(requiredQuizLocaleFiles),
    `${folder.name}: quiz content must be English-only or support the complete seven-locale set.`,
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
  fail(source.career?.stages?.at(-1)?.preAdChecks?.length === 3, `${folder.name}/en.json: only the final checkpoint may use the three-row result checklist.`);
  fail(source.checkpoint?.reveals === undefined && source.checkpoint?.nextPrefix === undefined, `${folder.name}/en.json: duplicate checkpoint progression copy must not be retained.`);
  fail(typeof source.landing?.cta === "string" && source.landing.cta.trim(), `${folder.name}/en.json: configurable landing CTA copy is required.`);
  fail(JSON.stringify(Object.keys(source.landing ?? {}).sort()) === JSON.stringify(["cta", "intro"]), `${folder.name}/en.json: landing content may contain only intro and CTA copy; social proof is shared i18n.`);
  fail(source.landing?.startNote === undefined && source.landing?.startPrompt === undefined, `${folder.name}/en.json: rewarded Start helper copy must come from the shared template.`);
  fail(sourceQuestions.every((question) => question.explanation === undefined), `${folder.name}/en.json: question explanations are no longer supported.`);
  fail(sourceQuestions.every((question) => (
    question.visual?.columns === undefined
      || (Number.isInteger(question.visual.columns) && question.visual.columns >= 1 && question.visual.columns <= 8)
  )), `${folder.name}/en.json: visual.columns must be an integer from 1 to 8.`);
  fail(source.results?.score?.reviewUnlock === undefined && source.career?.reportUnlock === undefined, `${folder.name}/en.json: incorrect-answer review must be free.`);
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
    const expectedPositions = isSingleStageTemplate ? [3, 3, 2, 2] : [10, 10, 10, 10];
    fail(JSON.stringify(sharedPositions) === JSON.stringify(expectedPositions), `${folder.name}/en.json: answer positions must match the shared template balance.`);
    const questionCategories = [...new Set(sourceQuestions.map((question) => question.category).filter(Boolean))].sort();
    const dimensionCategories = (source.results?.dimensions ?? []).flatMap((dimension) => dimension.categories ?? []).sort();
    fail(JSON.stringify(dimensionCategories) === JSON.stringify(questionCategories), `${folder.name}/en.json: every scored category must appear in exactly one result dimension.`);
  }
  if (folder.name === "marry") {
    const expectedProfiles = ["warm_anchor", "playful_spark", "quiet_creative", "grounded_builder", "magnetic_connector", "curious_explorer", "thoughtful_dreamer", "ambitious_teammate"];
    const selector = config.engine?.profileArtworkSelector;
    const selectorQuestion = sourceQuestions[0];
    fail(JSON.stringify(localeFiles) === JSON.stringify(["de.json", "en.json", "es.json", "fr.json", "it.json", "nl.json", "pt.json"]), "marry: locale set must include English plus fr, de, it, nl, es and pt.");
    fail(config.slug === "marry" && source.title === "AI Will Draw The Person You’ll Marry", "marry: slug and title must match the approved launch copy.");
    fail(source.landing?.intro === "Follow your instincts through attraction, personality, lifestyle and chemistry, then reveal the pencil portrait matched to your answers.", "marry: landing intro changed.");
    fail(source.landing?.cta === "Start" && config.listing?.socialProofCount === 184000, "marry: CTA and social proof must match the approved launch copy.");
    fail(source.summary === "Attraction, personality, lifestyle and chemistry clues shape the portrait of the person you could marry.", "marry: homepage summary changed.");
    fail(config.engine?.scoring === "weighted-profile" && config.engine?.advanceDelayMs === 450, "marry: weighted scoring and 450ms advancement are required.");
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.id)) === JSON.stringify(expectedProfiles), "marry: archetype set or fixed tie order changed.");
    fail(selector?.questionId === "marry-r1q1" && selector?.fallback === "stable-answer-hash", "marry: profile artwork selector is missing or invalid.");
    fail(JSON.stringify(selector?.fixedVariants) === JSON.stringify({ 0: "masculine", 1: "feminine", 2: "androgynous" }), "marry: fixed presentation mappings changed.");
    fail(selectorQuestion?.question === "Who should we draw as your future partner?", "marry: Q1 prompt changed.");
    fail(JSON.stringify(selectorQuestion?.answers) === JSON.stringify(["A masculine person", "A feminine person", "An androgynous person", "Surprise me"]), "marry: Q1 choices changed.");
    fail(JSON.stringify(selectorQuestion?.calibration) === JSON.stringify([0, 0, 0, 0]) && selectorQuestion?.correct === undefined, "marry: Q1 must be the only unscored selector.");
    fail(sourceQuestions.slice(1).every((question) => question.calibration === undefined && question.correct === undefined), "marry: scored questions must not use answer keys or calibration.");
    fail(source.about?.body?.includes("after choosing the portrait presentation, each remaining selection adds two relationship-style signals"), "marry: About copy must distinguish the unscored portrait selector from the 39 scored choices.");
    fail(source.about?.howToPlay?.steps?.[1] === "Complete eight quick questions in each chapter as the portrait takes shape.", "marry: How to Play must describe eight questions, not eight choices.");
    fail(source.results?.profiles?.find((profile) => profile.id === "curious_explorer")?.firstFeature === "their curious, adventurous gaze.", "marry: Curious Explorer feature copy must match all three portraits.");
    fail(config.listing?.thumbnail === "assets/thumbnail.webp", "marry: listing must use the optimized WebP thumbnail.");
    const marryPngAssets = fs.readdirSync(path.join(root, "marry", "assets"), { recursive: true })
      .filter((asset) => String(asset).toLowerCase().endsWith(".png"));
    fail(marryPngAssets.length === 0, `marry: unused PNG duplicates remain: ${marryPngAssets.join(", ")}.`);
    const rawOpportunity = Object.fromEntries(expectedProfiles.map((profile) => [profile, 0]));
    const randomExpectation = Object.fromEntries(expectedProfiles.map((profile) => [profile, 0]));
    sourceQuestions.slice(1).forEach((question) => {
      const answers = question.answers && !Array.isArray(question.answers) ? Object.values(question.answers) : [];
      fail(answers.length === 4, `marry/en.json: ${question.id} must have four choices.`);
      const seen = new Set();
      answers.forEach((weights, answerIndex) => {
        const entries = weights && typeof weights === "object" && !Array.isArray(weights) ? Object.entries(weights) : [];
        fail(entries.length === 2 && entries.every(([, weight]) => weight === 0.5), `marry/en.json: ${question.id} answer ${answerIndex + 1} must split 0.5 / 0.5.`);
        entries.forEach(([profile, weight]) => {
          fail(expectedProfiles.includes(profile), `marry/en.json: ${question.id} references unknown archetype ${profile}.`);
          fail(!seen.has(profile), `marry/en.json: ${question.id} must partition every archetype exactly once.`);
          seen.add(profile);
          rawOpportunity[profile] += weight;
          randomExpectation[profile] += weight / 4;
        });
      });
      fail(seen.size === 8, `marry/en.json: ${question.id} must cover all eight archetypes exactly once.`);
    });
    expectedProfiles.forEach((profile) => {
      fail(Math.abs(rawOpportunity[profile] - 19.5) < 0.000001, `marry: ${profile} raw opportunity must equal 19.5.`);
      fail(Math.abs(randomExpectation[profile] - 4.875) < 0.000001, `marry: ${profile} random expectation must equal 4.875.`);
      fail(Object.keys(config.theme?.artwork?.profileVariants?.[profile] ?? {}).sort().join(",") === "androgynous,feminine,masculine", `marry: ${profile} must have all three portrait variants.`);
      fail(typeof source.results?.profiles?.find((item) => item.id === profile)?.firstFeature === "string", `marry: ${profile} needs a first-feature result line.`);
    });

    const scoredQuestions = sourceQuestions.slice(1);
    const rankWeights = (weights) => expectedProfiles
      .map((id, order) => ({ id, order, value: weights[id] ?? 0 }))
      .sort((left, right) => right.value - left.value || left.order - right.order);
    const bandFromWeights = (weights) => {
      const ranked = rankWeights(weights);
      const gap = ((ranked[0]?.value ?? 0) - (ranked[1]?.value ?? 0)) / 39 * 100;
      return gap >= 12 ? "high" : gap >= 6 ? "medium" : "mixed";
    };

    expectedProfiles.forEach((target) => {
      const weights = Object.fromEntries(expectedProfiles.map((profile) => [profile, 0]));
      scoredQuestions.forEach((question) => {
        const answer = Object.values(question.answers).find((choice) => choice[target] === 0.5);
        Object.entries(answer ?? {}).forEach(([profile, weight]) => { weights[profile] += weight; });
      });
      fail(rankWeights(weights)[0]?.id === target, `marry: ${target} is not reachable through a coherent strongest-answer path.`);
      fail(bandFromWeights(weights) === "high", `marry: ${target} needs a reachable high-chemistry path.`);
    });

    let randomState = 0x9e3779b9;
    const seededRandom = () => {
      randomState ^= randomState << 13;
      randomState ^= randomState >>> 17;
      randomState ^= randomState << 5;
      return (randomState >>> 0) / 4294967296;
    };
    const simulationCount = 100000;
    const scoreSums = Object.fromEntries(expectedProfiles.map((profile) => [profile, 0]));
    const reachableBands = Object.fromEntries(expectedProfiles.map((profile) => [profile, new Set()]));
    for (let simulation = 0; simulation < simulationCount; simulation += 1) {
      const weights = Object.fromEntries(expectedProfiles.map((profile) => [profile, 0]));
      scoredQuestions.forEach((question) => {
        const answers = Object.values(question.answers);
        const answer = answers[Math.floor(seededRandom() * answers.length)];
        Object.entries(answer).forEach(([profile, weight]) => { weights[profile] += weight; });
      });
      expectedProfiles.forEach((profile) => { scoreSums[profile] += weights[profile]; });
      const winner = rankWeights(weights)[0]?.id;
      if (winner) reachableBands[winner].add(bandFromWeights(weights));
    }
    expectedProfiles.forEach((profile) => {
      const simulatedAverage = scoreSums[profile] / simulationCount;
      fail(Math.abs(simulatedAverage - 4.875) < 0.02, `marry: seeded random simulation shows structural score bias for ${profile} (${simulatedAverage.toFixed(4)}).`);
      fail(["high", "medium", "mixed"].every((band) => reachableBands[profile].has(band)), `marry: ${profile} must remain reachable with high, balanced and varied chemistry paths.`);
    });

    fail(config.theme?.artwork?.checkpoints?.length === 5, "marry: five checkpoint progress artworks are required.");
    fail(JSON.stringify(Object.keys(config.theme?.artwork?.checkpointVariants ?? {}).sort()) === JSON.stringify(["androgynous", "feminine", "masculine"]), "marry: checkpoint artwork must support all three portrait presentations.");
    fail(Object.values(config.theme?.artwork?.checkpointVariants ?? {}).every((assets) => Array.isArray(assets) && assets.length === 5), "marry: every presentation needs five checkpoint artworks.");
    fail(JSON.stringify(config.theme?.artwork?.checkpointVariants?.feminine) === JSON.stringify([
      "assets/checkpoints/portrait-20.webp",
      "assets/checkpoints/portrait-40-feminine.webp",
      "assets/checkpoints/portrait-60-feminine.webp",
      "assets/checkpoints/portrait-80-feminine.webp",
      "assets/checkpoints/portrait-100-feminine.webp",
    ]), "marry: feminine checkpoint progression changed or is incomplete.");
    fail(sourceQuestions.filter((question) => question.presentation === "icons").length === 7, "marry: exactly seven four-image questions are required.");
    fail(sourceQuestions.filter((question) => question.presentation === "icons").every((question) => question.icons?.length === 4), "marry: every visual choice needs four images.");
    fail(source.career?.stages?.[4]?.preAdTitle === "YOUR FUTURE PARTNER HAS BEEN MATCHED" && source.career?.stages?.[4]?.preAdButton === "Reveal Their Face", "marry: final reveal promise changed.");
    fail(JSON.stringify(source.career?.stages?.[4]?.preAdChecks) === JSON.stringify(["Attraction pattern analysed", "Personality and chemistry matched", "Future clues combined"]), "marry: final checklist changed.");
    const allCopy = JSON.stringify(source);
    fail(!allCopy.includes("Takeaway, laughter and talking it out"), "marry: worldwide-English copy must use Comfort food, not Takeaway.");
    fail(!/you will marry|is destined to|we identified (?:a )?real person|guarantees (?:a )?future/i.test(allCopy), "marry: copy must not imply certainty, destiny or real-person identification.");
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
    fail(source.results?.score?.reviewUnlock === undefined && source.career?.reportUnlock === undefined, "firefighter/en.json: final answer review must remain free.");
    fail(questionsById["firefighter-s3q6"]?.question === "A hot surface warms your face from several metres away without contact. Which heat-transfer process best explains this?", "firefighter/en.json: the radiation question must remain unambiguous.");
    fail(questionsById["firefighter-s3q2"]?.answers?.[1] === "60 metres" && questionsById["firefighter-s5q6"]?.answers?.[3] === "12", "firefighter/en.json: approved numeracy answers changed.");
    fail(!/40 varied questions|five exam sections/i.test(source.about?.body ?? ""), "firefighter/en.json: About copy must describe the ten-question format.");
    fail(firefighterLandingBlocks.length > 0 && firefighterLandingBlocks.every((block) => !/(?:^|;)\s*(?:grid-template-columns|width|padding(?:-[a-z]+)?)\s*:/m.test(block)), "firefighter/theme.css: shared landing grid, width and padding must not be overridden.");
  }
  const entranceExamLabels = {
    oxford: "OXFORD",
    cambridge: "CAMBRIDGE",
    harvard: "HARVARD",
    nursing: "NURSING",
    paramedic: "PARAMEDIC",
    midwifery: "MIDWIFERY",
    chef: "CHEF",
  };
  if (folder.name in entranceExamLabels) {
    const label = entranceExamLabels[folder.name];
    const titles = ["First exam section complete", "Second exam section complete", "More than halfway through", "Final assessment next", `${label} ENTRANCE EXAM COMPLETE`];
    const copy = ["Good start. The next section is ready.", "The next section raises the difficulty.", "The advanced section is next.", "Only the final section remains.", "Your result is ready to reveal."];
    const eyebrows = ["NEXT EXAM SECTION · DEVELOPING", "NEXT EXAM SECTION · SKILLED", "NEXT EXAM SECTION · ADVANCED", "NEXT EXAM SECTION · FINAL ASSESSMENT"];
    fail(JSON.stringify(source.career?.stages?.map((stage) => [stage.preAdTitle, stage.preAdCopy])) === JSON.stringify(titles.map((title, index) => [title, copy[index]])), `${folder.name}/en.json: entrance-exam checkpoint progression changed.`);
    fail(JSON.stringify(source.career?.stages?.slice(0, 4).map((stage) => stage.next?.eyebrow)) === JSON.stringify(eyebrows), `${folder.name}/en.json: entrance-exam next-section eyebrows changed.`);
    fail(JSON.stringify(source.career?.stages?.[4]?.preAdChecks) === JSON.stringify(["40 answers checked", "Skill breakdown prepared", "Final score calculated"]), `${folder.name}/en.json: entrance-exam final checklist changed.`);
  }
  if (folder.name === "years-left") {
    const expectedIds = ["r1q3", "r2q1", "r3q2", "r4q3", "r4q2", "r6q6", "r7q4", "r8q1", "r9q5", "r10q6"];
    const expectedHeaderLabels = ["EVERYDAY RHYTHM", "FOOD AND FUEL", "DAILY MOVEMENT", "SLEEP AND RECOVERY", "STRESS RESPONSE", "SOCIAL CONNECTION", "ADAPTABILITY", "EVERYDAY JOY", "FUTURE SELF", "FINAL PREDICTION"];
    const byId = new Map(sourceQuestions.map((question) => [question.id, question]));
    fail(JSON.stringify(sortedLocaleFiles) === JSON.stringify(["en.json"]), "years-left: must remain English-only.");
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
    fail(source.results?.estimate?.reviewUnlock?.rewarded === false, "years-left/en.json: choice-impact details must be included in the final result without another rewarded gate.");
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
    fail(gate?.preAdBadge === "LIFESTYLE QUIZ COMPLETE" && gate?.preAdTitle === "Your estimate is ready" && gate?.preAdCopy === "Your age estimate and lifestyle profile are ready to reveal." && gate?.preAdButton === "Reveal My Estimate", "years-left/en.json: estimate-ready gate hierarchy changed.");
    fail(source.checkpoint?.finalAdNote === "One short ad, then your estimate.", "years-left/en.json: final rewarded checkpoint helper copy changed.");
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
    fail(sourceQuestions.every((question) => !question.study || question.study.items?.length <= 4), `${folder.name}/en.json: Memory study cues may never exceed four separate items.`);
    fail(sourceQuestions.every((question) => question.study?.mode !== "automatic" || (question.study.durationMs >= 3000 && question.study.durationMs <= 6000)), `${folder.name}/en.json: automatic study cues must remain between 3000ms and 6000ms.`);
    fail(sourceQuestions.filter((question) => question.study).length === 5, `${folder.name}/en.json: Memory needs exactly five concise study moments.`);
    fail(config.engine?.targetRatio === 0.8 && config.engine?.rewarded?.start === true && config.engine?.rewarded?.stages === true && config.engine?.rewarded?.attempts === 3, `${folder.name}: Memory target and rewarded flow changed.`);
    fail(source.career?.stages?.length === 1 && source.career.stages[0]?.preAdChecks?.length === 3 && source.career.stages[0]?.next === undefined, `${folder.name}/en.json: Memory needs one final rewarded result gate.`);
    const gate = source.career?.stages?.[0];
    fail(gate?.preAdBadge === "MEMORY TEST COMPLETE" && gate?.preAdTitle === "Your results are ready" && gate?.preAdCopy === "Your memory score and three-area breakdown are ready to reveal." && gate?.preAdButton === "Reveal My Results", `${folder.name}/en.json: Memory result-ready gate hierarchy changed.`);
    fail(source.checkpoint?.finalAdNote === "One short ad, then your results.", `${folder.name}/en.json: Memory final ad note changed.`);
    fail(source.results?.score?.reviewUnlock === undefined && source.career?.reportUnlock === undefined, `${folder.name}/en.json: Memory answer review must remain free.`);
    fail(source.results?.score?.showBestRound === false, `${folder.name}/en.json: single-stage Memory must not show a redundant best-round module.`);
    fail(sourceQuestions[0]?.study?.items?.includes("PURPLE ELEPHANT") && sourceQuestions[8]?.answers?.[sourceQuestions[8]?.correct] === "Purple", `${folder.name}/en.json: opening elephant seed and delayed callback must remain aligned.`);
    fail(/Sarah/.test(sourceQuestions[6]?.study?.items?.join(" ") ?? "") && sourceQuestions[9]?.answers?.[sourceQuestions[9]?.correct] === "08:40", `${folder.name}/en.json: Sarah seed and delayed callback must remain aligned.`);
    fail(sourceQuestions[2]?.answers?.[sourceQuestions[2]?.correct] === "5837" && sourceQuestions[3]?.answers?.[sourceQuestions[3]?.correct] === "K7M2Q" && sourceQuestions[4]?.answers?.[sourceQuestions[4]?.correct] === "2 – 9 – 4", `${folder.name}/en.json: core number, attention or working-memory answers changed.`);
  }
  if (folder.name === "iq") {
    const ids = sourceQuestions.map((question) => question.id);
    const correctPositions = [0, 1, 2, 3].map((index) => sourceQuestions.filter((question) => question.correct === index).length);
    const categoryCounts = sourceQuestions.reduce((counts, question) => ({ ...counts, [question.category]: (counts[question.category] ?? 0) + 1 }), {});
    const supportedPresentations = new Set(["text", "icons", "sequence", "grid", "code", "spatial"]);
    const expectedChallengeTitles = [
      "First challenge complete",
      "The vault is getting harder",
      "More than halfway through",
      "The Intelligence Vault is next",
      "INTELLIGENCE TEST COMPLETE",
    ];
    const expectedChallengeCopy = [
      "The vault gets harder from here.",
      "The next puzzles demand sharper reasoning.",
      "Advanced puzzles are next.",
      "One final challenge remains.",
      "Your result is ready to reveal.",
    ];
    const hasExactChallengeProgression = source.career?.stages?.every((stage, index) => (
      stage.preAdTitle === expectedChallengeTitles[index]
      && stage.preAdCopy === expectedChallengeCopy[index]
    ));
    fail(config.engine?.flow === "staged" && config.engine?.localeParity === "independent", `${folder.name}: compact English IQ must use independent locale flow.`);
    fail(config.engine?.targetRatio === 0.8 && config.engine?.derivedScore === undefined, `${folder.name}: Intelligence Test must use an 80% percentage target without a derived IQ score.`);
    fail(config.engine?.rewarded?.start === true && config.engine?.rewarded?.stages === true && config.engine?.rewarded?.attempts === 3 && config.engine?.rewarded?.confirmStart === false, `${folder.name}: Intelligence Test rewarded flow must match Memory and Years Left.`);
    fail(source.title === "Only 7% Pass This Intelligence Test", `${folder.name}/en.json: title changed.`);
    fail(source.landing?.cta === "Start Test" && source.landing?.startNote === undefined && source.landing?.startPrompt === undefined, `${folder.name}/en.json: shared rewarded landing flow changed.`);
    fail(source.stages?.length === 5 && source.stages.every((stage) => stage.questions?.length === 8), `${folder.name}/en.json: Intelligence Test must contain five stages of eight puzzles.`);
    fail(new Set(ids).size === 40, `${folder.name}/en.json: Intelligence Test needs 40 unique stable question IDs.`);
    fail(JSON.stringify(correctPositions) === JSON.stringify([10, 10, 10, 10]), `${folder.name}/en.json: correct positions must remain perfectly balanced 10/10/10/10.`);
    fail(JSON.stringify(categoryCounts) === JSON.stringify({ pattern: 7, numerical: 7, verbal: 6, spatial: 7, attention: 6, logic: 7 }), `${folder.name}/en.json: thinking-area balance changed.`);
    fail(source.results?.name === "YOUR INTELLIGENCE TEST SCORE" && source.results?.score?.showPercentage === true && source.results?.score?.derivedLabel === undefined, `${folder.name}/en.json: the result must be a percentage-led Intelligence Test Score.`);
    fail(source.results?.score?.reviewUnlock === undefined, `${folder.name}/en.json: final answer review must be free.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4 && new Set(question.answers).size === 4), `${folder.name}/en.json: every Intelligence Test puzzle needs four unique choices.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4), `${folder.name}/en.json: every Intelligence Test puzzle needs one valid correct index.`);
    fail(sourceQuestions.every((question) => question.explanation === undefined), `${folder.name}/en.json: Intelligence Test explanations must remain disabled.`);
    fail(sourceQuestions.every((question) => question.context === undefined && question.contextRequired === undefined), `${folder.name}/en.json: question screens must not use separate context banners.`);
    fail(sourceQuestions.every((question) => supportedPresentations.has(question.presentation ?? "text")), `${folder.name}/en.json: unsupported Intelligence Test presentation.`);
    for (const [index, question] of sourceQuestions.entries()) {
      const location = `${folder.name}/en.json: question ${index + 1}`;
      if (["sequence", "grid", "code", "spatial"].includes(question.presentation)) {
        fail(Array.isArray(question.visual?.items) && question.visual.items.length >= 1 && question.visual.items.length <= 8, `${location} visual needs 1–8 items.`);
        fail(typeof question.visual?.ariaLabel === "string" && question.visual.ariaLabel.trim(), `${location} visual needs an accessible label.`);
      }
    }
    fail(sourceQuestions.find((question) => question.id === "iq-s4q2")?.visual?.items?.[3] === "H → J  |  5 → 10", `${folder.name}/en.json: the two-rule attention trap is required.`);
    fail(source.stages[4].questions.every((question) => question.reasoningSteps === 2), `${folder.name}/en.json: all eight final Intelligence Vault puzzles must require multi-step reasoning.`);
    fail(hasExactChallengeProgression, `${folder.name}/en.json: vault-style five-checkpoint progression is incomplete.`);
    fail(source.career?.stages?.length === 5 && source.career.stages.slice(0, 4).every((stage) => stage.preAdButton === undefined && !stage.preAdChecks) && source.career.stages[4]?.preAdChecks?.length === 3, `${folder.name}/en.json: stage-result gates changed.`);
    fail(source.career?.stages?.[4]?.preAdButton === "See My Result" && source.results?.score?.showBestRound === true, `${folder.name}/en.json: final gate or result settings changed.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: IQ profile thresholds are incorrect.`);
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
      const linking = questions.find((question) => question.id === "iq-s1q3");
      fail(linking?.presentation === "code" && linking?.visual?.items?.length === 2, `${folder.name}/${localeFile}: native linking-word puzzle must retain its two-sided structure.`);
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
