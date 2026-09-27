// セトリ類似度ランキング(/live/similarity-ranking/)専用の辞書(plan/28 第2弾)。中国語・韓国語は機械翻訳。
import type { SiteLang } from "../langs";

const ja = {
  title: "セトリ類似度ランキング",
  metaDescription: "Reolの全公演を横断し、セットリストが特に似ている公演ペアを類似度順にランキング表示します。",
  lead: "異なるツアー・イベントの公演同士で、セットリストが特に似ているペアを類似度順に並べています。同一ツアー内の連日公演(セトリがほぼ同じで当然に似る)は除外しています。",
  empty: "ツアーをまたいで似ている公演ペアが見つかりませんでした。",
  sharedBefore: "共通曲 ",
  sharedAfter: " 曲",
  similarity: "類似度",
  compare: "セトリ比較で見る →",
};

type SimilarityRankingDict = typeof ja;

export const similarityRankingDict: Record<SiteLang, SimilarityRankingDict> = {
  ja,
  en: {
    title: "Setlist Similarity Ranking",
    metaDescription:
      "A ranking of the most similar pairs of setlists across every Reol live show, ordered by similarity.",
    lead: "Pairs of shows from different tours and events whose setlists are especially similar, ordered by similarity. Consecutive shows within the same tour (which naturally have near-identical setlists) are excluded.",
    empty: "No similar pairs of shows across different tours were found.",
    sharedBefore: "",
    sharedAfter: " songs in common",
    similarity: "Similarity",
    compare: "Compare setlists →",
  },
  "zh-hant": {
    title: "歌單相似度排行",
    metaDescription: "橫跨 Reol 所有演出，依相似度排列歌單特別相似的演出組合。",
    lead: "將不同巡演與活動的演出中，歌單特別相似的組合依相似度排列。同一巡演內的連日演出(歌單幾乎相同，自然相似)已排除。",
    empty: "找不到跨巡演的相似演出組合。",
    sharedBefore: "共同歌曲 ",
    sharedAfter: " 首",
    similarity: "相似度",
    compare: "在歌單比較中查看 →",
  },
  "zh-hans": {
    title: "歌单相似度排行",
    metaDescription: "横跨 Reol 所有演出，按相似度排列歌单特别相似的演出组合。",
    lead: "将不同巡演与活动的演出中，歌单特别相似的组合按相似度排列。同一巡演内的连日演出(歌单几乎相同，自然相似)已排除。",
    empty: "找不到跨巡演的相似演出组合。",
    sharedBefore: "共同歌曲 ",
    sharedAfter: " 首",
    similarity: "相似度",
    compare: "在歌单比较中查看 →",
  },
  ko: {
    title: "세트리스트 유사도 랭킹",
    metaDescription: "Reol의 모든 공연을 가로질러 세트리스트가 특히 비슷한 공연 쌍을 유사도 순으로 보여 줍니다.",
    lead: "서로 다른 투어·이벤트의 공연 중 세트리스트가 특히 비슷한 쌍을 유사도 순으로 나열했습니다. 같은 투어 안의 연일 공연(세트리스트가 거의 같아 당연히 비슷함)은 제외했습니다.",
    empty: "투어를 넘어 비슷한 공연 쌍을 찾지 못했습니다.",
    sharedBefore: "공통곡 ",
    sharedAfter: "곡",
    similarity: "유사도",
    compare: "세트리스트 비교로 보기 →",
  },
};
