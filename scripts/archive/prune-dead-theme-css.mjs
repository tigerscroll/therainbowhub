import fs from "node:fs";
import path from "node:path";

const quizRoot = path.join(process.cwd(), "data", "quizzes");
const deadSelector = /\.quiz-engine__(?:stage-result(?:-icon)?|stage-score|stage-insight|career-current-score|career-next-action|career-final)\b|\[data-round="(?:6|7|8|9|10)"\]/;

function findClosingBrace(source, openingIndex) {
  let depth = 1;
  let quote = "";
  let comment = false;
  for (let index = openingIndex + 1; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (comment) {
      if (character === "*" && next === "/") {
        comment = false;
        index += 1;
      }
      continue;
    }
    if (!quote && character === "/" && next === "*") {
      comment = true;
      index += 1;
      continue;
    }
    if (quote) {
      if (character === "\\") index += 1;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}" && --depth === 0) return index;
  }
  throw new Error("Unbalanced CSS braces.");
}

function splitSelectors(header) {
  const selectors = [];
  let start = 0;
  let depth = 0;
  for (let index = 0; index < header.length; index += 1) {
    if (header[index] === "(") depth += 1;
    else if (header[index] === ")") depth -= 1;
    else if (header[index] === "," && depth === 0) {
      selectors.push(header.slice(start, index).trim());
      start = index + 1;
    }
  }
  selectors.push(header.slice(start).trim());
  return selectors.filter(Boolean);
}

function prune(source) {
  let output = "";
  let cursor = 0;
  while (cursor < source.length) {
    const openingIndex = source.indexOf("{", cursor);
    if (openingIndex < 0) return output + source.slice(cursor);
    const closingIndex = findClosingBrace(source, openingIndex);
    const rawHeader = source.slice(cursor, openingIndex);
    const header = rawHeader.trim();
    const body = source.slice(openingIndex + 1, closingIndex);
    if (header.startsWith("@") && !/^@(?:font-face|page|property)\b/.test(header)) {
      output += `${rawHeader}{${prune(body)}}`;
    } else if (header.startsWith("@")) {
      output += `${rawHeader}{${body}}`;
    } else {
      const selectors = splitSelectors(header);
      const activeSelectors = selectors.filter((selector) => !deadSelector.test(selector));
      if (activeSelectors.length === selectors.length) output += `${rawHeader}{${body}}`;
      else if (activeSelectors.length) {
        const leading = rawHeader.match(/^\s*/)?.[0] ?? "";
        output += `${leading}${activeSelectors.join(",\n")}{${body}}`;
      }
    }
    cursor = closingIndex + 1;
  }
  return output;
}

let changed = 0;
for (const entry of fs.readdirSync(quizRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(quizRoot, entry.name, "theme.css");
  if (!fs.existsSync(file)) continue;
  const before = fs.readFileSync(file, "utf8");
  const after = prune(before).replace(/\n{4,}/g, "\n\n\n");
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
  }
}

console.log(`Pruned dead stage-result and rounds 6–10 selectors from ${changed} theme file(s).`);
