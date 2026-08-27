import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  getDefaultLocale,
  getSupportedLocales,
  isSupportedLocale,
  type SupportedLocale,
} from "@/lib/i18n";
import {
  assertExactKeys as exactKeys,
  schemaObject as object,
  schemaStrings as strings,
  schemaText as text,
} from "@/lib/quiz/schema";
import {
  normalizeQuizAsset,
  normalizedSocialAvatars,
  themeStylesheetHref,
} from "@/lib/quiz/normalization";

export type QuizFlow = {
  type: "linear" | "staged";
  advance: "automatic" | "manual";
  feedback: "instant" | "selection-only" | "after-results";
};

const QUIZ_TEMPLATE_IDS = ["single-stage-rewarded-v1"] as const;
type QuizTemplateId = (typeof QUIZ_TEMPLATE_IDS)[number];
const SHARED_ENGINE_TEMPLATE = {
  flow: "linear",
  advance: "automatic",
  feedback: "selection-only",
  checkpoint: "ai",
  startOnLoad: false,
  rewarded: { start: true, stages: true, attempts: 3, confirmStart: false },
  advanceDelayMs: 450,
} as const;
const sharedShellCss = fs.readFileSync(path.join(process.cwd(), "styles", "quiz-shell-contract.css"), "utf8");
const SHARED_SHELL_CSS_HREF = `/styles/quiz-shell-contract.${createHash("sha256").update(sharedShellCss).digest("hex").slice(0, 12)}.css`;

export type QuizScoring = { type: "correct-answer" | "weighted-profile" | "hybrid-match" };
export type QuizRewardedConfig = { start: boolean; stages: boolean; attempts: number; confirmStart: boolean };
export type QuizPresentation = "text" | "icons" | "scale" | "memory-cue" | "sequence" | "grid" | "code" | "spatial";
export type QuizDerivedScoreConfig = {
  breakpoints: Array<{ ratio: number; value: number }>;
  roundTo: number;
};
export type QuizTieBreakConfig = {
  categories: "harder-correct";
  bestRound: "later";
};
export type QuizMatchCandidate = {
  id: string;
  academicWeights: Record<string, number>;
  styleWeights: Record<string, number>;
};
export type QuizMatchConfig = {
  academicWeight: number;
  styleWeight: number;
  categories: string[];
  traits: string[];
  candidates: QuizMatchCandidate[];
};
export type QuizProfileArtworkSelector = {
  questionId: string;
  fixedVariants: Record<string, string>;
  fallback: "stable-answer-hash";
};
export type QuizQuestionVisual = {
  items: string[];
  columns?: number;
  separator?: string;
  ariaLabel: string;
};
export type QuizQuestionImage = {
  src: string;
  alt: string;
};
export type QuizStudyCue = {
  title: string;
  instruction?: string;
  presentation: "text" | "icons";
  items: string[];
  durationMs: number;
  mode: "manual" | "automatic";
  continueLabel?: string;
  ariaLabel?: string;
};
export type QuizEstimateConfig = {
  baseAge: number;
  minAge: number;
  maxAge: number;
  calibrationMax: number;
  profileAdjustments: Record<string, number>;
  brainAdjustments: Record<string, number>;
};
export type QuizEngineConfig = {
  flow: QuizFlow;
  scoring: QuizScoring;
  checkpoint: "standard" | "ai";
  startOnLoad: boolean;
  localeParity: "strict" | "independent";
  rewarded: QuizRewardedConfig;
  advanceDelayMs: number;
  targetRatio?: number;
  estimate?: QuizEstimateConfig;
  derivedScore?: QuizDerivedScoreConfig;
  tieBreaks?: QuizTieBreakConfig;
  match?: QuizMatchConfig;
  profileArtworkSelector?: QuizProfileArtworkSelector;
};

export type QuizCareerStageCopy = {
  difficulty: string;
  preAdTitle: string;
  preAdCopy?: string;
  preAdChecks?: string[];
  preAdButton?: string;
  next?: {
    eyebrow: string;
    title: string;
    difficulty: string;
    tagline: string;
    copy?: string;
  };
};

export type QuizCareerCopy = {
  resultProgressLabel?: string;
  resultProgressComplete?: string;
  stages: QuizCareerStageCopy[];
};

export type QuizQuestion = {
  id: string;
  type: "single-choice";
  presentation: QuizPresentation;
  context?: string;
  visual?: QuizQuestionVisual;
  image?: QuizQuestionImage;
  prompt: string;
  headerLabel?: string;
  choices: string[];
  icons?: string[];
  memoryItems?: string[];
  continueLabel?: string;
  study?: QuizStudyCue;
  calibrationValues?: number[];
  advanceDelayMs?: number;
  answerIndex?: number;
  choiceProfileIds?: string[];
  choiceWeights?: Record<string, number>[];
  category?: string;
  reasoningSteps?: number;
  interactionStyle?: string;
  stage: number;
};

export type QuizResultProfile = {
  id?: string;
  minRatio: number;
  tier: string;
  title: string;
  copy: string;
  percentile: string;
  icon?: string;
  aura?: string;
  traits?: [string, string, string];
  firstFeature?: string;
};

export type QuizScoreDimension = { label: string; categories: string[] };
export type QuizResultConfig = {
  profileName: string;
  profiles: QuizResultProfile[];
  scoreDimensions: QuizScoreDimension[];
  estimate?: {
    eyebrow: string;
    ageSuffix: string;
    strongestSignal: string;
    wildcard: string;
    consistency: string;
    consistencyLabels: { high: string; medium: string; mixed: string };
    disclaimer: string;
    reviewUnlock?: {
      rewarded?: boolean;
      title: string;
      copy: string;
      button: string;
      adNote: string;
      reviewTitle: string;
      yourChoice: string;
      raised: string;
      lowered: string;
      neutral: string;
      raisedCopy: string;
      loweredCopy: string;
      neutralCopy: string;
    };
    insights?: {
      overview: string;
      estimate: string;
      signal: string;
      consistency: string;
      breakdown: string;
      snapshot: string;
    };
  };
  profileReveal?: {
    eyebrow: string;
    auraLabel: string;
    auraLabelFirst?: boolean;
    traitsLabel: string;
    strongestEnergy: string;
    hiddenEnergy: string;
    consistency: string;
    consistencyLabels: { high: string; medium: string; mixed: string };
    firstFeatureLabel?: string;
    portraitAlt?: string;
    disclaimer: string;
  };
};

export type QuizTheme = {
  id: string;
  preset: "clean" | "editorial" | "playful" | "immersive";
  layout: {
    landing: "split";
    questions: "card";
    results: "immersive";
  };
  colors: {
    page: string;
    pageAlt: string;
    surface: string;
    surfaceRaised: string;
    text: string;
    muted: string;
    primary: string;
    primaryText: string;
    border: string;
    correct: string;
    incorrect: string;
  };
  typography: { heading: "sans" | "serif" | "rounded"; body: "sans" | "serif" };
  shape: { cardRadius: string; buttonRadius: string };
  effects: {
    shadow: "none" | "soft" | "dramatic";
    texture: "none" | "paper" | "grain" | "stars";
  };
  header?: { background: string; text: string; border: string; shadow: string };
  artwork?: {
    landing?: string;
    result?: string;
    icon?: string;
    profiles?: Record<string, string>;
    profileVariants?: Record<string, Record<string, string>>;
    checkpoints?: string[];
    checkpointVariants?: Record<string, string[]>;
  };
};

export type QuizCheckpointCopy = {
  finalIcon?: string;
  buttonIcon?: string;
};

export type QuizRewardPrompt = {
  eyebrow: string;
  icon: string;
  title: string;
  copy: string;
  button: string;
};

export type QuizScoreResultCopy = {
  passed: string;
  finished: string;
  correctLabel: string;
  strongest: string;
  trickiest: string;
  bestRound: string;
  disclaimer: string;
  derivedLabel?: string;
  showPercentage?: boolean;
  showBestRound?: boolean;
  retryLabel?: string;
  reviewUnlock?: {
    title: string;
    copy: string;
    button: string;
    adNote: string;
  };
  insights?: {
    overview: string;
    correct: string;
    missed: string;
    target: string;
    breakdown: string;
    snapshot: string;
    targetReached?: string;
    targetRemaining?: string;
  };
};
export type QuizMatchResultCopy = {
  academicChallenge: string;
  correctLabel: string;
  strongest: string;
  preferredStyle: string;
  alternative: string;
  wildcard: string;
  wildcardTemplate: string;
  bestRound: string;
  disclaimer: string;
  traitLabels: Record<string, string>;
};

export type Quiz = {
  slug: string;
  engine: QuizEngineConfig;
  theme: QuizTheme;
  themeCssHref?: string;
  shellCssHref: string;
  title: string;
  eyebrow: string;
  summary: string;
  progressLabel?: string;
  nextQuestionLabel?: string;
  publishedAt: string;
  difficulty: "Quick" | "Medium" | "Hard" | "Expert";
  cardIcon: string;
  thumbnailUrl?: string;
  thumbnailAlt: string;
  footer?: {
    aboutText: string;
    topicText?: string;
    howToPlay?: { title: string; steps: string[] };
  };
  landing: { quickStartText: string; ctaLabel?: string; infoBadge?: string; socialProofCount: number; socialAvatars: string[]; startPrompt?: QuizRewardPrompt };
  stages: string[];
  stageEncouragement: string[];
  checkpoint?: QuizCheckpointCopy;
  career?: QuizCareerCopy;
  result: QuizResultConfig & { score?: QuizScoreResultCopy; match?: QuizMatchResultCopy };
  questions: QuizQuestion[];
};

type QuizManifest = {
  schemaVersion: 2;
  template: QuizTemplateId;
  slug: string;
  engine: {
    flow: QuizFlow["type"];
    advance: QuizFlow["advance"];
    feedback: QuizFlow["feedback"];
    scoring: QuizScoring["type"];
    checkpoint?: QuizEngineConfig["checkpoint"];
    startOnLoad?: boolean;
    localeParity?: QuizEngineConfig["localeParity"];
    rewarded?: Partial<QuizRewardedConfig>;
    advanceDelayMs?: number;
    targetRatio?: number;
    estimate?: QuizEstimateConfig;
    derivedScore?: QuizDerivedScoreConfig;
    tieBreaks?: QuizTieBreakConfig;
    match?: QuizMatchConfig;
    profileArtworkSelector?: QuizProfileArtworkSelector;
  };
  listing: {
    thumbnail?: string;
    published: string;
    difficulty: Quiz["difficulty"];
    icon: string;
    socialProofCount: number;
  };
  theme: QuizTheme;
  structure: QuizStructureV2;
};

type QuizQuestionStructureV2 = {
  presentation?: QuizPresentation;
  visual?: { columns?: number; separator?: string };
  image?: { src: string; localizedSrc?: Record<string, string> };
  icons?: string[];
  study?: {
    presentation?: QuizStudyCue["presentation"];
    durationMs?: number;
    mode?: QuizStudyCue["mode"];
  };
  calibration?: number[];
  delay?: number;
  correct?: number;
  category?: string;
  reasoningSteps?: number;
  interactionStyle?: string;
  choiceCount: number;
  choiceMeanings?: Array<string | Record<string, number>>;
};

type QuizStructureV2 = {
  stages: Array<{
    id: string;
    difficultyLevel: "foundation" | "developing" | "skilled" | "advanced" | "final";
    questionIds: string[];
    uppercaseNextForLocales?: string[];
  }>;
  questions: Record<string, QuizQuestionStructureV2>;
  checkpoint?: { finalIcon?: string; buttonIcon?: string };
  results: {
    profiles: Array<{ key: string; id?: string; min?: number }>;
    dimensions: Array<{ key: string; profiles?: string[]; categories?: string[] }>;
    score?: { showPercentage?: boolean; showBestRound?: boolean };
    estimate?: { reviewUnlockRewarded?: boolean };
    profileReveal?: { auraLabelFirst?: boolean };
  };
};

type QuizLocaleFile = {
  title: string;
  eyebrow?: string;
  summary: string;
  progressLabel?: string;
  nextQuestionLabel?: string;
  landing?: { intro?: string; badge?: string; cta?: string; startPrompt?: QuizRewardPrompt };
  about?: {
    body: string;
    disclaimer?: string;
    howToPlay?: { title: string; steps: string[] };
  };
  checkpoint?: QuizCheckpointCopy;
  career?: QuizCareerCopy;
  results: {
    name: string;
    profiles: Array<{
      id?: string;
      min?: number;
      tier: string;
      title: string;
      copy: string;
      label?: string;
      icon?: string;
      aura?: string;
      traits?: string[];
      firstFeature?: string;
    }>;
    dimensions?: Array<{ label: string; profiles?: string[]; categories?: string[] }>;
    estimate?: QuizResultConfig["estimate"];
    profileReveal?: QuizResultConfig["profileReveal"];
    score?: QuizScoreResultCopy;
    match?: QuizMatchResultCopy;
  };
  stages: Array<{
    title: string;
    complete?: string;
    questions: Array<{
      id?: string;
      context?: string;
      visual?: QuizQuestionVisual;
      image?: QuizQuestionImage;
      question: string;
      headerLabel?: string;
      presentation?: QuizPresentation;
      answers?: string[] | Record<string, string | Record<string, number>>;
      icons?: string[];
      memoryItems?: string[];
      continueLabel?: string;
      study?: {
        title: string;
        instruction?: string;
        presentation?: QuizStudyCue["presentation"];
        items: string[];
        durationMs?: number;
        mode?: QuizStudyCue["mode"];
        continueLabel?: string;
        ariaLabel?: string;
      };
      calibration?: number[];
      delay?: number;
      correct?: number;
      category?: string;
      reasoningSteps?: number;
      interactionStyle?: string;
    }>;
  }>;
};

type QuizQuestionTextV2 = {
  context?: string;
  visual?: { items: string[]; ariaLabel: string };
  image?: { alt: string };
  question: string;
  headerLabel?: string;
  answers?: string[];
  trapdoorErrors?: Array<string | null>;
  memoryItems?: string[];
  continueLabel?: string;
  study?: {
    title: string;
    instruction?: string;
    items: string[];
    continueLabel?: string;
    ariaLabel?: string;
  };
};

type QuizLocaleTextV2 = Omit<QuizLocaleFile, "stages" | "career" | "results"> & {
  schemaVersion: 2;
  stages: Record<string, {
    title: string;
    complete?: string;
    questions: Record<string, QuizQuestionTextV2>;
  }>;
  career: Omit<QuizCareerCopy, "stages"> & {
    stages: Record<string, Omit<QuizCareerStageCopy, "next"> & {
      next?: Omit<NonNullable<QuizCareerStageCopy["next"]>, "title" | "difficulty">;
    }>;
  };
  results: Omit<QuizLocaleFile["results"], "profiles" | "dimensions"> & {
    profiles: Record<string, Omit<QuizLocaleFile["results"]["profiles"][number], "id" | "min">>;
    dimensions: Record<string, Omit<NonNullable<QuizLocaleFile["results"]["dimensions"]>[number], "profiles" | "categories">>;
  };
};

const ROOT = path.join(process.cwd(), "data", "quizzes");
const LOCALES = new Set(getSupportedLocales());
const DIFFICULTIES = new Set(["Quick", "Medium", "Hard", "Expert"]);
const RESERVED_SLUGS = new Set([...getSupportedLocales(), "info", "api", "_next"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ASSET_PATH = /^(?:\/(?:images|quizzes)\/|assets\/)[a-zA-Z0-9_./-]+$/;
const quizCache = new Map<string, Quiz>();
const quizListCache = new Map<string, Quiz[]>();
const quizLocaleCache = new Map<string, SupportedLocale[]>();
let quizSlugCache: string[] | undefined;

function json<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function validateStructureV2(value: unknown, file: string, template: QuizTemplateId): QuizStructureV2 {
  const raw = object(value, "structure", file);
  exactKeys(raw, ["stages", "questions", "checkpoint", "results"], "structure", file);
  const expectedStageCount = 1;
  const expectedQuestionCount = 10;
  if (!Array.isArray(raw.stages) || raw.stages.length !== expectedStageCount) {
    throw new Error(`${file}: ${template} requires exactly ${expectedStageCount} stage${expectedStageCount === 1 ? "" : "s"}.`);
  }
  const expectedLevels = ["final"];
  const stages = raw.stages.map((item, stageIndex) => {
    const stage = object(item, `structure.stages[${stageIndex}]`, file);
    exactKeys(stage, ["id", "difficultyLevel", "questionIds", "uppercaseNextForLocales"], `structure.stages[${stageIndex}]`, file);
    const id = text(stage.id, `structure.stages[${stageIndex}].id`, file);
    if (stage.difficultyLevel !== expectedLevels[stageIndex]) throw new Error(`${file}: stage ${stageIndex + 1} must use ${expectedLevels[stageIndex]} difficulty.`);
    const questionIds = strings(stage.questionIds, `structure.stages[${stageIndex}].questionIds`, file);
    if (questionIds.length !== expectedQuestionCount) throw new Error(`${file}: stage ${stageIndex + 1} must contain exactly ${expectedQuestionCount} question ids.`);
    const uppercaseNextForLocales = stage.uppercaseNextForLocales === undefined
      ? undefined
      : strings(stage.uppercaseNextForLocales, `structure.stages[${stageIndex}].uppercaseNextForLocales`, file);
    if (uppercaseNextForLocales?.some((locale) => !LOCALES.has(locale as SupportedLocale))) throw new Error(`${file}: stage ${stageIndex + 1} references an unsupported locale casing rule.`);
    return { id, difficultyLevel: stage.difficultyLevel as QuizStructureV2["stages"][number]["difficultyLevel"], questionIds, uppercaseNextForLocales };
  });
  if (new Set(stages.map((stage) => stage.id)).size !== stages.length) throw new Error(`${file}: structure stage ids must be unique.`);
  const allQuestionIds = stages.flatMap((stage) => stage.questionIds);
  if (new Set(allQuestionIds).size !== expectedStageCount * expectedQuestionCount) {
    throw new Error(`${file}: structure must contain ${expectedStageCount * expectedQuestionCount} unique question ids.`);
  }
  const rawQuestions = object(raw.questions, "structure.questions", file);
  if (JSON.stringify(Object.keys(rawQuestions).sort()) !== JSON.stringify([...allQuestionIds].sort())) throw new Error(`${file}: structure.questions must exactly match staged question ids.`);
  const questions = Object.fromEntries(allQuestionIds.map((questionId) => {
    const question = object(rawQuestions[questionId], `structure.questions.${questionId}`, file);
    exactKeys(question, ["presentation", "visual", "image", "icons", "study", "calibration", "delay", "correct", "category", "reasoningSteps", "interactionStyle", "choiceCount", "choiceMeanings"], `structure.questions.${questionId}`, file);
    const choiceCount = Number(question.choiceCount);
    if (!Number.isInteger(choiceCount) || choiceCount < 1 || choiceCount > 5) throw new Error(`${file}: ${questionId} choiceCount must be 1–5.`);
    if (question.correct !== undefined && (!Number.isInteger(question.correct) || Number(question.correct) < 0 || Number(question.correct) >= choiceCount)) throw new Error(`${file}: ${questionId} has an invalid correct index.`);
    if (question.choiceMeanings !== undefined && (!Array.isArray(question.choiceMeanings) || question.choiceMeanings.length !== choiceCount)) throw new Error(`${file}: ${questionId} choiceMeanings must match choiceCount.`);
    const presentation = question.presentation === undefined ? undefined : String(question.presentation) as QuizPresentation;
    if (presentation !== undefined && !["text", "icons", "scale", "memory-cue", "sequence", "grid", "code", "spatial"].includes(presentation)) throw new Error(`${file}: ${questionId} has an invalid presentation.`);
    return [questionId, question as QuizQuestionStructureV2];
  }));
  const checkpointRaw = raw.checkpoint === undefined ? undefined : object(raw.checkpoint, "structure.checkpoint", file);
  if (checkpointRaw) exactKeys(checkpointRaw, ["finalIcon", "buttonIcon"], "structure.checkpoint", file);
  const resultRaw = object(raw.results, "structure.results", file);
  exactKeys(resultRaw, ["profiles", "dimensions", "score", "estimate", "profileReveal"], "structure.results", file);
  if (!Array.isArray(resultRaw.profiles) || !resultRaw.profiles.length) throw new Error(`${file}: structure.results.profiles are required.`);
  const profiles = resultRaw.profiles.map((item, index) => {
    const profile = object(item, `structure.results.profiles[${index}]`, file);
    exactKeys(profile, ["key", "id", "min"], `structure.results.profiles[${index}]`, file);
    return { key: text(profile.key, `structure.results.profiles[${index}].key`, file), id: profile.id as string | undefined, min: profile.min as number | undefined };
  });
  if (new Set(profiles.map((profile) => profile.key)).size !== profiles.length) throw new Error(`${file}: result profile keys must be unique.`);
  if (!Array.isArray(resultRaw.dimensions)) throw new Error(`${file}: structure.results.dimensions must be an array.`);
  const dimensions = resultRaw.dimensions.map((item, index) => {
    const dimension = object(item, `structure.results.dimensions[${index}]`, file);
    exactKeys(dimension, ["key", "profiles", "categories"], `structure.results.dimensions[${index}]`, file);
    return { key: text(dimension.key, `structure.results.dimensions[${index}].key`, file), profiles: dimension.profiles as string[] | undefined, categories: dimension.categories as string[] | undefined };
  });
  if (new Set(dimensions.map((dimension) => dimension.key)).size !== dimensions.length) throw new Error(`${file}: result dimension keys must be unique.`);
  return {
    stages,
    questions,
    checkpoint: checkpointRaw as QuizStructureV2["checkpoint"],
    results: {
      profiles,
      dimensions,
      score: resultRaw.score as QuizStructureV2["results"]["score"],
      estimate: resultRaw.estimate as QuizStructureV2["results"]["estimate"],
      profileReveal: resultRaw.profileReveal as QuizStructureV2["results"]["profileReveal"],
    },
  };
}

function expandLocaleV2(value: unknown, manifest: QuizManifest, locale: SupportedLocale, file: string): QuizLocaleFile {
  const raw = object(value, "locale", file) as unknown as QuizLocaleTextV2;
  if (raw.schemaVersion !== 2) throw new Error(`${file}: schemaVersion must be 2.`);
  const structure = manifest.structure;
  if (!structure) throw new Error(`${file}: schema v2 locale requires manifest structure.`);
  const stageKeys = Object.keys(raw.stages ?? {}).sort();
  const expectedStageKeys = structure.stages.map((stage) => stage.id).sort();
  if (JSON.stringify(stageKeys) !== JSON.stringify(expectedStageKeys)) throw new Error(`${file}: locale stages must exactly match manifest stage ids.`);
  const stages = structure.stages.map((stage) => {
    const stageCopy = raw.stages[stage.id];
    const questionKeys = Object.keys(stageCopy.questions ?? {}).sort();
    if (JSON.stringify(questionKeys) !== JSON.stringify([...stage.questionIds].sort())) throw new Error(`${file}: ${stage.id} questions must exactly match the manifest.`);
    return {
      title: stageCopy.title,
      complete: stageCopy.complete,
      questions: stage.questionIds.map((questionId) => {
        const logic = structure.questions[questionId];
        const copy = stageCopy.questions[questionId];
        if (!copy) throw new Error(`${file}: missing question text for ${questionId}.`);
        const answers = copy.answers === undefined ? undefined : logic.choiceMeanings
          ? Object.fromEntries(copy.answers.map((answer, index) => [answer, logic.choiceMeanings?.[index]]))
          : copy.answers;
        return {
          id: questionId,
          context: copy.context,
          visual: logic.visual || copy.visual ? { ...copy.visual, ...logic.visual } as QuizQuestionVisual : undefined,
          image: logic.image || copy.image ? {
            src: logic.image?.localizedSrc?.[locale] ?? logic.image?.src ?? "",
            alt: copy.image?.alt ?? "",
          } : undefined,
          question: copy.question,
          headerLabel: copy.headerLabel,
          presentation: logic.presentation,
          answers,
          icons: logic.icons,
          memoryItems: copy.memoryItems,
          continueLabel: copy.continueLabel,
          study: logic.study || copy.study ? { ...copy.study, ...logic.study } as QuizLocaleFile["stages"][number]["questions"][number]["study"] : undefined,
          calibration: logic.calibration,
          delay: logic.delay,
          correct: logic.correct,
          category: logic.category,
          reasoningSteps: logic.reasoningSteps,
          interactionStyle: logic.interactionStyle,
        };
      }),
    };
  });
  const profileKeys = Object.keys(raw.results.profiles ?? {}).sort();
  const expectedProfileKeys = structure.results.profiles.map((profile) => profile.key).sort();
  if (JSON.stringify(profileKeys) !== JSON.stringify(expectedProfileKeys)) throw new Error(`${file}: result profile copy must exactly match manifest profile keys.`);
  const dimensionKeys = Object.keys(raw.results.dimensions ?? {}).sort();
  const expectedDimensionKeys = structure.results.dimensions.map((dimension) => dimension.key).sort();
  if (JSON.stringify(dimensionKeys) !== JSON.stringify(expectedDimensionKeys)) throw new Error(`${file}: result dimensions must exactly match manifest dimension keys.`);
  const score = raw.results.score ? {
    ...raw.results.score,
    ...structure.results.score,
    disclaimer: raw.results.score.disclaimer ?? raw.about?.disclaimer,
  } : undefined;
  const estimate = raw.results.estimate ? structuredClone(raw.results.estimate) : undefined;
  if (estimate) {
    estimate.disclaimer ??= raw.about?.disclaimer ?? "";
    if (estimate.reviewUnlock && structure.results.estimate?.reviewUnlockRewarded !== undefined) estimate.reviewUnlock.rewarded = structure.results.estimate.reviewUnlockRewarded;
  }
  const profileReveal = raw.results.profileReveal ? {
    ...raw.results.profileReveal,
    ...structure.results.profileReveal,
    disclaimer: raw.results.profileReveal.disclaimer ?? raw.about?.disclaimer ?? "",
  } : undefined;
  const match = raw.results.match ? {
    ...raw.results.match,
    disclaimer: raw.results.match.disclaimer ?? raw.about?.disclaimer ?? "",
  } : undefined;
  const careerStageKeys = Object.keys(raw.career.stages ?? {}).sort();
  if (JSON.stringify(careerStageKeys) !== JSON.stringify(expectedStageKeys)) throw new Error(`${file}: career stages must exactly match manifest stage ids.`);
  const careerStages = structure.stages.map((stage, stageIndex) => {
    const copy = raw.career.stages[stage.id];
    const nextStage = structure.stages[stageIndex + 1];
    const nextStageCopy = nextStage ? raw.stages[nextStage.id] : undefined;
    const nextCareerCopy = nextStage ? raw.career.stages[nextStage.id] : undefined;
    const uppercase = stage.uppercaseNextForLocales?.includes(locale) ?? false;
    return {
      ...copy,
      next: copy.next && nextStageCopy && nextCareerCopy ? {
        ...copy.next,
        title: uppercase ? nextStageCopy.title.toLocaleUpperCase(locale) : nextStageCopy.title,
        difficulty: uppercase ? nextCareerCopy.difficulty.toLocaleUpperCase(locale) : nextCareerCopy.difficulty,
      } : undefined,
    };
  });
  return {
    ...raw,
    checkpoint: raw.checkpoint || structure.checkpoint ? { ...raw.checkpoint, ...structure.checkpoint } : undefined,
    career: { ...raw.career, stages: careerStages },
    results: {
      ...raw.results,
      profiles: structure.results.profiles.map((profile) => ({ id: profile.id, min: profile.min, ...raw.results.profiles[profile.key] })),
      dimensions: structure.results.dimensions.map((dimension) => ({ ...raw.results.dimensions[dimension.key], profiles: dimension.profiles, categories: dimension.categories })),
      score,
      estimate,
      profileReveal,
      match,
    },
    stages,
  } as QuizLocaleFile;
}

function validateManifest(value: unknown, file: string): QuizManifest {
  const raw = object(value, "quiz", file);
  const engine = object(raw.engine, "engine", file);
  const listing = object(raw.listing, "listing", file);
  if (raw.schemaVersion !== 2) throw new Error(`${file}: schemaVersion must be 2.`);
  if (!QUIZ_TEMPLATE_IDS.includes(raw.template as QuizTemplateId)) throw new Error(`${file}: template must be one of ${QUIZ_TEMPLATE_IDS.join(", ")}.`);
  const template = raw.template as QuizTemplateId;
  for (const key of ["flow", "advance", "feedback", "checkpoint", "startOnLoad", "rewarded", "advanceDelayMs"]) {
    if (engine[key] !== undefined) throw new Error(`${file}: engine.${key} is owned by template ${template}.`);
  }
  if (!["correct-answer", "weighted-profile", "hybrid-match"].includes(String(engine.scoring))) throw new Error(`${file}: invalid scoring mode.`);
  if (engine.localeParity !== undefined && !["strict", "independent"].includes(String(engine.localeParity))) throw new Error(`${file}: engine.localeParity must be strict or independent.`);
  const advanceDelayMs = SHARED_ENGINE_TEMPLATE.advanceDelayMs;
  const targetRatio = engine.targetRatio === undefined ? undefined : Number(engine.targetRatio);
  if (targetRatio !== undefined && (!Number.isFinite(targetRatio) || targetRatio <= 0 || targetRatio > 1)) throw new Error(`${file}: engine.targetRatio must be greater than 0 and at most 1.`);
  let derivedScore: QuizDerivedScoreConfig | undefined;
  if (engine.derivedScore !== undefined) {
    const rawDerived = object(engine.derivedScore, "engine.derivedScore", file);
    if (!Array.isArray(rawDerived.breakpoints) || rawDerived.breakpoints.length < 2) throw new Error(`${file}: derivedScore needs at least two breakpoints.`);
    const breakpoints = rawDerived.breakpoints.map((item, index) => {
      const point = object(item, `engine.derivedScore.breakpoints[${index}]`, file);
      if (typeof point.ratio !== "number" || !Number.isFinite(point.ratio) || point.ratio < 0 || point.ratio > 1) throw new Error(`${file}: derivedScore breakpoint ratios must be between 0 and 1.`);
      if (typeof point.value !== "number" || !Number.isFinite(point.value)) throw new Error(`${file}: derivedScore breakpoint values must be numbers.`);
      return { ratio: point.ratio, value: point.value };
    });
    if (breakpoints.some((point, index) => index > 0 && point.ratio <= breakpoints[index - 1].ratio)) throw new Error(`${file}: derivedScore breakpoints must use strictly increasing ratios.`);
    const roundTo = Number(rawDerived.roundTo);
    if (!Number.isFinite(roundTo) || roundTo <= 0) throw new Error(`${file}: derivedScore.roundTo must be greater than zero.`);
    derivedScore = { breakpoints, roundTo };
  }
  let tieBreaks: QuizTieBreakConfig | undefined;
  if (engine.tieBreaks !== undefined) {
    const rawTieBreaks = object(engine.tieBreaks, "engine.tieBreaks", file);
    if (rawTieBreaks.categories !== "harder-correct" || rawTieBreaks.bestRound !== "later") throw new Error(`${file}: invalid tie-break configuration.`);
    tieBreaks = { categories: "harder-correct", bestRound: "later" };
  }
  let match: QuizMatchConfig | undefined;
  if (engine.match !== undefined) {
    const rawMatch = object(engine.match, "engine.match", file);
    const academicWeight = Number(rawMatch.academicWeight);
    const styleWeight = Number(rawMatch.styleWeight);
    if (![academicWeight, styleWeight].every((weight) => Number.isFinite(weight) && weight >= 0) || Math.abs(academicWeight + styleWeight - 1) > 1e-9) {
      throw new Error(`${file}: match academicWeight and styleWeight must be non-negative and total 1.`);
    }
    const categories = strings(rawMatch.categories, "engine.match.categories", file);
    const traits = strings(rawMatch.traits, "engine.match.traits", file);
    if (new Set(categories).size !== categories.length || new Set(traits).size !== traits.length) throw new Error(`${file}: match categories and traits must be unique.`);
    if (!Array.isArray(rawMatch.candidates) || rawMatch.candidates.length < 2) throw new Error(`${file}: match needs at least two candidates.`);
    const candidates = rawMatch.candidates.map((item, index) => {
      const candidate = object(item, `engine.match.candidates[${index}]`, file);
      const academicWeights = object(candidate.academicWeights, `engine.match.candidates[${index}].academicWeights`, file);
      const styleWeights = object(candidate.styleWeights, `engine.match.candidates[${index}].styleWeights`, file);
      if (Object.keys(academicWeights).some((key) => !categories.includes(key)) || Object.keys(styleWeights).some((key) => !traits.includes(key))) throw new Error(`${file}: match candidate ${index + 1} references an unknown category or trait.`);
      if (categories.some((key) => typeof academicWeights[key] !== "number" || Number(academicWeights[key]) <= 0) || traits.some((key) => typeof styleWeights[key] !== "number" || Number(styleWeights[key]) <= 0)) throw new Error(`${file}: match candidate ${index + 1} must have positive weights for every category and trait.`);
      return { id: text(candidate.id, `engine.match.candidates[${index}].id`, file), academicWeights: academicWeights as Record<string, number>, styleWeights: styleWeights as Record<string, number> };
    });
    if (new Set(candidates.map((candidate) => candidate.id)).size !== candidates.length) throw new Error(`${file}: match candidate ids must be unique.`);
    match = { academicWeight, styleWeight, categories, traits, candidates };
  }
  let profileArtworkSelector: QuizProfileArtworkSelector | undefined;
  if (engine.profileArtworkSelector !== undefined) {
    const rawSelector = object(engine.profileArtworkSelector, "engine.profileArtworkSelector", file);
    const fixedVariants = object(rawSelector.fixedVariants, "engine.profileArtworkSelector.fixedVariants", file);
    if (Object.keys(fixedVariants).length < 1) throw new Error(`${file}: profileArtworkSelector needs at least one fixed variant.`);
    const normalizedVariants = Object.fromEntries(Object.entries(fixedVariants).map(([choice, variant]) => {
      if (!/^\d+$/.test(choice)) throw new Error(`${file}: profileArtworkSelector fixed-variant keys must be answer indices.`);
      return [choice, text(variant, `engine.profileArtworkSelector.fixedVariants.${choice}`, file)];
    }));
    if (rawSelector.fallback !== "stable-answer-hash") throw new Error(`${file}: profileArtworkSelector fallback must be stable-answer-hash.`);
    profileArtworkSelector = {
      questionId: text(rawSelector.questionId, "engine.profileArtworkSelector.questionId", file),
      fixedVariants: normalizedVariants,
      fallback: "stable-answer-hash",
    };
  }
  let estimate: QuizEstimateConfig | undefined;
  if (engine.estimate !== undefined) {
    const rawEstimate = object(engine.estimate, "engine.estimate", file);
    const profileAdjustments = object(rawEstimate.profileAdjustments, "engine.estimate.profileAdjustments", file);
    const brainAdjustments = object(rawEstimate.brainAdjustments, "engine.estimate.brainAdjustments", file);
    ["baseAge", "minAge", "maxAge", "calibrationMax"].forEach((key) => {
      if (typeof rawEstimate[key] !== "number" || !Number.isFinite(rawEstimate[key])) throw new Error(`${file}: engine.estimate.${key} must be a number.`);
    });
    if (Object.values(profileAdjustments).some((item) => typeof item !== "number" || !Number.isFinite(item))) throw new Error(`${file}: profile adjustments must be numbers.`);
    if (Object.values(brainAdjustments).some((item) => typeof item !== "number" || !Number.isFinite(item))) throw new Error(`${file}: brain adjustments must be numbers.`);
    estimate = {
      baseAge: rawEstimate.baseAge as number,
      minAge: rawEstimate.minAge as number,
      maxAge: rawEstimate.maxAge as number,
      calibrationMax: rawEstimate.calibrationMax as number,
      profileAdjustments: profileAdjustments as Record<string, number>,
      brainAdjustments: brainAdjustments as Record<string, number>,
    };
  }
  if (!DIFFICULTIES.has(String(listing.difficulty))) throw new Error(`${file}: invalid difficulty.`);
  const socialProofCount = Number(listing.socialProofCount);
  if (!Number.isInteger(socialProofCount) || socialProofCount < 1_000) throw new Error(`${file}: listing.socialProofCount must be an integer of at least 1,000.`);
  if (listing.thumbnail !== undefined && (typeof listing.thumbnail !== "string" || !ASSET_PATH.test(listing.thumbnail))) {
    throw new Error(`${file}: thumbnail must be a local asset path.`);
  }
  const slug = text(raw.slug, "slug", file);
  if (!SLUG_PATTERN.test(slug)) throw new Error(`${file}: slug must use lowercase URL-safe words separated by hyphens.`);
  if (RESERVED_SLUGS.has(slug)) throw new Error(`${file}: slug ${slug} is reserved by site routing.`);
  if (engine.scoring !== "correct-answer" && derivedScore) throw new Error(`${file}: derivedScore is only supported by correct-answer quizzes.`);
  if (engine.scoring === "weighted-profile" && engine.targetRatio !== undefined) throw new Error(`${file}: targetRatio is only supported by scored quizzes.`);
  if (engine.scoring !== "weighted-profile" && estimate) throw new Error(`${file}: estimate is only supported by weighted-profile quizzes.`);
  if (!["correct-answer", "hybrid-match"].includes(String(engine.scoring)) && tieBreaks) throw new Error(`${file}: tieBreaks are only supported by scored quizzes.`);
  if (engine.scoring === "hybrid-match" && !match) throw new Error(`${file}: hybrid-match scoring needs engine.match.`);
  if (engine.scoring !== "hybrid-match" && match) throw new Error(`${file}: engine.match is only supported by hybrid-match scoring.`);
  if (engine.scoring !== "weighted-profile" && profileArtworkSelector) throw new Error(`${file}: profileArtworkSelector is only supported by weighted-profile scoring.`);
  const structure = validateStructureV2(raw.structure, file, template);
  return {
    schemaVersion: 2,
    template,
    slug,
    engine: {
      ...engine,
      ...SHARED_ENGINE_TEMPLATE,
      advanceDelayMs,
      targetRatio,
      estimate,
      derivedScore,
      tieBreaks,
      match,
      profileArtworkSelector,
    } as QuizManifest["engine"],
    listing: {
      thumbnail: listing.thumbnail as string | undefined,
      published: text(listing.published, "listing.published", file),
      difficulty: listing.difficulty as Quiz["difficulty"],
      icon: text(listing.icon, "listing.icon", file),
      socialProofCount,
    },
    theme: validateTheme({ ...object(raw.theme, "theme", file), id: slug }, file),
    structure,
  };
}

function validateTheme(value: unknown, file: string): QuizTheme {
  const raw = object(value, "theme", file);
  const layout = object(raw.layout, "layout", file);
  const colors = object(raw.colors, "colors", file);
  const typography = object(raw.typography, "typography", file);
  const shape = object(raw.shape, "shape", file);
  const effects = object(raw.effects, "effects", file);
  const colorKeys = ["page", "pageAlt", "surface", "surfaceRaised", "text", "muted", "primary", "primaryText", "border", "correct", "incorrect"];
  colorKeys.forEach((key) => text(colors[key], `colors.${key}`, file));
  if (!["clean", "editorial", "playful", "immersive"].includes(String(raw.preset))) throw new Error(`${file}: invalid preset.`);
  if (layout.landing !== "split" || layout.questions !== "card" || layout.results !== "immersive") {
    throw new Error(`${file}: all quizzes must use the shared split/card/immersive shell contract.`);
  }
  if (!["sans", "serif", "rounded"].includes(String(typography.heading))) throw new Error(`${file}: invalid heading.`);
  if (!["sans", "serif"].includes(String(typography.body))) throw new Error(`${file}: invalid body font.`);
  if (!["none", "soft", "dramatic"].includes(String(effects.shadow))) throw new Error(`${file}: invalid shadow.`);
  if (!["none", "paper", "grain", "stars"].includes(String(effects.texture))) throw new Error(`${file}: invalid texture.`);
  const artwork = raw.artwork === undefined ? undefined : object(raw.artwork, "artwork", file);
  const header = raw.header === undefined ? undefined : object(raw.header, "header", file);
  return {
    id: text(raw.id, "id", file),
    preset: raw.preset as QuizTheme["preset"],
    layout: layout as QuizTheme["layout"],
    colors: colors as QuizTheme["colors"],
    typography: typography as QuizTheme["typography"],
    shape: {
      cardRadius: text(shape.cardRadius, "shape.cardRadius", file),
      buttonRadius: text(shape.buttonRadius, "shape.buttonRadius", file),
    },
    effects: effects as QuizTheme["effects"],
    header: header ? {
      background: text(header.background, "header.background", file),
      text: text(header.text, "header.text", file),
      border: text(header.border, "header.border", file),
      shadow: text(header.shadow, "header.shadow", file),
    } : undefined,
    artwork: artwork ? {
      landing: artwork.landing as string | undefined,
      result: artwork.result as string | undefined,
      icon: artwork.icon as string | undefined,
      profiles: artwork.profiles === undefined
        ? undefined
        : Object.fromEntries(Object.entries(object(artwork.profiles, "artwork.profiles", file)).map(([id, value]) => [id, text(value, `artwork.profiles.${id}`, file)])),
      profileVariants: artwork.profileVariants === undefined
        ? undefined
        : Object.fromEntries(Object.entries(object(artwork.profileVariants, "artwork.profileVariants", file)).map(([profileId, rawVariants]) => {
          const variants = object(rawVariants, `artwork.profileVariants.${profileId}`, file);
          if (!Object.keys(variants).length) throw new Error(`${file}: artwork.profileVariants.${profileId} cannot be empty.`);
          return [profileId, Object.fromEntries(Object.entries(variants).map(([variantId, asset]) => [
            variantId,
            text(asset, `artwork.profileVariants.${profileId}.${variantId}`, file),
          ]))];
        })),
      checkpoints: artwork.checkpoints === undefined
        ? undefined
        : strings(artwork.checkpoints, "artwork.checkpoints", file),
      checkpointVariants: artwork.checkpointVariants === undefined
        ? undefined
        : Object.fromEntries(Object.entries(object(artwork.checkpointVariants, "artwork.checkpointVariants", file)).map(([variantId, rawAssets]) => [
          variantId,
          strings(rawAssets, `artwork.checkpointVariants.${variantId}`, file),
        ])),
    } : undefined,
  };
}

function normalizeLocale(
  value: QuizLocaleFile,
  manifest: QuizManifest,
  theme: QuizTheme,
  themeCssHref: string | undefined,
  socialAvatars: string[],
  file: string,
): Quiz {
  const title = text(value.title, "title", file);
  const summary = text(value.summary, "summary", file);
  if (value.landing?.startPrompt) {
    if (!manifest.engine.rewarded?.start) throw new Error(`${file}: landing.startPrompt requires a rewarded start gate.`);
    (["eyebrow", "icon", "title", "copy", "button"] as const)
      .forEach((key) => text(value.landing?.startPrompt?.[key], `landing.startPrompt.${key}`, file));
  }
  if (!Array.isArray(value.stages) || !value.stages.length) throw new Error(`${file}: stages are required.`);
  if (!Array.isArray(value.results?.profiles) || !value.results.profiles.length) throw new Error(`${file}: result profiles are required.`);
  const localeFlow = "linear";
  if (manifest.engine.checkpoint === "ai") {
    if (!value.checkpoint) throw new Error(`${file}: AI checkpoints need checkpoint copy.`);
    if (value.checkpoint.finalIcon !== undefined) text(value.checkpoint.finalIcon, "checkpoint.finalIcon", file);
    if (value.checkpoint.buttonIcon !== undefined) text(value.checkpoint.buttonIcon, "checkpoint.buttonIcon", file);
  }
  if (!value.career) throw new Error(`${file}: template ${manifest.template} requires checkpoint copy.`);
  if (value.career) {
    const career = value.career;
    for (const key of ["hideJourneyLength", "continuousShell", "showStageResults", "stageResultMode", "showCurrentScore", "showResultProgress", "currentScoreLabel", "levelLabel", "scoreSuffix", "journeyLabel", "kitchensCleared", "currentRank", "ranks", "unlockEyebrow", "unlockTitle", "unlockCopy", "finalEyebrow", "finalCareerTitle", "strongestLabel"]) {
      if ((career as unknown as Record<string, unknown>)[key] !== undefined) throw new Error(`${file}: career.${key} is obsolete or owned by template ${manifest.template}.`);
    }
    if (career.resultProgressLabel !== undefined) text(career.resultProgressLabel, "career.resultProgressLabel", file);
    const progressComplete = text(career.resultProgressComplete, "career.resultProgressComplete", file);
    if (!progressComplete.includes("{value}")) throw new Error(`${file}: career.resultProgressComplete must include {value}.`);
    if ((career as unknown as Record<string, unknown>).compactGate !== undefined) throw new Error(`${file}: career.compactGate is replaced by the shared checkpoint shell.`);
    if (!Array.isArray(career.stages) || career.stages.length !== value.stages.length) throw new Error(`${file}: career stages must match quiz stages.`);
    career.stages.forEach((stage, index) => {
      (["difficulty", "preAdTitle"] as const)
        .forEach((key) => text(stage[key], `career.stages[${index}].${key}`, file));
      for (const key of ["resultIcon", "resultLabel", "resultBands", "promotion"]) {
        if ((stage as unknown as Record<string, unknown>)[key] !== undefined) throw new Error(`${file}: career.stages[${index}].${key} belongs to the removed stage-result screen.`);
      }
      if (stage.preAdCopy !== undefined) text(stage.preAdCopy, `career.stages[${index}].preAdCopy`, file);
      if (stage.preAdButton !== undefined) text(stage.preAdButton, `career.stages[${index}].preAdButton`, file);
      const checks = stage.preAdChecks === undefined ? [] : strings(stage.preAdChecks, `career.stages[${index}].preAdChecks`, file);
      if (checks.length > 4) throw new Error(`${file}: career stage ${index + 1} cannot have more than four checks.`);
      if (index === value.stages.length - 1 && checks.length < 2) throw new Error(`${file}: the final career stage needs at least two checks.`);
      if (index < value.stages.length - 1 && !stage.next) throw new Error(`${file}: career stage ${index + 1} needs a next-stage teaser.`);
      if (stage.next) {
        (["eyebrow", "title", "difficulty", "tagline"] as const).forEach((key) => text(stage.next?.[key], `career.stages[${index}].next.${key}`, file));
        if ((stage.next as unknown as Record<string, unknown>).button !== undefined) throw new Error(`${file}: career.stages[${index}].next.button is owned by shared i18n.`);
        if (stage.next.copy !== undefined) text(stage.next.copy, `career.stages[${index}].next.copy`, file);
      }
    });
    if (!manifest.engine.rewarded?.stages) throw new Error(`${file}: checkpoint mode requires the shared rewarded template.`);
  }

  const questions: QuizQuestion[] = [];
  const questionIds = new Set<string>();
  const stageEncouragement: string[] = [];
  value.stages.forEach((stage, stageIndex) => {
    text(stage.title, `stages[${stageIndex}].title`, file);
    if (!Array.isArray(stage.questions) || !stage.questions.length) throw new Error(`${file}: every stage needs questions.`);
    if (stageIndex < value.stages.length - 1) {
      stageEncouragement.push(manifest.engine.checkpoint === "ai"
        ? ""
        : text(stage.complete, `stages[${stageIndex}].complete`, file));
    }
    stage.questions.forEach((rawQuestion) => {
      const index = questions.length;
      const prompt = text(rawQuestion.question, `questions[${index}].question`, file);
      const presentation = rawQuestion.presentation ?? "text";
      if (!["text", "icons", "scale", "memory-cue", "sequence", "grid", "code", "spatial"].includes(presentation)) throw new Error(`${file}: question ${index + 1} has an invalid presentation.`);
      const isKnowledgeQuiz = manifest.engine.scoring === "correct-answer";
      const isHybridQuiz = manifest.engine.scoring === "hybrid-match";
      const isMemoryCue = presentation === "memory-cue";
      let study: QuizStudyCue | undefined;
      if (rawQuestion.study) {
        const studyPresentation = rawQuestion.study.presentation ?? "text";
        const studyMode = rawQuestion.study.mode ?? "manual";
        const durationMs = rawQuestion.study.durationMs ?? 2000;
        if (!["text", "icons"].includes(studyPresentation)) throw new Error(`${file}: question ${index + 1} has an invalid study presentation.`);
        if (!["manual", "automatic"].includes(studyMode)) throw new Error(`${file}: question ${index + 1} has an invalid study mode.`);
        if (!Number.isInteger(durationMs) || durationMs < 1000 || durationMs > 6000) throw new Error(`${file}: question ${index + 1} study duration must be 1000–6000ms.`);
        const studyItems = strings(rawQuestion.study.items, `questions[${index}].study.items`, file);
        if (studyItems.length < 2 || studyItems.length > 8) throw new Error(`${file}: question ${index + 1} study needs two to eight items.`);
        study = {
          title: text(rawQuestion.study.title, `questions[${index}].study.title`, file),
          instruction: rawQuestion.study.instruction,
          presentation: studyPresentation,
          items: studyItems,
          durationMs,
          mode: studyMode,
          continueLabel: rawQuestion.study.continueLabel,
          ariaLabel: rawQuestion.study.ariaLabel,
        };
        if (studyMode === "manual") text(study.continueLabel, `questions[${index}].study.continueLabel`, file);
      }
      if (isMemoryCue && (!rawQuestion.memoryItems || rawQuestion.memoryItems.length < 3 || rawQuestion.memoryItems.length > 4)) throw new Error(`${file}: memory cue ${index + 1} needs three or four items.`);
      if (!isMemoryCue && (!rawQuestion.answers || typeof rawQuestion.answers !== "object")) throw new Error(`${file}: question ${index + 1} needs answers.`);
      if (isKnowledgeQuiz && !isMemoryCue && !Array.isArray(rawQuestion.answers)) throw new Error(`${file}: knowledge question ${index + 1} needs an answer array.`);
      if (isHybridQuiz && !isMemoryCue && rawQuestion.correct !== undefined && !Array.isArray(rawQuestion.answers)) throw new Error(`${file}: hybrid scored question ${index + 1} needs an answer array.`);
      if (isHybridQuiz && !isMemoryCue && rawQuestion.correct === undefined && Array.isArray(rawQuestion.answers)) throw new Error(`${file}: hybrid fit question ${index + 1} needs weighted answers.`);
      const answerEntries = isMemoryCue ? [[text(rawQuestion.continueLabel, `questions[${index}].continueLabel`, file), null] as const] : Array.isArray(rawQuestion.answers)
        ? rawQuestion.answers.map((answer) => [text(answer, `questions[${index}].answers`, file), null] as const)
        : Object.entries(rawQuestion.answers ?? {});
      if (!isMemoryCue && (answerEntries.length < 2 || answerEntries.length > 5)) throw new Error(`${file}: question ${index + 1} needs two to five answers.`);
      const choices = answerEntries.map(([answer]) => answer);
      const profileIds = answerEntries.map(([, meaning]) => typeof meaning === "string" ? meaning : "");
      const weights = answerEntries.map(([, meaning]) => meaning && typeof meaning === "object" ? meaning : {});
      if (!isMemoryCue && (isKnowledgeQuiz || rawQuestion.correct !== undefined) && (!Number.isInteger(rawQuestion.correct) || rawQuestion.correct! < 0 || rawQuestion.correct! >= choices.length)) {
        throw new Error(`${file}: knowledge question ${index + 1} needs a valid correct index.`);
      }
      if (!isKnowledgeQuiz && !isMemoryCue && !Array.isArray(rawQuestion.answers) && answerEntries.some(([, meaning]) => typeof meaning !== "string" && (!meaning || typeof meaning !== "object"))) {
        throw new Error(`${file}: weighted question ${index + 1} needs a profile id or weight map for every answer.`);
      }
      if (isHybridQuiz && rawQuestion.correct === undefined) {
        const traits = new Set(manifest.engine.match?.traits ?? []);
        weights.forEach((weightMap, choiceIndex) => {
          const entries = Object.entries(weightMap);
          if (!entries.length || entries.some(([trait, weight]) => !traits.has(trait) || typeof weight !== "number" || !Number.isFinite(weight) || weight < 0) || Math.abs(entries.reduce((sum, [, weight]) => sum + weight, 0) - 1) > 1e-9) {
            throw new Error(`${file}: hybrid fit question ${index + 1} answer ${choiceIndex + 1} needs known non-negative trait weights totalling 1.`);
          }
        });
      }
      if (presentation === "icons" && !rawQuestion.icons) throw new Error(`${file}: icon question ${index + 1} needs one icon per answer.`);
      if (rawQuestion.icons && rawQuestion.icons.length !== choices.length) throw new Error(`${file}: question ${index + 1} needs one icon per answer.`);
      if (presentation === "scale" && choices.length !== 5) throw new Error(`${file}: scale question ${index + 1} needs five stops.`);
      let visual: QuizQuestionVisual | undefined;
      if (["sequence", "grid", "code", "spatial"].includes(presentation)) {
        const rawVisual = object(rawQuestion.visual, `questions[${index}].visual`, file);
        const items = strings(rawVisual.items, `questions[${index}].visual.items`, file);
        const ariaLabel = text(rawVisual.ariaLabel, `questions[${index}].visual.ariaLabel`, file);
        const columns = rawVisual.columns === undefined ? undefined : Number(rawVisual.columns);
        const separator = rawVisual.separator === undefined ? undefined : text(rawVisual.separator, `questions[${index}].visual.separator`, file);
        if (presentation === "sequence" && (items.length < 3 || items.length > 8)) throw new Error(`${file}: sequence question ${index + 1} needs three to eight visual items.`);
        if (presentation === "grid" && (![4, 9].includes(items.length) || ![2, 3].includes(columns ?? 0))) throw new Error(`${file}: grid question ${index + 1} needs four or nine items and two or three columns.`);
        if (presentation === "code" && (items.length < 2 || items.length > 6)) throw new Error(`${file}: code question ${index + 1} needs two to six visual rules.`);
        if (presentation === "spatial" && (items.length < 1 || items.length > 6)) throw new Error(`${file}: spatial question ${index + 1} needs one to six visual items.`);
        visual = { items, columns, separator, ariaLabel };
      } else if (rawQuestion.visual !== undefined) {
        throw new Error(`${file}: question ${index + 1} cannot use visual data with ${presentation} presentation.`);
      }
      let image: QuizQuestionImage | undefined;
      if (rawQuestion.image !== undefined) {
        const rawImage = object(rawQuestion.image, `questions[${index}].image`, file);
        image = {
          src: text(rawImage.src, `questions[${index}].image.src`, file),
          alt: text(rawImage.alt, `questions[${index}].image.alt`, file),
        };
      }
      if (rawQuestion.calibration && (rawQuestion.calibration.length !== choices.length || rawQuestion.calibration.some((item) => typeof item !== "number" || item < -1 || item > 1))) throw new Error(`${file}: question ${index + 1} calibration values must match answers and be between -1 and 1.`);
      if (rawQuestion.delay !== undefined && (!Number.isInteger(rawQuestion.delay) || rawQuestion.delay < 200 || rawQuestion.delay > 600)) throw new Error(`${file}: question ${index + 1} delay must be between 200 and 600.`);
      if (rawQuestion.reasoningSteps !== undefined && (!Number.isInteger(rawQuestion.reasoningSteps) || rawQuestion.reasoningSteps < 1 || rawQuestion.reasoningSteps > 4)) throw new Error(`${file}: question ${index + 1} reasoningSteps must be between one and four.`);
      if (rawQuestion.interactionStyle !== undefined) text(rawQuestion.interactionStyle, `questions[${index}].interactionStyle`, file);
      const id = rawQuestion.id === undefined
        ? `q-${index + 1}`
        : text(rawQuestion.id, `questions[${index}].id`, file);
      if (questionIds.has(id)) throw new Error(`${file}: duplicate question id ${id}.`);
      questionIds.add(id);
      questions.push({
        id,
        type: "single-choice",
        presentation,
        context: rawQuestion.context === undefined ? undefined : text(rawQuestion.context, "question context", file),
        visual,
        image,
        prompt,
        headerLabel: rawQuestion.headerLabel === undefined ? undefined : text(rawQuestion.headerLabel, "question headerLabel", file),
        choices,
        icons: rawQuestion.icons,
        memoryItems: rawQuestion.memoryItems,
        continueLabel: rawQuestion.continueLabel,
        study,
        calibrationValues: rawQuestion.calibration,
        advanceDelayMs: rawQuestion.delay,
        answerIndex: rawQuestion.correct,
        choiceProfileIds: profileIds.some(Boolean) ? profileIds : undefined,
        choiceWeights: weights.some((item) => Object.keys(item).length) ? weights : undefined,
        category: rawQuestion.category,
        reasoningSteps: rawQuestion.reasoningSteps,
        interactionStyle: rawQuestion.interactionStyle,
        stage: stageIndex,
      });
    });
  });

  const profiles = value.results.profiles.map((profile, index) => ({
    id: profile.id,
    minRatio: profile.min ?? 0,
    tier: text(profile.tier, `results.profiles[${index}].tier`, file),
    title: text(profile.title, `results.profiles[${index}].title`, file),
    copy: text(profile.copy, `results.profiles[${index}].copy`, file),
    percentile: profile.label ?? profile.tier,
    icon: profile.icon,
    aura: profile.aura,
    traits: profile.traits as [string, string, string] | undefined,
    firstFeature: profile.firstFeature,
  }));
  if (["weighted-profile", "hybrid-match"].includes(manifest.engine.scoring) && profiles.some((profile) => !profile.id)) {
    throw new Error(`${file}: profile and match result profiles need ids.`);
  }
  if (value.results.profileReveal) {
    if (manifest.engine.scoring !== "weighted-profile") throw new Error(`${file}: profileReveal is only supported by weighted-profile quizzes.`);
    const reveal = value.results.profileReveal;
    (["eyebrow", "auraLabel", "traitsLabel", "strongestEnergy", "hiddenEnergy", "consistency", "disclaimer"] as const)
      .forEach((key) => text(reveal[key], `results.profileReveal.${key}`, file));
    (["high", "medium", "mixed"] as const).forEach((key) => text(reveal.consistencyLabels?.[key], `results.profileReveal.consistencyLabels.${key}`, file));
    if (reveal.auraLabelFirst !== undefined && typeof reveal.auraLabelFirst !== "boolean") throw new Error(`${file}: results.profileReveal.auraLabelFirst must be a boolean.`);
    if (reveal.firstFeatureLabel !== undefined) text(reveal.firstFeatureLabel, "results.profileReveal.firstFeatureLabel", file);
    if (reveal.portraitAlt !== undefined) {
      const portraitAlt = text(reveal.portraitAlt, "results.profileReveal.portraitAlt", file);
      if (!portraitAlt.includes("{profile}")) throw new Error(`${file}: results.profileReveal.portraitAlt must include {profile}.`);
    }
    profiles.forEach((profile, index) => {
      text(profile.icon, `results.profiles[${index}].icon`, file);
      text(profile.aura, `results.profiles[${index}].aura`, file);
      if (!Array.isArray(profile.traits) || profile.traits.length !== 3) throw new Error(`${file}: profileReveal profile ${index + 1} needs exactly three traits.`);
      profile.traits.forEach((trait, traitIndex) => text(trait, `results.profiles[${index}].traits[${traitIndex}]`, file));
      if (reveal.firstFeatureLabel !== undefined) text(profile.firstFeature, `results.profiles[${index}].firstFeature`, file);
      if (!profile.id || (!manifest.theme.artwork?.profiles?.[profile.id] && !manifest.theme.artwork?.profileVariants?.[profile.id])) {
        throw new Error(`${file}: profileReveal profile ${profile.id ?? index + 1} needs configured artwork.`);
      }
    });
  }
  const profileIds = new Set(profiles.flatMap((profile) => profile.id ? [profile.id] : []));
  if (manifest.engine.scoring === "weighted-profile") {
    questions.forEach((question, index) => {
      if (question.presentation === "memory-cue") return;
      if (question.answerIndex !== undefined) return;
      const referencedProfiles = [
        ...(question.choiceProfileIds ?? []).filter(Boolean),
        ...(question.choiceWeights ?? []).flatMap((weights) => Object.keys(weights)),
      ];
      if (!referencedProfiles.length && question.calibrationValues === undefined && question.answerIndex === undefined) {
        throw new Error(`${file}: weighted question ${index + 1} has no scoring contribution.`);
      }
      referencedProfiles.forEach((profileId) => {
        if (!profileIds.has(profileId)) throw new Error(`${file}: question ${index + 1} references unknown profile ${profileId}.`);
      });
    });
  }
  if (manifest.engine.profileArtworkSelector) {
    const selector = manifest.engine.profileArtworkSelector;
    const selectorQuestion = questions.find((question) => question.id === selector.questionId);
    if (!selectorQuestion) throw new Error(`${file}: profileArtworkSelector references unknown question ${selector.questionId}.`);
    if (!selectorQuestion.calibrationValues?.every((value) => value === 0)) {
      throw new Error(`${file}: profileArtworkSelector question must be unscored with zero calibration values.`);
    }
    Object.entries(selector.fixedVariants).forEach(([choiceIndex, variantId]) => {
      const index = Number(choiceIndex);
      if (!Number.isInteger(index) || index < 0 || index >= selectorQuestion.choices.length) throw new Error(`${file}: profileArtworkSelector choice ${choiceIndex} is invalid.`);
      profiles.forEach((profile) => {
        if (!profile.id || !manifest.theme.artwork?.profileVariants?.[profile.id]?.[variantId]) {
          throw new Error(`${file}: profile ${profile.id ?? "unknown"} is missing artwork variant ${variantId}.`);
        }
      });
    });
    if (theme.artwork?.checkpoints && theme.artwork.checkpoints.length !== value.stages.length) {
      throw new Error(`${file}: checkpoint artwork must match the stage count.`);
    }
    for (const [variantId, assets] of Object.entries(theme.artwork?.checkpointVariants ?? {})) {
      if (assets.length !== value.stages.length) throw new Error(`${file}: checkpoint artwork variant ${variantId} must match the stage count.`);
    }
  }
  if (manifest.engine.scoring === "hybrid-match") {
    const candidateIds = manifest.engine.match?.candidates.map((candidate) => candidate.id) ?? [];
    if (JSON.stringify(profiles.map((profile) => profile.id)) !== JSON.stringify(candidateIds)) throw new Error(`${file}: hybrid result profile ids must match candidate ids in configured order.`);
    const matchCopy = value.results.match;
    if (!matchCopy) throw new Error(`${file}: hybrid-match results need match copy.`);
    (["academicChallenge", "correctLabel", "strongest", "preferredStyle", "alternative", "wildcard", "wildcardTemplate", "bestRound", "disclaimer"] as const)
      .forEach((key) => text(matchCopy[key], `results.match.${key}`, file));
    const traitLabels = object(matchCopy.traitLabels, "results.match.traitLabels", file);
    if (manifest.engine.match?.traits.some((trait) => typeof traitLabels[trait] !== "string" || !String(traitLabels[trait]).trim())) throw new Error(`${file}: results.match.traitLabels must cover every configured trait.`);
  }
  if (value.results.estimate !== undefined) {
    const estimate = value.results.estimate;
    (["eyebrow", "ageSuffix", "strongestSignal", "wildcard", "consistency", "disclaimer"] as const)
      .forEach((key) => text(estimate[key], `results.estimate.${key}`, file));
    (["high", "medium", "mixed"] as const)
      .forEach((key) => text(estimate.consistencyLabels?.[key], `results.estimate.consistencyLabels.${key}`, file));
    if (estimate.reviewUnlock !== undefined) {
      (["title", "copy", "button", "adNote", "reviewTitle", "yourChoice", "raised", "lowered", "neutral", "raisedCopy", "loweredCopy", "neutralCopy"] as const)
        .forEach((key) => text(estimate.reviewUnlock?.[key], `results.estimate.reviewUnlock.${key}`, file));
    }
    if (estimate.insights !== undefined) {
      const insights = estimate.insights;
      (["overview", "estimate", "signal", "consistency", "breakdown", "snapshot"] as const)
        .forEach((key) => text(insights[key], `results.estimate.insights.${key}`, file));
      if ("details" in insights) throw new Error(`${file}: obsolete results.estimate.insights.details copy is not rendered.`);
    }
  }
  if (manifest.engine.scoring === "correct-answer" && value.results.score) {
    (["passed", "finished", "correctLabel", "strongest", "trickiest", "bestRound", "disclaimer"] as const)
      .forEach((key) => text(value.results.score?.[key], `results.score.${key}`, file));
    if (manifest.engine.derivedScore) text(value.results.score.derivedLabel, "results.score.derivedLabel", file);
    if (value.results.score.showPercentage !== undefined && typeof value.results.score.showPercentage !== "boolean") throw new Error(`${file}: results.score.showPercentage must be a boolean.`);
    if (value.results.score.showBestRound !== undefined && typeof value.results.score.showBestRound !== "boolean") throw new Error(`${file}: results.score.showBestRound must be a boolean.`);
    if (value.results.score.retryLabel !== undefined) text(value.results.score.retryLabel, "results.score.retryLabel", file);
    if (value.results.score.reviewUnlock !== undefined) {
      (["title", "copy", "button", "adNote"] as const)
        .forEach((key) => text(value.results.score?.reviewUnlock?.[key], `results.score.reviewUnlock.${key}`, file));
    }
    if (value.results.score.insights !== undefined) {
      (["overview", "correct", "missed", "target", "breakdown", "snapshot"] as const)
        .forEach((key) => text(value.results.score?.insights?.[key], `results.score.insights.${key}`, file));
      if (value.results.score.insights.targetReached !== undefined) text(value.results.score.insights.targetReached, "results.score.insights.targetReached", file);
      if (value.results.score.insights.targetRemaining !== undefined) text(value.results.score.insights.targetRemaining, "results.score.insights.targetRemaining", file);
      if ("details" in value.results.score.insights) throw new Error(`${file}: obsolete results.score.insights.details copy is not rendered.`);
    }
  }
  if (value.about?.howToPlay) {
    text(value.about.howToPlay.title, "about.howToPlay.title", file);
    const steps = strings(value.about.howToPlay.steps, "about.howToPlay.steps", file);
    if (steps.length < 2 || steps.length > 5) throw new Error(`${file}: about.howToPlay needs two to five steps.`);
  }

  return {
    slug: manifest.slug,
    engine: {
      flow: { type: localeFlow, advance: manifest.engine.advance, feedback: manifest.engine.feedback },
      scoring: { type: manifest.engine.scoring },
      checkpoint: manifest.engine.checkpoint ?? "standard",
      startOnLoad: manifest.engine.startOnLoad ?? false,
      localeParity: manifest.engine.localeParity ?? "strict",
      rewarded: {
        start: manifest.engine.rewarded?.start ?? false,
        stages: manifest.engine.rewarded?.stages ?? false,
        attempts: manifest.engine.rewarded?.attempts ?? 3,
        confirmStart: manifest.engine.rewarded?.confirmStart ?? false,
      },
      advanceDelayMs: manifest.engine.advanceDelayMs ?? 275,
      targetRatio: manifest.engine.targetRatio,
      estimate: manifest.engine.estimate,
      derivedScore: manifest.engine.derivedScore,
      tieBreaks: manifest.engine.tieBreaks,
      match: manifest.engine.match,
      profileArtworkSelector: manifest.engine.profileArtworkSelector,
    },
    theme,
    themeCssHref,
    shellCssHref: SHARED_SHELL_CSS_HREF,
    title,
    eyebrow: value.eyebrow ?? "Quiz",
    summary,
    progressLabel: value.progressLabel === undefined ? undefined : text(value.progressLabel, "progressLabel", file),
    nextQuestionLabel: value.nextQuestionLabel === undefined ? undefined : text(value.nextQuestionLabel, "nextQuestionLabel", file),
    publishedAt: `${manifest.listing.published}T00:00:00Z`,
    difficulty: manifest.listing.difficulty,
    cardIcon: manifest.listing.icon,
    thumbnailUrl: manifest.listing.thumbnail,
    thumbnailAlt: title,
    footer: value.about ? {
      topicText: value.about.body,
      aboutText: value.about.disclaimer ?? value.about.body,
      howToPlay: value.about.howToPlay,
    } : undefined,
    landing: {
      quickStartText: value.landing?.intro ?? summary,
      infoBadge: value.landing?.badge,
      socialProofCount: manifest.listing.socialProofCount,
      ctaLabel: value.landing?.cta,
      socialAvatars,
      startPrompt: value.landing?.startPrompt,
    },
    stages: value.stages.map((stage) => stage.title),
    stageEncouragement,
    checkpoint: value.checkpoint,
    career: value.career,
    result: {
      profileName: text(value.results.name, "results.name", file),
      profiles,
      scoreDimensions: (value.results.dimensions ?? []).map((dimension) => ({
        label: dimension.label,
        categories: dimension.profiles ?? dimension.categories ?? [],
      })),
      estimate: value.results.estimate,
      score: value.results.score,
      match: value.results.match,
      profileReveal: value.results.profileReveal,
    },
    questions,
  };
}

function directory(slug: string) { return path.join(ROOT, slug); }
function hasLocale(slug: string, locale: SupportedLocale) { return fs.existsSync(path.join(directory(slug), `${locale}.json`)); }
function slugs() {
  quizSlugCache ??= fs.readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(ROOT, entry.name, "quiz.json")))
    .map((entry) => entry.name)
    .sort();
  return quizSlugCache;
}

function readQuiz(slug: string, locale: SupportedLocale) {
  const cacheKey = `${slug}:${locale}`;
  const cached = quizCache.get(cacheKey);
  if (cached) return cached;
  const manifest = validateManifest(json(path.join(directory(slug), "quiz.json")), `${slug}/quiz.json`);
  if (manifest.slug !== slug) throw new Error(`${slug}: folder and quiz id must match.`);
  manifest.listing.thumbnail = normalizeQuizAsset(ROOT, slug, manifest.listing.thumbnail);
  if (manifest.theme.artwork) {
    manifest.theme.artwork.landing = normalizeQuizAsset(ROOT, slug, manifest.theme.artwork.landing);
    manifest.theme.artwork.result = normalizeQuizAsset(ROOT, slug, manifest.theme.artwork.result);
    if (manifest.theme.artwork.profiles) {
      manifest.theme.artwork.profiles = Object.fromEntries(Object.entries(manifest.theme.artwork.profiles)
        .map(([id, value]) => [id, normalizeQuizAsset(ROOT, slug, value)!]));
    }
    if (manifest.theme.artwork.profileVariants) {
      manifest.theme.artwork.profileVariants = Object.fromEntries(Object.entries(manifest.theme.artwork.profileVariants)
        .map(([profileId, variants]) => [profileId, Object.fromEntries(Object.entries(variants)
          .map(([variantId, value]) => [variantId, normalizeQuizAsset(ROOT, slug, value)!]))]));
    }
    if (manifest.theme.artwork.checkpoints) {
      manifest.theme.artwork.checkpoints = manifest.theme.artwork.checkpoints.map((value) => normalizeQuizAsset(ROOT, slug, value)!);
    }
    if (manifest.theme.artwork.checkpointVariants) {
      manifest.theme.artwork.checkpointVariants = Object.fromEntries(Object.entries(manifest.theme.artwork.checkpointVariants)
        .map(([variantId, assets]) => [variantId, assets.map((value) => normalizeQuizAsset(ROOT, slug, value)!)]));
    }
  }
  const cssFile = path.join(directory(slug), "theme.css");
  const themeCss = fs.existsSync(cssFile) ? fs.readFileSync(cssFile, "utf8") : undefined;
  const themeCssHref = themeCss ? themeStylesheetHref(slug, themeCss) : undefined;
  const socialAvatars = normalizedSocialAvatars(slug);
  const localeFile = `${slug}/${locale}.json`;
  const rawLocale = json<unknown>(path.join(directory(slug), `${locale}.json`));
  const localized = expandLocaleV2(rawLocale, manifest, locale, localeFile);
  const quiz = normalizeLocale(localized, manifest, manifest.theme, themeCssHref, socialAvatars, localeFile);
  quizCache.set(cacheKey, quiz);
  return quiz;
}

export function getQuizLocales(slug: string) {
  if (!fs.existsSync(directory(slug))) return [];
  const cached = quizLocaleCache.get(slug);
  if (cached) return [...cached];
  const locales = fs.readdirSync(directory(slug))
    .filter((file) => file.endsWith(".json") && file !== "quiz.json")
    .map((file) => file.replace(/\.json$/, ""))
    .filter((locale): locale is SupportedLocale => LOCALES.has(locale as SupportedLocale))
    .sort();
  quizLocaleCache.set(slug, locales);
  return [...locales];
}

export function getQuizBySlug(slug: string, locale?: string, options: { includeFallback?: boolean } = {}) {
  const safeLocale = locale && isSupportedLocale(locale) ? locale : getDefaultLocale();
  if (!slugs().includes(slug)) return undefined;
  if (!hasLocale(slug, safeLocale)) return options.includeFallback ? readQuiz(slug, getDefaultLocale()) : undefined;
  return readQuiz(slug, safeLocale);
}

export function getAllQuizzes(locale?: string, options: { includeFallback?: boolean } = {}) {
  const safeLocale = locale && isSupportedLocale(locale) ? locale : getDefaultLocale();
  const cacheKey = `${safeLocale}:${options.includeFallback === true}`;
  const cached = quizListCache.get(cacheKey);
  if (cached) return [...cached];
  const quizzes = slugs().flatMap((slug) => {
    const quiz = getQuizBySlug(slug, locale, options);
    return quiz ? [quiz] : [];
  });
  quizListCache.set(cacheKey, quizzes);
  return [...quizzes];
}

export type QuizRecommendation = {
  href: string;
  summary: string;
  thumbnailAlt: string;
  thumbnailUrl: string;
  title: string;
};

function recommendationRank(seed: string, slug: string) {
  return createHash("sha256").update(`${seed}:${slug}`).digest().readUInt32BE(0);
}

export function getQuizRecommendations(
  currentSlug: string,
  locale: SupportedLocale,
  getHref: (slug: string) => string,
  limit = 3,
): QuizRecommendation[] {
  const seed = `${locale}:${currentSlug}`;
  return getAllQuizzes(locale)
    .filter((candidate) => candidate.slug !== currentSlug)
    .sort((left, right) => recommendationRank(seed, left.slug) - recommendationRank(seed, right.slug))
    .slice(0, Math.max(0, limit))
    .map((candidate) => ({
      href: getHref(candidate.slug),
      summary: candidate.summary,
      thumbnailAlt: candidate.thumbnailAlt,
      thumbnailUrl: `/quizzes/${candidate.slug}/assets/thumbnail-480.webp`,
      title: candidate.title,
    }));
}
