// 機能一覧(/features/)専用の辞書(plan/27 ステップ5)。各ツールの名前と説明は共通辞書の home を使い、
// ここにはページ固有の文言と、HOME に説明がない項目だけを置く。中国語・韓国語は機械翻訳。
import type { SiteLang } from "../langs";

type FeaturesDict = {
  title: string;
  metaDescription: string;
  lead: string;
  groups: { start: string; live: string; songs: string; more: string };
  liveArchiveTitle: string;
  liveArchiveDesc: string;
  statsTitle: string;
  statsDesc: string;
  discographyTitle: string;
  discographyDesc: string;
  onThisDayTitle: string;
  onThisDayDesc: string;
  placeTitle: string;
  placeDesc: string;
  photosTitle: string;
  photosDesc: string;
  searchTitle: string;
  searchDesc: string;
  /** HOME の MORE TOOLS からのリンク */
  seeAll: string;
};

const ja: FeaturesDict = {
  title: "機能一覧",
  metaDescription:
    "!Legit のツール・ページの一覧。ライブのセトリ分析、楽曲統計、相関図、タイムマシン、聖地マップなど、Reolをデータで楽しむ機能をまとめています。",
  lead: "!Legit で使えるツールとページの一覧です。気になるものから開いてみてください。",
  groups: { start: "はじめての方へ", live: "ライブを掘る", songs: "楽曲を掘る", more: "つながりと記録" },
  liveArchiveTitle: "LIVE アーカイブ",
  liveArchiveDesc: "歴代ライブの公演情報とセットリスト。",
  statsTitle: "楽曲統計",
  statsDesc: "全曲の演奏回数・初披露・最終演奏。",
  discographyTitle: "DISCOGRAPHY",
  discographyDesc: "リリースと歌ってみたを時系列で。",
  onThisDayTitle: "On This Day",
  onThisDayDesc: "今日と同じ日付に起きたリリース・ライブ。",
  placeTitle: "聖地マップ",
  placeDesc: "MV・ジャケットのロケ地を地図で。",
  photosTitle: "PHOTOGRAPHY",
  photosDesc: "ライブや聖地巡礼で撮った写真。",
  searchTitle: "横断検索",
  searchDesc: "曲名・ライブ名・場所をまとめて検索。",
  seeAll: "すべての機能を見る →",
};

const en: FeaturesDict = {
  title: "All Features",
  metaDescription:
    "Every tool and page on !Legit: setlist analysis, song stats, creator relations, the time machine, filming-location map and more ways to explore Reol through data.",
  lead: "All the tools and pages available on !Legit. Open whatever catches your eye.",
  groups: { start: "New here?", live: "Dig into live shows", songs: "Dig into songs", more: "Connections & records" },
  liveArchiveTitle: "Live Archive",
  liveArchiveDesc: "Every live show with its info and setlist.",
  statsTitle: "Song Stats",
  statsDesc: "Live plays, debuts and last performances for every song.",
  discographyTitle: "DISCOGRAPHY",
  discographyDesc: "Releases and covers in chronological order.",
  onThisDayTitle: "On This Day",
  onThisDayDesc: "Releases and live shows that happened on today's date.",
  placeTitle: "Filming Locations",
  placeDesc: "MV and cover-art locations on a map.",
  photosTitle: "PHOTOGRAPHY",
  photosDesc: "Photos from live shows and pilgrimages.",
  searchTitle: "Search",
  searchDesc: "Search songs, shows and places at once.",
  seeAll: "See all features →",
};

const zhHant: FeaturesDict = {
  title: "功能一覽",
  metaDescription: "!Legit 的工具與頁面一覽。整理了演唱會歌單分析、歌曲統計、關係圖、時光機、聖地地圖等以數據享受 Reol 的功能。",
  lead: "!Legit 可以使用的工具與頁面一覽。從有興趣的開始看看吧。",
  groups: { start: "給初次來訪的你", live: "深入演唱會", songs: "深入歌曲", more: "連結與紀錄" },
  liveArchiveTitle: "演唱會資料庫",
  liveArchiveDesc: "歷年演唱會的資訊與歌單。",
  statsTitle: "歌曲統計",
  statsDesc: "所有歌曲的演出次數、首次演出與最後演出。",
  discographyTitle: "DISCOGRAPHY",
  discographyDesc: "依時間順序整理發行作品與翻唱。",
  onThisDayTitle: "On This Day",
  onThisDayDesc: "與今天同一天發生的發行與演唱會。",
  placeTitle: "聖地地圖",
  placeDesc: "以地圖呈現 MV 與封面的取景地。",
  photosTitle: "PHOTOGRAPHY",
  photosDesc: "在演唱會與聖地巡禮拍攝的照片。",
  searchTitle: "綜合搜尋",
  searchDesc: "一次搜尋歌名、演唱會名稱與地點。",
  seeAll: "查看所有功能 →",
};

const zhHans: FeaturesDict = {
  title: "功能一览",
  metaDescription: "!Legit 的工具与页面一览。整理了演唱会歌单分析、歌曲统计、关系图、时光机、圣地地图等以数据享受 Reol 的功能。",
  lead: "!Legit 可以使用的工具与页面一览。从感兴趣的开始看看吧。",
  groups: { start: "给初次来访的你", live: "深入演唱会", songs: "深入歌曲", more: "联系与记录" },
  liveArchiveTitle: "演唱会资料库",
  liveArchiveDesc: "历年演唱会的信息与歌单。",
  statsTitle: "歌曲统计",
  statsDesc: "所有歌曲的演出次数、首次演出与最后演出。",
  discographyTitle: "DISCOGRAPHY",
  discographyDesc: "按时间顺序整理发行作品与翻唱。",
  onThisDayTitle: "On This Day",
  onThisDayDesc: "与今天同一天发生的发行与演唱会。",
  placeTitle: "圣地地图",
  placeDesc: "以地图呈现 MV 与封面的取景地。",
  photosTitle: "PHOTOGRAPHY",
  photosDesc: "在演唱会与圣地巡礼拍摄的照片。",
  searchTitle: "综合搜索",
  searchDesc: "一次搜索歌名、演唱会名称与地点。",
  seeAll: "查看所有功能 →",
};

const ko: FeaturesDict = {
  title: "기능 목록",
  metaDescription:
    "!Legit의 도구와 페이지 목록. 라이브 세트리스트 분석, 곡 통계, 상관도, 타임머신, 성지 지도 등 데이터로 Reol을 즐기는 기능을 모았습니다.",
  lead: "!Legit에서 쓸 수 있는 도구와 페이지 목록입니다. 관심 가는 것부터 열어 보세요.",
  groups: { start: "처음 오신 분께", live: "라이브 파고들기", songs: "곡 파고들기", more: "연결과 기록" },
  liveArchiveTitle: "LIVE 아카이브",
  liveArchiveDesc: "역대 라이브의 공연 정보와 세트리스트.",
  statsTitle: "곡 통계",
  statsDesc: "모든 곡의 연주 횟수·첫 공개·마지막 연주.",
  discographyTitle: "DISCOGRAPHY",
  discographyDesc: "발매작과 커버를 시간 순으로.",
  onThisDayTitle: "On This Day",
  onThisDayDesc: "오늘과 같은 날짜에 있었던 발매·라이브.",
  placeTitle: "성지 지도",
  placeDesc: "MV·재킷 촬영지를 지도로.",
  photosTitle: "PHOTOGRAPHY",
  photosDesc: "라이브와 성지 순례에서 찍은 사진.",
  searchTitle: "통합 검색",
  searchDesc: "곡명·라이브명·장소를 한 번에 검색.",
  seeAll: "모든 기능 보기 →",
};

export const featuresDict: Record<SiteLang, FeaturesDict> = { ja, en, "zh-hant": zhHant, "zh-hans": zhHans, ko };
