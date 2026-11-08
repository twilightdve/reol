/**
 * 誕生日企画の「この一年」の年表(plan/64)に並べる作品と MV を作る → src/utils/letters/year-releases.json
 * 作品: サイトの作品データ(static/data/discography.json)のうち、発売日が 2025-11-09〜2026-11-08 のもの(歌ってみたは除く)。
 *   当時のポストは、その作品にひも付いたポストのうち、同じ期間に投稿されたもの(ID の Snowflake から日時を求める)。
 *   公式サイトで発売日が違うと分かった作品は EXCLUDE で外す。
 * MV: 期間内に公開された Reol の MV。公開日はサイトのデータに無いため、YouTube の公開日(2026-11-08 に確かめた)を下の MVS に書く。
 *   作品の音源だけの動画(Topic)やタイアップ先の動画は MV に入れない。
 *
 * 実行: npx ts-node --compiler-options '{"module":"commonjs","target":"es2020"}' scripts/build-letters-year-releases.ts
 */
import * as fs from "fs";
import * as path from "path";

const FROM = "2025-11-09";
const TO = "2026-11-08";
/** 公式サイトの発売日が期間の外(サイトのデータの日付は収録作品の日付): オオエドランヴ 十年物 Edition は 2025-06-18 */
const EXCLUDE = new Set(["オオエドランヴ feat. nqrse -十年物 Edition-"]);
/** 公式サイトの作品ページが無い作品の参照先 */
const LINKS: Record<string, string> = { "天井の街 - CEILING YOU": "https://reol.jp/news/detail/585" };
const MVS = [
  { videoId: "SUX1bRWZ7W4", song: "おとめの肖像 (Portrait of Her)", date: "2025-12-12" },
  { videoId: "YibWxud5fRs", song: "DEAD CENTER feat. LiSA", date: "2026-01-21" },
  { videoId: "Vds8Iz6ZEUc", song: "COCOON", date: "2026-07-11" },
];
const FORMAT: Record<string, string> = { fullAL: "フルアルバム", miniAL: "ミニアルバム", SG: "シングル", 配信SG: "配信シングル", EP: "EP", "DVD/BD": "映像作品", 歌唱: "歌唱曲" };

const root = path.join(__dirname, "..");
const disc: any[] = JSON.parse(fs.readFileSync(path.join(root, "static/data/discography.json"), "utf8"));
const pad = (n: number) => String(n).padStart(2, "0");
const jst = (id: string) => new Date(Number((BigInt(id) >> 22n) + 1288834974657n) + 9 * 3600_000);
const isoJst = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}+09:00`;

const releases = disc
  .filter((d) => {
    const date = (d.releaseDate ?? "").slice(0, 10);
    return date >= FROM && date <= TO && d.format !== "歌ってみた" && !EXCLUDE.has(d.title.trim());
  })
  .map((d) => {
    const posts = (d.posts ?? [])
      .map((p: any) => {
        const id = String(p.discographyPostId ?? "");
        const m = String(p.discographyPostHTML ?? "").match(/(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d+)/);
        if (!/^\d{5,25}$/.test(id) || !m || m[2] !== id) return null;
        const at = isoJst(jst(id));
        return { id, url: `https://x.com/${m[1]}/status/${id}`, author: `@${m[1]}`, posted_at: at, posted_date: at.slice(0, 10) };
      })
      .filter((p: any) => p && p.posted_date >= FROM && p.posted_date <= TO)
      .sort((a: any, b: any) => a.posted_at.localeCompare(b.posted_at));
    return {
      id: `release-${d.discographyUuid}`,
      date: d.releaseDate.slice(0, 10),
      title: d.title.trim(),
      format: FORMAT[d.format] ?? d.format,
      link: d.siteUrl || LINKS[d.title.trim()] || null,
      posts,
    };
  })
  .sort((a, b) => a.date.localeCompare(b.date));

const out = { releases, mvs: MVS.map((m) => ({ id: `mv-${m.videoId}`, ...m })) };
fs.writeFileSync(path.join(root, "src/utils/letters/year-releases.json"), JSON.stringify(out, null, 2) + "\n");
for (const r of releases) console.log(r.date, r.title, r.format, r.link, `posts ${r.posts.length}`);
for (const m of MVS) console.log(m.date, "MV", m.song);
