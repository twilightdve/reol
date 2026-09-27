// 関連ポスト(/posts/)専用の辞書(plan/28 第2弾)。中国語・韓国語は機械翻訳。
import type { SiteLang } from "../langs";

type SourceKey = "ALL" | "discography" | "live" | "liveItem";
// posts-index.json の category(データ側の値)
type CategoryKey = "ALL" | "本人" | "公式" | "メディア" | "その他";

const ja = {
  title: "関連ポスト",
  metaDescription: "Reolに関する楽曲・ライブ・各公演の関連ポストを時系列で横断して見られる一覧ページです。",
  lead: "楽曲・ライブ・各公演ページに掲載している関連ポストを、時系列で横断して見られるようにしたものです。投稿者の分類は簡易的なもので、確認できたハンドルのみ「本人/公式/メディア」に分類しています。",
  noBody: "本文を表示できませんでした。",
  sources: { ALL: "すべて", discography: "楽曲", live: "ライブ", liveItem: "公演" } as Record<SourceKey, string>,
  categories: { ALL: "すべて", 本人: "本人", 公式: "公式", メディア: "メディア", その他: "その他" } as Record<CategoryKey, string>,
  sourceAria: "種別で絞り込み",
  categoryAria: "分類で絞り込み",
  allYears: "全期間",
  year: (y: string) => `${y}年`,
  searchPlaceholder: "曲名・ライブ名で検索",
  count: (n: number) => `${n}件`,
  empty: "該当する関連ポストが見つかりませんでした。",
  showLight: "軽量表示に戻す",
  showEmbed: "埋め込み表示(iframe)で見る",
};

type PostsDict = typeof ja;

export const postsDict: Record<SiteLang, PostsDict> = {
  ja,
  en: {
    title: "Related Posts",
    metaDescription:
      "A chronological list of social media posts related to Reol's songs, live shows and individual performances.",
    lead: "All the related posts shown on the song, live and show pages, in one chronological list. Poster categories are rough: only handles that could be verified are marked as Reol / Official / Media.",
    noBody: "Could not display this post.",
    sources: { ALL: "All", discography: "Songs", live: "Lives", liveItem: "Shows" },
    categories: { ALL: "All", 本人: "Reol", 公式: "Official", メディア: "Media", その他: "Others" },
    sourceAria: "Filter by source",
    categoryAria: "Filter by poster",
    allYears: "All years",
    year: (y: string) => y,
    searchPlaceholder: "Search by song or show name",
    count: (n: number) => `${n} ${n === 1 ? "post" : "posts"}`,
    empty: "No related posts found.",
    showLight: "Back to lightweight view",
    showEmbed: "View embedded post (iframe)",
  },
  "zh-hant": {
    title: "相關貼文",
    metaDescription: "依時間順序橫跨瀏覽 Reol 相關的歌曲、演唱會與各場演出貼文的一覽頁面。",
    lead: "將刊登在歌曲、演唱會與各場演出頁面的相關貼文，依時間順序整合在一起。發文者的分類僅為簡易分類，只有確認過的帳號才會標示為「本人／官方／媒體」。",
    noBody: "無法顯示內文。",
    sources: { ALL: "全部", discography: "歌曲", live: "演唱會", liveItem: "場次" },
    categories: { ALL: "全部", 本人: "本人", 公式: "官方", メディア: "媒體", その他: "其他" },
    sourceAria: "依類型篩選",
    categoryAria: "依分類篩選",
    allYears: "全部期間",
    year: (y: string) => `${y}年`,
    searchPlaceholder: "以歌名或演唱會名稱搜尋",
    count: (n: number) => `${n} 則`,
    empty: "找不到符合的相關貼文。",
    showLight: "回到輕量顯示",
    showEmbed: "以嵌入方式(iframe)查看",
  },
  "zh-hans": {
    title: "相关帖子",
    metaDescription: "按时间顺序横跨浏览 Reol 相关的歌曲、演唱会与各场演出帖子的一览页面。",
    lead: "将刊登在歌曲、演唱会与各场演出页面的相关帖子，按时间顺序整合在一起。发帖者的分类仅为简易分类，只有确认过的账号才会标示为「本人／官方／媒体」。",
    noBody: "无法显示正文。",
    sources: { ALL: "全部", discography: "歌曲", live: "演唱会", liveItem: "场次" },
    categories: { ALL: "全部", 本人: "本人", 公式: "官方", メディア: "媒体", その他: "其他" },
    sourceAria: "按类型筛选",
    categoryAria: "按分类筛选",
    allYears: "全部时间",
    year: (y: string) => `${y}年`,
    searchPlaceholder: "按歌名或演唱会名称搜索",
    count: (n: number) => `${n} 条`,
    empty: "找不到符合的相关帖子。",
    showLight: "返回轻量显示",
    showEmbed: "以嵌入方式(iframe)查看",
  },
  ko: {
    title: "관련 포스트",
    metaDescription: "Reol의 곡·라이브·각 공연과 관련된 포스트를 시간순으로 한데 모아 볼 수 있는 목록 페이지입니다.",
    lead: "곡·라이브·각 공연 페이지에 실린 관련 포스트를 시간순으로 한데 모아 볼 수 있게 했습니다. 작성자 분류는 간이 분류로, 확인된 계정만 '본인/공식/미디어'로 분류합니다.",
    noBody: "본문을 표시하지 못했습니다.",
    sources: { ALL: "전체", discography: "곡", live: "라이브", liveItem: "공연" },
    categories: { ALL: "전체", 本人: "본인", 公式: "공식", メディア: "미디어", その他: "기타" },
    sourceAria: "종류로 필터",
    categoryAria: "분류로 필터",
    allYears: "전체 기간",
    year: (y: string) => `${y}년`,
    searchPlaceholder: "곡명·라이브명으로 검색",
    count: (n: number) => `${n}건`,
    empty: "해당하는 관련 포스트를 찾지 못했습니다.",
    showLight: "간이 표시로 돌아가기",
    showEmbed: "임베드(iframe)로 보기",
  },
};
