import { articlePageViews } from "../songArticles/pageviews";

describe("記事の表示回数(plan/46)", () => {
  const file = {
    fetchedAt: "2026-10-18T00:00:00.000Z",
    views: { akayoroshi: { "2026-10-15": 7, "2026-10-16": 3, "2026-10-17": 5 } },
  };

  it("日付だけの古い記録: 公開した日の翌日以降だけを足す", () => {
    // 2026-10-15T15:30Z は日本時間 10/16 0:30 → 10/17 だけ
    expect(articlePageViews(file, "akayoroshi", "2026-10-15T15:30:00.000Z")).toBe(5);
    // 2026-10-15T14:59Z は日本時間 10/15 23:59 → 10/16・10/17
    expect(articlePageViews(file, "akayoroshi", "2026-10-15T14:59:00.000Z")).toBe(8);
  });

  it("分ごとの記録は、公開日時(日本時間・分単位)以降だけを足す。公開した日の公開前の確認は数えない", () => {
    const byMinute = {
      fetchedAt: "2026-10-23T12:00:00.000Z",
      views: { "seimei-sen": { "2026-10-23T10:05": 30, "2026-10-23T19:24": 1, "2026-10-23T19:25": 2, "2026-10-24T08:00": 4 } },
    };
    // 2026-10-23T10:25Z は日本時間 10/23 19:25
    expect(articlePageViews(byMinute, "seimei-sen", "2026-10-23T10:25:10.000Z")).toBe(6);
  });

  it("日付だけの古い記録は、公開した日を数えず翌日から", () => {
    expect(articlePageViews(file, "akayoroshi", "2026-10-16T03:00:00.000Z")).toBe(5);
  });

  it("まだ表示の無い記事は 0", () => {
    expect(articlePageViews(file, "karuto", "2026-10-16T00:00:00.000Z")).toBe(0);
  });

  it("ファイルが無い時・公開日時の無い記事は null(数を出さない)", () => {
    expect(articlePageViews(null, "akayoroshi", "2026-10-16T00:00:00.000Z")).toBeNull();
    expect(articlePageViews(file, "akayoroshi", null)).toBeNull();
  });
});
