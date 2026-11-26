import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve(process.cwd(), "out");
const port = Number.parseInt(process.argv[2] ?? "3010", 10);
const photoDemo = process.argv.includes("--photo-demo");
const yearsLeftDemo = process.argv.includes("--years-left-demo");
const dentalDemo = process.argv.includes("--dental-demo");
const mobilityDemo = process.argv.includes("--mobility-demo");
const retiredDemo = process.argv.includes("--retired-demo");
const retreatsDemo = process.argv.includes("--retreats-demo");
const beachesDemo = process.argv.includes("--beaches-demo");
const resortsDemo = process.argv.includes("--resorts-demo");
const demoScript = `<script>
  (() => {
    const listeners = new Map();
    const service = { addEventListener: (name, callback) => listeners.set(name, callback) };
    const emit = (name, slot, args) => listeners.get(name)?.({slot, ...args});
    window.gtag = () => {};
    window.fbq = () => {};
    window.googletag = {
      cmd: { push: callback => callback() },
      pubads: () => service,
      enums: { OutOfPageFormat: { REWARDED: "rewarded" } },
      defineOutOfPageSlot: () => ({ addService() {} }),
      display: slot => queueMicrotask(() => emit("rewardedSlotReady", slot, {
        makeRewardedVisible() {
          setTimeout(() => {
            emit("rewardedSlotGranted", slot);
            emit("rewardedSlotClosed", slot);
          }, 400);
          return true;
        },
      })),
    };
  })();
</script>`;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

function safeFile(relativePath) {
  const absolutePath = path.resolve(root, relativePath.replace(/^\/+/, ""));
  return absolutePath === root || absolutePath.startsWith(`${root}${path.sep}`) ? absolutePath : undefined;
}

function resolveRequest(pathname) {
  const cleanPath = decodeURIComponent(pathname);
  const hasExtension = Boolean(path.extname(cleanPath));
  const candidates = cleanPath === "/"
    ? ["index.html"]
    : hasExtension
      ? [cleanPath]
      : [cleanPath, `${cleanPath}.html`, path.join(cleanPath, "index.html")];

  for (const candidate of candidates) {
    const file = safeFile(candidate);
    if (file && fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }

  return undefined;
}

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  const file = resolveRequest(pathname) ?? safeFile("404.html");

  if (!file || !fs.existsSync(file)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const status = resolveRequest(pathname) ? 200 : 404;
  const isQuizPayload = file.startsWith(path.join(root, "quiz-data") + path.sep);
  const mockAds = status === 200 && (
    photoDemo && /^\/perfectly-timed-photos\/?$/.test(pathname) ||
    yearsLeftDemo && /^\/years-left\/?$/.test(pathname) ||
    dentalDemo && /^\/dental\/?$/.test(pathname) ||
    mobilityDemo && /^\/mobility\/?$/.test(pathname) ||
    retiredDemo && /^\/retired\/?$/.test(pathname) ||
    retreatsDemo && /^\/retreats\/?$/.test(pathname) ||
    beachesDemo && /^\/beaches\/?$/.test(pathname) ||
    resortsDemo && /^\/resorts\/?$/.test(pathname)
  );
  response.writeHead(status, {
    "Cache-Control": "no-cache",
    "Content-Type": isQuizPayload
      ? "application/json; charset=utf-8"
      : contentTypes[path.extname(file).toLowerCase()] ?? "application/octet-stream",
    ...(mockAds ? { "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-src 'none'; connect-src 'self'" } : {}),
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  if (mockAds) response.end(fs.readFileSync(file, "utf8").replace("<head>", `<head>${demoScript}`));
  else fs.createReadStream(file).pipe(response);
});

server.listen(port, photoDemo || yearsLeftDemo || dentalDemo || mobilityDemo || retiredDemo || retreatsDemo || beachesDemo || resortsDemo ? "127.0.0.1" : "0.0.0.0", () => {
  console.log(`Static export ready at http://localhost:${port}`);
});
