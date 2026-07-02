/**
 * JSON-LD 構造化データ生成ヘルパー
 *
 * 非公式ファンサイトのため、Reol 本人を名乗る Organization / Person の
 * トップレベル定義は作らない。アーティストへの言及は performer として
 * MusicGroup(sameAs で公式サイトを参照)に留める。
 */

const SITE_URL = "https://reol.twilightea.com";

/** アーティスト参照用の MusicGroup(非公式サイトなので本人を名乗らず sameAs で紐付けるのみ) */
export const REOL_PERFORMER = {
  "@type": "MusicGroup",
  name: "Reol",
  sameAs: "https://reol.jp/",
} as const;

/** トップページ用の WebSite スキーマ(サイト内検索の SearchAction 付き) */
export const buildWebSite = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "!Legit｜Reol Unofficial Fansite",
  url: `${SITE_URL}/`,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export type BreadcrumbEntry = {
  name: string;
  /** サイトルートからの絶対パス(例: '/live/')。省略時は現在ページ扱いで item を付けない */
  path?: string;
};

/**
 * パンくずリスト(BreadcrumbList)を生成する。
 * 先頭は常に「ホーム」を想定し、呼び出し側で渡した並び順のまま出力する。
 */
export const buildBreadcrumbList = (entries: BreadcrumbEntry[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: entries.map((entry, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: entry.name,
    ...(entry.path ? { item: `${SITE_URL}${entry.path}` } : {}),
  })),
});

/** ISO 8601 の日付(YYYY-MM-DD)として妥当かどうかを判定する */
export const isValidIsoDate = (value: string | null | undefined): value is string => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;
  const date = new Date(trimmed);
  return !Number.isNaN(date.getTime());
};

export type MusicEventInput = {
  name: string;
  /** YYYY-MM-DD 形式を想定。不正/欠損の場合は呼び出し側でスキップすること */
  startDate: string;
  /** 会場名(あれば Place として付与) */
  place?: string | null;
};

/** ライブ情報から MusicEvent を生成する(日付が不正な場合は呼び出し側でフィルタ済みの前提) */
export const buildMusicEvent = ({ name, startDate, place }: MusicEventInput) => ({
  "@type": "MusicEvent",
  name,
  startDate: startDate.trim(),
  ...(place ? { location: { "@type": "Place", name: place } } : {}),
  performer: REOL_PERFORMER,
});

/** MusicEvent の配列から ItemList を生成する */
export const buildMusicEventItemList = (events: ReturnType<typeof buildMusicEvent>[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: events.map((event, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: event,
  })),
});

export type MusicRecordingInput = {
  name: string;
  /** 収録アルバム名(あれば MusicAlbum として付与) */
  albumName?: string | null;
};

/** 曲詳細ページ用の MusicRecording を生成する(performer は REOL_PERFORMER に留める) */
export const buildMusicRecording = ({ name, albumName }: MusicRecordingInput) => ({
  "@context": "https://schema.org",
  "@type": "MusicRecording",
  name,
  byArtist: REOL_PERFORMER,
  ...(albumName ? { inAlbum: { "@type": "MusicAlbum", name: albumName } } : {}),
});
