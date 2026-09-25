import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function read(locale: string) {
  return JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`, "utf8"));
}

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

test("relationship results never describe a sporting match in the ad note", () => {
  const files = fs.readdirSync("data/i18n").filter((file) => file.endsWith(".json"));
  assert.equal(files.length, 8);
  for (const file of files) {
    const note = read(file.slice(0, -5)).results.matchBreakdown.adNote as string;
    assert.doesNotMatch(note, /podział meczu|mérkőzés|otteluerittely|utakmica|rozpis zápas|разбивка на мача|แยกรายละเอียดการแข่งขัน|maç dökümü|розбивка матчів|trận đấu/u, file);
  }
});
