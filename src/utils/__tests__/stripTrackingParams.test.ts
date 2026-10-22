import { stripTrackingParams } from "../stripTrackingParams";

describe("stripTrackingParams", () => {
  it("utm_* だけを外す", () => {
    expect(stripTrackingParams("https://shibuya-o.com/east/?utm_source=business-profile&utm_medium=listing")).toBe("https://shibuya-o.com/east/");
    expect(stripTrackingParams("https://example.com/a?id=3&utm_source=x#top")).toBe("https://example.com/a?id=3#top");
  });
  it("utm_* が無ければ元の文字列のまま", () => {
    expect(stripTrackingParams("https://example.com/a?id=3")).toBe("https://example.com/a?id=3");
  });
  it("URL として読めなければそのまま", () => {
    expect(stripTrackingParams("会場サイト")).toBe("会場サイト");
  });
});
