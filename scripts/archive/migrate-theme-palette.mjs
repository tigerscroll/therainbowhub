import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "data", "quizzes");
const colorTokens = {
  page: "--quiz-page",
  pageAlt: "--quiz-page-alt",
  surface: "--quiz-surface",
  surfaceRaised: "--quiz-surface-raised",
  text: "--quiz-text",
  muted: "--quiz-muted",
  primary: "--quiz-primary",
  primaryText: "--quiz-primary-text",
  border: "--quiz-border",
  correct: "--quiz-correct",
  incorrect: "--quiz-incorrect",
};
const headerTokens = {
  background: "--quiz-header-background",
  text: "--quiz-header-text",
  border: "--quiz-header-border",
  shadow: "--quiz-header-shadow",
};

function escape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const directory = path.join(root, entry.name);
  const manifestPath = path.join(directory, "quiz.json");
  const cssPath = path.join(directory, "theme.css");
  if (!fs.existsSync(manifestPath) || !fs.existsSync(cssPath)) continue;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  let css = fs.readFileSync(cssPath, "utf8");
  const replacements = [
    ...Object.entries(headerTokens).map(([key, token]) => [manifest.theme.header?.[key], token]),
    ...Object.entries(colorTokens).map(([key, token]) => [manifest.theme.colors?.[key], token]),
  ].filter(([value]) => typeof value === "string" && value.trim());
  for (const [value, token] of replacements) {
    css = css.replace(new RegExp(escape(value), "gi"), `var(${token})`);
  }
  fs.writeFileSync(cssPath, css);
  console.log(`Centralized palette tokens for ${entry.name}.`);
}
