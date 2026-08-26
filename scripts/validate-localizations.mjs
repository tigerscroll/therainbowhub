import fs from "node:fs";
import path from "node:path";
import { SOCIAL_PROOF_COUNTS } from "./social-proof.mjs";
import { expandQuizLocale } from "./quiz-schema-v2.mjs";

const root = process.cwd();
const quizRoot = path.join(root, "data", "quizzes");
const i18nRoot = path.join(root, "data", "i18n");
const infoPageRoot = path.join(root, "data", "info-pages");
const localeFiles = ["de.json", "en.json", "es.json", "fr.json", "it.json", "nl.json", "pt.json"];
const translatedLocaleFiles = localeFiles.filter((file) => file !== "en.json");
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
    if (JSON.stringify(placeholders(source)) !== JSON.stringify(placeholders(localized))) {
      addError(`${location}#${currentPath}: placeholders differ from English.`);
    }
    const localizedVisionAsset = source.includes("paper-fold-punch.svg")
      && /paper-fold-punch-(?:fr|de|it|nl|es|pt)\.svg(?:\?[^\s]*)?$/.test(localized);
    if (isExactTechnicalString(source, pathParts) && localized !== source && !localizedVisionAsset) {
      addError(`${location}#${currentPath}: technical or asset string must remain identical to English.`);
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
  const words = source.match(/[A-Za-zÀ-ÖØ-öø-ÿ]+(?:['’][A-Za-zÀ-ÖØ-öø-ÿ]+)?/g) ?? [];
  if (words.length < 3) return false;
  const properNameOnly = /^(?:Oxford|Cambridge|Harvard|Sarah|Mia)(?:\s+(?:University|College))?$/i.test(source);
  return !properNameOnly;
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
    [studyItem("memory-r1q2", 1), answer("memory-r1q4"), "memory-r1q4/gold-shape"],
    [studyItem("memory-r1q1", 3), answer("memory-r1q8"), "memory-r1q8/opening-animal"],
    [studyItem("memory-r2q2", 1), answer("memory-r2q2"), "memory-r2q2/top-right"],
    [studyItem("memory-r2q4", 1), answer("memory-r2q4"), "memory-r2q4/destination"],
    [studyItem("memory-r2q4", 0), answer("memory-r2q6"), "memory-r2q6/suitcase-colour"],
    [studyItem("memory-r4q4", 1), answer("memory-r4q4"), "memory-r4q4/omar-object"],
    [studyItem("memory-r1q1", 2), answer("memory-r4q5"), "memory-r4q5/opening-colour"],
    [studyItem("memory-r1q1", 3), answer("memory-r5q1"), "memory-r5q1/elephant-colour"],
    [studyItem("memory-r3q4", 2), answer("memory-r5q2"), "memory-r5q2/location-39"],
    [studyItem("memory-r2q4", 2), answer("memory-r5q6"), "memory-r5q6/train-time"],
  ];
  containsContracts.forEach(([container, expected, contract]) => assertTextContains(container, expected, location, contract));

  const equalityContracts = [
    [answer("memory-r1q6"), studyItem("memory-r1q1", 1), "memory-r1q6/after-opening-item"],
    [answer("memory-r4q1"), studyItem("memory-r4q1", 2), "memory-r4q1/third-similar-word"],
    [answer("memory-r5q7"), studyItem("memory-r4q1", 1), "memory-r5q7/predecessor-word"],
  ];
  equalityContracts.forEach(([actual, expected, contract]) => assertTextEquals(actual, expected, location, contract));

  const miaRow = studyItem("memory-r4q4", 0)?.split("·")[0];
  assertTextEquals(answer("memory-r5q8"), miaRow, location, "memory-r5q8/violin-owner");

  const directionRows = q("memory-r5q5")?.study?.items ?? [];
  const south = Number(directionRows[2]?.match(/\d+/)?.[0]);
  const west = Number(directionRows[3]?.match(/\d+/)?.[0]);
  if (!Number.isFinite(south) || !Number.isFinite(west) || Number(answer("memory-r5q5")) !== west - south) {
    addError(`${location}#memory-r5q5/direction-arithmetic: translated study values no longer produce the keyed answer.`);
  }
}

const visionIconAnswerContracts = {
  fr: { "vision-r1q5": "Étoile", "vision-r8q5": "Ancre", "vision-r9q5": "Carré corail" },
  de: { "vision-r1q5": "Stern", "vision-r8q5": "Anker", "vision-r9q5": "Korallfarbenes Quadrat" },
  it: { "vision-r1q5": "Stella", "vision-r8q5": "Ancora", "vision-r9q5": "Quadrato corallo" },
  nl: { "vision-r1q5": "Ster", "vision-r8q5": "Anker", "vision-r9q5": "Koraalkleurig vierkant" },
  es: { "vision-r1q5": "Estrella", "vision-r8q5": "Ancla", "vision-r9q5": "Cuadrado coral" },
  pt: { "vision-r1q5": "Estrela", "vision-r8q5": "Âncora", "vision-r9q5": "Quadrado coral" },
};

function validateVisionSemantics(content, locale, location) {
  const q = (id) => questionById(content, id, location);
  const answer = (id) => correctAnswer(q(id));
  const iconContracts = visionIconAnswerContracts[locale] ?? {};
  for (const [id, expected] of Object.entries(iconContracts)) {
    assertTextEquals(answer(id), expected, location, `${id}/icon-meaning`);
  }

  assertTextContains(q("vision-r5q6")?.study?.items?.[2], answer("vision-r5q6"), location, "vision-r5q6/bottom-left-object");
  assertTextContains(q("vision-r6q1")?.study?.items?.[1], answer("vision-r6q1"), location, "vision-r6q1/blue-number");

  const fContext = q("vision-r3q6")?.context ?? "";
  const fCount = [...fContext].filter((character) => character.toLocaleLowerCase(locale) === "f").length;
  if (fCount !== Number(answer("vision-r3q6"))) {
    addError(`${location}#vision-r3q6/F-count: context contains ${fCount} letter Fs, but the keyed answer is ${JSON.stringify(answer("vision-r3q6"))}.`);
  }
}

const iqWordplayContracts = {
  fr: { "iq-s1q3": "MANTEAU", "iq-s2q2": "SCU", "iq-s4q8": "ÉQUIPE" },
  de: { "iq-s1q3": "BALL", "iq-s2q2": "FOV", "iq-s4q8": "ARBEIT" },
  it: { "iq-s1q3": "TENNIS", "iq-s2q2": "FOV", "iq-s4q8": "LAVORO" },
  nl: { "iq-s1q3": "BAL", "iq-s2q2": "NWT", "iq-s4q8": "WERK" },
  es: { "iq-s1q3": "TENIS", "iq-s2q2": "BXF", "iq-s4q8": "EQUIPO" },
  pt: { "iq-s1q3": "BOLA", "iq-s2q2": "FOV", "iq-s4q8": "TRABALHO" },
};

const localizedFoldLabels = {
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
}

function validateGermanRegisterCorrections(quiz, content, location) {
  const q = (id) => questionById(content, id, location);
  const expectedQuestions = {
    grammar: {
      "grammar-r8q1": "Wähle die korrekte Verbindung.",
    },
    iq: {
      "iq-s2q3": "Du blickst nach Norden und drehst dich zweimal nach rechts. In welche Richtung blickst du nun?",
      "iq-s3q5": "Wende dieselbe Drehung an: Wenn ↑ zu ↘ wird, was wird aus ←?",
      "iq-s4q4": "Starte in der Mitte mit Blick nach Norden. Gehe ein Feld vor, drehe dich nach rechts, gehe zwei Felder, drehe dich wieder nach rechts und gehe ein Feld. Wo landest du?",
      "iq-s5q2": "Verdopple in jeder Zeile die erste Zahl und addiere die zweite. Welche Zahl fehlt?",
      "iq-s5q4": "Starte in der Mitte. Gehe zweimal nach oben, einmal nach rechts, einmal nach unten und zweimal nach links. Wo landest du?",
      "iq-s5q5": "Vertausche nur das erste und das letzte Zeichen. Welcher Code entsteht?",
      "iq-s5q8": "Ein Pfeil zeigt nach oben. Drehe ihn um 90° im Uhrzeigersinn und spiegle ihn anschließend an einer senkrechten Achse. Wohin zeigt er?",
    },
    nursing: {
      "nurse-r3q5": "Du zählst 9 Atemzüge in 30 Sekunden. Wie hoch ist die Atemfrequenz pro Minute?",
    },
    vision: {
      "vision-r8q3": "Starte am roten Punkt und folge seiner gepunkteten Linie. Welchen Buchstaben erreichst du?",
      "vision-r8q4": "Drehe ↘ zweimal um 90 Grad nach rechts.",
    },
  };
  for (const [id, expected] of Object.entries(expectedQuestions[quiz] ?? {})) {
    if (q(id)?.question !== expected) addError(`${location}#${id}.question: approved German direct-address wording changed.`);
  }

  if (quiz === "paramedic" && q("paramedic-r9q3")?.context !== "EINSATZBERICHT — Ein Zufahrtsweg ist 0,4 km lang. Ein zweiter Abschnitt misst 250 m. Trage die Gesamtstrecke in Metern ein.") {
    addError(`${location}#paramedic-r9q3.context: approved German direct-address wording changed.`);
  }
  if (quiz === "vision") {
    if (q("vision-r9q4")?.context !== "Drehe den Pfeil zunächst um 90 Grad im Uhrzeigersinn. Spiegle das Ergebnis anschließend an einer senkrechten Achse.") addError(`${location}#vision-r9q4.context: approved German direct-address wording changed.`);
    if (q("vision-r10q3")?.context !== "Verfolge den Formen- und den Füllzyklus getrennt.") addError(`${location}#vision-r10q3.context: approved German direct-address wording changed.`);
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
  if (quiz === "memory") validateMemorySemantics(content, location);
  if (quiz === "vision") {
    validateVisionSemantics(content, locale, location);
    validateLocalizedFoldAsset(content, locale, location);
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

const portugueseVariantTerms = /\b(?:você|vocês|equipa|equipas|ficheiro|ficheiros|ecrã|ecrãs|tela|telas|registo|registos|registro|registros|secção|secções|seção|seções|prémio|prémios|prêmio|prêmios|comboio|comboios|trem|trens|íman|ímans|ímã|ímãs|câmara|câmaras|câmera|câmeras|telemóvel|telemóveis|celular|celulares|autocarro|autocarros|ônibus|ónibus|facto|factos|fato|fatos|contato|contatos|contacto|contactos|bebé|bebés|bebê|bebês|planeado|planeada|planeados|planeadas|planejado|planejada|planejados|planejadas|planeamento|planejamento|partilhado|partilhada|partilhados|partilhadas|compartilhado|compartilhada|compartilhados|compartilhadas|oxigénio|oxigênio|húmido|húmida|húmidos|húmidas|úmido|úmida|úmidos|úmidas|pequeno-almoço|fiável|fiáveis|confiável|confiáveis|eletrónico|eletrónica|eletrônicos|eletrônicas|eletrônico|eletrônica|académico|académica|acadêmico|acadêmica|económico|económica|econômico|econômica|fenómeno|fenómenos|fenômeno|fenômenos|género|géneros|gênero|gêneros|génio|gênio|travão|travões|travagem|freio|freios|frenagem|autónomo|autónoma|autônomo|autônoma|cronómetro|cronómetros|cronômetro|cronômetros|vómito|vómitos|vômito|vômitos|incómodo|incómoda|incômodo|incômoda|detetar|detetado|detetada|detetar-se|detectar|detectado|detectada|perceção|percepção|regressar|natas|tabuleiro|tabuleiros|encomenda|encomendas|empratamento|confeção|cozedura|descodificar|decodificar|automóvel|automóveis|automotivo|automotiva|automotivos|automotivas|aspeto|aspetos|subtil|subtis)\b/iu;

function findPortugueseVariantTerm(value) {
  return value.match(portugueseVariantTerms);
}

const recurringNativeCopyDefects = {
  fr: [
    { pattern: /\bce examen\b/iu, message: 'use "cet examen" before a vowel sound' },
    { pattern: /\b(?:le|au|du) examen\b/iu, message: "elision is required before examen" },
    { pattern: /\bMeilleure (?:défi|atelier)\b/iu, message: "masculine superlative agreement is required" },
    { pattern: /\bPoint (?:fort|le plus difficile) visuelle\b/iu, quiz: "vision", message: "visual-skill label has incorrect agreement and word order" },
    { pattern: /\bEn progression\b/iu, message: "stale Developing difficulty label remains" },
  ],
  de: [
    { pattern: /\bdeinen stärkster bereich\b/iu, message: "adjective and noun case agreement is incorrect" },
    { pattern: /\bdes (?:Küchentest|Grammatiktest|Intelligenztest|Gedächtnistest|Hebammen-Aufnahmetest|Pflege-Aufnahmetest|Rettungsdienst-Aufnahmetest)\b/iu, message: "the German genitive requires an -s suffix" },
    { pattern: /\bSehtest\b/iu, quiz: "vision", message: 'use "visueller Test" or "visuelle Herausforderung"' },
  ],
  it: [
    { pattern: /\bil tuo area\b/iu, message: 'use feminine "la tua area"' },
    { pattern: /\bArea più (?:forte|difficile) visiva\b/iu, quiz: "vision", message: "visual-area label has unnatural word order" },
    { pattern: /\bMiglior risultato\s*·/iu, message: "stale literal best-round label remains" },
  ],
  es: [
    { pattern: /\bÁrea más (?:fuerte|difícil) visual\b/iu, quiz: "vision", message: "visual-area label has unnatural word order" },
  ],
  nl: [
    { pattern: /\bpang edrag\b/iu, quiz: "chef", message: 'use the compound noun "pangedrag"' },
  ],
  pt: [
    { pattern: /\bÁrea mais (?:forte|difícil) visual\b/iu, quiz: "vision", message: "visual-area label has unnatural word order" },
    { pattern: /\bComo interpretar a resultado de memória\b/iu, quiz: "memory", message: "article agreement is incorrect" },
    { pattern: /\bMelhor ronda\b/iu, message: "shared Portuguese uses etapa here" },
    { pattern: /\b(?:travagem\/frenagem|travão\/freio)\b/iu, message: "visible Portugal/Brazil slash alternatives are forbidden" },
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
    for (const defect of recurringNativeCopyDefects[locale] ?? []) {
      if ((!defect.quiz || defect.quiz === quiz) && defect.pattern.test(value)) {
        addError(`${location}#${pathParts.join(".")}: ${defect.message}: ${JSON.stringify(value)}.`);
      }
    }
  }

  if (locale === "de") {
    const formalAddress = /\b(?:Sie|Ihnen|Ihr|Ihre|Ihrem|Ihren|Ihrer|Ihres)\b/u;
    for (const { value, pathParts } of collectStrings(content)) {
      if (pathParts[0] !== "stages" && formalAddress.test(value)) {
        addError(`${location}#${pathParts.join(".")}: direct-player UI must consistently use du/dein, not formal address.`);
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
  if (locale === "de") {
    for (const { value, pathParts } of directCopy) {
      if (/\b(?:Ihnen|Ihr|Ihre|Ihrem|Ihren|Ihrer|Ihres)\b/u.test(value)) {
        addError(`${location}#${pathParts.join(".")}: /marry must consistently use informal German address.`);
      }
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
  const isEnglishOnly = JSON.stringify(actualLocaleFiles) === JSON.stringify(["en.json"]);
  if (!isEnglishOnly) {
    addError(`data/quizzes/${entry.name}: active quizzes must be worldwide-English only and contain exactly en.json.`);
    continue;
  }
  const english = expandQuizLocale(manifest, JSON.parse(fs.readFileSync(path.join(directory, "en.json"), "utf8")), "en");
  validateQuestions(english, `data/quizzes/${entry.name}/en.json`);
  if (english.landing?.intro?.includes("—")) addError(`data/quizzes/${entry.name}/en.json#landing.intro: landing subtitles must not use em dashes.`);
  if (!Number.isInteger(SOCIAL_PROOF_COUNTS[entry.name])) addError(`data/quizzes/${entry.name}: missing stable social-proof count.`);
  if (english.landing?.socialProof !== undefined) addError(`data/quizzes/${entry.name}/en.json#landing.socialProof: wording must come from shared i18n.`);
  for (const localeFile of []) {
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
    const residue = collectStringPairs(english, localized).filter(looksLikeUntranslatedSentence);
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
  compareStructure(sharedEnglish, localized, [], location);
  const residue = collectStringPairs(sharedEnglish, localized)
    .filter((pair) => pair.source !== "The Rainbow Hub")
    .filter(looksLikeUntranslatedSentence);
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
        .filter(looksLikeUntranslatedSentence);
      residue.forEach(({ source, pathParts }) => {
        addError(`${location}#${pathParts.join(".")}: untranslated English remains: ${JSON.stringify(source)}.`);
      });
    }

    for (const { value, pathParts } of collectStrings(localized)) {
      if (staleExplanationTerms[locale].test(value)) {
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

console.log("Localization validation passed for every worldwide-English quiz and all translated shared site content.");
