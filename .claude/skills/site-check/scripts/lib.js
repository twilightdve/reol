// site-check の共通の道具。置き場所・設定・出力先をここで決める。
const path = require("path");
const fs = require("fs");

const SKILL = path.join(__dirname, "..");
const REPO = process.env.REPO || path.resolve(SKILL, "../../..");
const PUBLIC = path.join(REPO, "public");
const config = JSON.parse(fs.readFileSync(path.join(SKILL, "config.json"), "utf8"));

const pad = (n) => String(n).padStart(2, "0");
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
// 1 回の測定の置き場所。日付ごと。SITE_CHECK_RUN で名前を変えられる
const RUN = process.env.SITE_CHECK_RUN || today();
const runDir = path.join(REPO, ".site-check", RUN);
fs.mkdirSync(runDir, { recursive: true });

// サイト本体に入っているもの(playwright・cheerio・sharp)
const repoRequire = (name) => require(path.join(REPO, "node_modules", name));
// このスキルに入れたもの(lighthouse・axe-core)
const toolPath = (...p) => {
  const f = path.join(SKILL, "node_modules", ...p);
  if (!fs.existsSync(f)) { console.error(`道具が入っていません: ${f}\n先に npm install --prefix .claude/skills/site-check を実行してください。`); process.exit(2); }
  return f;
};

const localOrigin = process.env.SITE_CHECK_ORIGIN || `http://localhost:${config.localPort}`;
const slug = (p) => p.replace(/^\/|\/$/g, "").replace(/[^a-z0-9.-]+/gi, "_") || "home";
const langOf = (p) => { const k = p.split("/")[1]; return config.langs.includes(k) ? k : "ja"; };
const stripLang = (p) => p.replace(new RegExp(`^/(${config.langs.join("|")})(?=/)`), "");
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const count = (arr, f) => { const o = {}; for (const x of arr) { const k = f(x); o[k] = (o[k] || 0) + 1; } return o; };
const sum = (arr, f) => arr.reduce((a, x) => a + (f(x) || 0), 0);
const top = (o, n = 12) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);

const writeJson = (name, data, pretty) => { const f = path.join(runDir, name); fs.writeFileSync(f, pretty ? JSON.stringify(data, null, 1) : JSON.stringify(data)); return f; };
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(runDir, name), "utf8"));
// 領域ごとの短いまとめ。report.js が集めて前回と比べる
const writeSummary = (area, data) => writeJson(`summary.${area}.json`, { measuredAt: new Date().toISOString(), ...data }, true);

// --name value / --flag の形の引数
const args = (() => { const o = { _: [] }; const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) { if (a[i].startsWith("--")) { const k = a[i].slice(2); if (a[i + 1] === undefined || a[i + 1].startsWith("--")) o[k] = true; else o[k] = a[++i]; } else o._.push(a[i]); } return o; })();
const pagesArg = (fallback) => (typeof args.pages === "string" ? args.pages.split(",") : fallback);

// ローカルの配信が動いているか。動いていなければ止める
const requireLocal = async () => {
  try { const r = await fetch(localOrigin + "/", { signal: AbortSignal.timeout(5000) }); if (r.ok) return; } catch (e) {}
  console.error(`${localOrigin} が応えません。先に node .claude/skills/site-check/scripts/serve.js を動かしてください。`);
  process.exit(2);
};

module.exports = { SKILL, REPO, PUBLIC, RUN, runDir, config, repoRequire, toolPath, localOrigin, slug, langOf, stripLang, median, count, sum, top, writeJson, readJson, writeSummary, args, pagesArg, requireLocal, today };

// ---- ブラウザ(Playwright)まわり ----
const isPrivate = (p) => config.privatePages.includes(stripLang(p));
const hasOwnBackground = (p) => config.ownBackgroundPages.includes(stripLang(p));
// 記事ごとに独自のデザインを持つ楽曲記事(デザインの置き場所にあるフォルダ名 = 記事の id → slug)
const ownDesignSlugs = (() => {
  const dir = path.join(REPO, config.ownDesignDir); const out = new Set();
  if (!fs.existsSync(dir)) return out;
  for (const id of fs.readdirSync(dir)) { const f = path.join(REPO, "content/articles", id, "article.json"); if (fs.existsSync(f)) { try { out.add(JSON.parse(fs.readFileSync(f, "utf8")).slug); } catch (e) {} } }
  return out;
})();
// サイト共通の決まりで裁かないページ(独自デザインの記事と、設定で外したページ)
const hasOwnDesign = (p) => { const q = stripLang(p); const m = q.match(/^\/articles\/([^/]+)\/$/); return config.ownDesignPages.includes(q) || (!!m && ownDesignSlugs.has(m[1])); };
// テーマを決めたコンテキスト。テーマは localStorage の reol-theme で切り替わる
const newContext = async (browser, vp, theme = "dark") => {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch, locale: "ja-JP" });
  await ctx.addInitScript((t) => { try { localStorage.setItem("reol-theme", t); } catch (e) {} }, theme);
  return ctx;
};
// ページを開いて落ち着くまで待つ。ほかの人のアカウント名が出るページでは、その読み込みを止める(出力に残さないため)
const openPage = async (ctx, origin, p) => {
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  if (isPrivate(p)) await page.route((u) => u.pathname.includes(config.privateRequestPattern), (r) => r.abort());
  const res = await page.goto(origin + p, { waitUntil: "load", timeout: 45000 });
  await page.waitForTimeout(config.settleMs);
  return { page, status: res ? res.status() : null, errors };
};
// html と body が透明で、色は奥の固定レイヤーが出している。axe はそれを白地と読むので、測る間だけ本当の地色を html に入れる
const BG_FIX = "html{background-color:rgb(var(--bx-bg))!important}";

Object.assign(module.exports, { isPrivate, hasOwnBackground, hasOwnDesign, ownDesignSlugs, newContext, openPage, BG_FIX });
