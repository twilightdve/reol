// アクセシビリティ。axe-core と、機械で見られる範囲の独自チェック。
// node a11y.js [--pages /,/live/] [--theme dark|light|both]
// ・axe が見つけられるのは問題の一部(作者の見積もりで 6 割弱)。違反 0 でも合格ではない
// ・incomplete は「機械では決められない」。人が見る
// ・例に残すのはセレクタと理由だけ。セレクタの中の長い数字(投稿の番号など)は伏せる
// ・iframe の中(YouTube・Spotify・地図)は他所のものなので見ない
// ・背景の誤検出を避けるため、測る間だけ html に本当の地色を入れる(lib.js の BG_FIX)。
//   自前の背景を持つページ(config.ownBackgroundPages)には入れないので、そこのコントラストは人が見る
const fs = require("fs");
const { config, repoRequire, toolPath, localOrigin, args, pagesArg, requireLocal, newContext, openPage, hasOwnBackground, hasOwnDesign, langOf, BG_FIX, sum, count, writeJson, writeSummary } = require("./lib");

const pages = pagesArg(config.samplePages);
const themes = args.theme === "dark" || args.theme === "light" ? [args.theme] : ["dark", "light"];
const AXE = fs.readFileSync(toolPath("axe-core", "axe.min.js"), "utf8");

const custom = () => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
  const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(vis).map((h) => Number(h.tagName[1]));
  let skips = 0;
  for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) skips++;
  const inter = [...document.querySelectorAll("a[href],button,input:not([type=hidden]),select,textarea,[role=button],[role=tab],[role=link],summary")].filter(vis);
  // 2.5.8 の例外のうち機械で分かるもの: 文の中のリンクは除く
  const inlineInText = (el) => getComputedStyle(el).display.startsWith("inline") && el.parentElement && [...el.parentElement.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
  const under = (px) => inter.filter((el) => { const r = el.getBoundingClientRect(); return (r.width < px || r.height < px) && !inlineInText(el); });
  // 例に出すのは要素の種類と大きさだけ(中の文字は、ほかの人の名前のことがあるので残さない)
  const desc = (el) => { const r = el.getBoundingClientRect(); return `${el.tagName.toLowerCase()}${el.getAttribute("aria-label") ? `[aria-label=${el.getAttribute("aria-label").slice(0, 20)}]` : ""}.${String(el.className).split(" ").filter(Boolean).slice(0, 2).join(".")} ${Math.round(r.width)}x${Math.round(r.height)}`; };
  const small = under(24);
  const first = inter[0];
  return {
    lang: document.documentElement.lang,
    title: document.title,
    h1: hs.filter((n) => n === 1).length,
    headings: hs.length,
    headingSkips: skips,
    landmarks: { main: document.querySelectorAll("main,[role=main]").length, nav: document.querySelectorAll("nav,[role=navigation]").length, header: document.querySelectorAll("header,[role=banner]").length, footer: document.querySelectorAll("footer,[role=contentinfo]").length },
    skipLink: !!first && /^#/.test(first.getAttribute("href") || ""),
    interactive: inter.length,
    targetLt24: small.length,
    targetLt24Examples: [...new Set(small.map(desc))].slice(0, 6),
    targetLt44: under(44).length,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    imgs: document.images.length,
    imgNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
    imgNoSize: [...document.images].filter((i) => !(i.getAttribute("width") && i.getAttribute("height"))).length,
    iframes: document.querySelectorAll("iframe").length,
    iframeNoTitle: [...document.querySelectorAll("iframe")].filter((f) => !f.title).length,
  };
};

(async () => {
  await requireLocal();
  const { chromium } = repoRequire("playwright");
  const browser = await chromium.launch();
  const out = [];
  for (const theme of themes) {
    for (const vp of config.viewports) {
      const ctx = await newContext(browser, vp, theme);
      for (const p of pages) {
        const rec = { path: p, viewport: vp.name, theme, bgFix: !hasOwnBackground(p) };
        try {
          const { page, status, errors } = await openPage(ctx, localOrigin, p);
          rec.status = status;
          if (rec.bgFix) await page.addStyleTag({ content: BG_FIX });
          await page.addScriptTag({ content: AXE });
          const r = await page.evaluate(async () => window.axe.run(document, {
            iframes: false,
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] },
            resultTypes: ["violations", "incomplete"],
          }));
          const slim = (list) => list.map((v) => ({
            id: v.id, impact: v.impact, tags: v.tags.filter((t) => /^wcag\d{3,}|^best/.test(t)), help: v.help, nodes: v.nodes.length,
            examples: v.nodes.slice(0, 3).map((n) => ({ target: n.target.join(" ").replace(/\d{8,}/g, "…").slice(0, 160), summary: (n.failureSummary || "").replace(/\s+/g, " ").slice(0, 240) })),
          }));
          rec.violations = slim(r.violations);
          rec.incomplete = slim(r.incomplete).map((v) => ({ id: v.id, nodes: v.nodes }));
          rec.custom = await page.evaluate(custom);
          rec.pageErrors = errors;
          await page.close();
        } catch (e) { rec.error = String(e).slice(0, 300); }
        out.push(rec);
        console.log(theme, vp.name, p, rec.status, rec.error ? "ERR " + rec.error : `違反 ${rec.violations.length} 種類`);
      }
      await ctx.close();
    }
  }
  await browser.close();
  writeJson("a11y.json", out, true);

  // ---- まとめ ----
  const summary = { screens: out.length, errors: out.filter((r) => r.error).map((r) => `${r.theme} ${r.viewport}${r.path}`), notOk: [...new Set(out.filter((r) => r.status && r.status !== 200 && r.path !== "/404.html").map((r) => `${r.path} ${r.status}`))], themes: {} };
  for (const theme of themes) {
    const d = out.filter((r) => r.theme === theme && !r.error);
    const rules = {};
    for (const r of d) for (const v of r.violations) {
      const x = (rules[v.id] = rules[v.id] || { impact: v.impact, tags: v.tags.join(","), help: v.help, pages: new Set(), nodes: 0, ex: [] });
      x.pages.add(r.path); x.nodes += v.nodes;
      if (x.ex.length < 3) x.ex.push(`[${r.viewport} ${r.path}] ${v.examples[0].target} :: ${v.examples[0].summary.slice(0, 170)}`);
    }
    console.log(`\n===== ${theme}: ${d.length} 画面 =====`);
    for (const [id, v] of Object.entries(rules).sort((a, b) => b[1].pages.size - a[1].pages.size)) {
      console.log(`\n- ${id} [${v.impact}] ${v.tags} — ${v.pages.size} ページ / ${v.nodes} か所 — ${v.help}`);
      for (const e of v.ex) console.log("    " + e);
      if (v.pages.size <= 8) console.log("    ページ: " + [...v.pages].join(" "));
    }
    const inc = {};
    for (const r of d) for (const v of r.incomplete) inc[v.id] = (inc[v.id] || 0) + v.nodes;
    const clean = d.filter((r) => r.violations.length === 0).length;
    console.log(`\n違反なしの画面: ${clean}/${d.length}`);
    console.log("人の確認が要る(incomplete):", JSON.stringify(inc));
    const contrastPages = [...(rules["color-contrast"]?.pages || [])];
    if (contrastPages.length) console.log(`コントラストの違反のうち、独自デザイン・自前の背景のページ(直すかは判断が要る / 値は人が見る): ${contrastPages.filter((p) => hasOwnDesign(p) || hasOwnBackground(p)).join(" ") || "なし"}`);
    summary.themes[theme] = {
      screens: d.length, clean,
      rules: Object.fromEntries(Object.entries(rules).sort().map(([id, v]) => [id, { impact: v.impact, pages: [...v.pages].sort(), nodes: v.nodes }])),
      incomplete: inc,
    };
  }
  // 独自チェックはテーマで変わらないので、最初のテーマの分で見る
  const c = out.filter((r) => r.theme === themes[0] && !r.error).map((r) => ({ p: r.path, v: r.viewport, ...r.custom }));
  const sp = c.filter((r) => r.v === "sp");
  const langBad = sp.filter((r) => r.lang !== langOf(r.p) && !(langOf(r.p) === "zh-hant" && /^zh-(Hant|TW)/i.test(r.lang)) && !(langOf(r.p) === "zh-hans" && /^zh-(Hans|CN)/i.test(r.lang))).map((r) => `${r.p}(${r.lang})`);
  const checks = {
    langMismatch: langBad,
    h1Not1: sp.filter((r) => r.h1 !== 1).map((r) => `${r.p}(${r.h1})`),
    headingSkips: sp.filter((r) => r.headingSkips > 0).map((r) => `${r.p}(${r.headingSkips})`),
    mainNot1: sp.filter((r) => r.landmarks.main !== 1).map((r) => `${r.p}(${r.landmarks.main})`),
    skipLinkPages: sp.filter((r) => r.skipLink).length,
    overflowX: c.filter((r) => r.overflowX > 0).map((r) => `${r.v}${r.p}(${r.overflowX})`),
    interactiveSp: sum(sp, (r) => r.interactive),
    targetLt24Sp: sum(sp, (r) => r.targetLt24),
    targetLt44Sp: sum(sp, (r) => r.targetLt44),
    imgs: sum(sp, (r) => r.imgs), imgNoAlt: sum(sp, (r) => r.imgNoAlt), imgNoSize: sum(sp, (r) => r.imgNoSize),
    iframes: sum(sp, (r) => r.iframes), iframeNoTitle: sum(sp, (r) => r.iframeNoTitle),
    // エラー文に外の URL(接続先の名前など)が入ることがあるので、まとめには残さない
    pageErrors: [...new Set(out.filter((r) => r.pageErrors && r.pageErrors.length).map((r) => `${r.path}: ${r.pageErrors[0].replace(/https?:\/\/[^\s"')]+/g, "(URL)").slice(0, 120)}`))],
  };
  console.log(`\n-- 独自チェック(スマホ幅 ${sp.length} ページ) --`);
  console.log("lang の付き方:", JSON.stringify(count(sp, (r) => `${langOf(r.p)}→${r.lang}`)), langBad.length ? `合わない: ${langBad.join(" ")}` : "");
  console.log("h1 が 1 つでない:", checks.h1Not1.join(" ") || "なし");
  console.log("見出しの段の飛び:", checks.headingSkips.join(" ") || "なし");
  console.log("main が 1 つでない:", checks.mainNot1.join(" ") || "なし");
  console.log(`スキップリンクのあるページ: ${checks.skipLinkPages}/${sp.length}`);
  console.log("横のはみ出し:", checks.overflowX.join(" ") || "なし");
  console.log(`押す所(スマホ幅): ${checks.interactiveSp}  24px 未満: ${checks.targetLt24Sp}  44px 未満: ${checks.targetLt44Sp}`);
  console.log(sp.filter((r) => r.targetLt24 > 0).sort((a, b) => b.targetLt24 - a.targetLt24).slice(0, 12).map((r) => `  ${r.p}: ${r.targetLt24} 例 ${r.targetLt24Examples.slice(0, 3).join(" / ")}`).join("\n"));
  console.log(`alt の無い画像: ${checks.imgNoAlt}/${checks.imgs}  寸法の無い画像: ${checks.imgNoSize}  title の無い iframe: ${checks.iframeNoTitle}/${checks.iframes}`);
  console.log("ページのエラー:", checks.pageErrors.join("\n  ") || "なし");
  summary.checks = checks;
  summary.contrastByHand = pages.filter(hasOwnBackground);
  writeSummary("a11y", summary);
})();
