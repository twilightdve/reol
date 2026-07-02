/**
 * scripts/check-missing-songs.ts
 *
 * MusicBrainz (static/data/relations.json) の Reol 名義トラックと
 * スプレッドシート由来の DISCOGRAPHY (static/data/discography.json) を
 * 突き合わせ、DISCOGRAPHY に載っていない楽曲を洗い出す。
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/check-missing-songs.ts
 */
import * as fs from "fs";
import * as path from "path";

type MbArtist = {
  name: string;
  releases: {
    title: string;
    date: string;
    recordings: { tracks: { title: string }[] }[];
  }[];
};

type DiscEntry = {
  title: string;
  releaseDate?: string;
  songs: { songName: string }[];
};

// build-graph.ts と同じ正規化ロジック。
const normalizeTitle = (s: string): string =>
  s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[「」『』""''`]/g, "")
    .replace(/\s*\(.+?\)\s*/g, " ")
    .replace(/\s*from\s+.+$/i, "")
    .trim();

const root = path.resolve(__dirname, "..");
const relations: MbArtist[] = JSON.parse(
  fs.readFileSync(path.join(root, "static/data/relations.json"), "utf8")
);
const discography: DiscEntry[] = JSON.parse(
  fs.readFileSync(path.join(root, "static/data/discography.json"), "utf8")
);

// --- DISCOGRAPHY 側の楽曲名セット (正規化) ---
const discNames = new Set<string>();
for (const d of discography) {
  for (const s of d.songs ?? []) {
    const n = normalizeTitle(s.songName);
    if (n) discNames.add(n);
  }
}

// --- MusicBrainz の Reol 名義トラックを収集 ---
const reol = relations.find((a) => a.name === "Reol");
if (!reol) {
  console.error("relations.json に Reol エントリが見つかりません");
  process.exit(1);
}

type Found = { title: string; release: string; date: string };
const missing = new Map<string, Found>(); // normalized → 代表情報
for (const rel of reol.releases) {
  for (const rec of rel.recordings ?? []) {
    for (const t of rec.tracks ?? []) {
      if (!t.title) continue;
      const n = normalizeTitle(t.title);
      if (!n) continue;
      if (discNames.has(n)) continue;
      // 既出なら最も古い release date を採用
      const prev = missing.get(n);
      if (!prev || (rel.date && rel.date < prev.date)) {
        missing.set(n, { title: t.title, release: rel.title, date: rel.date });
      }
    }
  }
}

// DISCOGRAPHY の正規化名 + リリースタイトル集合（別バージョン判定用）
const discNameArr = Array.from(discNames);
const discReleaseTitles = new Set(
  discography.map((d) => normalizeTitle(d.title)).filter(Boolean)
);

// 別バージョン/リミックス/編集の判定: 「base -xxx-」「base (xxx)」のような派生
const stripVariant = (n: string): string =>
  n
    .replace(/\s*-[^-]+-\s*$/g, "") // 末尾の -xxx-
    .replace(/\s*remix.*$/i, "")
    .replace(/\s*edit.*$/i, "")
    .replace(/\s*ver\.?.*$/i, "")
    .replace(/\s*edition.*$/i, "")
    .replace(/\s*live\s+at.*$/i, "")
    .trim();

type Cat = "variant" | "release-exists" | "gap";
const classify = (n: string): Cat => {
  const base = stripVariant(n);
  if (base !== n && (discNames.has(base) || discNameArr.some((d) => d.includes(base) && base.length >= 2))) {
    return "variant";
  }
  // ベース名が DISCOGRAPHY のどれかに含まれている（部分一致）
  if (base.length >= 3 && discNameArr.some((d) => d.includes(base) || base.includes(d))) {
    return "variant";
  }
  return "gap";
};

const list = Array.from(missing.entries())
  .map(([n, f]) => ({ n, ...f, cat: classify(n) }))
  .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));

const gaps = list.filter((x) => x.cat === "gap");
const variants = list.filter((x) => x.cat !== "gap");

console.log(`DISCOGRAPHY 楽曲数 (正規化ユニーク): ${discNames.size}`);
console.log(
  `MusicBrainz(Reol名義) でDISCOGRAPHYに無いトラック: ${list.length}\n`
);

console.log(`■ 掲載漏れの可能性が高い (${gaps.length}件)`);
for (const m of gaps) {
  console.log(`- ${m.title}`);
  console.log(`    収録: ${m.release} (${m.date || "日付不明"})`);
}

console.log(`\n■ 別バージョン/リミックス/カバー等の可能性 (${variants.length}件)`);
for (const m of variants) {
  console.log(`- ${m.title}  [収録: ${m.release} / ${m.date || "?"}]`);
}
