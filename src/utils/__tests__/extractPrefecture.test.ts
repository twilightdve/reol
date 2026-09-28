import { extractPrefecture } from "../extractPrefecture";

describe("extractPrefecture", () => {
  it("住所から都道府県を取り出す", () => {
    expect(extractPrefecture("〒150-0041 東京都渋谷区神南", null).prefecture).toBe("東京都");
  });

  it("都道府県名がなくても政令市名から補う", () => {
    expect(extractPrefecture("福岡市中央区大名 1-3-36", null).prefecture).toBe("福岡県");
  });

  it("海外は国とサブ地域を返す", () => {
    const r = extractPrefecture("Seoul, Korea", null);
    expect(r.prefecture).toBeNull();
    expect(r.overseasRegion).toBe("韓国");
    expect(r.overseasSubRegion).toBe("Seoul");
  });

  it("手がかりがなければすべて null", () => {
    expect(extractPrefecture(null, null)).toEqual({
      prefecture: null,
      overseasRegion: null,
      overseasSubRegion: null,
    });
  });
});
