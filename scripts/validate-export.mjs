import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";

const root = process.cwd();
const outputRoot = path.join(root, "out");
const quizRoot = path.join(root, "data", "quizzes");
const locales = ["en", "fr", "de", "it", "nl", "es", "pt"];
const errors = [];
const shellCss = fs.readFileSync(path.join(root, "styles", "quiz-shell-contract.css"), "utf8");
const shellHash = createHash("sha256").update(shellCss).digest("hex").slice(0, 12);
const shellHref = `/styles/quiz-shell-contract.${shellHash}.css`;

function addError(message) {
  errors.push(message);
}

function routeFile(route) {
  const pathname = route.replace(/^\//, "");
  const candidates = [
    path.join(outputRoot, `${pathname}.html`),
    path.join(outputRoot, pathname, "index.html"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function assetFile(url) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(url, "https://export.invalid").pathname);
  } catch {
    return undefined;
  }
  return path.join(outputRoot, pathname.replace(/^\//, ""));
}

if (!fs.existsSync(outputRoot)) {
  addError("Static export directory is missing. Run the production build first.");
} else {
  const slugs = fs.readdirSync(quizRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(quizRoot, entry.name, "quiz.json")))
    .map((entry) => entry.name)
    .sort();

  for (const slug of slugs) {
    const localizedLocales = locales.filter((locale) => locale === "en"
      || fs.existsSync(path.join(quizRoot, slug, `${locale}.json`)));
    for (const locale of localizedLocales) {
      const route = locale === "en" ? `/${slug}` : `/${locale}/${slug}`;
      const file = routeFile(route);
      if (!file) {
        addError(`Missing exported quiz route: ${route}`);
        continue;
      }
      const html = fs.readFileSync(file, "utf8");
      if (!html.includes("data-quiz-shell-contract") || !html.includes(shellHref)) {
        addError(`${route}: shared cacheable shell stylesheet is not linked.`);
      }
      if (!html.includes(`data-quiz-css=\"${slug}\"`) || !html.includes(`/quizzes/${slug}/theme.css?v=`)) {
        addError(`${route}: versioned quiz theme stylesheet is not linked.`);
      }
      if (/data-quiz-shell-contract[^>]*>[^<]*<style/i.test(html) || html.includes("data-quiz-shell-styles")) {
        addError(`${route}: shared shell CSS was inlined instead of linked.`);
      }

      for (const match of html.matchAll(/<(?:script|img|link)\b[^>]*(?:src|href)=\"([^\"]+)\"/gi)) {
        const url = match[1];
        if (!/^\/(?:_next|styles|quizzes|social-proof)\//.test(url)) continue;
        const asset = assetFile(url);
        if (asset && !fs.existsSync(asset)) addError(`${route}: referenced asset is missing from export: ${url}`);
      }
    }
  }

  const publicQuizRoot = path.join(root, "public", "quizzes");
  const exportedQuizRoot = path.join(outputRoot, "quizzes");
  const expected = slugs.join("\n");
  for (const [label, directory] of [["prepared", publicQuizRoot], ["exported", exportedQuizRoot]]) {
    const actual = fs.existsSync(directory)
      ? fs.readdirSync(directory, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort().join("\n")
      : "";
    if (actual !== expected) addError(`${label} quiz assets do not exactly match the active quiz manifests.`);
  }

  for (const directory of [path.join(root, "public", "styles"), path.join(outputRoot, "styles")]) {
    const files = fs.existsSync(directory) ? fs.readdirSync(directory).filter((file) => file.startsWith("quiz-shell-contract.")) : [];
    if (files.length !== 1 || files[0] !== path.basename(shellHref)) {
      addError(`${path.relative(root, directory)} must contain exactly the current content-hashed shell stylesheet.`);
    }
  }

  const articleSectionCounts = {
    brands: 4,
    cellulite: 3,
    colon: 3,
    funeral: 3,
    kidney: 3,
    nervous: 4,
    prostate: 3,
    signs: 5,
  };

  for (const [slug, sectionCount] of Object.entries(articleSectionCounts)) {
    const articleFile = routeFile(`/${slug}`);
    if (!articleFile) {
      addError(`Missing exported article route: /${slug}`);
      continue;
    }
    const html = fs.readFileSync(articleFile, "utf8");
    if (html.includes("data-display-ad")) addError(`/${slug}: display-ad markup must not be exported.`);
    for (let section = 1; section <= sectionCount; section += 1) {
      const payloadFile = path.join(outputRoot, "article-data", slug, String(section));
      if (!fs.existsSync(payloadFile)) {
        addError(`Missing lazy article payload: /article-data/${slug}/${section}`);
        continue;
      }
      const payload = JSON.parse(fs.readFileSync(payloadFile, "utf8"));
      if (!payload?.title || !Array.isArray(payload.points) || payload.points.length !== 10) {
        addError(`/article-data/${slug}/${section}: expected a titled ten-point article section.`);
      }
      const firstPointTitle = payload.points?.[0]?.title;
      if (firstPointTitle && html.includes(firstPointTitle)) {
        addError(`/${slug}: locked section content leaked into the initial article payload.`);
      }
    }
  }

  if (routeFile("/mcdonalds")) addError("Removed /mcdonalds route must not be present in the static export.");
}

if (errors.length) {
  console.error("Static export validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Static export validation passed for every quiz, locale and lazy article-section route.");
