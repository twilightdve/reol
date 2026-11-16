// 測る前の確かめ。何を測ることになるか(本番の版・ローカルのビルドの版)と、動かしてよい状態かを出す。
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { SKILL, REPO, PUBLIC, runDir, config } = require("./lib");

const sh = (cmd) => { try { return execSync(cmd, { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch (e) { return ""; } };

const head = sh("git rev-parse HEAD");
const branch = sh("git branch --show-current");
const deployedFile = path.join(REPO, ".deploy-local/deployed-commit");
const deployed = fs.existsSync(deployedFile) ? fs.readFileSync(deployedFile, "utf8").trim() : null;
console.log(`ブランチ ${branch}  HEAD ${head.slice(0, 11)}`);
console.log(`本番に出ている版(最後に手で出した版): ${deployed ? deployed.slice(0, 11) : "記録なし"}`);

// ローカルのビルドがいつの物か。それより後にサイトの中身(src など)が変わっていれば古い
const idx = path.join(PUBLIC, "index.html");
if (!fs.existsSync(idx)) console.log("ローカルのビルド: 無い → ビルドが要る");
else {
  const built = fs.statSync(idx).mtime;
  const lastSrc = sh("git log -1 --format=%cI -- src content gatsby-node.ts gatsby-config.ts gatsby-browser.tsx gatsby-ssr.tsx tailwind.config.js static");
  const dirty = sh("git status --porcelain -- src content gatsby-node.ts gatsby-config.ts tailwind.config.js").split("\n").filter(Boolean).length;
  const stale = lastSrc && new Date(lastSrc) > built;
  console.log(`ローカルのビルド: ${built.toISOString()}  サイトの中身の最後のコミット: ${lastSrc}`);
  console.log(stale ? "  → ビルドが古い(その後にコミットがある)。ビルドし直すか、古い版の測定だと報告に書く" : "  → ビルドは最後のコミットより新しい");
  if (dirty) console.log(`  → コミットしていない変更が ${dirty} ファイルある。ビルドに入っているかは分からない`);
  if (deployed) {
    const diff = sh(`git diff --stat ${deployed} HEAD -- src content gatsby-node.ts gatsby-config.ts tailwind.config.js`).split("\n").filter(Boolean).pop() || "";
    console.log(diff ? `  → 本番の版と HEAD でサイトの中身が違う(${diff.trim()})。速さ(本番)とそれ以外(ローカル)は別の版を測ることになる` : "  → 本番の版と HEAD でサイトの中身は同じ");
  }
}

// 重い処理が重ならないか
const procs = sh("pgrep -fl 'gatsby (build|develop|serve)|lighthouse|chrome-headless|site-check/scripts'").split("\n").filter((l) => l && !/status\.js/.test(l));
console.log(procs.length ? `動いている処理:\n  ${procs.join("\n  ")}\n  → 終わるのを待つ。重い処理は 1 つずつ` : "gatsby・Lighthouse など重い処理は動いていない");
const ports = sh(`lsof -nP -iTCP:8000 -iTCP:9000 -iTCP:${config.localPort} -sTCP:LISTEN`).split("\n").slice(1).map((l) => l.split(/\s+/)).map((c) => `${c[0]}(${c[8]})`);
console.log(ports.length ? `使われているポート: ${ports.join(" ")}` : `ポート 8000・9000・${config.localPort} は空いている`);

// 道具
for (const t of ["lighthouse", "axe-core"]) { const pj = path.join(SKILL, "node_modules", t, "package.json"); console.log(`${t}: ${fs.existsSync(pj) ? JSON.parse(fs.readFileSync(pj, "utf8")).version : "入っていない → npm install --prefix .claude/skills/site-check"}`); }
for (const t of ["playwright", "cheerio", "sharp"]) { const pj = path.join(REPO, "node_modules", t, "package.json"); console.log(`${t}: ${fs.existsSync(pj) ? JSON.parse(fs.readFileSync(pj, "utf8")).version : "無い(サイト本体の npm install が要る)"}`); }

const hist = fs.existsSync(path.join(SKILL, "history")) ? fs.readdirSync(path.join(SKILL, "history")).filter((f) => f.endsWith(".json")).sort() : [];
console.log(`前回までの記録: ${hist.length ? hist.join(" ") : "無い(今回が最初)"}`);
console.log(`今回の置き場所: ${path.relative(REPO, runDir)}/`);
