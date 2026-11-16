// ダークテーマの color-contrast が誤検知かを確かめる: body の背景と、固定レイヤーの実際の色、トークンの実コントラスト
const { chromium } = require(process.env.REPO + "/node_modules/playwright");
const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
(async () => {
  const b = await chromium.launch();
  for (const theme of ["dark", "light"]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript((t) => { try { localStorage.setItem("reol-theme", t); } catch (e) {} }, theme);
    const p = await ctx.newPage();
    await p.goto("http://localhost:9000/live/toukyou-10/", { waitUntil: "networkidle" });
    const r = await p.evaluate(() => {
      const cs = (el) => getComputedStyle(el);
      const fixed = [...document.querySelectorAll("div")].filter((d) => cs(d).position === "fixed" && /inset-0/.test(d.className)).map((d) => ({ cls: d.className.slice(0, 80), bg: cs(d).backgroundColor, z: cs(d).zIndex }));
      const v = (n) => cs(document.documentElement).getPropertyValue(n).trim();
      const names = ["--bx-bg", "--bx-surface", "--bx-ink", "--bx-ink2", "--bx-ink3", "--bx-line", "--bx-blue", "--bx-blue-deep", "--bx-blue-light", "--bx-yellow"];
      const all = {}; for (const n of [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch (e) { return []; } })) { if (n.style) for (const k of n.style) if (k.startsWith("--bx")) all[k] = 1; }
      return { html: cs(document.documentElement).backgroundColor, body: cs(document.body).backgroundColor, fixed, vars: Object.fromEntries(Object.keys(all).map((n) => [n, v(n)])) };
    });
    console.log(`\n== ${theme} ==`); console.log("html bg:", r.html, " body bg:", r.body); console.log("fixed layers:", JSON.stringify(r.fixed));
    const vars = r.vars; const bg = (vars["--bx-bg"] || "").split(/\s+/).map(Number);
    console.log("vars:", JSON.stringify(vars));
    for (const [k, v] of Object.entries(vars)) { const c = v.split(/\s+/).map(Number); if (c.length === 3 && !c.some(isNaN) && k !== "--bx-bg") console.log(`  ${k} on bg: ${ratio(c, bg).toFixed(2)}`); }
    await ctx.close();
  }
  await b.close();
})();
