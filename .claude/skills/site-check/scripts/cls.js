// レイアウトのずれ(CLS)が、どの要素で、いつ起きるかを調べる。perf.js で CLS が 0.1 を超えたページの原因を探す時に使う。
// node cls.js --pages /,/live/ [--origin https://…] [--no-throttle] [--strip "content-visibility:auto"]
// ・既定はローカルの配信。Lighthouse に近い条件(幅 412、CPU 4 倍遅く、回線 1.6Mbps)で開く
// ・hadRecentInput=true のずれも出す。Lighthouse はこれも数えるので、外すと合わなくなる
// ・--strip は、HTML からその文字列を抜いて開く。原因の見当を確かめるためのもの(サイトは変えない)
const { repoRequire, localOrigin, args, pagesArg, runDir, slug } = require("./lib");
const path = require("path");
const fs = require("fs");

const origin = typeof args.origin === "string" ? args.origin : localOrigin;
const pages = pagesArg(["/"]);

(async () => {
  const { chromium } = repoRequire("playwright");
  const browser = await chromium.launch();
  const out = [];
  for (const p of pages) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1.75 });
    const page = await ctx.newPage();
    if (typeof args.strip === "string") {
      await page.route("**/*", async (route) => {
        if (route.request().resourceType() !== "document") return route.continue();
        const rs = await route.fetch();
        await route.fulfill({ response: rs, body: (await rs.text()).split(args.strip).join("") });
      });
    }
    await page.addInitScript(() => {
      window.__ls = [];
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          window.__ls.push({ input: e.hadRecentInput, t: Math.round(e.startTime), v: +e.value.toFixed(4), src: (e.sources || []).map((s) => {
            const n = s.node; if (!n || !n.tagName) return "?";
            const r = s.previousRect, c = s.currentRect;
            return `${n.tagName.toLowerCase()}${n.id ? "#" + n.id : ""}.${String(n.className || "").split(" ").slice(0, 3).join(".")} y:${Math.round(r.y)}→${Math.round(c.y)} h:${Math.round(r.height)}→${Math.round(c.height)}`;
          }) });
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    if (!args["no-throttle"]) {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    }
    await page.goto(origin + p, { waitUntil: "networkidle", timeout: 90000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const ls = await page.evaluate(() => window.__ls);
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    const total = ls.reduce((a, e) => a + e.v, 0);
    console.log(`\n${p}  合計 ${total.toFixed(3)}  ページの高さ ${h}${typeof args.strip === "string" ? `  (${args.strip} を抜いて)` : ""}`);
    for (const e of ls) console.log(`  ${e.t}ms ${e.v}${e.input ? " (hadRecentInput)" : ""}  ${e.src.slice(0, 4).join(" | ").slice(0, 330)}`);
    out.push({ path: p, total: +total.toFixed(4), height: h, strip: args.strip || null, shifts: ls });
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(runDir, `cls.${pages.map(slug).join("+").slice(0, 60)}${args.strip ? ".strip" : ""}.json`), JSON.stringify(out, null, 1));
})();
