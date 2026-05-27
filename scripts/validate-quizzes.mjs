import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const quizDir = path.join(rootDir, "data", "quizzes");
const i18nDir = path.join(rootDir, "data", "i18n");
const publicDir = path.join(rootDir, "public");
const defaultLocale = "en";
const skippedQuizDirs = new Set(["example-template"]);
const difficultyValues = new Set(["Quick", "Medium", "Hard", "Expert"]);

const errors = [];
const warnings = [];
const checked = [];

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    addError(`${relative(filePath)}: invalid JSON (${error.message})`);
    return undefined;
  }
}

function relative(filePath) {
  return path.relative(rootDir, filePath);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, field, fileName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    addError(`${fileName}: "${field}" must be a non-empty string.`);
    return false;
  }

  return true;
}

function requireStringArray(value, field, fileName) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string" || item.trim().length === 0)) {
    addError(`${fileName}: "${field}" must be a non-empty string array.`);
    return false;
  }

  return true;
}

function validateHomepage(homepage, fileName, options) {
  if (!isObject(homepage)) {
    addError(`${fileName}: "homepage" must be an object.`);
    return;
  }

  ["title", "summary", "thumbnailUrl", "thumbnailAlt", "icon", "gradient"].forEach((field) => {
    requireString(homepage[field], `homepage.${field}`, fileName);
  });

  if (typeof homepage.featured !== "boolean") {
    addError(`${fileName}: "homepage.featured" must be true or false.`);
  }

  if (!options.isTemplate && typeof homepage.thumbnailUrl === "string" && homepage.thumbnailUrl.startsWith("/")) {
    const thumbnailPath = path.join(publicDir, homepage.thumbnailUrl);

    if (!fs.existsSync(thumbnailPath)) {
      addError(`${fileName}: "homepage.thumbnailUrl" points to missing file "${homepage.thumbnailUrl}".`);
    }
  }
}

function validateInfoPanel(infoPanel, fileName) {
  if (!isObject(infoPanel)) {
    addError(`${fileName}: "infoPanel" must be an object.`);
    return;
  }

  ["title", "intro", "footerTitle", "footerBody"].forEach((field) => {
    requireString(infoPanel[field], `infoPanel.${field}`, fileName);
  });

  if (!Array.isArray(infoPanel.columns) || infoPanel.columns.length === 0) {
    addError(`${fileName}: "infoPanel.columns" must be a non-empty array.`);
    return;
  }

  infoPanel.columns.forEach((column, index) => {
    if (!isObject(column)) {
      addError(`${fileName}: "infoPanel.columns[${index}]" must be an object.`);
      return;
    }

    requireString(column.title, `infoPanel.columns[${index}].title`, fileName);
    requireString(column.body, `infoPanel.columns[${index}].body`, fileName);
  });
}

function validateLanding(landing, fileName) {
  if (!isObject(landing)) {
    addError(`${fileName}: "landing" must be an object.`);
    return;
  }

  ["quickStartText", "challengeText", "socialProof"].forEach((field) => {
    requireString(landing[field], `landing.${field}`, fileName);
  });
}

function validateResult(result, fileName) {
  if (!isObject(result)) {
    addError(`${fileName}: "result" must be an object.`);
    return { profiles: [], scoreDimensions: [] };
  }

  requireString(result.profileName, "result.profileName", fileName);

  const profiles = Array.isArray(result.profiles) ? result.profiles : [];

  if (!profiles.length) {
    addError(`${fileName}: "result.profiles" must be a non-empty array.`);
  }

  profiles.forEach((profile, index) => {
    if (!isObject(profile)) {
      addError(`${fileName}: "result.profiles[${index}]" must be an object.`);
      return;
    }

    if (typeof profile.minRatio !== "number" || profile.minRatio < 0 || profile.minRatio > 1) {
      addError(`${fileName}: "result.profiles[${index}].minRatio" must be a number from 0 to 1.`);
    }

    ["tier", "title", "copy", "percentile"].forEach((field) => {
      requireString(profile[field], `result.profiles[${index}].${field}`, fileName);
    });
  });

  if (!profiles.some((profile) => isObject(profile) && profile.minRatio === 0)) {
    addError(`${fileName}: "result.profiles" must include a fallback profile with "minRatio": 0.`);
  }

  const scoreDimensions = Array.isArray(result.scoreDimensions) ? result.scoreDimensions : [];

  if (!scoreDimensions.length) {
    addError(`${fileName}: "result.scoreDimensions" must be a non-empty array.`);
  }

  scoreDimensions.forEach((dimension, index) => {
    if (!isObject(dimension)) {
      addError(`${fileName}: "result.scoreDimensions[${index}]" must be an object.`);
      return;
    }

    requireString(dimension.label, `result.scoreDimensions[${index}].label`, fileName);
    requireStringArray(dimension.categories, `result.scoreDimensions[${index}].categories`, fileName);
  });

  return { profiles, scoreDimensions };
}

function validateQuestion(question, fileName, questionPath, stageIndex) {
  if (!isObject(question)) {
    addError(`${fileName}: "${questionPath}" must be an object.`);
    return undefined;
  }

  requireString(question.prompt, `${questionPath}.prompt`, fileName);

  if (!Array.isArray(question.choices) || question.choices.length < 2) {
    addError(`${fileName}: "${questionPath}.choices" must contain at least two answers.`);
  } else {
    question.choices.forEach((choice, index) => {
      requireString(choice, `${questionPath}.choices[${index}]`, fileName);
    });
  }

  if (!Number.isInteger(question.answerIndex) || question.answerIndex < 0 || question.answerIndex >= (question.choices?.length ?? 0)) {
    addError(`${fileName}: "${questionPath}.answerIndex" must point to one of the choices.`);
  }

  requireString(question.explanation, `${questionPath}.explanation`, fileName);
  requireString(question.category, `${questionPath}.category`, fileName);

  if (question.visual !== undefined && typeof question.visual !== "string") {
    addError(`${fileName}: "${questionPath}.visual" must be a string when provided.`);
  }

  if (question.stage !== undefined && question.stage !== stageIndex) {
    addError(`${fileName}: "${questionPath}.stage" must be omitted or match its containing stage index (${stageIndex}).`);
  }

  return {
    ...question,
    stage: stageIndex,
  };
}

function validateStageGroups(stageGroups, fileName) {
  if (!Array.isArray(stageGroups) || stageGroups.length === 0) {
    addError(`${fileName}: "stageGroups" must be a non-empty array.`);
    return { stages: [], encouragement: [], questions: [], stageSizes: [] };
  }

  const stages = [];
  const encouragement = [];
  const questions = [];
  const stageSizes = [];

  stageGroups.forEach((stage, stageIndex) => {
    if (!isObject(stage)) {
      addError(`${fileName}: "stageGroups[${stageIndex}]" must be an object.`);
      return;
    }

    requireString(stage.title, `stageGroups[${stageIndex}].title`, fileName);
    stages.push(stage.title);

    if (stageIndex < stageGroups.length - 1) {
      requireString(stage.encouragement, `stageGroups[${stageIndex}].encouragement`, fileName);
      encouragement.push(stage.encouragement);
    } else if (stage.encouragement !== undefined && typeof stage.encouragement !== "string") {
      addError(`${fileName}: "stageGroups[${stageIndex}].encouragement" must be a string when provided.`);
    }

    if (!Array.isArray(stage.questions) || stage.questions.length === 0) {
      addError(`${fileName}: "stageGroups[${stageIndex}].questions" must be a non-empty array.`);
      stageSizes.push(0);
      return;
    }

    stageSizes.push(stage.questions.length);
    stage.questions.forEach((question, questionIndex) => {
      const validatedQuestion = validateQuestion(question, fileName, `stageGroups[${stageIndex}].questions[${questionIndex}]`, stageIndex);

      if (validatedQuestion) {
        questions.push(validatedQuestion);
      }
    });
  });

  return { stages, encouragement, questions, stageSizes };
}

function validateQuizFile(filePath, options = {}) {
  const fileName = relative(filePath);
  const quiz = readJson(filePath);

  if (!quiz) {
    return undefined;
  }

  if (!isObject(quiz)) {
    addError(`${fileName}: quiz file must contain a JSON object.`);
    return undefined;
  }

  [
    "slug",
    "title",
    "seoTitle",
    "seoDescription",
    "pageTitle",
    "eyebrow",
    "summary",
    "duration",
    "passRate",
    "cardIcon",
    "cardGradient",
    "accent",
  ].forEach((field) => {
    requireString(quiz[field], field, fileName);
  });

  if (typeof quiz.difficulty !== "string" || !difficultyValues.has(quiz.difficulty)) {
    addError(`${fileName}: "difficulty" must be one of Quick, Medium, Hard, or Expert.`);
  }

  if (quiz.questionCount !== undefined && (!Number.isInteger(quiz.questionCount) || quiz.questionCount < 1)) {
    addError(`${fileName}: "questionCount" must be a positive integer when provided.`);
  }

  validateHomepage(quiz.homepage, fileName, options);
  validateLanding(quiz.landing, fileName);
  validateInfoPanel(quiz.infoPanel, fileName);

  if (quiz.stageGroups === undefined) {
    addError(`${fileName}: use "stageGroups" so each quiz is self-contained and easy to translate.`);
  }

  const { stages, encouragement, questions, stageSizes } = validateStageGroups(quiz.stageGroups, fileName);
  const { profiles, scoreDimensions } = validateResult(quiz.result, fileName);

  if (quiz.questionCount !== undefined && quiz.questionCount !== questions.length) {
    addError(`${fileName}: "questionCount" is ${quiz.questionCount}, but the file contains ${questions.length} questions.`);
  }

  if (encouragement.length !== Math.max(0, stages.length - 1)) {
    addError(`${fileName}: every non-final stage needs one "encouragement" string.`);
  }

  const uniqueStageSizes = new Set(stageSizes.filter(Boolean));
  if (uniqueStageSizes.size > 1) {
    addWarning(`${fileName}: stage sizes are uneven (${stageSizes.join(", ")}). This works, but uniform stages usually feel better.`);
  }

  const promptCounts = new Map();
  questions.forEach((question) => {
    if (typeof question.prompt === "string") {
      promptCounts.set(question.prompt, (promptCounts.get(question.prompt) ?? 0) + 1);
    }
  });

  const duplicatePrompts = [...promptCounts.entries()].filter(([, count]) => count > 1).map(([prompt]) => prompt);
  if (duplicatePrompts.length) {
    addWarning(`${fileName}: duplicate prompts found: ${duplicatePrompts.slice(0, 3).join(" | ")}${duplicatePrompts.length > 3 ? " ..." : ""}`);
  }

  const usedCategories = new Set(questions.map((question) => question.category));
  const scoredCategories = new Set(scoreDimensions.flatMap((dimension) => dimension.categories ?? []));
  const unscoredCategories = [...usedCategories].filter((category) => category && !scoredCategories.has(category));

  if (unscoredCategories.length) {
    addWarning(`${fileName}: question categories not used in result.scoreDimensions: ${unscoredCategories.join(", ")}.`);
  }

  checked.push(fileName);

  return {
    slug: quiz.slug,
    questionCount: questions.length,
    stages,
    encouragement,
    questions,
    profiles,
    scoreDimensions,
  };
}

function assertTranslatedStructure(translated, canonical, fileName) {
  if (!translated || !canonical) {
    return;
  }

  if (translated.slug !== canonical.slug) {
    addError(`${fileName}: "slug" must match en.json.`);
  }

  if (translated.questionCount !== canonical.questionCount) {
    addError(`${fileName}: must contain ${canonical.questionCount} questions to match en.json.`);
  }

  if (translated.stages.length !== canonical.stages.length) {
    addError(`${fileName}: must contain ${canonical.stages.length} stages to match en.json.`);
  }

  if (translated.encouragement.length !== canonical.encouragement.length) {
    addError(`${fileName}: must contain ${canonical.encouragement.length} stage encouragement strings to match en.json.`);
  }

  if (translated.profiles.length !== canonical.profiles.length) {
    addError(`${fileName}: result.profiles count must match en.json.`);
  }

  translated.profiles.forEach((profile, index) => {
    if (profile.minRatio !== canonical.profiles[index]?.minRatio) {
      addError(`${fileName}: result.profiles[${index}].minRatio must match en.json.`);
    }
  });

  translated.scoreDimensions.forEach((dimension, index) => {
    const canonicalDimension = canonical.scoreDimensions[index];

    if (!canonicalDimension) {
      addError(`${fileName}: result.scoreDimensions[${index}] has no matching dimension in en.json.`);
      return;
    }

    if ((dimension.categories ?? []).join("\u0000") !== (canonicalDimension.categories ?? []).join("\u0000")) {
      addError(`${fileName}: result.scoreDimensions[${index}].categories must match en.json.`);
    }
  });

  translated.questions.forEach((question, index) => {
    const canonicalQuestion = canonical.questions[index];

    if (!canonicalQuestion) {
      addError(`${fileName}: question ${index + 1} has no matching question in en.json.`);
      return;
    }

    if ((question.choices?.length ?? 0) !== (canonicalQuestion.choices?.length ?? 0)) {
      addError(`${fileName}: question ${index + 1} must have ${canonicalQuestion.choices.length} choices to match en.json.`);
    }

    if (question.answerIndex !== canonicalQuestion.answerIndex) {
      addError(`${fileName}: question ${index + 1} answerIndex must match en.json.`);
    }

    if (question.stage !== canonicalQuestion.stage) {
      addError(`${fileName}: question ${index + 1} stage must match en.json.`);
    }

    if (question.category !== canonicalQuestion.category) {
      addError(`${fileName}: question ${index + 1} category must match en.json.`);
    }
  });
}

function getSupportedLocales() {
  if (!fs.existsSync(i18nDir)) {
    addError("data/i18n: directory is missing.");
    return new Set([defaultLocale]);
  }

  return new Set(
    fs
      .readdirSync(i18nDir)
      .filter((fileName) => fileName.endsWith(".json"))
      .map((fileName) => fileName.replace(/\.json$/, "")),
  );
}

function validateAllQuizzes() {
  const supportedLocales = getSupportedLocales();
  const entries = fs.readdirSync(quizDir, { withFileTypes: true });

  entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json") && entry.name !== "schema.json")
    .forEach((entry) => {
      addError(`data/quizzes/${entry.name}: quiz JSON files must live in data/quizzes/<slug>/<locale>.json.`);
    });

  const quizFolders = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith("."));

  quizFolders.forEach((entry) => {
    const slug = entry.name;
    const quizFolder = path.join(quizDir, slug);
    const isTemplate = skippedQuizDirs.has(slug);
    const localeFiles = fs.readdirSync(quizFolder).filter((fileName) => fileName.endsWith(".json")).sort();

    if (!localeFiles.includes(`${defaultLocale}.json`)) {
      addError(`data/quizzes/${slug}: missing required ${defaultLocale}.json file.`);
      return;
    }

    localeFiles.forEach((fileName) => {
      const locale = fileName.replace(/\.json$/, "");
      if (!supportedLocales.has(locale)) {
        addError(`data/quizzes/${slug}/${fileName}: unsupported locale. Add data/i18n/${locale}.json first.`);
      }
    });

    const canonical = validateQuizFile(path.join(quizFolder, `${defaultLocale}.json`), { isTemplate });

    if (!isTemplate && canonical?.slug !== slug) {
      addError(`data/quizzes/${slug}/en.json: "slug" must match folder name "${slug}".`);
    }

    localeFiles
      .filter((fileName) => fileName !== `${defaultLocale}.json`)
      .forEach((fileName) => {
        const translated = validateQuizFile(path.join(quizFolder, fileName), { isTemplate });
        assertTranslatedStructure(translated, canonical, `data/quizzes/${slug}/${fileName}`);
      });
  });
}

validateAllQuizzes();

if (warnings.length) {
  console.log("\nQuiz validation warnings:");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (errors.length) {
  console.error("\nQuiz validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`\nQuiz validation passed. Checked ${checked.length} JSON file${checked.length === 1 ? "" : "s"}.`);
