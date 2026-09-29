import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";

const root = process.cwd();
const outputRoot = path.join(root, "out");
const quizRoot = path.join(root, "data", "quizzes");
const articleRoot = path.join(root, "data", "articles");
const locales = fs.readdirSync(path.join(root, "data", "i18n"))
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.slice(0, -5))
  .sort();
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
    const quizConfig = JSON.parse(fs.readFileSync(path.join(quizRoot, slug, "quiz.json"), "utf8"));
    const hasCustomTheme = fs.existsSync(path.join(quizRoot, slug, "theme.css"));
    if (quizConfig.activeLocales && (
      quizConfig.activeLocales.length !== locales.length
      || locales.some((locale) => !quizConfig.activeLocales.includes(locale))
    )) {
      addError(`${slug}: activeLocales must include every supported locale.`);
    }
    for (const locale of locales) {
      if (!fs.existsSync(path.join(quizRoot, slug, `${locale}.json`))) {
        addError(`${slug}: missing quiz translation for ${locale}.`);
        continue;
      }
      const route = locale === "en" ? `/${slug}` : `/${locale}/${slug}`;
      const file = routeFile(route);
      if (!file) {
        addError(`Missing exported quiz route: ${route}`);
        continue;
      }
      const html = fs.readFileSync(file, "utf8");
      if (slug === "vision") {
        for (const question of Object.values(quizConfig.structure.questions)) {
          if (!question.image) continue;
          const src = question.image.localizedSrc?.[locale] ?? question.image.src;
          const hash = createHash("sha256").update(fs.readFileSync(assetFile(src))).digest("hex").slice(0, 12);
          if (!html.includes(`${src}?v=${hash}`)) {
            addError(`${route}: Vision artwork must use its current content version: ${src}`);
          }
        }
      }
      if (!html.includes("data-quiz-shell-contract") || !html.includes(shellHref)) {
        addError(`${route}: shared cacheable shell stylesheet is not linked.`);
      }
      if (hasCustomTheme && (!html.includes(`data-quiz-css=\"${slug}\"`) || !new RegExp(`/quizzes/${slug}/theme(?:\\.\\d+)?\\.css\\?v=`).test(html))) {
        addError(`${route}: versioned quiz theme stylesheet is not linked.`);
      }
      if (/data-quiz-shell-contract[^>]*>[^<]*<style/i.test(html) || html.includes("data-quiz-shell-styles")) {
        addError(`${route}: shared shell CSS was inlined instead of linked.`);
      }
      for (const availableLocale of locales) {
        const languageRoute = availableLocale === "en" ? `/${slug}` : `/${availableLocale}/${slug}`;
        if (!html.includes(`href="${languageRoute}"`)) {
          addError(`${route}: language switcher is missing ${languageRoute}.`);
        }
      }

      for (const match of html.matchAll(/<(?:script|img|link)\b[^>]*(?:src|href)=\"([^\"]+)\"/gi)) {
        const url = match[1];
        if (!/^\/(?:_next|styles|quizzes|social-proof)\//.test(url)) continue;
        const asset = assetFile(url);
        if (asset && !fs.existsSync(asset)) addError(`${route}: referenced asset is missing from export: ${url}`);
      }
      for (const match of html.matchAll(/<meta\b[^>]*(?:name|property)=\"(?:og:image|twitter:image)\"[^>]*content=\"([^\"]+)\"/gi)) {
        const asset = assetFile(match[1]);
        if (asset && !fs.existsSync(asset)) addError(`${route}: page metadata image is missing from export: ${match[1]}`);
      }
    }
  }

  const publicQuizRoot = path.join(root, "public", "quizzes");
  const exportedQuizRoot = path.join(outputRoot, "quizzes");
  // JSON-only quizzes use the shared shell and need no per-quiz asset folder.
  // Preparation validates declared assets; every prepared file must be exported.
  const assetDirectories = (directory) => fs.existsSync(directory)
    ? fs.readdirSync(directory, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
    : [];
  const preparedSlugs = assetDirectories(publicQuizRoot);
  const exportedSlugs = assetDirectories(exportedQuizRoot);
  for (const slug of new Set([...preparedSlugs, ...exportedSlugs])) {
    if (!slugs.includes(slug)) addError(`Quiz assets remain for an inactive quiz: ${slug}.`);
  }
  if (preparedSlugs.join("\n") !== exportedSlugs.join("\n")) {
    addError("Exported quiz asset folders do not match the prepared assets.");
  }
  const assetFiles = (directory, prefix = "") => fs.existsSync(directory)
    ? fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const relative = path.join(prefix, entry.name);
      return entry.isDirectory() ? assetFiles(path.join(directory, entry.name), relative) : [relative];
    }).sort()
    : [];
  if (assetFiles(publicQuizRoot).join("\n") !== assetFiles(exportedQuizRoot).join("\n")) {
    addError("Exported quiz asset files do not exactly match the prepared assets.");
  }

  for (const directory of [path.join(root, "public", "styles"), path.join(outputRoot, "styles")]) {
    const files = fs.existsSync(directory) ? fs.readdirSync(directory).filter((file) => file.startsWith("quiz-shell-contract.")) : [];
    if (files.length !== 1 || files[0] !== path.basename(shellHref)) {
      addError(`${path.relative(root, directory)} must contain exactly the current content-hashed shell stylesheet.`);
    }
  }

  const savedArticleSlugs = fs.readdirSync(articleRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(articleRoot, entry.name, "en.json")))
    .map((entry) => {
      const manifest = JSON.parse(fs.readFileSync(path.join(articleRoot, entry.name, "en.json"), "utf8"));
      return manifest.routeSlug ?? manifest.slug;
    });
  const removedArticles = [...savedArticleSlugs, "cloudstorage", "monetize", "makemoney"];
  const sitemap = fs.readFileSync(path.join(outputRoot, "sitemap.xml"), "utf8");
  const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  for (const slug of removedArticles) {
    for (const prefix of ["", ...locales.map((locale) => `/${locale}`)]) {
      const articleRoute = `${prefix}/${slug}`;
      if (routeFile(articleRoute)) addError(`Removed article page is still exported: ${articleRoute}`);
      const artifactRoot = path.join(outputRoot, articleRoute.replace(/^\//, ""));
      if (fs.existsSync(artifactRoot)) addError(`Removed article chapter or embed assets remain: ${articleRoute}`);
      if (sitemapPaths.some((route) => route === articleRoute || route.startsWith(`${articleRoute}/`))) {
        addError(`Removed article is still listed in the sitemap: ${articleRoute}`);
      }
    }
  }
  if (fs.existsSync(path.join(outputRoot, "article-data"))) {
    addError("Removed article-data payloads must not be exported.");
  }

  if (routeFile("/mcdonalds")) addError("Removed /mcdonalds route must not be present in the static export.");
}

if (errors.length) {
  console.error("Static export validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Static export validation passed for every quiz and locale; retired article routes and payloads are absent.");
