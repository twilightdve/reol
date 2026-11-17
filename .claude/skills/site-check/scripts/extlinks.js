// 外へのリンクが生きているか。読みもの(config.linkCheckPrefix)から張っているものだけ確かめる。
// node extlinks.js        (先に content.js を動かしておく)
// ・SNS と Spotify は機械からの確かめを拒むので外す(config.linkSkipHosts)
// ・401 / 403 / 429 は「機械を断っている」だけで、切れているとは言えない → 未確認として分ける
// ・相手のサーバーに負担をかけないよう、同時に 4 本まで、1 つの URL に 1 回だけ
const { config, readJson, writeJson, writeSummary, count } = require("./lib");

const pages = readJson("content.json");
const src = {};
for (const p of pages.filter((p) => p.inSitemap && p.path.startsWith(config.linkCheckPrefix))) for (const u of p.external) (src[u] = src[u] || []).push(p.path);
const skip = (u) => { try { return config.linkSkipHosts.includes(new URL(u).hostname.replace(/^www\./, "")); } catch (e) { return true; } };
const urls = Object.keys(src).filter((u) => !skip(u));
const skipped = Object.keys(src).length - urls.length;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";

const check = async (u) => {
  for (const method of ["HEAD", "GET"]) {
    try {
      const r = await fetch(u, { method, redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "user-agent": UA, "accept-language": "ja,en;q=0.8" } });
      if (r.status < 400 || method === "GET") return { u, status: r.status, final: r.url !== u ? r.url : undefined };
    } catch (e) {
      if (method === "GET") return { u, status: 0, err: String(e.cause?.code || e.name || e).slice(0, 60) };
    }
  }
};

(async () => {
  const out = [];
  let i = 0;
  const worker = async () => { while (i < urls.length) { const u = urls[i++]; out.push({ ...(await check(u)), from: src[u].slice(0, 3) }); } };
  await Promise.all([1, 2, 3, 4].map(worker));
  writeJson("extlinks.json", out, true);
  const refused = out.filter((r) => [401, 403, 429].includes(r.status));
  const dead = out.filter((r) => r.status === 404 || r.status === 410);
  const other = out.filter((r) => (r.status === 0 || r.status >= 400) && !refused.includes(r) && !dead.includes(r));
  console.log(`確かめた ${out.length} / 外した(SNS など) ${skipped} / 状態: ${JSON.stringify(count(out, (r) => r.status))}`);
  console.log(`\n切れている(404・410): ${dead.length}`);
  for (const r of dead) console.log(`  ${r.status} ${r.u.slice(0, 140)} ← ${r.from.join(" ")}`);
  console.log(`\n確かめられなかった(機械を断っている 401・403・429): ${refused.length} → 人がブラウザで開いて見る`);
  for (const r of refused) console.log(`  ${r.status} ${r.u.slice(0, 140)} ← ${r.from[0]}`);
  console.log(`\nそのほかの失敗(つながらない・5xx など。時間をおいてもう一度): ${other.length}`);
  for (const r of other) console.log(`  ${r.status} ${r.err || ""} ${r.u.slice(0, 140)} ← ${r.from[0]}`);
  writeSummary("extlinks", { checked: out.length, skipped, ok: out.filter((r) => r.status >= 200 && r.status < 400).length, dead: dead.map((r) => r.u).sort(), refused: refused.length, otherFailed: other.map((r) => `${r.status} ${r.u}`).sort() });
})();
