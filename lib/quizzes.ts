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

export type Quiz = {
  slug: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  pageTitle: string;
  eyebrow: string;
  summary: string;
  duration: string;
  questionCount: number;
  difficulty: "Quick" | "Medium" | "Hard" | "Expert";
  passRate: string;
  cardIcon: string;
  cardGradient: string;
  accent: string;
  homepage: QuizHomepage;
  infoPanel?: QuizInfoPanel;
  stages: string[];
  heroPoints: string[];
  questions: QuizQuestion[];
};

type GetAllQuizzesOptions = {
  includeFallback?: boolean;
};

const QUIZ_DIRECTORY = path.join(process.cwd(), "data", "quizzes");
const TEMPLATE_DIRECTORY_NAME = "example-template";
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

function validateQuestion(value: unknown, index: number, fileName: string): QuizQuestion {
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

  return question as QuizQuestion;
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
    "passRate",
    "cardIcon",
    "cardGradient",
    "accent",
  ];

  requiredStrings.forEach((field) => assertString(quiz[field], field, fileName));

  ["seoTitle", "seoDescription"].forEach((field) => {
    if (quiz[field] !== undefined && typeof quiz[field] !== "string") {
      throw new Error(`${fileName}: "${field}" must be a string when provided.`);
    }
  });

  const difficulty = quiz.difficulty;
  const questionCount = quiz.questionCount;

  if (typeof difficulty !== "string" || !difficultyValues.has(difficulty)) {
    throw new Error(`${fileName}: "difficulty" must be one of Quick, Medium, Hard, or Expert.`);
  }

  if (!Number.isInteger(questionCount) || typeof questionCount !== "number" || questionCount < 1) {
    throw new Error(`${fileName}: "questionCount" must be a positive integer.`);
  }

  assertStringArray(quiz.stages, "stages", fileName);
  assertStringArray(quiz.heroPoints, "heroPoints", fileName);
  const homepage = validateHomepage(quiz.homepage, fileName);
  const infoPanel = validateInfoPanel(quiz.infoPanel, fileName);

  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    throw new Error(`${fileName}: "questions" must be a non-empty array.`);
  }

  const questions = quiz.questions.map((question, index) => validateQuestion(question, index, fileName));

  if (questionCount !== questions.length) {
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
    questionCount,
    difficulty: difficulty as Quiz["difficulty"],
    passRate: quiz.passRate,
    cardIcon: quiz.cardIcon,
    cardGradient: quiz.cardGradient,
    accent: quiz.accent,
    homepage,
    infoPanel,
    stages: quiz.stages,
    heroPoints: quiz.heroPoints,
    questions,
  } as Quiz;
}

function getQuizDirectory(slug: string) {
  return path.join(QUIZ_DIRECTORY, slug);
}

function readQuizFolders() {
  const entries = fs.readdirSync(QUIZ_DIRECTORY, { withFileTypes: true });
  const rootJsonFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json"));

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

  if (translatedQuiz.questions.length !== canonicalQuiz.questions.length) {
    throw new Error(`${fileName}: "questions" must contain ${canonicalQuiz.questions.length} entries to match en.json.`);
  }

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
