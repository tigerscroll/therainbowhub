import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { chromium } from "playwright-core";
import sharp from "sharp";

const root = process.cwd();
const quizRoot = path.join(root, "data", "quizzes");
const baselinePath = path.join(root, "tests", "visual-regression-baseline.json");
const update = process.argv.includes("--update");
const allViewports = {
  mobile320: { width: 320, height: 760 },
  mobile390: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 1000 },
};
const viewportFilter = process.env.VISUAL_VIEWPORTS?.split(",");
const viewports = Object.fromEntries(Object.entries(allViewports).filter(([name]) => !viewportFilter || viewportFilter.includes(name)));
const slugs = fs.readdirSync(quizRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(quizRoot, entry.name, "quiz.json")))
  .map((entry) => entry.name)
  .filter((slug) => !process.env.VISUAL_SLUGS || process.env.VISUAL_SLUGS.split(",").includes(slug))
  .sort();
const port = Number(process.env.VISUAL_PORT ?? 3197);
const baseUrl = process.env.VISUAL_BASE_URL ?? `http://127.0.0.1:${port}`;
const chromeCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
].filter(Boolean);
const executablePath = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!executablePath) throw new Error("A system Chrome/Chromium executable is required for visual regression.");

function waitForServer(url, attempts = 80) {
  return new Promise((resolve, reject) => {
    let count = 0;
    const poll = async () => {
      try {
        const response = await fetch(url);
        if (response.ok) return resolve();
      } catch { /* The export server is still starting. */ }
      count += 1;
      if (count >= attempts) return reject(new Error(`Timed out waiting for ${url}.`));
      setTimeout(poll, 100);
    };
    void poll();
  });
}

async function perceptualHash(buffer) {
  const { data } = await sharp(buffer).resize(33, 16, { fit: "fill" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  let bits = "";
  for (let row = 0; row < 16; row += 1) {
    for (let column = 0; column < 32; column += 1) {
      bits += data[row * 33 + column] > data[row * 33 + column + 1] ? "1" : "0";
    }
  }
  return Array.from({ length: bits.length / 4 }, (_, index) => Number.parseInt(bits.slice(index * 4, index * 4 + 4), 2).toString(16)).join("");
}

function hamming(left, right) {
  if (left.length !== right.length) return Number.POSITIVE_INFINITY;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    const value = Number.parseInt(left[index], 16) ^ Number.parseInt(right[index], 16);
    difference += value.toString(2).replaceAll("0", "").length;
  }
  return difference;
}

async function stableScreenshot(locator) {
  await locator.page().addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" });
  await locator.page().evaluate(() => document.fonts.ready);
  const box = await locator.boundingBox();
  if (!box || box.width < 1 || box.height < 1) throw new Error("Visual target has no rendered dimensions.");
  const viewport = locator.page().viewportSize();
  const isLongScreen = viewport && box.height > viewport.height;
  const buffer = isLongScreen
    ? await locator.page().screenshot({ animations: "disabled" })
    : await locator.screenshot({ animations: "disabled" });
  return {
    hash: await perceptualHash(buffer),
    width: Math.round(isLongScreen ? viewport.width : box.width),
    height: Math.round(isLongScreen ? viewport.height : box.height),
  };
}

async function assertGeometry(page, slug, state, viewport) {
  const issues = await page.evaluate(({ viewportWidth }) => {
    const output = [];
    if (document.documentElement.scrollWidth > viewportWidth + 1) output.push(`document overflow ${document.documentElement.scrollWidth}/${viewportWidth}`);
    for (const element of document.querySelectorAll(".quiz-engine__continuous-shell,.quiz-engine__landing,.quiz-engine__visual,.quiz-engine__question-image,.quiz-engine__primary")) {
      const node = element;
      const rect = node.getBoundingClientRect();
      if (rect.left < -1 || rect.right > viewportWidth + 1) output.push(`${node.className} leaves viewport (${Math.round(rect.left)}..${Math.round(rect.right)})`);
      if (!node.classList.contains("quiz-engine__landing") && !node.classList.contains("quiz-engine__continuous-shell") && node.scrollWidth > node.clientWidth + 2) {
        output.push(`${node.className} horizontally overflows (${node.scrollWidth}/${node.clientWidth})`);
      }
    }
    return output;
  }, { viewportWidth: viewport.width });
  if (issues.length) throw new Error(`${slug}/${state}/${viewport.width}: ${issues.join("; ")}`);
}

async function clickRewardedAction(page, selector) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const root = page.locator(selector).first();
    if (!await root.count()) return;
    await root.waitFor({ state: "visible" });
    await page.waitForFunction((target) => {
      const element = document.querySelector(target);
      return !element || !element.disabled;
    }, selector);
    if (!await root.count()) return;
    await root.click();
    await page.waitForFunction((target) => {
      const element = document.querySelector(target);
      return !element || !element.disabled;
    }, selector);
  }
  if (await page.locator(selector).count()) throw new Error(`Rewarded action did not advance after four attempts: ${selector}`);
}

async function answerCurrentQuestion(page) {
  const article = page.locator(".quiz-engine__question[data-question-id]");
  await article.waitFor({ state: "visible" });
  const before = await article.getAttribute("data-question-id");
  const study = article.locator(".quiz-engine__study");
  if (await study.count()) {
    const manual = study.locator("button.quiz-engine__primary");
    if (await manual.count()) await manual.click();
    else await study.waitFor({ state: "detached" });
  }
  const memoryButton = article.locator(".quiz-engine__memory button.quiz-engine__primary");
  if (await memoryButton.count()) {
    await memoryButton.click({ force: true });
  } else {
    await page.evaluate(() => Promise.all(Array.from(document.images).map((image) => image.complete ? undefined : image.decode().catch(() => undefined))));
    await article.locator("button.quiz-engine__answer").first().click({ force: true });
  }
  await page.waitForFunction((questionId) => {
    const current = document.querySelector(".quiz-engine__question[data-question-id]")?.getAttribute("data-question-id");
    return current !== questionId || Boolean(document.querySelector(".quiz-engine__checkpoint"));
  }, before);
}

async function captureQuiz(browser, slug, viewportName, viewport) {
  console.log(`Checking ${slug} at ${viewportName}...`);
  const manifest = JSON.parse(fs.readFileSync(path.join(quizRoot, slug, "quiz.json"), "utf8"));
  const expectsVisual = Object.values(manifest.structure.questions).some((question) => {
    const presentation = question.presentation;
    const type = typeof presentation === "string" ? presentation : presentation?.type;
    return Boolean(type && type !== "text");
  });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (["127.0.0.1", "localhost"].includes(url.hostname) || ["data:", "blob:"].includes(url.protocol)) await route.continue();
    else await route.abort();
  });
  await page.addInitScript(() => {
    localStorage.clear();
    const nativeTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler, timeout, ...args) => nativeTimeout(handler, Math.min(Number(timeout ?? 0), 12), ...args));
  });
  await page.goto(`${baseUrl}/${slug}`, { waitUntil: "domcontentloaded" });
  const captures = {};
  const save = async (state, locator) => {
    await assertGeometry(page, slug, state, viewport);
    captures[`${slug}/${viewportName}/${state}`] = await stableScreenshot(locator);
  };
  const landing = page.locator(".quiz-engine__landing");
  try {
    await landing.waitFor({ state: "visible", timeout: 5000 });
  } catch {
    const body = (await page.locator("body").innerText()).slice(0, 500).replaceAll("\n", " ");
    throw new Error(`${slug}/${viewportName}: landing did not render at ${page.url()}. Body: ${body}`);
  }
  await save("landing", landing);
  await clickRewardedAction(page, ".quiz-engine__landing .quiz-engine__primary");
  await page.locator(".quiz-engine__question-shell").waitFor({ state: "visible" });

  let capturedText = false;
  let capturedVisual = false;
  for (let answered = 0; answered < 40; answered += 1) {
    const article = page.locator(".quiz-engine__question[data-question-id]");
    await article.waitFor({ state: "visible" });
    if (await article.locator(".quiz-engine__study").count()) {
      const manual = article.locator(".quiz-engine__study button.quiz-engine__primary");
      if (await manual.count()) await manual.click();
      else await article.locator(".quiz-engine__study").waitFor({ state: "detached" });
    }
    const isVisual = await article.locator(".quiz-engine__visual,.quiz-engine__question-image,.quiz-engine__answers--icons").count() > 0;
    if (isVisual && !capturedVisual) {
      await save("visual-question", page.locator(".quiz-engine__question-shell"));
      capturedVisual = true;
    }
    if (!isVisual && !capturedText) {
      await save("text-question", page.locator(".quiz-engine__question-shell"));
      capturedText = true;
    }
    await answerCurrentQuestion(page);
    if ((answered + 1) % 8 === 0) {
      const checkpoint = page.locator(".quiz-engine__checkpoint");
      await checkpoint.waitFor({ state: "visible" });
      if (answered === 7) await save("checkpoint", checkpoint);
      await clickRewardedAction(page, ".quiz-engine__checkpoint .quiz-engine__primary");
      if (answered < 39) await page.locator(".quiz-engine__question-shell").waitFor({ state: "visible" });
    }
  }
  const results = page.locator(".quiz-engine__results");
  await results.waitFor({ state: "visible" });
  await save("results", results);
  if (!capturedText) throw new Error(`${slug}: expected at least one text presentation.`);
  if (expectsVisual && !capturedVisual) throw new Error(`${slug}: a configured visual presentation was not rendered.`);
  await context.close();
  return captures;
}

let server;
let browser;
try {
  if (!process.env.VISUAL_BASE_URL) {
    server = spawn(process.execPath, ["scripts/serve-export.mjs", String(port)], { cwd: root, stdio: "ignore" });
    await waitForServer(`${baseUrl}/memory`);
  }
  browser = await chromium.launch({ executablePath, headless: true });
  const current = {};
  for (const [viewportName, viewport] of Object.entries(viewports)) {
    for (const slug of slugs) {
      try {
        Object.assign(current, await captureQuiz(browser, slug, viewportName, viewport));
      } catch (error) {
        console.warn(`Retrying ${slug}/${viewportName} after transient browser failure: ${error.message}`);
        Object.assign(current, await captureQuiz(browser, slug, viewportName, viewport));
      }
    }
  }
  if (update || !fs.existsSync(baselinePath)) {
    fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
    fs.writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`);
    console.log(`Updated ${Object.keys(current).length} visual baselines.`);
  } else {
    const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
    const errors = [];
    for (const [key, value] of Object.entries(current)) {
      const expected = baseline[key];
      if (!expected) errors.push(`${key}: missing baseline.`);
      else if (value.width !== expected.width || value.height !== expected.height) errors.push(`${key}: geometry changed ${expected.width}×${expected.height} → ${value.width}×${value.height}.`);
      else {
        const distance = hamming(value.hash, expected.hash);
        if (distance > 18) errors.push(`${key}: visual hash changed by ${distance} bits.`);
      }
    }
    for (const key of Object.keys(baseline)) if (!current[key]) errors.push(`${key}: stale baseline.`);
    if (errors.length) throw new Error(`Visual regression failed:\n- ${errors.join("\n- ")}`);
    console.log(`Visual regression passed for ${Object.keys(current).length} shell states.`);
  }
} finally {
  await browser?.close();
  server?.kill("SIGTERM");
}
