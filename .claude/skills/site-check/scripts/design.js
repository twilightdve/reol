// 描いた後の画面から、サイトのデザインの決まり(plan/71・unslop 由来)に関わる数を取る。
// REPO=<repo> node design.js <origin> <sample.json> <out.json> <shotdir>
const path = require("path");
const fs = require("fs");
const { chromium } = require(path.join(process.env.REPO, "node_modules/playwright"));
const [origin, sampleFile, outFile, shotDir] = process.argv.slice(2);
const pages = JSON.parse(fs.readFileSync(sampleFile, "utf8"));
fs.mkdirSync(shotDir, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const out = [];
  for (const vp of [{ name: "sp", width: 390, height: 844 }, { name: "pc", width: 1280, height: 800 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, locale: "ja-JP", deviceScaleFactor: 1 });
    for (const p of pages) {
      const page = await ctx.newPage();
      await page.goto(origin + p, { waitUntil: "load", timeout: 45000 });
      await page.waitForTimeout(2500);
      const slug = p.replace(/^\/|\/$/g, "").replace(/[^a-z0-9.-]+/gi, "_") || "home";
      await page.screenshot({ path: path.join(shotDir, `${slug}.${vp.name}.png`) });
      const m = await page.evaluate(() => {
        const TOK = { "11,11,16": "bg", "242,240,235": "ink", "143,142,150": "ink2", "165,164,172": "ink3", "38,38,46": "line", "107,140,224": "blue", "39,72,155": "blueDeep", "168,192,255": "blueLight", "226,191,87": "yellow", "255,255,255": "white", "0,0,0": "black" };
        const rgbKey = (c) => { const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/); if (!m) return null; return { key: `${Math.round(m[1])},${Math.round(m[2])},${Math.round(m[3])}`, a: m[4] === undefined ? 1 : Number(m[4]) }; };
        const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0"; };
        const root = document.querySelector("#___gatsby") || document.body;
        const all = [...root.querySelectorAll("*")].filter((el) => !el.closest("iframe,svg") && vis(el));
        const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
        const fontSizes = {}, textColors = {}, bgColors = {}, radii = {}, weights = {}, families = {};
        let small = 0; const smallEx = []; let textEls = 0;
        const gradients = [], blurs = [], glows = [], textShadows = [], transAll = [], transLayout = [];
        const spacing = { total: 0, off4: 0, offValues: {} };
        const emoji = [];
        const cards = []; const nestedCards = [];
        const yellowUse = {}, blueUse = {};
        const lineLens = [];
        const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B06}\u{1F000}-\u{1F2FF}]/u;
        const isCard = (el, s) => {
          const r = el.getBoundingClientRect();
          if (r.width < 140 || r.height < 60) return false;
          if (el.closest("a,button,[role=button],label,summary") || /^(A|BUTTON|IFRAME|IMG|VIDEO|INPUT|TEXTAREA|SELECT|TABLE)$/.test(el.tagName)) return false;
          if (el.querySelector(":scope > iframe, :scope > img, :scope > video, :scope > canvas")) return false; // 動画・地図・画像の枠は決まりで認めている
          const bw = parseFloat(s.borderTopWidth) + parseFloat(s.borderBottomWidth) + parseFloat(s.borderLeftWidth) + parseFloat(s.borderRightWidth);
          const fourSides = [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth].every((w) => parseFloat(w) > 0);
          const bg = rgbKey(s.backgroundColor);
          const hasBg = bg && bg.a > 0.02 && !(bg.key === "11,11,16");
          const rad = parseFloat(s.borderTopLeftRadius);
          const pad = parseFloat(s.paddingTop) + parseFloat(s.paddingLeft);
          return rad >= 6 && pad >= 16 && (fourSides || hasBg) && (el.textContent || "").trim().length > 0 && bw >= 0;
        };
        for (const el of all) {
          const s = getComputedStyle(el);
          const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
          if (ownText) {
            textEls++;
            const fs = Math.round(parseFloat(s.fontSize) * 10) / 10;
            inc(fontSizes, fs); inc(weights, s.fontWeight); inc(families, s.fontFamily.split(",")[0].replace(/"/g, "").trim());
            if (fs < 11) { small++; if (smallEx.length < 6) smallEx.push(`${fs}px "${el.textContent.trim().slice(0, 20)}"`); }
            const c = rgbKey(s.color); if (c) { inc(textColors, TOK[c.key] ? TOK[c.key] + (c.a < 1 ? "/" + c.a : "") : "rgb(" + c.key + ")" + (c.a < 1 ? "/" + c.a : "")); if (c.key === "226,191,87") inc(yellowUse, "text:" + (el.closest("a,button,[role=tab]") ? "操作" : "操作でない")); if (/^(107,140,224|168,192,255|39,72,155)$/.test(c.key)) inc(blueUse, "text:" + (el.closest("a,button") ? "操作" : "操作でない")); }
            const t = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("");
            if (EMOJI.test(t) && emoji.length < 12) emoji.push(t.trim().slice(0, 24));
            if (el.tagName === "P" && t.trim().length > 60) { const r = el.getBoundingClientRect(); lineLens.push(Math.round(r.width / parseFloat(s.fontSize))); }
          }
          const b = rgbKey(s.backgroundColor); if (b && b.a > 0) { inc(bgColors, TOK[b.key] ? TOK[b.key] + (b.a < 1 ? "/" + b.a : "") : "rgb(" + b.key + ")" + (b.a < 1 ? "/" + b.a : "")); if (b.key === "226,191,87") inc(yellowUse, "bg:" + (el.closest("a,button,[role=tab]") ? "操作" : "操作でない")); }
          if (/gradient/.test(s.backgroundImage) && gradients.length < 10) gradients.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")} ${s.backgroundImage.slice(0, 80)}`);
          if ((s.backdropFilter && s.backdropFilter !== "none") && blurs.length < 10) blurs.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")} ${s.backdropFilter}`);
          if (s.boxShadow !== "none") { const col = rgbKey(s.boxShadow); const chromatic = col && !(Math.abs(col.key.split(",")[0] - col.key.split(",")[1]) < 12 && Math.abs(col.key.split(",")[1] - col.key.split(",")[2]) < 12); if (chromatic && glows.length < 10) glows.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")} ${s.boxShadow.slice(0, 70)}`); }
          if (s.textShadow !== "none" && textShadows.length < 6) textShadows.push(`${el.tagName.toLowerCase()} ${s.textShadow.slice(0, 50)}`);
          const tp = s.transitionProperty; const td = s.transitionDuration;
          if (td && td.split(",").some((d) => parseFloat(d) > 0)) {
            if (/\ball\b/.test(tp)) { if (transAll.length < 8) transAll.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")}`); transAll.count = (transAll.count || 0) + 1; }
            else if (/width|height|margin|padding|top|left|right|bottom|font|max-/.test(tp)) { if (transLayout.length < 8) transLayout.push(`${el.tagName.toLowerCase()} ${tp.slice(0, 50)}`); }
          }
          const rad = parseFloat(s.borderTopLeftRadius); if (rad > 0) inc(radii, rad >= 999 || s.borderTopLeftRadius.includes("%") ? "full" : rad);
          for (const k of ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "marginTop", "marginBottom", "rowGap", "columnGap"]) {
            const v = parseFloat(s[k]); if (!v || v < 0 || Number.isNaN(v)) continue; spacing.total++;
            if (Math.abs(v % 4) > 0.01 && Math.abs((v % 4) - 4) > 0.01) { spacing.off4++; inc(spacing.offValues, Math.round(v * 10) / 10); }
          }
          if (isCard(el, s)) { cards.push(el); }
        }
        for (const c of cards) if (cards.some((o) => o !== c && o.contains(c))) nestedCards.push(c);
        const top = (o, n = 12) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k}:${v}`).join(" ");
        lineLens.sort((a, b) => a - b);
        return {
          textEls, fontSizeKinds: Object.keys(fontSizes).length, fontSizes: top(fontSizes, 20), small, smallEx,
          weights: top(weights), families: top(families, 6),
          textColorKinds: Object.keys(textColors).length, textColors: top(textColors, 14), bgColors: top(bgColors, 14),
          radii: top(radii), gradients, blurs, glows, textShadows, transAll: { count: transAll.count || 0, ex: [...transAll] }, transLayout,
          spacingTotal: spacing.total, spacingOff4: spacing.off4, spacingOffValues: top(spacing.offValues, 10),
          emoji, cards: cards.length, nestedCards: nestedCards.length,
          cardEx: cards.slice(0, 5).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 4).join(".")} "${el.textContent.trim().slice(0, 20)}"`),
          yellowUse, blueUse,
          lineLenMedian: lineLens.length ? lineLens[Math.floor(lineLens.length / 2)] : null, lineLenMax: lineLens.length ? lineLens[lineLens.length - 1] : null, paragraphs: lineLens.length,
          docHeight: document.documentElement.scrollHeight,
        };
      });
      out.push({ path: p, viewport: vp.name, ...m });
      console.log(vp.name, p, `cards=${m.cards} small=${m.small} grad=${m.gradients.length} emoji=${m.emoji.length}`);
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
})();
