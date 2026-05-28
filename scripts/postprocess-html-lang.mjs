import fs from "node:fs";
import path from "node:path";

const outDirectory = path.join(process.cwd(), "out");
const localeDirectory = path.join(process.cwd(), "data", "i18n");
const defaultLocale = "en";
const rtlLocales = new Set(["ar"]);

function getSupportedLocales() {
  return new Set(
    fs
      .readdirSync(localeDirectory)
      .filter((fileName) => fileName.endsWith(".json"))
      .map((fileName) => fileName.replace(/\.json$/, "")),
  );
}

function walkHtmlFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkHtmlFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files;
}

function getLocaleForFile(filePath, supportedLocales) {
  const relativePath = path.relative(outDirectory, filePath);
  const firstSegment = relativePath.split(path.sep)[0];

  return supportedLocales.has(firstSegment) ? firstSegment : defaultLocale;
}

function rewriteHtmlTag(html, locale) {
  const direction = rtlLocales.has(locale) ? "rtl" : "ltr";

  return html.replace(/<html\b([^>]*)>/i, (tag) => {
    const withoutLang = tag
      .replace(/\s+lang=(["']).*?\1/i, "")
      .replace(/\s+dir=(["']).*?\1/i, "");

    return withoutLang.replace(/^<html\b/i, `<html lang="${locale}" dir="${direction}"`);
  });
}

if (fs.existsSync(outDirectory)) {
  const supportedLocales = getSupportedLocales();
  let updated = 0;

  for (const filePath of walkHtmlFiles(outDirectory)) {
    const locale = getLocaleForFile(filePath, supportedLocales);
    const html = fs.readFileSync(filePath, "utf8");
    const nextHtml = rewriteHtmlTag(html, locale);

    if (nextHtml !== html) {
      fs.writeFileSync(filePath, nextHtml);
      updated += 1;
    }
  }

  console.log(`Updated html lang/dir in ${updated} exported files.`);
}
