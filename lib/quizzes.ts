import fs from "node:fs";
import path from "node:path";

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

const QUIZ_DIRECTORY = path.join(process.cwd(), "data", "quizzes");
const TEMPLATE_FILE_NAME = "example-template.json";
const difficultyValues = new Set(["Quick", "Medium", "Hard", "Expert"]);

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

function readQuizFiles() {
  return fs
    .readdirSync(QUIZ_DIRECTORY)
    .filter((fileName) => fileName.endsWith(".json") && fileName !== TEMPLATE_FILE_NAME)
    .sort();
}

export function getAllQuizzes() {
  return readQuizFiles().map((fileName) => {
    const filePath = path.join(QUIZ_DIRECTORY, fileName);
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const quiz = validateQuiz(parsed, fileName);

    if (`${quiz.slug}.json` !== fileName) {
      throw new Error(`${fileName}: file name must match slug. Expected "${quiz.slug}.json".`);
    }

    return quiz;
  });
}

export function getQuizBySlug(slug: string) {
  return getAllQuizzes().find((quiz) => quiz.slug === slug);
}
