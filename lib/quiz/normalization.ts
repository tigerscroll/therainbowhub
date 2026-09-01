import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const SOCIAL_AVATAR_GROUPS = [
  ["02", "05", "01", "08"],
  ["04", "07", "10", "06"],
  ["09", "03", "12", "08"],
  ["06", "01", "07", "11"],
].map((group) => group.map((id) => `/social-proof/avatars/${id}.webp`));

const QUIZ_THEME_PATH_REVISIONS: Partial<Record<string, string>> = {
  "years-left": "94627",
};

export function normalizeQuizAsset(root: string, slug: string, value?: string) {
  if (!value || value.startsWith("/")) return value;
  const file = path.join(root, slug, value);
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

export function normalizedSocialAvatars(slug: string) {
  const hash = [...slug].reduce((value, character) => Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0, 2166136261);
  return SOCIAL_AVATAR_GROUPS[hash % SOCIAL_AVATAR_GROUPS.length];
}

export function themeStylesheetHref(slug: string, css: string) {
  const revision = QUIZ_THEME_PATH_REVISIONS[slug];
  const filename = revision ? `theme.${revision}.css` : "theme.css";
  return `/quizzes/${slug}/${filename}?v=${createHash("sha256").update(css).digest("hex").slice(0, 12)}`;
}
