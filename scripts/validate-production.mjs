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
requireFile("components/GlobalNotFound.tsx");
requireFile("scripts/prepare-quiz-assets.mjs");

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
for (const entry of fs.readdirSync(quizRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || !fs.existsSync(path.join(quizRoot, entry.name, "quiz.json"))) continue;
  requireFile(`public/quizzes/${entry.name}/assets/thumbnail-480.webp`);
  requireFile(`public/quizzes/${entry.name}/assets/thumbnail-960.webp`);
}

if (errors.length) {
  console.error("Production validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Production validation passed.");
