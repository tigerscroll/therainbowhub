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
  if (folder.name === "university") {
    const expectedCategories = Object.fromEntries([
      "verbal_reasoning", "numerical_reasoning", "scientific_reasoning", "critical_thinking", "worldwide_knowledge", "practical_problem_solving",
    ].map((category) => [category, 7]));
    const counts = Object.fromEntries(Object.keys(expectedCategories).map((category) => [category, sourceQuestions.filter((question) => question.category === category).length]));
    const scored = sourceQuestions.filter((question) => Number.isInteger(question.correct));
    const fit = sourceQuestions.filter((question) => question.correct === undefined);
    const traits = new Set(config.engine?.match?.traits ?? []);
    fail(JSON.stringify(localeFiles) === JSON.stringify(["de.json", "en.json", "es.json", "fr.json", "it.json", "nl.json", "pt.json"]), `${folder.name}: University must support the complete seven-locale set.`);
    fail(config.engine?.scoring === "hybrid-match", `${folder.name}: University must use generic hybrid-match scoring.`);
    fail(source.stages?.length === 10 && source.stages.every((stage) => stage.questions?.length === 6), `${folder.name}: University needs ten rounds of six interactions.`);
    fail(sourceQuestions.length === 60 && scored.length === 42 && fit.length === 18, `${folder.name}: University needs 42 scored challenges and 18 fit decisions.`);
    fail(JSON.stringify(counts) === JSON.stringify(expectedCategories), `${folder.name}: every academic category must appear exactly seven times.`);
    fail(scored.every((question) => Array.isArray(question.answers) && question.answers.length >= 3 && question.answers.length <= 5 && question.correct >= 0 && question.correct < question.answers.length), `${folder.name}: scored challenges need 3–5 choices and one valid answer.`);
    const correctPositionCounts = scored.reduce((counts, question) => {
      counts[question.correct] = (counts[question.correct] ?? 0) + 1;
      return counts;
    }, Array(4).fill(0));
    fail(correctPositionCounts.every((count) => count >= 9 && count <= 11), `${folder.name}: correct-answer positions must remain balanced across A–D.`);
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
    fail(Object.values(primaryExposure).every((count) => count >= 9 && count <= 15), `${folder.name}: primary learning-style opportunities must remain balanced.`);
    fail(Object.values(traitMass).every((mass) => mass / totalTraitMass >= .14 && mass / totalTraitMass <= .19), `${folder.name}: total learning-style scoring mass must remain balanced.`);
    const sprint = source.stages[7].questions;
    fail(sprint.every((question) => question.delay === 350) && sprint.filter((question) => question.question.trim().split(/\s+/).length <= 10).length >= 5, `${folder.name}: Global Campus Sprint needs six 350ms compact prompts.`);
    fail(sourceQuestions.every((question) => sprint.includes(question) || question.delay === undefined), `${folder.name}: only Global Campus Sprint may override the 450ms default.`);
    fail(source.stages[9].questions.filter((question) => question.correct !== undefined && question.reasoningSteps >= 2).length >= 3, `${folder.name}: Final Admissions Board needs at least three two-step scored questions.`);
    fail(config.engine?.advanceDelayMs === 450 && config.engine?.rewarded?.attempts === 3, `${folder.name}: University timing and rewarded fallback configuration are incorrect.`);
    fail(config.engine?.match?.academicWeight === .55 && config.engine?.match?.styleWeight === .45, `${folder.name}: University match blend must be 55% academic and 45% style.`);
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
