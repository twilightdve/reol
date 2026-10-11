import { songArticleTags, tagFilterPath, seriesBySlug, SONG_ARTICLE_SERIES } from "../songArticles/series";

describe("読みものの分類(plan/33)", () => {
  it("楽曲記事のシリーズは「曲を読む」", () => {
    expect(seriesBySlug(SONG_ARTICLE_SERIES)?.name).toBe("曲を読む");
  });

  it("タグは 初出の作品 → 初出の年 → 編集タグ の順で、重複と空を除く(曲名は付けない)", () => {
    expect(
      songArticleTags({
        releases: [
          { title: "極彩色", releaseDate: "2015-07-29" },
          { title: "別の作品", releaseDate: "2020-01-01" },
        ],
        extra: ["2015年", " ", "ライヴ"],
      })
    ).toEqual(["極彩色", "2015年", "ライヴ"]);
  });

  it("収録作が無ければ編集タグだけ", () => {
    expect(songArticleTags({ releases: [], extra: ["コラム"] })).toEqual(["コラム"]);
    expect(songArticleTags({ releases: [] })).toEqual([]);
  });

  it("絞り込みのURLはタグをエンコードする", () => {
    expect(tagFilterPath("極彩色")).toBe("/articles/?tag=%E6%A5%B5%E5%BD%A9%E8%89%B2");
  });
});

import { splitPhrases } from "../songArticles/format";

describe("句の切れ目(splitPhrases)", () => {
  it("ひらがなの後に漢字・英字・括弧が来る所で分け、つなげると元に戻る", () => {
    expect(splitPhrases("1LDKが自分の歌になるとき")).toEqual(["1LDKが", "自分の", "歌になるとき"]);
    const s = "「1LDK」は、MCと重ねて聴いたときの記憶が離れない。";
    expect(splitPhrases(s)).toEqual(["「1LDK」は、", "MCと", "重ねて", "聴いたときの", "記憶が", "離れない。"]);
    expect(splitPhrases(s).join("")).toBe(s);
  });
});

import { pickRelatedArticles, RelatedCandidate } from "../songArticles/series";

describe("関連記事(pickRelatedArticles)", () => {
  const c = (id: string, tags: string[], createdAt: string, seriesSlug = "kyoku-wo-yomu"): RelatedCandidate => ({
    id,
    slug: id,
    title: id,
    songTitle: id,
    seriesSlug,
    tags,
    createdAt,
  });
  const all = [
    c("a", ["極彩色", "2015年"], "2026-10-01"),
    c("b", ["極彩色", "2015年"], "2026-10-02"),
    c("c", ["金字塔", "2020年"], "2026-10-05"),
    c("d", ["Boy", "2021年"], "2026-10-03"),
    c("e", ["2015年"], "2026-10-04", "other"),
  ];
  it("自分を除き、共通のタグが多い順 → 新しい順", () => {
    expect(pickRelatedArticles({ id: "a", seriesSlug: "kyoku-wo-yomu", tags: ["極彩色", "2015年"] }, all).map((x) => x.id)).toEqual([
      "b",
      "e",
      "c",
    ]);
  });
  it("編集で指定した関連記事を先に出す", () => {
    expect(
      pickRelatedArticles({ id: "a", seriesSlug: "kyoku-wo-yomu", tags: ["極彩色"], relatedArticleIds: ["d"] }, all).map((x) => x.id)
    ).toEqual(["d", "b", "c"]);
  });
});
