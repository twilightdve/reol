// 検索ページ専用の辞書(plan/28 第2弾)。中国語・韓国語は機械翻訳。
import type { SiteLang } from "../langs";

type Kind = "song" | "album" | "live" | "place";

const ja = {
  title: "検索",
  metaDescription:
    "Reolの楽曲・アルバム・LIVE・ロケ地を横断検索。曲名・公演名・会場名・年号からReolの活動を探せます。",
  lead: "楽曲・アルバム・LIVE・ロケ地を横断検索します",
  placeholder: "例: 第六感 / 文明ココロミー / 武道館 / 2024",
  loadError: (e: string) => `読み込みエラー: ${e}`,
  tabAll: "すべて",
  kindLabel: { song: "楽曲", album: "アルバム", live: "LIVE", place: "ロケ地" } as Record<Kind, string>,
  kindBadge: { song: "曲", album: "盤", live: "L", place: "地" } as Record<Kind, string>,
  loading: "データを読み込み中…",
  hint: "曲名・アルバム名・公演名・会場名・年号などで検索できます。例:",
  noHits: "該当なし",
  truncated: (n: number) => `上位 200 件のみ表示中（全 ${n} 件）`,
  livePlays: (n: number) => ` / LIVE ${n}回`,
  setlistHit: " ／ セトリ内ヒット",
  placeCount: (n: number) => `${n} ロケ地`,
};

type SearchDict = typeof ja;

const en: SearchDict = {
  title: "Search",
  metaDescription:
    "Search Reol's songs, releases, live shows and filming locations by song title, show, venue or year.",
  lead: "Search songs, releases, live shows and filming locations all at once",
  placeholder: "e.g. 第六感 / 文明ココロミー / 武道館 / 2024",
  loadError: (e: string) => `Load error: ${e}`,
  tabAll: "All",
  kindLabel: { song: "Songs", album: "Releases", live: "LIVE", place: "Locations" },
  kindBadge: { song: "S", album: "R", live: "L", place: "P" },
  loading: "Loading data…",
  hint: "Search by song title, release, show name, venue, year and more. Try:",
  noHits: "No results",
  truncated: (n: number) => `Showing the top 200 of ${n} results`,
  livePlays: (n: number) => ` / ${n} live ${n === 1 ? "performance" : "performances"}`,
  setlistHit: " / matched in setlist",
  placeCount: (n: number) => `${n} ${n === 1 ? "location" : "locations"}`,
};

const zhHant: SearchDict = {
  title: "搜尋",
  metaDescription: "橫向搜尋 Reol 的歌曲、作品、演唱會與取景地。可依歌名、演出名稱、會場名稱、年份查找 Reol 的活動。",
  lead: "橫向搜尋歌曲、作品、演唱會與取景地",
  placeholder: "例：第六感 / 文明ココロミー / 武道館 / 2024",
  loadError: (e: string) => `載入錯誤：${e}`,
  tabAll: "全部",
  kindLabel: { song: "歌曲", album: "作品", live: "LIVE", place: "取景地" },
  kindBadge: { song: "曲", album: "碟", live: "L", place: "地" },
  loading: "正在載入資料…",
  hint: "可用歌名、作品名稱、演出名稱、會場名稱、年份等搜尋。例：",
  noHits: "沒有結果",
  truncated: (n: number) => `僅顯示前 200 筆(共 ${n} 筆)`,
  livePlays: (n: number) => ` / LIVE ${n} 次`,
  setlistHit: " / 歌單內命中",
  placeCount: (n: number) => `${n} 個取景地`,
};

const zhHans: SearchDict = {
  title: "搜索",
  metaDescription: "横向搜索 Reol 的歌曲、作品、演唱会与取景地。可按歌名、演出名称、会场名称、年份查找 Reol 的活动。",
  lead: "横向搜索歌曲、作品、演唱会与取景地",
  placeholder: "例：第六感 / 文明ココロミー / 武道館 / 2024",
  loadError: (e: string) => `加载错误：${e}`,
  tabAll: "全部",
  kindLabel: { song: "歌曲", album: "作品", live: "LIVE", place: "取景地" },
  kindBadge: { song: "曲", album: "碟", live: "L", place: "地" },
  loading: "正在加载数据…",
  hint: "可用歌名、作品名称、演出名称、会场名称、年份等搜索。例：",
  noHits: "没有结果",
  truncated: (n: number) => `仅显示前 200 条(共 ${n} 条)`,
  livePlays: (n: number) => ` / LIVE ${n} 次`,
  setlistHit: " / 歌单内命中",
  placeCount: (n: number) => `${n} 个取景地`,
};

const ko: SearchDict = {
  title: "검색",
  metaDescription: "Reol의 곡·앨범·라이브·촬영지를 통합 검색. 곡명·공연명·공연장명·연도로 Reol의 활동을 찾을 수 있습니다.",
  lead: "곡·앨범·라이브·촬영지를 통합 검색합니다",
  placeholder: "예: 第六感 / 文明ココロミー / 武道館 / 2024",
  loadError: (e: string) => `불러오기 오류: ${e}`,
  tabAll: "전체",
  kindLabel: { song: "곡", album: "앨범", live: "LIVE", place: "촬영지" },
  kindBadge: { song: "곡", album: "반", live: "L", place: "지" },
  loading: "데이터를 불러오는 중…",
  hint: "곡명·앨범명·공연명·공연장명·연도 등으로 검색할 수 있습니다. 예:",
  noHits: "결과 없음",
  truncated: (n: number) => `상위 200건만 표시 중(전체 ${n}건)`,
  livePlays: (n: number) => ` / LIVE ${n}회`,
  setlistHit: " / 세트리스트에서 일치",
  placeCount: (n: number) => `촬영지 ${n}곳`,
};

export const searchDict: Record<SiteLang, SearchDict> = {
  ja,
  en,
  "zh-hant": zhHant,
  "zh-hans": zhHans,
  ko,
};
