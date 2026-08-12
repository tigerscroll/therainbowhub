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
  }
}

requireFile("public/_headers");
requireFile("public/_redirects");
requireFile("public/og-default.svg");
requireFile("app/robots.ts");
requireFile("app/sitemap.ts");

if (errors.length) {
  console.error("Production validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Production validation passed.");
