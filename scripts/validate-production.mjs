import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const errors = [];

function addError(message) {
  errors.push(message);
}

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const paths = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if ([".git", ".next", "node_modules", "out"].includes(entry.name)) continue;
      paths.push(...walk(entryPath));
      continue;
    }

    paths.push(entryPath);
  }

  return paths;
}

function relative(filePath) {
  return path.relative(rootDir, filePath);
}

function requireFile(filePath) {
  if (!fs.existsSync(path.join(rootDir, filePath))) {
    addError(`Missing required production file: ${filePath}`);
  }
}

function dataShape(value) {
  if (Array.isArray(value)) return value.map(dataShape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, dataShape(value[key])]));
  }
  return typeof value;
}

const files = walk(rootDir);

for (const filePath of files) {
  const rel = relative(filePath);
  const base = path.basename(filePath);

  if (base === ".DS_Store") {
    addError(`Remove Finder metadata file: ${rel}`);
  }

  if (/\.(?:ts|tsx|js|mjs|json|txt|md|html|css)$/.test(base)) {
    const text = fs.readFileSync(filePath, "utf8");

    if (/https:\/\/i\.pravatar\.cc/.test(text)) {
      addError(`Third-party avatar URL must not be used in production UI: ${rel}`);
    }
    if (/\u200b/.test(text)) {
      addError(`Remove invisible zero-width space from production copy: ${rel}`);
    }
  }
}

requireFile("public/_headers");
requireFile("public/_redirects");
requireFile("public/og-default.svg");
requireFile("app/robots.ts");
requireFile("app/sitemap.ts");
requireFile("app/not-found.tsx");
requireFile("app/global-not-found.tsx");
requireFile("components/GlobalNotFound.tsx");
requireFile("scripts/prepare-quiz-assets.mjs");
requireFile("docs/shared-quiz-contract.md");
for (let index = 1; index <= 50; index += 1) {
  requireFile(`public/social-proof/avatars/${String(index).padStart(2, "0")}.webp`);
}

const quizEngineCssPath = path.join(rootDir, "styles", "quiz-engine.css");
const quizEngineCss = fs.readFileSync(quizEngineCssPath, "utf8");
const requiredQuizShellContract = [
  "--quiz-shell-container-width: 900px;",
  "--quiz-shell-header-gap: 18px;",
  "--quiz-shell-side-gutter: 16px;",
  "width: min(var(--quiz-shell-container-width), 100%) !important;",
  "max-width: var(--quiz-shell-container-width) !important;",
  "margin-inline: auto !important;",
  "margin-top: 0 !important;",
  "padding-top: var(--quiz-shell-header-gap) !important;",
  "padding: var(--quiz-shell-header-gap) var(--quiz-shell-side-gutter) 28px !important;",
  "--quiz-shell-header-gap: 6px;",
  "--quiz-shell-side-gutter: 6px;",
  "--quiz-shell-header-gap: 4px;",
  "--quiz-shell-side-gutter: 3px;",
];

for (const declaration of requiredQuizShellContract) {
  if (!quizEngineCss.includes(declaration)) {
    addError(`Shared quiz-container contract is missing \`${declaration}\`: styles/quiz-engine.css`);
  }
}

const quizEngineText = fs.readFileSync(path.join(rootDir, "components", "quiz", "QuizEngine.tsx"), "utf8");
const rewardedStartContract = [
  "function startQuiz()",
  "runRewardedGate(beginQuiz)",
  "onClick={startQuiz}",
  "disabled={adBusy}",
];
for (const declaration of rewardedStartContract) {
  if (!quizEngineText.includes(declaration)) addError(`Direct rewarded-start contract is missing: ${declaration}`);
}
if (/quiz\.slug\s*={2,3}|quiz\.slug\s*!={1,2}/.test(quizEngineText)) {
  addError("QuizEngine cannot contain slug-specific runtime branches; quiz differences must remain data/theme driven.");
}

const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
for (const command of ["node scripts/validate-quizzes.mjs", "node scripts/validate-production.mjs"]) {
  if (!packageJson.scripts?.build?.includes(command)) {
    addError(`Production build must run the shared quiz contract validator: ${command}`);
  }
}

const quizTemplateText = fs.readFileSync(path.join(rootDir, "components", "QuizTemplate.tsx"), "utf8");
const quizThemeBoundaryText = fs.readFileSync(path.join(rootDir, "components", "quiz", "QuizThemeBoundary.tsx"), "utf8");
const quizShellContractText = fs.readFileSync(path.join(rootDir, "components", "quiz", "quizShellContract.ts"), "utf8");
const requiredContinuousShellContract = [
  "continuousShell={quiz.career?.continuousShell === true}",
  "data-quiz-flow={continuousShell ? \"continuous\" : \"standard\"}",
  "<style data-quiz-shell-contract>{quizShellContractCss}</style>",
  "--quiz-flow-width: 800px;",
  "--quiz-flow-min-height: clamp(590px, 82svh, 860px);",
  "width: min(100%, 520px) !important;",
  "min-height: 56px !important;",
  "border-radius: 999px !important;",
  "width: calc(100vw - 16px) !important;",
  "quiz-engine__primary-arrow",
];
const continuousShellSources = `${quizTemplateText}\n${quizThemeBoundaryText}\n${quizShellContractText}`;
for (const declaration of requiredContinuousShellContract) {
  if (!continuousShellSources.includes(declaration)) {
    addError(`Shared continuous-shell contract is missing \`${declaration}\`.`);
  }
}

const infoRoot = path.join(rootDir, "data", "info-pages");
const referenceInfo = JSON.parse(fs.readFileSync(path.join(infoRoot, "en.json"), "utf8"));
const referenceInfoShape = JSON.stringify(dataShape(referenceInfo));
for (const file of fs.readdirSync(infoRoot).filter((name) => name.endsWith(".json"))) {
  const info = JSON.parse(fs.readFileSync(path.join(infoRoot, file), "utf8"));
  if (JSON.stringify(dataShape(info)) !== referenceInfoShape) {
    addError(`Info-page structure differs from en.json: data/info-pages/${file}`);
  }
  for (const [slug, page] of Object.entries(info)) {
    if (typeof page.metaDescription !== "string" || page.metaDescription.trim().length < 50 || page.metaDescription.length > 160) {
      addError(`Info-page meta description must be 50–160 characters: data/info-pages/${file}#${slug}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(page.lastModified ?? "") || Number.isNaN(Date.parse(`${page.lastModified}T00:00:00Z`))) {
      addError(`Info-page lastModified must be a valid ISO date: data/info-pages/${file}#${slug}`);
    }
  }
}

const quizRoot = path.join(rootDir, "data", "quizzes");
const existingThemeGeometrySlugs = new Set([
  "cambridge", "chef", "grammar", "harvard", "iq", "mechanic", "memory",
  "midwifery", "nursing", "oxford", "paramedic", "vision", "years-left",
]);
for (const entry of fs.readdirSync(quizRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || !fs.existsSync(path.join(quizRoot, entry.name, "quiz.json"))) continue;
  const localeFiles = fs.readdirSync(path.join(quizRoot, entry.name))
    .filter((file) => file.endsWith(".json") && file !== "quiz.json");
  if (JSON.stringify(localeFiles.sort()) !== JSON.stringify(["en.json"])) {
    addError(`Quiz content must be English-only: data/quizzes/${entry.name} (found ${localeFiles.join(", ") || "none"})`);
  }
  const englishContentPath = path.join(quizRoot, entry.name, "en.json");
  const quizConfigPath = path.join(quizRoot, entry.name, "quiz.json");
  const quizConfig = JSON.parse(fs.readFileSync(quizConfigPath, "utf8"));
  if (JSON.stringify(quizConfig.theme?.layout) !== JSON.stringify({ landing: "split", questions: "card", results: "immersive" })) {
    addError(`Quiz layout must use the shared landing/question/result template: data/quizzes/${entry.name}/quiz.json`);
  }
  if (quizConfig.theme?.artwork?.landing !== undefined) {
    addError(`Landing artwork panels are not supported by the shared template: data/quizzes/${entry.name}/quiz.json`);
  }
  if (
    quizConfig.engine?.flow !== "staged"
    || quizConfig.engine?.startOnLoad !== false
    || quizConfig.engine?.checkpoint !== "ai"
    || quizConfig.engine?.advance !== "automatic"
    || quizConfig.engine?.feedback !== "selection-only"
    || quizConfig.engine?.advanceDelayMs !== 450
    || quizConfig.engine?.rewarded?.start !== true
    || quizConfig.engine?.rewarded?.stages !== true
    || quizConfig.engine?.rewarded?.attempts !== 3
    || quizConfig.engine?.rewarded?.confirmStart !== false
  ) {
    addError(`Quiz engine must use the shared five-stage rewarded flow: data/quizzes/${entry.name}/quiz.json`);
  }
  if (fs.existsSync(englishContentPath)) {
    const englishContent = JSON.parse(fs.readFileSync(englishContentPath, "utf8"));
    if (englishContent.stages?.length !== 5 || englishContent.stages.some((stage) => stage.questions?.length !== 8)) {
      addError(`Every quiz must contain exactly five stages of eight questions: data/quizzes/${entry.name}/en.json`);
    }
    if (
      englishContent.career?.continuousShell !== true
      || englishContent.career?.hideJourneyLength !== true
      || englishContent.career?.showStageResults !== false
      || englishContent.career?.showResultProgress !== true
      || englishContent.career?.compactGate !== undefined
    ) {
      addError(`Every quiz must use the shared continuous progress-only shell: data/quizzes/${entry.name}/en.json`);
    }
    if (!englishContent.career?.stages?.slice(0, 4).every((stage) => stage.preAdButton === "Continue" && stage.preAdChecks === undefined && stage.next?.button === "Continue")) {
      addError(`Every quiz must use the shared intermediate Continue checkpoint: data/quizzes/${entry.name}/en.json`);
    }
    if (englishContent.career?.stages?.[4]?.preAdChecks?.length !== 3) {
      addError(`Every quiz must reserve its three-row result checklist for the final checkpoint: data/quizzes/${entry.name}/en.json`);
    }
    if (englishContent.stages?.flatMap((stage) => stage.questions ?? []).some((question) => question.explanation !== undefined)) {
      addError(`Question explanations are forbidden by the shared quiz contract: data/quizzes/${entry.name}/en.json`);
    }
    if (!(typeof englishContent.landing?.cta === "string" && englishContent.landing.cta.trim())) {
      addError(`Landing CTA copy must remain configurable and non-empty: data/quizzes/${entry.name}/en.json`);
    }
    if (!(typeof englishContent.landing?.socialProof === "string" && englishContent.landing.socialProof.trim())) {
      addError(`Landing social proof must remain configurable and non-empty: data/quizzes/${entry.name}/en.json`);
    }
    if (JSON.stringify(Object.keys(englishContent.landing ?? {}).sort()) !== JSON.stringify(["cta", "intro", "socialProof"])) {
      addError(`Landing content may contain only intro, social proof and CTA copy: data/quizzes/${entry.name}/en.json`);
    }
  }
  const themeRelativePath = `data/quizzes/${entry.name}/theme.css`;
  const themePath = path.join(rootDir, themeRelativePath);
  requireFile(themeRelativePath);
  requireFile(`public/quizzes/${entry.name}/assets/thumbnail-480.webp`);
  requireFile(`public/quizzes/${entry.name}/assets/thumbnail-960.webp`);

  if (!fs.existsSync(themePath)) continue;
  const themeCss = fs.readFileSync(themePath, "utf8");

  if (themeCss.includes("--quiz-shell-")) {
    addError(`Quiz themes cannot redefine reserved shared geometry variables: ${themeRelativePath}`);
  }

  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let block;
  while ((block = blockPattern.exec(themeCss))) {
    const selector = block[1];
    const declarations = block[2];
    const targetsProtectedContainer = /\.quiz-engine__(?:landing|about)(?![-\w])/.test(selector);
    const forcesProtectedGeometry = /(?:^|;)\s*(?:width|max-width|margin(?:-(?:top|left|right|inline(?:-start|-end)?))?)\s*:[^;]*!important/i.test(declarations);

    if (targetsProtectedContainer && forcesProtectedGeometry) {
      addError(`Quiz themes cannot force landing/About width or alignment outside the shared site rule: ${themeRelativePath}`);
      break;
    }

    const targetsSharedFlow = /\.quiz-engine__(?:continuous-shell|question-shell|progress-head|progress|checkpoint|stage-result|results|career-final|primary|social)(?![-\w])/.test(selector);
    const declaresSharedGeometry = /(?:^|;)\s*(?:display|position|inset|width|min-width|max-width|height|min-height|max-height|margin(?:-[\w-]+)?|padding(?:-[\w-]+)?|gap|row-gap|column-gap|grid-template(?:-[\w-]+)?|flex(?:-[\w-]+)?|align-(?:items|content|self)|justify-(?:items|content|self)|border-radius|overflow(?:-[xy])?)\s*:/i.test(declarations);
    if (!existingThemeGeometrySlugs.has(entry.name) && targetsSharedFlow && declaresSharedGeometry) {
      addError(`New quiz themes may style the shared flow visually but cannot redefine its geometry: ${themeRelativePath}`);
      break;
    }
  }
}

if (errors.length) {
  console.error("Production validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Production validation passed.");
