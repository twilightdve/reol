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
