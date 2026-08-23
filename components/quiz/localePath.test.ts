import assert from "node:assert/strict";
import test from "node:test";

import { localizeInternalPath } from "../../lib/localePath.ts";

const locales = ["en", "fr", "de", "it", "nl", "es", "pt"] as const;

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
  assert.equal(localizeInternalPath("en", "/it", locales, "en"), "/");
});
