import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";

import sharp from "sharp";

const sourceRoot = path.join(process.cwd(), "data", "quizzes");
const publicRoot = path.join(process.cwd(), "public", "quizzes");

async function exists(file) {
  try {
    const stats = await fs.stat(file);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function copyIfPresent(source, destination) {
  if (!(await exists(source))) return;
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
}

async function copyRequired(source, destination, label) {
  if (!(await exists(source))) throw new Error(`${label}: missing declared asset ${path.relative(sourceRoot, source)}.`);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
}

async function prepareQuiz(slug) {
  const source = path.join(sourceRoot, slug);
  const destination = path.join(publicRoot, slug);
  const manifest = JSON.parse(await fs.readFile(path.join(source, "quiz.json"), "utf8"));
  const thumbnail = manifest.listing?.thumbnail;

  await copyIfPresent(path.join(source, "theme.css"), path.join(destination, "theme.css"));

  if (typeof thumbnail === "string" && !thumbnail.startsWith("/")) {
    const thumbnailFile = path.join(source, thumbnail);
    if (!(await exists(thumbnailFile))) throw new Error(`${slug}: missing ${thumbnail}.`);
    await fs.mkdir(path.join(destination, "assets"), { recursive: true });
    await Promise.all([480, 960].map((width) => sharp(thumbnailFile)
      .rotate()
      .resize({ width, height: Math.round(width * 9 / 16), fit: "cover", position: "centre" })
      .webp({ quality: width === 480 ? 76 : 80, effort: 5 })
      .toFile(path.join(destination, "assets", `thumbnail-${width}.webp`))));
  }

  const icons = path.join(source, "assets", "icons");
  try {
    const files = await fs.readdir(icons);
    await Promise.all(files
      .filter((file) => /\.svg$/i.test(file))
      .map((file) => copyIfPresent(path.join(icons, file), path.join(destination, "assets", "icons", file))));
  } catch { /* Custom question icons are optional. */ }

  const items = path.join(source, "assets", "items");
  try {
    const files = await fs.readdir(items);
    const fileSet = new Set(files);
    await Promise.all(files
      .filter((file) => /\.(?:jpe?g|png|webp|avif)$/i.test(file))
      .filter((file) => !/\.(?:jpe?g|png)$/i.test(file) || !fileSet.has(file.replace(/\.(?:jpe?g|png)$/i, ".webp")))
      .map((file) => copyIfPresent(path.join(items, file), path.join(destination, "assets", "items", file))));
  } catch { /* Question imagery is optional. */ }

  const artwork = manifest.theme?.artwork ?? {};
  const variantArtwork = Object.values(artwork.profileVariants ?? {}).flatMap((variants) => Object.values(variants ?? {}));
  const checkpointVariantArtwork = Object.values(artwork.checkpointVariants ?? {}).flatMap((variants) => variants ?? []);
  await Promise.all([
    artwork.landing,
    artwork.result,
    ...Object.values(artwork.profiles ?? {}),
    ...variantArtwork,
    ...(artwork.checkpoints ?? []),
    ...checkpointVariantArtwork,
  ]
    .filter((value, index, values) => typeof value === "string" && !value.startsWith("/") && values.indexOf(value) === index)
    .map((value) => copyRequired(path.join(source, value), path.join(destination, value), slug)));
}

const entries = await fs.readdir(sourceRoot, { withFileTypes: true });
const slugs = [];
for (const entry of entries) {
  if (entry.isDirectory() && await exists(path.join(sourceRoot, entry.name, "quiz.json"))) slugs.push(entry.name);
}

await fs.rm(publicRoot, { recursive: true, force: true });
await fs.mkdir(publicRoot, { recursive: true });
await Promise.all(slugs.map(prepareQuiz));
const sharedStylesRoot = path.join(process.cwd(), "public", "styles");
const sharedShellSource = path.join(process.cwd(), "styles", "quiz-shell-contract.css");
const sharedShellCss = await fs.readFile(sharedShellSource, "utf8");
const sharedShellHash = createHash("sha256").update(sharedShellCss).digest("hex").slice(0, 12);
await fs.rm(sharedStylesRoot, { recursive: true, force: true });
await fs.mkdir(sharedStylesRoot, { recursive: true });
await fs.copyFile(
  sharedShellSource,
  path.join(sharedStylesRoot, `quiz-shell-contract.${sharedShellHash}.css`),
);
console.log(`Prepared responsive assets for ${slugs.length} quiz folder(s).`);
