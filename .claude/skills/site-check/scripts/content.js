// 内容と、検索に見つけてもらうための付け方。ビルド済みの HTML(public/)を全部読む。ブラウザは使わない。
// node content.js
// 分かるのは「付いているか・切れていないか・重なっていないか」まで。文章の良し悪しは人が読む。
// 静的な HTML だけを見るので、開いた後に読み込む内容(手紙、診断の仲間 など)は数に入らない。
const path = require("path");
const fs = require("fs");
const { PUBLIC, config, repoRequire, langOf, stripLang, count, sum, median, writeJson, writeSummary } = require("./lib");
const cheerio = repoRequire("cheerio");

const ORIGIN = config.origin;
if (!fs.existsSync(path.join(PUBLIC, "sitemap-0.xml"))) { console.error("public/sitemap-0.xml がありません。ビルドが要ります。"); process.exit(2); }

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) { if (!/^(page-data|static|icons|~partytown)$/.test(e.name)) walk(f); }
    else if (e.name === "index.html" || (d === PUBLIC && /\.html$/.test(e.name))) files.push(f);
  }
};
walk(PUBLIC);
const sitemapAll = [...fs.readFileSync(path.join(PUBLIC, "sitemap-0.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const sitemap = new Set(sitemapAll);
const exists = (p) => {
  let clean; try { clean = decodeURIComponent(p.split("#")[0].split("?")[0]); } catch (e) { return false; }
  try { const st = fs.statSync(path.join(PUBLIC, clean)); return st.isDirectory() ? fs.existsSync(path.join(PUBLIC, clean, "index.html")) : true; } catch (e) { return false; }
};
// 追跡用のパラメータ。動画の開始位置(t)や検索語などは正当なので、行き先で外す
const TRACK = /[?&](utm_[a-z]+|igsh|igshid|fbclid|gclid|si|ref_src|s|t)=/i;
const TRACK_OK = /youtube\.com\/watch|youtu\.be|bilibili\.com\/video|google\.[a-z.]+\/maps|twitter\.com\/intent|x\.com\/intent|\/search\?/;

const pages = [];
for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  const rel = "/" + path.relative(PUBLIC, f).replace(/index\.html$/, "");
  const $ = cheerio.load(html);
  const rec = { path: rel, bytes: Buffer.byteLength(html), inSitemap: sitemap.has(rel) };
  rec.lang = $("html").attr("lang") || null;
  rec.title = $("head title").first().text() || null;
  rec.description = $('meta[name="description"]').attr("content") || null;
  rec.canonical = $('link[rel="canonical"]').attr("href") || null;
  rec.robots = $('meta[name="robots"]').attr("content") || null;
  rec.refresh = $('meta[http-equiv="refresh"]').attr("content") || null;
  rec.hreflang = $('link[rel="alternate"][hreflang]').map((i, el) => ({ lang: $(el).attr("hreflang"), href: $(el).attr("href") })).get();
  rec.ogImage = $('meta[property="og:image"]').attr("content") || null;
  rec.twCard = $('meta[name="twitter:card"]').attr("content") || null;
  rec.jsonld = []; rec.jsonldErrors = 0; rec.article = null;
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const j = JSON.parse($(el).text());
      const flat = (a) => (Array.isArray(a) ? a.flatMap(flat) : a && a["@graph"] ? flat(a["@graph"]) : a ? [a] : []);
      for (const x of flat(j)) {
        const types = [].concat(x["@type"] || []);
        rec.jsonld.push(...types);
        if (types.some((t) => /Article|BlogPosting/.test(t))) rec.article = { author: !!x.author, image: !!x.image, publisher: !!x.publisher, datePublished: !!x.datePublished, dateModified: !!x.dateModified };
      }
    } catch (e) { rec.jsonldErrors++; }
  });
  rec.h1 = $("h1").length;
  rec.hasMain = $("main").length;
  const main = $("main").first().length ? $("main").first() : $("body");
  const clone = main.clone(); clone.find("script,style,noscript,svg,nav").remove();
  const text = clone.text().replace(/\s+/g, " ").trim();
  rec.textLen = text.length;
  rec.kanaRatio = text.length ? Math.round(((text.match(/[぀-ヿ]/g) || []).length / text.length) * 100) : 0;
  const internal = new Set(), external = new Set();
  rec.tracked = []; rec.broken = []; rec.extNoRel = 0; rec.emptyLinks = 0;
  $("a[href]").each((i, el) => {
    const h = $(el).attr("href");
    if (!h || /^(mailto:|tel:|javascript:|#)/.test(h)) return;
    if (!$(el).text().trim() && !$(el).attr("aria-label") && !$(el).find("img[alt],svg[aria-label],[aria-label]").length && !$(el).attr("title")) rec.emptyLinks++;
    let u; try { u = new URL(h, ORIGIN + rel); } catch (e) { return; }
    if (u.origin === ORIGIN) { internal.add(u.pathname); if (!exists(u.pathname) && !rec.broken.includes(u.pathname)) rec.broken.push(u.pathname); }
    else if (/^https?:/.test(u.protocol)) {
      external.add(u.href);
      if (TRACK.test(u.search) && !TRACK_OK.test(u.href)) rec.tracked.push(u.href.slice(0, 140));
      if ($(el).attr("target") === "_blank" && !/noopener|noreferrer/.test($(el).attr("rel") || "")) rec.extNoRel++;
    }
  });
  rec.internalLinks = internal.size; rec.external = [...external];
  rec.imgs = $("img").length; rec.imgNoAlt = $("img:not([alt])").length; rec.imgNoSize = $("img").filter((i, el) => !($(el).attr("width") && $(el).attr("height"))).length;
  rec.ogImageMissing = rec.ogImage && rec.ogImage.startsWith(ORIGIN) ? !exists(new URL(rec.ogImage).pathname) : false;
  pages.push(rec);
}
writeJson("content.json", pages);

// ---- まとめ ----
const sm = pages.filter((p) => p.inSitemap), ns = pages.filter((p) => !p.inSitemap);
const byPath = new Map(pages.map((p) => [p.path, p]));
const kind = (p) => `${langOf(p.path)}:${stripLang(p.path).split("/")[1] || "(top)"}`;
const q = (arr) => (arr.length ? `最小 ${Math.min(...arr)} 中央 ${median(arr)} 最大 ${Math.max(...arr)}` : "—");
const noindex = (p) => /noindex/.test(p.robots || "");
const strip = (u) => (u || "").replace(ORIGIN, "");

console.log(`HTML ${pages.length} ファイル / サイトマップに ${sitemapAll.length} URL(うち HTML のあるもの ${sm.length})/ サイトマップ外 ${ns.length}`);
const smDead = sitemapAll.filter((p) => !exists(p));
console.log(`サイトマップにあるのにファイルが無い: ${smDead.length} ${smDead.slice(0, 12).join(" ")}`);
const smNoindex = sm.filter(noindex).map((p) => p.path), smRefresh = sm.filter((p) => p.refresh).map((p) => p.path);
console.log(`サイトマップにあるのに noindex: ${smNoindex.length} ${smNoindex.slice(0, 8).join(" ")}  転送ページ: ${smRefresh.length} ${smRefresh.slice(0, 8).join(" ")}`);
const nsOpen = ns.filter((p) => !p.refresh && !noindex(p) && p.path !== "/404.html" && p.path !== "/404/");
console.log(`サイトマップ外: 転送 ${ns.filter((p) => p.refresh).length} / noindex ${ns.filter(noindex).length} / どちらでもない ${nsOpen.length} ${nsOpen.slice(0, 12).map((p) => p.path).join(" ")}`);
const canonNone = sm.filter((p) => !p.canonical), canonOther = sm.filter((p) => p.canonical && p.canonical !== ORIGIN + p.path);
console.log(`canonical 無し: ${canonNone.length}  自分を指していない: ${canonOther.length} ${canonOther.slice(0, 6).map((p) => `${p.path}→${strip(p.canonical)}`).join(" ")}`);
const langPairs = count(sm, (p) => `${langOf(p.path)}→${p.lang}`);
console.log("lang の付き方:", JSON.stringify(langPairs));

const T = (p) => (p.title || "").length, D = (p) => (p.description || "").length;
const ja = sm.filter((p) => langOf(p.path) === "ja");
const noTitle = sm.filter((p) => !p.title), noDesc = sm.filter((p) => !p.description);
console.log(`\ntitle 無し: ${noTitle.length}  description 無し: ${noDesc.length} ${noDesc.slice(0, 8).map((p) => p.path).join(" ")}`);
console.log(`日本語ページ ${ja.length}: title の文字数 ${q(ja.map(T))} / description ${q(ja.map(D))}`);
const shortDesc = ja.filter((p) => D(p) && D(p) < 50), longDesc = ja.filter((p) => D(p) > 160), longTitle = ja.filter((p) => T(p) > 60);
console.log(`  description 50 字未満 ${shortDesc.length} / 160 字超 ${longDesc.length} / title 60 字超 ${longTitle.length}`);
if (shortDesc.length) console.log("  短い例:", shortDesc.slice(0, 5).map((p) => `${p.path}(${D(p)})`).join(" "));
const dups = {};
for (const key of ["title", "description"]) {
  const g = {};
  for (const p of sm) { if (!p[key]) continue; const k = langOf(p.path) + "|" + p[key]; (g[k] = g[k] || []).push(p.path); }
  const d = Object.entries(g).filter(([, v]) => v.length > 1).sort((x, y) => y[1].length - x[1].length);
  dups[key] = { groups: d.length, pages: sum(d, ([, v]) => v.length) };
  console.log(`同じ ${key} を持つ組: ${d.length} 組 / ${dups[key].pages} ページ`);
  for (const [k, v] of d.slice(0, 6)) console.log(`   ${v.length}p 「${k.split("|").slice(1).join("|").slice(0, 70)}」 ${v.slice(0, 4).join(" ")}`);
}

// hreflang: 無いもの、行き先が無いもの、相手から返っていないもの
let hlNone = 0, hlNoXdef = 0, hlBroken = 0, hlNonRecip = 0; const hlEx = [];
for (const p of sm) {
  const hl = p.hreflang;
  if (!hl.length) { hlNone++; continue; }
  if (!hl.some((h) => h.lang === "x-default")) hlNoXdef++;
  for (const h of hl) {
    const t = byPath.get(strip(h.href));
    if (!t) { hlBroken++; if (hlEx.length < 6) hlEx.push(`${p.path}→${strip(h.href)}`); continue; }
    if (h.lang !== "x-default" && t.path !== p.path && !t.hreflang.some((x) => strip(x.href) === p.path)) hlNonRecip++;
  }
}
console.log(`\nhreflang 無し: ${hlNone} ${JSON.stringify(Object.fromEntries(Object.entries(count(sm.filter((p) => !p.hreflang.length), kind)).sort((a, b) => b[1] - a[1]).slice(0, 10)))}`);
console.log(`  x-default 無し: ${hlNoXdef} / 行き先が無い: ${hlBroken} ${hlEx.join(" ")} / 相手から返っていない: ${hlNonRecip}`);

const ogNone = sm.filter((p) => !p.ogImage), ogMissing = sm.filter((p) => p.ogImageMissing);
console.log(`\nog:image 無し: ${ogNone.length}  画像ファイルが無い: ${ogMissing.length} ${ogMissing.slice(0, 5).map((p) => p.path).join(" ")}  twitter:card: ${JSON.stringify(count(sm, (p) => p.twCard))}`);
const ldNone = sm.filter((p) => !p.jsonld.length), ldErr = sm.filter((p) => p.jsonldErrors);
console.log(`JSON-LD 無し: ${ldNone.length} ${JSON.stringify(Object.fromEntries(Object.entries(count(ldNone, kind)).sort((a, b) => b[1] - a[1]).slice(0, 10)))}  読めない: ${ldErr.length}`);
console.log("  型:", JSON.stringify(count(sm.flatMap((p) => p.jsonld), (x) => x)));
const arts = sm.filter((p) => p.article);
const artLack = (k) => arts.filter((p) => !p.article[k]).length;
console.log(`  記事の型(Article など)${arts.length} ページ: author 無し ${artLack("author")} / image 無し ${artLack("image")} / publisher 無し ${artLack("publisher")} / datePublished 無し ${artLack("datePublished")} / dateModified 無し ${artLack("dateModified")}`);

const h1Bad = sm.filter((p) => p.h1 !== 1), mainBad = sm.filter((p) => p.hasMain !== 1);
console.log(`\nh1 が 1 つでない: ${h1Bad.length} ${JSON.stringify(Object.fromEntries(Object.entries(count(h1Bad, (p) => `${kind(p)}(${p.h1})`)).sort((a, b) => b[1] - a[1]).slice(0, 12)))}`);
console.log(`main が 1 つでない: ${mainBad.length} ${JSON.stringify(Object.fromEntries(Object.entries(count(mainBad, (p) => `${kind(p)}(${p.hasMain})`)).sort((a, b) => b[1] - a[1]).slice(0, 12)))}`);
const thin = sm.filter((p) => p.textLen < 200);
console.log(`本文 200 字未満(静的な HTML で): ${thin.length} ${JSON.stringify(Object.fromEntries(Object.entries(count(thin, kind)).sort((a, b) => b[1] - a[1]).slice(0, 10)))}`);
console.log("  ※ 短い = 薄い ではない。記録や一覧は短くて当然のものがある。人が読んで決める");

// ほかの言語のページに日本語(かな)が多く残っていないか
const untranslated = {};
for (const l of config.langs) {
  const ps = sm.filter((p) => langOf(p.path) === l);
  const hi = ps.filter((p) => p.kanaRatio >= 20);
  untranslated[l] = { pages: ps.length, kana20: hi.length };
  console.log(`${l}: ${ps.length} ページ / かなが 20% 以上 ${hi.length}${hi.length ? "  例: " + hi.slice(0, 5).map((p) => `${p.path}(${p.kanaRatio}%)`).join(" ") : ""}`);
}

// リンク
const br = {};
for (const p of pages) for (const b of p.broken) (br[b] = br[b] || []).push(p.path);
const brokenFrom = new Set(Object.values(br).flat());
console.log(`\n切れた内部リンク: 行き先 ${Object.keys(br).length} / 張っているページ ${brokenFrom.size}`);
for (const [k, v] of Object.entries(br).sort((x, y) => y[1].length - x[1].length).slice(0, 25)) console.log(`   ${v.length}p ${k}  ← ${v.slice(0, 3).join(" ")}`);
const tr = {};
for (const p of pages) for (const b of p.tracked) (tr[b] = tr[b] || []).push(p.path);
console.log(`追跡パラメータ付きのリンク: ${Object.keys(tr).length}`);
for (const [k, v] of Object.entries(tr).slice(0, 10)) console.log(`   ${v.length}p ${k} ← ${v[0]}`);
const extNoRel = sum(pages, (p) => p.extNoRel), emptyLinks = sum(pages, (p) => p.emptyLinks);
console.log(`target=_blank で rel の無いリンク: ${extNoRel}  名前の無いリンク: ${emptyLinks} ${pages.filter((p) => p.emptyLinks).slice(0, 5).map((p) => p.path).join(" ")}`);
const imgs = sum(sm, (p) => p.imgs), imgNoAlt = sum(sm, (p) => p.imgNoAlt), imgNoSize = sum(sm, (p) => p.imgNoSize);
console.log(`画像: ${imgs} / alt 属性無し ${imgNoAlt} / 寸法無し ${imgNoSize}`);
console.log(`HTML の大きさ(KB): ${q(sm.map((p) => Math.round(p.bytes / 1024)))}  大きい順: ${[...sm].sort((x, y) => y.bytes - x.bytes).slice(0, 6).map((p) => `${p.path}(${Math.round(p.bytes / 1024)})`).join(" ")}`);
const urls = new Set(sm.flatMap((p) => p.external));
const dom = {};
for (const u of urls) { try { const h = new URL(u).hostname; dom[h] = (dom[h] || 0) + 1; } catch (e) {} }
console.log(`外部リンク(重なりを除く): ${urls.size}  行き先の多い順: ${Object.entries(dom).sort((x, y) => y[1] - x[1]).slice(0, 12).map(([k, v]) => `${k}:${v}`).join(" ")}`);

writeSummary("content", {
  htmlFiles: pages.length, sitemapUrls: sitemapAll.length, outsideSitemap: ns.length,
  sitemapDead: smDead, sitemapNoindex: smNoindex, sitemapRefresh: smRefresh, outsideSitemapOpen: nsOpen.map((p) => p.path).slice(0, 40),
  canonicalMissing: canonNone.length, canonicalOther: canonOther.length,
  langPairs,
  titleMissing: noTitle.length, descriptionMissing: noDesc.length, descriptionShortJa: shortDesc.length, descriptionLongJa: longDesc.length, titleLongJa: longTitle.length,
  duplicateTitle: dups.title, duplicateDescription: dups.description,
  hreflang: { none: hlNone, noXDefault: hlNoXdef, broken: hlBroken, nonReciprocal: hlNonRecip },
  ogImageNone: ogNone.length, ogImageFileMissing: ogMissing.map((p) => p.path).slice(0, 40),
  jsonLdNone: ldNone.length, jsonLdErrors: ldErr.length,
  article: { pages: arts.length, noAuthor: artLack("author"), noImage: artLack("image"), noPublisher: artLack("publisher"), noDatePublished: artLack("datePublished"), noDateModified: artLack("dateModified") },
  h1Not1: h1Bad.length, mainNot1: mainBad.length, thinUnder200: thin.length,
  untranslated,
  brokenInternal: { targets: Object.keys(br).sort(), fromPages: brokenFrom.size },
  trackedLinks: Object.keys(tr).length, blankNoRel: extNoRel, emptyLinks,
  images: { total: imgs, noAlt: imgNoAlt, noSize: imgNoSize },
  externalLinks: urls.size,
});
