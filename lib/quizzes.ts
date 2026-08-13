import fs from "node:fs";
import path from "node:path";

import {
  getDefaultLocale,
  getSupportedLocales,
  isSupportedLocale,
  type SupportedLocale,
} from "@/lib/i18n";

export type QuizFlow = {
  type: "linear" | "staged";
  advance: "automatic" | "manual";
  feedback: "instant" | "selection-only" | "after-results";
};

export type QuizScoring = { type: "correct-answer" | "weighted-profile" | "hybrid-match" };
export type QuizRewardedConfig = { start: boolean; stages: boolean; attempts: number };
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
export type QuizQuestionVisual = {
  items: string[];
  columns?: number;
  separator?: string;
  ariaLabel: string;
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
  rewarded: QuizRewardedConfig;
  advanceDelayMs: number;
  targetRatio?: number;
  estimate?: QuizEstimateConfig;
  derivedScore?: QuizDerivedScoreConfig;
  tieBreaks?: QuizTieBreakConfig;
  match?: QuizMatchConfig;
};

export type QuizQuestion = {
  id: string;
  type: "single-choice";
  presentation: QuizPresentation;
  context?: string;
  visual?: QuizQuestionVisual;
  prompt: string;
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
  explanation?: string;
  category?: string;
  reasoningSteps?: number;
  stage: number;
};

export type QuizResultProfile = {
  id?: string;
  minRatio: number;
  tier: string;
  title: string;
  copy: string;
  percentile: string;
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
  };
};

export type QuizTheme = {
  id: string;
  preset: "clean" | "editorial" | "playful" | "immersive";
  layout: {
    landing: "card" | "split" | "immersive";
    questions: "card" | "open";
    results: "card" | "immersive";
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
  artwork?: { landing?: string; result?: string; icon?: string };
};

export type QuizCheckpointReveal = {
  title: string;
  signal: "fixed" | "trend" | "consistency" | "score-band" | "strongest-dimension" | "target-status";
  message?: string;
  template?: string;
  variants?: Record<string, string>;
};
export type QuizCheckpointCopy = {
  nextPrefix: string;
  adNote: string;
  reveals: QuizCheckpointReveal[];
  finalBadge: string;
  finalTitle: string;
  finalCopy: string;
  finalButton: string;
  finalChecklist: string[];
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
  customCss?: string;
  title: string;
  eyebrow: string;
  summary: string;
  duration: string;
  publishedAt: string;
  questionCount: number;
  difficulty: "Quick" | "Medium" | "Hard" | "Expert";
  cardIcon: string;
  thumbnailUrl?: string;
  thumbnailAlt: string;
  footer?: {
    aboutText: string;
    topicText?: string;
    howToPlay?: { title: string; steps: string[] };
  };
  landing: { quickStartText: string; ctaLabel?: string; infoBadge?: string; socialProof: string; socialAvatars: string[] };
  stages: string[];
  stageEncouragement: string[];
  checkpoint?: QuizCheckpointCopy;
  result: QuizResultConfig & { score?: QuizScoreResultCopy; match?: QuizMatchResultCopy };
  questions: QuizQuestion[];
};

type QuizManifest = {
  slug: string;
  engine: {
    flow: QuizFlow["type"];
    advance: QuizFlow["advance"];
    feedback: QuizFlow["feedback"];
    scoring: QuizScoring["type"];
    checkpoint?: QuizEngineConfig["checkpoint"];
    rewarded?: Partial<QuizRewardedConfig>;
    advanceDelayMs?: number;
    targetRatio?: number;
    estimate?: QuizEstimateConfig;
    derivedScore?: QuizDerivedScoreConfig;
    tieBreaks?: QuizTieBreakConfig;
    match?: QuizMatchConfig;
  };
  listing: {
    thumbnail?: string;
    published: string;
    duration: string;
    difficulty: Quiz["difficulty"];
    icon: string;
  };
  theme: QuizTheme;
};

type QuizLocaleFile = {
  title: string;
  eyebrow?: string;
  summary: string;
  landing?: { intro?: string; badge?: string; socialProof?: string; cta?: string };
  about?: {
    body: string;
    disclaimer?: string;
    howToPlay?: { title: string; steps: string[] };
  };
  checkpoint?: QuizCheckpointCopy;
  results: {
    name: string;
    profiles: Array<{
      id?: string;
      min?: number;
      tier: string;
      title: string;
      copy: string;
      label?: string;
    }>;
    dimensions?: Array<{ label: string; profiles?: string[]; categories?: string[] }>;
    estimate?: QuizResultConfig["estimate"];
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
      question: string;
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
      explanation?: string;
      category?: string;
      reasoningSteps?: number;
    }>;
  }>;
};

const ROOT = path.join(process.cwd(), "data", "quizzes");
const LOCALES = new Set(getSupportedLocales());
const DIFFICULTIES = new Set(["Quick", "Medium", "Hard", "Expert"]);
const RESERVED_SLUGS = new Set([...getSupportedLocales(), "info", "api", "_next"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ASSET_PATH = /^(?:\/(?:images|quizzes)\/|assets\/)[a-zA-Z0-9_./-]+$/;

function json<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function quizAsset(slug: string, value?: string) {
  if (!value || value.startsWith("/")) return value;
  const file = path.join(directory(slug), value);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`${slug}: missing asset ${value}.`);
  const publicValue = /^assets\/thumbnail\.(?:jpe?g|png|webp)$/i.test(value)
    ? "assets/thumbnail-960.webp"
    : value;
  const publicFile = path.join(process.cwd(), "public", "quizzes", slug, publicValue);
  if (!fs.existsSync(publicFile) || !fs.statSync(publicFile).isFile()) {
    throw new Error(`${slug}: missing public asset ${publicValue}.`);
  }
  return `/quizzes/${slug}/${publicValue}`;
}

function object(value: unknown, name: string, file: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${file}: ${name} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, name: string, file: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${file}: ${name} is required.`);
  return value;
}

function strings(value: unknown, name: string, file: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new Error(`${file}: ${name} must be a string array.`);
  }
  return value as string[];
}

function validateManifest(value: unknown, file: string): QuizManifest {
  const raw = object(value, "quiz", file);
  const engine = object(raw.engine, "engine", file);
  const listing = object(raw.listing, "listing", file);
  if (!["linear", "staged"].includes(String(engine.flow))) throw new Error(`${file}: invalid flow.`);
  if (!["automatic", "manual"].includes(String(engine.advance))) throw new Error(`${file}: invalid advance mode.`);
  if (!["instant", "selection-only", "after-results"].includes(String(engine.feedback))) throw new Error(`${file}: invalid feedback mode.`);
  if (!["correct-answer", "weighted-profile", "hybrid-match"].includes(String(engine.scoring))) throw new Error(`${file}: invalid scoring mode.`);
  if (engine.checkpoint !== undefined && !["standard", "ai"].includes(String(engine.checkpoint))) throw new Error(`${file}: invalid checkpoint mode.`);
  const advanceDelayMs = engine.advanceDelayMs === undefined ? 275 : Number(engine.advanceDelayMs);
  if (!Number.isInteger(advanceDelayMs) || advanceDelayMs < 200 || advanceDelayMs > 600) throw new Error(`${file}: engine.advanceDelayMs must be between 200 and 600.`);
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
    if (![academicWeight, styleWeight].every((weight) => Number.isFinite(weight) && weight > 0) || Math.abs(academicWeight + styleWeight - 1) > 1e-9) {
      throw new Error(`${file}: match academicWeight and styleWeight must be positive and total 1.`);
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
  if (engine.rewarded !== undefined) {
    const rewarded = object(engine.rewarded, "engine.rewarded", file);
    if (rewarded.start !== undefined && typeof rewarded.start !== "boolean") throw new Error(`${file}: rewarded.start must be a boolean.`);
    if (rewarded.stages !== undefined && typeof rewarded.stages !== "boolean") throw new Error(`${file}: rewarded.stages must be a boolean.`);
    if (rewarded.attempts !== undefined && (!Number.isInteger(rewarded.attempts) || Number(rewarded.attempts) < 1 || Number(rewarded.attempts) > 5)) throw new Error(`${file}: rewarded.attempts must be between 1 and 5.`);
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
  return {
    slug,
    engine: { ...engine, advanceDelayMs, targetRatio, estimate, derivedScore, tieBreaks, match } as QuizManifest["engine"],
    listing: {
      thumbnail: listing.thumbnail as string | undefined,
      published: text(listing.published, "listing.published", file),
      duration: text(listing.duration, "listing.duration", file),
      difficulty: listing.difficulty as Quiz["difficulty"],
      icon: text(listing.icon, "listing.icon", file),
    },
    theme: validateTheme({ ...object(raw.theme, "theme", file), id: slug }, file),
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
  if (!["card", "split", "immersive"].includes(String(layout.landing))) throw new Error(`${file}: invalid landing layout.`);
  if (!["card", "open"].includes(String(layout.questions))) throw new Error(`${file}: invalid question layout.`);
  if (!["card", "immersive"].includes(String(layout.results))) throw new Error(`${file}: invalid result layout.`);
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
    } : undefined,
  };
}

function normalizeLocale(
  value: QuizLocaleFile,
  manifest: QuizManifest,
  theme: QuizTheme,
  customCss: string | undefined,
  socialAvatars: string[],
  file: string,
): Quiz {
  const title = text(value.title, "title", file);
  const summary = text(value.summary, "summary", file);
  if (!Array.isArray(value.stages) || !value.stages.length) throw new Error(`${file}: stages are required.`);
  if (!Array.isArray(value.results?.profiles) || !value.results.profiles.length) throw new Error(`${file}: result profiles are required.`);
  if (manifest.engine.flow === "staged" && value.stages.length < 2) throw new Error(`${file}: staged quizzes need at least two stages.`);
  if (manifest.engine.checkpoint === "ai") {
    if (!value.checkpoint) throw new Error(`${file}: AI checkpoints need checkpoint copy.`);
    if (!Array.isArray(value.checkpoint.reveals) || value.checkpoint.reveals.length !== value.stages.length) throw new Error(`${file}: checkpoint reveals must match the stage count.`);
    value.checkpoint.reveals.forEach((reveal, index) => {
      text(reveal.title, `checkpoint.reveals[${index}].title`, file);
      if (!["fixed", "trend", "consistency", "score-band", "strongest-dimension", "target-status"].includes(reveal.signal)) throw new Error(`${file}: invalid checkpoint signal.`);
      if (reveal.signal === "fixed") text(reveal.message, `checkpoint.reveals[${index}].message`, file);
      else if (reveal.signal === "strongest-dimension") text(reveal.template, `checkpoint.reveals[${index}].template`, file);
      else if (!reveal.variants || Object.values(reveal.variants).some((variant) => typeof variant !== "string" || !variant.trim())) throw new Error(`${file}: checkpoint reveal ${index + 1} needs variants.`);
    });
    strings(value.checkpoint.finalChecklist, "checkpoint.finalChecklist", file);
    if (value.checkpoint.finalChecklist.length < 3 || value.checkpoint.finalChecklist.length > 8) throw new Error(`${file}: final checklist needs three to eight items.`);
    ["nextPrefix", "adNote", "finalBadge", "finalTitle", "finalCopy", "finalButton"].forEach((key) => text(value.checkpoint?.[key as keyof QuizCheckpointCopy], `checkpoint.${key}`, file));
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
      if (presentation === "icons" && (!rawQuestion.icons || rawQuestion.icons.length !== choices.length)) throw new Error(`${file}: icon question ${index + 1} needs one icon per answer.`);
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
      if (rawQuestion.calibration && (rawQuestion.calibration.length !== choices.length || rawQuestion.calibration.some((item) => typeof item !== "number" || item < -1 || item > 1))) throw new Error(`${file}: question ${index + 1} calibration values must match answers and be between -1 and 1.`);
      if (rawQuestion.delay !== undefined && (!Number.isInteger(rawQuestion.delay) || rawQuestion.delay < 200 || rawQuestion.delay > 600)) throw new Error(`${file}: question ${index + 1} delay must be between 200 and 600.`);
      if (rawQuestion.reasoningSteps !== undefined && (!Number.isInteger(rawQuestion.reasoningSteps) || rawQuestion.reasoningSteps < 1 || rawQuestion.reasoningSteps > 4)) throw new Error(`${file}: question ${index + 1} reasoningSteps must be between one and four.`);
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
        prompt,
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
        explanation: rawQuestion.explanation,
        category: rawQuestion.category,
        reasoningSteps: rawQuestion.reasoningSteps,
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
  }));
  if (["weighted-profile", "hybrid-match"].includes(manifest.engine.scoring) && profiles.some((profile) => !profile.id)) {
    throw new Error(`${file}: profile and match result profiles need ids.`);
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
  if (manifest.engine.scoring === "correct-answer" && value.results.score) {
    (["passed", "finished", "correctLabel", "strongest", "trickiest", "bestRound", "disclaimer"] as const)
      .forEach((key) => text(value.results.score?.[key], `results.score.${key}`, file));
    if (manifest.engine.derivedScore) text(value.results.score.derivedLabel, "results.score.derivedLabel", file);
    if (value.results.score.showPercentage !== undefined && typeof value.results.score.showPercentage !== "boolean") throw new Error(`${file}: results.score.showPercentage must be a boolean.`);
  }
  if (value.about?.howToPlay) {
    text(value.about.howToPlay.title, "about.howToPlay.title", file);
    const steps = strings(value.about.howToPlay.steps, "about.howToPlay.steps", file);
    if (steps.length < 2 || steps.length > 5) throw new Error(`${file}: about.howToPlay needs two to five steps.`);
  }

  return {
    slug: manifest.slug,
    engine: {
      flow: { type: manifest.engine.flow, advance: manifest.engine.advance, feedback: manifest.engine.feedback },
      scoring: { type: manifest.engine.scoring },
      checkpoint: manifest.engine.checkpoint ?? "standard",
      rewarded: {
        start: manifest.engine.rewarded?.start ?? false,
        stages: manifest.engine.rewarded?.stages ?? false,
        attempts: manifest.engine.rewarded?.attempts ?? 3,
      },
      advanceDelayMs: manifest.engine.advanceDelayMs ?? 275,
      targetRatio: manifest.engine.targetRatio,
      estimate: manifest.engine.estimate,
      derivedScore: manifest.engine.derivedScore,
      tieBreaks: manifest.engine.tieBreaks,
      match: manifest.engine.match,
    },
    theme,
    customCss,
    title,
    eyebrow: value.eyebrow ?? "Quiz",
    summary,
    duration: manifest.listing.duration,
    publishedAt: `${manifest.listing.published}T00:00:00Z`,
    questionCount: questions.length,
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
      socialProof: value.landing?.socialProof ?? "",
      ctaLabel: value.landing?.cta,
      socialAvatars,
    },
    stages: value.stages.map((stage) => stage.title),
    stageEncouragement,
    checkpoint: value.checkpoint,
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
    },
    questions,
  };
}

function directory(slug: string) { return path.join(ROOT, slug); }
function hasLocale(slug: string, locale: SupportedLocale) { return fs.existsSync(path.join(directory(slug), `${locale}.json`)); }
function slugs() {
  return fs.readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(ROOT, entry.name, "quiz.json")))
    .map((entry) => entry.name)
    .sort();
}

function readQuiz(slug: string, locale: SupportedLocale) {
  const manifest = validateManifest(json(path.join(directory(slug), "quiz.json")), `${slug}/quiz.json`);
  if (manifest.slug !== slug) throw new Error(`${slug}: folder and quiz id must match.`);
  manifest.listing.thumbnail = quizAsset(slug, manifest.listing.thumbnail);
  if (manifest.theme.artwork) {
    manifest.theme.artwork.landing = quizAsset(slug, manifest.theme.artwork.landing);
    manifest.theme.artwork.result = quizAsset(slug, manifest.theme.artwork.result);
  }
  const cssFile = path.join(directory(slug), "theme.css");
  const customCss = fs.existsSync(cssFile) ? fs.readFileSync(cssFile, "utf8") : undefined;
  const avatarDirectory = path.join(directory(slug), "assets", "avatars");
  const socialAvatars = fs.existsSync(avatarDirectory)
    ? fs.readdirSync(avatarDirectory)
      .filter((file) => /\.(?:jpe?g|png|webp)$/i.test(file))
      .sort()
      .slice(0, 4)
      .map((file) => quizAsset(slug, `assets/avatars/${file}`)!)
    : [];
  return normalizeLocale(json(path.join(directory(slug), `${locale}.json`)), manifest, manifest.theme, customCss, socialAvatars, `${slug}/${locale}.json`);
}

function sameStructure(localized: Quiz, source: Quiz, file: string) {
  if (localized.questions.length !== source.questions.length || localized.stages.length !== source.stages.length) throw new Error(`${file}: structure must match en.json.`);
  localized.questions.forEach((question, index) => {
    const original = source.questions[index];
    const studyStructure = question.study ? [question.study.presentation, question.study.items.length, question.study.durationMs, question.study.mode] : undefined;
    const originalStudyStructure = original.study ? [original.study.presentation, original.study.items.length, original.study.durationMs, original.study.mode] : undefined;
    const visualStructure = question.visual ? [question.visual.items.length, question.visual.columns, question.visual.separator] : undefined;
    const originalVisualStructure = original.visual ? [original.visual.items.length, original.visual.columns, original.visual.separator] : undefined;
    if (question.id !== original.id || question.presentation !== original.presentation || Boolean(question.context) !== Boolean(original.context) || question.choices.length !== original.choices.length || question.stage !== original.stage || question.answerIndex !== original.answerIndex || question.category !== original.category || question.advanceDelayMs !== original.advanceDelayMs || question.reasoningSteps !== original.reasoningSteps || JSON.stringify(question.icons) !== JSON.stringify(original.icons) || JSON.stringify(visualStructure) !== JSON.stringify(originalVisualStructure) || JSON.stringify(studyStructure) !== JSON.stringify(originalStudyStructure) || JSON.stringify(question.calibrationValues) !== JSON.stringify(original.calibrationValues) || JSON.stringify(question.choiceProfileIds) !== JSON.stringify(original.choiceProfileIds) || JSON.stringify(question.choiceWeights) !== JSON.stringify(original.choiceWeights)) {
      throw new Error(`${file}: question ${index + 1} structure must match en.json.`);
    }
  });
  const localizedProfiles = localized.result.profiles.map(({ id, minRatio }) => ({ id, minRatio }));
  const sourceProfiles = source.result.profiles.map(({ id, minRatio }) => ({ id, minRatio }));
  if (JSON.stringify(localizedProfiles) !== JSON.stringify(sourceProfiles)) {
    throw new Error(`${file}: result profile ids and thresholds must match en.json.`);
  }
  const localizedDimensions = localized.result.scoreDimensions.map((dimension) => dimension.categories);
  const sourceDimensions = source.result.scoreDimensions.map((dimension) => dimension.categories);
  if (JSON.stringify(localizedDimensions) !== JSON.stringify(sourceDimensions)) {
    throw new Error(`${file}: result dimension category ids must match en.json.`);
  }
}

export function getQuizLocales(slug: string) {
  if (!fs.existsSync(directory(slug))) return [];
  return fs.readdirSync(directory(slug))
    .filter((file) => file.endsWith(".json") && file !== "quiz.json")
    .map((file) => file.replace(/\.json$/, ""))
    .filter((locale): locale is SupportedLocale => LOCALES.has(locale as SupportedLocale))
    .sort();
}

export function getQuizBySlug(slug: string, locale?: string, options: { includeFallback?: boolean } = {}) {
  const safeLocale = locale && isSupportedLocale(locale) ? locale : getDefaultLocale();
  if (!slugs().includes(slug)) return undefined;
  if (!hasLocale(slug, safeLocale)) return options.includeFallback ? readQuiz(slug, getDefaultLocale()) : undefined;
  const quiz = readQuiz(slug, safeLocale);
  if (safeLocale !== getDefaultLocale()) sameStructure(quiz, readQuiz(slug, getDefaultLocale()), `${slug}/${safeLocale}.json`);
  return quiz;
}

export function getAllQuizzes(locale?: string, options: { includeFallback?: boolean } = {}) {
  return slugs().flatMap((slug) => {
    const quiz = getQuizBySlug(slug, locale, options);
    return quiz ? [quiz] : [];
  });
}
