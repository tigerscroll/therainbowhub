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

const requiredUiKeys = [
  "locale.direction", "locale.code", "locale.name", "locale.switcherLabel",
  "site.name", "nav.home", "nav.quickLinks",
  "quiz.startTest", "quiz.question", "quiz.questions", "quiz.continue",
  "quiz.profile", "quiz.finalScore", "quiz.restartTest", "quiz.answered", "quiz.round", "quiz.of",
  "quiz.aboutTitle",
  "results.complete", "results.stageComplete", "results.viewResults", "results.nextStage", "results.startStage",
  "ad.beforeTitle", "ad.stepOne", "ad.stepTwo", "ad.loading", "ad.retryUnavailable", "ad.startNote",
];

for (const locale of supportedLocales) {
  const ui = read(path.join(process.cwd(), "data", "i18n", `${locale}.json`));
  if (!ui) continue;
  fail(ui.locale?.code === locale, `data/i18n/${locale}.json: locale.code must match the filename.`);
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
  fail(config.engine?.flow && config.engine?.scoring, `${folder.name}: quiz.json needs engine flow and scoring.`);
  if (config.engine?.targetRatio !== undefined) fail(config.engine.targetRatio > 0 && config.engine.targetRatio <= 1, `${folder.name}: targetRatio must be greater than zero and no more than one.`);
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
  fail(Boolean(source.title && source.summary), `${folder.name}/en.json: title and summary are required.`);
  fail(sourceQuestions.length > 0, `${folder.name}/en.json: at least one question is required.`);
  if (folder.name === "years-left") {
    fail(source.stages?.length === 10, `${folder.name}/en.json: Years Left must contain ten rounds.`);
    fail(source.stages?.every((stage) => stage.questions?.length === 6), `${folder.name}/en.json: every Years Left round must contain six interactions.`);
    fail(config.engine?.advanceDelayMs >= 200 && config.engine?.advanceDelayMs <= 350, `${folder.name}: default advance delay must be 200–350ms.`);
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

  for (const localeFile of localeFiles) {
    const localized = read(path.join(directory, localeFile));
    if (!localized) continue;
    const questions = (localized.stages ?? []).flatMap((stage) => stage.questions ?? []);
    if (config.engine?.checkpoint === "ai") {
      fail(localized.checkpoint?.reveals?.length === localized.stages?.length, `${folder.name}/${localeFile}: checkpoint reveals must match stage count.`);
      fail(localized.checkpoint?.finalChecklist?.length === 6, `${folder.name}/${localeFile}: final checklist must contain six items.`);
    }
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
