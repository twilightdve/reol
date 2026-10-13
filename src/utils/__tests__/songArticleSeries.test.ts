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

import { pickRelatedArticles, RelatedCandidate, showSongKicker, splitTitleBySong } from "../songArticles/series";

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

describe("showSongKicker", () => {
  it("題名に曲名が入っていれば出さない(前・後ろ・大文字小文字違い)", () => {
    expect(showSongKicker("MONSTER 欲しがる「僕ら」の危うさ", "MONSTER")).toBe(false);
    expect(showSongKicker("松本凱旋から読み直すNo title", "No title")).toBe(false);
    expect(showSongKicker("1ldk――イヤフォンの向こうにいた人", "1LDK")).toBe(false);
  });
  it("曲名の末尾の括弧書き(feat. など)は外して比べる", () => {
    expect(showSongKicker("雨降りの日に聴きたいdrop pop candy", "drop pop candy (feat. ギガ)")).toBe(false);
    expect(showSongKicker("雨の歌", "drop pop candy (feat. ギガ)")).toBe(true);
  });
  it("題名に曲名が無ければ出す", () => {
    expect(showSongKicker("クラップに歌声が重なる", "Boy")).toBe(true);
  });
});

describe("splitTitleBySong", () => {
  it("題名の中の曲名の位置を返す(題名の文字はそのまま)", () => {
    expect(splitTitleBySong("雨降りの日に聴きたいdrop pop candy", "drop pop candy (feat. ギガ)")).toEqual({
      before: "雨降りの日に聴きたい",
      song: "drop pop candy",
      after: "",
    });
    expect(splitTitleBySong("1LDK――イヤフォンの向こうにいた人", "1LDK")).toEqual({ before: "", song: "1LDK", after: "――イヤフォンの向こうにいた人" });
    expect(splitTitleBySong("松本凱旋から読み直すno title", "No title")?.song).toBe("no title");
  });
  it("曲名が無ければ null", () => {
    expect(splitTitleBySong("雨の歌", "drop pop candy")).toBeNull();
  });
});
