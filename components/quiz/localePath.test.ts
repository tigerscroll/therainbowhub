import assert from "node:assert/strict";
import test from "node:test";

import { localizeInternalPath, localeLanguageTag } from "../../lib/localePath.ts";

const locales = ["en", "fr", "de", "it", "nl", "es", "pt", "ar", "pl", "sv", "da", "nb", "tr", "cs", "ro", "hu", "fi", "gr", "id", "th", "vi", "ms", "fil", "uk", "bg", "hr", "sr", "sk"] as const;

test("language switching replaces an existing locale prefix", () => {
  assert.equal(localizeInternalPath("it", "/fr/cambridge", locales, "en"), "/it/cambridge");
  assert.equal(localizeInternalPath("fr", "/it/cambridge", locales, "en"), "/fr/cambridge");
  assert.equal(localizeInternalPath("en", "/fr/cambridge", locales, "en"), "/cambridge");
});

test("language switching repairs nested locale prefixes", () => {
  assert.equal(localizeInternalPath("it", "/fr/it/cambridge", locales, "en"), "/it/cambridge");
  assert.equal(localizeInternalPath("en", "/fr/it/cambridge", locales, "en"), "/cambridge");
});

test("language switching preserves routes, query strings and fragments", () => {
  assert.equal(localizeInternalPath("de", "/fr/info/about?from=menu#privacy", locales, "en"), "/de/info/about?from=menu#privacy");
  assert.equal(localizeInternalPath("pt", "/", locales, "en"), "/pt");
  assert.equal(localizeInternalPath("ar", "/fr/cambridge", locales, "en"), "/ar/cambridge");
  assert.equal(localizeInternalPath("pl", "/ar/cambridge", locales, "en"), "/pl/cambridge");
  assert.equal(localizeInternalPath("en", "/it", locales, "en"), "/");
});

test("Greek uses gr URLs while retaining its standard el language tag", () => {
  assert.equal(localizeInternalPath("gr", "/fr/perfectly-timed?from=menu#intro", locales, "en"), "/gr/perfectly-timed?from=menu#intro");
  assert.equal(localizeInternalPath("fr", "/gr/perfectly-timed", locales, "en"), "/fr/perfectly-timed");
  assert.equal(localizeInternalPath("gr", "/el/perfectly-timed", [...locales, "el"], "en"), "/gr/perfectly-timed");
  assert.equal(localeLanguageTag("gr"), "el");
  assert.equal(localeLanguageTag("en"), "en");
  assert.equal(localeLanguageTag("ar"), "ar");
});
