import fs from "node:fs";
import path from "node:path";
import { getDefaultLocale, getSupportedLocales, isSupportedLocale, type SupportedLocale } from "@/lib/i18n";

export type QuizQuestion = {
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
  visual?: string;
  category?: string;
  stage?: number;
};

export type QuizStageGroup = {
  title: string;
  encouragement?: string;
  questions: QuizQuestion[];
};

export type QuizHomepage = {
  title?: string;
  summary?: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  icon?: string;
  gradient?: string;
  featured?: boolean;
};

export type QuizInfoPanel = {
  title: string;
  intro: string;
  columns: {
    title: string;
    body: string;
  }[];
  footerTitle: string;
  footerBody: string;
};

export type QuizFooterContent = {
  aboutTitle: string;
  aboutText: string;
  topicText?: string;
};

export type QuizLanding = {
  quickStartText: string;
  challengeText?: string;
  socialProof: string;
};

export type QuizResultProfile = {
  minRatio: number;
  tier: string;
  title: string;
  copy: string;
  percentile: string;
};

export type QuizScoreDimension = {
  label: string;
  categories: string[];
};

export type QuizResultConfig = {
  profileName: string;
  profiles: QuizResultProfile[];
  scoreDimensions: QuizScoreDimension[];
};

export type Quiz = {
  slug: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  pageTitle: string;
  eyebrow: string;
  summary: string;
  duration: string;
  publishedAt: string;
  questionCount: number;
  difficulty: "Quick" | "Medium" | "Hard" | "Expert";
  passRate: string;
  cardIcon: string;
  cardGradient: string;
  accent: string;
  homepage: QuizHomepage;
  footer?: QuizFooterContent;
  infoPanel?: QuizInfoPanel;
  landing: QuizLanding;
  stages: string[];
  stageEncouragement: string[];
  heroPoints: string[];
  result: QuizResultConfig;
  questions: QuizQuestion[];
};

type GetAllQuizzesOptions = {
  includeFallback?: boolean;
};

const QUIZ_DIRECTORY = path.join(process.cwd(), "data", "quizzes");
const TEMPLATE_DIRECTORY_NAME = "example-template";
const QUIZ_SCHEMA_FILE_NAME = "schema.json";
const difficultyValues = new Set(["Quick", "Medium", "Hard", "Expert"]);
const supportedLocaleValues = new Set(getSupportedLocales());

function assertString(value: unknown, field: string, fileName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fileName}: "${field}" must be a non-empty string.`);
  }
}

function assertStringArray(value: unknown, field: string, fileName: string) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string" || item.trim().length === 0)) {
    throw new Error(`${fileName}: "${field}" must be a non-empty string array.`);
  }
}

function assertIsoDateTime(value: unknown, field: string, fileName: string) {
  assertString(value, field, fileName);

  const parsedDate = Date.parse(value as string);

  if (Number.isNaN(parsedDate)) {
    throw new Error(`${fileName}: "${field}" must be a valid ISO date-time string.`);
  }
}

function assertOptionalStringArray(value: unknown, field: string, fileName: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim().length === 0)) {
    throw new Error(`${fileName}: "${field}" must be an array of non-empty strings.`);
  }
}

function validateQuestion(value: unknown, index: number, fileName: string, stageOverride?: number): QuizQuestion {
  if (!value || typeof value !== "object") {
    throw new Error(`${fileName}: question ${index + 1} must be an object.`);
  }

  const question = value as Record<string, unknown>;
  assertString(question.prompt, `questions[${index}].prompt`, fileName);

  const choices = question.choices;
  const answerIndex = question.answerIndex;
  const stage = question.stage;

  if (!Array.isArray(choices) || choices.length < 2 || choices.some((choice) => typeof choice !== "string" || choice.trim().length === 0)) {
    throw new Error(`${fileName}: "questions[${index}].choices" must contain at least two non-empty strings.`);
  }

  if (!Number.isInteger(answerIndex) || typeof answerIndex !== "number" || answerIndex < 0 || answerIndex >= choices.length) {
    throw new Error(`${fileName}: "questions[${index}].answerIndex" must point to one of the choices.`);
  }

  if (stage !== undefined && (!Number.isInteger(stage) || typeof stage !== "number" || stage < 0)) {
    throw new Error(`${fileName}: "questions[${index}].stage" must be a zero-based number when provided.`);
  }

  return {
    ...(question as QuizQuestion),
    stage: stageOverride ?? (question.stage as number | undefined),
  };
}

function validateHomepage(value: unknown, fileName: string): QuizHomepage {
  if (value === undefined) {
    return {};
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${fileName}: "homepage" must be an object when provided.`);
  }

  const homepage = value as Record<string, unknown>;
  const optionalStrings = ["title", "summary", "thumbnailUrl", "thumbnailAlt", "icon", "gradient"];

  optionalStrings.forEach((field) => {
    if (homepage[field] !== undefined && typeof homepage[field] !== "string") {
      throw new Error(`${fileName}: "homepage.${field}" must be a string when provided.`);
    }
  });

  if (homepage.featured !== undefined && typeof homepage.featured !== "boolean") {
    throw new Error(`${fileName}: "homepage.featured" must be a boolean when provided.`);
  }

  return homepage as QuizHomepage;
}

function validateInfoPanel(value: unknown, fileName: string): QuizInfoPanel | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${fileName}: "infoPanel" must be an object when provided.`);
  }

  const infoPanel = value as Record<string, unknown>;
  assertString(infoPanel.title, "infoPanel.title", fileName);
  assertString(infoPanel.intro, "infoPanel.intro", fileName);
  assertString(infoPanel.footerTitle, "infoPanel.footerTitle", fileName);
  assertString(infoPanel.footerBody, "infoPanel.footerBody", fileName);

  if (!Array.isArray(infoPanel.columns) || infoPanel.columns.length === 0) {
    throw new Error(`${fileName}: "infoPanel.columns" must be a non-empty array.`);
  }

  infoPanel.columns.forEach((column, index) => {
    if (!column || typeof column !== "object" || Array.isArray(column)) {
      throw new Error(`${fileName}: "infoPanel.columns[${index}]" must be an object.`);
    }

    const item = column as Record<string, unknown>;
    assertString(item.title, `infoPanel.columns[${index}].title`, fileName);
    assertString(item.body, `infoPanel.columns[${index}].body`, fileName);
  });

  return infoPanel as QuizInfoPanel;
}

function validateFooter(value: unknown, fileName: string): QuizFooterContent | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${fileName}: "footer" must be an object when provided.`);
  }

  const footer = value as Record<string, unknown>;
  assertString(footer.aboutTitle, "footer.aboutTitle", fileName);
  assertString(footer.aboutText, "footer.aboutText", fileName);

  if (footer.topicText !== undefined && typeof footer.topicText !== "string") {
    throw new Error(`${fileName}: "footer.topicText" must be a string when provided.`);
  }

  return footer as QuizFooterContent;
}

function validateLanding(value: unknown, fileName: string): QuizLanding {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${fileName}: "landing" must be an object.`);
  }

  const landing = value as Record<string, unknown>;
  assertString(landing.quickStartText, "landing.quickStartText", fileName);
  if (landing.challengeText !== undefined) {
    assertString(landing.challengeText, "landing.challengeText", fileName);
  }
  assertString(landing.socialProof, "landing.socialProof", fileName);

  return landing as QuizLanding;
}

function validateResult(value: unknown, fileName: string): QuizResultConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${fileName}: "result" must be an object.`);
  }

  const result = value as Record<string, unknown>;
  assertString(result.profileName, "result.profileName", fileName);

  if (!Array.isArray(result.profiles) || result.profiles.length === 0) {
    throw new Error(`${fileName}: "result.profiles" must be a non-empty array.`);
  }

  const profiles = result.profiles.map((profile, index) => {
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
      throw new Error(`${fileName}: "result.profiles[${index}]" must be an object.`);
    }

    const item = profile as Record<string, unknown>;

    if (typeof item.minRatio !== "number" || item.minRatio < 0 || item.minRatio > 1) {
      throw new Error(`${fileName}: "result.profiles[${index}].minRatio" must be a number from 0 to 1.`);
    }

    assertString(item.tier, `result.profiles[${index}].tier`, fileName);
    assertString(item.title, `result.profiles[${index}].title`, fileName);
    assertString(item.copy, `result.profiles[${index}].copy`, fileName);
    assertString(item.percentile, `result.profiles[${index}].percentile`, fileName);

    return item as QuizResultProfile;
  });

  if (!profiles.some((profile) => profile.minRatio === 0)) {
    throw new Error(`${fileName}: "result.profiles" must include a fallback profile with "minRatio": 0.`);
  }

  if (!Array.isArray(result.scoreDimensions) || result.scoreDimensions.length === 0) {
    throw new Error(`${fileName}: "result.scoreDimensions" must be a non-empty array.`);
  }

  const scoreDimensions = result.scoreDimensions.map((dimension, index) => {
    if (!dimension || typeof dimension !== "object" || Array.isArray(dimension)) {
      throw new Error(`${fileName}: "result.scoreDimensions[${index}]" must be an object.`);
    }

    const item = dimension as Record<string, unknown>;
    assertString(item.label, `result.scoreDimensions[${index}].label`, fileName);
    assertStringArray(item.categories, `result.scoreDimensions[${index}].categories`, fileName);

    return item as QuizScoreDimension;
  });

  return {
    profileName: result.profileName as string,
    profiles,
    scoreDimensions,
  };
}

function normalizeStageContent(quiz: Record<string, unknown>, fileName: string) {
  const hasStageGroups = quiz.stageGroups !== undefined;
  const hasFlatStages = quiz.stages !== undefined || quiz.questions !== undefined;

  if (hasStageGroups && hasFlatStages) {
    throw new Error(`${fileName}: use either "stageGroups" or the flat "stages" + "questions" format, not both.`);
  }

  if (hasStageGroups) {
    if (!Array.isArray(quiz.stageGroups) || quiz.stageGroups.length === 0) {
      throw new Error(`${fileName}: "stageGroups" must be a non-empty array.`);
    }

    const stages: string[] = [];
    const stageEncouragement: string[] = [];
    const questions: QuizQuestion[] = [];

    quiz.stageGroups.forEach((stageGroup, stageIndex) => {
      if (!stageGroup || typeof stageGroup !== "object" || Array.isArray(stageGroup)) {
        throw new Error(`${fileName}: "stageGroups[${stageIndex}]" must be an object.`);
      }

      const group = stageGroup as Record<string, unknown>;
      assertString(group.title, `stageGroups[${stageIndex}].title`, fileName);

      if (!Array.isArray(group.questions) || group.questions.length === 0) {
        throw new Error(`${fileName}: "stageGroups[${stageIndex}].questions" must be a non-empty array.`);
      }

      if (stageIndex < (quiz.stageGroups as unknown[]).length - 1) {
        assertString(group.encouragement, `stageGroups[${stageIndex}].encouragement`, fileName);
        stageEncouragement.push(group.encouragement as string);
      } else if (group.encouragement !== undefined && typeof group.encouragement !== "string") {
        throw new Error(`${fileName}: "stageGroups[${stageIndex}].encouragement" must be a string when provided.`);
      }

      stages.push(group.title as string);
      group.questions.forEach((question, questionIndex) => {
        questions.push(validateQuestion(question, questions.length, fileName, stageIndex));

        const rawQuestion = question as Record<string, unknown>;
        if (rawQuestion.stage !== undefined && rawQuestion.stage !== stageIndex) {
          throw new Error(
            `${fileName}: "stageGroups[${stageIndex}].questions[${questionIndex}].stage" must be omitted or match the containing stage index.`,
          );
        }
      });
    });

    return {
      stages,
      stageEncouragement,
      questions,
    };
  }

  assertStringArray(quiz.stages, "stages", fileName);

  if (quiz.stageEncouragement === undefined) {
    if ((quiz.stages as string[]).length > 1) {
      throw new Error(`${fileName}: "stageEncouragement" is required when using more than one flat stage.`);
    }
  } else {
    assertOptionalStringArray(quiz.stageEncouragement, "stageEncouragement", fileName);
  }

  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    throw new Error(`${fileName}: "questions" must be a non-empty array.`);
  }

  const stages = quiz.stages as string[];
  const stageEncouragement = (quiz.stageEncouragement ?? []) as string[];
  const questions = quiz.questions.map((question, index) => validateQuestion(question, index, fileName));

  questions.forEach((question, index) => {
    const stage = question.stage ?? 0;

    if (stage >= stages.length) {
      throw new Error(`${fileName}: "questions[${index}].stage" must map to an entry in "stages".`);
    }
  });

  return {
    stages,
    stageEncouragement,
    questions,
  };
}

function validateQuiz(value: unknown, fileName: string): Quiz {
  if (!value || typeof value !== "object") {
    throw new Error(`${fileName}: quiz file must contain a JSON object.`);
  }

  const quiz = value as Record<string, unknown>;
  const requiredStrings = [
    "slug",
    "title",
    "pageTitle",
    "eyebrow",
    "summary",
    "duration",
    "publishedAt",
    "passRate",
    "cardIcon",
    "cardGradient",
    "accent",
  ];

  requiredStrings.forEach((field) => assertString(quiz[field], field, fileName));
  assertIsoDateTime(quiz.publishedAt, "publishedAt", fileName);

  ["seoTitle", "seoDescription"].forEach((field) => {
    if (quiz[field] !== undefined && typeof quiz[field] !== "string") {
      throw new Error(`${fileName}: "${field}" must be a string when provided.`);
    }
  });

  const difficulty = quiz.difficulty;

  if (typeof difficulty !== "string" || !difficultyValues.has(difficulty)) {
    throw new Error(`${fileName}: "difficulty" must be one of Quick, Medium, Hard, or Expert.`);
  }

  if (
    quiz.questionCount !== undefined &&
    (!Number.isInteger(quiz.questionCount) || typeof quiz.questionCount !== "number" || quiz.questionCount < 1)
  ) {
    throw new Error(`${fileName}: "questionCount" must be a positive integer when provided.`);
  }

  if (quiz.heroPoints === undefined) {
    quiz.heroPoints = [];
  }

  assertOptionalStringArray(quiz.heroPoints, "heroPoints", fileName);
  const homepage = validateHomepage(quiz.homepage, fileName);
  const footer = validateFooter(quiz.footer, fileName);
  const infoPanel = validateInfoPanel(quiz.infoPanel, fileName);
  const landing = validateLanding(quiz.landing, fileName);
  const result = validateResult(quiz.result, fileName);
  const { stages, stageEncouragement, questions } = normalizeStageContent(quiz, fileName);
  const questionCount = typeof quiz.questionCount === "number" ? quiz.questionCount : questions.length;

  if (stageEncouragement.length !== stages.length - 1) {
    throw new Error(`${fileName}: "stageEncouragement" must contain one entry for each completed stage before the final results.`);
  }

  if (quiz.questionCount !== undefined && questionCount !== questions.length) {
    throw new Error(`${fileName}: "questionCount" is ${questionCount}, but the file contains ${questions.length} questions.`);
  }

  return {
    slug: quiz.slug,
    title: quiz.title,
    seoTitle: quiz.seoTitle,
    seoDescription: quiz.seoDescription,
    pageTitle: quiz.pageTitle,
    eyebrow: quiz.eyebrow,
    summary: quiz.summary,
    duration: quiz.duration,
    publishedAt: quiz.publishedAt,
    questionCount,
    difficulty: difficulty as Quiz["difficulty"],
    passRate: quiz.passRate,
    cardIcon: quiz.cardIcon,
    cardGradient: quiz.cardGradient,
    accent: quiz.accent,
    homepage,
    footer,
    infoPanel,
    landing,
    stages,
    stageEncouragement,
    heroPoints: quiz.heroPoints,
    result,
    questions,
  } as Quiz;
}

function getQuizDirectory(slug: string) {
  return path.join(QUIZ_DIRECTORY, slug);
}

function readQuizFolders() {
  const entries = fs.readdirSync(QUIZ_DIRECTORY, { withFileTypes: true });
  const rootJsonFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json") && entry.name !== QUIZ_SCHEMA_FILE_NAME);

  if (rootJsonFiles.length) {
    throw new Error(
      `Quiz JSON files must live in per-quiz locale folders. Move ${rootJsonFiles
        .map((entry) => `"${entry.name}"`)
        .join(", ")} into "data/quizzes/<slug>/en.json".`,
    );
  }

  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== TEMPLATE_DIRECTORY_NAME)
    .map((entry) => entry.name)
    .sort();
}

function assertCanonicalQuizFile(slug: string) {
  const quizDirectory = getQuizDirectory(slug);
  const localeFiles = fs.readdirSync(quizDirectory).filter((fileName) => fileName.endsWith(".json"));
  const invalidLocaleFiles = localeFiles.filter((fileName) => !supportedLocaleValues.has(fileName.replace(/\.json$/, "") as SupportedLocale));

  if (invalidLocaleFiles.length) {
    throw new Error(
      `${slug}: quiz locale files must be named with a supported locale. Invalid files: ${invalidLocaleFiles
        .map((fileName) => `"${fileName}"`)
        .join(", ")}.`,
    );
  }

  const canonicalPath = path.join(quizDirectory, `${getDefaultLocale()}.json`);

  if (!fs.existsSync(canonicalPath)) {
    throw new Error(`${slug}: every quiz folder must contain "${getDefaultLocale()}.json".`);
  }
}

function readAndValidateQuiz(slug: string, locale: SupportedLocale) {
  const fileName = `${slug}/${locale}.json`;
  const filePath = path.join(getQuizDirectory(slug), `${locale}.json`);
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const quiz = validateQuiz(parsed, fileName);

  if (quiz.slug !== slug) {
    throw new Error(`${fileName}: "slug" must match the quiz folder name "${slug}".`);
  }

  return quiz;
}

function assertTranslatedQuizStructure(translatedQuiz: Quiz, canonicalQuiz: Quiz, fileName: string) {
  if (translatedQuiz.questionCount !== canonicalQuiz.questionCount) {
    throw new Error(`${fileName}: "questionCount" must match ${canonicalQuiz.questionCount} from en.json.`);
  }

  if (translatedQuiz.stages.length !== canonicalQuiz.stages.length) {
    throw new Error(`${fileName}: "stages" must contain ${canonicalQuiz.stages.length} entries to match en.json.`);
  }

  if (translatedQuiz.stageEncouragement.length !== canonicalQuiz.stageEncouragement.length) {
    throw new Error(`${fileName}: "stageEncouragement" must contain ${canonicalQuiz.stageEncouragement.length} entries to match en.json.`);
  }

  if (translatedQuiz.result.profiles.length !== canonicalQuiz.result.profiles.length) {
    throw new Error(`${fileName}: "result.profiles" must contain ${canonicalQuiz.result.profiles.length} entries to match en.json.`);
  }

  if (translatedQuiz.result.scoreDimensions.length !== canonicalQuiz.result.scoreDimensions.length) {
    throw new Error(`${fileName}: "result.scoreDimensions" must contain ${canonicalQuiz.result.scoreDimensions.length} entries to match en.json.`);
  }

  if (translatedQuiz.questions.length !== canonicalQuiz.questions.length) {
    throw new Error(`${fileName}: "questions" must contain ${canonicalQuiz.questions.length} entries to match en.json.`);
  }

  translatedQuiz.result.profiles.forEach((profile, index) => {
    if (profile.minRatio !== canonicalQuiz.result.profiles[index].minRatio) {
      throw new Error(`${fileName}: "result.profiles[${index}].minRatio" must match en.json.`);
    }
  });

  translatedQuiz.result.scoreDimensions.forEach((dimension, index) => {
    const canonicalDimension = canonicalQuiz.result.scoreDimensions[index];

    if (dimension.categories.join("\u0000") !== canonicalDimension.categories.join("\u0000")) {
      throw new Error(`${fileName}: "result.scoreDimensions[${index}].categories" must match en.json.`);
    }
  });

  translatedQuiz.questions.forEach((question, index) => {
    const canonicalQuestion = canonicalQuiz.questions[index];

    if (question.choices.length !== canonicalQuestion.choices.length) {
      throw new Error(`${fileName}: "questions[${index}].choices" must contain ${canonicalQuestion.choices.length} choices to match en.json.`);
    }

    if (question.answerIndex !== canonicalQuestion.answerIndex) {
      throw new Error(`${fileName}: "questions[${index}].answerIndex" must match en.json.`);
    }

    if ((question.stage ?? 0) !== (canonicalQuestion.stage ?? 0)) {
      throw new Error(`${fileName}: "questions[${index}].stage" must match en.json.`);
    }

    if (question.category !== canonicalQuestion.category) {
      throw new Error(`${fileName}: "questions[${index}].category" must match en.json.`);
    }
  });
}

function resolveLocale(locale?: string): SupportedLocale {
  return locale && isSupportedLocale(locale) ? locale : getDefaultLocale();
}

export function getQuizLocales(slug: string) {
  const quizDirectory = getQuizDirectory(slug);

  if (!fs.existsSync(quizDirectory)) {
    return [];
  }

  return fs
    .readdirSync(quizDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => fileName.replace(/\.json$/, ""))
    .filter((locale): locale is SupportedLocale => supportedLocaleValues.has(locale as SupportedLocale))
    .sort();
}

function hasLocaleQuiz(slug: string, locale: SupportedLocale) {
  return fs.existsSync(path.join(getQuizDirectory(slug), `${locale}.json`));
}

export function getAllQuizzes(locale?: string, options: GetAllQuizzesOptions = {}) {
  const safeLocale = resolveLocale(locale);
  const includeFallback = options.includeFallback ?? true;

  return readQuizFolders().flatMap((slug) => {
    if (!includeFallback && !hasLocaleQuiz(slug, safeLocale)) {
      return [];
    }

    const quiz = getQuizBySlug(slug, locale);

    if (!quiz) {
      throw new Error(`${slug}: quiz folder could not be loaded.`);
    }

    return [quiz];
  });
}

export function getQuizBySlug(slug: string, locale?: string) {
  const quizDirectory = getQuizDirectory(slug);

  if (!fs.existsSync(quizDirectory) || !fs.statSync(quizDirectory).isDirectory()) {
    return undefined;
  }

  assertCanonicalQuizFile(slug);

  const safeLocale = resolveLocale(locale);
  const canonicalQuiz = readAndValidateQuiz(slug, getDefaultLocale());

  if (safeLocale === getDefaultLocale()) {
    return canonicalQuiz;
  }

  const localizedPath = path.join(quizDirectory, `${safeLocale}.json`);

  if (!fs.existsSync(localizedPath)) {
    return canonicalQuiz;
  }

  const translatedQuiz = readAndValidateQuiz(slug, safeLocale);
  assertTranslatedQuizStructure(translatedQuiz, canonicalQuiz, `${slug}/${safeLocale}.json`);

  return translatedQuiz;
}
