// 読みもの(/articles/)から張っている外部リンクの生死を確かめる。SNS は機械からの確認を拒むので外す
const fs = require("fs"); const a = JSON.parse(fs.readFileSync(__dirname + "/content.json", "utf8"));
const src = {}; for (const p of a.filter((p) => p.inSitemap && /^\/articles\//.test(p.path))) for (const u of p.external || []) (src[u] = src[u] || []).push(p.path);
const skip = /^(https?:\/\/)(www\.)?(x\.com|twitter\.com|instagram\.com|www\.instagram\.com|open\.spotify\.com|t\.co)\//;
const urls = Object.keys(src).filter((u) => !skip.test(u)); const skipped = Object.keys(src).length - urls.length;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0 Safari/537.36";
const check = async (u) => { for (const method of ["HEAD", "GET"]) { try { const c = new AbortController(); const t = setTimeout(() => c.abort(), 20000); const r = await fetch(u, { method, redirect: "follow", signal: c.signal, headers: { "user-agent": UA, "accept-language": "ja,en;q=0.8" } }); clearTimeout(t); if (r.status < 400 || method === "GET") return { u, status: r.status, final: r.url !== u ? r.url : undefined, method }; } catch (e) { if (method === "GET") return { u, status: 0, err: String(e.cause?.code || e.name || e).slice(0, 60) }; } } };
(async () => { const out = []; let i = 0; const worker = async () => { while (i < urls.length) { const u = urls[i++]; out.push({ ...(await check(u)), from: src[u].slice(0, 3) }); } }; await Promise.all([1, 2, 3, 4].map(worker));
  fs.writeFileSync(__dirname + "/extlinks.json", JSON.stringify(out)); const bad = out.filter((r) => r.status === 0 || r.status >= 400);
  const by = {}; for (const r of out) by[r.status] = (by[r.status] || 0) + 1; console.log("確かめた", out.length, "外した(SNS等)", skipped, "状態:", JSON.stringify(by));
  for (const r of bad) console.log(r.status, r.err || "", r.u.slice(0, 120), "←", r.from.join(" ")); })();
