import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve(process.cwd(), "out");
const port = Number.parseInt(process.argv[2] ?? "3010", 10);

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
  const isArticlePayload = file.startsWith(path.join(root, "article-data") + path.sep);
  response.writeHead(status, {
    "Cache-Control": "no-cache",
    "Content-Type": isArticlePayload
      ? "application/json; charset=utf-8"
      : contentTypes[path.extname(file).toLowerCase()] ?? "application/octet-stream",
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  fs.createReadStream(file).pipe(response);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Static export ready at http://localhost:${port}`);
});
