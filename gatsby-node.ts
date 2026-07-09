import type { GatsbyNode, SourceNodesArgs } from "gatsby";
import { promises as fs } from "fs";
import path from "path";
import { SheetService } from "./src/services/SpreadsheetService";
import { DiscographyWithSongs } from "./src/types/discography";
import {
  Live,
  LiveItem,
  LiveInfo,
  LiveItemSong,
  LiveReport,
  LiveItemPost,
  LivePost,
} from "./src/types/live";
import { Recommend } from "./src/types/recommend";
import { Place, PlaceItem } from "./src/types/places";
import { buildSongIndex, matchSongId } from "./src/utils/songMatcher";
import { generateReliveData } from "./src/features/relive/data-transform";
import { generateReolTypeOgImages } from "./scripts/generate-reol-type-og";
import { generateSiteOgImage } from "./scripts/generate-site-og";
import {
  MusicBrainzService,
  Record as MbRecord,
} from "./src/services/MusicBrainzService";

const fileExists = async (filepath: string) => {
  try {
    return !!(await fs.lstat(filepath));
  } catch {
    return false;
  }
};

const writeDataJson = async (
  fileName: string,
  value: unknown,
  options: { mirrorToStatic?: boolean } = {}
) => {
  const json = JSON.stringify(value, null, 2);
  const targets = [`./public/static/data/${fileName}`];
  if (options.mirrorToStatic) {
    targets.push(`./static/data/${fileName}`);
  }

  await Promise.all(
    targets.map(async (target) => {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, json);
    })
  );
};

const createVideoNodes = async (
  sheet: SheetService,
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;

  const list = await sheet.getMusicVideos();
  createNode({
    id: createNodeId("MusicVideos"),
    list,
    internal: {
      type: "MusicVideos",
      content: JSON.stringify(list),
      contentDigest: createContentDigest(list),
    },
  });
  await writeDataJson("mv.json", list);
};

const createDiscographyNodes = async (
  sheet: SheetService,
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;

  const discography = await sheet.getDiscography();
  const reports = await sheet.getDiscographyRepos();
  const posts = await sheet.getDiscographyPosts();
  const feature = await sheet.getSongFeature();
  const songs = (await sheet.getSongs()).map((item) => {
    return {
      ...item,
      feature: item.spotifyTrackId
        ? feature.find(
            (featureItem) => featureItem.spotifyTrackId === item.spotifyTrackId
          )
        : null,
    };
  });
  const discographyWithSongs: DiscographyWithSongs[] = discography
    .map((item) => {
      return {
        ...item,
        // シート上の日付は "2012-6-20" のようにゼロ埋めされていないことがあり、
        // 文字列比較のソートが壊れる(6月 > 12月 扱い)ため正規化する
        releaseDate: normalizeIsoDate(item.releaseDate),
        reports: reports
          .filter((song) => item.discographyUuid === song.discographyUuid)
          .sort((a, b) =>
            a.discographyRepoUuid.localeCompare(b.discographyRepoUuid)
          ),
        posts: posts
          .filter((song) => item.discographyUuid === song.discographyUuid)
          .sort((a, b) =>
            a.discographyPostUuid.localeCompare(b.discographyPostUuid)
          ),
        songs: songs
          .filter((song) => item.discographyUuid === song.discographyUuid)
          .sort((a, b) => a.songNo - b.songNo),
      };
    })
    // リリース日の新しい順（降順）。日付が同じ場合は UUID で安定化
    .sort(
      (a, b) =>
        (b.releaseDate || "").localeCompare(a.releaseDate || "") ||
        b.discographyUuid.localeCompare(a.discographyUuid)
    );

  createNode({
    id: createNodeId("Discography"),
    discographyWithSongs,
    internal: {
      type: "Discography",
      content: JSON.stringify(discographyWithSongs),
      contentDigest: createContentDigest(discographyWithSongs),
    },
  });
  await writeDataJson("discography.json", discographyWithSongs, {
    mirrorToStatic: true,
  });
};

// "2012-6-20" のようなゼロ埋めなし日付を "2012-06-20" に正規化する。
// YYYY-M-D 形式以外(範囲表記・空文字など)はそのまま返す
const normalizeIsoDate = <T extends string | null | undefined>(value: T): T => {
  if (!value) return value;
  const m = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return value;
  return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` as T;
};

// ライブ開催日のソート用キー。"2026-03-14〜2026-07-18" のような範囲は開始日を使う
const liveStartDate = (date: string | null | undefined): string =>
  (date || "").split("〜")[0].trim();

const createLiveNodes = async (
  sheet: SheetService,
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;

  const live: Live[] = await sheet.getLives();
  const liveItems: LiveItem[] = await sheet.getLiveItems();
  const livePosts: LivePost[] = await sheet.getLivePosts();
  const liveItemSongsRaw: LiveItemSong[] = await sheet.getLiveItemSongs();
  const liveItemPosts: LiveItemPost[] = await sheet.getLiveItemPosts();
  const liveReports: LiveReport[] = await sheet.getLiveReports();

  // セトリの曲名を Discography の songUuid に解決して埋め込む
  // シート側 (live_item_song.songUuid) が埋まっていればそれを優先、無ければ matcher で fallback
  const songsForIndex = await sheet.getSongs();
  const liveSongIndex = buildSongIndex(songsForIndex);
  const liveItemSongs: LiveItemSong[] = liveItemSongsRaw.map((s) => {
    if (s.songUuid) {
      return { ...s, matchSource: "sheet" };
    }
    const r = matchSongId(s.liveItemSongName, liveSongIndex);
    return { ...s, songUuid: r.songUuid, matchSource: r.source };
  });
  const liveInfos: LiveInfo[] = live
    .map((item) => {
      return {
        ...item,
        posts: livePosts
          .filter((post) => item.liveUuid === post.liveUuid)
          .sort((a, b) => a.livePostUuid.localeCompare(b.livePostUuid)),
        items: liveItems
          .filter((liveItem) => item.liveUuid === liveItem.liveUuid)
          .map((liveItem) => {
            return {
              ...liveItem,
              setList: liveItemSongs
                .filter((song) => liveItem.liveItemUuid === song.liveItemUuid)
                .sort((a, b) =>
                  a.liveItemSongUuid.localeCompare(b.liveItemSongUuid)
                ),
              posts: liveItemPosts
                .filter((post) => liveItem.liveItemUuid === post.liveItemUuid)
                .sort((a, b) =>
                  a.liveItemPostUuid.localeCompare(b.liveItemPostUuid)
                ),
            };
          })
          .sort((a, b) => a.liveItemUuid.localeCompare(b.liveItemUuid)),
        reports: liveReports.filter(
          (report) => item.liveUuid === report.liveUuid
        ),
      };
    })
    // 開催日（範囲の場合は開始日）の新しい順（降順）。日付が同じ場合は UUID で安定化
    .sort(
      (a, b) =>
        liveStartDate(b.date).localeCompare(liveStartDate(a.date)) ||
        b.liveUuid.localeCompare(a.liveUuid)
    );
  createNode({
    id: createNodeId("Live"),
    liveInfos,
    internal: {
      type: "Live",
      content: JSON.stringify(liveInfos),
      contentDigest: createContentDigest(liveInfos),
    },
  });
  await writeDataJson("live.json", liveInfos, {
    mirrorToStatic: true,
  });
};

const createRecommendNodes = async (
  sheet: SheetService,
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;
  const recommend: Recommend[] = await sheet.getRecommends();
  createNode({
    id: createNodeId("Recommend"),
    recommend,
    internal: {
      type: "Recommend",
      content: JSON.stringify(recommend),
      contentDigest: createContentDigest(recommend),
    },
  });
  await writeDataJson("recommend.json", recommend);
};

const createPlaceNodes = async (
  sheet: SheetService,
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;
  const placeItems: PlaceItem[] = await sheet.getPlaceItems();
  const places: Place[] = (await sheet.getPlaces())
    .map((place) => ({
      ...place,
      items: placeItems.filter((item) => item.placeUuid === place.placeUuid),
    }))
    .sort((a, b) => b.placeUuid.localeCompare(a.placeUuid));

  createNode({
    id: createNodeId("Place"),
    places,
    internal: {
      type: "Place",
      content: JSON.stringify(places),
      contentDigest: createContentDigest(places),
    },
  });
  await fs.mkdir("./public/static/data/", { recursive: true });
  await fs.writeFile(
    `./public/static/data/places.json`,
    JSON.stringify(places, null, 2)
  );
};

/**
 * 楽曲 × ライブ の相互参照インデックスを生成する。
 * songStats.json: songId をキーに、演奏回数・履歴・初出/最終演奏日を持つ。
 * unmatchedSetlist.json: songId に紐付かなかったセトリ表記の一覧（運用調整用）。
 */
const createSongStatsNodes = async (
  sheet: SheetService,
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;
  const [songs, lives, liveItems, liveItemSongs, discographies] =
    await Promise.all([
      sheet.getSongs(),
      sheet.getLives(),
      sheet.getLiveItems(),
      sheet.getLiveItemSongs(),
      sheet.getDiscography(),
    ]);
  const liveByUuid = new Map(lives.map((l) => [l.liveUuid, l]));
  // discographyUuid → slug (ディスコグラフィのディープリンク用)
  const discSlugByUuid = new Map(
    discographies.map((d) => [d.discographyUuid, d.slug])
  );
  const itemMap = new Map(liveItems.map((it) => [it.liveItemUuid, it]));
  // liveItemUuid → liveUuid の逆引き
  const liveUuidByItemUuid = new Map(
    liveItems.map((it) => [it.liveItemUuid, it.liveUuid])
  );

  const songIndex = buildSongIndex(songs);

  type Play = {
    liveUuid: string;
    liveSlug: string;
    liveItemUuid: string;
    liveItemSlug: string;
    liveItemSongUuid: string;
    date: string;
    place: string | null;
    liveItemName: string | null;
    liveTitle: string;
    rawName: string;
    type: LiveItemSong["type"];
    matchSource: string;
  };
  const playsBySong = new Map<string, Play[]>();
  const unmatched: {
    name: string;
    count: number;
    type: LiveItemSong["type"];
    samples: { date: string; liveTitle: string; liveItemName: string | null }[];
  }[] = [];
  const unmatchedAgg = new Map<
    string,
    {
      count: number;
      type: LiveItemSong["type"];
      samples: { date: string; liveTitle: string; liveItemName: string | null }[];
    }
  >();

  for (const s of liveItemSongs) {
    const item = itemMap.get(s.liveItemUuid);
    if (!item) continue;
    const live = liveByUuid.get(item.liveUuid);
    if (!live) continue;

    // segment 系は曲ではないのでスキップ
    if (s.type === "segment") continue;

    // シート由来の songUuid があればそれを優先、無ければ matcher
    const resolvedUuid = s.songUuid
      ? s.songUuid
      : matchSongId(s.liveItemSongName, songIndex).songUuid;
    const matchSource = s.songUuid
      ? "sheet"
      : matchSongId(s.liveItemSongName, songIndex).source;

    if (resolvedUuid) {
      const list = playsBySong.get(resolvedUuid) ?? [];
      list.push({
        liveUuid: item.liveUuid,
        liveSlug: live.slug,
        liveItemUuid: s.liveItemUuid,
        liveItemSlug: item.slug,
        liveItemSongUuid: s.liveItemSongUuid,
        date: item.date,
        place: item.place,
        liveItemName: item.liveItemName,
        liveTitle: live.title,
        rawName: s.liveItemSongName,
        type: s.type ?? null,
        matchSource,
      });
      playsBySong.set(resolvedUuid, list);
    } else {
      const cur = unmatchedAgg.get(s.liveItemSongName) ?? {
        count: 0,
        type: s.type ?? null,
        samples: [],
      };
      cur.count += 1;
      if (cur.samples.length < 3) {
        cur.samples.push({
          date: item.date,
          liveTitle: live.title,
          liveItemName: item.liveItemName,
        });
      }
      unmatchedAgg.set(s.liveItemSongName, cur);
    }
  }

  // 代表 songUuid: songMatcher の解決結果が自分自身と一致する楽曲のみ stats に出力
  const representativeUuidOf = (song: typeof songs[number]): string => {
    const r = matchSongId(song.songName, songIndex);
    return r.songUuid ?? song.songUuid;
  };
  const songStats = songs
    .filter(
      (song) =>
        !!song.songName && representativeUuidOf(song) === song.songUuid
    )
    .filter((song) => !/instrumental/i.test(song.songName ?? ""))
    .map((song) => {
      const plays = playsBySong.get(song.songUuid) ?? [];
      const sorted = [...plays].sort((a, b) => a.date.localeCompare(b.date));
      return {
        songUuid: song.songUuid,
        slug: song.slug,
        songName: song.songName ?? "",
        discographyUuid: song.discographyUuid ?? null,
        discographySlug: song.discographyUuid
          ? discSlugByUuid.get(song.discographyUuid) ?? null
          : null,
        totalPlays: plays.length,
        firstPlayedDate: sorted[0]?.date ?? null,
        lastPlayedDate: sorted[sorted.length - 1]?.date ?? null,
        // 公式送客用リンク(統計ページの行展開から公式MV/配信へ誘導する)
        musicVideoUrl: song.musicVideoUrl ?? null,
        downloadUrl: song.downloadUrl ?? null,
        plays: sorted,
      };
    })
    .sort((a, b) => b.totalPlays - a.totalPlays);

  for (const [name, info] of unmatchedAgg) {
    unmatched.push({ name, ...info });
  }
  unmatched.sort((a, b) => b.count - a.count);

  const summary = {
    totalSetlistInstances: liveItemSongs.length,
    matchedInstances: songStats.reduce((sum, s) => sum + s.totalPlays, 0),
    unmatchedInstances: unmatched.reduce((sum, u) => sum + u.count, 0),
    uniqueSongsPlayed: songStats.filter((s) => s.totalPlays > 0).length,
    uniqueUnmatched: unmatched.length,
  };

  createNode({
    id: createNodeId("SongStats"),
    songStats,
    summary,
    internal: {
      type: "SongStats",
      content: JSON.stringify(songStats),
      contentDigest: createContentDigest(songStats),
    },
  });

  // ----- トップページのヒーロー統計・NEXT LIVE(B案リデザイン)用のビルド時集計 -----
  // カウントアップ演出の最終値をビルド時に焼き込む(クライアントでの再計算はしない)
  const today = new Date().toISOString().slice(0, 10);
  const upcomingItems = liveItems
    .filter((it) => (it.date ?? "") >= today)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  const nextItem = upcomingItems[0] ?? null;
  const nextLiveParent = nextItem ? liveByUuid.get(nextItem.liveUuid) : null;
  const siteStats = {
    songCount: songStats.length,
    liveItemCount: liveItems.length,
    // セトリ登録済みの演奏数(曲DBに未マッチの表記も演奏としてカウント)
    performanceCount: liveItemSongs.filter((s) => !!s.liveItemSongName).length,
    nextLive: nextItem
      ? {
          title: nextLiveParent?.title ?? null,
          itemName: nextItem.liveItemName ?? null,
          date: nextItem.date ?? null,
          place: nextItem.place ?? null,
          liveSlug: nextLiveParent?.slug ?? null,
        }
      : null,
  };
  createNode({
    id: createNodeId("SiteStats"),
    siteStats,
    internal: {
      type: "SiteStats",
      content: JSON.stringify(siteStats),
      contentDigest: createContentDigest(siteStats),
    },
  });

  await fs.mkdir("./public/static/data/", { recursive: true });
  await fs.writeFile(
    `./public/static/data/songStats.json`,
    JSON.stringify({ summary, songStats }, null, 2)
  );
  await fs.writeFile(
    `./public/static/data/unmatchedSetlist.json`,
    JSON.stringify({ summary, unmatched }, null, 2)
  );

  // ----- ライブ類似度（Jaccard係数）の事前計算 -----
  // songUuid のセットを liveUuid 単位で構築
  const songSetByLive = new Map<string, Set<string>>();
  for (const stat of songStats) {
    for (const p of stat.plays) {
      const set = songSetByLive.get(p.liveUuid) ?? new Set<string>();
      set.add(stat.songUuid);
      songSetByLive.set(p.liveUuid, set);
    }
  }
  const liveUuids = Array.from(songSetByLive.keys());
  const similarityByLive: Record<
    string,
    {
      liveUuid: string;
      liveSlug: string;
      title: string;
      date: string;
      sharedCount: number;
      score: number;
      sharedSongUuids: string[];
    }[]
  > = {};
  for (const aId of liveUuids) {
    const a = songSetByLive.get(aId)!;
    const liveA = liveByUuid.get(aId);
    if (!liveA || a.size === 0) continue;
    const cands: {
      liveUuid: string;
      liveSlug: string;
      title: string;
      date: string;
      sharedCount: number;
      score: number;
      sharedSongUuids: string[];
    }[] = [];
    for (const bId of liveUuids) {
      if (bId === aId) continue;
      const b = songSetByLive.get(bId)!;
      if (b.size === 0) continue;
      const shared: string[] = [];
      for (const id of a) if (b.has(id)) shared.push(id);
      if (shared.length === 0) continue;
      const union = new Set<string>([...a, ...b]).size;
      const score = shared.length / union; // Jaccard
      const liveB = liveByUuid.get(bId);
      if (!liveB) continue;
      cands.push({
        liveUuid: bId,
        liveSlug: liveB.slug,
        title: liveB.title,
        date: liveB.date,
        sharedCount: shared.length,
        score: Math.round(score * 1000) / 1000,
        sharedSongUuids: shared,
      });
    }
    cands.sort((x, y) => y.score - x.score || y.sharedCount - x.sharedCount);
    similarityByLive[aId] = cands.slice(0, 5);
  }

  await fs.writeFile(
    `./public/static/data/liveSimilarity.json`,
    JSON.stringify(similarityByLive, null, 2)
  );

  console.log(
    `[songStats] matched=${summary.matchedInstances}/${summary.totalSetlistInstances} ` +
      `(${((summary.matchedInstances / summary.totalSetlistInstances) * 100).toFixed(1)}%) ` +
      `unique songs played=${summary.uniqueSongsPlayed}, unmatched=${summary.uniqueUnmatched}`
  );
  console.log(
    `[liveSimilarity] ${liveUuids.length} lives indexed, top5 each`
  );
};

/**
 * Reol を中心とした関係者の MusicBrainz リレーション情報を集約し、
 * `static/data/relations.json` および `public/static/data/relations.json` に書き出す。
 *
 * - `master/relations.json` があればそれを利用（手動編集 / キャッシュ）
 * - 無い場合のみ MusicBrainz API を 32 人ぶん並列で叩いて取得
 */
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

const createRelationsNodes = async ({
  actions,
  createNodeId,
  createContentDigest,
}: SourceNodesArgs) => {
  const { createNode } = actions;
  let relations: { name: string; releases: MbRecord[] }[] = [];
  const masterPath = "./master/relations.json";
  if (await fileExists(masterPath)) {
    relations = JSON.parse((await fs.readFile(masterPath)).toString());
    console.log(
      `[relations] using cached ${masterPath} (${relations.length} artists)`
    );
  } else {
    console.log(
      `[relations] fetching from MusicBrainz API for ${
        Object.keys(RELATIONS_ARTIST_IDS).length
      } artists (this may take several minutes)…`
    );
    const service = new MusicBrainzService();
    const fetched = await Promise.all(
      Object.entries(RELATIONS_ARTIST_IDS).map(([name, id]) =>
        service.getArtistInfosRecursive(name, id)
      )
    );
    relations = fetched
      .map((artist) =>
        Object.entries(artist).map(([name, artistData]) => ({
          name,
          releases: artistData.sort(
            (a, b) =>
              +(a.date ?? "").replaceAll("-", "") -
              +(b.date ?? "").replaceAll("-", "")
          ),
        }))
      )
      .flat();
    // 取得結果を master にもキャッシュ
    await fs.mkdir("./master", { recursive: true });
    await fs.writeFile(masterPath, JSON.stringify(relations, null, 2));
  }

  createNode({
    id: createNodeId("Relations"),
    relations,
    internal: {
      type: "Relations",
      content: JSON.stringify(relations),
      contentDigest: createContentDigest(relations),
    },
  });

  await writeDataJson("relations.json", relations, { mirrorToStatic: true });
};

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({ actions }) => {
  const { createTypes } = actions;
  const typeDefs = `
    type DiscographyDiscographyWithSongs {
      themeColorPrimary: String
      themeColorSecondary: String
    }

    type LiveLiveInfos {
      themeColorPrimary: String
      themeColorSecondary: String
    }

    # トップページ用のビルド時統計(nextLive が null でもクエリできるよう明示定義)
    type SiteStats implements Node {
      siteStats: SiteStatsData
    }
    type SiteStatsData {
      songCount: Int!
      liveItemCount: Int!
      performanceCount: Int!
      nextLive: SiteStatsNextLive
    }
    type SiteStatsNextLive {
      title: String
      itemName: String
      date: String
      place: String
      liveSlug: String
    }
  `;
  createTypes(typeDefs);
};

export const sourceNodes: GatsbyNode["sourceNodes"] = async (args) => {
  try {
    const sheet = new SheetService();
    await sheet.initialize();
    await Promise.all([
      createVideoNodes(sheet, args),
      createDiscographyNodes(sheet, args),
      createLiveNodes(sheet, args),
      createRecommendNodes(sheet, args),
      createPlaceNodes(sheet, args),
      createRelationsNodes(args),
    ]);
    // disc/live のロード後に楽曲×ライブのインデックスを作る
    await createSongStatsNodes(sheet, args);
    const relive = await generateReliveData({
      liveJsonPath: "static/data/live.json",
      discographyJsonPath: "static/data/discography.json",
      venueLayoutOverridesPath: "src/data/relive/venue-layout-overrides.json",
      outputDir: "static/relive/generated",
      mirrorOutputDir: "public/relive/generated",
    });
    console.log(
      `[relive] generated=${relive.manifest.counts.setlists} setlists, ` +
        `tracks=${relive.manifest.counts.tracks}, venues=${relive.manifest.counts.venues}`
    );
    // ファンタイプ診断のタイプ別OG画像(16枚)を static/public の両方へ生成する
    const og = await generateReolTypeOgImages({
      outputDir: "static/reol-type-og",
      mirrorOutputDir: "public/reol-type-og",
    });
    console.log(`[reol-type-og] generated=${og.generated}, skipped=${og.skipped}`);
    // サイト既定のOG画像(SEO.tsxのOG_IMAGEが参照)を static/public の両方へ生成する
    const siteOg = await generateSiteOgImage({
      outputDir: "static",
      mirrorOutputDir: "public",
    });
    console.log(`[site-og] generated=${siteOg.generated}, skipped=${siteOg.skipped}`);
  } catch (error) {
    console.error(error);
  }
};

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions,
  stage,
  loaders,
}) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.md$/,
          type: "asset/source",
        },
        // Leaflet / react-leaflet は window を参照するため SSR ビルドでは null 化
        ...(stage === "build-html" || stage === "develop-html"
          ? [
              {
                test: /node_modules\/(leaflet|@react-leaflet|react-leaflet)\//,
                use: loaders.null(),
              },
            ]
          : []),
      ],
    },
  });
};

// ----- 記事 & 会場の静的ページを生成 -----
export const createPages: GatsbyNode["createPages"] = async ({
  actions,
  graphql,
}) => {
  const { createPage } = actions;

  // 記事ページ — slugは記事データと同期が必要（markdownインポートを含むため直接import不可）
  const articleSlugs = [
    "live-tips-first-timer",
    "venue-guide-overview",
  ];
  const articleTemplate = path.resolve("./src/templates/article.tsx");
  articleSlugs.forEach((slug) => {
    createPage({
      path: `/bijigaku-navi/articles/${slug}/`,
      component: articleTemplate,
      context: { slug },
    });
  });

  // 会場ページ
  const { VENUES_2026 } = require("./src/data/venues");
  const venueTemplate = path.resolve("./src/templates/venue.tsx");
  VENUES_2026.forEach((venue: { id: string }) => {
    createPage({
      path: `/bijigaku-navi/venue/${venue.id}/`,
      component: venueTemplate,
      context: { venueId: venue.id },
    });
  });

  // Reolファンタイプ診断 — 全16タイプの詳細ページ
  const typeCodes = [
    'FGSA', 'FGSI', 'FGQA', 'FGQI',
    'FESA', 'FESI', 'FEQA', 'FEQI',
    'BGSA', 'BGSI', 'BGQA', 'BGQI',
    'BESA', 'BESI', 'BEQA', 'BEQI',
  ];
  const typeDetailTemplate = path.resolve("./src/templates/reol-type-detail.tsx");
  typeCodes.forEach((code) => {
    createPage({
      path: `/quiz/reol-type/types/${code.toLowerCase()}/`,
      component: typeDetailTemplate,
      context: { typeCode: code },
    });
  });

  // ----- 曲詳細ハブページ(/songs/<slug>/) -----
  // SongStats(演奏統計 + plays)と Discography(クレジット等の追加メタ)を
  // songUuid で結合し、曲ごとに1ページ生成する。
  const songResult = await graphql<{
    songStats: {
      songStats: {
        songUuid: string;
        slug: string;
        songName: string;
        discographyUuid: string | null;
        discographySlug: string | null;
        totalPlays: number;
        firstPlayedDate: string | null;
        lastPlayedDate: string | null;
        musicVideoUrl: string | null;
        downloadUrl: string | null;
        plays: {
          date: string;
          place: string | null;
          liveTitle: string;
          liveSlug: string;
          liveItemSlug: string;
          liveItemName: string | null;
          liveItemSongUuid: string;
        }[];
      }[];
    } | null;
    discography: {
      discographyWithSongs: {
        discographyUuid: string;
        songs: {
          songUuid: string;
          slug: string;
          songName: string | null;
          songNo: number | null;
          discographyTitle: string | null;
          lyricUrl: string | null;
          spotifyTrackId: string | null;
          lyricMember: string | null;
          musicMember: string | null;
          lyricVideoUrl: string | null;
          liveVideoUrl: string | null;
        }[];
      }[];
    } | null;
  }>(`
    query {
      songStats {
        songStats {
          songUuid
          slug
          songName
          discographyUuid
          discographySlug
          totalPlays
          firstPlayedDate
          lastPlayedDate
          musicVideoUrl
          downloadUrl
          plays {
            date
            place
            liveTitle
            liveSlug
            liveItemSlug
            liveItemName
            liveItemSongUuid
          }
        }
      }
      discography {
        discographyWithSongs {
          discographyUuid
          songs {
            songUuid
            slug
            songName
            songNo
            discographyTitle
            lyricUrl
            spotifyTrackId
            lyricMember
            musicMember
            lyricVideoUrl
            liveVideoUrl
          }
        }
      }
    }
  `);

  if (songResult.errors) {
    console.error("[songs] GraphQLクエリでエラーが発生しました", songResult.errors);
  } else {
    const songStats = songResult.data?.songStats?.songStats ?? [];
    // songUuid → クレジット等の追加メタ(discography ノードとの結合)
    const creditByUuid = new Map(
      (songResult.data?.discography?.discographyWithSongs ?? [])
        .flatMap((disc) => disc.songs)
        .map((song) => [song.songUuid, song])
    );
    // discographyUuid → 収録曲一覧(同アルバム内回遊用。曲順でソート)
    const albumSongsByDiscUuid = new Map(
      (songResult.data?.discography?.discographyWithSongs ?? []).map((disc) => [
        disc.discographyUuid,
        [...disc.songs]
          .sort((a, b) => (a.songNo ?? 0) - (b.songNo ?? 0))
          .map((s) => ({
            songUuid: s.songUuid,
            slug: s.slug,
            songName: s.songName ?? "",
          })),
      ])
    );

    // 楽曲ページは代表曲(songStats)にしか存在しないため、アルバム収録曲の
    // リンク先slugは songUuid → 曲名 の順で代表曲へ解決する(解決不能ならリンクなし)
    const statsSlugByUuid = new Map(songStats.map((s) => [s.songUuid, s.slug]));
    const statsSlugByName = new Map(songStats.map((s) => [s.songName, s.slug]));

    const songTemplate = path.resolve("./src/templates/song.tsx");
    songStats.forEach((song) => {
      // /songs/stats/ という既存ページと衝突するため、万一 slug が "stats" の曲が
      // 紛れ込んだ場合はページ生成をスキップする(現データにはない想定の将来ガード)
      if (song.slug === "stats") {
        console.warn(
          `[songs] slug "stats" は /songs/stats/ と衝突するためページ生成をスキップします (songUuid=${song.songUuid})`
        );
        return;
      }

      const credit = creditByUuid.get(song.songUuid);
      const albumSongs = (
        song.discographyUuid
          ? albumSongsByDiscUuid.get(song.discographyUuid) ?? []
          : []
      ).map((s) => ({
        songName: s.songName,
        slug:
          statsSlugByUuid.get(s.songUuid) ??
          statsSlugByName.get(s.songName) ??
          null,
      }));
      createPage({
        path: `/songs/${song.slug}/`,
        component: songTemplate,
        context: {
          songUuid: song.songUuid,
          slug: song.slug,
          songName: song.songName,
          discographyUuid: song.discographyUuid,
          discographySlug: song.discographySlug,
          discographyTitle: credit?.discographyTitle ?? null,
          totalPlays: song.totalPlays,
          firstPlayedDate: song.firstPlayedDate,
          lastPlayedDate: song.lastPlayedDate,
          musicVideoUrl: song.musicVideoUrl,
          downloadUrl: song.downloadUrl,
          lyricUrl: credit?.lyricUrl ?? null,
          spotifyTrackId: credit?.spotifyTrackId ?? null,
          lyricMember: credit?.lyricMember ?? null,
          musicMember: credit?.musicMember ?? null,
          lyricVideoUrl: credit?.lyricVideoUrl ?? null,
          liveVideoUrl: credit?.liveVideoUrl ?? null,
          albumSongs,
          plays: song.plays,
        },
      });
    });
    console.log(`[songs] generated ${songStats.length} song pages`);
  }
};
