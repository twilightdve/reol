// 今回の測定のまとめを history/ に残し、前回と比べる。
// node report.js            … 今回の summary.*.json を集めて history/<日付>.json に書き、前回との差を出す
// node report.js --dry      … history/ には書かず、差だけ出す
// history/ はコミットする(次の回が比べる相手になる)。生の出力(.site-check/)はコミットしない。
// 測っていない領域は書かない。比べる相手は、その領域を測った一番新しい回。
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { SKILL, REPO, PUBLIC, RUN, runDir, args } = require("./lib");

const AREAS = ["perf", "a11y", "keyboard", "design", "content", "extlinks"];
const NAMES = { perf: "速さ", a11y: "アクセシビリティ", keyboard: "キーボード操作", design: "見た目", content: "内容", extlinks: "外へのリンク" };
// 領域ごとに、結果に関わる道具
const TOOLS = { perf: ["lighthouse"], a11y: ["axe-core", "playwright"], keyboard: ["playwright"], design: ["playwright"], content: [], extlinks: [] };
const histDir = path.join(SKILL, "history");
fs.mkdirSync(histDir, { recursive: true });
const sh = (cmd) => { try { return execSync(cmd, { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch (e) { return ""; } };
const ver = (dir, name) => { try { return JSON.parse(fs.readFileSync(path.join(dir, "node_modules", name, "package.json"), "utf8")).version; } catch (e) { return null; } };

const areas = {};
for (const a of AREAS) { const f = path.join(runDir, `summary.${a}.json`); if (fs.existsSync(f)) areas[a] = JSON.parse(fs.readFileSync(f, "utf8")); }
if (!Object.keys(areas).length) { console.error(`${path.relative(REPO, runDir)}/ にまとめがありません。先に測定を動かしてください。`); process.exit(1); }

const deployedFile = path.join(REPO, ".deploy-local/deployed-commit");
const idx = path.join(PUBLIC, "index.html");
const current = {
  run: RUN,
  meta: {
    head: sh("git rev-parse --short=11 HEAD"),
    deployed: fs.existsSync(deployedFile) ? fs.readFileSync(deployedFile, "utf8").trim().slice(0, 11) : null,
    builtAt: fs.existsSync(idx) ? fs.statSync(idx).mtime.toISOString() : null,
    tools: { lighthouse: ver(SKILL, "lighthouse"), "axe-core": ver(SKILL, "axe-core"), playwright: ver(REPO, "playwright") },
  },
  areas,
};

// 比べる相手: 領域ごとに、その領域を測った一番新しい回(今回より前)
const prevFiles = fs.readdirSync(histDir).filter((f) => f.endsWith(".json") && f.replace(/\.json$/, "") < RUN).sort().reverse();
const prev = {};
for (const f of prevFiles) { const j = JSON.parse(fs.readFileSync(path.join(histDir, f), "utf8")); for (const a of AREAS) if (j.areas[a] && !prev[a]) prev[a] = { run: j.run, data: j.areas[a], meta: j.meta }; }

// ---- 差 ----
const flat = (o, pre = "", out = {}) => {
  for (const [k, v] of Object.entries(o || {})) {
    if (k === "measuredAt") continue;
    const key = pre ? `${pre}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flat(v, key, out); else out[key] = v;
  }
  return out;
};
const lines = [];
const say = (s = "") => lines.push(s);
say(`# site-check ${RUN}`);
say();
say(`測った版: HEAD ${current.meta.head} / 本番 ${current.meta.deployed ?? "記録なし"} / ビルド ${current.meta.builtAt ?? "無い"}`);
say(`道具: ${Object.entries(current.meta.tools).map(([k, v]) => `${k} ${v ?? "無い"}`).join("、")}`);
say(`今回測った領域: ${Object.keys(areas).map((a) => NAMES[a]).join("、")}`);
const notMeasured = AREAS.filter((a) => !areas[a]);
if (notMeasured.length) say(`今回測っていない領域: ${notMeasured.map((a) => NAMES[a]).join("、")}`);

// 速さは測るたびにぶれるので、項目ごとの増減は並べない。
// スマホ: 今回の中央値が前回の幅(3 回の最小〜最大)の外に出たページと、LCP・CLS・TBT の判定(良・要改善・悪い)が変わったページだけを出す。
// PC: 1 回だけなので、点が 5 以上動いたページを参考として出す。
function perfDiff(P, C) {
  const rows = [];
  for (const p of [...new Set([...Object.keys(P.mobile || {}), ...Object.keys(C.mobile || {})])]) {
    const x = P.mobile?.[p], y = C.mobile?.[p];
    if (!x || !y) { rows.push(`| ${p} | ${x ? x.perf : "(無い)"} | ${y ? y.perf : "(無い)"} | 測ったページが違う |`); continue; }
    const [lo, hi] = x.range || [x.perf, x.perf];
    const notes = [];
    if (y.perf < lo) notes.push(`点が前回の幅(${lo}〜${hi})より下`);
    if (y.perf > hi) notes.push(`点が前回の幅(${lo}〜${hi})より上`);
    for (const k of ["LCP", "CLS", "TBT"]) if (x.grade?.[k] !== y.grade?.[k]) notes.push(`${k} ${x[k]}→${y[k]}(${x.grade?.[k]}→${y.grade?.[k]})`);
    if (notes.length) rows.push(`| ${p} | ${x.perf}(${lo}〜${hi}) | ${y.perf}(${(y.range || []).join("〜")}) | ${notes.join("、")} |`);
  }
  const same = Object.keys(C.mobile || {}).length - rows.length;
  say("※ 速さは測るたびにぶれる。スマホは、点が前回の幅の外に出たページと、判定が変わったページだけを出す。");
  say(`スマホ: 前回の幅の中で、判定も同じだったページ ${same}`);
  if (rows.length) { say(); say("| ページ | 前回(幅) | 今回(幅) | 変わったこと |"); say("|---|---|---|---|"); rows.forEach((r) => say(r)); }
  const pc = Object.keys(C.desktop || {}).filter((p) => P.desktop?.[p] && Math.abs(C.desktop[p].perf - P.desktop[p].perf) >= 5).map((p) => `${p} ${P.desktop[p].perf}→${C.desktop[p].perf}`);
  say(`PC(1 回だけ。参考): 点が 5 以上動いたページ ${pc.join("、") || "なし"}`);
  const t = Object.keys(C.totals || {}).filter((k) => P.totals?.[k] !== C.totals[k]).map((k) => `${k} ${P.totals?.[k]}→${C.totals[k]}`);
  say(`合計: ${t.join("、") || "前回と同じ"}`);
}

for (const a of Object.keys(areas)) {
  say();
  say(`## ${NAMES[a]}`);
  if (!prev[a]) { say("前回の記録が無い。今回が基準になる。"); continue; }
  say(`比べる相手: ${prev[a].run}(HEAD ${prev[a].meta?.head ?? "?"})`);
  const toolChanged = Object.entries(current.meta.tools).filter(([k, v]) => TOOLS[a].includes(k) && prev[a].meta?.tools && prev[a].meta.tools[k] !== v).map(([k, v]) => `${k} ${prev[a].meta.tools[k]}→${v}`);
  if (toolChanged.length) say(`道具の版が違う(${toolChanged.join("、")})。数の変化は道具のせいかもしれない。`);
  if (a === "perf") { perfDiff(prev[a].data, areas[a]); continue; }
  const A = flat(prev[a].data), B = flat(areas[a]);
  const rows = [];
  for (const k of [...new Set([...Object.keys(A), ...Object.keys(B)])].sort()) {
    const x = A[k], y = B[k];
    if (JSON.stringify(x) === JSON.stringify(y)) continue;
    if (Array.isArray(x) || Array.isArray(y)) {
      const xs = new Set((x || []).map(String)), ys = new Set((y || []).map(String));
      const added = [...ys].filter((v) => !xs.has(v)), removed = [...xs].filter((v) => !ys.has(v));
      if (added.length || removed.length) rows.push(`| ${k} | ${xs.size} 件 | ${ys.size} 件 | ${[added.length ? `増えた: ${added.slice(0, 6).join(" ")}${added.length > 6 ? ` ほか ${added.length - 6}` : ""}` : "", removed.length ? `消えた: ${removed.slice(0, 6).join(" ")}${removed.length > 6 ? ` ほか ${removed.length - 6}` : ""}` : ""].filter(Boolean).join(" / ")} |`);
    } else if (typeof x === "number" && typeof y === "number") {
      const d = Math.round((y - x) * 1000) / 1000;
      rows.push(`| ${k} | ${x} | ${y} | ${d > 0 ? "+" : ""}${d} |`);
    } else rows.push(`| ${k} | ${x === undefined ? "(無い)" : JSON.stringify(x)} | ${y === undefined ? "(無い)" : JSON.stringify(y)} | |`);
  }
  if (!rows.length) { say("前回と同じ。"); continue; }
  say();
  say("| 項目 | 前回 | 今回 | 差 |");
  say("|---|---|---|---|");
  for (const r of rows) say(r);
}

const text = lines.join("\n") + "\n";
fs.writeFileSync(path.join(runDir, "diff.md"), text);
console.log(text);
if (args.dry) console.log("(--dry: history/ には書いていない)");
else {
  // 同じ日に一部の領域だけ測り直した時は、その日の記録に重ねる
  const f = path.join(histDir, `${RUN}.json`);
  if (fs.existsSync(f)) { const old = JSON.parse(fs.readFileSync(f, "utf8")); current.areas = { ...old.areas, ...areas }; }
  fs.writeFileSync(f, JSON.stringify(current, null, 1) + "\n");
  console.log(`記録: ${path.relative(REPO, f)}  差: ${path.relative(REPO, path.join(runDir, "diff.md"))}`);
}
