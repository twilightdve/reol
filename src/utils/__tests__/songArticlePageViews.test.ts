import { articlePageViews } from "../songArticles/pageviews";

describe("記事の表示回数(plan/46)", () => {
  const file = {
    fetchedAt: "2026-10-18T00:00:00.000Z",
    views: { akayoroshi: { "2026-10-15": 7, "2026-10-16": 3, "2026-10-17": 5 } },
  };

  it("公開日(日本時間)以降の日だけを足す。限定公開で確認していた日は数えない", () => {
    // 2026-10-15T15:30Z は日本時間 10/16 0:30
    expect(articlePageViews(file, "akayoroshi", "2026-10-15T15:30:00.000Z")).toBe(8);
    expect(articlePageViews(file, "akayoroshi", "2026-10-15T14:59:00.000Z")).toBe(15);
  });

  it("まだ表示の無い記事は 0", () => {
    expect(articlePageViews(file, "karuto", "2026-10-16T00:00:00.000Z")).toBe(0);
  });

  it("ファイルが無い時・公開日時の無い記事は null(数を出さない)", () => {
    expect(articlePageViews(null, "akayoroshi", "2026-10-16T00:00:00.000Z")).toBeNull();
    expect(articlePageViews(file, "akayoroshi", null)).toBeNull();
  });
});
