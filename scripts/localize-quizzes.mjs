import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT = process.cwd();
const QUIZ_ROOT = path.join(ROOT, "data", "quizzes");
const LOCALES = process.env.QUIZ_LOCALES
  ? process.env.QUIZ_LOCALES.split(",").map((locale) => locale.trim()).filter(Boolean)
  : ["fr", "de", "it", "nl", "es", "pt"];
const CACHE_PATH =
  process.env.QUIZ_TRANSLATE_CACHE || "/private/tmp/quiz-localization-cache.json";
const PYTHON =
  process.env.QUIZ_TRANSLATE_PYTHON ||
  "/Users/jamesharris/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const ARGOS_RUNTIME = process.env.QUIZ_ARGOS_RUNTIME || "/private/tmp/argos-runtime";
const TRANSLATOR_SCRIPT =
  process.env.QUIZ_TRANSLATOR_SCRIPT || "/private/tmp/argos_translate_batch.py";

const TECHNICAL_KEYS = new Set([
  "id",
  "category",
  "presentation",
  "interactionStyle",
  "mode",
  "src",
  "separator",
  "signal",
  "stageResultMode",
  "icon",
  "finalIcon",
  "resultIcon",
]);

const CURATED = {
  fr: {
    Continue: "Continuer",
    "Start Test": "Commencer le test",
    "Start Quiz": "Commencer le quiz",
    Start: "Commencer",
    "See My Result": "Voir mon résultat",
    "See My Results": "Voir mes résultats",
    "See My Final Result": "Voir mon résultat final",
    "See My Estimate": "Voir mon estimation",
    "Reveal My Score": "Découvrir mon score",
    "Short ad first — then continue.": "Une courte publicité, puis vous continuez.",
    "Short ad first — then see your result.":
      "Une courte publicité, puis découvrez votre résultat.",
    "Short ad first — then see your estimate.":
      "Une courte publicité, puis découvrez votre estimation.",
    Foundation: "Fondamentaux",
    Developing: "Intermédiaire",
    Skilled: "Confirmé",
    Advanced: "Avancé",
    "Final Assessment": "Évaluation finale",
    COMPLETE: "TERMINÉ",
    complete: "terminé",
    correct: "bonnes réponses",
  },
  de: {
    Continue: "Weiter",
    "Start Test": "Test starten",
    "Start Quiz": "Quiz starten",
    Start: "Starten",
    "See My Result": "Mein Ergebnis ansehen",
    "See My Results": "Meine Ergebnisse ansehen",
    "See My Final Result": "Mein Endergebnis ansehen",
    "See My Estimate": "Meine Schätzung ansehen",
    "Reveal My Score": "Mein Ergebnis anzeigen",
    "Short ad first — then continue.": "Kurze Werbung, dann geht es weiter.",
    "Short ad first — then see your result.":
      "Kurze Werbung, dann siehst du dein Ergebnis.",
    "Short ad first — then see your estimate.":
      "Kurze Werbung, dann siehst du deine Schätzung.",
    Foundation: "Grundlagen",
    Developing: "Aufbau",
    Skilled: "Fortgeschritten",
    Advanced: "Anspruchsvoll",
    "Final Assessment": "Abschlussprüfung",
    COMPLETE: "ABGESCHLOSSEN",
    complete: "abgeschlossen",
    correct: "richtig",
  },
  it: {
    Continue: "Continua",
    "Start Test": "Inizia il test",
    "Start Quiz": "Inizia il quiz",
    Start: "Inizia",
    "See My Result": "Vedi il mio risultato",
    "See My Results": "Vedi i miei risultati",
    "See My Final Result": "Vedi il risultato finale",
    "See My Estimate": "Vedi la mia stima",
    "Reveal My Score": "Scopri il mio punteggio",
    "Short ad first — then continue.": "Prima un breve annuncio, poi si continua.",
    "Short ad first — then see your result.":
      "Prima un breve annuncio, poi vedrai il risultato.",
    "Short ad first — then see your estimate.":
      "Prima un breve annuncio, poi vedrai la stima.",
    Foundation: "Fondamenti",
    Developing: "Intermedio",
    Skilled: "Competente",
    Advanced: "Avanzato",
    "Final Assessment": "Prova finale",
    COMPLETE: "COMPLETATO",
    complete: "completato",
    correct: "corrette",
  },
  nl: {
    Continue: "Verder",
    "Start Test": "Start de test",
    "Start Quiz": "Start de quiz",
    Start: "Start",
    "See My Result": "Bekijk mijn resultaat",
    "See My Results": "Bekijk mijn resultaten",
    "See My Final Result": "Bekijk mijn eindresultaat",
    "See My Estimate": "Bekijk mijn schatting",
    "Reveal My Score": "Bekijk mijn score",
    "Short ad first — then continue.": "Eerst een korte advertentie, daarna ga je verder.",
    "Short ad first — then see your result.":
      "Eerst een korte advertentie, daarna zie je je resultaat.",
    "Short ad first — then see your estimate.":
      "Eerst een korte advertentie, daarna zie je je schatting.",
    Foundation: "Basis",
    Developing: "In ontwikkeling",
    Skilled: "Gevorderd",
    Advanced: "Uitdagend",
    "Final Assessment": "Eindproef",
    COMPLETE: "VOLTOOID",
    complete: "voltooid",
    correct: "goed",
  },
  es: {
    Continue: "Continuar",
    "Start Test": "Empezar el test",
    "Start Quiz": "Empezar el quiz",
    Start: "Empezar",
    "See My Result": "Ver mi resultado",
    "See My Results": "Ver mis resultados",
    "See My Final Result": "Ver mi resultado final",
    "See My Estimate": "Ver mi estimación",
    "Reveal My Score": "Descubrir mi puntuación",
    "Short ad first — then continue.": "Primero un anuncio breve; después, continúa.",
    "Short ad first — then see your result.":
      "Primero un anuncio breve; después, verás tu resultado.",
    "Short ad first — then see your estimate.":
      "Primero un anuncio breve; después, verás tu estimación.",
    Foundation: "Fundamentos",
    Developing: "En desarrollo",
    Skilled: "Competente",
    Advanced: "Avanzado",
    "Final Assessment": "Evaluación final",
    COMPLETE: "COMPLETADO",
    complete: "completado",
    correct: "correctas",
  },
  pt: {
    Continue: "Continuar",
    "Start Test": "Iniciar o teste",
    "Start Quiz": "Iniciar o quiz",
    Start: "Iniciar",
    "See My Result": "Ver o meu resultado",
    "See My Results": "Ver os meus resultados",
    "See My Final Result": "Ver o meu resultado final",
    "See My Estimate": "Ver a minha estimativa",
    "Reveal My Score": "Descobrir a minha pontuação",
    "Short ad first — then continue.": "Primeiro, um anúncio breve; depois, continue.",
    "Short ad first — then see your result.":
      "Primeiro, um anúncio breve; depois, veja o seu resultado.",
    "Short ad first — then see your estimate.":
      "Primeiro, um anúncio breve; depois, veja a sua estimativa.",
    Foundation: "Fundamentos",
    Developing: "Em progressão",
    Skilled: "Experiente",
    Advanced: "Avançado",
    "Final Assessment": "Avaliação final",
    COMPLETE: "CONCLUÍDO",
    complete: "concluído",
    correct: "corretas",
  },
};

const cache = await readJson(CACHE_PATH, {});
let cacheDirty = false;

function pathKey(parts) {
  return parts.filter((part) => typeof part === "string").at(-1);
}

function shouldTranslate(value, parts) {
  const key = pathKey(parts);
  if (TECHNICAL_KEYS.has(key)) return false;
  if (parts.includes("categories")) return false;
  if (parts.includes("icons")) return false;
  if (/^(?:https?:\/\/|\/quizzes\/)/.test(value)) return false;
  if (!/[A-Za-z]/.test(value)) return false;
  return true;
}

function protectPlaceholders(value) {
  const placeholders = [];
  const text = value.replace(/\{[^{}]+\}/g, (placeholder) => {
    const token = `98765000${placeholders.length}56789`;
    placeholders.push(placeholder);
    return token;
  });
  return { text, placeholders };
}

function restorePlaceholders(value, placeholders) {
  let result = value;
  placeholders.forEach((placeholder, index) => {
    const token = `98765000${index}56789`;
    result = result.replaceAll(token, placeholder);
  });
  return result;
}

function collectStrings(value, parts, output) {
  if (typeof value === "string") {
    if (shouldTranslate(value, parts)) output.add(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, [...parts, index], output));
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [key, child] of Object.entries(value)) {
    const childPath = [...parts, key];
    if (typeof child === "string") {
      if (shouldTranslate(child, childPath)) output.add(child);
      continue;
    }
    if (key === "answers" && child && !Array.isArray(child)) {
      for (const answer of Object.keys(child)) {
        if (shouldTranslate(answer, [...childPath, "<answer>"])) output.add(answer);
      }
      continue;
    }
    collectStrings(child, childPath, output);
  }
}

function applyTranslations(value, parts, translations) {
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      typeof item === "string" && shouldTranslate(item, [...parts, index])
        ? translations.get(item) ?? item
        : applyTranslations(item, [...parts, index], translations),
    );
  }
  if (!value || typeof value !== "object") return value;

  const result = {};
  for (const [key, child] of Object.entries(value)) {
    const childPath = [...parts, key];
    if (typeof child === "string") {
      result[key] = shouldTranslate(child, childPath)
        ? translations.get(child) ?? child
        : child;
      continue;
    }
    if (key === "answers" && child && !Array.isArray(child)) {
      const answers = {};
      for (const [answer, weights] of Object.entries(child)) {
        const translated = shouldTranslate(answer, [...childPath, "<answer>"])
          ? translations.get(answer) ?? answer
          : answer;
        if (Object.hasOwn(answers, translated)) {
          throw new Error(`Translated answer collision at ${parts.join(".")}: ${translated}`);
        }
        answers[translated] = weights;
      }
      result[key] = answers;
      continue;
    }
    result[key] = applyTranslations(child, childPath, translations);
  }
  return result;
}

async function translateOffline(locale, originals) {
  const protectedItems = originals.map(protectPlaceholders);
  const inputPath = `/private/tmp/quiz-localize-${locale}-input.json`;
  const outputPath = `/private/tmp/quiz-localize-${locale}-output.json`;
  await fs.writeFile(
    inputPath,
    JSON.stringify(protectedItems.map(({ text }) => text)),
  );

  await new Promise((resolve, reject) => {
    const child = spawn(PYTHON, [TRANSLATOR_SCRIPT, locale, inputPath, outputPath], {
      stdio: "inherit",
      env: {
        ...process.env,
        XDG_DATA_HOME: "/private/tmp/argos-data",
        XDG_CACHE_HOME: "/private/tmp/argos-cache",
        XDG_CONFIG_HOME: "/private/tmp/argos-config",
        ARGOS_CHUNK_TYPE: "MINISBD",
        PYTHONPATH: ARGOS_RUNTIME,
      },
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Offline translation exited with code ${code}`));
    });
  });
  const translated = JSON.parse(await fs.readFile(outputPath, "utf8"));
  if (translated.length !== originals.length) {
    throw new Error(`Translation count mismatch: ${translated.length}/${originals.length}`);
  }
  return translated.map((value, index) =>
    restorePlaceholders(value, protectedItems[index].placeholders),
  );
}

async function buildLocale(locale, quizDocuments) {
  const originals = new Set();
  quizDocuments.forEach(({ data }) => collectStrings(data, [], originals));

  const translations = new Map();
  const pending = [];
  for (const original of originals) {
    const curated = CURATED[locale]?.[original];
    const cached = cache[locale]?.[original];
    if (curated) translations.set(original, curated);
    else if (cached) translations.set(original, cached);
    else pending.push(original);
  }

  console.log(`${locale.toUpperCase()}: ${originals.size} strings, ${pending.length} uncached`);
  if (pending.length) {
    const translated = await translateOffline(locale, pending);
    cache[locale] ||= {};
    pending.forEach((original, itemIndex) => {
      const localized = translated[itemIndex];
      translations.set(original, localized);
      cache[locale][original] = localized;
    });
    cacheDirty = true;
    await fs.writeFile(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`);
    cacheDirty = false;
  }

  for (const { slug, data } of quizDocuments) {
    const localized = applyTranslations(data, [], translations);
    const output = path.join(QUIZ_ROOT, slug, `${locale}.json`);
    await fs.writeFile(output, `${JSON.stringify(localized, null, 2)}\n`);
  }
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

const slugs = (await fs.readdir(QUIZ_ROOT, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const quizDocuments = [];
for (const slug of slugs) {
  const file = path.join(QUIZ_ROOT, slug, "en.json");
  quizDocuments.push({ slug, data: await readJson(file) });
}

for (const locale of LOCALES) {
  await buildLocale(locale, quizDocuments);
}
if (cacheDirty) await fs.writeFile(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`);
console.log(`Localized ${quizDocuments.length} quizzes into ${LOCALES.length} locales.`);
