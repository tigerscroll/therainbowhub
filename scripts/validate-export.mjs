import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";

const root = process.cwd();
const outputRoot = path.join(root, "out");
const quizRoot = path.join(root, "data", "quizzes");
const articleRoot = path.join(root, "data", "articles");
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
      if (!html.includes(`data-quiz-css=\"${slug}\"`) || !new RegExp(`/quizzes/${slug}/theme(?:\\.\\d+)?\\.css\\?v=`).test(html)) {
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

  const articles = fs.readdirSync(articleRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(articleRoot, entry.name, "en.json")))
    .map((entry) => {
      const manifest = JSON.parse(fs.readFileSync(path.join(articleRoot, entry.name, "en.json"), "utf8"));
      return {
        pointCounts: manifest.sections.map((section) => section.points.length),
        routeSlug: manifest.routeSlug ?? manifest.slug,
        slug: manifest.slug,
      };
    });

  for (const { pointCounts, routeSlug, slug } of articles) {
    const sectionCount = pointCounts.length;
    const articleFile = routeFile(`/${routeSlug}`);
    if (!articleFile) {
      addError(`Missing exported article route: /${routeSlug}`);
      continue;
    }
    const html = fs.readFileSync(articleFile, "utf8");
    if (html.includes("data-display-ad")) addError(`/${routeSlug}: display-ad markup must not be exported.`);
    for (let section = 1; section <= sectionCount; section += 1) {
      const chapterRoute = `/${routeSlug}/${section}`;
      const chapterFile = routeFile(chapterRoute);
      if (!chapterFile) {
        addError(`Missing exported article chapter route: ${chapterRoute}`);
      } else if (fs.readFileSync(chapterFile, "utf8").includes("data-display-ad")) {
        addError(`${chapterRoute}: display-ad markup must not be exported.`);
      }
      const payloadFile = path.join(outputRoot, "article-data", slug, String(section));
      if (!fs.existsSync(payloadFile)) {
        addError(`Missing lazy article payload: /article-data/${slug}/${section}`);
        continue;
      }
      const payload = JSON.parse(fs.readFileSync(payloadFile, "utf8"));
      const expectedPointCount = pointCounts[section - 1];
      if (!payload?.title || !Array.isArray(payload.points) || payload.points.length !== expectedPointCount) {
        addError(`/article-data/${slug}/${section}: expected a titled ${expectedPointCount}-point article section.`);
      }
      if (payload.next && (
        typeof payload.next.copy !== "string"
        || typeof payload.next.cta !== "string"
        || typeof payload.next.eyebrow !== "string"
        || typeof payload.next.title !== "string"
        || (typeof payload.next.adNote !== "undefined" && typeof payload.next.adNote !== "string")
      )) {
        addError(`/article-data/${slug}/${section}: invalid next-section gate.`);
      }
      if (section < sectionCount && (!payload.next || typeof payload.next.adNote !== "string")) {
        addError(`/article-data/${slug}/${section}: every internal gate must include its rewarded-ad note.`);
      }
      if (section === sectionCount && payload.next) {
        addError(`/article-data/${slug}/${section}: final section must not include another gate.`);
      }
      for (const [pointIndex, point] of (payload.points ?? []).entries()) {
        if (point.callouts && (!Array.isArray(point.callouts) || point.callouts.some((callout) => (
          typeof callout?.question !== "string" || typeof callout?.answer !== "string"
        )))) {
          addError(`/article-data/${slug}/${section}: invalid callouts on point ${pointIndex + 1}.`);
        }
      }
      if (payload.conclusion && (
        typeof payload.conclusion.eyebrow !== "string" || typeof payload.conclusion.copy !== "string"
      )) {
        addError(`/article-data/${slug}/${section}: invalid editorial conclusion.`);
      }
      if (slug === "prostate") {
        const calloutCounts = payload.points.map((point) => point.callouts?.length ?? 0);
        if (section === 3 && (calloutCounts[3] !== 3 || calloutCounts.some((count, index) => index !== 3 && count !== 0))) {
          addError("/article-data/prostate/3: the three PSA callouts must appear together after Step 4.");
        }
        if (section === 5 && (!payload.conclusion || payload.conclusion.eyebrow !== "THE MOST IMPORTANT POINT")) {
          addError("/article-data/prostate/5: final editorial conclusion is missing.");
        }
      }
      const firstPointTitle = payload.points?.[0]?.title;
      if (firstPointTitle && html.includes(firstPointTitle)) {
        addError(`/${routeSlug}: locked section content leaked into the initial article payload.`);
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
