// ビルド済みの HTML(public/)を全ページ読み、内容まわりの数を取る。ブラウザは使わない。
// REPO=<repo> node content.js <out.json>
const path = require("path");
const fs = require("fs");
const cheerio = require(path.join(process.env.REPO, "node_modules/cheerio"));
const PUB = path.join(process.env.REPO, "public");
const ORIGIN = "https://reol.twilightea.com";
const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) { if (!/^(page-data|static|icons|~partytown)$/.test(e.name)) walk(f); } else if (e.name === "index.html" || (d === PUB && /\.html$/.test(e.name))) files.push(f); } };
walk(PUB);
const sitemap = new Set([...fs.readFileSync(path.join(PUB, "sitemap-0.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname));
const exists = (p) => { const clean = decodeURIComponent(p.split("#")[0].split("?")[0]); const f = path.join(PUB, clean); try { const st = fs.statSync(f); if (st.isDirectory()) return fs.existsSync(path.join(f, "index.html")); return true; } catch (e) { return false; } };
const TRACK = /[?&](utm_[a-z]+|igsh|igshid|fbclid|gclid|si|ref_src|s|t)=/i;
const out = [];
for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  const rel = "/" + path.relative(PUB, f).replace(/index\.html$/, "");
  const $ = cheerio.load(html);
  const rec = { path: rel, bytes: Buffer.byteLength(html), inSitemap: sitemap.has(rel) };
  rec.lang = $("html").attr("lang") || null;
  rec.title = $("head title").first().text() || null;
  rec.description = $('meta[name="description"]').attr("content") || null;
  rec.canonical = $('link[rel="canonical"]').attr("href") || null;
  rec.robots = $('meta[name="robots"]').attr("content") || null;
  rec.refresh = $('meta[http-equiv="refresh"]').attr("content") || null;
  rec.hreflang = $('link[rel="alternate"][hreflang]').map((i, el) => $(el).attr("hreflang") + "=" + $(el).attr("href")).get();
  rec.ogImage = $('meta[property="og:image"]').attr("content") || null;
  rec.ogTitle = $('meta[property="og:title"]').attr("content") || null;
  rec.ogType = $('meta[property="og:type"]').attr("content") || null;
  rec.twCard = $('meta[name="twitter:card"]').attr("content") || null;
  rec.jsonld = []; rec.jsonldErrors = 0;
  $('script[type="application/ld+json"]').each((i, el) => { try { const j = JSON.parse($(el).text()); const types = (a) => (Array.isArray(a) ? a.flatMap(types) : a && a["@graph"] ? types(a["@graph"]) : a && a["@type"] ? [].concat(a["@type"]) : []); rec.jsonld.push(...types(j)); const d = Array.isArray(j) ? j : [j]; for (const x of d) { if (x && x.dateModified) rec.dateModified = x.dateModified; if (x && x.datePublished) rec.datePublished = x.datePublished; if (x && x.author) rec.hasAuthor = true; } } catch (e) { rec.jsonldErrors++; } });
  rec.inlineStyleBytes = $("style").map((i, el) => Buffer.byteLength($(el).text())).get().reduce((a, b) => a + b, 0);
  rec.inlineScriptBytes = $("script:not([src])").map((i, el) => Buffer.byteLength($(el).text())).get().reduce((a, b) => a + b, 0);
  rec.h1 = $("h1").length; rec.h1Text = $("h1").first().text().trim().slice(0, 60);
  rec.h2 = $("h2").length;
  const main = $("main").first().length ? $("main").first() : $("body");
  rec.hasMain = $("main").length;
  const clone = main.clone(); clone.find("script,style,noscript,svg,nav").remove();
  const text = clone.text().replace(/\s+/g, " ").trim();
  rec.textLen = text.length;
  rec.cjkRatio = text.length ? Math.round((text.match(/[぀-ヿ一-鿿]/g) || []).length / text.length * 100) : 0;
  rec.kanaRatio = text.length ? Math.round((text.match(/[぀-ヿ]/g) || []).length / text.length * 100) : 0;
  const internal = new Set(), external = new Set(); rec.tracked = []; rec.broken = []; rec.extNoRel = 0; rec.emptyLinks = 0;
  $("a[href]").each((i, el) => {
    const h = $(el).attr("href");
    if (!h || /^(mailto:|tel:|javascript:|#)/.test(h)) return;
    if (!$(el).text().trim() && !$(el).attr("aria-label") && !$(el).find("img[alt],svg[aria-label],[aria-label]").length && !$(el).attr("title")) rec.emptyLinks++;
    let u; try { u = new URL(h, ORIGIN + rel); } catch (e) { return; }
    if (u.origin === ORIGIN) { internal.add(u.pathname); if (!exists(u.pathname) && !rec.broken.includes(u.pathname)) rec.broken.push(u.pathname); }
    else if (/^https?:/.test(u.protocol)) { external.add(u.href); if (TRACK.test(u.search) && !/youtube\.com\/watch|youtu\.be|google\.[a-z.]+\/maps|twitter\.com\/intent|x\.com\/intent|\/search\?/.test(u.href)) rec.tracked.push(u.href.slice(0, 120)); if ($(el).attr("target") === "_blank" && !/noopener|noreferrer/.test($(el).attr("rel") || "")) rec.extNoRel++; }
  });
  rec.internalLinks = internal.size; rec.externalLinks = external.size; rec.external = [...external];
  rec.imgs = $("img").length; rec.imgNoAlt = $("img:not([alt])").length; rec.imgEmptyAlt = $('img[alt=""]').length; rec.imgNoSize = $("img").filter((i, el) => !($(el).attr("width") && $(el).attr("height"))).length; rec.imgNoLazy = $("img").filter((i, el) => $(el).attr("loading") !== "lazy").length;
  rec.iframes = $("iframe").length;
  rec.ogImageLocalMissing = rec.ogImage && rec.ogImage.startsWith(ORIGIN) ? !exists(new URL(rec.ogImage).pathname) : null;
  out.push(rec);
}
fs.writeFileSync(process.argv[2], JSON.stringify(out));
console.log("pages", out.length);
