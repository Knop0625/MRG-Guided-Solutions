import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), "..");
const distDir = path.join(root, "dist");
const port = Number(process.env.PORT || 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

function insideDist(target) {
  const resolved = path.resolve(target);
  return resolved === distDir || resolved.startsWith(distDir + path.sep);
}

function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const cleanPath = decoded === "/" ? "/index.html" : decoded;
  let target = path.join(distDir, cleanPath);
  if (!insideDist(target)) return null;
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    target = path.join(target, "index.html");
  }
  if (!fs.existsSync(target) && !path.extname(target)) {
    target = path.join(target, "index.html");
  }
  if (!insideDist(target) || !fs.existsSync(target)) return null;
  return target;
}

const server = http.createServer((request, response) => {
  const file = resolveFile(request.url || "/");
  if (!file) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  const ext = path.extname(file);
  response.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
  fs.createReadStream(file).pipe(response);
});

server.listen(port, () => {
  console.log(`MRG site running at http://localhost:${port}`);
});
