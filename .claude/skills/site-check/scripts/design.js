// 見た目。画面写真を撮り、描いた後の画面からデザインの決まりに関わる数を取る。
// node design.js [--pages /,/live/] [--theme dark]
// 決まり: カードを並べない(枠は動画・地図・画像と押すものだけ)、文字は 11px 以上、余白は 4px 刻み、
//         グラデーション・ぼかし・光・絵文字アイコンを使わない、動かすのは色と透明度と transform だけ、
//         黄 = 選択と主な操作、青 = 決まった意味だけ(plan/71、unslop)
// 独自デザインのページ(楽曲記事など)は数えるが、決まりでは裁かない。合計にも入れない。
const path = require("path");
const fs = require("fs");
const { config, runDir, repoRequire, localOrigin, slug, args, pagesArg, requireLocal, newContext, openPage, hasOwnDesign, isPrivate, sum, writeJson, writeSummary } = require("./lib");

const pages = pagesArg(config.samplePages);
const theme = typeof args.theme === "string" ? args.theme : "dark";
const shotDir = path.join(runDir, "shots");
fs.mkdirSync(shotDir, { recursive: true });

const scan = () => {
  // 色のトークンは、その時のテーマの値を CSS 変数から読む
  const rootStyle = getComputedStyle(document.documentElement);
  const TOK = { "255,255,255": "white", "0,0,0": "black" };
  for (const [v, n] of [["--bx-bg", "bg"], ["--bx-ink", "ink"], ["--bx-ink2", "ink2"], ["--bx-ink3", "ink3"], ["--bx-line", "line"], ["--bx-blue", "blue"], ["--bx-blue-deep", "blueDeep"], ["--bx-blue-light", "blueLight"], ["--bx-yellow", "yellow"]]) {
    const val = rootStyle.getPropertyValue(v).trim().split(/\s+/).join(",");
    if (val) TOK[val] = n;
  }
  const rgbKey = (c) => { const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/); if (!m) return null; return { key: `${Math.round(m[1])},${Math.round(m[2])},${Math.round(m[3])}`, a: m[4] === undefined ? 1 : Number(m[4]) }; };
  const name = (c) => (TOK[c.key] || `rgb(${c.key})`) + (c.a < 1 ? "/" + c.a : "");
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0"; };
  const label = (el) => `${el.tagName.toLowerCase()}.${String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).split(" ").filter(Boolean).slice(0, 3).join(".")}`;
  const root = document.querySelector("#___gatsby") || document.body;
  const all = [...root.querySelectorAll("*")].filter((el) => !el.closest("iframe,svg") && vis(el));
  const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
  const list = () => ({ n: 0, ex: [] });
  const add = (l, text, cap = 8) => { l.n++; if (l.ex.length < cap && !l.ex.includes(text)) l.ex.push(text); };
  const fontSizes = {}, textColors = {}, bgColors = {}, radii = {}, offValues = {};
  const small = list(), gradients = list(), blurs = list(), glows = list(), textShadows = list(), transAll = list(), transLayout = list(), emoji = list(), offToken = list();
  let textEls = 0, spacingTotal = 0, spacingOff4 = 0;
  const yellowUse = {}, blueUse = {};
  const lineLens = [];
  const cards = [];
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B06}\u{1F000}-\u{1F2FF}]/u;
  const BG = rootStyle.getPropertyValue("--bx-bg").trim().split(/\s+/).join(",");
  const YELLOW = rootStyle.getPropertyValue("--bx-yellow").trim().split(/\s+/).join(",");
  const BLUES = ["--bx-blue", "--bx-blue-deep", "--bx-blue-light"].map((v) => rootStyle.getPropertyValue(v).trim().split(/\s+/).join(","));
  const OPERABLE = "a,button,[role=tab],[role=button],label,summary,input,select";
  // 枠つきの箱。動画・地図・画像の枠と、押すものは決まりで認めているので除く
  const isCard = (el, s) => {
    const r = el.getBoundingClientRect();
    if (r.width < 140 || r.height < 60) return false;
    if (el.closest("a,button,[role=button],label,summary") || /^(A|BUTTON|IFRAME|IMG|VIDEO|INPUT|TEXTAREA|SELECT|TABLE)$/.test(el.tagName)) return false;
    if (el.querySelector(":scope > iframe, :scope > img, :scope > video, :scope > canvas")) return false;
    const fourSides = [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth].every((w) => parseFloat(w) > 0);
    const bg = rgbKey(s.backgroundColor);
    const hasBg = bg && bg.a > 0.02 && bg.key !== BG;
    return parseFloat(s.borderTopLeftRadius) >= 6 && parseFloat(s.paddingTop) + parseFloat(s.paddingLeft) >= 16 && (fourSides || hasBg) && (el.textContent || "").trim().length > 0;
  };
  for (const el of all) {
    const s = getComputedStyle(el);
    const ownText = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("");
    if (ownText.trim().length > 0) {
      textEls++;
      const fs = Math.round(parseFloat(s.fontSize) * 10) / 10;
      inc(fontSizes, fs);
      if (fs < 11) add(small, `${fs}px ${label(el)}`, 10);
      const c = rgbKey(s.color);
      if (c) {
        inc(textColors, name(c));
        if (!TOK[c.key]) add(offToken, `rgb(${c.key})`, 12);
        if (c.key === YELLOW) inc(yellowUse, "文字:" + (el.closest(OPERABLE) ? "押すもの" : "押すものでない"));
        if (BLUES.includes(c.key)) inc(blueUse, "文字:" + (el.closest(OPERABLE) ? "押すもの" : "押すものでない"));
      }
      if (EMOJI.test(ownText)) add(emoji, label(el), 8);
      if (el.tagName === "P" && ownText.trim().length > 60) lineLens.push(Math.round(el.getBoundingClientRect().width / parseFloat(s.fontSize)));
    }
    const b = rgbKey(s.backgroundColor);
    if (b && b.a > 0) { inc(bgColors, name(b)); if (b.key === YELLOW) inc(yellowUse, "地:" + (el.closest(OPERABLE) ? "押すもの" : "押すものでない")); }
    if (/gradient/.test(s.backgroundImage)) add(gradients, `${label(el)} ${s.backgroundImage.slice(0, 70)}`);
    if (s.backdropFilter && s.backdropFilter !== "none") add(blurs, `${label(el)} ${s.backdropFilter}`);
    if (s.boxShadow !== "none") { const col = rgbKey(s.boxShadow); const k = col ? col.key.split(",").map(Number) : null; if (k && !(Math.abs(k[0] - k[1]) < 12 && Math.abs(k[1] - k[2]) < 12)) add(glows, `${label(el)} ${s.boxShadow.slice(0, 60)}`); }
    if (s.textShadow !== "none") add(textShadows, `${label(el)} ${s.textShadow.slice(0, 50)}`);
    if (s.transitionDuration && s.transitionDuration.split(",").some((d) => parseFloat(d) > 0)) {
      const tp = s.transitionProperty;
      if (/\ball\b/.test(tp)) add(transAll, label(el));
      else if (/width|height|margin|padding|top|left|right|bottom|font|max-/.test(tp)) add(transLayout, `${label(el)} ${tp.slice(0, 50)}`);
    }
    const rad = parseFloat(s.borderTopLeftRadius);
    if (rad > 0) inc(radii, rad >= 999 || s.borderTopLeftRadius.includes("%") ? "full" : rad);
    for (const k of ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "marginTop", "marginBottom", "rowGap", "columnGap"]) {
      const v = parseFloat(s[k]);
      if (!v || v < 0 || Number.isNaN(v)) continue;
      spacingTotal++;
      if (Math.abs(v % 4) > 0.01 && Math.abs((v % 4) - 4) > 0.01) { spacingOff4++; inc(offValues, Math.round(v * 10) / 10); }
    }
    if (isCard(el, s)) cards.push(el);
  }
  lineLens.sort((a, b) => a - b);
  return {
    textEls, fontSizes, small, textColors, bgColors, offToken, radii, gradients, blurs, glows, textShadows, transAll, transLayout, emoji,
    spacingTotal, spacingOff4, offValues,
    cards: cards.length, nestedCards: cards.filter((c) => cards.some((o) => o !== c && o.contains(c))).length, cardEx: cards.slice(0, 5).map(label),
    yellowUse, blueUse,
    lineLenMedian: lineLens.length ? lineLens[Math.floor(lineLens.length / 2)] : null, lineLenMax: lineLens.length ? lineLens[lineLens.length - 1] : null,
    docHeight: document.documentElement.scrollHeight,
  };
};

(async () => {
  await requireLocal();
  const { chromium } = repoRequire("playwright");
  const browser = await chromium.launch();
  const out = [];
  for (const vp of config.viewports) {
    // 写真は幅をそろえるため、スマホ幅でも倍率 1 で撮る
    const ctx = await newContext(browser, { ...vp, isMobile: false, hasTouch: false }, theme);
    for (const p of pages) {
      const rec = { path: p, viewport: vp.name, theme, own: hasOwnDesign(p), private: isPrivate(p) };
      try {
        const { page, status } = await openPage(ctx, localOrigin, p);
        rec.status = status;
        await page.screenshot({ path: path.join(shotDir, `${slug(p)}.${vp.name}.png`) });
        Object.assign(rec, await page.evaluate(scan));
        await page.close();
      } catch (e) { rec.error = String(e).slice(0, 300); }
      out.push(rec);
      console.log(vp.name, p, rec.error ? "ERR " + rec.error : `箱=${rec.cards} 11px未満=${rec.small.n} グラデ=${rec.gradients.n} 絵文字=${rec.emoji.n}${rec.own ? " (独自デザイン)" : ""}`);
    }
    await ctx.close();
  }
  await browser.close();
  writeJson("design.json", out, true);

  // ---- まとめ ----
  const ok = out.filter((r) => !r.error);
  const merge = (rows, key) => { const o = {}; for (const r of rows) for (const [k, v] of Object.entries(r[key] || {})) o[k] = (o[k] || 0) + v; return o; };
  const topOf = (o, n = 14) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k}:${v}`).join(" ");
  const NUMS = [["small", "11px 未満の文字"], ["cards", "枠つきの箱"], ["nestedCards", "箱の中の箱"], ["emoji", "絵文字"], ["gradients", "グラデーション"], ["blurs", "ぼかし"], ["glows", "色つきの光"], ["textShadows", "文字の影"], ["transAll", "transition: all"], ["transLayout", "配置を動かす transition"], ["offToken", "トークンに無い文字色"]];
  const val = (r, k) => (typeof r[k] === "number" ? r[k] : r[k].n);
  const totals = {};
  for (const vp of config.viewports.map((v) => v.name)) {
    const common = ok.filter((r) => r.viewport === vp && !r.own);
    const own = ok.filter((r) => r.viewport === vp && r.own);
    const t = { pages: common.length, textEls: sum(common, (r) => r.textEls), fontSizeKinds: Object.keys(merge(common, "fontSizes")).length, spacingOff4Pct: Math.round((sum(common, (r) => r.spacingOff4) / Math.max(1, sum(common, (r) => r.spacingTotal))) * 1000) / 10 };
    for (const [k] of NUMS) t[k] = sum(common, (r) => val(r, k));
    totals[vp] = t;
    console.log(`\n== ${vp}: 共通の決まりで見る ${common.length} ページ(独自デザイン ${own.length} ページは別) ==`);
    console.log(`文字のある要素 ${t.textEls} / 文字の大きさ ${t.fontSizeKinds} 種類 / 4px 刻みでない余白 ${t.spacingOff4Pct}%`);
    for (const [k, l] of NUMS) {
      const hit = common.filter((r) => val(r, k) > 0).sort((a, b) => val(b, k) - val(a, k));
      console.log(`${l}: ${t[k]}${hit.length ? `  (${hit.length} ページ: ${hit.slice(0, 6).map((r) => `${r.path} ${val(r, k)}`).join("、")})` : ""}`);
    }
    if (vp === "sp") {
      console.log(`文字の大きさ: ${topOf(merge(common, "fontSizes"), 20)}`);
      console.log(`文字色: ${topOf(merge(common, "textColors"))}`);
      console.log(`地の色: ${topOf(merge(common, "bgColors"))}`);
      console.log(`丸み: ${topOf(merge(common, "radii"))}`);
      console.log(`4px 刻みでない余白の値: ${topOf(merge(common, "offValues"), 16)}`);
      console.log(`黄の使い方: ${JSON.stringify(merge(common, "yellowUse"))}`);
      console.log(`青の使い方: ${JSON.stringify(merge(common, "blueUse"))}`);
      // 例は「何ページに出るか」の多い順。多いものは共通部品(ヘッダー・下部タブ)にある
      const ex = (k) => { const o = {}; for (const r of common) for (const e of r[k].ex) (o[e] = o[e] || new Set()).add(r.path); return Object.entries(o).sort((a, b) => b[1].size - a[1].size).slice(0, 10).map(([e, v]) => `  ${v.size}p ${e.slice(0, 140)}  [${[...v].slice(0, 3).join(" ")}]`).join("\n"); };
      for (const [k, l] of NUMS) if (typeof common[0]?.[k] !== "number" && t[k] > 0) console.log(`\n${l} の例:\n${ex(k)}`);
      const cardEx = {}; for (const r of common) for (const e of r.cardEx) (cardEx[e] = cardEx[e] || new Set()).add(r.path);
      if (Object.keys(cardEx).length) console.log(`\n枠つきの箱 の例:\n${Object.entries(cardEx).sort((a, b) => b[1].size - a[1].size).slice(0, 10).map(([e, v]) => `  ${v.size}p ${e}  [${[...v].slice(0, 3).join(" ")}]`).join("\n")}`);
      if (own.length) console.log(`\n独自デザインのページ(裁かない。数だけ): ${own.map((r) => `${r.path} 11px未満${r.small.n} グラデ${r.gradients.n} 光${r.glows.n}`).join(" / ")}`);
    }
  }
  const sp = ok.filter((r) => r.viewport === "sp");
  writeSummary("design", {
    theme, screens: out.length, errors: out.filter((r) => r.error).map((r) => `${r.viewport}${r.path}`),
    notOk: out.filter((r) => r.status && r.status !== 200 && r.path !== "/404.html").map((r) => `${r.path} ${r.status}`),
    totals,
    yellowUse: merge(sp.filter((r) => !r.own), "yellowUse"), blueUse: merge(sp.filter((r) => !r.own), "blueUse"),
    pages: Object.fromEntries(sp.map((r) => [r.path, { own: r.own, small: r.small.n, cards: r.cards, emoji: r.emoji.n, gradients: r.gradients.n, glows: r.glows.n, blurs: r.blurs.n, offToken: r.offToken.n }])),
    ownDesignPages: sp.filter((r) => r.own).map((r) => r.path),
    privatePages: sp.filter((r) => r.private).map((r) => r.path),
  });
  console.log(`\n画面写真: ${shotDir}/  (並べた 1 枚は node sheet.js で作る)`);
})();
