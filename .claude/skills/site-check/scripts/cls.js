// レイアウトのずれ(CLS)がどの要素で、いつ起きるかを記録する
const { chromium } = require(process.env.REPO + "/node_modules/playwright");
(async () => {
  const b = await chromium.launch(process.env.CHANNEL ? { channel: process.env.CHANNEL } : {});
  for (const path of process.argv.slice(3)) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1.75, ...(process.env.UA ? { userAgent: "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36" } : {}) });
    const p = await ctx.newPage(); if (process.env.STRIP) await p.route("**/*", async (route) => { const rq = route.request(); if (rq.resourceType() !== "document") return route.continue(); const rs = await route.fetch(); const body = (await rs.text()).replace(/content-visibility:auto/g, ""); await route.fulfill({ response: rs, body }); });
    await p.addInitScript(() => { window.__ls = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__ls.push({ inp: e.hadRecentInput, t: Math.round(e.startTime), v: +e.value.toFixed(4), src: (e.sources || []).map((s) => { const n = s.node; if (!n || !n.tagName) return "?"; const r = s.previousRect, c = s.currentRect; return `${n.tagName.toLowerCase()}${n.id ? "#" + n.id : ""}.${String(n.className || "").split(" ").slice(0, 3).join(".")} y:${Math.round(r.y)}→${Math.round(c.y)} h:${Math.round(r.height)}→${Math.round(c.height)}`; }) }); } }).observe({ type: "layout-shift", buffered: true }); });
    const cdp = await ctx.newCDPSession(p); if (process.env.THROTTLE !== "0") await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 }); await cdp.send("Network.enable"); if (process.env.THROTTLE !== "0") await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    await p.goto(process.argv[2] + path, { waitUntil: "networkidle" }); await p.waitForTimeout(2500);
    const ls = await p.evaluate(() => window.__ls); const h = await p.evaluate(() => document.documentElement.scrollHeight);
    console.log(`\n${path}  合計 ${ls.reduce((a, e) => a + e.v, 0).toFixed(3)}  ページ高 ${h}`); for (const e of ls) console.log(`  input=${e.inp} t=${e.t}ms ${e.v}  ${e.src.slice(0, 4).join(" | ").slice(0, 330)}`);
    await ctx.close();
  }
  await b.close();
})();
