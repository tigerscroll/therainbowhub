import fs from "node:fs";
import path from "node:path";
import { SOCIAL_PROOF_COUNTS } from "./social-proof.mjs";
import { expandQuizLocale } from "./quiz-schema-v2.mjs";

const root = process.cwd();
const quizRoot = path.join(root, "data", "quizzes");
const i18nRoot = path.join(root, "data", "i18n");
const infoPageRoot = path.join(root, "data", "info-pages");
const localeFiles = ["ar.json", "bg.json", "cs.json", "da.json", "de.json", "el.json", "en.json", "es.json", "fi.json", "fil.json", "fr.json", "hr.json", "hu.json", "id.json", "it.json", "ms.json", "nb.json", "nl.json", "pl.json", "pt.json", "ro.json", "sk.json", "sr.json", "sv.json", "th.json", "tr.json", "uk.json", "vi.json"];
const translatedLocaleFiles = localeFiles.filter((file) => file !== "en.json");
const requireAllLocales = process.argv.includes("--require-all-locales");
const errors = [];

const exactStringKeys = new Set([
  "id",
  "category",
  "presentation",
  "interactionStyle",
  "mode",
  "src",
  "separator",
  "stageResultMode",
  "icon",
  "resultIcon",
  "finalIcon",
  "lastModified",
]);

function addError(message) {
  errors.push(message);
}

function validateArabicPrimaryCopy(content, location) {
  const primaryPaths = new Set(["title", "eyebrow", "landing.intro", "landing.cta", "results.name"]);
  for (const { value, pathParts } of collectStrings(content)) {
    const currentPath = pathParts.join(".");
    const isPrimary = primaryPaths.has(currentPath)
      || currentPath.endsWith(".headerLabel")
      || /^results\.profiles\.[^.]+\.title$/.test(currentPath);
    if (!isPrimary) continue;
    if (!/\p{Script=Arabic}/u.test(value)) {
      addError(`${location}#${currentPath}: primary Arabic copy must contain Arabic script.`);
    }
    if (/[A-Za-z]{3,}/.test(value)) {
      addError(`${location}#${currentPath}: mixed English remains in primary Arabic copy: ${JSON.stringify(value)}.`);
    }
  }
}

function placeholders(value) {
  return typeof value === "string" ? [...value.matchAll(/\{[^{}]+\}/g)].map((match) => match[0]).sort() : [];
}

function isExactTechnicalString(source, pathParts) {
  const key = pathParts.at(-1);
  return (key === "signal" && source === "fixed")
    || exactStringKeys.has(key)
    || pathParts.includes("categories")
    || (pathParts.includes("dimensions") && pathParts.includes("profiles"))
    || pathParts.includes("icons")
    || /^(?:https?:\/\/|\/quizzes\/)/.test(source);
}

function compareStructure(source, localized, pathParts, location) {
  const currentPath = pathParts.join(".") || "<root>";
  if (source === null || localized === null) {
    if (source !== localized) addError(`${location}#${currentPath}: null structure differs from English.`);
    return;
  }

  if (typeof source !== typeof localized) {
    addError(`${location}#${currentPath}: value type differs from English.`);
    return;
  }

  if (typeof source === "string") {
    if (!localized.trim()) addError(`${location}#${currentPath}: localized string is empty.`);
    if (localized.length > 500 && localized.length > Math.max(1, source.length) * 2.2) {
      addError(`${location}#${currentPath}: localized string is implausibly longer than English (${localized.length}/${source.length} characters).`);
    }
    if (JSON.stringify(placeholders(source)) !== JSON.stringify(placeholders(localized))) {
      addError(`${location}#${currentPath}: placeholders differ from English.`);
    }
    if (pathParts.includes("answers")) {
      const sourceNumbers = source.replace(/\D/g, "");
      const localizedNumbers = localized.replace(/\D/g, "");
      if (sourceNumbers && JSON.stringify(sourceNumbers) !== JSON.stringify(localizedNumbers)) {
        addError(`${location}#${currentPath}: numeric answer values differ from English.`);
      }
    }
    const isPuzzleContent = pathParts.includes("stages")
      && ["answers", "context", "question"].some((key) => pathParts.includes(key));
    const sourcePuzzleTokens = isPuzzleContent
      ? source.match(/\b(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\d)[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g) ?? []
      : [];
    const missingPuzzleTokens = sourcePuzzleTokens.filter((token) => !localized.includes(token));
    if (missingPuzzleTokens.length > 0) {
      addError(`${location}#${currentPath}: puzzle token(s) ${missingPuzzleTokens.map((token) => JSON.stringify(token)).join(", ")} differ from English.`);
    }
    const localizedVisionAsset = source.includes("paper-fold-punch.svg")
      && /paper-fold-punch-(?:fr|de|it|nl|es|pt|ar)\.svg(?:\?[^\s]*)?$/.test(localized);
    if (isExactTechnicalString(source, pathParts) && localized !== source && !localizedVisionAsset) {
      addError(`${location}#${currentPath}: technical or asset string must remain identical to English.`);
    }
    const isVisualAtom = pathParts.includes("visual")
      && pathParts.includes("items")
      && /^(?:[A-Z]|[?○●◯◆▲△□]|↗|↘|↙|↖|│)$/.test(source);
    const isAnswerLetter = pathParts.includes("answers")
      && /^[A-D]$/.test(source)
      && !location.includes("/grammar/");
    if ((isVisualAtom || isAnswerLetter) && localized !== source) {
      addError(`${location}#${currentPath}: puzzle token ${JSON.stringify(source)} must not be translated.`);
    }
    if (pathParts.includes("visual") && pathParts.includes("items")) {
      const sourceSeparators = source.match(/::/g)?.length ?? 0;
      const localizedSeparators = localized.match(/::/g)?.length ?? 0;
      if (localizedSeparators !== sourceSeparators) {
        addError(`${location}#${currentPath}: visual layout separator count differs from English.`);
      }
    }
    return;
  }

  if (["number", "boolean"].includes(typeof source)) {
    if (localized !== source) addError(`${location}#${currentPath}: scoring or structural value differs from English.`);
    return;
  }

  if (Array.isArray(source)) {
    if (!Array.isArray(localized)) {
      addError(`${location}#${currentPath}: expected an array.`);
      return;
    }
    if (localized.length !== source.length) {
      addError(`${location}#${currentPath}: array length differs from English (${localized.length}/${source.length}).`);
      return;
    }
    source.forEach((value, index) => compareStructure(value, localized[index], [...pathParts, String(index)], location));
    return;
  }

  if (!source || typeof source !== "object" || !localized || typeof localized !== "object" || Array.isArray(localized)) {
    return;
  }

  // Weighted-profile answer labels are user-facing object keys. Their values,
  // order and scoring maps must remain structurally identical.
  if (pathParts.at(-1) === "answers") {
    const sourceEntries = Object.entries(source);
    const localizedEntries = Object.entries(localized);
    if (sourceEntries.length !== localizedEntries.length) {
      addError(`${location}#${currentPath}: weighted answer count differs from English.`);
      return;
    }
    localizedEntries.forEach(([label], index) => {
      if (!label.trim()) addError(`${location}#${currentPath}: weighted answer ${index + 1} has an empty label.`);
    });
    sourceEntries.forEach(([, value], index) => {
      compareStructure(value, localizedEntries[index]?.[1], [...pathParts, `<answer-${index + 1}>`], location);
    });
    return;
  }

  const sourceKeys = Object.keys(source).sort();
  const localizedKeys = Object.keys(localized).sort();
  if (JSON.stringify(sourceKeys) !== JSON.stringify(localizedKeys)) {
    addError(`${location}#${currentPath}: object fields differ from English.`);
    return;
  }
  for (const key of sourceKeys) {
    compareStructure(source[key], localized[key], [...pathParts, key], location);
  }
}

function collectStringPairs(source, localized, pathParts = [], output = []) {
  if (typeof source === "string" && typeof localized === "string") {
    output.push({ source, localized, pathParts });
    return output;
  }
  if (Array.isArray(source) && Array.isArray(localized)) {
    source.forEach((value, index) => collectStringPairs(value, localized[index], [...pathParts, String(index)], output));
    return output;
  }
  if (!source || typeof source !== "object" || !localized || typeof localized !== "object") return output;
  if (pathParts.at(-1) === "answers" && !Array.isArray(source) && !Array.isArray(localized)) {
    const sourceEntries = Object.entries(source);
    const localizedEntries = Object.entries(localized);
    sourceEntries.forEach(([label, value], index) => {
      const localizedEntry = localizedEntries[index];
      if (localizedEntry) output.push({ source: label, localized: localizedEntry[0], pathParts: [...pathParts, `<answer-${index + 1}>`] });
      collectStringPairs(value, localizedEntry?.[1], [...pathParts, `<answer-${index + 1}>`], output);
    });
    return output;
  }
  for (const key of Object.keys(source)) collectStringPairs(source[key], localized[key], [...pathParts, key], output);
  return output;
}

function looksLikeUntranslatedSentence({ source, localized, pathParts }) {
  if (source !== localized || isExactTechnicalString(source, pathParts)) return false;
  if (/^(?:[A-Z]{1,4}\d*|\d+(?:[.:/-]\d+)*|[\p{Extended_Pictographic}\s]+)$/u.test(source)) return false;
  // Puzzle codes, symbolic sequences and person-name ordering are intentionally
  // language-neutral. Labels such as START/BASE/COPY are not exempt because
  // those still need localisation around the code itself.
  if (/^(?=.*\d)(?!START\b|BASE\b|COPY\b)[A-Z0-9][A-Z0-9.:/–—\- ·×?]+$/.test(source)) return false;
  if (/^(?:[A-Z]\s*(?:→|–|-|\s)\s*){2,}[A-Z?]?$/.test(source)) return false;
  if (/^(?:[AB]+|\?)(?:\s*→\s*(?:[AB]+|\?))+$/.test(source)) return false;
  if (/^[\d\s.,+?=×÷/\-mLV%]+$/.test(source)) return false;
  if (/^(?:Leo|Mara|Nia)(?:\s+—\s+(?:Leo|Mara|Nia)){2}$/.test(source)) return false;
  // Historical names, official organisation names and mottos are not translated.
  // Limit this exemption to answer choices so ordinary title-case UI copy remains checked.
  if (pathParts.includes("answers")
    && /^(?:[A-Z][\p{L}.']+|(?:da|de|del|van|von|ad|the|of))(?:\s+(?:[A-Z][\p{L}.']+|(?:da|de|del|van|von|ad|the|of))){1,6}$/u.test(source)) return false;
  const words = source.match(/[A-Za-zÀ-ÖØ-öø-ÿ]+(?:['’][A-Za-zÀ-ÖØ-öø-ÿ]+)?/g) ?? [];
  if (words.length < 3) return false;
  const properNameOnly = /^(?:Oxford|Cambridge|Harvard|Sarah|Mia)(?:\s+(?:University|College))?$/i.test(source);
  return !properNameOnly;
}

function containsEmbeddedEnglishClause({ source, localized, pathParts }) {
  if (source === localized || isExactTechnicalString(source, pathParts)) return false;
  const englishFunctionWords = /\b(?:the|this|that|and|your|you|with|from|for|each|every|questions?|answers?|results?|test|quiz|challenge|can|will|are|is|not|of|to|in)\b/gi;
  return source
    .split(/\n+|(?<=[.!?])\s+/u)
    .map((segment) => segment.trim())
    // Quoted song-title blanks stay in their original language by design.
    .filter((segment) => !segment.includes("___"))
    .filter((segment) => segment.length >= 12 && (segment.match(englishFunctionWords)?.length ?? 0) >= 2)
    .some((segment) => localized.includes(segment));
}

function hasEnglishResidue(pair) {
  return looksLikeUntranslatedSentence(pair) || containsEmbeddedEnglishClause(pair);
}

function validateQuestions(content, location) {
  const questions = (content.stages ?? []).flatMap((stage) => stage.questions ?? []);
  if (questions.length !== 10 || content.stages?.length !== 1 || content.stages.some((stage) => stage.questions?.length !== 10)) {
    addError(`${location}: every active quiz must contain one stage of ten questions.`);
  }
  if (new Set(questions.map((question) => question.id)).size !== questions.length) {
    addError(`${location}: localized question IDs are not unique.`);
  }
  for (const question of questions) {
    if (question.explanation !== undefined) addError(`${location}#${question.id}: explanations are forbidden.`);
    if (Array.isArray(question.answers)) {
      if (question.answers.length !== 4 || new Set(question.answers).size !== 4 || question.answers.some((answer) => typeof answer !== "string" || !answer.trim())) {
        addError(`${location}#${question.id}: requires four non-empty, unique localized answers.`);
      }
      const visuallyNormalizedAnswers = question.answers.map((answer) => answer
        .normalize("NFKC")
        .replace(/\s+/gu, " ")
        .trim()
        .toLocaleLowerCase("und"));
      if (new Set(visuallyNormalizedAnswers).size !== visuallyNormalizedAnswers.length) {
        addError(`${location}#${question.id}: localized answers must remain visibly distinct after Unicode, whitespace and case normalization.`);
      }
      // Outside the native Grammar quiz, punctuation and accent-only answer
      // differences are almost always accidental translation duplicates. The
      // Grammar quiz intentionally tests those visible distinctions, so it is
      // excluded from this stronger semantic check.
      const semanticallyNormalizedAnswers = question.answers.map((answer) => normalizedText(answer));
      if (!location.includes("/grammar/")
        && semanticallyNormalizedAnswers.every(Boolean)
        && new Set(semanticallyNormalizedAnswers).size !== semanticallyNormalizedAnswers.length) {
        addError(`${location}#${question.id}: localized answers collapse to the same wording after semantic normalization.`);
      }
      const isUnscoredSelector = question.correct === undefined
        && Array.isArray(question.calibration)
        && question.calibration.length === question.answers.length
        && question.calibration.every((value) => value === 0);
      if (!isUnscoredSelector && (!Number.isInteger(question.correct) || question.correct < 0 || question.correct >= question.answers.length)) {
        addError(`${location}#${question.id}: localized correct index is invalid.`);
      }
    }
  }
}

function quizQuestions(content) {
  return (content.stages ?? []).flatMap((stage) => stage.questions ?? []);
}

function questionById(content, id, location) {
  const question = quizQuestions(content).find((entry) => entry.id === id);
  if (!question) addError(`${location}: semantic contract references missing question ${id}.`);
  return question;
}

function normalizedText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}:]+/gu, " ")
    .trim()
    .toLocaleUpperCase("und");
}

function correctAnswer(question) {
  return Array.isArray(question?.answers) ? question.answers[question.correct] : undefined;
}

function assertTextContains(container, expected, location, contract) {
  if (/^\d{2}:\d{2}$/.test(String(expected))
    && String(container).replace(/\D/g, "").includes(String(expected).replace(/\D/g, ""))) return;
  const normalizedContainer = normalizedText(container).replace(/\s+/g, "");
  const normalizedExpected = normalizedText(expected).replace(/\s+/g, "");
  if (!normalizedExpected || !normalizedContainer.includes(normalizedExpected)) {
    addError(`${location}#${contract}: semantic callback mismatch; ${JSON.stringify(expected)} is not represented by ${JSON.stringify(container)}.`);
  }
}

function assertTextEquals(actual, expected, location, contract) {
  if (normalizedText(actual) !== normalizedText(expected)) {
    addError(`${location}#${contract}: semantic answer mismatch; expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}.`);
  }
}

function validateMemorySemantics(content, location) {
  const q = (id) => questionById(content, id, location);
  const answer = (id) => correctAnswer(q(id));
  const studyItem = (id, index) => q(id)?.study?.items?.[index];

  // Immediate and delayed callbacks must still point to the exact translated
  // detail that the player originally studied. These relational checks are
  // deliberately language-agnostic and survive native rewrites.
  const containsContracts = [
    [studyItem("memory-r1q1", 2), answer("memory-r1q1"), "memory-r1q1/opening-key"],
    [studyItem("memory-r1q2", 2), answer("memory-r1q2"), "memory-r1q2/third-shape"],
    [studyItem("memory-r1q3", 0), answer("memory-r1q3"), "memory-r1q3/opening-number"],
    [studyItem("memory-r2q4", 1), answer("memory-r2q4"), "memory-r2q4/destination"],
    [studyItem("memory-r1q1", 3), answer("memory-r5q1"), "memory-r5q1/elephant-colour"],
    [studyItem("memory-r2q4", 2), answer("memory-r5q6"), "memory-r5q6/train-time"],
  ];
  containsContracts.forEach(([container, expected, contract]) => assertTextContains(container, expected, location, contract));
  assertTextEquals(answer("memory-r1q5"), "K7M2Q", location, "memory-r1q5/exact-code");
  assertTextEquals(answer("memory-r1q7"), "2 – 9 – 4", location, "memory-r1q7/reversed-sequence");
  const lockQuestion = q("memory-r2q3")?.question ?? "";
  if (!lockQuestion.includes("1 LOCK · 2 LOCK · 3 L0CK · 4 LOCK")) {
    addError(`${location}#memory-r2q3/literal-code: LOCK/L0CK puzzle tokens must remain unchanged.`);
  }
}

const visionIconAnswerContracts = {
  ar: { "vision-r8q5": "مرساة" },
  fr: { "vision-r8q5": "Ancre" },
  de: { "vision-r8q5": "Anker" },
  it: { "vision-r8q5": "Ancora" },
  nl: { "vision-r8q5": "Anker" },
  es: { "vision-r8q5": "Ancla" },
  pt: { "vision-r8q5": "Âncora" },
};

function validateVisionSemantics(content, locale, location) {
  const q = (id) => questionById(content, id, location);
  const answer = (id) => correctAnswer(q(id));
  const iconContracts = visionIconAnswerContracts[locale] ?? {};
  for (const [id, expected] of Object.entries(iconContracts)) {
    assertTextEquals(answer(id), expected, location, `${id}/icon-meaning`);
  }

  const fContext = q("vision-r3q6")?.context ?? "";
  const fCount = [...fContext].filter((character) => character.toLocaleLowerCase(locale) === "f").length;
  if (fCount !== Number(answer("vision-r3q6"))) {
    addError(`${location}#vision-r3q6/F-count: context contains ${fCount} letter Fs, but the keyed answer is ${JSON.stringify(answer("vision-r3q6"))}.`);
  }
}

const iqWordplayContracts = Object.fromEntries(
  translatedLocaleFiles.map((file) => [path.basename(file, ".json"), { "iq-s2q2": "EQH" }]),
);

const localizedFoldLabels = {
  ar: ["اطوِ من اليسار إلى اليمين", "اطوِ من الأعلى إلى الأسفل", "اثقب مرة واحدة", "افتح الطيات"],
  fr: ["PLIER DE GAUCHE À DROITE", "PLIER DE HAUT EN BAS", "PERFORER UNE FOIS", "DÉPLIER"],
  de: ["VON LINKS NACH RECHTS FALTEN", "VON OBEN NACH UNTEN FALTEN", "EINMAL LOCHEN", "AUFFALTEN"],
  it: ["PIEGA DA SINISTRA A DESTRA", "PIEGA DALL'ALTO VERSO IL BASSO", "FORA UNA VOLTA", "RIAPRI"],
  nl: ["VOUW VAN LINKS NAAR RECHTS", "VOUW VAN BOVEN NAAR BENEDEN", "MAAK ÉÉN GAATJE", "VOUW OPEN"],
  es: ["DOBLA DE IZQUIERDA A DERECHA", "DOBLA DE ARRIBA ABAJO", "HAZ UN SOLO AGUJERO", "DESDOBLA"],
  pt: ["DOBRAR DA ESQUERDA PARA A DIREITA", "DOBRAR DE CIMA PARA BAIXO", "FAZER UM FURO", "DESDOBRAR"],
};

function validateLocalizedFoldAsset(content, locale, location) {
  const source = questionById(content, "vision-r10q4", location)?.image?.src;
  if (!source) {
    addError(`${location}#vision-r10q4: localized fold asset is missing.`);
    return;
  }
  const relativeAsset = source.split("?")[0].replace(/^\/quizzes\/vision\//, "");
  const assetPath = path.join(quizRoot, "vision", relativeAsset);
  if (!fs.existsSync(assetPath)) {
    addError(`${location}#vision-r10q4: localized fold asset does not exist: ${source}.`);
    return;
  }
  const svg = fs.readFileSync(assetPath, "utf8");
  for (const label of localizedFoldLabels[locale] ?? []) {
    if (!svg.includes(label)) addError(`${location}#vision-r10q4: SVG is missing localized label ${JSON.stringify(label)}.`);
  }
  if (!/<title\b[^>]*>[^<]+<\/title>/.test(svg) || !/<desc\b[^>]*>[^<]+<\/desc>/.test(svg)) {
    addError(`${location}#vision-r10q4: localized SVG requires non-empty title and description text.`);
  }
  if (/FOLD LEFT TO RIGHT|FOLD TOP TO BOTTOM|PUNCH ONCE|UNFOLD|Two folds and one punch|A square folds/.test(svg)) {
    addError(`${location}#vision-r10q4: English instructions remain in the localized SVG.`);
  }
}

function validateIqSemantics(content, locale, location) {
  const q = (id) => questionById(content, id, location);
  const contracts = iqWordplayContracts[locale] ?? {};
  for (const [id, expected] of Object.entries(contracts)) {
    assertTextEquals(correctAnswer(q(id)), expected, location, `${id}/native-wordplay`);
  }
  const codedExample = q("iq-s2q2")?.visual?.items?.[1];
  if (codedExample !== "CAT → DCU") {
    addError(`${location}#iq-s2q2.visual.items.1: the literal coded example CAT → DCU must not be translated.`);
  }
}

function validateGermanRegisterCorrections(quiz, content, location) {
  const q = (id) => questionById(content, id, location);
  const expectedQuestions = {
    iq: {
      "iq-s4q4": "Starten Sie in der Mitte mit Blick nach Norden. Gehen Sie ein Feld vor, drehen Sie sich nach rechts, gehen Sie zwei Felder, drehen Sie sich wieder nach rechts und gehen Sie ein Feld. Wo landen Sie?",
      "iq-s5q2": "Verdoppeln Sie in jeder Zeile die erste Zahl und addieren Sie die zweite. Welche Zahl fehlt?",
      "iq-s5q8": "Ein Pfeil zeigt nach oben. Drehen Sie ihn um 90° im Uhrzeigersinn und spiegeln Sie ihn anschließend an einer senkrechten Achse. Wohin zeigt er?",
    },
    vision: {
      "vision-r8q3": "Starten Sie am roten Punkt und folgen Sie seiner gepunkteten Linie. Welchen Buchstaben erreichen Sie?",
    },
  };
  for (const [id, expected] of Object.entries(expectedQuestions[quiz] ?? {})) {
    if (q(id)?.question !== expected) addError(`${location}#${id}.question: approved German direct-address wording changed.`);
  }

  if (quiz === "memory") {
    const protectedThirdPersonCopy = new Set([
      "Sie können später wieder auftauchen.",
      "Sie reiste nach PARIS.",
      "Ihr Zug fuhr um 08:40 Uhr ab.",
    ]);
    const formalAddress = /\b(?:Sie|Ihnen|Ihr|Ihre|Ihrem|Ihren|Ihrer|Ihres)\b/u;
    for (const { value, pathParts } of collectStrings(content.stages ?? [])) {
      if (formalAddress.test(value) && !protectedThirdPersonCopy.has(value)) {
        addError(`${location}#stages.${pathParts.join(".")}: Memory player instructions must use du/dein, not formal address.`);
      }
    }
  }
}

function validateSemanticContracts(quiz, content, locale, location) {
  if (quiz === "alzheimers") {
    const q = (id) => questionById(content, `alzheimers-q${id}`, location);
    assertTextEquals(q(1)?.study?.items?.[3], correctAnswer(q(1)), location, "alzheimers-q1/fourth-word");
    assertTextEquals(q(1)?.study?.items?.[0], correctAnswer(q(9)), location, "alzheimers-q9/delayed-first-word");
    assertTextEquals(q(5)?.answers?.[2], correctAnswer(q(10)), location, "alzheimers-q10/delayed-shoe");
    assertTextEquals(correctAnswer(q(2)), "R4M7K", location, "alzheimers-q2/exact-code");
    assertTextEquals(correctAnswer(q(6)), "8 – 1 – 4", location, "alzheimers-q6/reverse-order");
    assertTextEquals(correctAnswer(q(8)), "14", location, "alzheimers-q8/subtraction");
  }
  if (quiz === "memory") validateMemorySemantics(content, location);
  if (quiz === "vision") {
    validateVisionSemantics(content, locale, location);
  }
  if (quiz === "iq") validateIqSemantics(content, locale, location);
  if (locale === "de") validateGermanRegisterCorrections(quiz, content, location);
}

function collectStrings(value, pathParts = [], output = []) {
  if (typeof value === "string") output.push({ value, pathParts });
  else if (Array.isArray(value)) value.forEach((item, index) => collectStrings(item, [...pathParts, String(index)], output));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => {
    if (pathParts.at(-1) === "answers") output.push({ value: key, pathParts: [...pathParts, "<answer>"] });
    collectStrings(item, [...pathParts, key], output);
  });
  return output;
}

const portugueseVariantTerms = /(?<!\p{L})(?:você|vocês|equipa|equipas|ficheiro|ficheiros|ecrã|ecrãs|tela|telas|registo|registos|registro|registros|secção|secções|seção|seções|prémio|prémios|prêmio|prêmios|comboio|comboios|trem|trens|íman|ímans|ímã|ímãs|câmara|câmaras|câmera|câmeras|telemóvel|telemóveis|celular|celulares|autocarro|autocarros|ônibus|ónibus|facto|factos|fato|fatos|contato|contatos|contacto|contactos|bebé|bebés|bebê|bebês|planeado|planeada|planeados|planeadas|planejado|planejada|planejados|planejadas|planeamento|planejamento|partilhado|partilhada|partilhados|partilhadas|compartilhado|compartilhada|compartilhados|compartilhadas|oxigénio|oxigênio|húmido|húmida|húmidos|húmidas|úmido|úmida|úmidos|úmidas|pequeno-almoço|fiável|fiáveis|confiável|confiáveis|eletrónico|eletrónica|eletrônicos|eletrônicas|eletrônico|eletrônica|académico|académica|acadêmico|acadêmica|económico|económica|econômico|econômica|fenómeno|fenómenos|fenômeno|fenômenos|género|géneros|gênero|gêneros|génio|gênio|travão|travões|travagem|freio|freios|frenagem|autónomo|autónoma|autônomo|autônoma|cronómetro|cronómetros|cronômetro|cronômetros|vómito|vómitos|vômito|vômitos|incómodo|incómoda|incômodo|incômoda|detetar|detetado|detetada|detetar-se|detectar|detectado|detectada|perceção|percepção|regressar|natas|tabuleiro|tabuleiros|encomenda|encomendas|empratamento|confeção|cozedura|descodificar|decodificar|automóvel|automóveis|automotivo|automotiva|automotivos|automotivas|aspeto|aspetos|subtil|subtis)(?!\p{L})/iu;

function findPortugueseVariantTerm(value) {
  return value.match(/você/iu) ?? value.match(portugueseVariantTerms);
}

const recurringNativeCopyDefects = {
  fr: [
    { pattern: /\bce examen\b/iu, message: 'use "cet examen" before a vowel sound' },
    { pattern: /\b(?:le|au|du) examen\b/iu, message: "elision is required before examen" },
    { pattern: /\bMeilleure (?:défi|atelier)\b/iu, message: "masculine superlative agreement is required" },
    { pattern: /\bPoint (?:fort|le plus difficile) visuelle\b/iu, quiz: "vision", message: "visual-skill label has incorrect agreement and word order" },
    { pattern: /\bEn progression\b/iu, message: "stale Developing difficulty label remains" },
    { pattern: /\b(?:solveur|résolveur|solutionneur|DEVINATION|Flight Attendant)\b/iu, message: "machine-translated or untranslated French UI terminology remains" },
    { pattern: /\b(?:Rayon|Tendon)\b/iu, quiz: "anatomy", message: "literal rather than anatomical French terminology remains" },
    { pattern: /Commencer la cueillette/iu, quiz: "lovers", message: "picking was mistranslated as harvesting" },
    { pattern: /\b(?:avocat réfléchi|compte anonyme)\b/iu, quiz: "socialworker", message: "literal social-care translation remains" },
  ],
  de: [
    { pattern: /\bdeinen stärkster bereich\b/iu, message: "adjective and noun case agreement is incorrect" },
    { pattern: /\bdes (?:Küchentest|Grammatiktest|Intelligenztest|Gedächtnistest|Hebammen-Aufnahmetest|Pflege-Aufnahmetest|Rettungsdienst-Aufnahmetest)\b/iu, message: "the German genitive requires an -s suffix" },
    { pattern: /\bSehtest\b/iu, quiz: "vision", message: 'use "visueller Test" or "visuelle Herausforderung"' },
    { pattern: /\b(?:Foundations|Culinary Pass|Screening-Tool|CENTRAL-VISION|VERMÄTZUNG|APTITUDE|OPERATING-KAMER)\b/iu, message: "machine-translated or untranslated German UI terminology remains" },
    { pattern: /\b(?:Solomon|Arbeit|Markieren|John)\b/iu, quiz: "bible", message: "a biblical name was mistranslated or left in English" },
    { pattern: /\b(?:Membran|Lähmen)\b/iu, quiz: "anatomy", message: "literal rather than anatomical German terminology remains" },
    { pattern: /\bScheck\b/iu, message: "an English homonym was translated with the wrong German meaning" },
    { pattern: /\b(?:Anhang|Träne)\b/iu, quiz: "midwifery", message: "an English homonym was translated with the wrong German meaning" },
    { pattern: /\b(?:Sozialarbeiter-Denker|nachdenkliche Anwalt|Zuhörer-Instinkt|zukünftige Route)\b/iu, quiz: "socialworker", message: "literal social-care translation remains" },
  ],
  it: [
    { pattern: /\bil tuo area\b/iu, message: 'use feminine "la tua area"' },
    { pattern: /\bArea più (?:forte|difficile) visiva\b/iu, quiz: "vision", message: "visual-area label has unnatural word order" },
    { pattern: /\bMiglior risultato\s*·/iu, message: "stale literal best-round label remains" },
    { pattern: /\b(?:Culinary Pass|CENTRAL-VISION|ATTITUDE|DEVINATION|Flight Attendant)\b/iu, message: "machine-translated or untranslated Italian UI terminology remains" },
    { pattern: /\b(?:Lavoro|Segno)\b/iu, quiz: "bible", message: "a biblical name was translated as an ordinary word" },
    { pattern: /\b(?:Vescia|lacrima)\b/iu, quiz: "midwifery", message: "incorrect Italian medical or wrapper terminology remains" },
    { pattern: /\b(?:Assegno personale|avvocato premuroso|percorso futuro)\b/iu, message: "an English homonym or idiom was translated literally" },
  ],
  es: [
    { pattern: /\bÁrea más (?:fuerte|difícil) visual\b/iu, quiz: "vision", message: "visual-area label has unnatural word order" },
    { pattern: /\b(?:partitura de entretenimiento|conjusión|hipotesis|radiotransistores|Train Driver)\b/iu, message: "machine-translated, misspelled, or untranslated Spanish terminology remains" },
    { pattern: /\b(?:rostro registrado|herida curativa|imagen completa)\b/iu, message: "literal Spanish phrasing remains" },
  ],
  nl: [
    { pattern: /\bpang edrag\b/iu, quiz: "chef", message: 'use the compound noun "pangedrag"' },
    { pattern: /\b(?:entertainmentuitdaging|entertainmentquiz|CENTRAL-VISION|APTITUDE|OPERATING-KAMER|brutoscore|CAPITUDE|NUMERACTIE|INCIDENTEST|PAARDEN)\b/iu, message: "machine-translated or untranslated Dutch UI terminology remains" },
    { pattern: /\bje (?:heeft|zich)\b/iu, message: "Dutch second-person agreement is incorrect" },
    { pattern: /Vrouw B\s*·\s*Juist/iu, message: "direction label was mistranslated as correctness" },
    { pattern: /\b(?:Solomon|Functie|Markering|John)\b/iu, quiz: "bible", message: "a biblical name was mistranslated or left in English" },
    { pattern: /\b(?:plukken|vertraagde noot|opgenomen kant|nadenkende advocaat|toekomstige route)\b/iu, message: "an English homonym or idiom was translated literally" },
    { pattern: /\b(?:akkoordlijn|TAND FUNCTIE)\b/iu, message: "incorrect Dutch compound terminology remains" },
  ],
  pt: [
    { pattern: /\bÁrea mais (?:forte|difícil) visual\b/iu, quiz: "vision", message: "visual-area label has unnatural word order" },
    { pattern: /\bComo interpretar a resultado de memória\b/iu, quiz: "memory", message: "article agreement is incorrect" },
    { pattern: /\bMelhor ronda\b/iu, message: "shared Portuguese uses etapa here" },
    { pattern: /\b(?:travagem\/frenagem|travão\/freio)\b/iu, message: "visible Portugal/Brazil slash alternatives are forbidden" },
    { pattern: /\b(?:numeramento|compareção|Train Driver|Culinary Pass|perpésua|pontuação bruta|carro alegórico)\b/iu, message: "machine-translated, misspelled, or untranslated Portuguese terminology remains" },
    { pattern: /\b(?:da|na) visor\b/iu, message: "Portuguese article agreement is incorrect" },
    { pattern: /\bPerguntas perdidas\b/iu, message: "literal translation of missed questions remains" },
    { pattern: /^(?:Trabalho|Marca|Peter|John)$/iu, quiz: "bible", message: "a biblical name was mistranslated or left in English" },
    { pattern: /\bCheque Pessoal\b/iu, message: "an English homonym or idiom was translated literally" },
    { pattern: /\b(?:plano de fundo|conta anônima|rotas futuras)\b/iu, quiz: "socialworker", message: "an English homonym or idiom was translated literally" },
    { pattern: /\b(?:Esconda a lágrima|Linhas retas parecendo)\b/iu, quiz: "midwifery", message: "an English homonym or idiom was translated literally" },
    { pattern: /\bHOMÓFONE\b/iu, quiz: "word", message: "homófono has the wrong grammatical gender" },
  ],
};

const nonEntranceQuizzes = new Set(["memory", "vision", "mechanic", "iq", "grammar"]);
const genericShellValues = {
  fr: new Set(["Progression", "SCORE ACTUEL", "PARCOURS DU QUIZ", "{value} / {total} étapes terminées", "ÉTAPE TERMINÉE"]),
  de: new Set(["Fortschritt", "AKTUELLER PUNKTSTAND", "QUIZVERLAUF", "{value} / {total} Runden abgeschlossen", "RUNDE ABGESCHLOSSEN"]),
  it: new Set(["Avanzamento", "PUNTEGGIO ATTUALE", "PERCORSO DEL QUIZ", "{value} / {total} fasi completate", "FASE COMPLETATA"]),
  nl: new Set(["Voortgang", "HUIDIGE SCORE", "QUIZTRAJECT", "{value} / {total} rondes voltooid", "RONDE VOLTOOID"]),
  es: new Set(["Progreso", "PUNTUACIÓN ACTUAL", "RECORRIDO DEL QUIZ", "{value} / {total} etapas completadas", "ETAPA COMPLETADA"]),
  pt: new Set(["Progresso", "RESULTADO ATUAL", "PERCURSO DO TESTE", "{value} / {total} etapas concluídas", "ETAPA CONCLUÍDA"]),
};

function validateNativeCopyPatterns(quiz, content, locale, location) {
  for (const { value, pathParts } of collectStrings(content)) {
    if (isExactTechnicalString(value, pathParts)) continue;
    for (const defect of recurringNativeCopyDefects[locale] ?? []) {
      if ((!defect.quiz || defect.quiz === quiz) && defect.pattern.test(value)) {
        addError(`${location}#${pathParts.join(".")}: ${defect.message}: ${JSON.stringify(value)}.`);
      }
    }
  }

  if (locale === "de") {
    const formalAddress = /\b(?:Sie|Ihnen|Ihr|Ihre|Ihrem|Ihren|Ihrer|Ihres)\b/u;
    const informalAddress = /\b(?:du|dich|dir|dein(?:e|em|en|er|es)?)\b/iu;
    for (const { value, pathParts } of collectStrings(content)) {
      if (["memory", "years-left"].includes(quiz) && pathParts[0] !== "stages" && formalAddress.test(value)) {
        addError(`${location}#${pathParts.join(".")}: direct-player UI must consistently use du/dein, not formal address.`);
      }
      if (!["memory", "years-left"].includes(quiz) && informalAddress.test(value)) {
        addError(`${location}#${pathParts.join(".")}: this locale must consistently use the formal German register.`);
      }
    }
  }

  const stages = content.career?.stages ?? [];
  for (let index = 0; index < stages.length - 1; index += 1) {
    const next = stages[index]?.next;
    const canonicalDifficulty = stages[index + 1]?.difficulty;
    if (next?.difficulty !== canonicalDifficulty) {
      addError(`${location}#career.stages.${index}.next.difficulty: must exactly match the following stage difficulty ${JSON.stringify(canonicalDifficulty)}.`);
    }
    if (next?.eyebrow && canonicalDifficulty
      && !normalizedText(next.eyebrow).endsWith(normalizedText(canonicalDifficulty))) {
      addError(`${location}#career.stages.${index}.next.eyebrow: must end with the following stage's canonical difficulty label.`);
    }
  }

  if (nonEntranceQuizzes.has(quiz)) {
    const genericValues = genericShellValues[locale] ?? new Set();
    const shellEntries = [
      ["career.resultProgressLabel", content.career?.resultProgressLabel],
      ["career.currentScoreLabel", content.career?.currentScoreLabel],
      ["career.journeyLabel", content.career?.journeyLabel],
      ["career.kitchensCleared", content.career?.kitchensCleared],
      ...((content.checkpoint?.reveals ?? []).map((reveal, index) => [`checkpoint.reveals.${index}.badge`, reveal.badge])),
      ...(stages.flatMap((stage, index) => [
        [`career.stages.${index}.preAdBadge`, stage.preAdBadge],
        [`career.stages.${index}.resultLabel`, stage.resultLabel],
      ])),
    ];
    for (const [pathLabel, value] of shellEntries) {
      if (typeof value === "string" && genericValues.has(value)) {
        addError(`${location}#${pathLabel}: non-entrance quiz must use quiz-specific shell terminology, not ${JSON.stringify(value)}.`);
      }
    }
  }
}

function validateMarryLocalization(english, localized, locale, location) {
  const expectedProfiles = ["warm_anchor", "playful_spark", "quiet_creative", "grounded_builder", "magnetic_connector", "curious_explorer", "thoughtful_dreamer", "ambitious_teammate"];
  const sourceQuestions = quizQuestions(english);
  const localizedQuestions = quizQuestions(localized);
  const sourceIds = sourceQuestions.map((question) => question.id);
  const localizedIds = localizedQuestions.map((question) => question.id);
  if (JSON.stringify(localizedIds) !== JSON.stringify(sourceIds)) {
    addError(`${location}: question IDs or order differ from the English /marry source.`);
    return;
  }

  const selector = localizedQuestions[0];
  if (selector.id !== "marry-r1q1"
    || selector.correct !== undefined
    || JSON.stringify(selector.calibration) !== JSON.stringify([0, 0, 0, 0])) {
    addError(`${location}#marry-r1q1: Q1 must remain the only unscored portrait selector.`);
  }
  if (localizedQuestions.slice(1).some((question) => question.correct !== undefined || question.calibration !== undefined)) {
    addError(`${location}: only marry-r1q1 may contain selector calibration; the other 39 questions must remain weighted choices.`);
  }

  for (let questionIndex = 1; questionIndex < sourceQuestions.length; questionIndex += 1) {
    const sourceAnswers = Object.values(sourceQuestions[questionIndex].answers ?? {});
    const localizedAnswers = Object.values(localizedQuestions[questionIndex].answers ?? {});
    if (JSON.stringify(localizedAnswers) !== JSON.stringify(sourceAnswers)) {
      addError(`${location}#${sourceQuestions[questionIndex].id}: answer scoring vectors or order differ from English.`);
    }
  }

  if (JSON.stringify(localized.results?.profiles?.map((profile) => profile.id)) !== JSON.stringify(expectedProfiles)) {
    addError(`${location}#results.profiles: archetype IDs or fixed tie order differ from English.`);
  }
  for (const profile of localized.results?.profiles ?? []) {
    if (!Array.isArray(profile.traits) || profile.traits.length !== 3) {
      addError(`${location}#results.profiles.${profile.id}: exactly three translated trait chips are required.`);
    }
  }
  const chemistry = localized.results?.profileReveal?.consistencyLabels ?? {};
  if (!String(chemistry.high ?? "").includes("96")
    || !String(chemistry.medium ?? "").includes("91")
    || !String(chemistry.mixed ?? "").includes("86")) {
    addError(`${location}#results.profileReveal.consistencyLabels: chemistry percentages must remain 96 / 91 / 86.`);
  }

  const directCopy = collectStrings(localized)
    .filter(({ pathParts }) => !isExactTechnicalString("", pathParts));
  for (const { value, pathParts } of directCopy) {
    if (/\[\[M\d+\*?\]\]/u.test(value)) {
      addError(`${location}#${pathParts.join(".")}: translation marker residue remains.`);
    }
    if (/(?:\([aeo]\)|\b(?:il\/elle|lui\/lei|él\/ella|ele\/ela)\b)/iu.test(value)) {
      addError(`${location}#${pathParts.join(".")}: mechanical gender workaround remains: ${JSON.stringify(value)}.`);
    }
  }
  if (locale === "es") {
    for (const { value, pathParts } of directCopy) {
      if (/\b(?:vosotros|vosotras|vuestro|vuestra|vuestros|vuestras)\b/iu.test(value)) {
        addError(`${location}#${pathParts.join(".")}: /marry Spanish must use international-neutral address, not vosotros forms.`);
      }
    }
  }
}

for (const entry of fs.readdirSync(quizRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || !fs.existsSync(path.join(quizRoot, entry.name, "quiz.json"))) continue;
  const directory = path.join(quizRoot, entry.name);
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, "quiz.json"), "utf8"));
  const themeFile = path.join(directory, "theme.css");
  if (fs.existsSync(themeFile) && /\[aria-label\s*=/.test(fs.readFileSync(themeFile, "utf8"))) {
    addError(`data/quizzes/${entry.name}/theme.css: visual styling must use stable question IDs, not localized aria-label text.`);
  }
  const actualLocaleFiles = fs.readdirSync(directory)
    .filter((file) => file.endsWith(".json") && file !== "quiz.json")
    .sort();
  const expectedLocaleFiles = localeFiles;
  const independentLocales = manifest.engine?.localeParity === "independent" && !requireAllLocales;
  if (!actualLocaleFiles.includes("en.json")) {
    addError(`data/quizzes/${entry.name}: en.json is required.`);
    continue;
  }
  if (!independentLocales && JSON.stringify(actualLocaleFiles) !== JSON.stringify(expectedLocaleFiles)) {
    addError(`data/quizzes/${entry.name}: strict locale parity requires exactly ${expectedLocaleFiles.join(", ")}.`);
    continue;
  }
  const english = expandQuizLocale(manifest, JSON.parse(fs.readFileSync(path.join(directory, "en.json"), "utf8")), "en");
  validateQuestions(english, `data/quizzes/${entry.name}/en.json`);
  if (english.landing?.intro?.includes("—")) addError(`data/quizzes/${entry.name}/en.json#landing.intro: landing subtitles must not use em dashes.`);
  if (!Number.isInteger(SOCIAL_PROOF_COUNTS[entry.name])) addError(`data/quizzes/${entry.name}: missing stable social-proof count.`);
  if (english.landing?.socialProof !== undefined) addError(`data/quizzes/${entry.name}/en.json#landing.socialProof: wording must come from shared i18n.`);
  for (const localeFile of actualLocaleFiles.filter((file) => file !== "en.json")) {
    const location = `data/quizzes/${entry.name}/${localeFile}`;
    const locale = path.basename(localeFile, ".json");
    const localized = expandQuizLocale(manifest, JSON.parse(fs.readFileSync(path.join(directory, localeFile), "utf8")), locale);
    if (localized.landing?.intro?.includes("—")) addError(`${location}#landing.intro: landing subtitles must not use em dashes.`);
    if (localized.landing?.socialProof !== undefined) addError(`${location}#landing.socialProof: wording must come from shared i18n.`);
    compareStructure(english, localized, [], location);
    validateQuestions(localized, location);
    if (entry.name === "marry") validateMarryLocalization(english, localized, locale, location);
    validateSemanticContracts(entry.name, localized, locale, location);
    validateNativeCopyPatterns(entry.name, localized, locale, location);
    if (locale === "ar") validateArabicPrimaryCopy(localized, location);
    const residue = collectStringPairs(english, localized)
      .filter((pair) => !(entry.name === "vision" && pair.source === "OFFICE FOCUS: FIND FIVE FLAGS FAST."))
      .filter(hasEnglishResidue);
    residue.slice(0, 20).forEach(({ source, pathParts }) => {
      addError(`${location}#${pathParts.join(".")}: untranslated English remains: ${JSON.stringify(source)}.`);
    });
    if (residue.length > 20) addError(`${location}: ${residue.length - 20} additional untranslated English strings remain.`);
    if (localeFile === "pt.json") {
      for (const { value, pathParts } of collectStrings(localized)) {
        const match = findPortugueseVariantTerm(value);
        if (match) addError(`${location}#${pathParts.join(".")}: region-specific Portuguese term ${JSON.stringify(match[0])} must be neutralized.`);
      }
    }
  }
}

// Shared shell copy is part of every localized quiz funnel, so it receives the
// same structural, placeholder and untranslated-residue checks as quiz data.
const sharedEnglish = JSON.parse(fs.readFileSync(path.join(i18nRoot, "en.json"), "utf8"));
for (const localeFile of translatedLocaleFiles) {
  const location = `data/i18n/${localeFile}`;
  const localized = JSON.parse(fs.readFileSync(path.join(i18nRoot, localeFile), "utf8"));
  if (localeFile === "ar.json" && (localized.locale?.code !== "ar" || localized.locale?.direction !== "rtl")) {
    addError(`${location}#locale: Arabic shared copy must declare code ar and direction rtl.`);
  }
  compareStructure(sharedEnglish, localized, [], location);
  const residue = collectStringPairs(sharedEnglish, localized)
    .filter((pair) => pair.source !== "The Rainbow Hub")
    .filter(hasEnglishResidue);
  residue.forEach(({ source, pathParts }) => {
    addError(`${location}#${pathParts.join(".")}: untranslated English remains: ${JSON.stringify(source)}.`);
  });
  if (localeFile === "pt.json") {
    for (const { value, pathParts } of collectStrings(localized)) {
      const match = findPortugueseVariantTerm(value);
      if (match) addError(`${location}#${pathParts.join(".")}: region-specific Portuguese term ${JSON.stringify(match[0])} must be neutralized.`);
    }
  }
}

// About, contact and legal pages are part of the localized site experience.
// Keep their data shape in lockstep with English and reject stale terminology
// from the former answer-explanation flow.
const actualInfoLocaleFiles = fs.readdirSync(infoPageRoot)
  .filter((file) => file.endsWith(".json"))
  .sort();
if (JSON.stringify(actualInfoLocaleFiles) !== JSON.stringify(localeFiles)) {
  addError(`data/info-pages: locale set must be exactly ${localeFiles.join(", ")}.`);
} else {
  const infoEnglish = JSON.parse(fs.readFileSync(path.join(infoPageRoot, "en.json"), "utf8"));
  const staleExplanationTerms = {
    ar: /(?:تفسيرات|شروح)/u,
    en: /\bexplanations?\b/iu,
    fr: /\bexplications?\b/iu,
    de: /\bErklärungen\b/iu,
    it: /\bspiegazioni?\b/iu,
    nl: /\buitleg\b/iu,
    es: /\bexplicaciones?\b/iu,
    pt: /\bexplicações?\b/iu,
  };

  for (const localeFile of localeFiles) {
    const locale = path.basename(localeFile, ".json");
    const location = `data/info-pages/${localeFile}`;
    const localized = JSON.parse(fs.readFileSync(path.join(infoPageRoot, localeFile), "utf8"));
    if (locale !== "en") {
      compareStructure(infoEnglish, localized, [], location);
      const residue = collectStringPairs(infoEnglish, localized)
        .filter((pair) => pair.source !== "The Rainbow Hub")
        .filter(hasEnglishResidue);
      residue.forEach(({ source, pathParts }) => {
        addError(`${location}#${pathParts.join(".")}: untranslated English remains: ${JSON.stringify(source)}.`);
      });
    }

    for (const { value, pathParts } of collectStrings(localized)) {
      if (staleExplanationTerms[locale]?.test(value)) {
        addError(`${location}#${pathParts.join(".")}: stale answer-explanation wording must use answer key or answer review terminology.`);
      }
      if (locale === "pt") {
        const match = findPortugueseVariantTerm(value);
        if (match) addError(`${location}#${pathParts.join(".")}: region-specific Portuguese term ${JSON.stringify(match[0])} must be neutralized.`);
      }
    }
  }
}

if (errors.length) {
  console.error(`Localization validation failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log("Localization validation passed for all quiz locale sets and translated shared site content.");
