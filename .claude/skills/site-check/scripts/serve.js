// public/ をそのまま配るだけの小さいサーバー(gatsby serve より軽い)。
// node serve.js [port]   止める時は Ctrl-C か pkill -f "site-check/scripts/serve.js"
const http = require("http");
const fs = require("fs");
const path = require("path");
const { PUBLIC, config } = require("./lib");

const port = Number(process.argv[2] || config.localPort);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".map": "application/json", ".mp3": "audio/mpeg", ".mp4": "video/mp4" };

if (!fs.existsSync(path.join(PUBLIC, "index.html"))) { console.error("public/index.html がありません。ビルドが要ります。"); process.exit(2); }

http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, "http://x").pathname); } catch (e) { res.writeHead(400); return res.end(); }
  let f = path.join(PUBLIC, p);
  if (!f.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  let st = fs.existsSync(f) ? fs.statSync(f) : null;
  // GitHub Pages と同じく、フォルダは末尾のスラッシュへ送ってから index.html を返す
  if (st && st.isDirectory()) {
    if (!p.endsWith("/")) { res.writeHead(301, { location: p + "/" }); return res.end(); }
    f = path.join(f, "index.html"); st = fs.existsSync(f) ? fs.statSync(f) : null;
  }
  if (!st) { const nf = path.join(PUBLIC, "404.html"); res.writeHead(404, { "content-type": TYPES[".html"] }); return fs.existsSync(nf) ? fs.createReadStream(nf).pipe(res) : res.end("404"); }
  res.writeHead(200, { "content-type": TYPES[path.extname(f).toLowerCase()] || "application/octet-stream", "content-length": st.size, "cache-control": "no-store" });
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(f).pipe(res);
}).listen(port, "127.0.0.1", () => console.log(`public/ を http://localhost:${port} で配っています`));
