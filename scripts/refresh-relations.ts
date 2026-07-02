/**
 * scripts/refresh-relations.ts
 *
 * MusicBrainz から Reol 関連アーティストのリリース情報を取得し直して
 * `master/relations.json` および `static/data/relations.json` を更新する。
 *
 * gatsby build の sourceNodes でも同じ処理が走るが、
 *  - GraphQL クエリエラーで build 全体が落ちると relations もロスト
 *  - 32 アーティスト × 大量並列で socket / DNS が逝く
 * という二重の事故が起きるため、独立スクリプトとして分離。
 *
 * 使い方:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/refresh-relations.ts
 *
 * オプション:
 *   ARTISTS="Reol,Giga"  指定したアーティストだけ再取得（既存キャッシュをマージ）
 *   FROM=10               10 番目のアーティストから再開
 */
import * as fs from "fs/promises";
import * as net from "net";
import * as dns from "dns";
import * as path from "path";
import { MusicBrainzService, Record as MbRecord } from "../src/services/MusicBrainzService";

// Node 20 + macOS の組み合わせで musicbrainz.org へ undici fetch が
// Happy-Eyeballs まわりで ETIMEDOUT になる事象の回避。
// (curl / raw TCP は通るが fetch だけ詰まる)
(net as unknown as { setDefaultAutoSelectFamily: (b: boolean) => void })
  .setDefaultAutoSelectFamily(false);
dns.setDefaultResultOrder("ipv4first");

const RELATIONS_ARTIST_IDS: Record<string, string> = {
  Reol: "aea6ccea-deb0-44bb-886e-d91aa4c358bf",
  Giga: "fc7a99ac-32f0-4e2a-a2eb-03670470003d",
  "L.Petty": "cbd6676a-3dbe-4ada-a3c7-086d880820b0",
  かめりあ: "151bb385-1af0-40b6-9269-bf2ed982311f",
  niki: "2b6c2118-2eaa-42bf-9bab-82a83516bcd0",
  "monaca:factory": "15754432-7e9b-46a5-84c3-201b3ae1eeaa",
  EZFG: "81437e75-e52f-4d7d-bc9b-44da4d6b15b3",
  takamatt: "dd32b71a-83bb-4661-807d-969e55e8f97b",
  梅とら: "3b4c42b2-ee06-4e16-a512-93c834ee11c0",
  nqrse: "d6402d9b-652f-4f93-9e04-1c0d43bfd707",
  ミト: "cd8fcaa2-7217-483b-8b63-4f7e5b0689d7",
  瀬恒啓: "b624cc31-5949-450a-9605-f8272be5b091",
  NARASAKI: "71a707de-a665-4ad5-917b-7735e73c465d",
  ケンモチヒデフミ: "13ab45e0-ec9c-4b81-941c-1f6af00ad881",
  "Masayoshi Iimori": "aa401904-de90-4d24-9bb5-ee61a5a63e2b",
  KOTONOHOUSE: "c4e45a3c-aaa5-4ca8-9311-0e7aa161c9c8",
  "Al Swettenham": "e8e3bf28-64da-4985-95b1-6cddba9b9c20",
  ツミキ: "31ee7f64-3057-4eb5-93a4-7e8e7bc2f4d5",
  MONJOE: "d2ea484b-0c68-4d3a-a052-498e436ffce0",
  "LDN Noise": "9bd7b6a6-d0b6-47f5-a62b-04dade95f5d1",
  板井直樹: "a385aba2-6068-441a-969c-3f7e16608d98",
  "FAKE TYPE.": "e959608b-e13f-42a9-8fa3-4977d44c77f2",
  "Geek Boy": "eafa05df-9294-48f2-87eb-327a9f1744a3",
  HONNWAKA88: "84b354fa-416c-479c-9c3d-86d0e4591097",
  "Ivan Kwong": "220a03ac-c156-432d-a879-b8cf7cd08498",
  ピエール中野: "64229378-b6d2-4523-9216-5b39551dc4c9",
  "Yoshi Warashina": "5bf4c377-f932-492c-8ac4-83e65e6b46c1",
  藤浪潤一郎: "758ed564-be5a-4861-b725-f00825079568",
  八反田亮太: "50881902-fe69-425e-903a-5ec58f2a2bf7",
  北澤聖士: "439c99ae-be7b-43de-a575-0a7c7d694372",
  MAQUMA: "035a0d14-2fc0-48e1-bece-f408c9b4986f",
  "(sic)boy": "c88171c1-d78a-4c19-a603-58192b17151f",
};

const MASTER_PATH = path.resolve(__dirname, "../master/relations.json");
const STATIC_PATH = path.resolve(__dirname, "../static/data/relations.json");

type RelationsEntry = { name: string; releases: MbRecord[] };

const fileExists = async (p: string) => {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
};

const sortReleases = (releases: MbRecord[]): MbRecord[] =>
  [...releases].sort(
    (a, b) =>
      +(a.date ?? "").replaceAll("-", "") - +(b.date ?? "").replaceAll("-", "")
  );

const main = async () => {
  // 並列度を絞った Bottleneck で再構築
  const Bottleneck = (await import("bottleneck")).default;
  const service = new MusicBrainzService();
  service.limiter = new Bottleneck({
    minTime: 1100, // MusicBrainz の公式レート (1 req/sec) を厳守
    maxConcurrent: 1,
  });

  // 既存キャッシュをマージのベースに使う
  let cache: RelationsEntry[] = [];
  if (await fileExists(MASTER_PATH)) {
    cache = JSON.parse((await fs.readFile(MASTER_PATH)).toString());
    console.log(
      `[refresh-relations] loaded existing cache: ${cache.length} artists`
    );
  } else {
    // 直近のバックアップから復元
    const masterDir = path.dirname(MASTER_PATH);
    const files = await fs.readdir(masterDir);
    const bak = files
      .filter((f) => f.startsWith("relations.") && f.endsWith(".bak.json"))
      .sort()
      .at(-1);
    if (bak) {
      cache = JSON.parse(
        (await fs.readFile(path.join(masterDir, bak))).toString()
      );
      console.log(
        `[refresh-relations] restored from ${bak}: ${cache.length} artists`
      );
    }
  }
  const cacheByName = new Map(cache.map((e) => [e.name, e]));

  const filterArtists = process.env.ARTISTS
    ? new Set(process.env.ARTISTS.split(",").map((s) => s.trim()))
    : null;
  const fromIndex = process.env.FROM ? parseInt(process.env.FROM, 10) : 0;

  const entries = Object.entries(RELATIONS_ARTIST_IDS);
  for (let i = fromIndex; i < entries.length; i++) {
    const [name, id] = entries[i];
    if (filterArtists && !filterArtists.has(name)) continue;
    const tStart = Date.now();
    console.log(
      `\n[refresh-relations] (${i + 1}/${entries.length}) fetching: ${name}`
    );
    try {
      const result = await service.getArtistInfosRecursive(name, id);
      for (const [artistName, releases] of Object.entries(result)) {
        const sorted = sortReleases(releases);
        cacheByName.set(artistName, { name: artistName, releases: sorted });
      }
      // 1 アーティスト分終わるごとにスナップショット保存（再開可能化）
      const snapshot = Array.from(cacheByName.values());
      await fs.mkdir(path.dirname(MASTER_PATH), { recursive: true });
      await fs.writeFile(MASTER_PATH, JSON.stringify(snapshot, null, 2));
      console.log(
        `[refresh-relations] saved snapshot (${snapshot.length} artists, took ${(
          (Date.now() - tStart) /
          1000
        ).toFixed(1)}s)`
      );
    } catch (e) {
      console.error(`[refresh-relations] FAILED for ${name}:`, e);
      console.error(
        `[refresh-relations] resume with: FROM=${i} npx ts-node ... refresh-relations.ts`
      );
      process.exitCode = 1;
      return;
    }
  }

  const finalArr = Array.from(cacheByName.values());
  await fs.mkdir(path.dirname(STATIC_PATH), { recursive: true });
  await fs.writeFile(STATIC_PATH, JSON.stringify(finalArr, null, 2));
  console.log(
    `\n[refresh-relations] DONE. ${finalArr.length} artists written to:` +
      `\n  - ${MASTER_PATH}` +
      `\n  - ${STATIC_PATH}`
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
