import fs from "node:fs";
import path from "node:path";

const quizRoot = path.join(process.cwd(), "data", "quizzes");
const sharedRootClass = /\.quiz-engine__(?:continuous-shell|question-shell|progress-head|progress|checkpoint|results|primary|social)(?![-\w])/;
const geometryProperty = /^(?:display|position|inset|width|min-width|max-width|height|min-height|max-height|margin(?:-[\w-]+)?|padding(?:-[\w-]+)?|gap|row-gap|column-gap|grid-template(?:-[\w-]+)?|flex(?:-[\w-]+)?|align-(?:items|content|self)|justify-(?:items|content|self)|border-radius|overflow(?:-[xy])?)$/i;

function findClosingBrace(source, openingIndex) {
  let depth = 1;
  let quote = "";
  let comment = false;
  for (let index = openingIndex + 1; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (comment) {
      if (character === "*" && next === "/") { comment = false; index += 1; }
      continue;
    }
    if (!quote && character === "/" && next === "*") { comment = true; index += 1; continue; }
    if (quote) {
      if (character === "\\") index += 1;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") { quote = character; continue; }
    if (character === "{") depth += 1;
    if (character === "}" && --depth === 0) return index;
  }
  throw new Error("Unbalanced CSS braces.");
}

function splitTopLevel(source, delimiter) {
  const parts = [];
  let start = 0;
  let round = 0;
  let square = 0;
  let quote = "";
  let comment = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (comment) {
      if (character === "*" && next === "/") { comment = false; index += 1; }
      continue;
    }
    if (!quote && character === "/" && next === "*") { comment = true; index += 1; continue; }
    if (quote) {
      if (character === "\\") index += 1;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === "(") round += 1;
    else if (character === ")") round -= 1;
    else if (character === "[") square += 1;
    else if (character === "]") square -= 1;
    else if (character === delimiter && round === 0 && square === 0) {
      parts.push(source.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(source.slice(start));
  return parts;
}

function lastCompound(selector) {
  let boundary = -1;
  let round = 0;
  let square = 0;
  for (let index = 0; index < selector.length; index += 1) {
    const character = selector[index];
    if (character === "(") round += 1;
    else if (character === ")") round -= 1;
    else if (character === "[") square += 1;
    else if (character === "]") square -= 1;
    else if (round === 0 && square === 0 && (/\s/.test(character) || character === ">" || character === "+" || character === "~")) boundary = index;
  }
  return selector.slice(boundary + 1).trim();
}

function targetsSharedRoot(selector) {
  const compound = lastCompound(selector);
  return !compound.includes("::") && sharedRootClass.test(compound);
}

function declarationProperty(declaration) {
  const withoutComments = declaration.replace(/\/\*[\s\S]*?\*\//g, "").trim();
  const colon = withoutComments.indexOf(":");
  return colon < 0 ? "" : withoutComments.slice(0, colon).trim();
}

function stripGeometry(body) {
  const declarations = splitTopLevel(body, ";");
  return declarations
    .filter((declaration) => !geometryProperty.test(declarationProperty(declaration)))
    .join(";")
    .replace(/^\s*;|;\s*$/g, "");
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
      const selectors = splitTopLevel(header, ",").map((selector) => selector.trim()).filter(Boolean);
      const protectedSelectors = selectors.filter(targetsSharedRoot);
      const otherSelectors = selectors.filter((selector) => !targetsSharedRoot(selector));
      const leading = rawHeader.match(/^\s*/)?.[0] ?? "";
      if (otherSelectors.length) output += `${leading}${otherSelectors.join(",\n")}{${body}}`;
      if (protectedSelectors.length) {
        const stripped = stripGeometry(body);
        if (stripped.trim()) output += `${leading}${protectedSelectors.join(",\n")}{${stripped}}`;
      }
    }
    cursor = closingIndex + 1;
  }
  return output;
}

let changed = 0;
let removedBytes = 0;
for (const entry of fs.readdirSync(quizRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(quizRoot, entry.name, "theme.css");
  if (!fs.existsSync(file)) continue;
  const before = fs.readFileSync(file, "utf8");
  const after = prune(before).replace(/\n{4,}/g, "\n\n\n");
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
    removedBytes += before.length - after.length;
  }
}

console.log(`Removed ${removedBytes.toLocaleString()} redundant geometry bytes from ${changed} quiz theme(s).`);
