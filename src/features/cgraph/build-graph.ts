import type {
  AudioFeatures,
  CGraphArtistDetail,
  CGraphData,
  CGraphLink,
  CGraphNode,
  RawRelationsArtist,
} from "./types";
import { ROLE_CONFIG, ROLE_DEFAULT } from "./role-config";

/* -------------------------------------------------------------------------
 * Source: discography.json `songs[*]`
 * ----------------------------------------------------------------------- */
export type DiscographySong = {
  songUuid: string;
  slug: string;
  discographyUuid: string;
  songName: string;
  songNo?: number;
  lyricMember?: string | null;
  musicMember?: string | null;
  produceMember?: string | null;
  etcMember?: string | null;
  tieupDescription?: string | null;
  feature?: AudioFeatures | null;
  musicVideoUrl?: string | null;
  liveVideoUrl?: string | null;
  lyricVideoUrl?: string | null;
};

export type DiscographyEntry = {
  discographyUuid: string;
  slug: string;
  title: string;
  releaseDate?: string;
  format?: string;
  songs?: DiscographySong[];
};

/**
 * Map raw `format` strings in `discography.json` to a small set of
 * user-facing category labels, used to insert an intermediate node
 * between Reol and each release (アルバム / シングル / 歌ってみた …).
 */
const FORMAT_TO_CATEGORY: Record<string, string> = {
  fullAL: "アルバム",
  miniAL: "アルバム",
  LP: "アナログ盤",
  EP: "EP",
  SG: "シングル",
  配信SG: "配信シングル",
  "DVD/BD": "映像作品",
  歌ってみた: "歌ってみた",
};
const DEFAULT_CATEGORY = "その他";

/**
 * Per-discography category overrides (keyed by slug) for entries whose
 * `format` is technically correct but visually misleading. Currently:
 *   no-title-in-nippon-budokan = "No title' in NIPPON BUDOKAN" — tagged
 *        fullAL in discography.json, but it's the live album recorded at the
 *        Budokan show whose DVD/BD is also released. Group it under 映像作品
 *        so the アルバム category lists only studio albums.
 */
const CATEGORY_OVERRIDE_BY_DISC_SLUG: Record<string, string> = {
  "no-title-in-nippon-budokan": "映像作品",
};

/* -------------------------------------------------------------------------
 * Artist name normalization. Credits in `discography.json` are free-form
 * (「れをる」「Reol」「ギガ」「Giga」「Masayoshi limori」(typo) など)。
 * canonical 名でノードを統合する。
 * ----------------------------------------------------------------------- */
const ARTIST_ALIAS: Record<string, string> = {
  reol: "Reol",
  れをる: "Reol",
  giga: "Giga",
  ギガ: "Giga",
  "masayoshi iimori": "Masayoshi Iimori",
  "masayoshi limori": "Masayoshi Iimori",
  "masayoshi limoli": "Masayoshi Iimori",
  "masayoshi iimoli": "Masayoshi Iimori",
  "geek boy": "Geek Boy",
  geekboy: "Geek Boy",
  "al swettenham": "Al Swettenham",
  "ai swettenham": "Al Swettenham",
  teddyloid: "TeddyLoid",
  honnwaka88: "HONNWAKA88",
  monjoe: "MONJOE",
  narasaki: "NARASAKI",
  maquma: "MAQUMA",
  "ldn noise": "LDN Noise",
  "ivan kwong": "Ivan Kwong",
  "yoshi warashina": "Yoshi Warashina",
  kotonohouse: "KOTONOHOUSE",
  "(sic)boy": "(sic)boy",
  nqrse: "nqrse",
  niki: "niki",
  ezfg: "EZFG",
  "elements garden": "Elements Garden",
  "fake type.": "FAKE TYPE.",
  "fake type": "FAKE TYPE.",
  ia: "IA",
  kaito: "KAITO",
  gumi: "GUMI",
};

const normalizeArtistKey = (raw: string): string =>
  raw.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();

const canonicalArtist = (raw: string): string => {
  const key = normalizeArtistKey(raw);
  if (!key) return "";
  return ARTIST_ALIAS[key] ?? raw.trim();
};

/** Split a credit string into individual artist names. */
const splitCredit = (s: string): string[] => {
  if (!s) return [];
  const cleaned = s
    .replace(/[（(][^）)]*[）)]/g, " ")
    .replace(/\bfeat\.?\b/gi, ",")
    .replace(/\bft\.?\b/gi, ",");
  return cleaned
    .split(/[,，、\/／・&＆]| and | x | × /i)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
};

/* Title normalization for matching MB tracks to discography songs. */
const normalizeTitle = (s: string): string =>
  s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[「」『』""''`]/g, "")
    .replace(/\s*\(.+?\)\s*/g, " ")
    .replace(/\s*from\s+.+$/i, "")
    .trim();

const parseYear = (date: string | undefined): number | undefined => {
  if (!date) return undefined;
  const m = /^(\d{4})/.exec(date);
  return m ? Number(m[1]) : undefined;
};

/**
 * Extract a stable tieup label from descriptions like
 *   「TVアニメ『青の祓魔師 雪ノ果篇』オープニングテーマ」
 *   「Netflix映画『KATE/ケイト』 エンディング曲」
 *   「『BOAT RACE 2020』イメージソング」
 * Returns the inner-bracket title if any quoted region is present, else
 * the trimmed description with trailing role words removed.
 */
const TIEUP_OPEN_BRACKETS = /[「『《“]/;
const TIEUP_BRACKET_PAIRS = /[「『《“]([^」』》”]+)[」』》”]/;
const extractTieupTitle = (desc: string): string | null => {
  if (!desc) return null;
  if (TIEUP_OPEN_BRACKETS.test(desc)) {
    const m = TIEUP_BRACKET_PAIRS.exec(desc);
    if (m && m[1].trim()) return m[1].trim();
  }
  const trimmed = desc
    .replace(
      /(オープニングテーマ|エンディングテーマ|イメージソング|テーマソング|主題歌|挿入歌|タイアップ|オフィシャル・トラック|CMソング)/g,
      ""
    )
    .trim();
  return trimmed || null;
};

export type BuildOptions = {
  discography: DiscographyEntry[];
  /** MusicBrainz-shaped relations (optional, augments credits). */
  relations?: RawRelationsArtist[];
};

/**
 * Normalize a MusicBrainz relation `type` to the role keys used by
 * `ROLE_CONFIG` (discography credits use the canonical keys).
 *
 * - composer / lyricist / writer などの MB 用語を、UI フィルタの初期 ON 集合
 *   (ALL_ROLE_KEYS) と一致するキーに揃える。これをしないと初期表示で
 *   作詞・作曲のリンクが全部 OFF になり、リンクが 1 本も無いノードに見える。
 */
const MB_ROLE_ALIAS: Record<string, string> = {
  composer: "music",
  lyricist: "lyrics",
  writer: "music",
};
const normalizeMbRole = (raw: string | undefined | null): string => {
  if (!raw) return "misc";
  return MB_ROLE_ALIAS[raw] ?? raw;
};

/**
 * Build the creator-relation graph.
 *
 * Primary source: `discography.json` (per-song lyric/music/produce credits).
 * Augment: `relations.json` (MusicBrainz vocal/arrange/mix/instrument).
 */
export const buildCGraph = ({
  discography,
  relations,
}: BuildOptions): CGraphData => {
  const nodes = new Map<string, CGraphNode>();
  const links = new Map<string, CGraphLink>();

  const upsertArtist = (rawName: string): string | null => {
    const name = canonicalArtist(rawName);
    if (!name) return null;
    const id = `artist:${name}`;
    if (!nodes.has(id)) {
      nodes.set(id, { id, kind: "artist", name });
    }
    return id;
  };

  const upsertSong = (
    songName: string,
    year: number | undefined,
    discographyUuid: string | undefined,
    discographySlug: string | undefined,
    songUuid: string | undefined
  ): string => {
    const id =
      songUuid !== undefined && discographyUuid !== undefined
        ? `song:${discographyUuid}:${songUuid}`
        : `song:title:${normalizeTitle(songName)}`;
    const existing = nodes.get(id);
    if (!existing) {
      nodes.set(id, {
        id,
        kind: "song",
        name: songName,
        year,
        primaryArtist: "Reol",
        discographyUuid,
        discographySlug,
        songUuid,
      });
    } else if (existing.kind === "song") {
      if (
        year !== undefined &&
        (existing.year === undefined || year < existing.year)
      ) {
        existing.year = year;
      }
      if (existing.discographyUuid === undefined && discographyUuid !== undefined) {
        existing.discographyUuid = discographyUuid;
      }
      if (existing.discographySlug === undefined && discographySlug !== undefined) {
        existing.discographySlug = discographySlug;
      }
      if (existing.songUuid === undefined && songUuid !== undefined) {
        existing.songUuid = songUuid;
      }
    }
    return id;
  };

  const addLink = (source: string, target: string, role: string) => {
    const key = `${source}|${target}|${role}`;
    if (!links.has(key)) {
      links.set(key, { source, target, role });
    }
  };

  // Always create Reol artist node (centre).
  const reolId = upsertArtist("Reol")!;

  const upsertRelease = (
    title: string,
    year: number | undefined,
    discographyUuid: string,
    discographySlug: string
  ): string => {
    const id = `release:${discographyUuid}`;
    const existing = nodes.get(id);
    if (!existing) {
      nodes.set(id, {
        id,
        kind: "release",
        name: title,
        year,
        discographyUuid,
        discographySlug,
      });
    } else if (
      year !== undefined &&
      (existing.year === undefined || year < existing.year)
    ) {
      existing.year = year;
    }
    return id;
  };

  const tieupKey = (label: string): string =>
    label.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
  const upsertTieup = (label: string, raw: string): string => {
    const id = `tieup:${tieupKey(label)}`;
    if (!nodes.has(id)) {
      nodes.set(id, { id, kind: "tieup", name: label, tieupRaw: raw });
    }
    return id;
  };

  /** Intermediate "category" hub inserted between Reol and each release. */
  const upsertCategory = (label: string): string => {
    const id = `category:${label}`;
    if (!nodes.has(id)) {
      nodes.set(id, { id, kind: "category", name: label });
    }
    return id;
  };

  /**
   * Tieup nodes are also grouped under a "タイアップ" category hub so the
   * radial layout treats them like other categories (Reol → category → tieup
   * → song) instead of dangling off individual songs.
   */
  const TIEUP_CATEGORY_LABEL = "タイアップ";
  const tieupCategoryLinked = new Set<string>();

  // ---- (1) discography.json as primary source ----
  const titleIndex = new Map<string, string>();
  // Per-tieup dedupe: same song title across multiple releases (original SG,
  // album, live, edits, etc.) all carry the same `tieupDescription`. Linking
  // every duplicate song node makes the tieup look like a category-level hub
  // (e.g. 「青の祓魔師 雪ノ果篇」 → 5x RE RESCUE). Keep one edge per
  // (tieup, normalized song title) so granularity matches the visual: a tieup
  // points at a song, not a song catalog.
  const tieupLinkedTitleKeys = new Set<string>();

  for (const disc of discography) {
    const year = parseYear(disc.releaseDate);
    const releaseId = upsertRelease(disc.title, year, disc.discographyUuid, disc.slug);
    // Reol → category → release. Categories cluster releases by format
    // (アルバム / シングル / 歌ってみた …) so the Reol hub doesn't fan out
    // into 80+ direct release links.
    const categoryLabel =
      CATEGORY_OVERRIDE_BY_DISC_SLUG[disc.slug] ??
      ((disc.format && FORMAT_TO_CATEGORY[disc.format]) ?? DEFAULT_CATEGORY);
    const categoryId = upsertCategory(categoryLabel);
    addLink(reolId, categoryId, "release");
    addLink(categoryId, releaseId, "release");

    for (const song of disc.songs ?? []) {
      if (!song.songName) continue;
      const songNodeId = upsertSong(
        song.songName,
        year,
        disc.discographyUuid,
        disc.slug,
        song.songUuid
      );
      titleIndex.set(normalizeTitle(song.songName), songNodeId);

      // Attach audio features (when present).
      if (song.feature) {
        const existing = nodes.get(songNodeId);
        if (existing && existing.kind === "song" && !existing.audioFeatures) {
          existing.audioFeatures = song.feature;
        }
      }

      addLink(releaseId, songNodeId, "release");

      const creditFields: { field: keyof DiscographySong; role: string }[] = [
        { field: "lyricMember", role: "lyrics" },
        { field: "musicMember", role: "music" },
        { field: "produceMember", role: "producer" },
        { field: "etcMember", role: "misc" },
      ];
      for (const { field, role } of creditFields) {
        const v = song[field] as string | null | undefined;
        if (!v) continue;
        for (const name of splitCredit(v)) {
          const aId = upsertArtist(name);
          if (aId) addLink(aId, songNodeId, role);
        }
      }

      // Tieup node from `tieupDescription`. Dedupe by song title so multiple
      // release-versions of the same song share a single tieup edge.
      if (song.tieupDescription) {
        const label = extractTieupTitle(song.tieupDescription);
        if (label) {
          const tId = upsertTieup(label, song.tieupDescription);
          const dedupKey = `${tId}|${normalizeTitle(song.songName)}`;
          if (!tieupLinkedTitleKeys.has(dedupKey)) {
            tieupLinkedTitleKeys.add(dedupKey);
            addLink(songNodeId, tId, "tieup");
          }
          // Reol → "タイアップ" category → tieup hub. Match the same release-
          // category structure so the radial layout can place tieups on the
          // inner category ring instead of as song-leaf appendages.
          if (!tieupCategoryLinked.has(tId)) {
            tieupCategoryLinked.add(tId);
            const tieupCatId = upsertCategory(TIEUP_CATEGORY_LABEL);
            addLink(reolId, tieupCatId, "tieup");
            addLink(tieupCatId, tId, "tieup");
          }
        }
      }
    }
  }

  // ---- (2) MusicBrainz relations.json as augmentation ----
  if (relations) {
    for (const ownerArtist of relations) {
      // Skip artists whose MB query returned no JP/XW releases — otherwise
      // we would upsert an artist node that ends up with zero incident links
      // (a "lone" node that links to nobody when clicked).
      const hasAnyTrack = ownerArtist.releases.some((rel) =>
        rel.recordings.some((rec) => (rec.tracks ?? []).length > 0)
      );
      if (!hasAnyTrack) continue;
      const ownerId = upsertArtist(ownerArtist.name);
      for (const release of ownerArtist.releases) {
        const releaseYear = parseYear(release.date);
        for (const recording of release.recordings) {
          for (const track of recording.tracks) {
            if (!track.title) continue;
            const titleKey = normalizeTitle(track.title);
            const existingId = titleIndex.get(titleKey);
            const songNodeId =
              existingId ??
              upsertSong(track.title, releaseYear, undefined, undefined, undefined);
            if (!existingId) titleIndex.set(titleKey, songNodeId);
            // Owner-of-the-MB-release → song. Note: do NOT collapse this into
            // the discography-release node since MB ownership may be different
            // (Giga owns Sweet Devil, Reol guests on it, etc.).
            //
            // For Reol-owned MB releases we normally skip the link (the song
            // is already wired up via the discography release node). However
            // if the song is *only* in MB (no discography match), we must add
            // the link or the song becomes an orphan node.
            if (ownerId && (ownerId !== reolId || !existingId)) {
              addLink(ownerId, songNodeId, "release");
            }

            // 共演ペアリンクのために、release の owner artist (= かめりあ等) も
            // その release に含まれるトラックの credit として扱う。これにより
            // 「かめりあ ↔ kradness」「Reol ↔ かめりあ」のようなクロスリンクが
            // 生成され、共通の参加者が両親と繋がるようになる。
            // ただし owner が既に track.relations で credit されている場合は
            // 重複を避けるため追加しない。
            let ownerAlreadyCredited = false;
            if (ownerId) {
              for (const rel of track.relations) {
                const credName = rel.artist?.name;
                if (!credName) continue;
                if (upsertArtist(credName) === ownerId) {
                  ownerAlreadyCredited = true;
                  break;
                }
              }
              if (!ownerAlreadyCredited) {
                addLink(ownerId, songNodeId, "performer");
              }
            }

            for (const rel of track.relations) {
              if (!rel.artist || !rel.artist.name) continue;
              const aId = upsertArtist(rel.artist.name);
              if (aId) addLink(aId, songNodeId, normalizeMbRole(rel.type));
            }
          }
        }
      }
    }
  }

  // ---- (3) Compute degree ----
  const degreeMap = new Map<string, number>();
  for (const link of links.values()) {
    degreeMap.set(link.source, (degreeMap.get(link.source) ?? 0) + 1);
    degreeMap.set(link.target, (degreeMap.get(link.target) ?? 0) + 1);
  }
  for (const n of nodes.values()) {
    n.degree = degreeMap.get(n.id) ?? 0;
  }

  // ---- (4) Collapse to artist-only view ----
  // 楽曲 / リリース / タイアップ / カテゴリのノードはグラフからは取り除き、
  // アーティストノード間の共演リンクへ畳む。除いたものはインスペクタで
  // 一覧表示するため、`artistDetails` に集約しておく。
  const allNodes = Array.from(nodes.values());
  const allLinks = Array.from(links.values());
  // song id -> { song node, release node ids (for category lookup), tieup node ids,
  // and the credited artists with their roles on that song }.
  type SongAgg = {
    songNode: CGraphNode;
    releaseIds: Set<string>;
    tieupIds: Set<string>;
    /** artistId -> roles played on this song */
    artistRoles: Map<string, Set<string>>;
  };
  const songAgg = new Map<string, SongAgg>();
  const ensureSongAgg = (songNode: CGraphNode): SongAgg => {
    let agg = songAgg.get(songNode.id);
    if (!agg) {
      agg = {
        songNode,
        releaseIds: new Set(),
        tieupIds: new Set(),
        artistRoles: new Map(),
      };
      songAgg.set(songNode.id, agg);
    }
    return agg;
  };
  const songById = new Map<string, CGraphNode>();
  const releaseById = new Map<string, CGraphNode>();
  const tieupById = new Map<string, CGraphNode>();
  for (const n of allNodes) {
    if (n.kind === "song") songById.set(n.id, n);
    else if (n.kind === "release") releaseById.set(n.id, n);
    else if (n.kind === "tieup") tieupById.set(n.id, n);
  }
  // category-of-release index (release node -> category label).
  const releaseCategory = new Map<string, string>();
  for (const l of allLinks) {
    if (l.role !== "release") continue;
    if (
      typeof l.source === "string" &&
      typeof l.target === "string" &&
      l.source.startsWith("category:") &&
      l.target.startsWith("release:")
    ) {
      releaseCategory.set(l.target, l.source.slice("category:".length));
    }
  }
  for (const l of allLinks) {
    if (typeof l.source !== "string" || typeof l.target !== "string") continue;
    // artist -> song credit links (any role except the synthetic 'release'
    // edge from release/owner-artist nodes to song).
    if (l.source.startsWith("artist:") && l.target.startsWith("song:")) {
      if (l.role === "release") continue; // owner-of-release link, not a credit
      const songNode = songById.get(l.target);
      if (!songNode) continue;
      const agg = ensureSongAgg(songNode);
      let roles = agg.artistRoles.get(l.source);
      if (!roles) {
        roles = new Set();
        agg.artistRoles.set(l.source, roles);
      }
      roles.add(l.role);
    } else if (
      l.source.startsWith("release:") &&
      l.target.startsWith("song:")
    ) {
      const songNode = songById.get(l.target);
      if (!songNode) continue;
      ensureSongAgg(songNode).releaseIds.add(l.source);
    } else if (
      l.source.startsWith("artist:") &&
      l.target.startsWith("song:") === false &&
      false
    ) {
      // placeholder (no-op)
    } else if (
      l.source.startsWith("song:") &&
      l.target.startsWith("tieup:")
    ) {
      const songNode = songById.get(l.source);
      if (!songNode) continue;
      ensureSongAgg(songNode).tieupIds.add(l.target);
    }
  }
  // Also treat owner-artist -> song "release" link as a release credit: surface
  // it on the inspector under the artist's "releases" list (via the song's
  // attached release nodes if any). MB-only songs lacking a release still
  // surface the owner artist in the song's artistRoles via subsequent
  // augmentation: add an implicit "release" role marker. We skip adding it as
  // a role on the song so it doesn't pollute pair edges; the artist still
  // appears in the artist's song list through their actual credit roles.

  // Per-artist aggregation.
  const artistDetails: Record<string, CGraphArtistDetail> = {};
  const ensureDetail = (artistId: string): CGraphArtistDetail => {
    let d = artistDetails[artistId];
    if (!d) {
      d = { songs: [], releases: [], tieups: [] };
      artistDetails[artistId] = d;
    }
    return d;
  };
  // Track release / tieup dedupe per artist.
  const artistReleaseDedup = new Map<string, Set<string>>();
  const artistTieupDedup = new Map<string, Set<string>>();
  const dedupReleaseFor = (artistId: string): Set<string> => {
    let s = artistReleaseDedup.get(artistId);
    if (!s) {
      s = new Set();
      artistReleaseDedup.set(artistId, s);
    }
    return s;
  };
  const dedupTieupFor = (artistId: string): Set<string> => {
    let s = artistTieupDedup.get(artistId);
    if (!s) {
      s = new Set();
      artistTieupDedup.set(artistId, s);
    }
    return s;
  };
  const artistNameOf = (id: string): string => {
    const n = nodes.get(id);
    return n?.name ?? id.replace(/^artist:/, "");
  };

  // Pair-link aggregation: (a,b,role) -> count of co-credited songs.
  type PairKey = string;
  const pairLinks = new Map<PairKey, CGraphLink>();
  const addPair = (a: string, b: string, role: string) => {
    if (a === b) return;
    const [x, y] = a < b ? [a, b] : [b, a];
    const key = `${x}|${y}|${role}`;
    const existing = pairLinks.get(key);
    if (existing) {
      existing.weight = (existing.weight ?? 1) + 1;
    } else {
      pairLinks.set(key, { source: x, target: y, role, weight: 1 });
    }
  };

  for (const [, agg] of songAgg) {
    const credited = Array.from(agg.artistRoles.keys());
    // Per-song coArtists list (names, excluding self) computed once.
    const allNames = credited.map(artistNameOf);
    for (const aid of credited) {
      const detail = ensureDetail(aid);
      const roles = Array.from(agg.artistRoles.get(aid) ?? []);
      const selfName = artistNameOf(aid);
      detail.songs.push({
        discographyUuid: agg.songNode.discographyUuid,
        songUuid: agg.songNode.songUuid,
        name: agg.songNode.name,
        year: agg.songNode.year,
        roles,
        coArtists: allNames.filter((n) => n !== selfName),
      });
      // Releases this artist participated in (via the song).
      const relDedup = dedupReleaseFor(aid);
      for (const relId of agg.releaseIds) {
        if (relDedup.has(relId)) continue;
        relDedup.add(relId);
        const relNode = releaseById.get(relId);
        if (!relNode || relNode.discographyUuid === undefined) continue;
        detail.releases.push({
          discographyUuid: relNode.discographyUuid,
          title: relNode.name,
          year: relNode.year,
          category: releaseCategory.get(relId),
        });
      }
      // Tieups attached to this song.
      const tieDedup = dedupTieupFor(aid);
      for (const tid of agg.tieupIds) {
        const key = `${tid}|${agg.songNode.id}`;
        if (tieDedup.has(key)) continue;
        tieDedup.add(key);
        const tNode = tieupById.get(tid);
        if (!tNode) continue;
        detail.tieups.push({
          label: tNode.name,
          raw: tNode.tieupRaw,
          songName: agg.songNode.name,
        });
      }
    }
    // Pair links: for every pair of credited artists on this song, emit one
    // link per shared/per role bucket so role filtering stays meaningful.
    for (let i = 0; i < credited.length; i++) {
      for (let j = i + 1; j < credited.length; j++) {
        const a = credited[i];
        const b = credited[j];
        const rolesA = agg.artistRoles.get(a) ?? new Set();
        const rolesB = agg.artistRoles.get(b) ?? new Set();
        // Use union of roles so the strongest visible relation lights up
        // when *either* artist has that role on the song.
        const rolesUnion = new Set<string>([...rolesA, ...rolesB]);
        for (const r of rolesUnion) addPair(a, b, r);
      }
    }
  }

  // Sort each artist's lists for stable inspector rendering.
  for (const aid of Object.keys(artistDetails)) {
    const d = artistDetails[aid];
    d.songs.sort((a, b) => {
      const ya = a.year ?? 9999;
      const yb = b.year ?? 9999;
      if (ya !== yb) return ya - yb;
      return a.name.localeCompare(b.name, "ja");
    });
    d.releases.sort((a, b) => {
      const ya = a.year ?? 9999;
      const yb = b.year ?? 9999;
      if (ya !== yb) return ya - yb;
      return a.title.localeCompare(b.title, "ja");
    });
    d.tieups.sort((a, b) => a.label.localeCompare(b.label, "ja"));
  }

  // ---- Per-artist stats: Reol との共演数 / 期間 / role 内訳 / タイアップ曲数 ----
  // Reol を含む credited song 集合をアーティストごとに走査して算出。
  const reolName = nodes.get(reolId)?.name ?? "Reol";
  for (const aid of Object.keys(artistDetails)) {
    const d = artistDetails[aid];
    const isReol = aid === reolId;
    const roleBreakdown: Record<string, number> = {};
    let coCount = 0;
    let firstYear: number | undefined;
    let lastYear: number | undefined;
    const tieupSongs = new Set<string>();
    for (const s of d.songs) {
      for (const r of s.roles) {
        roleBreakdown[r] = (roleBreakdown[r] ?? 0) + 1;
      }
      const isReolCo =
        isReol || s.coArtists.includes(reolName);
      if (isReolCo) {
        coCount++;
        if (s.year !== undefined) {
          if (firstYear === undefined || s.year < firstYear) firstYear = s.year;
          if (lastYear === undefined || s.year > lastYear) lastYear = s.year;
        }
      }
    }
    for (const t of d.tieups) tieupSongs.add(t.songName);
    d.reolCoCount = coCount;
    if (firstYear !== undefined) d.reolFirstYear = firstYear;
    if (lastYear !== undefined) d.reolLastYear = lastYear;
    d.roleBreakdown = roleBreakdown;
    d.tieupSongCount = tieupSongs.size;
  }

  // Final artist-only nodes + pair links. Ensure Reol stays connected: any
  // artist NOT transitively reachable from Reol gets a thin anchor link to
  // Reol. (単に "リンクが 0 本" だけ見ると、Reol 不在の MB 取り込み曲で
  // 互いに繋がる小クラスター = Giga 楽曲の co-performer 群 などが浮いた
  // ままになる。)
  const artistNodes = allNodes.filter((n) => n.kind === "artist");
  const pairLinkList = Array.from(pairLinks.values());
  const adj = new Map<string, Set<string>>();
  for (const l of pairLinkList) {
    const s = l.source as string;
    const t = l.target as string;
    if (!adj.has(s)) adj.set(s, new Set());
    if (!adj.has(t)) adj.set(t, new Set());
    adj.get(s)!.add(t);
    adj.get(t)!.add(s);
  }
  // Reol からの hop 距離を BFS で計算 (Reol=0)。アンカー追加前の
  // 「本物のクレジットリンク」のみを使う。
  const distance = new Map<string, number>();
  distance.set(reolId, 0);
  const bfsQueue: string[] = [reolId];
  while (bfsQueue.length) {
    const cur = bfsQueue.shift()!;
    const d = distance.get(cur)!;
    for (const nb of adj.get(cur) ?? []) {
      if (distance.has(nb)) continue;
      distance.set(nb, d + 1);
      bfsQueue.push(nb);
    }
  }
  const reachable = new Set<string>(distance.keys());
  for (const n of artistNodes) {
    if (reachable.has(n.id)) continue;
    pairLinkList.push({ source: n.id, target: reolId, role: "misc" });
  }

  // Recompute degree on the collapsed graph.
  const degreeMap2 = new Map<string, number>();
  for (const l of pairLinkList) {
    degreeMap2.set(l.source as string, (degreeMap2.get(l.source as string) ?? 0) + 1);
    degreeMap2.set(l.target as string, (degreeMap2.get(l.target as string) ?? 0) + 1);
  }
  for (const n of artistNodes) {
    n.degree = degreeMap2.get(n.id) ?? 0;
    n.reolDistance = distance.get(n.id);
    const d = artistDetails[n.id];
    n.reolCoCount = d?.reolCoCount ?? 0;
    // 最多 role を dominantRole として保持。同数なら role-config の order が小さい方を優先。
    if (d?.roleBreakdown) {
      let best: { role: string; count: number; order: number } | null = null;
      for (const [role, count] of Object.entries(d.roleBreakdown)) {
        const order = ROLE_CONFIG[role]?.order ?? ROLE_DEFAULT.order;
        if (
          !best ||
          count > best.count ||
          (count === best.count && order < best.order)
        ) {
          best = { role, count, order };
        }
      }
      if (best) n.dominantRole = best.role;
    }
  }

  return {
    nodes: artistNodes,
    links: pairLinkList,
    artistDetails,
  };
};
