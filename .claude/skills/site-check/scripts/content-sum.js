const d = JSON.parse(require("fs").readFileSync(__dirname + "/content.json", "utf8")); const a = Array.isArray(d) ? d : d.pages;
const LANGS = ["en", "ko", "zh-hant", "zh-hans"]; const langOf = (p) => { const k = p.split("/")[1]; return LANGS.includes(k) ? k : "ja"; };
const sm = a.filter((p) => p.inSitemap), ns = a.filter((p) => !p.inSitemap);
console.log("全HTML", a.length, " サイトマップ内", sm.length, " 外", ns.length);
const cnt = (arr, f) => { const o = {}; for (const x of arr) { const k = f(x); o[k] = (o[k] || 0) + 1; } return o; };
console.log("サイトマップ外の内訳(先頭2階層):", JSON.stringify(Object.fromEntries(Object.entries(cnt(ns, (p) => p.path.split("/").slice(1, 3).join("/"))).sort((x, y) => y[1] - x[1]).slice(0, 25))));
console.log("サイトマップ外: refreshあり", ns.filter((p) => p.refresh).length, " noindex", ns.filter((p) => /noindex/.test(p.robots || "")).length, " どちらでもない", ns.filter((p) => !p.refresh && !/noindex/.test(p.robots || "")).length);
console.log("  どちらでもない例:", ns.filter((p) => !p.refresh && !/noindex/.test(p.robots || "")).slice(0, 30).map((p) => p.path).join(" "));
console.log("\nサイトマップ内で noindex:", sm.filter((p) => /noindex/.test(p.robots || "")).map((p) => p.path).join(" ") || "なし");
console.log("サイトマップ内で refresh:", sm.filter((p) => p.refresh).map((p) => p.path + "→" + p.refresh).slice(0, 20).join(" ") || "なし");
console.log("サイトマップ内: canonical無し", sm.filter((p) => !p.canonical).length, " canonicalが自分でない", sm.filter((p) => p.canonical && p.canonical !== "https://reol.twilightea.com" + p.path).length, sm.filter((p) => p.canonical && p.canonical !== "https://reol.twilightea.com" + p.path).slice(0, 8).map((p) => p.path + "→" + p.canonical).join(" "));
console.log("lang 属性:", JSON.stringify(cnt(sm, (p) => langOf(p.path) + "→" + p.lang)));
// title / description
const T = (p) => (p.title || "").length, D = (p) => (p.description || "").length;
console.log("\ntitle無し", sm.filter((p) => !p.title).length, " description無し", sm.filter((p) => !p.description).length, sm.filter((p) => !p.description).slice(0, 10).map((p) => p.path).join(" "));
const q = (arr) => { const s = [...arr].sort((x, y) => x - y); return `最小${s[0]} 中央${s[Math.floor(s.length / 2)]} 最大${s[s.length - 1]}`; };
const ja = sm.filter((p) => langOf(p.path) === "ja");
console.log("ja title 文字数:", q(ja.map(T)), " description:", q(ja.map(D)));
console.log("ja description 50字未満:", ja.filter((p) => D(p) && D(p) < 50).length, " 160字超:", ja.filter((p) => D(p) > 160).length, " title 60字超:", ja.filter((p) => T(p) > 60).length);
console.log("  短い例:", ja.filter((p) => D(p) && D(p) < 50).slice(0, 6).map((p) => `${p.path}「${p.description}」`).join(" / "));
console.log("  長いtitle例:", ja.filter((p) => T(p) > 60).slice(0, 5).map((p) => `${p.path}「${p.title}」`).join(" / "));
for (const key of ["title", "description"]) { const g = {}; for (const p of sm) { const k = langOf(p.path) + "|" + (p[key] || ""); (g[k] = g[k] || []).push(p.path); } const dup = Object.entries(g).filter(([k, v]) => v.length > 1 && k.split("|")[1]); console.log(`同じ${key}を持つ組: ${dup.length}組 / ${dup.reduce((x, [, v]) => x + v.length, 0)}ページ`); for (const [k, v] of dup.sort((x, y) => y[1].length - x[1].length).slice(0, 8)) console.log(`   ${v.length}p 「${k.slice(0, 90)}」 ${v.slice(0, 4).join(" ")}`); }
// hreflang
const byPath = new Map(a.map((p) => [p.path, p]));
let noHl = 0, hlBroken = 0, hlNonRecip = 0, noXdef = 0; const exHl = [];
for (const p of sm) { const hl = p.hreflang || []; if (!hl.length) { noHl++; continue; } if (!hl.some((h) => h.lang === "x-default")) noXdef++; for (const h of hl) { const tp = (h.href || "").replace("https://reol.twilightea.com", ""); const t = byPath.get(tp); if (!t) { hlBroken++; if (exHl.length < 5) exHl.push(p.path + "→" + tp); continue; } if (h.lang !== "x-default" && !(t.hreflang || []).some((x) => (x.href || "").replace("https://reol.twilightea.com", "") === p.path)) hlNonRecip++; } }
console.log("\nhreflang 無し:", noHl, JSON.stringify(cnt(sm.filter((p) => !(p.hreflang || []).length), (p) => langOf(p.path) + ":" + p.path.replace(/^\/(en|ko|zh-hant|zh-hans)/, "").split("/")[1])), " x-default無し:", noXdef, " 行き先が無い:", hlBroken, exHl.join(" "), " 相互でない:", hlNonRecip);
// OGP / JSON-LD
console.log("\nog:image 無し", sm.filter((p) => !p.ogImage).length, " ローカルに無い", sm.filter((p) => p.ogImageLocalMissing).length, sm.filter((p) => p.ogImageLocalMissing).slice(0, 5).map((p) => p.path + " " + p.ogImage).join(" "), " twitter:card", JSON.stringify(cnt(sm, (p) => p.twCard)));
const ogKinds = cnt(sm, (p) => (p.ogImage || "").replace("https://reol.twilightea.com", "").replace(/\?.*$/, "").split("/").slice(0, 2).join("/")); console.log("og:image の種類:", JSON.stringify(ogKinds));
console.log("JSON-LD 無し", sm.filter((p) => !(p.jsonld || []).length).length, " 解析エラー", sm.filter((p) => p.jsonldErrors).length, " 型:", JSON.stringify(cnt(sm.flatMap((p) => p.jsonld || []), (x) => x)));
console.log("  JSON-LD無しの内訳:", JSON.stringify(cnt(sm.filter((p) => !(p.jsonld || []).length), (p) => langOf(p.path) + ":" + p.path.replace(/^\/(en|ko|zh-hant|zh-hans)/, "").split("/")[1])));
// structure
console.log("\nh1≠1:", sm.filter((p) => p.h1 !== 1).length, JSON.stringify(cnt(sm.filter((p) => p.h1 !== 1), (p) => `${p.path.replace(/^\/(en|ko|zh-hant|zh-hans)/, "").split("/")[1]}(${p.h1})`)));
console.log("main≠1:", sm.filter((p) => p.hasMain !== 1).length, JSON.stringify(cnt(sm.filter((p) => p.hasMain !== 1), (p) => `${p.path.replace(/^\/(en|ko|zh-hant|zh-hans)/, "").split("/")[1]}(${p.hasMain})`)));
// thin
const thin = sm.filter((p) => p.textLen < 200); console.log("\n本文200字未満(静的HTML):", thin.length, JSON.stringify(cnt(thin, (p) => langOf(p.path) + ":" + p.path.replace(/^\/(en|ko|zh-hant|zh-hans)/, "").split("/")[1])));
console.log("  例:", thin.slice(0, 12).map((p) => `${p.path}(${p.textLen})`).join(" "));
// translation
for (const l of LANGS) { const ps = sm.filter((p) => langOf(p.path) === l); const hi = ps.filter((p) => p.kanaRatio >= 20); console.log(`${l}: ${ps.length}ページ  かな比率20%以上(日本語のまま?) ${hi.length}  中央かな比率 ${q(ps.map((p) => p.kanaRatio))}`); if (hi.length) console.log("    例:", hi.slice(0, 5).map((p) => `${p.path}(${p.kanaRatio}%)`).join(" ")); }
// links
const br = {}; for (const p of a) for (const b of p.broken || []) (br[b] = br[b] || []).push(p.path);
console.log("\n内部リンク切れ: 行き先", Object.keys(br).length, " 張っているページ", new Set(Object.values(br).flat()).size); for (const [k, v] of Object.entries(br).sort((x, y) => y[1].length - x[1].length).slice(0, 25)) console.log(`   ${v.length}p ${k}  ← ${v.slice(0, 3).join(" ")}`);
const tr = {}; for (const p of a) for (const b of p.tracked || []) (tr[b] = tr[b] || []).push(p.path); console.log("追跡パラメータ付きリンク:", Object.keys(tr).length); for (const [k, v] of Object.entries(tr).slice(0, 10)) console.log(`   ${v.length}p ${k.slice(0, 140)} ← ${v[0]}`);
console.log("target=_blank で rel 無し:", a.reduce((x, p) => x + (p.extNoRel || 0), 0), " 空リンク:", a.reduce((x, p) => x + (p.emptyLinks || 0), 0), a.filter((p) => p.emptyLinks).slice(0, 5).map((p) => p.path).join(" "));
console.log("img: 合計", sm.reduce((x, p) => x + p.imgs, 0), " alt属性無し", sm.reduce((x, p) => x + p.imgNoAlt, 0), " alt空", sm.reduce((x, p) => x + p.imgEmptyAlt, 0), " 寸法無し", sm.reduce((x, p) => x + p.imgNoSize, 0), " lazy無し", sm.reduce((x, p) => x + p.imgNoLazy, 0));
// size
const big = [...sm].sort((x, y) => y.bytes - x.bytes).slice(0, 8); console.log("\nHTMLの大きさ: ", q(sm.map((p) => Math.round(p.bytes / 1024))), "KB  大きい順:", big.map((p) => `${p.path}(${Math.round(p.bytes / 1024)}KB)`).join(" "));
console.log("inline style 最大:", [...sm].sort((x, y) => y.inlineStyleBytes - x.inlineStyleBytes).slice(0, 4).map((p) => `${p.path}(${Math.round(p.inlineStyleBytes / 1024)}KB)`).join(" "), " inline script 最大:", [...sm].sort((x, y) => y.inlineScriptBytes - x.inlineScriptBytes).slice(0, 4).map((p) => `${p.path}(${Math.round(p.inlineScriptBytes / 1024)}KB)`).join(" "));
// external domains
const dom = {}; const urls = new Set(); for (const p of sm) for (const u of p.external || []) { urls.add(u); try { const h = new URL(u).hostname; dom[h] = (dom[h] || 0) + 1; } catch (e) {} }
console.log("\n外部リンク(一意):", urls.size, " ドメイン上位:", Object.entries(dom).sort((x, y) => y[1] - x[1]).slice(0, 14).map(([k, v]) => `${k}:${v}`).join(" "));
require("fs").writeFileSync(__dirname + "/external-urls.json", JSON.stringify([...urls]));
