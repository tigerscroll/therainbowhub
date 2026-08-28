import fs from "node:fs";
import path from "node:path";

import { isArticleManifest, type ArticleManifest } from "@/components/article/articleSchema";

const ARTICLE_ROOT = path.join(process.cwd(), "data", "articles");
const manifestCache = new Map<string, ArticleManifest>();
let catalogueCache: ArticleManifest[] | undefined;
let completeCatalogueCache: ArticleManifest[] | undefined;

function manifestKey(slug: string, locale: string) {
  return `${slug}:${locale}`;
}

function readManifest(slug: string, locale: string): ArticleManifest | undefined {
  const key = manifestKey(slug, locale);
  const cached = manifestCache.get(key);
  if (cached) return cached;

  const filename = path.join(ARTICLE_ROOT, slug, `${locale}.json`);
  if (!fs.existsSync(filename)) return undefined;
  const value: unknown = JSON.parse(fs.readFileSync(filename, "utf8"));
  if (!isArticleManifest(value)) throw new Error(`Invalid article manifest: ${slug}/${locale}.json`);
  if (value.slug !== slug || value.locale !== locale) {
    throw new Error(`Article manifest identity mismatch: ${slug}/${locale}.json`);
  }
  manifestCache.set(key, value);
  return value;
}

export function getArticleBySlug(slug: string, locale = "en") {
  return readManifest(slug, locale);
}

export function requireArticleBySlug(slug: string, locale = "en") {
  const article = getArticleBySlug(slug, locale);
  if (!article) throw new Error(`Article manifest not found: ${slug}/${locale}.json`);
  return article;
}

export function getArticleByRouteSlug(routeSlug: string, locale = "en") {
  return getAllArticleManifests().find((article) => (
    article.locale === locale && (article.routeSlug ?? article.slug) === routeSlug
  ));
}

export function getArticleLocales(slug: string) {
  const directory = path.join(ARTICLE_ROOT, slug);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name.slice(0, -5))
    .sort();
}

export function getAllArticles() {
  if (catalogueCache) return catalogueCache;
  if (!fs.existsSync(ARTICLE_ROOT)) return [];
  catalogueCache = fs.readdirSync(ARTICLE_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readManifest(entry.name, "en"))
    .filter((article): article is ArticleManifest => Boolean(article))
    .sort((left, right) => left.slug.localeCompare(right.slug));
  return catalogueCache;
}

export function getAllArticleManifests() {
  if (completeCatalogueCache) return completeCatalogueCache;
  if (!fs.existsSync(ARTICLE_ROOT)) return [];

  completeCatalogueCache = fs.readdirSync(ARTICLE_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => getArticleLocales(entry.name)
      .map((locale) => readManifest(entry.name, locale))
      .filter((article): article is ArticleManifest => Boolean(article)))
    .sort((left, right) => `${left.slug}:${left.locale}`.localeCompare(`${right.slug}:${right.locale}`));

  return completeCatalogueCache;
}

export function clearArticleCatalogueCacheForTests() {
  catalogueCache = undefined;
  completeCatalogueCache = undefined;
  manifestCache.clear();
}
