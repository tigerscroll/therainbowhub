import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "data", "quizzes");
const supportedLocales = new Set(fs.readdirSync(path.join(process.cwd(), "data", "i18n"))
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.replace(/\.json$/, "")));
const errors = [];
const folders = fs.readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, entry.name, "quiz.json")));

function read(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { errors.push(`${path.relative(process.cwd(), file)}: ${error.message}`); return null; }
}

function fail(condition, message) { if (!condition) errors.push(message); }

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
  fail(config.slug === folder.name, `${folder.name}: quiz.json slug must match its folder.`);
  fail(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(config.slug ?? ""), `${folder.name}: slug must use lowercase URL-safe words separated by hyphens.`);
  fail(!new Set([...supportedLocales, "info", "api", "_next"]).has(config.slug), `${folder.name}: slug ${config.slug} is reserved by site routing.`);
  fail(config.engine?.flow && config.engine?.scoring, `${folder.name}: quiz.json needs engine flow and scoring.`);
  fail(folder.name === "chef" || config.engine?.resultAds === undefined, `${folder.name}: result display ads are permitted only for Chef.`);
  fail(folder.name === "chef" || config.engine?.questionAd === undefined, `${folder.name}: in-question display ads are permitted only for Chef.`);
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

  const source = read(path.join(directory, "en.json"));
  if (!source) continue;
  const sourceQuestions = (source.stages ?? []).flatMap((stage) => stage.questions ?? []);
  const sourceQuestionIds = sourceQuestions.map((question) => question.id);
  fail(sourceQuestionIds.every((id) => typeof id === "string" && Boolean(id.trim())), `${folder.name}/en.json: every question needs a stable id.`);
  fail(new Set(sourceQuestionIds).size === sourceQuestionIds.length, `${folder.name}/en.json: question ids must be unique.`);
  const sourceProfileStructure = validateResultProfiles(source, config.engine?.scoring, `${folder.name}/en.json`);
  if (config.engine?.scoring === "weighted-profile") validateWeightedReferences(source, `${folder.name}/en.json`);
  if (config.engine?.checkpoint === "ai") fail(source.stages?.every((stage) => stage.complete === undefined), `${folder.name}/en.json: AI checkpoint stages must not contain unused complete copy.`);
  fail(Boolean(source.title && source.summary), `${folder.name}/en.json: title and summary are required.`);
  fail(sourceQuestions.length > 0, `${folder.name}/en.json: at least one question is required.`);
  if (folder.name === "years-left") {
    const expectedStages = ["Everyday Rhythm", "Fuel & Movement", "Rest & Resilience", "Connection & Choices", "Final Prediction"];
    const byId = new Map(sourceQuestions.map((question) => [question.id, question]));
    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), "years-left: must launch in English only.");
    fail(config.engine?.flow === "staged" && source.progressLabel === "complete", "years-left: must use its staged prediction flow.");
    fail(source.stages?.length === 5 && source.stages.every((stage) => stage.questions?.length === 8), "years-left/en.json: must contain five stages of eight interactions.");
    fail(JSON.stringify(source.stages?.map((stage) => stage.title)) === JSON.stringify(expectedStages), "years-left/en.json: prediction-stage order changed.");
    fail(sourceQuestions.length === 40 && new Set(sourceQuestionIds).size === 40, "years-left/en.json: must contain 40 unique interactions.");
    fail(sourceQuestions.every((question) => question.context === undefined && question.contextRequired === undefined), "years-left/en.json: compact screens must not use separate context banners.");
    fail(sourceQuestions.every((question) => question.delay === undefined), "years-left/en.json: questions must inherit the shared advance delay.");
    fail(sourceQuestions.every((question) => question.question.trim().split(/\s+/).length <= 20), "years-left/en.json: compact prompts must stay at 20 words or fewer.");
    fail(config.engine?.advanceDelayMs === 450, "years-left: default advance delay must remain 450ms.");
    fail(config.engine?.startOnLoad === false && config.engine?.rewarded?.start === true && config.engine?.rewarded?.confirmStart === false, "years-left: must open on its landing and use the direct rewarded Start flow.");
    fail(config.engine?.rewarded?.stages === true && config.engine?.rewarded?.attempts === 3, "years-left: needs one rewarded result gate after every stage.");
    fail(source.title === "How Long Do You Have Left To Live?", "years-left/en.json: title changed.");
    fail(source.landing?.startPrompt === undefined && source.landing?.startNote === "Short ad first - then it begins.", "years-left/en.json: direct rewarded Start helper changed.");
    fail(source.results?.estimate?.reviewUnlock?.button === "See What Shaped It", "years-left/en.json: choice-impact reveal copy is incomplete.");
    fail(source.results?.estimate?.reviewUnlock?.rewarded === false, "years-left/en.json: choice-impact details must be included in the final result without another rewarded gate.");
    fail(config.engine?.estimate?.baseAge === 84 && config.engine?.estimate?.minAge === 73 && config.engine?.estimate?.maxAge === 95, "years-left: estimate base and safety clamp are incorrect.");
    fail(config.engine?.estimate?.calibrationMax === 1 && JSON.stringify(config.engine?.estimate?.brainAdjustments) === JSON.stringify({ "0": 0 }), "years-left: compact estimate calibration is incorrect.");
    fail(byId.get("r2q1")?.presentation === "icons" && byId.get("r2q1")?.icons?.length === 4, "years-left: snack-table interaction needs four aligned icons.");
    fail(byId.get("r3q6")?.presentation === "icons" && JSON.stringify(byId.get("r3q6")?.icons) === JSON.stringify(["🛋️", "🚶", "🚴", "🏃"]), "years-left: movement interaction icons changed.");
    fail(byId.get("r4q3")?.presentation === "scale" && Object.keys(byId.get("r4q3")?.answers ?? {}).length === 5, "years-left: rested interaction must remain a five-stop scale.");
    fail(byId.get("r6q6")?.presentation === "scale" && Object.keys(byId.get("r6q6")?.answers ?? {}).length === 5, "years-left: social connection must remain a five-stop scale.");
    fail(["r6q1", "r6q2", "r6q3", "r6q4", "r6q5"].every((id) => Object.keys(byId.get(id)?.answers ?? {}).length === 3), "years-left: the first five Connection & Choices interactions must retain three nuanced choices.");
    fail(byId.get("r1q5")?.question === "When your energy dips halfway through the day, what helps most?", "years-left: Everyday Rhythm must not repeat the earlier free-evening interaction.");
    fail(byId.get("r3q2")?.presentation === "icons" && JSON.stringify(byId.get("r3q2")?.icons) === JSON.stringify(["🚗", "🚌", "🚶", "🚲"]), "years-left: everyday activity icons changed.");
    fail(byId.get("r10q4")?.presentation === "text" && Object.keys(byId.get("r10q4")?.answers ?? {}).length === 4, "years-left: habit consistency must remain a compact four-choice interaction.");
    fail(sourceQuestions.every((question) => question.presentation !== "memory-cue" && question.correct === undefined), "years-left: lifestyle flow must not contain unrelated Brain Check scoring.");
    fail(sourceQuestions.filter((question) => question.calibration !== undefined).length === 1 && byId.get("r10q6")?.calibration?.length === 4, "years-left: final calibration values must match every answer.");
    fail(source.checkpoint?.reveals?.length === 5 && source.checkpoint?.finalButton === "See My Estimate", "years-left/en.json: final gate changed.");
    fail(source.career?.hideJourneyLength === true && source.career?.continuousShell === true && source.career?.showStageResults === false, "years-left/en.json: persistent progress-only stage shell is required.");
    fail(source.career?.showCurrentScore === false && source.career?.showResultProgress === true, "years-left/en.json: results must show macro progress without a misleading correctness score.");
    fail(JSON.stringify(source.career?.stages?.slice(0, 4).map((stage) => [stage.preAdTitle, stage.preAdCopy, stage.preAdButton])) === JSON.stringify([
      ["Daily rhythm captured", "Your routine and everyday habits are now shaping the estimate.", "Continue"],
      ["Energy patterns captured", "Food, energy and movement choices have sharpened your lifestyle picture.", "Continue"],
      ["Recovery patterns mapped", "Sleep, stress and recovery signals have now been added.", "Continue"],
      ["Your estimate is taking shape", "Connection and everyday choices are mapped. Only the final prediction remains.", "Continue"],
    ]), "years-left/en.json: progress checkpoints must build the estimate without revealing intermediate results.");
    fail(source.career?.stages?.slice(0, 4).every((stage) => stage.preAdChecks === undefined) && source.career?.stages?.[4]?.preAdChecks?.length === 3, "years-left/en.json: only the final estimate gate may show checklist rows.");
    fail(source.checkpoint?.adNote === "Short ad first — then continue." && source.checkpoint?.finalAdNote === "Short ad first — then see your estimate.", "years-left/en.json: rewarded checkpoint helper copy changed.");
    fail(source.career?.stages?.length === 5 && source.career.stages.slice(0, 4).every((stage) => stage.next?.button === "Continue"), "years-left/en.json: all intermediate stage CTAs must use Continue.");
    fail(source.about?.body?.split(/\n\s*\n/).length === 3 && source.about?.howToPlay?.steps?.length === 3, "years-left/en.json: needs the full compact About and How to Play copy.");
  }
  if (folder.name === "memory") {
    const categories = new Set(["word_recall", "visual", "numbers", "working_memory", "association", "attention"]);
    const ids = sourceQuestions.map((question) => question.id);
    const expectedStages = ["Quick Recall", "Pictures & Details", "Numbers & Patterns", "The Memory Trap", "Final Memory Challenge"];
    const expectedCategoryCounts = { word_recall: 7, visual: 7, numbers: 7, working_memory: 7, association: 6, attention: 6 };
    const expectedCorrectPositions = [
      [1, 3, 0, 2, 0, 3, 1, 2],
      [2, 0, 3, 1, 3, 1, 0, 2],
      [3, 1, 2, 0, 1, 2, 0, 3],
      [0, 2, 1, 3, 2, 0, 3, 1],
      [1, 3, 0, 2, 3, 1, 2, 0],
    ];
    const expectedIntermediateBands = [
      {
        high: ["Recall Ignited", "You captured the opening details with sharp, confident recall."],
        medium: ["Memory Warm-Up Complete", "Several opening details stuck, while a few slipped away."],
        low: ["First Signal Captured", "The opening round found useful clues about what captures your attention."],
      },
      {
        high: ["Detail Detective", "Colours, positions and object order stayed impressively clear."],
        medium: ["Visual Signals Captured", "Some colours, positions and object order stayed clear, while finer details proved trickier."],
        low: ["Detail Profile Building", "The visual round exposed the details most likely to slip past unnoticed."],
      },
      {
        high: ["Pattern Keeper", "You held and manipulated number patterns with excellent control."],
        medium: ["Numbers Held Strong", "You held several number and sequence clues correctly, while the harder manipulations added pressure."],
        low: ["Working Memory Stretched", "The number round stretched your working memory and added a useful new signal."],
      },
      {
        high: ["Trap Breaker", "You separated similar clues and retrieved older details under interference."],
        medium: ["Interference Resisted", "You recovered several older details despite the similar clues and interference."],
        low: ["Recall Under Pressure", "The traps were demanding, but completing them strengthened your overall profile."],
      },
    ];
    fail(config.engine?.flow === "staged" && config.engine?.localeParity === "independent", `${folder.name}: English Memory must use the staged independent-locale flow.`);
    fail(source.stages?.length === 5 && source.stages.every((stage) => stage.questions?.length === 8), `${folder.name}/en.json: Memory must contain five rounds of eight questions.`);
    fail(JSON.stringify(source.stages.map((stage) => stage.title)) === JSON.stringify(expectedStages), `${folder.name}/en.json: Memory round order changed.`);
    fail(ids.length === 40 && new Set(ids).size === 40, `${folder.name}/en.json: Memory needs 40 unique scored questions.`);
    fail(sourceQuestions.every((question) => question.context === undefined && question.contextRequired === undefined), `${folder.name}/en.json: compact Memory screens must not use separate context banners.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.answers?.length === 4 && new Set(question.answers).size === question.answers.length), `${folder.name}/en.json: every Memory question needs four unique choices and one valid answer.`);
    fail(JSON.stringify([0, 1, 2, 3].map((index) => sourceQuestions.filter((question) => question.correct === index).length)) === JSON.stringify([10, 10, 10, 10]), `${folder.name}/en.json: Memory correct positions must be exactly 10/10/10/10.`);
    fail(JSON.stringify(source.stages.map((stage) => stage.questions.map((question) => question.correct))) === JSON.stringify(expectedCorrectPositions), `${folder.name}/en.json: the approved per-round correct-position sequence changed.`);
    fail(sourceQuestions.every((question) => categories.has(question.category)), `${folder.name}/en.json: every Memory question needs an approved category.`);
    fail(Object.entries(expectedCategoryCounts).every(([category, count]) => sourceQuestions.filter((question) => question.category === category).length === count), `${folder.name}/en.json: Memory category distribution must remain 7/7/7/7/6/6.`);
    fail(sourceQuestions[0]?.study?.mode === "manual" && sourceQuestions.slice(1).every((question) => question.study?.mode !== "manual"), `${folder.name}/en.json: only the opening cue may be untimed.`);
    fail(sourceQuestions.every((question) => !question.study || question.study.items?.length <= 6), `${folder.name}/en.json: Memory study cues may never exceed six separate items.`);
    fail(sourceQuestions.every((question) => question.study?.mode !== "automatic" || (question.study.durationMs >= 3000 && question.study.durationMs <= 6000)), `${folder.name}/en.json: automatic study cues must remain between 3000ms and 6000ms.`);
    fail(source.stages.every((stage) => stage.questions.filter((question) => question.study).length >= 2 && stage.questions.filter((question) => question.study).length <= 3), `${folder.name}/en.json: each Memory round needs two or three meaningful study moments.`);
    fail(config.engine?.targetRatio === 0.8 && config.engine?.rewarded?.start === true && config.engine?.rewarded?.stages === true && config.engine?.rewarded?.attempts === 3 && config.engine?.rewarded?.confirmStart === false, `${folder.name}: Memory target and rewarded flow changed.`);
    const rewardedOpportunityCount = Number(config.engine?.rewarded?.start === true) + (config.engine?.rewarded?.stages === true ? source.stages.length : 0) + Number(Boolean(source.results?.score?.reviewUnlock || source.career?.reportUnlock));
    fail(rewardedOpportunityCount === 6, `${folder.name}: Memory must expose exactly six maximum rewarded opportunities.`);
    fail(config.engine?.resultAds === undefined && config.engine?.questionAd === undefined, `${folder.name}: display ads must not interrupt the Memory challenge.`);
    fail(config.engine?.startOnLoad === false && config.engine?.rewarded?.start === true, `${folder.name}: Memory must open on its landing and use a rewarded Start gate.`);
    fail(source.landing?.startPrompt === undefined && source.landing?.startNote === "Short ad first - then it begins.", `${folder.name}/en.json: Memory direct rewarded Start helper changed.`);
    fail(source.career?.hideJourneyLength === true && source.career?.continuousShell === true && source.career?.showStageResults === false && source.career?.showResultProgress === true, `${folder.name}/en.json: Memory needs its hidden journey, persistent shell, progress-only checkpoints and demoted progress.`);
    fail(source.career?.resultProgressLabel === "Memory challenge" && source.career?.resultProgressComplete === "{value}% complete", `${folder.name}/en.json: compact Memory progress copy changed.`);
    fail(source.career?.stages?.length === 5 && JSON.stringify(source.career.stages.map((stage) => stage.difficulty)) === JSON.stringify(["Foundation", "Developing", "Skilled", "Advanced", "Final Assessment"]), `${folder.name}/en.json: Memory difficulty progression changed.`);
    fail(source.career?.stages?.slice(0, 4).every((stage) => stage.next) && source.career?.stages?.[4]?.next === undefined, `${folder.name}/en.json: Memory needs four next-challenge teasers and no final teaser.`);
    fail(source.career?.stages?.slice(0, 4).every((stage, index) => ["high", "medium", "low"].every((band) => stage.resultBands?.[band]?.title === expectedIntermediateBands[index][band][0] && stage.resultBands?.[band]?.insight === expectedIntermediateBands[index][band][1])), `${folder.name}/en.json: approved Memory result-band copy changed.`);
    fail(source.career?.stages?.slice(0, 4).every((stage) => stage.preAdChecks === undefined) && source.career?.stages?.[4]?.preAdChecks?.length === 3, `${folder.name}/en.json: only the final Memory result gate may use checklist rows.`);
    fail(JSON.stringify(source.career?.stages?.slice(0, 4).map((stage) => [stage.preAdTitle, stage.preAdCopy, stage.preAdButton])) === JSON.stringify([
      ["Quick Recall captured", "Your first recall patterns have been added. Keep going to sharpen the result.", "Continue"],
      ["Visual patterns captured", "Colours, positions and details are now shaping your memory result.", "Continue"],
      ["Working memory mapped", "Number, order and manipulation patterns have now been added.", "Continue"],
      ["Your memory profile is taking shape", "Your resistance to interference is now mapped. Only the final challenge remains.", "Continue"],
    ]), `${folder.name}/en.json: Memory checkpoints must build the result without revealing intermediate scores.`);
    fail(source.career?.stages?.[4]?.preAdBadge === "FINAL MEMORY CHALLENGE COMPLETE" && source.career?.stages?.[4]?.preAdTitle === "YOUR MEMORY RESULT IS READY" && source.career?.stages?.[4]?.resultIcon === "🧠" && source.career?.stages?.[4]?.preAdCopy === undefined, `${folder.name}/en.json: the final Memory gate hierarchy changed.`);
    fail(JSON.stringify(source.career?.stages?.slice(0, 4).map((stage) => stage.next?.tagline)) === JSON.stringify(["Colours. Positions. Changes.", "Digits. Order. Working memory.", "Interference. Similar clues. Older memories.", "Delayed recall. Working memory. Final callbacks."]), `${folder.name}/en.json: Memory next-round taglines must describe the upcoming round.`);
    fail(source.career?.stages?.slice(0, 4).every((stage) => stage.next?.copy === undefined), `${folder.name}/en.json: compact Memory teasers must not add a second explanatory line.`);
    fail(source.career?.stages?.slice(0, 4).every((stage) => stage.next?.button === "Continue"), `${folder.name}/en.json: Memory next-round CTAs must use Continue.`);
    fail(source.checkpoint?.reveals?.length === 5 && source.checkpoint?.adNote === "Short ad first — then continue." && source.checkpoint?.finalAdNote === "Short ad first — then see your result." && source.checkpoint?.finalButton === "See My Result", `${folder.name}/en.json: Memory needs four progress gates and one final rewarded result gate.`);
    fail(source.results?.score?.reviewUnlock === undefined && source.career?.reportUnlock === undefined, `${folder.name}/en.json: Memory answer review must not add a seventh rewarded opportunity.`);
    const details = source.results?.score?.insights?.details;
    fail(details?.roadmapItems?.length === 4 && details?.measuredAreas?.length === 3 && details?.tips?.length === 3 && details?.finalTitle && details?.finalCopy, `${folder.name}/en.json: English Memory needs the full result report.`);
    fail(source.results?.score?.showBestRound === true, `${folder.name}/en.json: Memory final result must show the best round.`);
    fail(sourceQuestions[0]?.study?.items?.includes("PURPLE ELEPHANT") && /elephant/i.test(sourceQuestions[32]?.question) && sourceQuestions[32]?.answers?.[sourceQuestions[32]?.correct] === "Purple", `${folder.name}/en.json: the opening purple-elephant seed and final callback must remain aligned.`);
    fail(/Sarah/.test(sourceQuestions[11]?.study?.items?.join(" ") ?? "") && sourceQuestions[13]?.answers?.[sourceQuestions[13]?.correct] === "Blue", `${folder.name}/en.json: Sarah's delayed detail seed and callback must remain aligned.`);
    fail(sourceQuestions[33]?.answers?.[sourceQuestions[33]?.correct] === "Clock" && sourceQuestions[36]?.answers?.[sourceQuestions[36]?.correct] === "65" && sourceQuestions[37]?.answers?.[sourceQuestions[37]?.correct] === "08:40" && sourceQuestions[38]?.answers?.[sourceQuestions[38]?.correct] === "MARKER", `${folder.name}/en.json: final delayed callbacks and working-memory answers are misaligned.`);
    fail(JSON.stringify(sourceQuestions[8]?.study?.items) === JSON.stringify(["🧢", "🧁", "📷", "🪁", "🧤", "🔔"]) && sourceQuestions[8]?.study?.durationMs === 5000, `${folder.name}/en.json: Pictures & Details needs six separate ordered objects.`);
    fail(sourceQuestions[8]?.answers?.[sourceQuestions[8]?.correct] === "Camera" && sourceQuestions[12]?.answers?.[sourceQuestions[12]?.correct] === "Camera" && sourceQuestions[15]?.answers?.[sourceQuestions[15]?.correct] === "Camera and glove", `${folder.name}/en.json: object-order questions no longer match their study cue.`);
    fail(JSON.stringify(sourceQuestions[24]?.study?.items) === JSON.stringify(["MARKET", "MARKER", "MARBLE", "MARGIN", "MARVEL"]) && sourceQuestions[24]?.study?.durationMs === 4500, `${folder.name}/en.json: the five-word Memory Trap cue changed.`);
    fail(JSON.stringify(sourceQuestions[25]?.study?.items) === JSON.stringify(["🔔", "🧲", "🪜", "🧩", "🕯️"]) && sourceQuestions[25]?.study?.durationMs === 4500, `${folder.name}/en.json: the five-object Memory Trap cue changed.`);
    fail(sourceQuestions[26]?.question === "Which code is B7RK with only the final two letters swapped?" && sourceQuestions[26]?.answers?.[sourceQuestions[26]?.correct] === "B7KR", `${folder.name}/en.json: the upgraded Memory Trap attention question changed.`);
    fail(JSON.stringify(sourceQuestions[34]?.study?.items) === JSON.stringify(["🧭", "🍓", "🎈", "🔔", "🪵", "🎲"]) && sourceQuestions[34]?.study?.durationMs === 5500, `${folder.name}/en.json: the six-object final sequence changed.`);
    fail(sourceQuestions[35]?.question === "Reverse 2 – 8 – 1 – 5 – 6. What is the second number in the reversed sequence?" && sourceQuestions[35]?.answers?.[sourceQuestions[35]?.correct] === "5", `${folder.name}/en.json: the final reversal task changed.`);
    fail(sourceQuestions[0]?.question === "Which word appeared in the opening details?" && sourceQuestions[5]?.question === "Which item came immediately after LEMON?" && sourceQuestions[7]?.question === "Which animal appeared in the opening details?" && sourceQuestions[28]?.question === "Which colour appeared in the opening details?", `${folder.name}/en.json: opening-detail wording regressed.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: result profile thresholds must match the launch specification.`);
  }
  if (folder.name === "iq") {
    const ids = sourceQuestions.map((question) => question.id);
    const correctPositions = [0, 1, 2, 3].map((index) => sourceQuestions.filter((question) => question.correct === index).length);
    const categoryCounts = sourceQuestions.reduce((counts, question) => ({ ...counts, [question.category]: (counts[question.category] ?? 0) + 1 }), {});
    const supportedPresentations = new Set(["text", "icons", "sequence", "grid", "code", "spatial"]);
    fail(["de.json", "en.json", "es.json", "fr.json", "it.json", "nl.json", "pt.json"].every((file) => localeFiles.includes(file)), `${folder.name}: IQ must retain every existing locale.`);
    fail(config.engine?.flow === "staged" && config.engine?.localeParity === "independent", `${folder.name}: compact English IQ must use independent locale flow.`);
    fail(config.engine?.targetRatio === 0.8 && config.engine?.derivedScore === undefined, `${folder.name}: Intelligence Test must use an 80% percentage target without a derived IQ score.`);
    fail(config.engine?.rewarded?.start === true && config.engine?.rewarded?.stages === true && config.engine?.rewarded?.attempts === 3 && config.engine?.rewarded?.confirmStart === false, `${folder.name}: Intelligence Test rewarded flow must match Memory and Years Left.`);
    fail(source.title === "Only 7% Pass This Intelligence Test", `${folder.name}/en.json: title changed.`);
    fail(source.landing?.cta === "Start Test" && source.landing?.startNote === "Short ad first - then it begins." && source.landing?.startPrompt === undefined, `${folder.name}/en.json: direct rewarded landing flow changed.`);
    fail(source.stages?.length === 5 && source.stages.every((stage) => stage.questions?.length === 8), `${folder.name}/en.json: Intelligence Test must contain five stages of eight puzzles.`);
    fail(new Set(ids).size === 40, `${folder.name}/en.json: Intelligence Test needs 40 unique stable question IDs.`);
    fail(JSON.stringify(correctPositions) === JSON.stringify([10, 10, 10, 10]), `${folder.name}/en.json: correct positions must remain perfectly balanced 10/10/10/10.`);
    fail(JSON.stringify(categoryCounts) === JSON.stringify({ pattern: 7, numerical: 7, verbal: 6, spatial: 7, attention: 6, logic: 7 }), `${folder.name}/en.json: thinking-area balance changed.`);
    fail(source.results?.name === "YOUR INTELLIGENCE TEST SCORE" && source.results?.score?.showPercentage === true && source.results?.score?.derivedLabel === undefined, `${folder.name}/en.json: the result must be a percentage-led Intelligence Test Score.`);
    fail(source.results?.score?.reviewUnlock === undefined, `${folder.name}/en.json: final answer review must be free.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4 && new Set(question.answers).size === 4), `${folder.name}/en.json: every Intelligence Test puzzle needs four unique choices.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4), `${folder.name}/en.json: every Intelligence Test puzzle needs one valid correct index.`);
    fail(sourceQuestions.every((question) => typeof question.explanation === "string" && question.explanation.trim()), `${folder.name}/en.json: every Intelligence Test puzzle needs a result explanation.`);
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
    const details = source.results?.score?.insights?.details;
    fail(details?.roadmapItems?.length === 4 && details?.measuredAreas?.length === 3 && details?.tips?.length === 3, `${folder.name}/en.json: Intelligence Test needs the full result report.`);
    fail(source.career?.hideJourneyLength === true && source.career?.continuousShell === true && source.career?.showStageResults === false && source.career?.showCurrentScore === false && source.career?.showResultProgress === true, `${folder.name}/en.json: progress-only persistent journey settings changed.`);
    fail(source.career?.stages?.length === 5 && source.career.stages.slice(0, 4).every((stage) => stage.preAdButton === "Continue" && !stage.preAdChecks) && source.career.stages[4]?.preAdChecks?.length === 3, `${folder.name}/en.json: stage-result gates changed.`);
    fail(source.checkpoint?.reveals?.length === 5 && source.checkpoint?.finalButton === "See My Result" && source.results?.score?.showBestRound === true, `${folder.name}/en.json: final gate or result settings changed.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: IQ profile thresholds are incorrect.`);
  }
  if (folder.name === "biology") {
    const expectedCategories = {
      human_body: 10,
      animals: 10,
      plants: 10,
      cells_genetics: 10,
      ecosystems: 10,
      life_processes: 10,
    };
    const counts = Object.fromEntries(Object.keys(expectedCategories).map((category) => [
      category,
      sourceQuestions.filter((question) => question.category === category).length,
    ]));
    const rapidLab = source.stages?.[7]?.questions ?? [];
    const finalSpecimen = source.stages?.[9]?.questions ?? [];
    fail(["de.json", "en.json", "es.json", "fr.json", "it.json", "nl.json", "pt.json"].every((file) => localeFiles.includes(file)), `${folder.name}: Biology must support every site locale.`);
    fail(source.stages?.length === 10, `${folder.name}/en.json: Biology must contain ten rounds.`);
    fail(source.stages?.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: every Biology round must contain six questions.`);
    fail(sourceQuestions.length === 60, `${folder.name}/en.json: Biology must contain exactly 60 questions.`);
    fail(JSON.stringify(counts) === JSON.stringify(expectedCategories), `${folder.name}/en.json: Biology needs exactly ten questions in each category.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length >= 3 && question.answers.length <= 5), `${folder.name}/en.json: every Biology question needs three to five choices.`);
    fail(sourceQuestions.every((question) => question.answers.every((answer) => typeof answer === "string" && Boolean(answer.trim()))), `${folder.name}/en.json: every Biology choice must be non-empty text.`);
    fail(sourceQuestions.every((question) => new Set(question.answers).size === question.answers.length), `${folder.name}/en.json: Biology choices must be unique within each question.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.correct >= 0 && question.correct < question.answers.length), `${folder.name}/en.json: every Biology question needs one valid correct index.`);
    fail(config.engine?.advanceDelayMs === 450, `${folder.name}: Biology default advancement must be exactly 450ms.`);
    fail(rapidLab.length === 6 && rapidLab.every((question) => question.delay === 350), `${folder.name}/en.json: every Rapid Lab question must use 350ms.`);
    fail(rapidLab.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}/en.json: at least five Rapid Lab prompts must contain no more than ten words.`);
    fail(sourceQuestions.every((question) => rapidLab.includes(question) || question.delay === undefined), `${folder.name}/en.json: only Rapid Lab may override Biology's default advancement.`);
    fail(finalSpecimen.filter((question) => question.reasoningSteps >= 2).length >= 3, `${folder.name}/en.json: at least three Final Specimen questions need two-step reasoning.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: Biology profile thresholds are incorrect.`);
    fail(source.results?.score?.showPercentage === true, `${folder.name}/en.json: Biology must lead its result with the percentage.`);
  }
  if (folder.name === "mechanic") {
    const expectedCategories = {
      engine_fuel: 10,
      brakes_grip: 10,
      electrical: 10,
      cooling_fluids: 10,
      drivetrain_steering: 10,
      diagnosis_safety: 10,
    };
    const counts = Object.fromEntries(Object.keys(expectedCategories).map((category) => [
      category,
      sourceQuestions.filter((question) => question.category === category).length,
    ]));
    const correctPositions = sourceQuestions.reduce((positions, question) => {
      positions[question.correct] = (positions[question.correct] ?? 0) + 1;
      return positions;
    }, Array(4).fill(0));
    const sprint = source.stages?.[7]?.questions ?? [];
    const finalWorkshop = source.stages?.[9]?.questions ?? [];
    const highVoltage = sourceQuestions.find((question) => question.id === "mech-r8q1");
    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), `${folder.name}: Mechanic must launch in English only.`);
    fail(config.engine?.scoring === "correct-answer", `${folder.name}: Mechanic must use correct-answer scoring.`);
    fail(source.stages?.length === 10 && source.stages.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: Mechanic needs ten rounds of six questions.`);
    fail(sourceQuestions.length === 60, `${folder.name}/en.json: Mechanic must contain exactly 60 questions.`);
    fail(JSON.stringify(counts) === JSON.stringify(expectedCategories), `${folder.name}/en.json: Mechanic needs exactly ten questions in each vehicle-system category.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4), `${folder.name}/en.json: every Mechanic question needs exactly four choices.`);
    fail(sourceQuestions.every((question) => question.answers.every((answer) => typeof answer === "string" && Boolean(answer.trim())) && new Set(question.answers).size === 4), `${folder.name}/en.json: Mechanic choices must be non-empty and unique within each question.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4), `${folder.name}/en.json: every Mechanic question needs one valid correct index.`);
    fail(JSON.stringify(correctPositions) === JSON.stringify([15, 15, 15, 15]), `${folder.name}/en.json: Mechanic correct-answer positions must be exactly 15 each across A–D.`);
    fail(sourceQuestions.every((question) => typeof question.explanation === "string" && Boolean(question.explanation.trim())), `${folder.name}/en.json: every Mechanic question needs a post-result explanation.`);
    fail(config.engine?.advanceDelayMs === 450, `${folder.name}: Mechanic default advancement must be exactly 450ms.`);
    fail(sprint.length === 6 && sprint.every((question) => question.delay === 350), `${folder.name}/en.json: every Pit-Stop Sprint question must use 350ms.`);
    fail(sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}/en.json: at least five Pit-Stop Sprint prompts must contain no more than ten words.`);
    fail(sourceQuestions.every((question) => sprint.includes(question) || question.delay === undefined), `${folder.name}/en.json: only Pit-Stop Sprint may override the 450ms default.`);
    fail(finalWorkshop.filter((question) => question.reasoningSteps >= 2).length >= 3, `${folder.name}/en.json: Final Workshop Diagnosis needs at least three two-step questions.`);
    fail(highVoltage?.question === "An orange high-voltage cable is damaged. What should you do?", `${folder.name}/en.json: mandatory orange high-voltage question is missing or changed.`);
    fail(JSON.stringify(highVoltage?.answers) === JSON.stringify(["Tape it temporarily", "Disconnect it yourself", "Avoid touching it and get qualified help", "Pour water over it"]) && highVoltage?.correct === 2 && highVoltage?.category === "diagnosis_safety", `${folder.name}/en.json: mandatory high-voltage safety answer structure is incorrect.`);
    fail(/orange/i.test(highVoltage?.explanation ?? "") && /high-voltage/i.test(highVoltage?.explanation ?? "") && /trained professionals/i.test(highVoltage?.explanation ?? ""), `${folder.name}/en.json: high-voltage explanation must identify orange cabling and qualified handling.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: Mechanic profile thresholds are incorrect.`);
    fail(source.results?.score?.showPercentage === true, `${folder.name}/en.json: Mechanic must lead its result with the percentage.`);
    fail(config.engine?.rewarded?.attempts === 3, `${folder.name}: Mechanic rewarded fallback must require three genuine unavailable attempts.`);
  }
  if (folder.name === "chef") {
    const expectedCategories = {
      kitchen_fundamentals: 5,
      ingredients_flavour: 5,
      heat_methods: 5,
      baking_pastry: 5,
      kitchen_maths: 5,
      safety_service: 5,
    };
    const expectedTitles = ["Kitchen Induction", "Prep Bench", "Kitchen Craft", "Service Rush", "Chef’s Table"];
    const expectedDifficulties = ["Foundation", "Developing", "Skilled", "Pressure", "Final Assessment"];
    const expectedGateTitles = ["Your Kitchen Induction Results Are Ready", "Your Prep Bench Results Are Ready", "Your Kitchen Craft Results Are Ready", "Your Service Rush Results Are Ready", "Your Chef Score Is Ready"];
    const counts = Object.fromEntries(Object.keys(expectedCategories).map((category) => [category, sourceQuestions.filter((question) => question.category === category).length]));
    const correctPositions = sourceQuestions.reduce((positions, question) => {
      positions[question.correct] = (positions[question.correct] ?? 0) + 1;
      return positions;
    }, Array(4).fill(0));
    const sprint = source.stages?.[3]?.questions ?? [];
    const final = source.stages?.[4]?.questions ?? [];
    const serialized = JSON.stringify(source);
    const preFinishCopy = JSON.stringify({ landing: source.landing, about: source.about, checkpoint: source.checkpoint });

    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), "chef: staged challenge must launch in English only.");
    fail(config.engine?.scoring === "correct-answer" && config.engine?.flow === "staged" && config.engine?.advance === "automatic" && config.engine?.startOnLoad === true, "chef: must open directly on Kitchen Induction without a quiz landing screen.");
    fail(config.engine?.rewarded?.start === false && config.engine?.rewarded?.stages === true && config.engine?.rewarded?.attempts === 3, "chef: no Start ad is allowed; each kitchen result uses the three-attempt rewarded flow.");
    fail(config.engine?.questionAd === undefined && config.engine?.resultAds === undefined, "chef: all display advertising must remain disabled.");
    fail(source.landing?.startPrompt === undefined, "chef/en.json: the landing CTA must begin directly without a pre-ad prompt.");
    fail(source.title === "Only 12% Pass This Chef's Entrance Exam" && source.landing?.cta === "Start Quiz" && source.landing?.socialProof === "81,000+ people played this", "chef/en.json: approved landing copy changed.");

    fail(source.stages?.length === 5 && source.stages.every((stage) => stage.questions?.length === 6), "chef/en.json: staged challenge needs five kitchens of six questions.");
    fail(JSON.stringify(source.stages.map((stage) => stage.title)) === JSON.stringify(expectedTitles), "chef/en.json: kitchen order or text-only titles changed.");
    fail(sourceQuestions.length === 30 && new Set(sourceQuestionIds).size === 30, "chef/en.json: needs 30 stable unique questions.");
    fail(JSON.stringify(counts) === JSON.stringify(expectedCategories), "chef/en.json: every kitchen area needs exactly five questions.");
    fail(source.stages.every((stage) => Object.keys(expectedCategories).every((category) => stage.questions.filter((question) => question.category === category).length === 1)), "chef/en.json: every kitchen needs one question from each kitchen area.");
    fail(JSON.stringify(correctPositions) === JSON.stringify([8, 8, 7, 7]), "chef/en.json: correct positions must remain balanced at 8/8/7/7.");
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4 && new Set(question.answers).size === 4 && Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4), "chef/en.json: every question needs four unique choices and one valid answer.");
    fail(sourceQuestions.every((question) => (
      question.presentation === "text"
      && question.context === undefined
      && question.contextRequired === undefined
      && question.visual === undefined
      && question.icons === undefined
      && question.image === undefined
      && question.explanation === undefined
    )), "chef/en.json: every question must remain text-only with no diagrams, charts, cards, icons, separate prompts or explanations.");
    const questionCopy = sourceQuestions.flatMap((question) => [question.question, ...question.answers]).join(" ");
    fail(!/\p{Extended_Pictographic}/u.test(questionCopy), "chef/en.json: question and answer copy must not contain emoji.");
    fail(source.stages.every((stage) => new Set(stage.questions.map((question) => question.interactionStyle)).size >= 3), "chef/en.json: each kitchen still needs at least three reasoning styles.");
    fail(source.stages.every((stage) => stage.questions.every((question, index, questions) => index < 2 || question.interactionStyle !== questions[index - 1].interactionStyle || question.interactionStyle !== questions[index - 2].interactionStyle)), "chef/en.json: one reasoning style cannot appear three times consecutively.");
    fail(sprint.length === 6 && sprint.every((question) => question.delay === 350) && sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, "chef/en.json: Service Rush needs six 350ms questions and at least five short prompts.");
    fail(sourceQuestions.every((question) => sprint.includes(question) || question.delay === undefined), "chef/en.json: only Service Rush may override the 450ms default.");
    fail(final.length === 6 && final.every((question) => question.reasoningSteps === 2), "chef/en.json: every Chef’s Table question needs two-step reasoning.");
    fail(!/\b(?:oz|ounce|ounces|lb|lbs|pound|pounds|fahrenheit)\b|°F/i.test(serialized), "chef/en.json: Chef must remain worldwide metric or unit-neutral.");

    fail(source.career?.hideJourneyLength === true && source.career?.currentScoreLabel === "CURRENT CHEF SCORE", "chef/en.json: hidden-length career mode and cumulative percentage label are required.");
    fail(JSON.stringify(source.career?.compactGate) === JSON.stringify({ eyebrow: "RESULT READY", title: "{stage} complete", copy: "Your kitchen score is ready.", button: "See My Result" }), "chef/en.json: intermediate kitchens need the approved compact result-ready gate.");
    fail(source.career?.reportUnlock === undefined, "chef/en.json: the final kitchen reveal must deliver the full result without another report gate.");
    fail(JSON.stringify(source.career?.stages?.map((stage) => stage.difficulty)) === JSON.stringify(expectedDifficulties), "chef/en.json: difficulty progression changed.");
    fail(JSON.stringify(source.career?.stages?.map((stage) => stage.preAdTitle)) === JSON.stringify(expectedGateTitles), "chef/en.json: every kitchen needs its exact Results Are Ready title.");
    fail(source.career?.stages?.every((stage, index) => stage.preAdChecks?.length === 3 && stage.resultBands?.high && stage.resultBands?.medium && stage.resultBands?.low && stage.promotion === undefined && (index === 4 || stage.next)), "chef/en.json: every kitchen needs a complete result gate, three score bands and next-kitchen teaser.");
    fail(source.career?.stages?.every((stage) => !/\b(?:one|two|three|four|five|six|seven|eight|nine|ten|\d+) kitchens? (?:remain|left|away)|\/\s*10/i.test(JSON.stringify(stage.next ?? {}))), "chef/en.json: next-kitchen teasers must never disclose how many kitchens remain.");
    fail(!/\b(?:10|ten) (?:rounds|stages|kitchens)|60 questions|\/\s*10/i.test(preFinishCopy), "chef/en.json: landing, About and result-ready copy must not reveal the journey length.");
    fail(source.checkpoint?.reveals?.length === 5 && source.checkpoint?.progressLabel === undefined && source.checkpoint?.progressComplete === undefined, "chef/en.json: needs one hidden-length result checkpoint per kitchen and no journey progress meter.");
    fail(source.results?.score?.showPercentage === true && source.results?.score?.showBestRound === true && source.results?.score?.insights?.details, "chef/en.json: final percentage, best kitchen and complete result report are required.");
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), "chef/en.json: result profile thresholds changed.");
  }
  if (["grammar", "vision"].includes(folder.name)) {
    const specifications = {
      grammar: {
        title: "Only 10% Can Pass This Grammar Quiz",
        cta: "Start Quiz",
        ids: ["grammar-r2q3", "grammar-r10q1", "grammar-r3q1", "grammar-r4q3", "grammar-r5q4", "grammar-r10q4", "grammar-r10q5", "grammar-r9q5", "grammar-r7q2", "grammar-r10q6"],
        categories: { sentence_building: 2, verbs_pronouns: 3, punctuation: 3, precision: 2 },
        positions: [2, 3, 2, 3],
      },
      vision: {
        title: "Only 7% Can Pass This Vision Test",
        cta: "Start Test",
        ids: ["vision-r1q1", "vision-r3q4", "vision-r4q3", "vision-r5q1", "vision-r9q5", "vision-r7q2", "vision-r9q1", "vision-r8q3", "vision-r10q2", "vision-r10q4"],
        categories: { colour_contrast: 2, detail_detection: 2, pattern_tracking: 2, spatial_orientation: 2, visual_memory: 1, attention_control: 1 },
        positions: [3, 2, 3, 2],
        dimensionLabels: ["Colour and memory", "Detail and attention", "Patterns and space"],
        presentations: 5,
      },
    };
    const specification = specifications[folder.name];
    const counts = Object.fromEntries(Object.keys(specification.categories).map((category) => [
      category,
      sourceQuestions.filter((question) => question.category === category).length,
    ]));
    const correctPositions = sourceQuestions.reduce((positions, question) => {
      positions[question.correct] = (positions[question.correct] ?? 0) + 1;
      return positions;
    }, Array(4).fill(0));
    const serialized = JSON.stringify(source);

    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), `${folder.name}: compact quiz must launch in English only.`);
    fail(config.engine?.scoring === "correct-answer" && config.engine?.flow === "linear", `${folder.name}: compact quiz must use linear correct-answer scoring.`);
    fail(source.title === specification.title, `${folder.name}/en.json: approved headline changed.`);
    fail(source.landing?.socialProof === "81,000+ people played this" && source.landing?.cta === specification.cta, `${folder.name}/en.json: landing social proof or CTA changed.`);
    fail(source.landing?.startPrompt?.button === "OK" && /short ad/i.test(source.landing?.startPrompt?.copy ?? ""), `${folder.name}/en.json: a clean pre-start rewarded prompt is required.`);
    fail(source.progressLabel === "complete", `${folder.name}/en.json: compact quiz must show percentage completion rather than a round number.`);
    fail(source.stages?.length === 1 && source.stages[0]?.questions?.length === 10, `${folder.name}/en.json: compact quiz needs one round of ten questions.`);
    fail(sourceQuestions.every((question) => question.context === undefined && question.contextRequired === undefined), `${folder.name}/en.json: compact quiz screens must not use separate context banners.`);
    fail(sourceQuestions.every((question) => question.question.trim().split(/\s+/).length <= 20), `${folder.name}/en.json: compact quiz questions must contain no more than twenty words.`);
    fail(JSON.stringify(sourceQuestionIds) === JSON.stringify(specification.ids), `${folder.name}/en.json: approved ten-question selection or order changed.`);
    fail(JSON.stringify(counts) === JSON.stringify(specification.categories), `${folder.name}/en.json: compact skill-category distribution changed.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4 && new Set(question.answers).size === 4), `${folder.name}/en.json: every compact question needs four unique choices.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4 && typeof question.explanation === "string" && question.explanation.trim()), `${folder.name}/en.json: every compact question needs one valid answer and explanation.`);
    fail(JSON.stringify(correctPositions) === JSON.stringify(specification.positions), `${folder.name}/en.json: compact correct-answer positions must keep their approved irregular balance.`);
    fail(sourceQuestions.every((question) => question.delay === undefined), `${folder.name}/en.json: compact questions must use the shared 450ms transition.`);
    fail(config.engine?.advanceDelayMs === 450 && config.engine?.targetRatio === 0.8, `${folder.name}: compact timing and 80% target changed.`);
    fail(config.engine?.rewarded?.start === true && config.engine?.rewarded?.stages === true && config.engine?.rewarded?.attempts === 3, `${folder.name}: compact quiz needs exactly its start and result rewarded gates with three genuine unavailable attempts.`);
    if (folder.name === "vision") {
      fail(source.results?.score?.reviewUnlock?.button === "Reveal Incorrect Answers" && /incorrect answers/i.test(source.results?.score?.reviewUnlock?.title ?? ""), "vision/en.json: rewarded incorrect-answer reveal copy is incomplete.");
    }
    fail(source.checkpoint?.reveals?.length === 1 && source.checkpoint?.progressLabel === undefined && source.checkpoint?.progressComplete === undefined, `${folder.name}/en.json: compact quiz needs one clean final checkpoint without staged progress.`);
    fail(source.checkpoint?.finalButton === "See My Results" && /final short ad/i.test(source.checkpoint?.finalCopy ?? "") && source.checkpoint?.finalChecklist?.length === 3, `${folder.name}/en.json: final rewarded result gate is incomplete.`);
    fail(source.results?.score?.showPercentage === true && source.results?.score?.showBestRound === false, `${folder.name}/en.json: compact result must lead with percentage and hide the redundant best-round field.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: result profile thresholds changed.`);
    const details = source.results?.score?.insights?.details;
    fail(details?.roadmapItems?.length === 4 && details?.measuredAreas?.length === 3 && details?.tips?.length === 3 && details?.finalTitle && details?.finalCopy, `${folder.name}/en.json: complete long-form result report is required.`);
    fail(source.about?.howToPlay?.steps?.length === 3 && !/all ten (?:rounds|stages)/i.test(source.about?.body ?? ""), `${folder.name}/en.json: About and How to Play must describe the compact flow.`);
    if (specification.dimensionLabels) {
      fail(JSON.stringify(source.results?.dimensions?.map((dimension) => dimension.label)) === JSON.stringify(specification.dimensionLabels), `${folder.name}/en.json: compact result dimensions changed.`);
      fail(new Set(sourceQuestions.map((question) => question.presentation ?? "text")).size >= specification.presentations, `${folder.name}/en.json: compact interaction variety is below the approved minimum.`);
    }

    if (folder.name === "grammar") {
      const questionCopy = sourceQuestions.flatMap((question) => [question.context, question.question, ...question.answers, question.explanation].filter(Boolean)).join(" ");
      fail(JSON.stringify(source.results?.dimensions?.map((dimension) => dimension.label)) === JSON.stringify(["Sentence building", "Verbs and pronouns", "Punctuation", "Precision"]), "grammar/en.json: compact Grammar needs its four meaningful result dimensions.");
      fail(!/\bwhom\b/i.test(questionCopy) && !/\bJames(?:['’]s|['’])\b/.test(questionCopy), "grammar/en.json: disputed worldwide-English variants are not allowed.");
    }
    if (folder.name === "vision") {
      const memoryCue = sourceQuestions.find((question) => question.id === "vision-r9q5")?.study;
      const memoryQuestion = sourceQuestions.find((question) => question.id === "vision-r9q5");
      const halfCircleQuestion = sourceQuestions.find((question) => question.id === "vision-r3q4");
      const routeTrackingQuestion = sourceQuestions.find((question) => question.id === "vision-r8q3");
      const paperFoldQuestion = sourceQuestions.find((question) => question.id === "vision-r10q4");
      fail(
        memoryCue?.mode === "automatic"
        && memoryCue?.durationMs === 3500
        && JSON.stringify(memoryCue.items) === JSON.stringify(["blue-circle", "gold-triangle", "coral-square", "green-diamond", "violet-star"])
        && memoryCue.ariaLabel === "Blue circle, gold triangle, coral square, green diamond, violet star",
        "vision/en.json: the visual-memory cue must use five precise CSS shapes with an accessible label.",
      );
      fail(JSON.stringify(memoryQuestion?.icons) === JSON.stringify(["violet-star", "coral-square", "blue-circle", "green-diamond"]), "vision/en.json: visual-memory answer imagery must use the approved CSS shapes.");
      fail(JSON.stringify(halfCircleQuestion?.visual?.items) === JSON.stringify(["left-half", "left-half", "right-half", "left-half"]), "vision/en.json: half-circle comparison must use device-stable CSS geometry.");
      fail(JSON.stringify(halfCircleQuestion?.answers) === JSON.stringify(["First", "Second", "Third", "Fourth"]) && halfCircleQuestion?.correct === 2, "vision/en.json: half-circle answer positions must run A–D in natural order with Third mapped to C.");
      fail(routeTrackingQuestion?.image?.src === "/quizzes/vision/assets/icons/eye-tracking-maze.svg?v=20260819-2", "vision/en.json: the route-tracking SVG must keep the current cache-busting asset version.");
      fail(
        JSON.stringify(paperFoldQuestion?.answers) === JSON.stringify(["1", "2", "4", "8"])
        && paperFoldQuestion?.correct === 2
        && paperFoldQuestion?.reasoningSteps === 2
        && paperFoldQuestion?.image?.src === "/quizzes/vision/assets/icons/paper-fold-punch.svg?v=20260819-2",
        "vision/en.json: the paper-fold finale must use the illustrated two-fold puzzle with C — 4 mapped correctly.",
      );
      fail(sourceQuestions.some((question) => question.visual?.ariaLabel === "Simultaneous contrast panels"), "vision/en.json: the genuine simultaneous-contrast interaction is required.");
    }
  }
  if (["paramedic", "nursing", "midwifery"].includes(folder.name)) {
    const specifications = {
      paramedic: {
        title: "Only 8% Pass This Paramedic Entrance Exam",
        cta: "Start Test",
        categories: { anatomy_physiology: 7, observation_vitals: 6, numeracy_measurement: 7, scene_safety: 7, communication_handover: 7, reasoning_priorities: 6 },
        progress: "Rapid-response assessment",
      },
      nursing: {
        title: "Only 7% Pass This Nursing Entrance Exam",
        cta: "Start Quiz",
        categories: { anatomy_physiology: 7, numeracy_measurement: 7, infection_safety: 7, communication_compassion: 6, observation_vitals: 7, reasoning_priorities: 6 },
        progress: "Nursing challenge",
      },
      midwifery: {
        title: "Only 7% Pass This Midwifery Entrance Exam",
        cta: "Start Quiz",
        categories: { pregnancy_physiology: 7, antenatal_wellbeing: 7, communication_priorities: 6, labour_birth: 7, newborn_care: 7, infection_safety: 6 },
        progress: "Birth-centre challenge",
      },
    };
    const specification = specifications[folder.name];
    const counts = Object.fromEntries(Object.keys(specification.categories).map((category) => [
      category,
      sourceQuestions.filter((question) => question.category === category).length,
    ]));
    const correctPositions = [0, 1, 2, 3].map((index) => sourceQuestions.filter((question) => question.correct === index).length);
    const prohibitedClinicalCopy = /\b(?:administer\w*|prescrib\w*|medication dose|dosage|intubat\w*|resuscitat\w*|defibrillat\w*|CPR ratio|oxygen (?:flow|setting)|extricat\w*|reduce a fracture|perform a procedure|911|999|112)\b/i;
    const questionCopy = sourceQuestions.map((question) => [question.question, question.context, question.answers?.[question.correct], question.explanation, ...(question.visual?.items ?? [])].filter(Boolean).join(" ")).join("\n");

    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), `${folder.name}: five-stage clinical quiz must launch in English only.`);
    fail(config.engine?.flow === "staged" && config.engine?.localeParity === "independent" && config.engine?.scoring === "correct-answer", `${folder.name}: five-stage clinical flow must use independent staged correct-answer scoring.`);
    fail(config.engine?.rewarded?.start === true && config.engine?.rewarded?.stages === true && config.engine?.rewarded?.attempts === 3 && config.engine?.rewarded?.confirmStart === false, `${folder.name}: direct rewarded Start and five result gates are required.`);
    fail(config.engine?.advanceDelayMs === 450 && config.engine?.targetRatio === 0.8, `${folder.name}: timing or 80% target changed.`);
    fail(source.title === specification.title && source.landing?.socialProof === "81,000+ people played this" && source.landing?.cta === specification.cta, `${folder.name}/en.json: approved landing copy changed.`);
    fail(source.landing?.startPrompt === undefined && /short ad first/i.test(source.landing?.startNote ?? ""), `${folder.name}/en.json: landing must trigger the rewarded ad directly without a confirmation prompt.`);
    fail(source.stages?.length === 5 && source.stages.every((stage) => stage.questions?.length === 8), `${folder.name}/en.json: needs five stages of eight questions.`);
    fail(sourceQuestions.length === 40 && new Set(sourceQuestionIds).size === 40, `${folder.name}/en.json: needs 40 unique stable question IDs.`);
    fail(JSON.stringify(counts) === JSON.stringify(specification.categories), `${folder.name}/en.json: balanced clinical category distribution changed.`);
    fail(JSON.stringify(correctPositions) === JSON.stringify([10, 10, 10, 10]), `${folder.name}/en.json: correct positions must remain perfectly balanced.`);
    fail(sourceQuestions.every((question) => question.question.trim().split(/\s+/).length <= 20), `${folder.name}/en.json: question stems must stay mobile-friendly.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4 && new Set(question.answers).size === 4 && Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4 && typeof question.explanation === "string" && question.explanation.trim()), `${folder.name}/en.json: every question needs four unique choices, one valid answer and an explanation.`);
    fail(sourceQuestions.every((question) => question.delay === undefined), `${folder.name}/en.json: all questions must use the shared 450ms transition.`);
    fail(!prohibitedClinicalCopy.test(questionCopy), `${folder.name}/en.json: content must stay at safe recognition and escalation level.`);
    fail(sourceQuestions.filter((question) => question.reasoningSteps === 2).length >= 6, `${folder.name}/en.json: the expanded clinical challenge needs at least six multi-clue questions.`);
    fail(source.career?.continuousShell === true && source.career?.hideJourneyLength === true && source.career?.showStageResults === false && source.career?.showCurrentScore === false, `${folder.name}/en.json: the persistent hidden-length shell is required.`);
    fail(source.career?.showResultProgress === true && source.career?.resultProgressLabel === specification.progress && source.career?.stages?.length === 5, `${folder.name}/en.json: five-step profile-building progress is incomplete.`);
    fail(source.career?.stages?.slice(0, 4).every((stage) => stage.preAdButton === "Continue" && stage.preAdChecks === undefined && stage.next?.button === "Continue"), `${folder.name}/en.json: intermediate gates must remain concise and use Continue.`);
    fail(source.career?.stages?.[4]?.preAdButton === "See My Result" && source.career.stages[4].preAdChecks?.length === 3, `${folder.name}/en.json: final rewarded result gate is incomplete.`);
    fail(source.checkpoint?.reveals?.length === 5 && source.checkpoint?.finalChecklist?.length === 3, `${folder.name}/en.json: one checkpoint per stage and a complete final reveal are required.`);
    fail(source.results?.score?.showPercentage === true && source.results?.score?.showBestRound === true && source.results?.score?.reviewUnlock === undefined, `${folder.name}/en.json: final result must include percentage, best stage and free answer review.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: result thresholds changed.`);
    fail(source.about?.howToPlay?.steps?.length === 3 && /40 varied questions/i.test(source.about?.body ?? ""), `${folder.name}/en.json: About and How to Play must describe the expanded flow.`);
  }
  if (folder.name === "idiom") {
    const targetMap = [
      ["break_the_ice", "break the ice"],
      ["bite_the_bullet", "bite the bullet"],
      ["cut_corners", "cut corners"],
      ["spill_the_beans", "spill the beans"],
      ["walking_on_eggshells", "walking on eggshells"],
      ["fish_out_of_water", "fish out of water"],
      ["back_to_square_one", "back to square one"],
      ["silver_lining", "silver lining"],
      ["barking_up_the_wrong_tree", "barking up the wrong tree"],
      ["move_the_goalposts", "move the goalposts"],
    ];
    const approvedIds = ["idiom-r1q1", "idiom-r1q2", "idiom-r1q3", "idiom-r1q4", "idiom-r3q1", "idiom-r3q4", "idiom-r4q1", "idiom-r5q2", "idiom-r7q4", "idiom-r10q1"];
    const correctPositions = [0, 1, 2, 3].map((index) => sourceQuestions.filter((question) => question.correct === index).length);
    const normalizePhrase = (value) => String(value ?? "")
      .toLowerCase()
      .normalize("NFKC")
      .replace(/[‘’]/g, "'")
      .replace(/[^a-z0-9']+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
    const visibleQuestionText = (question) => [
      question.question,
      question.explanation,
      ...(question.answers ?? []),
      ...(question.visual?.items ?? []),
    ].map(normalizePhrase).filter(Boolean).join(" | ");
    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), `${folder.name}: Idiom must launch in English only.`);
    fail(config.engine?.flow === "linear" && config.engine?.scoring === "correct-answer" && config.engine?.targetRatio === .8, `${folder.name}: compact Idiom must use linear correct-answer scoring and the 80% threshold.`);
    fail(source.title === "Only 5% Of Adults Can Ace This Idiom Quiz", `${folder.name}/en.json: Idiom title must match the approved headline.`);
    fail(source.landing?.socialProof === "81,000+ people played this" && source.landing?.cta === "Start Quiz", `${folder.name}/en.json: Idiom landing social proof or CTA changed.`);
    fail(source.stages?.length === 1 && source.stages[0]?.questions?.length === 10, `${folder.name}/en.json: Idiom needs one stage of ten questions.`);
    fail(JSON.stringify(sourceQuestions.map((question) => question.id)) === JSON.stringify(approvedIds), `${folder.name}/en.json: Idiom must retain the approved compact question order.`);
    fail(JSON.stringify(sourceQuestions.map((question) => question.targetIdiom)) === JSON.stringify(targetMap.map(([id]) => id)), `${folder.name}/en.json: compact targetIdiom order changed.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4 && question.answers.every((answer) => typeof answer === "string" && answer.trim()) && new Set(question.answers).size === 4), `${folder.name}/en.json: every Idiom question needs four unique non-empty choices.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4), `${folder.name}/en.json: every Idiom question needs one valid correct index.`);
    fail(JSON.stringify(correctPositions) === JSON.stringify([3, 3, 2, 2]), `${folder.name}/en.json: compact Idiom correct positions must keep their irregular 3/3/2/2 balance.`);
    fail(sourceQuestions.every((question) => typeof question.explanation === "string" && question.explanation.trim()), `${folder.name}/en.json: every Idiom question needs a post-result explanation.`);
    fail(sourceQuestions.every((question) => question.context === undefined && question.contextRequired === undefined), `${folder.name}/en.json: compact Idiom screens must not use separate context banners.`);
    const expectedIconSets = {
      "idiom-r3q1": ["🏃", "🤫", "🍳", "🥚"],
      "idiom-r3q4": ["🐦", "🐟", "🐢", "🦀"],
    };
    for (const [id, icons] of Object.entries(expectedIconSets)) {
      fail(JSON.stringify(sourceQuestions.find((question) => question.id === id)?.icons) === JSON.stringify(icons), `${folder.name}/en.json: ${id} icon meanings are misaligned with their answers.`);
    }
    targetMap.forEach(([id, canonical], targetIndex) => {
      const canonicalText = normalizePhrase(canonical);
      fail(visibleQuestionText(sourceQuestions[targetIndex]).includes(canonicalText), `${folder.name}/en.json: ${id} must expose its canonical phrase in its own question or explanation.`);
      sourceQuestions.forEach((question, questionIndex) => {
        if (questionIndex === targetIndex) return;
        fail(!(question.answers ?? []).some((answer) => normalizePhrase(answer).includes(canonicalText)), `${folder.name}/en.json: ${id} leaks into another question's answer choices.`);
        if (questionIndex < targetIndex) fail(!visibleQuestionText(question).includes(canonicalText), `${folder.name}/en.json: future target ${id} is exposed before its scored question.`);
      });
    });
    const details = source.results?.score?.insights?.details;
    fail(details?.roadmapItems?.length === 4 && details?.measuredAreas?.length === 3 && details?.tips?.length === 3, `${folder.name}/en.json: compact Idiom needs the full result report.`);
    fail(source.checkpoint?.reveals?.length === 1 && source.checkpoint?.finalButton === "See My Results" && source.results?.score?.showBestRound === false, `${folder.name}/en.json: compact Idiom final gate settings changed.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: Idiom profile thresholds are incorrect.`);
    fail(config.engine?.rewarded?.start === true && config.engine?.rewarded?.stages === true && config.engine?.rewarded?.attempts === 3, `${folder.name}: Idiom rewarded gates or fallback changed.`);
  }
  if (folder.name === "aura") {
    const profileOrder = ["tiger", "wolf", "jaguar", "owl", "deer", "fox", "dolphin", "eagle", "bear", "butterfly"];
    const dimensionOrder = [
      ["Command and Courage", ["tiger", "eagle"]],
      ["Loyalty and Protection", ["wolf", "bear"]],
      ["Intuition and Mystery", ["jaguar", "owl"]],
      ["Warmth and Sensitivity", ["deer", "dolphin"]],
      ["Cleverness and Transformation", ["fox", "butterfly"]],
    ];
    const profileIds = new Set(profileOrder);
    const rawOpportunity = Object.fromEntries(profileOrder.map((id) => [id, 0]));
    const uniformExpectation = Object.fromEntries(profileOrder.map((id) => [id, 0]));
    const forbiddenWords = /\b(?:tiger|wolf|jaguar|owl|deer|fox|dolphin|eagle|bear|butterfly|feline|canine|raptor|antler)\b/i;
    const forbiddenIcons = /[🐅🐯🐺🐆🦉🦌🦊🐬🦅🐻🦋]/u;
    const visibleQuestionText = (question) => [question.question, question.context, question.explanation, ...Object.keys(question.answers ?? {}), ...(question.visual?.items ?? [])].filter(Boolean).join(" ");
    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), `${folder.name}: Aura must launch in English only.`);
    fail(config.engine?.scoring === "weighted-profile" && config.engine?.advanceDelayMs === 450, `${folder.name}: Aura needs weighted-profile scoring and 450ms default advancement.`);
    fail(source.title === "What’s Your Animal Aura Based On Your Personality?", `${folder.name}/en.json: Aura title must match the approved headline.`);
    fail(source.landing?.socialProof === "81,000+ people played this" && source.landing?.cta === "Reveal My Aura", `${folder.name}/en.json: Aura landing social proof or CTA changed.`);
    fail(source.stages?.length === 10 && source.stages.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: Aura needs ten rounds of six interactions.`);
    fail(sourceQuestions.length === 60 && new Set(sourceQuestions.map((question) => question.id)).size === 60, `${folder.name}/en.json: Aura needs 60 uniquely identified interactions.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.id)) === JSON.stringify(profileOrder), `${folder.name}/en.json: Aura profile IDs or fixed tie order changed.`);
    fail(JSON.stringify((source.results?.dimensions ?? []).map((dimension) => [dimension.label, dimension.profiles])) === JSON.stringify(dimensionOrder), `${folder.name}/en.json: Aura energy dimensions or fixed tie order changed.`);
    fail(Boolean(source.results?.profileReveal), `${folder.name}/en.json: Aura needs profileReveal result copy.`);
    for (const profile of source.results?.profiles ?? []) {
      fail(typeof profile.aura === "string" && profile.aura.trim(), `${folder.name}/en.json: ${profile.id} needs an aura label.`);
      fail(Array.isArray(profile.traits) && profile.traits.length === 3 && profile.traits.every((trait) => typeof trait === "string" && trait.trim()), `${folder.name}/en.json: ${profile.id} needs exactly three traits.`);
      const artwork = config.theme?.artwork?.profiles?.[profile.id];
      fail(typeof artwork === "string" && fs.existsSync(path.join(directory, artwork)), `${folder.name}: ${profile.id} needs local result artwork.`);
    }
    for (const question of sourceQuestions) {
      const meanings = question.answers && !Array.isArray(question.answers) ? Object.values(question.answers) : [];
      fail(meanings.length === (question.presentation === "scale" ? 5 : 4), `${folder.name}/en.json: ${question.id} needs the approved answer count.`);
      meanings.forEach((weights, answerIndex) => {
        const entries = weights && typeof weights === "object" && !Array.isArray(weights) ? Object.entries(weights) : [];
        fail(entries.length >= 2 && entries.every(([id, weight]) => profileIds.has(id) && typeof weight === "number" && weight > 0), `${folder.name}/en.json: ${question.id} answer ${answerIndex + 1} needs positive weights for at least two known animals.`);
        const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
        fail(Math.abs(total - 1) < 1e-9, `${folder.name}/en.json: ${question.id} answer ${answerIndex + 1} weights must total 1.`);
        fail(Math.max(...entries.map(([, weight]) => weight)) <= .75, `${folder.name}/en.json: ${question.id} answer ${answerIndex + 1} overweights one profile.`);
        for (const [id, weight] of entries) {
          rawOpportunity[id] += weight;
          uniformExpectation[id] += weight / meanings.length;
        }
      });
      fail(!forbiddenWords.test(visibleQuestionText(question)), `${folder.name}/en.json: ${question.id} leaks a result animal or substitute clue in visible copy.`);
      fail(!(question.icons ?? []).some((icon) => forbiddenIcons.test(icon)), `${folder.name}/en.json: ${question.id} leaks a result animal through an answer icon.`);
    }
    for (const [id, opportunity] of Object.entries(rawOpportunity)) fail(Math.abs(opportunity - 24.2) < .000001, `${folder.name}/en.json: ${id} opportunity must be exactly 24.2 within tolerance.`);
    const expectedValues = Object.values(uniformExpectation);
    fail(Math.max(...expectedValues) - Math.min(...expectedValues) < 1e-9, `${folder.name}/en.json: uniform random answers produce structural result bias.`);
    const scales = sourceQuestions.filter((question) => question.presentation === "scale");
    fail(scales.length === 2 && scales.every((question) => question.id.startsWith("aura-r4")), `${folder.name}/en.json: Aura needs exactly two Round 4 scales.`);
    fail(source.stages?.[3]?.questions?.[1]?.presentation === "scale" && source.stages?.[3]?.questions?.[4]?.presentation === "scale", `${folder.name}/en.json: Round 4 scales must remain separated by two text questions.`);
    fail(source.stages?.[4]?.questions?.every((question) => question.presentation === "icons"), `${folder.name}/en.json: Choose Your Aura must remain an aesthetic icon round.`);
    const sprint = source.stages?.[7]?.questions ?? [];
    fail(sprint.length === 6 && sprint.every((question) => question.presentation === "icons" && question.delay === 350), `${folder.name}/en.json: Instinct Sprint needs six icon-dominant 350ms questions.`);
    fail(sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}/en.json: at least five Instinct Sprint prompts need ten words or fewer.`);
    fail(sourceQuestions.every((question) => sprint.includes(question) || question.delay === undefined), `${folder.name}/en.json: only Instinct Sprint may override the 450ms default.`);
    for (const target of profileOrder) {
      const totals = Object.fromEntries(profileOrder.map((id) => [id, 0]));
      for (const question of sourceQuestions) {
        const best = Object.values(question.answers ?? {}).sort((left, right) => (right[target] ?? 0) - (left[target] ?? 0))[0];
        for (const [id, weight] of Object.entries(best)) totals[id] += weight;
      }
      const winner = profileOrder.map((id, order) => ({ id, order, score: totals[id] })).sort((left, right) => right.score - left.score || left.order - right.order)[0]?.id;
      fail(winner === target, `${folder.name}/en.json: ${target} is not reachable through its strongest plausible response path.`);
    }
    fail(config.engine?.rewarded?.attempts === 3, `${folder.name}: Aura rewarded fallback must require three genuine unavailable attempts.`);
  }
  if (folder.name === "spectrum") {
    const profileOrder = [
      "linguistic", "logical_mathematical", "intrapersonal", "musical",
      "interpersonal", "bodily_kinesthetic", "spatial", "naturalist",
    ];
    const profileLabels = [
      "Linguistic", "Logical-Mathematical", "Intrapersonal", "Musical",
      "Interpersonal", "Bodily-Kinesthetic", "Spatial", "Naturalist",
    ];
    const orientations = ["INTROVERT", "INTROVERT", "INTROVERT", "INTROVERT", "EXTROVERT", "EXTROVERT", "EXTROVERT", "FLEXIBLE TYPE"];
    const profileIds = new Set(profileOrder);
    const rawOpportunity = Object.fromEntries(profileOrder.map((id) => [id, 0]));
    const uniformExpectation = Object.fromEntries(profileOrder.map((id) => [id, 0]));
    const ordinaryPairCounts = new Map();
    const forbiddenResultCopy = /\b(?:linguistic|logical[- ]mathematical|intrapersonal|musical|interpersonal|bodily[- ]kinesthetic|spatial|naturalist|introvert|extrovert|word[- ]smart|number[- ]smart|flexible type)\b/i;
    const visibleQuestionText = (question) => [question.question, question.context, question.explanation, ...Object.keys(question.answers ?? {}), ...(question.visual?.items ?? [])].filter(Boolean).join(" ");
    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), `${folder.name}: Spectrum must launch in English only.`);
    fail(config.engine?.scoring === "weighted-profile" && config.engine?.advanceDelayMs === 450, `${folder.name}: Spectrum needs weighted-profile scoring and 450ms default advancement.`);
    fail(source.title === "What Side Of The Intelligence Spectrum Are You On?", `${folder.name}/en.json: Spectrum title must match the approved headline.`);
    fail(source.landing?.intro === "Words, patterns, people, rhythm, movement or the natural world—follow your instincts to reveal how your mind connects best.", `${folder.name}/en.json: Spectrum landing intro changed.`);
    fail(source.landing?.socialProof === "81,000+ people played this" && source.landing?.cta === "Reveal My Spectrum", `${folder.name}/en.json: Spectrum social proof or CTA changed.`);
    fail(source.stages?.length === 10 && source.stages.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: Spectrum needs ten rounds of six interactions.`);
    fail(sourceQuestions.length === 60 && new Set(sourceQuestions.map((question) => question.id)).size === 60, `${folder.name}/en.json: Spectrum needs 60 uniquely identified interactions.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.id)) === JSON.stringify(profileOrder), `${folder.name}/en.json: Spectrum profile IDs or tie order changed.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.aura)) === JSON.stringify(orientations), `${folder.name}/en.json: Spectrum quiz-orientation labels changed.`);
    fail(JSON.stringify((source.results?.dimensions ?? []).map((dimension) => [dimension.label, dimension.profiles])) === JSON.stringify(profileLabels.map((label, index) => [label, [profileOrder[index]]])), `${folder.name}/en.json: Spectrum primary/secondary dimension order changed.`);
    fail(source.results?.profileReveal?.strongestEnergy === "Primary spectrum style" && source.results?.profileReveal?.hiddenEnergy === "Secondary spectrum style", `${folder.name}/en.json: Spectrum result must use style rather than measured-intelligence labels.`);
    fail(source.results?.profileReveal?.auraLabel === "QUIZ ORIENTATION" && source.results?.profileReveal?.auraLabelFirst === true, `${folder.name}/en.json: Spectrum result must label orientation as a quiz-only profile label.`);
    fail(/does not measure the strength of any intelligence/i.test(source.about?.body ?? "") && /not separately assessed/i.test(source.about?.body ?? ""), `${folder.name}/en.json: Spectrum About copy must explain its preference and orientation limits.`);
    for (const profile of source.results?.profiles ?? []) {
      fail(typeof profile.aura === "string" && profile.aura.trim(), `${folder.name}/en.json: ${profile.id} needs a quiz orientation.`);
      fail(Array.isArray(profile.traits) && profile.traits.length === 3 && profile.traits.every((trait) => typeof trait === "string" && trait.trim()), `${folder.name}/en.json: ${profile.id} needs exactly three traits.`);
      const artwork = config.theme?.artwork?.profiles?.[profile.id];
      fail(typeof artwork === "string" && fs.existsSync(path.join(directory, artwork)), `${folder.name}: ${profile.id} needs local result artwork.`);
    }
    for (const question of sourceQuestions) {
      const meanings = question.answers && !Array.isArray(question.answers) ? Object.values(question.answers) : [];
      fail(question.correct === undefined, `${folder.name}/en.json: ${question.id} must not contain correctness.`);
      fail(meanings.length === (question.presentation === "scale" ? 5 : 4), `${folder.name}/en.json: ${question.id} needs the approved answer count.`);
      meanings.forEach((weights, answerIndex) => {
        const entries = weights && typeof weights === "object" && !Array.isArray(weights) ? Object.entries(weights) : [];
        fail(entries.length >= 2 && entries.every(([id, weight]) => profileIds.has(id) && typeof weight === "number" && weight > 0), `${folder.name}/en.json: ${question.id} answer ${answerIndex + 1} needs positive weights for at least two known styles.`);
        const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
        fail(Math.abs(total - 1) < 1e-9, `${folder.name}/en.json: ${question.id} answer ${answerIndex + 1} weights must total 1.`);
        fail(Math.max(...entries.map(([, weight]) => weight)) <= .75, `${folder.name}/en.json: ${question.id} answer ${answerIndex + 1} overweights one style.`);
        for (const [id, weight] of entries) {
          rawOpportunity[id] += weight;
          uniformExpectation[id] += weight / meanings.length;
        }
        if (question.presentation !== "scale") {
          const pair = entries.map(([id]) => id).sort().join("+");
          ordinaryPairCounts.set(pair, (ordinaryPairCounts.get(pair) ?? 0) + 1);
        }
      });
      fail(!forbiddenResultCopy.test(visibleQuestionText(question)), `${folder.name}/en.json: ${question.id} exposes a result label before the reveal.`);
    }
    for (const [id, opportunity] of Object.entries(rawOpportunity)) fail(Math.abs(opportunity - 30.25) < .000001, `${folder.name}/en.json: ${id} raw opportunity must be exactly 30.25 within tolerance.`);
    for (const [id, expectation] of Object.entries(uniformExpectation)) fail(Math.abs(expectation - 7.5) < .000001, `${folder.name}/en.json: ${id} uniform-random expectation must be exactly 7.5 within tolerance.`);
    const scales = sourceQuestions.filter((question) => question.presentation === "scale");
    fail(JSON.stringify(scales.map((question) => question.id)) === JSON.stringify(["spectrum-r4q2", "spectrum-r4q5"]), `${folder.name}/en.json: Spectrum needs exactly two separated Round 4 scales.`);
    fail(ordinaryPairCounts.size >= 20 && Math.max(...ordinaryPairCounts.values()) <= 12, `${folder.name}/en.json: ordinary answers must rotate across diverse style pairings instead of coupling fixed results.`);
    const reflectionScale = sourceQuestions.find((question) => question.id === "spectrum-r4q5");
    const reflectionStops = Object.values(reflectionScale?.answers ?? {});
    const decisionScale = sourceQuestions.find((question) => question.id === "spectrum-r4q2");
    const decisionStops = Object.values(decisionScale?.answers ?? {});
    const introvertProfiles = profileOrder.slice(0, 4);
    const extrovertProfiles = profileOrder.slice(4, 7);
    const styleShare = (weights, targets) => targets.reduce((sum, id) => sum + (weights?.[id] ?? 0), 0);
    fail(styleShare(decisionStops.at(-1), introvertProfiles) > styleShare(decisionStops[0], introvertProfiles), `${folder.name}/en.json: inward decision alignment must progressively favour the reflective profile group.`);
    fail(styleShare(decisionStops.at(-1), extrovertProfiles) < styleShare(decisionStops[0], extrovertProfiles), `${folder.name}/en.json: outside decision signals must progressively favour the outward profile group.`);
    fail(styleShare(reflectionStops.at(-1), introvertProfiles) > styleShare(reflectionStops[0], introvertProfiles), `${folder.name}/en.json: protected thinking time must progressively favour the reflective profile group.`);
    fail(styleShare(reflectionStops.at(-1), extrovertProfiles) < styleShare(reflectionStops[0], extrovertProfiles), `${folder.name}/en.json: active-environment preference must progressively favour the outward profile group.`);
    fail(Math.abs((reflectionStops.at(-1)?.naturalist ?? 0) - (reflectionStops[0]?.naturalist ?? 0)) < 1e-9, `${folder.name}/en.json: Naturalist must remain neutral across the protected-thinking scale.`);
    fail(JSON.stringify(source.stages?.[3]?.questions?.map((question) => question.presentation ?? "text")) === JSON.stringify(["text", "scale", "icons", "text", "scale", "text"]), `${folder.name}/en.json: Inside Your Head must keep the approved presentation sequence.`);
    fail(source.stages?.[4]?.questions?.every((question) => question.presentation === "icons"), `${folder.name}/en.json: Sense the Pattern must remain an aesthetic icon round.`);
    const sprint = source.stages?.[7]?.questions ?? [];
    fail(sprint.length === 6 && sprint.every((question) => question.presentation === "icons" && question.delay === 350), `${folder.name}/en.json: Brainwave Sprint needs six icon-dominant 350ms questions.`);
    fail(sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}/en.json: at least five Brainwave Sprint prompts need ten words or fewer.`);
    fail(sprint.every((question) => Object.keys(question.answers ?? {}).every((answer) => answer.trim().split(/\s+/).length >= 2)), `${folder.name}/en.json: Brainwave Sprint choices must be brief situations rather than exposed style labels.`);
    fail(sourceQuestions.every((question) => sprint.includes(question) || question.delay === undefined), `${folder.name}/en.json: only Brainwave Sprint may override the 450ms default.`);
    fail(source.checkpoint?.reveals?.every((reveal, index) => reveal.signal === (index === 7 ? "consistency" : "fixed")), `${folder.name}/en.json: Spectrum checkpoints must not reveal a profile before the result.`);
    for (const target of profileOrder) {
      const totals = Object.fromEntries(profileOrder.map((id) => [id, 0]));
      for (const question of sourceQuestions) {
        const best = Object.values(question.answers ?? {}).sort((left, right) => (right[target] ?? 0) - (left[target] ?? 0))[0];
        for (const [id, weight] of Object.entries(best)) totals[id] += weight;
      }
      const winner = profileOrder.map((id, order) => ({ id, order, score: totals[id] })).sort((left, right) => right.score - left.score || left.order - right.order)[0]?.id;
      fail(winner === target, `${folder.name}/en.json: ${target} is not reachable through its strongest plausible response path.`);
    }
    let randomState = 0x5eed1234;
    const nextRandom = () => ((randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0) / 2 ** 32);
    const winCounts = Object.fromEntries(profileOrder.map((id) => [id, 0]));
    const secondaryCounts = Object.fromEntries(profileOrder.map((id) => [id, Object.fromEntries(profileOrder.map((secondary) => [secondary, 0]))]));
    for (let run = 0; run < 20000; run += 1) {
      const totals = Object.fromEntries(profileOrder.map((id) => [id, 0]));
      for (const question of sourceQuestions) {
        const meanings = Object.values(question.answers ?? {});
        const selected = meanings[Math.floor(nextRandom() * meanings.length)];
        for (const [id, weight] of Object.entries(selected)) totals[id] += weight;
      }
      const winner = profileOrder.map((id, order) => ({ id, order, score: totals[id] })).sort((left, right) => right.score - left.score || left.order - right.order)[0]?.id;
      const ranked = profileOrder.map((id, order) => ({ id, order, score: totals[id] })).sort((left, right) => right.score - left.score || left.order - right.order);
      winCounts[winner] += 1;
      secondaryCounts[ranked[0].id][ranked[1].id] += 1;
    }
    const winnerRates = Object.values(winCounts).map((count) => count / 20000);
    fail(Math.max(...winnerRates) - Math.min(...winnerRates) < .015, `${folder.name}/en.json: seeded random simulation exposes material winner bias.`);
    const strongestSecondaryCoupling = Math.max(...profileOrder.flatMap((primary) => profileOrder.filter((secondary) => secondary !== primary).map((secondary) => secondaryCounts[primary][secondary] / winCounts[primary])));
    fail(strongestSecondaryCoupling < .3, `${folder.name}/en.json: a primary style is too strongly coupled to a predetermined secondary style.`);
    fail(config.engine?.rewarded?.attempts === 3, `${folder.name}: Spectrum rewarded fallback must require three genuine unavailable attempts.`);
  }
  if (folder.name === "vintage") {
    const expectedIds = Array.from({ length: 10 }, (_, index) => `vintage-q${index + 1}`);
    const positionCounts = sourceQuestions.reduce((counts, question) => {
      counts[question.correct] = (counts[question.correct] ?? 0) + 1;
      return counts;
    }, [0, 0, 0, 0]);
    const expectedImages = Array.from({ length: 10 }, (_, index) => `/quizzes/vintage/assets/items/${String(index + 1).padStart(2, "0")}.jpg`);
    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), `${folder.name}: Vintage must launch in English only.`);
    fail(config.engine?.flow === "linear" && config.engine?.scoring === "correct-answer", `${folder.name}: Vintage must use the one-round scored flow.`);
    fail(config.engine?.rewarded?.start === true && config.engine?.rewarded?.stages === true && config.engine?.rewarded?.attempts === 3, `${folder.name}: Vintage needs rewarded Start and result gates with three unavailable attempts.`);
    fail(source.title === "Only 7% Can Name These Vintage Items", `${folder.name}/en.json: Vintage title changed.`);
    fail(source.stages?.length === 1 && sourceQuestions.length === 10, `${folder.name}/en.json: Vintage needs one round of ten questions.`);
    fail(JSON.stringify(sourceQuestions.map((question) => question.id)) === JSON.stringify(expectedIds), `${folder.name}/en.json: Vintage question IDs or order changed.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4 && Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4), `${folder.name}/en.json: every Vintage item needs four answers and one valid key.`);
    fail(JSON.stringify(positionCounts) === JSON.stringify([3, 3, 2, 2]), `${folder.name}/en.json: Vintage correct positions must keep the approved irregular 3/3/2/2 distribution.`);
    fail(JSON.stringify(sourceQuestions.map((question) => question.image?.src)) === JSON.stringify(expectedImages), `${folder.name}/en.json: Vintage image order changed.`);
    sourceQuestions.forEach((question) => {
      fail(typeof question.image?.alt === "string" && question.image.alt.trim().length >= 12, `${folder.name}/en.json: ${question.id} needs meaningful image alternative text.`);
      const imagePath = question.image?.src?.replace("/quizzes/vintage/", "");
      fail(Boolean(imagePath) && fs.existsSync(path.join(directory, imagePath)), `${folder.name}/en.json: ${question.id} image file is missing.`);
      fail(typeof question.explanation === "string" && question.explanation.trim().length >= 40, `${folder.name}/en.json: ${question.id} needs a useful answer explanation.`);
    });
    fail(source.checkpoint?.reveals?.length === 1 && source.results?.score?.showBestRound === false, `${folder.name}/en.json: Vintage needs one final checkpoint and no redundant best-round result.`);
  }
  if (folder.name === "university") {
    const expectedCategories = Object.fromEntries([
      "verbal_reasoning", "numerical_reasoning", "scientific_reasoning", "critical_thinking", "worldwide_knowledge", "practical_problem_solving",
    ].map((category) => [category, 10]));
    const counts = Object.fromEntries(Object.keys(expectedCategories).map((category) => [category, sourceQuestions.filter((question) => question.category === category).length]));
    const scored = sourceQuestions.filter((question) => Number.isInteger(question.correct));
    const fit = sourceQuestions.filter((question) => question.correct === undefined);
    const traits = new Set(config.engine?.match?.traits ?? []);
    fail(JSON.stringify(localeFiles) === JSON.stringify(["de.json", "en.json", "es.json", "fr.json", "it.json", "nl.json", "pt.json"]), `${folder.name}: University must support the complete seven-locale set.`);
    fail(config.engine?.scoring === "hybrid-match", `${folder.name}: University must use generic hybrid-match scoring.`);
    fail(source.stages?.length === 10 && source.stages.every((stage) => stage.questions?.length === 6), `${folder.name}: University needs ten rounds of six interactions.`);
    fail(sourceQuestions.length === 60 && scored.length === 60 && fit.length === 0, `${folder.name}: University needs 60 scored entrance challenges.`);
    fail(JSON.stringify(counts) === JSON.stringify(expectedCategories), `${folder.name}: every academic category must appear exactly ten times.`);
    fail(scored.every((question) => Array.isArray(question.answers) && question.answers.length >= 3 && question.answers.length <= 5 && question.correct >= 0 && question.correct < question.answers.length), `${folder.name}: scored challenges need 3–5 choices and one valid answer.`);
    const correctPositionCounts = scored.reduce((counts, question) => {
      counts[question.correct] = (counts[question.correct] ?? 0) + 1;
      return counts;
    }, Array(4).fill(0));
    fail(JSON.stringify(correctPositionCounts) === JSON.stringify([15, 15, 15, 15]), `${folder.name}: correct-answer positions must remain exactly balanced across A–D.`);
    for (const question of fit) {
      fail(question.answers && !Array.isArray(question.answers), `${folder.name}: fit question ${question.id} needs weighted answer choices.`);
      for (const weights of Object.values(question.answers ?? {})) {
        const entries = weights && typeof weights === "object" && !Array.isArray(weights) ? Object.entries(weights) : [];
        fail(entries.length >= 2 && entries.every(([trait, weight]) => traits.has(trait) && typeof weight === "number" && weight >= 0) && Math.abs(entries.reduce((sum, [, weight]) => sum + weight, 0) - 1) < 1e-9, `${folder.name}: every fit choice needs soft known-trait weights totalling 1.`);
      }
    }
    const primaryExposure = Object.fromEntries([...traits].map((trait) => [trait, 0]));
    const traitMass = Object.fromEntries([...traits].map((trait) => [trait, 0]));
    for (const question of fit) for (const weights of Object.values(question.answers ?? {})) {
      const primary = Object.entries(weights).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (primary in primaryExposure) primaryExposure[primary] += 1;
      for (const [trait, weight] of Object.entries(weights)) traitMass[trait] += weight;
    }
    const totalTraitMass = Object.values(traitMass).reduce((sum, value) => sum + value, 0);
    if (fit.length) {
      fail(Object.values(primaryExposure).every((count) => count >= 9 && count <= 15), `${folder.name}: primary learning-style opportunities must remain balanced.`);
      fail(Object.values(traitMass).every((mass) => mass / totalTraitMass >= .14 && mass / totalTraitMass <= .19), `${folder.name}: total learning-style scoring mass must remain balanced.`);
    }
    const sprint = source.stages[7].questions;
    fail(sprint.every((question) => question.delay === 350) && sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}: Global Campus Sprint needs six 350ms compact prompts.`);
    fail(sourceQuestions.every((question) => sprint.includes(question) || question.delay === undefined), `${folder.name}: only Global Campus Sprint may override the 450ms default.`);
    fail(source.stages[9].questions.filter((question) => question.correct !== undefined && question.reasoningSteps >= 2).length >= 3, `${folder.name}: Final Admissions Board needs at least three two-step scored questions.`);
    fail(config.engine?.advanceDelayMs === 450 && config.engine?.rewarded?.attempts === 3, `${folder.name}: University timing and rewarded fallback configuration are incorrect.`);
    fail(config.engine?.match?.academicWeight === 1 && config.engine?.match?.styleWeight === 0, `${folder.name}: University entrance results must use academic scoring only.`);
    fail(config.engine?.match?.candidates?.length === 10 && source.results?.profiles?.length === 10, `${folder.name}: University needs ten match outcomes.`);
  }

  for (const localeFile of localeFiles) {
    const localized = read(path.join(directory, localeFile));
    if (!localized) continue;
    const questions = (localized.stages ?? []).flatMap((stage) => stage.questions ?? []);
    const questionIds = questions.map((question) => question.id);
    fail(questionIds.every((id) => typeof id === "string" && Boolean(id.trim())), `${folder.name}/${localeFile}: every question needs a stable id.`);
    fail(new Set(questionIds).size === questionIds.length, `${folder.name}/${localeFile}: question ids must be unique.`);
    const localizedProfileStructure = validateResultProfiles(localized, config.engine?.scoring, `${folder.name}/${localeFile}`);
    fail(JSON.stringify(localizedProfileStructure) === JSON.stringify(sourceProfileStructure), `${folder.name}/${localeFile}: result profile ids and thresholds differ from English.`);
    if (config.engine?.scoring === "weighted-profile") validateWeightedReferences(localized, `${folder.name}/${localeFile}`);
    if (folder.name === "iq") {
      if (localeFile === "en.json") {
        fail(!/10\s+(?:round|level)|IQ score|IQ Challenge Score/i.test(localized.landing?.intro ?? ""), `${folder.name}/${localeFile}: compact Smart Score intro contains obsolete IQ or round copy.`);
        const mirror = questions.find((question) => question.id === "iq-s1q4");
        fail(mirror?.presentation === "spatial" && mirror?.correct === 2 && mirror?.visual?.items?.[1]?.includes("│"), `${folder.name}/${localeFile}: vertical-mirror question must reflect up-right to up-left.`);
        const letterCode = questions.find((question) => question.id === "iq-s2q2");
        const demonstratedCode = letterCode?.visual?.items?.[1]?.split("→")?.[1]?.trim();
        fail(Boolean(demonstratedCode) && !letterCode?.answers?.includes(demonstratedCode), `${folder.name}/${localeFile}: letter-code demonstration must not reveal one of the question answers.`);
        const linking = questions.find((question) => question.id === "iq-s1q3");
        fail(linking?.presentation === "code" && linking?.visual?.items?.length === 2, `${folder.name}/${localeFile}: linking-word puzzle changed.`);
      } else {
        fail(/\b10\b/.test(localized.landing?.intro ?? ""), `${folder.name}/${localeFile}: legacy localized IQ landing intro must use numeral 10.`);
        const mirror = questions.find((question) => question.id === "iq-r5q3");
        fail(mirror?.presentation === "spatial" && mirror?.correct === 0 && mirror?.visual?.items?.[1]?.includes("│"), `${folder.name}/${localeFile}: vertical-mirror question must reflect the arrow horizontally to answer index zero.`);
        const letterCode = questions.find((question) => question.id === "iq-r6q3");
        const demonstratedCode = letterCode?.visual?.items?.[1]?.split("→")?.[1]?.trim();
        fail(Boolean(demonstratedCode) && !letterCode?.answers?.includes(demonstratedCode), `${folder.name}/${localeFile}: letter-code demonstration must not reveal one of the question answers.`);
        for (const id of ["iq-r4q3", "iq-r10q3"]) {
          const linking = questions.find((question) => question.id === id);
          fail(linking?.presentation === "code" && linking?.visual?.items?.length === 2, `${folder.name}/${localeFile}: ${id} must remain a two-sided linking-word puzzle.`);
        }
      }
    }
    if (folder.name === "biology") {
      const locale = localeFile.replace(/\.json$/, "");
      const expectedCorrectLabels = {
        en: "correct",
        fr: "bonnes réponses",
        de: "richtige Antworten",
        pt: "respostas certas",
        nl: "goede antwoorden",
        es: "respuestas correctas",
        it: "risposte corrette",
      };
      fail(localized.results?.score?.correctLabel === expectedCorrectLabels[locale], `${folder.name}/${localeFile}: result fraction label must use the approved localized wording.`);
    }
    if (config.engine?.checkpoint === "ai") {
      fail(localized.stages?.every((stage) => stage.complete === undefined), `${folder.name}/${localeFile}: AI checkpoint stages must not contain unused complete copy.`);
      fail(localized.checkpoint?.reveals?.length === localized.stages?.length, `${folder.name}/${localeFile}: checkpoint reveals must match stage count.`);
      fail(localized.checkpoint?.finalChecklist?.length >= 3 && localized.checkpoint.finalChecklist.length <= 8, `${folder.name}/${localeFile}: final checklist must contain three to eight items.`);
    }
    if (config.engine?.localeParity !== "independent") {
      fail(JSON.stringify((localized.results?.dimensions ?? []).map((dimension) => dimension.categories)) === JSON.stringify((source.results?.dimensions ?? []).map((dimension) => dimension.categories)), `${folder.name}/${localeFile}: internal result dimension category IDs differ from English.`);
      fail((localized.stages ?? []).length === (source.stages ?? []).length, `${folder.name}/${localeFile}: stage count differs from English.`);
      fail(questions.length === sourceQuestions.length, `${folder.name}/${localeFile}: question count differs from English.`);
    }
    if (config.engine?.localeParity !== "independent") questions.forEach((question, index) => {
      const sourceQuestion = sourceQuestions[index];
      const answers = Array.isArray(question.answers) ? question.answers : Object.keys(question.answers ?? {});
      const sourceAnswers = Array.isArray(sourceQuestion?.answers) ? sourceQuestion.answers : Object.keys(sourceQuestion?.answers ?? {});
      validateStudy(question.study, `${folder.name}/${localeFile}: question ${index + 1}`);
      fail(answers.length === sourceAnswers.length, `${folder.name}/${localeFile}: question ${index + 1} answer count differs from English.`);
      fail((question.presentation ?? "text") === (sourceQuestion?.presentation ?? "text"), `${folder.name}/${localeFile}: question ${index + 1} presentation differs from English.`);
      fail(question.correct === sourceQuestion?.correct, `${folder.name}/${localeFile}: question ${index + 1} correct answer differs from English.`);
      fail(Boolean(question.context) === Boolean(sourceQuestion?.context), "Question context structure differs from English.");
      fail(question.category === sourceQuestion?.category, `${folder.name}/${localeFile}: question ${index + 1} category differs from English.`);
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
      fail(JSON.stringify(question.image ? {
        src: question.image.src,
        alt: Boolean(question.image.alt),
      } : undefined) === JSON.stringify(sourceQuestion?.image ? {
        src: sourceQuestion.image.src,
        alt: Boolean(sourceQuestion.image.alt),
      } : undefined), `${folder.name}/${localeFile}: question ${index + 1} image structure differs from English.`);
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
