import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "data", "quizzes");
const supportedLocales = new Set(fs.readdirSync(path.join(process.cwd(), "data", "i18n"))
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.replace(/\.json$/, "")));
const expectedDirections = {
  en: "ltr", fr: "ltr", de: "ltr", pt: "ltr", nl: "ltr", es: "ltr", it: "ltr",
  hi: "ltr", ar: "rtl", id: "ltr", bn: "ltr", vi: "ltr", fil: "ltr", ur: "rtl",
  th: "ltr", tr: "ltr", pl: "ltr",
};
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
  fail(ui.locale?.direction === expectedDirections[locale], `data/i18n/${locale}.json: locale.direction must be ${expectedDirections[locale]}.`);
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
    fail(source.stages?.length === 10, `${folder.name}/en.json: Years Left must contain ten rounds.`);
    fail(source.stages?.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: every Years Left round must contain six interactions.`);
    fail(config.engine?.advanceDelayMs >= 200 && config.engine?.advanceDelayMs <= 600, `${folder.name}: default advance delay must be 200–600ms.`);
    fail(config.engine?.estimate?.baseAge === 84 && config.engine?.estimate?.minAge === 73 && config.engine?.estimate?.maxAge === 95, `${folder.name}: estimate base and safety clamp are incorrect.`);
    const brain = source.stages?.[4]?.questions ?? [];
    fail(JSON.stringify(source.stages?.[1]?.questions?.map((question) => Object.keys(question.answers ?? {}).length)) === JSON.stringify([4, 3, 4, 3, 2, 3]), `${folder.name}: food round must use the approved 4/3/4/3/2/3 choice rhythm.`);
    fail(JSON.stringify(source.stages?.[2]?.questions?.map((question) => Object.keys(question.answers ?? {}).length)) === JSON.stringify([3, 3, 3, 3, 3, 4]), `${folder.name}: movement round must end with a four-icon interaction.`);
    fail(source.stages?.[3]?.questions?.[2]?.presentation === "scale", `${folder.name}: Sleep & Stress Q3 must be the five-stop scale.`);
    fail(brain[0]?.presentation === "memory-cue" && brain[0]?.memoryItems?.length === 4, `${folder.name}: Brain Check must begin with a four-item memory cue.`);
    fail(brain.slice(1).every((question) => Number.isInteger(question.correct)), `${folder.name}: Brain Check Q2–Q6 need correct indices.`);
    fail(source.stages?.[5]?.questions?.every((question) => Object.keys(question.answers ?? {}).length === 2), `${folder.name}: People & Personality must remain a binary recovery round.`);
    fail(source.stages?.[9]?.questions?.every((question) => question.calibration?.length === Object.keys(question.answers ?? {}).length), `${folder.name}: final calibration values must match every answer.`);
  }
  if (folder.name === "memory") {
    const categories = new Set(["word_recall", "visual", "numbers", "working_memory", "association", "attention"]);
    const ids = sourceQuestions.map((question) => question.id);
    const expectedMemoryLocales = Object.keys(expectedDirections).map((locale) => `${locale}.json`).sort();
    fail(JSON.stringify(localeFiles.sort()) === JSON.stringify(expectedMemoryLocales), `${folder.name}: Memory must support the complete ${expectedMemoryLocales.length}-locale set.`);
    fail(source.stages?.length === 10, `${folder.name}/en.json: Memory must contain ten rounds.`);
    fail(source.stages?.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: every Memory round must contain six scored questions.`);
    fail(sourceQuestions.length === 60, `${folder.name}/en.json: Memory must contain exactly 60 scored questions.`);
    fail(ids.every((id) => typeof id === "string" && Boolean(id.trim())), `${folder.name}/en.json: every Memory question needs a stable ID.`);
    fail(new Set(ids).size === 60, `${folder.name}/en.json: Memory question IDs must be unique.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct)), `${folder.name}/en.json: every Memory question needs a correct index.`);
    fail(sourceQuestions.every((question) => categories.has(question.category)), `${folder.name}/en.json: every Memory question needs an approved category.`);
    fail(config.engine?.targetRatio === 0.8, `${folder.name}: Memory targetRatio must be exactly 0.8.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: result profile thresholds must match the launch specification.`);
  }
  if (folder.name === "memory-short") {
    const categories = ["word_recall", "visual", "numbers", "working_memory", "association", "attention"];
    const expectedStudyDurations = {
      "m-r1q1": 4500,
      "m-r1q2": 3000,
      "m-r1q4": 5000,
      "m-r1q5": 5500,
      "m-r1q6": 3200,
      "m-r2q1": 6000,
      "m-r4q1": 6000,
      "m-r7q1": 5000,
      "m-r7q3": 3500,
      "m-r7q4": 4000,
      "m-r7q5": 4000,
      "m-r3q2": 2800,
      "m-r3q4": 2500,
      "m-r3q5": 5000,
      "m-r3q6": 3500,
      "m-r5q1": 5500,
      "m-r5q3": 3500,
      "m-r9q3": 2500,
      "m-r9q1": 6000,
      "m-r9q5": 6000,
      "m-r8q2": 2500,
      "m-r8q3": 3000,
      "m-r10q1": 6000,
      "m-r10q2": 2800,
      "m-r10q4": 3200,
    };
    fail(JSON.stringify(localeFiles.sort()) === JSON.stringify(["en.json"]), `${folder.name}: Memory Short must launch in English only.`);
    fail(config.engine?.flow === "staged", `${folder.name}: Memory Short must use the five-round staged flow.`);
    fail(config.engine?.startOnLoad === true, `${folder.name}: Memory Short must open directly on its first question.`);
    fail(source.progressLabel === undefined, `${folder.name}/en.json: the five-round format must use the standard round label.`);
    fail(source.stages?.length === 5 && source.stages.every((stage) => stage.questions?.length === 8), `${folder.name}/en.json: Memory Short must contain five rounds of eight questions.`);
    fail(sourceQuestions.length === 40 && new Set(sourceQuestionIds).size === 40, `${folder.name}/en.json: Memory Short needs 40 unique stable question IDs.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && categories.includes(question.category)), `${folder.name}/en.json: every Memory Short question needs one correct answer and an approved memory category.`);
    fail(JSON.stringify([0, 1, 2, 3].map((index) => sourceQuestions.filter((question) => question.correct === index).length)) === JSON.stringify([10, 10, 10, 10]), `${folder.name}/en.json: Memory Short correct positions must be balanced 10/10/10/10.`);
    fail(sourceQuestions[0]?.study?.mode === "manual" && sourceQuestions[0]?.study?.continueLabel === "I’ve memorised them", `${folder.name}/en.json: the direct-start opening must be an untimed memory cue with an explicit ready button.`);
    fail(sourceQuestions.slice(1).every((question) => question.study?.mode !== "manual"), `${folder.name}/en.json: only the opening memory cue may use manual study timing.`);
    fail(sourceQuestions.every((question) => question.study?.mode !== "automatic" || question.study.durationMs >= 2500), `${folder.name}/en.json: automatic study cues must allow at least 2500ms for worldwide and older audiences.`);
    fail(Object.entries(expectedStudyDurations).every(([id, durationMs]) => sourceQuestions.find((question) => question.id === id)?.study?.durationMs === durationMs), `${folder.name}/en.json: Memory Short study timings must match the approved accessible timing map.`);
    fail(sourceQuestions.find((question) => question.id === "m-r5q6")?.question === "Which complete set appeared earlier in the test?", `${folder.name}/en.json: the delayed set callback must describe its placement accurately.`);
    fail(config.engine?.targetRatio === 0.8 && Math.ceil(sourceQuestions.length * config.engine.targetRatio) === 32, `${folder.name}: the 80% Memory Short pass line must begin at 32/40 correct.`);
    fail(config.engine?.rewarded?.start === false && config.engine?.rewarded?.stages === true && config.engine?.rewarded?.attempts === 3, `${folder.name}: Memory Short must skip the start ad and request rewarded gates at all five round checkpoints.`);
    fail(source.landing?.startPrompt === undefined, `${folder.name}/en.json: direct-start Memory Short must not contain an unused landing reward prompt.`);
    fail(source.checkpoint?.reveals?.length === 5 && source.checkpoint?.progressLabel === "Memory test progress" && source.checkpoint?.progressComplete === "{value}% complete" && source.checkpoint?.finalButton === "Reveal My Score", `${folder.name}/en.json: Memory Short needs four continuation checkpoints, one final score gate and checkpoint progress copy.`);
    fail(source.results?.score?.retryLabel === "Try Again", `${folder.name}/en.json: the result must offer a Try Again action.`);
  }
  if (folder.name === "iq") {
    const ids = sourceQuestions.map((question) => question.id);
    const expectedCategories = {
      pattern: 9,
      numerical: 9,
      verbal: 9,
      spatial: 9,
      logic: 9,
      attention: 9,
      general_knowledge: 6,
    };
    const counts = Object.fromEntries(Object.keys(expectedCategories).map((category) => [
      category,
      sourceQuestions.filter((question) => question.category === category).length,
    ]));
    fail(["de.json", "en.json", "es.json", "fr.json", "it.json", "nl.json", "pt.json"].every((file) => localeFiles.includes(file)), `${folder.name}: IQ must support every site locale.`);
    fail(source.stages?.length === 10, `${folder.name}/en.json: IQ must contain ten rounds.`);
    fail(/\b10\b/.test(source.landing?.intro ?? ""), `${folder.name}/en.json: IQ landing intro must use numeral 10.`);
    fail(source.stages?.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: every IQ round must contain six questions.`);
    fail(sourceQuestions.length === 60, `${folder.name}/en.json: IQ must contain exactly 60 questions.`);
    fail(new Set(ids).size === 60 && ids.every((id) => typeof id === "string" && id.trim()), `${folder.name}/en.json: IQ needs 60 unique stable question IDs.`);
    fail(JSON.stringify(counts) === JSON.stringify(expectedCategories), `${folder.name}/en.json: category balance must be 9 each for six reasoning areas and 6 worldwide general-knowledge questions.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length >= 3 && question.answers.length <= 5), `${folder.name}/en.json: every IQ question needs three to five choices.`);
    fail(sourceQuestions.every((question) => new Set(question.answers).size === question.answers.length), `${folder.name}/en.json: IQ choices must be unique within each question.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.correct >= 0 && question.correct < question.answers.length), `${folder.name}/en.json: every IQ question needs one valid correct index.`);
    fail(sourceQuestions.every((question) => question.delay === undefined || (Number.isInteger(question.delay) && question.delay >= 200 && question.delay <= 600)), `${folder.name}/en.json: IQ question delays must be 200–600ms.`);
    const supportedPresentations = new Set(["text", "icons", "sequence", "grid", "code", "spatial"]);
    fail(sourceQuestions.every((question) => supportedPresentations.has(question.presentation ?? "text")), `${folder.name}/en.json: unsupported IQ presentation.`);
    for (const [index, question] of sourceQuestions.entries()) {
      const location = `${folder.name}/en.json: question ${index + 1}`;
      if (question.presentation === "sequence") fail(question.visual?.items?.length >= 3 && question.visual.items.length <= 8, `${location} sequence needs 3–8 items.`);
      if (question.presentation === "grid") fail([4, 9].includes(question.visual?.items?.length) && [2, 3].includes(question.visual?.columns), `${location} grid needs 4 or 9 cells and 2 or 3 columns.`);
      if (question.presentation === "code") fail(question.visual?.items?.length >= 2 && question.visual.items.length <= 6, `${location} code needs 2–6 rules.`);
      if (question.presentation === "spatial") fail(question.visual?.items?.length >= 1 && question.visual.items.length <= 6, `${location} spatial display needs 1–6 symbols.`);
      if (["sequence", "grid", "code", "spatial"].includes(question.presentation)) fail(typeof question.visual?.ariaLabel === "string" && question.visual.ariaLabel.trim(), `${location} visual needs an accessible label.`);
    }
    const sprint = source.stages?.[7]?.questions ?? [];
    fail(sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}/en.json: at least five Instinct Sprint prompts must contain no more than ten words.`);
    fail(sprint.every((question) => question.delay === 350), `${folder.name}/en.json: every Instinct Sprint selection delay must be 350ms.`);
    const trapdoor = source.stages?.[8]?.questions ?? [];
    fail(trapdoor.every((question) => typeof question.explanation === "string" && question.explanation.trim()), `${folder.name}/en.json: every Trapdoor question needs an explicit-clue explanation.`);
    const boss = source.stages?.[9]?.questions ?? [];
    fail(boss.find((question) => question.category === "numerical")?.reasoningSteps >= 2, `${folder.name}/en.json: the numerical boss question must require two reasoning steps.`);
    fail(boss.find((question) => question.category === "logic")?.reasoningSteps >= 2, `${folder.name}/en.json: the logical boss question must require two reasoning steps.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: IQ profile thresholds are incorrect.`);
    fail(JSON.stringify(config.engine?.derivedScore) === JSON.stringify({
      breakpoints: [{ ratio: 0, value: 70 }, { ratio: 0.5, value: 100 }, { ratio: 1, value: 145 }],
      roundTo: 5,
    }), `${folder.name}: IQ derived-score configuration is incorrect.`);
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
      kitchen_fundamentals: 10,
      ingredients_flavour: 10,
      heat_methods: 10,
      baking_pastry: 10,
      kitchen_maths: 10,
      safety_service: 10,
    };
    const counts = Object.fromEntries(Object.keys(expectedCategories).map((category) => [
      category,
      sourceQuestions.filter((question) => question.category === category).length,
    ]));
    const correctPositions = sourceQuestions.reduce((positions, question) => {
      positions[question.correct] = (positions[question.correct] ?? 0) + 1;
      return positions;
    }, Array(4).fill(0));
    const service = source.stages?.[6]?.questions ?? [];
    const sprint = source.stages?.[7]?.questions ?? [];
    const mistakes = source.stages?.[8]?.questions ?? [];
    const finalTable = source.stages?.[9]?.questions ?? [];
    const visibleClueCount = (question) => (question.context ?? "")
      .split(/[.;\n]/)
      .map((part) => part.trim())
      .filter(Boolean).length;
    const serialized = JSON.stringify(source);

    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), `${folder.name}: Chef must launch in English only.`);
    fail(config.engine?.scoring === "correct-answer", `${folder.name}: Chef must use correct-answer scoring.`);
    fail(source.title === "Only 12% Pass This Chef's Entrance Exam", `${folder.name}/en.json: Chef title must match the approved headline.`);
    fail(source.landing?.socialProof === "81,000+ people played this" && source.landing?.cta === "Start Quiz", `${folder.name}/en.json: Chef landing social proof or CTA changed.`);
    fail(source.stages?.length === 10 && source.stages.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: Chef needs ten rounds of six questions.`);
    fail(sourceQuestions.length === 60, `${folder.name}/en.json: Chef must contain exactly 60 questions.`);
    fail(JSON.stringify(counts) === JSON.stringify(expectedCategories), `${folder.name}/en.json: Chef needs exactly ten questions in each culinary category.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4), `${folder.name}/en.json: every Chef question needs exactly four choices.`);
    fail(sourceQuestions.every((question) => question.answers.every((answer) => typeof answer === "string" && Boolean(answer.trim())) && new Set(question.answers).size === 4), `${folder.name}/en.json: Chef choices must be non-empty and unique within each question.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4), `${folder.name}/en.json: every Chef question needs one valid correct index.`);
    fail(JSON.stringify(correctPositions) === JSON.stringify([15, 15, 15, 15]), `${folder.name}/en.json: Chef correct-answer positions must be exactly 15 each across A–D.`);
    fail(sourceQuestions.every((question) => typeof question.explanation === "string" && Boolean(question.explanation.trim())), `${folder.name}/en.json: every Chef question needs a post-result explanation.`);
    fail(config.engine?.advanceDelayMs === 450, `${folder.name}: Chef default advancement must be exactly 450ms.`);
    fail(sprint.length === 6 && sprint.every((question) => question.delay === 350), `${folder.name}/en.json: every Quick-Fire Pass question must use 350ms.`);
    fail(sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}/en.json: at least five Quick-Fire Pass prompts must contain no more than ten words.`);
    fail(sourceQuestions.every((question) => sprint.includes(question) || question.delay === undefined), `${folder.name}/en.json: only Quick-Fire Pass may override the 450ms default.`);
    fail(service.length === 6 && service.every((question) => visibleClueCount(question) >= 2), `${folder.name}/en.json: every Service Under Pressure question needs at least two visible clues.`);
    fail(mistakes.length === 6 && mistakes.every((question) => (typeof question.context === "string" && question.context.trim()) || question.visual), `${folder.name}/en.json: every Spot the Kitchen Mistake question needs a visible ticket, recipe, process or record.`);
    fail(finalTable.length === 6 && finalTable.every((question) => question.reasoningSteps === 2 && typeof question.context === "string" && question.context.trim()), `${folder.name}/en.json: all six Final Chef’s Table questions need visible context and two-step reasoning.`);
    fail(sourceQuestions.every((question) => !question.contextRequired || ((typeof question.context === "string" && question.context.trim()) || question.visual)), `${folder.name}/en.json: every context-dependent Chef question needs visible context or a visual panel.`);
    fail(!/\b(?:oz|ounce|ounces|lb|lbs|pound|pounds|fahrenheit)\b|°F/i.test(serialized), `${folder.name}/en.json: Chef must use metric or unit-neutral worldwide measurements.`);
    fail(!/(searing (?:always )?seals|universally best|always needs exactly|steak is done after)/i.test(serialized), `${folder.name}/en.json: Chef contains a disputed culinary absolute.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: Chef profile thresholds are incorrect.`);
    fail(source.results?.score?.showPercentage === true, `${folder.name}/en.json: Chef must lead its result with the percentage.`);
    fail(config.engine?.targetRatio === 0.8, `${folder.name}: Chef pass threshold must be 80%.`);
    fail(config.engine?.rewarded?.attempts === 3, `${folder.name}: Chef rewarded fallback must require three genuine unavailable attempts.`);
  }
  if (folder.name === "grammar") {
    const expectedCategories = {
      sentence_structure: 10,
      verbs_agreement: 10,
      punctuation_apostrophes: 10,
      pronouns_reference: 10,
      modifiers_word_choice: 10,
      editing_context: 10,
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
    const trapdoors = source.stages?.[8]?.questions ?? [];
    const finalProof = source.stages?.[9]?.questions ?? [];
    const questionCopy = sourceQuestions.flatMap((question) => [
      question.context,
      question.question,
      ...(Array.isArray(question.answers) ? question.answers : []),
      question.explanation,
    ].filter(Boolean)).join(" ");
    const singularTheyQuestions = ["grammar-r5q2", "grammar-r10q4"]
      .map((id) => sourceQuestions.find((question) => question.id === id));

    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), `${folder.name}: Grammar must launch in English only.`);
    fail(config.engine?.scoring === "correct-answer", `${folder.name}: Grammar must use correct-answer scoring.`);
    fail(source.title === "Only 10% Of The Population Can Pass This Grammar Quiz", `${folder.name}/en.json: Grammar title must match the approved headline.`);
    fail(source.landing?.socialProof === "81,000+ people played this" && source.landing?.cta === "Start Quiz", `${folder.name}/en.json: Grammar landing social proof or CTA changed.`);
    fail(source.stages?.length === 10 && source.stages.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: Grammar needs ten rounds of six questions.`);
    fail(sourceQuestions.length === 60 && new Set(sourceQuestions.map((question) => question.id)).size === 60, `${folder.name}/en.json: Grammar must contain 60 uniquely identified questions.`);
    fail(JSON.stringify(counts) === JSON.stringify(expectedCategories), `${folder.name}/en.json: Grammar needs exactly ten questions in each language category.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4), `${folder.name}/en.json: every Grammar question needs exactly four choices.`);
    fail(sourceQuestions.every((question) => question.answers.every((answer) => typeof answer === "string" && Boolean(answer.trim())) && new Set(question.answers).size === 4), `${folder.name}/en.json: Grammar choices must be non-empty and unique within each question.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4), `${folder.name}/en.json: every Grammar question needs one valid correct index.`);
    fail(JSON.stringify(correctPositions) === JSON.stringify([15, 15, 15, 15]), `${folder.name}/en.json: Grammar correct-answer positions must be exactly 15 each across A–D.`);
    fail(sourceQuestions.every((question) => typeof question.explanation === "string" && Boolean(question.explanation.trim())), `${folder.name}/en.json: every Grammar question needs a post-result explanation.`);
    fail(config.engine?.advanceDelayMs === 450, `${folder.name}: Grammar default advancement must be exactly 450ms.`);
    fail(sprint.length === 6 && sprint.every((question) => question.delay === 350), `${folder.name}/en.json: every Quick Fix Sprint question must use 350ms.`);
    fail(sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}/en.json: at least five Quick Fix Sprint prompts must contain no more than ten words.`);
    fail(sourceQuestions.every((question) => sprint.includes(question) || question.delay === undefined), `${folder.name}/en.json: only Quick Fix Sprint may override the 450ms default.`);
    fail(trapdoors.length === 6 && trapdoors.every((question) => Array.isArray(question.trapdoorErrors) && question.trapdoorErrors.length === 4 && question.trapdoorErrors[question.correct] === null && question.trapdoorErrors.filter(Boolean).length === 3), `${folder.name}/en.json: every Grammar Trapdoor needs one identified error for each distractor and none for the correct answer.`);
    fail(finalProof.length === 6 && finalProof.every((question) => question.reasoningSteps === 2 && typeof question.context === "string" && question.context.trim()), `${folder.name}/en.json: all six Final Proof questions need visible context and two-step reasoning.`);
    fail(singularTheyQuestions.every((question) => question && /\b(?:they|their)\b/i.test(question.answers[question.correct]) && /standard/i.test(question.explanation)), `${folder.name}/en.json: singular they/their must remain explicitly accepted as standard English.`);
    fail(!/\bwhom\b/i.test(questionCopy), `${folder.name}/en.json: unsupported who/whom distinctions are not allowed.`);
    fail(!/\bJames(?:['’]s|['’])\b/.test(questionCopy), `${folder.name}/en.json: style-dependent possessives of names ending in s are not allowed.`);
    fail(!/\b(?:gotten|color|colour|center|centre|organize|organise)\b/i.test(questionCopy), `${folder.name}/en.json: regional spelling or got/gotten distinctions are not allowed.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: Grammar profile thresholds are incorrect.`);
    fail(source.results?.score?.showPercentage === true, `${folder.name}/en.json: Grammar must lead its result with the percentage.`);
    fail(config.engine?.targetRatio === 0.8, `${folder.name}: Grammar pass threshold must be 80%.`);
    fail(config.engine?.rewarded?.attempts === 3, `${folder.name}: Grammar rewarded fallback must require three genuine unavailable attempts.`);
  }
  if (folder.name === "nursing") {
    const expectedCategories = {
      anatomy_physiology: 10,
      numeracy_measurement: 10,
      observation_vitals: 10,
      infection_safety: 10,
      communication_compassion: 10,
      reasoning_priorities: 10,
    };
    const counts = Object.fromEntries(Object.keys(expectedCategories).map((category) => [
      category,
      sourceQuestions.filter((question) => question.category === category).length,
    ]));
    const correctPositions = sourceQuestions.reduce((positions, question) => {
      positions[question.correct] = (positions[question.correct] ?? 0) + 1;
      return positions;
    }, Array(4).fill(0));
    const priorities = source.stages?.[6]?.questions ?? [];
    const sprint = source.stages?.[7]?.questions ?? [];
    const handovers = source.stages?.[8]?.questions ?? [];
    const finalHandover = source.stages?.[9]?.questions ?? [];
    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), `${folder.name}: Nursing must launch in English only.`);
    fail(config.engine?.scoring === "correct-answer", `${folder.name}: Nursing must use correct-answer scoring.`);
    fail(source.title === "Only 7% Pass This Nursing Entrance Exam", `${folder.name}/en.json: Nursing title must match the approved headline.`);
    fail(source.landing?.socialProof === "81,000+ people played this" && source.landing?.cta === "Start Quiz", `${folder.name}/en.json: Nursing landing social proof or CTA changed.`);
    fail(source.stages?.length === 10 && source.stages.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: Nursing needs ten stages of six questions.`);
    fail(sourceQuestions.length === 60, `${folder.name}/en.json: Nursing must contain exactly 60 questions.`);
    fail(JSON.stringify(counts) === JSON.stringify(expectedCategories), `${folder.name}/en.json: Nursing needs exactly ten questions in each entrance category.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4), `${folder.name}/en.json: every Nursing question needs exactly four choices.`);
    fail(sourceQuestions.every((question) => question.answers.every((answer) => typeof answer === "string" && Boolean(answer.trim())) && new Set(question.answers).size === 4), `${folder.name}/en.json: Nursing choices must be non-empty and unique within each question.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4), `${folder.name}/en.json: every Nursing question needs one valid correct index.`);
    fail(JSON.stringify(correctPositions) === JSON.stringify([15, 15, 15, 15]), `${folder.name}/en.json: Nursing correct-answer positions must be exactly 15 each across A–D.`);
    fail(sourceQuestions.every((question) => typeof question.explanation === "string" && Boolean(question.explanation.trim())), `${folder.name}/en.json: every Nursing question needs a post-result explanation.`);
    fail(sourceQuestions.every((question) => !question.visual || (typeof question.visual.separator === "string" && Boolean(question.visual.separator.trim()))), `${folder.name}/en.json: every Nursing visual needs a visible separator.`);
    fail(config.engine?.advanceDelayMs === 450, `${folder.name}: Nursing default advancement must be exactly 450ms.`);
    fail(sprint.length === 6 && sprint.every((question) => question.delay === 350), `${folder.name}/en.json: every Nurses’ Station Sprint question must use 350ms.`);
    fail(sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}/en.json: at least five Nurses’ Station Sprint prompts must contain no more than ten words.`);
    fail(sourceQuestions.every((question) => sprint.includes(question) || question.delay === undefined), `${folder.name}/en.json: only Nurses’ Station Sprint may override the 450ms default.`);
    fail(priorities.length === 6 && priorities.every((question) => typeof question.context === "string" && question.context.trim()), `${folder.name}/en.json: every priority-stage question needs multiple visible clues.`);
    fail(priorities.filter((question) => /Person A/i.test(question.context) && /Person B/i.test(question.context)).length >= 4, `${folder.name}/en.json: at least four priority-stage questions must compare two people directly.`);
    fail(handovers.length === 6 && handovers.every((question) => typeof question.context === "string" && /(handover|note|chart|detail)/i.test(question.context)), `${folder.name}/en.json: every Shift-Change Trap needs a visible handover, note, chart or detail context.`);
    fail(finalHandover.length === 6 && finalHandover.every((question) => question.reasoningSteps === 2 && typeof question.context === "string" && question.context.trim()), `${folder.name}/en.json: all six Final Handover questions need two visible clues and two-step reasoning.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: Nursing profile thresholds are incorrect.`);
    fail(source.results?.score?.showPercentage === true, `${folder.name}/en.json: Nursing must lead its result with the percentage.`);
    fail(config.engine?.rewarded?.attempts === 3, `${folder.name}: Nursing rewarded fallback must require three genuine unavailable attempts.`);
  }
  if (folder.name === "paramedic") {
    const expectedCategories = {
      anatomy_physiology: 10,
      observation_vitals: 10,
      numeracy_measurement: 10,
      scene_safety: 10,
      communication_handover: 10,
      reasoning_priorities: 10,
    };
    const counts = Object.fromEntries(Object.keys(expectedCategories).map((category) => [
      category,
      sourceQuestions.filter((question) => question.category === category).length,
    ]));
    const correctPositions = sourceQuestions.reduce((positions, question) => {
      positions[question.correct] = (positions[question.correct] ?? 0) + 1;
      return positions;
    }, Array(4).fill(0));
    const priorities = source.stages?.[6]?.questions ?? [];
    const sprint = source.stages?.[7]?.questions ?? [];
    const handovers = source.stages?.[8]?.questions ?? [];
    const finalResponse = source.stages?.[9]?.questions ?? [];
    const questionById = Object.fromEntries(sourceQuestions.map((question) => [question.id, question]));
    const visibleQuestionCopy = (question) => [
      question?.question,
      question?.context,
      ...(question?.answers ?? []),
      question?.explanation,
      ...(question?.visual?.items ?? []),
    ].filter(Boolean).join(" ");
    const sprintCopy = sprint.map(visibleQuestionCopy).join("\n");
    const liveElectricalScenarios = sourceQuestions.filter((question) => /(?:live electrical cable|cable is sparking|sparking electrical cable)/i.test(visibleQuestionCopy(question)));
    const prohibitedClinicalCopy = /\b(?:administer\w*|prescrib\w*|medication dose|dosage|intubat\w*|defibrillat\w*|CPR ratio|oxygen (?:flow|setting)|extricat\w*|reduce a fracture|perform a procedure|911|999|112)\b/i;
    const questionCopy = sourceQuestions.map((question) => [
      question.question,
      question.context,
      question.answers?.[question.correct],
      question.explanation,
      ...(question.visual?.items ?? []),
    ].filter(Boolean).join(" ")).join("\n");
    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), `${folder.name}: Paramedic must launch in English only.`);
    fail(config.engine?.scoring === "correct-answer", `${folder.name}: Paramedic must use correct-answer scoring.`);
    fail(source.title === "Only 8% Pass This Paramedic Entrance Exam", `${folder.name}/en.json: Paramedic title must match the approved headline.`);
    fail(source.landing?.intro === "From scene hazards and vital signs to emergency maths and calm communication, prove you can think clearly when every clue matters.", `${folder.name}/en.json: Paramedic landing intro changed.`);
    fail(source.landing?.socialProof === "81,000+ people played this" && source.landing?.cta === "Start Test", `${folder.name}/en.json: Paramedic landing social proof or CTA changed.`);
    fail(source.stages?.length === 10 && source.stages.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: Paramedic needs ten stages of six questions.`);
    fail(sourceQuestions.length === 60 && new Set(sourceQuestions.map((question) => question.id)).size === 60, `${folder.name}/en.json: Paramedic must contain 60 uniquely identified questions.`);
    fail(JSON.stringify(counts) === JSON.stringify(expectedCategories), `${folder.name}/en.json: Paramedic needs exactly ten questions in each entrance category.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4), `${folder.name}/en.json: every Paramedic question needs exactly four choices.`);
    fail(sourceQuestions.every((question) => question.answers.every((answer) => typeof answer === "string" && Boolean(answer.trim())) && new Set(question.answers).size === 4), `${folder.name}/en.json: Paramedic choices must be non-empty and unique within each question.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4), `${folder.name}/en.json: every Paramedic question needs one valid correct index.`);
    fail(JSON.stringify(correctPositions) === JSON.stringify([15, 15, 15, 15]), `${folder.name}/en.json: Paramedic correct-answer positions must be exactly 15 each across A–D.`);
    fail(sourceQuestions.every((question) => typeof question.explanation === "string" && Boolean(question.explanation.trim())), `${folder.name}/en.json: every Paramedic question needs a post-result explanation.`);
    fail(sourceQuestions.every((question) => !question.visual || (typeof question.visual.separator === "string" && Boolean(question.visual.separator.trim()))), `${folder.name}/en.json: every Paramedic visual needs a visible separator.`);
    fail(config.engine?.advanceDelayMs === 450, `${folder.name}: Paramedic default advancement must be exactly 450ms.`);
    fail(sprint.length === 6 && sprint.every((question) => question.delay === 350), `${folder.name}/en.json: every Rapid Response Sprint question must use 350ms.`);
    fail(sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}/en.json: at least five Rapid Response Sprint prompts must contain no more than ten words.`);
    fail(!/(?:which organ pumps blood|litres? equals|live (?:electrical )?cable|i['’]m scared)/i.test(sprintCopy), `${folder.name}/en.json: Rapid Response Sprint must not repeat the quiz's opening heart, litre-conversion, live-cable or fear prompts.`);
    fail(sourceQuestions.every((question) => sprint.includes(question) || question.delay === undefined), `${folder.name}/en.json: only Rapid Response Sprint may override the 450ms default.`);
    fail(liveElectricalScenarios.length <= 2, `${folder.name}/en.json: electrical-cable hazards must not be repeated across multiple stages.`);
    fail(questionById["paramedic-r3q6"]?.category === "reasoning_priorities" && !/(?:litres?|millilitres?|\bmL\b|convert|units?)/i.test(visibleQuestionCopy(questionById["paramedic-r3q6"])), `${folder.name}/en.json: R3Q6 must measure emergency reasoning rather than unit conversion.`);
    fail(!/(?:cable|electrical)/i.test(visibleQuestionCopy(questionById["paramedic-r8q5"])), `${folder.name}/en.json: the sprint safety item must use a distinct non-electrical hazard.`);
    fail(!/(?:cable|electrical)/i.test(visibleQuestionCopy(questionById["paramedic-r10q4"])), `${folder.name}/en.json: the final safety case must not repeat the opening electrical hazard.`);
    fail(priorities.length === 6 && priorities.every((question) => typeof question.context === "string" && question.context.split(/[.!?]+/).filter((clue) => clue.trim()).length >= 2), `${folder.name}/en.json: every priority-stage question needs at least two visible clues.`);
    fail(priorities.filter((question) => /Person A/i.test(question.context) && /Person B/i.test(question.context)).length >= 4, `${folder.name}/en.json: at least four priority-stage questions must compare two people directly.`);
    fail(handovers.length === 6 && handovers.every((question) => typeof question.context === "string" && /(handover|note|timeline|incident|record)/i.test(question.context)), `${folder.name}/en.json: every Handover Trapdoor needs a visible handover, note, timeline or incident record.`);
    fail(finalResponse.length === 6 && finalResponse.every((question) => question.reasoningSteps === 2 && typeof question.context === "string" && question.context.trim()), `${folder.name}/en.json: all six Final Response questions need visible context and two-step reasoning.`);
    fail(!prohibitedClinicalCopy.test(questionCopy), `${folder.name}/en.json: Paramedic questions must not teach treatment procedures, medication, emergency numbers or local protocol.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: Paramedic profile thresholds are incorrect.`);
    fail(source.results?.score?.showPercentage === true, `${folder.name}/en.json: Paramedic must lead its result with the percentage.`);
    fail(config.engine?.targetRatio === 0.8, `${folder.name}: Paramedic pass threshold must be 80%.`);
    fail(config.engine?.rewarded?.attempts === 3, `${folder.name}: Paramedic rewarded fallback must require three genuine unavailable attempts.`);
  }
  if (folder.name === "midwifery") {
    const expectedCategories = {
      pregnancy_physiology: 10,
      antenatal_wellbeing: 10,
      labour_birth: 10,
      newborn_care: 10,
      infection_safety: 10,
      communication_priorities: 10,
    };
    const counts = Object.fromEntries(Object.keys(expectedCategories).map((category) => [
      category,
      sourceQuestions.filter((question) => question.category === category).length,
    ]));
    const correctPositions = sourceQuestions.reduce((positions, question) => {
      positions[question.correct] = (positions[question.correct] ?? 0) + 1;
      return positions;
    }, Array(4).fill(0));
    const birthRoom = source.stages?.[5]?.questions ?? [];
    const sprint = source.stages?.[7]?.questions ?? [];
    const handovers = source.stages?.[8]?.questions ?? [];
    const finalHandover = source.stages?.[9]?.questions ?? [];
    const newbornQuestions = sourceQuestions.filter((question) => question.category === "newborn_care");
    const prohibitedBirthRoomLanguage = /\b(diagnos(?:e|is)|prescrib(?:e|ing)|administer|dosage|perform a procedure|procedural management)\b/i;
    const prohibitedNewbornLanguage = /\b(resuscitat\w*|ventilat\w*|intubat\w*|medication dosage|administer\w* medication|procedur(?:e|al) technique|diagnos(?:e|is)|local protocol)\b/i;
    const permittedNewbornThemes = /\b(newborn|baby|warm|heat|feed|breath|cord|skin-to-skin|parent|dry|hygiene|contact|colour|tone|movement|change)\b/i;
    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), `${folder.name}: Midwifery must launch in English only.`);
    fail(config.engine?.scoring === "correct-answer", `${folder.name}: Midwifery must use correct-answer scoring.`);
    fail(source.title === "Only 7% Pass This Midwifery Entrance Exam", `${folder.name}/en.json: Midwifery title must match the approved headline.`);
    fail(source.landing?.socialProof === "81,000+ people played this" && source.landing?.cta === "Start Quiz", `${folder.name}/en.json: Midwifery landing social proof or CTA changed.`);
    fail(source.stages?.length === 10 && source.stages.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: Midwifery needs ten stages of six questions.`);
    fail(sourceQuestions.length === 60 && new Set(sourceQuestions.map((question) => question.id)).size === 60, `${folder.name}/en.json: Midwifery must contain 60 uniquely identified questions.`);
    fail(JSON.stringify(counts) === JSON.stringify(expectedCategories), `${folder.name}/en.json: Midwifery needs exactly ten questions in each entrance category.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4), `${folder.name}/en.json: every Midwifery question needs exactly four choices.`);
    fail(sourceQuestions.every((question) => question.answers.every((answer) => typeof answer === "string" && Boolean(answer.trim())) && new Set(question.answers).size === 4), `${folder.name}/en.json: Midwifery choices must be non-empty and unique within each question.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4), `${folder.name}/en.json: every Midwifery question needs one valid correct index.`);
    fail(JSON.stringify(correctPositions) === JSON.stringify([15, 15, 15, 15]), `${folder.name}/en.json: Midwifery correct-answer positions must be exactly 15 each across A–D.`);
    fail(sourceQuestions.every((question) => typeof question.explanation === "string" && Boolean(question.explanation.trim())), `${folder.name}/en.json: every Midwifery question needs a post-result explanation.`);
    fail(config.engine?.advanceDelayMs === 450, `${folder.name}: Midwifery default advancement must be exactly 450ms.`);
    fail(sprint.length === 6 && sprint.every((question) => question.delay === 350), `${folder.name}/en.json: every Birth Centre Sprint question must use 350ms.`);
    fail(sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}/en.json: at least five Birth Centre Sprint prompts must contain no more than ten words.`);
    fail(sourceQuestions.every((question) => sprint.includes(question) || question.delay === undefined), `${folder.name}/en.json: only Birth Centre Sprint may override the 450ms default.`);
    fail(birthRoom.length === 6 && birthRoom.every((question) => typeof question.context === "string" && question.context.split(/[.!?]+/).filter((clue) => clue.trim()).length >= 2), `${folder.name}/en.json: every Birth Room Decision needs at least two visible clues.`);
    fail(birthRoom.every((question) => !prohibitedBirthRoomLanguage.test([question.question, question.answers[question.correct], question.explanation].join(" "))), `${folder.name}/en.json: Birth Room Decisions must test recognition, safety or escalation rather than diagnosis, treatment or procedural management.`);
    fail(newbornQuestions.length === 10 && newbornQuestions.every((question) => permittedNewbornThemes.test([question.question, question.answers[question.correct], question.explanation].join(" "))), `${folder.name}/en.json: newborn questions must stay within the approved worldwide entrance-level themes.`);
    fail(newbornQuestions.every((question) => !prohibitedNewbornLanguage.test([question.question, question.answers[question.correct], question.explanation].join(" "))), `${folder.name}/en.json: newborn questions must not require diagnosis, resuscitation, treatment selection or local protocols.`);
    fail(handovers.length === 6 && handovers.every((question) => typeof question.context === "string" && /(handover|note|chart|detail)/i.test(question.context)), `${folder.name}/en.json: every Shift-Handover Trap needs a visible handover, note, chart or detail context.`);
    fail(finalHandover.length === 6 && finalHandover.every((question) => question.reasoningSteps === 2 && typeof question.context === "string" && question.context.trim()), `${folder.name}/en.json: all six Final Birth Centre Handover questions need two visible clues and two-step reasoning.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: Midwifery profile thresholds are incorrect.`);
    fail(source.results?.score?.showPercentage === true, `${folder.name}/en.json: Midwifery must lead its result with the percentage.`);
    fail(config.engine?.rewarded?.attempts === 3, `${folder.name}: Midwifery rewarded fallback must require three genuine unavailable attempts.`);
  }
  if (folder.name === "idiom") {
    const targetMap = [
      ["break_the_ice", "break the ice"], ["piece_of_cake", "piece of cake"], ["under_the_weather", "under the weather"], ["spill_the_beans", "spill the beans"], ["raining_cats_and_dogs", "raining cats and dogs"], ["hit_the_nail_on_the_head", "hit the nail on the head"],
      ["on_the_same_page", "on the same page"], ["once_in_a_blue_moon", "once in a blue moon"], ["cost_an_arm_and_a_leg", "cost an arm and a leg"], ["burn_the_midnight_oil", "burn the midnight oil"], ["let_the_cat_out_of_the_bag", "let the cat out of the bag"], ["pull_someones_leg", "pull someone's leg"],
      ["walking_on_eggshells", "walking on eggshells"], ["keep_an_eye_on", "keep an eye on"], ["add_fuel_to_the_fire", "add fuel to the fire"], ["fish_out_of_water", "fish out of water"], ["elephant_in_the_room", "elephant in the room"], ["see_eye_to_eye", "see eye to eye"],
      ["back_to_square_one", "back to square one"], ["call_it_a_day", "call it a day"], ["go_the_extra_mile", "go the extra mile"], ["get_the_ball_rolling", "get the ball rolling"], ["read_the_room", "read the room"], ["sit_on_the_fence", "sit on the fence"],
      ["blessing_in_disguise", "blessing in disguise"], ["silver_lining", "silver lining"], ["tip_of_the_iceberg", "tip of the iceberg"], ["through_thick_and_thin", "through thick and thin"], ["up_in_the_air", "up in the air"], ["not_my_cup_of_tea", "not my cup of tea"],
      ["beat_around_the_bush", "beat around the bush"], ["dont_judge_a_book_by_its_cover", "don't judge a book by its cover"], ["easier_said_than_done", "easier said than done"], ["hang_in_there", "hang in there"], ["no_hard_feelings", "no hard feelings"], ["benefit_of_the_doubt", "benefit of the doubt"],
      ["miss_the_boat", "miss the boat"], ["break_a_leg", "break a leg"], ["head_in_the_clouds", "head in the clouds"], ["barking_up_the_wrong_tree", "barking up the wrong tree"], ["jump_on_the_bandwagon", "jump on the bandwagon"], ["cross_that_bridge_when_we_come_to_it", "cross that bridge when we come to it"],
      ["the_ball_is_in_your_court", "the ball is in your court"], ["better_late_than_never", "better late than never"], ["keep_your_chin_up", "keep your chin up"], ["i_wouldnt_hold_my_breath", "i wouldn't hold my breath"], ["time_flies", "time flies"], ["cut_to_the_chase", "cut to the chase"],
      ["take_the_bull_by_the_horns", "take the bull by the horns"], ["the_best_of_both_worlds", "the best of both worlds"], ["the_last_straw", "the last straw"], ["two_sides_of_the_same_coin", "two sides of the same coin"], ["water_under_the_bridge", "water under the bridge"], ["throw_in_the_towel", "throw in the towel"],
      ["move_the_goalposts", "move the goalposts"], ["the_calm_before_the_storm", "the calm before the storm"], ["leave_no_stone_unturned", "leave no stone unturned"], ["the_writing_is_on_the_wall", "the writing is on the wall"], ["open_a_can_of_worms", "open a can of worms"], ["needle_in_a_haystack", "needle in a haystack"],
    ];
    const expectedCategories = Object.fromEntries([
      "meaning_interpretation", "phrase_completion", "context_usage", "tone_intent", "visual_metaphor", "precision_correction",
    ].map((category) => [category, 10]));
    const counts = Object.fromEntries(Object.keys(expectedCategories).map((category) => [category, sourceQuestions.filter((question) => question.category === category).length]));
    const correctPositions = sourceQuestions.reduce((positions, question) => {
      positions[question.correct] = (positions[question.correct] ?? 0) + 1;
      return positions;
    }, Array(4).fill(0));
    const normalizePhrase = (value) => String(value ?? "")
      .toLowerCase()
      .normalize("NFKC")
      .replace(/[‘’]/g, "'")
      .replace(/[^a-z0-9']+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
    const visibleQuestionText = (question) => [
      question.question,
      question.context,
      question.explanation,
      ...(question.answers ?? []),
      ...(question.visual?.items ?? []),
    ].map(normalizePhrase).filter(Boolean).join(" | ");
    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), `${folder.name}: Idiom must launch in English only.`);
    fail(config.engine?.scoring === "correct-answer" && config.engine?.targetRatio === .8, `${folder.name}: Idiom must use correct-answer scoring and the 80% ace threshold.`);
    fail(source.title === "Only 5% Of Adults Can Ace This Idiom Quiz", `${folder.name}/en.json: Idiom title must match the approved headline.`);
    fail(source.landing?.socialProof === "81,000+ people played this" && source.landing?.cta === "Start Quiz", `${folder.name}/en.json: Idiom landing social proof or CTA changed.`);
    fail(source.stages?.length === 10 && source.stages.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: Idiom needs ten rounds of six questions.`);
    fail(sourceQuestions.length === 60 && new Set(sourceQuestions.map((question) => question.id)).size === 60, `${folder.name}/en.json: Idiom must contain 60 uniquely identified questions.`);
    fail(JSON.stringify(counts) === JSON.stringify(expectedCategories), `${folder.name}/en.json: Idiom needs exactly ten questions in every language-skill category.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4 && question.answers.every((answer) => typeof answer === "string" && answer.trim()) && new Set(question.answers).size === 4), `${folder.name}/en.json: every Idiom question needs four unique non-empty choices.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4), `${folder.name}/en.json: every Idiom question needs one valid correct index.`);
    const iconQuestions = sourceQuestions.filter((question) => question.presentation === "icons");
    fail(iconQuestions.every((question) => Array.isArray(question.icons) && question.icons.length === question.answers.length && question.icons.every((icon) => typeof icon === "string" && icon.trim() && !/^[○●◯□■◇◆△▲▽▼?]+$/u.test(icon.trim()))), `${folder.name}/en.json: icon answers need genuine aligned emoji rather than placeholder geometry.`);
    const expectedIconSets = {
      "idiom-r2q5": ["📦", "🧺", "👜", "🎩"],
      "idiom-r3q1": ["🏃", "🤫", "🍳", "🥚"],
      "idiom-r3q4": ["🐦", "🐢", "🐟", "🦀"],
      "idiom-r3q5": ["💡", "🐘", "🚪", "✅"],
    };
    for (const [id, icons] of Object.entries(expectedIconSets)) fail(JSON.stringify(sourceQuestions.find((question) => question.id === id)?.icons) === JSON.stringify(icons), `${folder.name}/en.json: ${id} icon meanings are misaligned with their answers.`);
    fail(JSON.stringify(correctPositions) === JSON.stringify([15, 15, 15, 15]), `${folder.name}/en.json: Idiom correct-answer positions must be exactly 15 each across A–D.`);
    fail(sourceQuestions.every((question) => typeof question.explanation === "string" && question.explanation.trim()), `${folder.name}/en.json: every Idiom question needs a post-result explanation.`);
    fail(sourceQuestions.every((question) => !question.visual || (typeof question.visual.separator === "string" && question.visual.separator.trim() && typeof question.visual.ariaLabel === "string" && question.visual.ariaLabel.trim())), `${folder.name}/en.json: every Idiom visual needs a visible separator and accessible label.`);
    fail(JSON.stringify(sourceQuestions.map((question) => question.targetIdiom)) === JSON.stringify(targetMap.map(([id]) => id)), `${folder.name}/en.json: targetIdiom order must exactly match the locked 60-phrase inventory.`);
    fail(new Set(sourceQuestions.map((question) => question.targetIdiom)).size === 60, `${folder.name}/en.json: every targetIdiom must appear exactly once.`);
    targetMap.forEach(([id, canonical], targetIndex) => {
      const canonicalText = normalizePhrase(canonical);
      const ownText = visibleQuestionText(sourceQuestions[targetIndex]);
      fail(ownText.includes(canonicalText), `${folder.name}/en.json: ${id} must expose its canonical English phrase in its own question or explanation.`);
      sourceQuestions.forEach((question, questionIndex) => {
        if (questionIndex === targetIndex) return;
        fail(!(question.answers ?? []).some((answer) => normalizePhrase(answer).includes(canonicalText)), `${folder.name}/en.json: ${id} leaks into another question's answer choices.`);
        if (questionIndex < targetIndex) fail(!visibleQuestionText(question).includes(canonicalText), `${folder.name}/en.json: future target ${id} is exposed before its scored question.`);
      });
    });
    const sprint = source.stages?.[7]?.questions ?? [];
    fail(config.engine?.advanceDelayMs === 450, `${folder.name}: Idiom default advancement must be exactly 450ms.`);
    fail(sprint.length === 6 && sprint.every((question) => question.delay === 350), `${folder.name}/en.json: every Phrase Flash question must use 350ms.`);
    fail(sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}/en.json: at least five Phrase Flash prompts must contain no more than ten words.`);
    fail(sourceQuestions.every((question) => sprint.includes(question) || question.delay === undefined), `${folder.name}/en.json: only Phrase Flash may override the 450ms default.`);
    const trapdoor = source.stages?.[8]?.questions ?? [];
    trapdoor.forEach((question) => {
      const correctTokens = normalizePhrase(question.answers[question.correct]).split(" ");
      question.answers.forEach((answer, answerIndex) => {
        if (answerIndex === question.correct) return;
        const answerTokens = normalizePhrase(answer).split(" ");
        const differences = correctTokens.reduce((total, token, index) => total + Number(answerTokens[index] !== token), Math.abs(answerTokens.length - correctTokens.length));
        fail(differences === 1, `${folder.name}/en.json: ${question.id} distractor ${answerIndex + 1} must contain exactly one lexical error.`);
      });
    });
    const finalRound = source.stages?.[9]?.questions ?? [];
    fail(finalRound.filter((question) => question.reasoningSteps >= 2 && typeof question.context === "string" && question.context.trim()).length >= 4, `${folder.name}/en.json: The Last Word needs at least four two-clue questions.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: Idiom profile thresholds are incorrect.`);
    fail(source.results?.score?.showPercentage === true, `${folder.name}/en.json: Idiom must lead its result with the percentage.`);
    fail(config.engine?.rewarded?.attempts === 3, `${folder.name}: Idiom rewarded fallback must require three genuine unavailable attempts.`);
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
  if (folder.name === "vision") {
    const expectedCategories = Object.fromEntries([
      "colour_contrast", "detail_detection", "pattern_tracking", "spatial_orientation", "visual_memory", "attention_control",
    ].map((category) => [category, 10]));
    const counts = Object.fromEntries(Object.keys(expectedCategories).map((category) => [category, sourceQuestions.filter((question) => question.category === category).length]));
    const correctPositions = sourceQuestions.reduce((positions, question) => {
      positions[question.correct] = (positions[question.correct] ?? 0) + 1;
      return positions;
    }, Array(4).fill(0));
    const sprint = source.stages?.[7]?.questions ?? [];
    const trapdoors = source.stages?.[8]?.questions ?? [];
    const finalFocus = source.stages?.[9]?.questions ?? [];
    const categoryOrder = Object.keys(expectedCategories);
    const firstSevenQuestions = source.stages?.slice(0, 7).flatMap((stage) => stage.questions) ?? [];
    const colourQuestions = sourceQuestions.filter((question) => question.category === "colour_contrast");

    fail(JSON.stringify(localeFiles) === JSON.stringify(["en.json"]), `${folder.name}: Vision must launch in English only.`);
    fail(config.engine?.scoring === "correct-answer", `${folder.name}: Vision must use correct-answer scoring.`);
    fail(source.title === "Only 7% Can Pass This Vision Test", `${folder.name}/en.json: Vision title must match the approved headline.`);
    fail(source.landing?.socialProof === "81,000+ people played this" && source.landing?.cta === "Start Test", `${folder.name}/en.json: Vision landing proof or CTA changed.`);
    fail(source.stages?.length === 10 && source.stages.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: Vision needs ten rounds of six questions.`);
    fail(sourceQuestions.length === 60 && new Set(sourceQuestionIds).size === 60, `${folder.name}/en.json: Vision needs 60 unique scored questions.`);
    fail(JSON.stringify(counts) === JSON.stringify(expectedCategories), `${folder.name}/en.json: Vision needs exactly ten questions in every visual-skill category.`);
    fail(sourceQuestions.every((question) => Array.isArray(question.answers) && question.answers.length === 4 && question.answers.every((answer) => typeof answer === "string" && answer.trim()) && new Set(question.answers).size === 4), `${folder.name}/en.json: every Vision question needs four unique non-empty choices.`);
    fail(sourceQuestions.every((question) => Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4), `${folder.name}/en.json: every Vision question needs one valid correct index.`);
    fail(JSON.stringify(correctPositions) === JSON.stringify([15, 15, 15, 15]), `${folder.name}/en.json: Vision correct positions must be exactly 15/15/15/15.`);
    const answerSequence = sourceQuestions.map((question) => question.correct);
    const repeatsWithPeriod = (period) => answerSequence.every((answer, index) => index < period || answer === answerSequence[index - period]);
    fail(!Array.from({ length: 14 }, (_, index) => index + 2).some(repeatsWithPeriod), `${folder.name}/en.json: Vision correct positions must not repeat a predictable source pattern.`);
    fail(source.stages.every((stage) => new Set(stage.questions.map((question) => question.correct)).size >= 3), `${folder.name}/en.json: every Vision round needs varied correct-answer positions.`);
    fail(sourceQuestions.every((question) => typeof question.explanation === "string" && question.explanation.trim()), `${folder.name}/en.json: every Vision question needs a post-result explanation.`);
    fail(categoryOrder.every((category) => firstSevenQuestions.filter((question) => question.category === category).length === 7), `${folder.name}/en.json: every visual skill must reach seven questions after Round 7.`);
    fail(colourQuestions.every((question) => question.presentation === "icons" || question.visual), `${folder.name}/en.json: every Colour Contrast question must use visible swatches or a visual panel.`);
    fail(colourQuestions.every((question) => !/(comes next|same colour order|step 4|repeating sequence)/i.test(`${question.question} ${question.context ?? ""}`)), `${folder.name}/en.json: Colour Contrast must test colour perception rather than sequence or order tracking.`);
    for (const stage of [7, 8, 9]) fail(source.stages[stage].questions.map((question) => question.category).sort().join("|") === [...categoryOrder].sort().join("|"), `${folder.name}/en.json: Vision round ${stage + 1} needs one question from every category.`);
    fail(config.engine?.advanceDelayMs === 450, `${folder.name}: Vision default advancement must be 450ms.`);
    fail(sprint.length === 6 && sprint.every((question) => question.delay === 350), `${folder.name}/en.json: every Focus Sprint question must use 350ms.`);
    fail(sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}/en.json: at least five Focus Sprint prompts must contain no more than ten words.`);
    fail(sprint.every((question) => question.visual || question.study || question.icons || question.context), `${folder.name}/en.json: every Focus Sprint question needs a genuine visible clue.`);
    fail(sourceQuestions.find((question) => question.id === "vision-r4q4")?.visual?.ariaLabel === "Explicit circle-size sequence", `${folder.name}/en.json: the size sequence must use fixed CSS circles.`);
    fail(sourceQuestions.find((question) => question.id === "vision-r9q1")?.visual?.ariaLabel === "Simultaneous contrast panels", `${folder.name}/en.json: the contrast illusion must use fixed CSS panels.`);
    fail(sourceQuestions.every((question) => sprint.includes(question) || question.delay === undefined), `${folder.name}/en.json: only Focus Sprint may override the 450ms default.`);
    fail(trapdoors.every((question) => (typeof question.context === "string" && question.context.trim()) || question.visual || question.study), `${folder.name}/en.json: every Optical Trapdoor needs a visible comparison, pattern or snapshot.`);
    fail(finalFocus.length === 6 && finalFocus.every((question) => question.reasoningSteps === 2 && ((typeof question.context === "string" && question.context.trim()) || question.visual || question.study)), `${folder.name}/en.json: Final Focus needs six visible two-step questions.`);
    fail(JSON.stringify(source.results?.profiles?.map((profile) => profile.min)) === JSON.stringify([0.9, 0.8, 0.7, 0.6, 0.5, 0]), `${folder.name}/en.json: Vision result thresholds are incomplete.`);
    fail(source.results?.score?.showPercentage === true && config.engine?.targetRatio === 0.8, `${folder.name}: Vision must lead with percentage and use the 80% challenge line.`);
    fail(/not an eye examination/i.test(source.about?.disclaimer ?? "") && /cannot diagnose/i.test(source.about?.disclaimer ?? ""), `${folder.name}/en.json: Vision needs an explicit entertainment-only medical boundary.`);
    fail(config.engine?.rewarded?.attempts === 3, `${folder.name}: Vision rewarded fallback must require three genuine unavailable attempts.`);
  }
  if (folder.name === "university") {
    const expectedCategories = Object.fromEntries([
      "verbal_reasoning", "numerical_reasoning", "scientific_reasoning", "critical_thinking", "worldwide_knowledge", "practical_problem_solving",
    ].map((category) => [category, 10]));
    const counts = Object.fromEntries(Object.keys(expectedCategories).map((category) => [category, sourceQuestions.filter((question) => question.category === category).length]));
    const scored = sourceQuestions.filter((question) => Number.isInteger(question.correct));
    const fit = sourceQuestions.filter((question) => question.correct === undefined);
    fail(JSON.stringify(localeFiles) === JSON.stringify(["de.json", "en.json", "es.json", "fr.json", "it.json", "nl.json", "pt.json"]), `${folder.name}: University must support the complete seven-locale set.`);
    fail(config.engine?.scoring === "hybrid-match", `${folder.name}: University must use generic hybrid-match scoring.`);
    fail(source.stages?.length === 10 && source.stages.every((stage) => stage.questions?.length === 6), `${folder.name}: University needs ten rounds of six interactions.`);
    fail(sourceQuestions.length === 60 && scored.length === 60 && fit.length === 0, `${folder.name}: University needs 60 scored entrance-exam questions and no preference decisions.`);
    fail(JSON.stringify(counts) === JSON.stringify(expectedCategories), `${folder.name}: every academic category must appear exactly ten times.`);
    fail(scored.every((question) => Array.isArray(question.answers) && question.answers.length === 4 && question.correct >= 0 && question.correct < question.answers.length && typeof question.explanation === "string" && question.explanation.trim()), `${folder.name}: every entrance question needs four choices, one valid answer and an explanation.`);
    const correctPositionCounts = scored.reduce((counts, question) => {
      counts[question.correct] = (counts[question.correct] ?? 0) + 1;
      return counts;
    }, Array(4).fill(0));
    fail(correctPositionCounts.every((count) => count === 15), `${folder.name}: correct-answer positions must be exactly balanced 15/15/15/15.`);
    const categoryOrder = Object.keys(expectedCategories);
    fail(source.stages[0].questions.map((question) => question.category).join("|") === categoryOrder.join("|"), `${folder.name}: Admissions Warm-Up must contain one question from every category in fixed order.`);
    for (let stage = 1; stage <= 6; stage += 1) fail(source.stages[stage].questions.every((question) => question.category === categoryOrder[stage - 1]), `${folder.name}: dedicated exam stage ${stage + 1} has mixed categories.`);
    for (const stage of [7, 8, 9]) fail(source.stages[stage].questions.map((question) => question.category).sort().join("|") === [...categoryOrder].sort().join("|"), `${folder.name}: exam stage ${stage + 1} needs one question from every category.`);
    const sprint = source.stages[7].questions;
    fail(sprint.every((question) => question.delay === 350) && sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}: Global Campus Sprint needs six 350ms compact prompts.`);
    fail(sourceQuestions.every((question) => sprint.includes(question) || question.delay === undefined), `${folder.name}: only Global Campus Sprint may override the 450ms default.`);
    fail(source.stages[8].questions.every((question) => typeof question.context === "string" && question.context.trim()), `${folder.name}: every Entrance Exam Trapdoor needs visible context.`);
    fail(source.stages[9].questions.every((question) => question.reasoningSteps === 2), `${folder.name}: Final Admissions Board needs six two-step scored questions.`);
    fail(config.engine?.advanceDelayMs === 450 && config.engine?.rewarded?.attempts === 3, `${folder.name}: University timing and rewarded fallback configuration are incorrect.`);
    fail(config.engine?.match?.academicWeight === 1 && config.engine?.match?.styleWeight === 0, `${folder.name}: University matching must use academic performance only.`);
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
    if (folder.name === "iq") fail(/\b10\b/.test(localized.landing?.intro ?? ""), `${folder.name}/${localeFile}: IQ landing intro must use numeral 10.`);
    if (folder.name === "iq") {
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
    fail(JSON.stringify((localized.results?.dimensions ?? []).map((dimension) => dimension.categories)) === JSON.stringify((source.results?.dimensions ?? []).map((dimension) => dimension.categories)), `${folder.name}/${localeFile}: internal result dimension category IDs differ from English.`);
    fail((localized.stages ?? []).length === (source.stages ?? []).length, `${folder.name}/${localeFile}: stage count differs from English.`);
    fail(questions.length === sourceQuestions.length, `${folder.name}/${localeFile}: question count differs from English.`);
    questions.forEach((question, index) => {
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
