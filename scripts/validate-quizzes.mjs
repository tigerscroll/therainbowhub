import fs from "node:fs";
import path from "node:path";
import { SOCIAL_PROOF_COUNTS } from "./social-proof.mjs";
import { expandQuizLocale } from "./quiz-schema-v2.mjs";
import { quizTemplateContract } from "./quiz-template-contracts.mjs";

const root = path.join(process.cwd(), "data", "quizzes");
const supportedLocales = new Set(fs.readdirSync(path.join(process.cwd(), "data", "i18n"))
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.replace(/\.json$/, "")));
const errors = [];
const sharedCopyCache = new Map();
const APPROVED_SHARED_OVERRIDE_PATHS = [
  { localePath: "about.howToPlay.title", sharedKey: "howToPlayTitle" },
  { localePath: "results.score.correctLabel", sharedKey: "scoreCorrect" },
  { localePath: "career.stages.*.preAdButton", sharedKey: "revealMyResults" },
  { localePath: "career.stages.*.preAdChecks.2", sharedKey: "finalScoreCalculated" },
];
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

function exactObjectKeys(value, allowed, location) {
  fail(value && typeof value === "object" && !Array.isArray(value), `${location}: must be an object.`);
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const unexpected = Object.keys(value).filter((key) => !allowed.includes(key));
  fail(!unexpected.length, `${location}: unsupported keys: ${unexpected.join(", ")}.`);
  return value;
}

function visibleStringAtPath(value, fieldPath) {
  const resolved = fieldPath.split(".").reduce((current, segment) => {
    if (Array.isArray(current) && /^\d+$/.test(segment)) return current[Number(segment)];
    if (!current || typeof current !== "object" || !Object.prototype.hasOwnProperty.call(current, segment)) return undefined;
    return current[segment];
  }, value);
  return typeof resolved === "string" ? resolved : undefined;
}

function tokenOccurrenceCount(value, token) { return value.split(token).length - 1; }

function sharedQuizCopy(locale) {
  if (sharedCopyCache.has(locale)) return sharedCopyCache.get(locale);
  const english = read(path.join(process.cwd(), "data", "i18n", "en.json"))?.quiz ?? {};
  const localized = read(path.join(process.cwd(), "data", "i18n", `${locale}.json`))?.quiz ?? {};
  const resolved = { ...english, ...localized };
  sharedCopyCache.set(locale, resolved);
  return resolved;
}

function valuesAtPathPattern(value, pathPattern) {
  const segments = pathPattern.split(".");
  const matches = [];
  function visit(current, index, resolvedPath) {
    if (index === segments.length) {
      matches.push({ path: resolvedPath.join("."), value: current });
      return;
    }
    if (current === undefined || current === null) return;
    const segment = segments[index];
    if (segment === "*") {
      if (typeof current !== "object") return;
      Object.entries(current).forEach(([key, item]) => visit(item, index + 1, [...resolvedPath, key]));
      return;
    }
    if (typeof current !== "object" || !Object.prototype.hasOwnProperty.call(current, segment)) return;
    visit(current[segment], index + 1, [...resolvedPath, segment]);
  }
  visit(value, 0, []);
  return matches;
}

function validateTextOnlyLocale(value, config, location, locale) {
  const localeKeys = ["title", "eyebrow", "summary", "landing", "about", "career", "results", "stages"];
  fail(Object.keys(value ?? {}).every((key) => localeKeys.includes(key)), `${location}: locale root contains an unsupported or unapproved override key.`);
  fail(value?.schemaVersion === undefined, `${location}: schemaVersion belongs in quiz.json, not locale content.`);
  fail(value?.progressLabel === undefined, `${location}: shared progress copy belongs in data/i18n.`);
  fail(value?.career?.resultProgressComplete === undefined, `${location}: resultProgressComplete belongs in data/i18n.`);
  fail(typeof value?.eyebrow === "string" && Boolean(value.eyebrow.trim()), `${location}: eyebrow is required.`);
  const shared = sharedQuizCopy(locale);
  for (const mapping of APPROVED_SHARED_OVERRIDE_PATHS) {
    for (const match of valuesAtPathPattern(value, mapping.localePath)) {
      fail(match.value !== shared[mapping.sharedKey], `${location}: ${match.path} duplicates shared i18n key quiz.${mapping.sharedKey}.`);
    }
  }
  if (value?.landing !== undefined) exactObjectKeys(value.landing, ["intro", "badge", "cta"], `${location}#landing`);
  if (value?.about !== undefined) {
    exactObjectKeys(value.about, ["body", "disclaimer", "howToPlay"], `${location}#about`);
    if (value.about.howToPlay !== undefined) exactObjectKeys(value.about.howToPlay, ["title", "steps"], `${location}#about.howToPlay`);
  }
  exactObjectKeys(value?.career, ["resultProgressLabel", "stages"], `${location}#career`);
  for (const [stageId, stage] of Object.entries(value?.career?.stages ?? {})) {
    exactObjectKeys(stage, ["difficulty", "preAdTitle", "preAdCopy", "preAdChecks", "preAdButton", "next"], `${location}#career.stages.${stageId}`);
    if (stage.next !== undefined) exactObjectKeys(stage.next, ["eyebrow", "tagline", "copy"], `${location}#career.stages.${stageId}.next`);
  }
  exactObjectKeys(value?.results, ["name", "profiles", "dimensions", "estimate", "profileReveal", "score", "match"], `${location}#results`);
  for (const [profileId, profile] of Object.entries(value?.results?.profiles ?? {})) {
    exactObjectKeys(profile, ["tier", "title", "copy", "label", "icon", "aura", "traits", "firstFeature"], `${location}#results.profiles.${profileId}`);
  }
  for (const [dimensionId, dimension] of Object.entries(value?.results?.dimensions ?? {})) {
    exactObjectKeys(dimension, ["label"], `${location}#results.dimensions.${dimensionId}`);
  }
  if (value?.results?.score !== undefined) {
    exactObjectKeys(value.results.score, ["passed", "finished", "correctLabel", "strongest", "trickiest", "bestRound", "disclaimer", "derivedLabel", "retryLabel", "reviewUnlock", "insights"], `${location}#results.score`);
    if (value.results.score.reviewUnlock !== undefined) exactObjectKeys(value.results.score.reviewUnlock, ["title", "copy", "button", "adNote"], `${location}#results.score.reviewUnlock`);
    if (value.results.score.insights !== undefined) exactObjectKeys(value.results.score.insights, ["overview", "correct", "missed", "target", "breakdown", "snapshot", "targetReached", "targetRemaining"], `${location}#results.score.insights`);
  }
  if (value?.results?.estimate !== undefined) {
    exactObjectKeys(value.results.estimate, ["eyebrow", "ageSuffix", "strongestSignal", "wildcard", "consistency", "consistencyLabels", "disclaimer", "reviewUnlock", "insights"], `${location}#results.estimate`);
    if (value.results.estimate.consistencyLabels !== undefined) exactObjectKeys(value.results.estimate.consistencyLabels, ["high", "medium", "mixed"], `${location}#results.estimate.consistencyLabels`);
    if (value.results.estimate.reviewUnlock !== undefined) exactObjectKeys(value.results.estimate.reviewUnlock, ["title", "copy", "button", "adNote", "reviewTitle", "yourChoice", "raised", "lowered", "neutral", "raisedCopy", "loweredCopy", "neutralCopy"], `${location}#results.estimate.reviewUnlock`);
    if (value.results.estimate.insights !== undefined) exactObjectKeys(value.results.estimate.insights, ["overview", "estimate", "signal", "consistency", "breakdown", "snapshot"], `${location}#results.estimate.insights`);
  }
  if (value?.results?.profileReveal !== undefined) {
    exactObjectKeys(value.results.profileReveal, ["eyebrow", "auraLabel", "traitsLabel", "strongestEnergy", "hiddenEnergy", "consistency", "consistencyLabels", "firstFeatureLabel", "portraitAlt", "breakdown", "disclaimer"], `${location}#results.profileReveal`);
    if (value.results.profileReveal.consistencyLabels !== undefined) exactObjectKeys(value.results.profileReveal.consistencyLabels, ["high", "medium", "mixed"], `${location}#results.profileReveal.consistencyLabels`);
    if (value.results.profileReveal.breakdown !== undefined) exactObjectKeys(value.results.profileReveal.breakdown, ["eyebrow", "title", "copy", "button", "adNote", "heading"], `${location}#results.profileReveal.breakdown`);
  }
  if (value?.results?.match !== undefined) exactObjectKeys(value.results.match, ["academicChallenge", "correctLabel", "strongest", "preferredStyle", "alternative", "wildcard", "wildcardTemplate", "bestRound", "disclaimer", "traitLabels"], `${location}#results.match`);
  const stageIds = config.structure?.stages?.map((stage) => stage.id) ?? [];
  fail(value?.stages && !Array.isArray(value.stages), `${location}: locale stages must be keyed by stable stage IDs.`);
  fail(JSON.stringify(Object.keys(value?.stages ?? {}).sort()) === JSON.stringify([...stageIds].sort()), `${location}: locale stage IDs must exactly match quiz.json.`);
  const forbiddenQuestionKeys = ["id", "answerIds", "correctAnswerId", "presentation", "icons", "calibration", "delay", "correct", "category", "reasoningSteps", "interactionStyle"];
  for (const stage of config.structure?.stages ?? []) {
    const localizedStage = value?.stages?.[stage.id];
    exactObjectKeys(localizedStage, ["title", "complete", "questions"], `${location}#stages.${stage.id}`);
    fail(JSON.stringify(Object.keys(localizedStage?.questions ?? {}).sort()) === JSON.stringify([...stage.questionIds].sort()), `${location}: ${stage.id} question IDs must exactly match quiz.json.`);
    for (const questionId of stage.questionIds) {
      const question = localizedStage?.questions?.[questionId] ?? {};
      exactObjectKeys(question, ["context", "visual", "image", "question", "headerLabel", "answers", "trapdoorErrors", "memoryItems", "continueLabel", "study"], `${location}#stages.${stage.id}.questions.${questionId}`);
      if (question.visual !== undefined) exactObjectKeys(question.visual, ["items", "ariaLabel"], `${location}#stages.${stage.id}.questions.${questionId}.visual`);
      if (question.image !== undefined) exactObjectKeys(question.image, ["alt"], `${location}#stages.${stage.id}.questions.${questionId}.image`);
      if (question.study !== undefined) exactObjectKeys(question.study, ["title", "instruction", "items", "readyLabel", "continueLabel", "adNote", "ariaLabel"], `${location}#stages.${stage.id}.questions.${questionId}.study`);
      fail(forbiddenQuestionKeys.every((key) => question[key] === undefined), `${location}: ${questionId} repeats logic owned by quiz.json.`);
      fail(question.visual?.columns === undefined && question.visual?.separator === undefined, `${location}: ${questionId} visual geometry belongs in quiz.json.`);
      fail(question.image?.src === undefined, `${location}: ${questionId} image paths belong in quiz.json.`);
      fail(question.study?.presentation === undefined && question.study?.durationMs === undefined && question.study?.mode === undefined, `${location}: ${questionId} study mechanics belong in quiz.json.`);
      const answerIds = config.structure?.questions?.[questionId]?.answerIds ?? [];
      if (question.answers !== undefined) {
        fail(question.answers && !Array.isArray(question.answers) && typeof question.answers === "object", `${location}: ${questionId} answers must be keyed by stable answer IDs.`);
        fail(JSON.stringify(Object.keys(question.answers ?? {}).sort()) === JSON.stringify([...answerIds].sort()), `${location}: ${questionId} answer IDs must exactly match quiz.json.`);
      }
      if (question.trapdoorErrors !== undefined) {
        fail(question.trapdoorErrors && !Array.isArray(question.trapdoorErrors) && typeof question.trapdoorErrors === "object", `${location}: ${questionId} trapdoorErrors must be keyed by answer IDs.`);
        fail(Object.keys(question.trapdoorErrors ?? {}).every((answerId) => answerIds.includes(answerId)), `${location}: ${questionId} trapdoorErrors reference an unknown answer ID.`);
      }
      for (const rule of config.structure?.questions?.[questionId]?.protectedTokens ?? []) {
        fail(rule && typeof rule === "object" && !Array.isArray(rule), `${location}: ${questionId} protected token rules must be objects.`);
        fail(JSON.stringify(Object.keys(rule ?? {}).sort()) === JSON.stringify(["count", "path", "value"]), `${location}: ${questionId} protected token rules require only count, path and value.`);
        fail(Number.isInteger(rule?.count) && rule.count > 0, `${location}: ${questionId} protected token count must be a positive integer.`);
        const protectedText = visibleStringAtPath(question, rule?.path ?? "");
        fail(typeof protectedText === "string" && tokenOccurrenceCount(protectedText, rule?.value ?? "") === rule?.count, `${location}: ${questionId}.${rule?.path} must preserve ${rule?.count} occurrence(s) of ${JSON.stringify(rule?.value)}.`);
      }
    }
  }
  function validateStringLeaves(current, currentPath = "") {
    if (typeof current === "string") return;
    if (Array.isArray(current)) return current.forEach((item, index) => validateStringLeaves(item, `${currentPath}[${index}]`));
    if (current && typeof current === "object") return Object.entries(current).forEach(([key, item]) => validateStringLeaves(item, currentPath ? `${currentPath}.${key}` : key));
    fail(false, `${location}#${currentPath}: locale leaves must be user-facing strings, not ${current === null ? "null" : typeof current}.`);
  }
  validateStringLeaves(value);
  fail(value?.results?.score?.showBestRound === undefined && value?.results?.score?.showPercentage === undefined, `${location}: result display configuration belongs in quiz.json.`);
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
  const prostateFallback = location.startsWith("prostatetest/");
  let prostateFallbackCount = 0;
  let prostateQuestionCount = 0;
  for (const question of (value.stages ?? []).flatMap((stage) => stage.questions ?? [])) {
    if (!question.answers || Array.isArray(question.answers)) continue;
    if (prostateFallback) prostateQuestionCount += 1;
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
        const isProstateFallback = prostateFallback && answerIndex === 0 && profileId === "no-current-changes" && weight === 0;
        if (prostateFallback && profileId === "no-current-changes") {
          fail(isProstateFallback && entries.length === 1, `${location}: ${question.id} no-current must remain an exclusive zero-weight fallback.`);
        }
        fail(typeof weight === "number" && Number.isFinite(weight) && (weight > 0 || isProstateFallback), `${location}: ${question.id} answer ${answerIndex + 1} has an invalid weight for ${profileId}.`);
        if (isProstateFallback) prostateFallbackCount += 1;
        if (profileId in expectedExposure && typeof weight === "number") expectedExposure[profileId] += weight / meanings.length;
      }
    });
  }
  if (prostateFallback) fail(prostateFallbackCount === prostateQuestionCount, `${location}: each question must retain one zero-weight no-current fallback answer.`);
  const exposure = Object.values(expectedExposure);
  if (!prostateFallback && exposure.length > 1 && exposure.every((value) => value > 0)) {
    const allowedGap = location.startsWith("grossquiz/") ? 0.5 : 0.05;
    fail(Math.max(...exposure) - Math.min(...exposure) <= allowedGap, `${location}: weighted profile opportunity is imbalanced under uniform answer selection.`);
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
  fail(!study.readyGate || (study.mode ?? "manual") === "automatic", `${location}: readiness gates require automatic study cues.`);
  if ((study.mode ?? "manual") === "manual") {
    fail(typeof study.continueLabel === "string" && Boolean(study.continueLabel.trim()), `${location}: manual study cues need continueLabel.`);
  }
  if (study.readyGate) fail(typeof study.readyLabel === "string" && Boolean(study.readyLabel.trim()), `${location}: readiness gates need readyLabel.`);
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
  const templateContract = quizTemplateContract(config.template);
  fail(Boolean(templateContract), `${folder.name}: unsupported quiz template ${config.template}.`);
  if (!templateContract) continue;
  const expectedStageCount = templateContract.stageCount;
  const expectedQuestionsPerStage = templateContract.questionsPerStage;
  const expectedQuestionTotal = expectedStageCount * expectedQuestionsPerStage;
  fail(config.schemaVersion === 2, `${folder.name}/quiz.json: schemaVersion 2 is required.`);
  fail(config.listing?.duration === undefined, `${folder.name}/quiz.json: duration is derived/unused and must not be stored.`);
  fail(config.structure?.stages?.length === expectedStageCount && config.structure.stages.every((stage) => stage.questionIds?.length === expectedQuestionsPerStage), `${folder.name}/quiz.json: structure does not match ${config.template}.`);
  fail(Object.keys(config.structure?.questions ?? {}).length === expectedQuestionTotal, `${folder.name}/quiz.json: structure must contain exactly ${expectedQuestionTotal} question definitions.`);
  for (const [questionId, question] of Object.entries(config.structure?.questions ?? {})) {
    const answerIds = question.answerIds;
    fail(Array.isArray(answerIds) && answerIds.length >= 1 && answerIds.length <= 5 && new Set(answerIds).size === answerIds.length, `${folder.name}/quiz.json: ${questionId} needs 1–5 unique answerIds.`);
    fail(question.choiceCount === undefined && question.correct === undefined, `${folder.name}/quiz.json: ${questionId} must not use positional choiceCount/correct fields.`);
    fail(question.correctAnswerId === undefined || answerIds?.includes(question.correctAnswerId), `${folder.name}/quiz.json: ${questionId} correctAnswerId must reference answerIds.`);
    for (const field of ["icons", "calibration", "choiceMeanings"]) {
      if (question[field] !== undefined) fail(JSON.stringify(Object.keys(question[field]).sort()) === JSON.stringify([...answerIds].sort()), `${folder.name}/quiz.json: ${questionId}.${field} must be keyed by answerIds.`);
    }
  }
  const manifestEngine = config.engine ?? {};
  const templateKeys = ["flow", "advance", "feedback", "checkpoint", "startOnLoad", "rewarded", "advanceDelayMs"];
  fail(templateKeys.every((key) => manifestEngine[key] === undefined), `${folder.name}: shared flow settings must come from the template, not individual manifests.`);
  config.engine = {
    flow: templateContract.flow,
    advance: templateContract.advance ?? "automatic",
    feedback: "selection-only",
    checkpoint: "ai",
    startOnLoad: templateContract.startOnLoad ?? false,
    rewarded: { start: templateContract.rewardedStart ?? true, stages: true, attempts: 3, confirmStart: false },
    advanceDelayMs: 450,
    ...manifestEngine,
  };
  fail(config.slug === folder.name, `${folder.name}: quiz.json slug must match its folder.`);
  fail(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(config.slug ?? ""), `${folder.name}: slug must use lowercase URL-safe words separated by hyphens.`);
  fail(!new Set([...supportedLocales, "info", "api", "_next"]).has(config.slug), `${folder.name}: slug ${config.slug} is reserved by site routing.`);
  fail(config.engine?.flow && config.engine?.scoring, `${folder.name}: quiz.json needs engine flow and scoring.`);
  fail(config.engine.flow === templateContract.flow
    && config.engine.advance === (templateContract.advance ?? "automatic")
    && config.engine.feedback === "selection-only"
    && config.engine.checkpoint === "ai"
    && config.engine.startOnLoad === (templateContract.startOnLoad ?? false)
    && config.engine.advanceDelayMs === 450
    && JSON.stringify(config.engine.rewarded) === JSON.stringify({ start: templateContract.rewardedStart ?? true, stages: true, attempts: 3, confirmStart: false }), `${folder.name}: quiz must resolve to its shared template engine.`);
  fail(config.listing?.socialProofCount === SOCIAL_PROOF_COUNTS[folder.name], `${folder.name}/quiz.json: listing.socialProofCount must use the shared stable quiz count.`);
  fail(config.listing?.showSocialProof === undefined || typeof config.listing.showSocialProof === "boolean", `${folder.name}/quiz.json: listing.showSocialProof must be a boolean when provided.`);
  fail(config.listing?.compactLanding === undefined || typeof config.listing.compactLanding === "boolean", `${folder.name}/quiz.json: listing.compactLanding must be a boolean when provided.`);
  fail(config.engine?.resultAds === undefined && config.engine?.questionAd === undefined, `${folder.name}: display ads are not part of the shared quiz template.`);
  fail([undefined, "strict", "independent"].includes(config.engine?.localeParity), `${folder.name}: engine.localeParity must be strict or independent.`);
  fail(config.engine?.hardRefreshCheckpoints === undefined || typeof config.engine.hardRefreshCheckpoints === "boolean", `${folder.name}: engine.hardRefreshCheckpoints must be a boolean when provided.`);
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
  const activeLocales = config.activeLocales ?? localeFiles.map((file) => file.replace(/\.json$/, ""));
  fail(Array.isArray(activeLocales) && activeLocales.length > 0 && new Set(activeLocales).size === activeLocales.length && activeLocales.every((locale) => supportedLocales.has(locale)), `${folder.name}: activeLocales must contain unique supported locale codes.`);
  const activeLocaleFiles = activeLocales.map((locale) => `${locale}.json`);
  fail(activeLocaleFiles.every((file) => localeFiles.includes(file)), `${folder.name}: every active locale must have a locale file.`);
  fail(activeLocaleFiles.includes("en.json"), `${folder.name}: English must remain active.`);
  const sortedLocaleFiles = [...activeLocaleFiles].sort();
  const expectedLocaleFiles = [...supportedLocales].map((locale) => `${locale}.json`).sort();
  fail(JSON.stringify(sortedLocaleFiles) === JSON.stringify(expectedLocaleFiles), `${folder.name}: every quiz must be active in all supported locales: ${expectedLocaleFiles.join(", ")}.`);

  const sourceRaw = read(path.join(directory, "en.json"));
  if (sourceRaw) validateTextOnlyLocale(sourceRaw, config, `${folder.name}/en.json`, "en");
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
  fail(typeof source.career?.resultProgressLabel === "string" && source.career?.resultProgressComplete?.includes("{value}"), `${folder.name}: themed progress label and shared completion copy are required after expansion.`);
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
    const expectedPositions = [0, 1, 2, 3].map((index) => (
      Math.floor(sourceQuestions.length / 4) + (index < sourceQuestions.length % 4 ? 1 : 0)
    ));
    fail(JSON.stringify(sharedPositions) === JSON.stringify(expectedPositions), `${folder.name}/en.json: answer positions must match the shared template balance.`);
    fail(expectedStageCount > 1 || source.results?.score?.showBestRound === false, `${folder.name}/en.json: single-stage quizzes must not show a redundant best-round module.`);
    const questionCategories = [...new Set(sourceQuestions.map((question) => question.category).filter(Boolean))].sort();
    const dimensionCategories = (source.results?.dimensions ?? []).flatMap((dimension) => dimension.categories ?? []).sort();
    fail(JSON.stringify(dimensionCategories) === JSON.stringify(questionCategories), `${folder.name}/en.json: every scored category must appear in exactly one result dimension.`);
  }
  if (folder.name === "marry") {
    const expectedProfiles = ["warm_anchor", "playful_spark", "quiet_creative", "grounded_builder", "magnetic_connector", "curious_explorer", "thoughtful_dreamer", "ambitious_teammate"];
    const selector = config.engine?.profileArtworkSelector;
    const selectorQuestion = sourceQuestions[0];
    fail(config.template === "single-stage-rewarded-v1" && config.engine?.scoring === "weighted-profile", "marry: must use the shared single-stage weighted-profile engine.");
    fail(sourceQuestions.length === 10 && sourceQuestions[0]?.id === "marry-r1q1", "marry: needs the approved ten-choice sequence beginning with the portrait selector.");
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.id)) === JSON.stringify(expectedProfiles), "marry: archetype set or fixed tie order changed.");
    fail(selector?.questionId === "marry-r1q1" && selector?.fallback === "stable-answer-hash", "marry: profile artwork selector is missing or invalid.");
    fail(JSON.stringify(selector?.fixedVariants) === JSON.stringify({ a1: "masculine", a2: "feminine", a3: "androgynous" }), "marry: fixed presentation mappings changed.");
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
    fail(config.template === "single-stage-rewarded-v1", "firefighter: must use the ten-question rewarded flow.");
    fail(source.title === "Only 11% Can Pass This Firefighter Entrance Exam", "firefighter/en.json: title changed.");
    fail(source.landing?.cta === "Start Test" && config.listing?.socialProofCount === 268000, "firefighter: landing CTA and social proof must match the approved launch copy.");
    fail(JSON.stringify(sourceQuestionIds) === JSON.stringify(expectedQuestionIds), "firefighter/en.json: approved ten-question sequence changed.");
    fail(firefighterCategories.every((category) => categoryCounts[category] >= 1), "firefighter/en.json: every entrance area must be represented.");
    fail(sourceQuestions.every((question) => typeof question.headerLabel === "string" && question.headerLabel.trim()), "firefighter/en.json: every question needs a distinct header label.");
    fail(Boolean(source.career?.stages?.[0]?.preAdTitle) && Boolean(source.career?.stages?.[0]?.preAdButton), "firefighter/en.json: final reveal gate is missing.");
    fail(source.career?.stages?.[0]?.preAdChecks?.[0] === "10 answers checked", "firefighter/en.json: ten-answer result checklist changed.");
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.title)) === JSON.stringify(expectedProfiles), "firefighter/en.json: candidate profile names changed.");
    fail(new Set(sourceQuestions.map((question) => question.interactionStyle)).size >= 5, "firefighter/en.json: the short challenge must retain varied reasoning styles.");
    fail(sourceQuestions.at(-1)?.reasoningSteps === 2 && /synthesis/.test(sourceQuestions.at(-1)?.interactionStyle ?? ""), "firefighter/en.json: final question must retain two-step reasoning.");
    fail(!forbiddenOperationalCopy.test(sourceQuestions.map((question) => `${question.question} ${question.answers.join(" ")}`).join(" ")), "firefighter/en.json: operational firefighting instruction is outside the quiz scope.");
    fail(source.results?.score?.reviewUnlock === undefined && source.career?.reportUnlock === undefined, "firefighter/en.json: shared breakdown-unlock copy must not be duplicated in quiz data.");
    fail(questionsById["firefighter-s3q6"]?.question === "A hot surface warms your face from several metres away without contact. Which heat-transfer process best explains this?", "firefighter/en.json: the radiation question must remain unambiguous.");
    fail(questionsById["firefighter-s3q2"]?.answers?.[questionsById["firefighter-s3q2"].correct] === "60 metres" && questionsById["firefighter-s5q6"]?.answers?.[questionsById["firefighter-s5q6"].correct] === "12", "firefighter/en.json: approved numeracy answers changed.");
    fail(/ten.{0,20}questions/i.test(source.about?.body ?? ""), "firefighter/en.json: About copy must describe the ten-question format.");
    fail(firefighterLandingBlocks.length > 0 && firefighterLandingBlocks.every((block) => !/(?:^|;)\s*(?:grid-template-columns|width|padding(?:-[a-z]+)?)\s*:/m.test(block)), "firefighter/theme.css: shared landing grid, width and padding must not be overridden.");
  }
  if (["oxford", "cambridge", "harvard", "nursing", "paramedic", "midwifery", "chef"].includes(folder.name)) {
    fail(source.career?.stages?.length === 1, `${folder.name}/en.json: entrance challenge must have one result gate.`);
    fail(Boolean(source.career?.stages?.[0]?.preAdTitle), `${folder.name}/en.json: result-ready title is missing.`);
    fail(source.career?.stages?.[0]?.preAdChecks?.[0] === "10 answers checked", `${folder.name}/en.json: ten-answer final checklist changed.`);
  }
  if (["memory", "years-left"].includes(folder.name)) {
    const memory = folder.name === "memory";
    const expectedIds = memory
      ? ["memory-r1q1", "memory-r1q4", "memory-r2q2", "memory-r2q3", "memory-r3q1", "memory-r3q7", "memory-r4q1", "memory-r4q2", "memory-r5q2", "memory-r5q4"]
      : ["yl-s1q1", "yl-s1q2", "yl-s2q1", "yl-s2q2", "yl-s3q1", "yl-s3q2", "yl-s4q1", "yl-s4q2", "yl-s5q1", "yl-s5q8"];
    fail(config.template === "single-stage-rewarded-v1" && config.engine.flow === "linear" && config.engine.advance === "automatic", folder.name + ": must use the ten-question automatic flow.");
    fail(!config.engine.startOnLoad && config.engine.rewarded.start && config.engine.rewarded.stages, folder.name + ": must retain the landing page, starting reward and round rewards.");
    fail(config.engine.hardRefreshCheckpoints === false, folder.name + ": SPA must not reload at the result gate.");
    fail(source.stages.length === 1 && sourceQuestions.length === 10, folder.name + ": needs exactly ten questions in one stage.");
    fail(JSON.stringify(sourceQuestionIds) === JSON.stringify(expectedIds), folder.name + ": approved question order or recall dependencies changed.");
    fail(sourceQuestions.every(q => { const choices = Array.isArray(q.answers) ? q.answers : Object.keys(q.answers); return choices.length === 4 && new Set(choices).size === 4; }), folder.name + ": needs four unique choices per question.");
    fail(source.career.stages.length === 1 && !source.career.stages[0].next && source.career.stages[0].preAdChecks[0].includes("10"), folder.name + ": needs a final result gate after ten answers.");
    fail(!/40 answers|forty/i.test(JSON.stringify(source)), folder.name + ": stale forty-question copy.");
    if (memory) {
      fail(config.engine.targetRatio === 0.8 && source.results.score.showBestRound === false, "memory: retain 80% target without a redundant best-round module.");
      fail(sourceQuestions.every(q => Number.isInteger(q.correct)), "memory: every answer must remain scored.");
      fail(JSON.stringify(sourceQuestions.filter(q=>q.study).map(q=>q.id)) === JSON.stringify(["memory-r1q1", "memory-r3q1", "memory-r4q1"]), "memory: retain all three required recall boards.");
      fail(sourceQuestions.filter(q=>q.study).every(q=>q.study.mode === "manual" && q.study.continueLabel === "I’m Ready"), "memory: no timed study boards.");
    } else {
      fail(config.engine.estimate.baseAge === 84 && config.engine.estimate.minAge === 73 && config.engine.estimate.maxAge === 95, "years-left: preserve estimate safety clamp.");
      fail(sourceQuestions.filter(q=>q.calibration).length === 1 && sourceQuestions.at(-1).calibration.length === 4, "years-left: preserve final calibration.");
    }
  }
  if (folder.name === "iq") {
    const expectedIds = ["iq-s1q1", "iq-s1q4", "iq-s2q2", "iq-s2q6", "iq-s3q2", "iq-s3q4", "iq-s4q1", "iq-s4q4", "iq-s5q2", "iq-s5q8"];
    fail(config.template === "single-stage-rewarded-v1" && config.engine?.targetRatio === 0.8, "iq: must use ten questions and an 80% target.");
    fail(JSON.stringify(sourceQuestionIds) === JSON.stringify(expectedIds), "iq/en.json: approved ten puzzles changed.");
    fail(sourceQuestions.every((question) => typeof question.headerLabel === "string" && question.headerLabel.trim()), "iq/en.json: every puzzle needs a question-type header.");
    fail(Boolean(source.career?.stages?.[0]?.preAdTitle) && source.career?.stages?.[0]?.preAdChecks?.[0] === "10 answers checked", "iq/en.json: final result gate changed.");
    fail(source.results?.score?.showBestRound === false, "iq/en.json: a single-stage quiz must not show best round.");
    fail(source.title === "Only 7% Pass This Intelligence Test", "iq/en.json: title changed.");
  }
  for (const localeFile of activeLocaleFiles) {
    const localizedRaw = read(path.join(directory, localeFile));
    if (localizedRaw) validateTextOnlyLocale(localizedRaw, config, `${folder.name}/${localeFile}`, localeFile.replace(/\.json$/, ""));
    const localized = localizedRaw ? expandQuizLocale(config, localizedRaw, localeFile.replace(/\.json$/, "")) : null;
    if (!localized) continue;
    const landingIntroLines = localizedRaw?.landing?.intro?.split("\n") ?? [];
    fail(landingIntroLines.length === 2 && landingIntroLines.every((line) => line.trim()), `${folder.name}/${localeFile}: landing intro must contain exactly two non-empty lines.`);
    const questions = (localized.stages ?? []).flatMap((stage) => stage.questions ?? []);
    const questionIds = questions.map((question) => question.id);
    fail(questionIds.every((id) => typeof id === "string" && Boolean(id.trim())), `${folder.name}/${localeFile}: every question needs a stable id.`);
    fail(new Set(questionIds).size === questionIds.length, `${folder.name}/${localeFile}: question ids must be unique.`);
    const localizedProfileStructure = validateResultProfiles(localized, config.engine?.scoring, `${folder.name}/${localeFile}`);
    fail(JSON.stringify(localizedProfileStructure) === JSON.stringify(sourceProfileStructure), `${folder.name}/${localeFile}: result profile ids and thresholds differ from English.`);
    if (config.engine?.scoring === "weighted-profile") validateWeightedReferences(localized, `${folder.name}/${localeFile}`);
    if (folder.name === "iq") {
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
        readyGate: question.study.readyGate ?? false,
      } : undefined) === JSON.stringify(sourceQuestion?.study ? {
        presentation: sourceQuestion.study.presentation ?? "text",
        items: sourceQuestion.study.items?.length,
        durationMs: sourceQuestion.study.durationMs ?? 2000,
        mode: sourceQuestion.study.mode ?? "manual",
        readyGate: sourceQuestion.study.readyGate ?? false,
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
