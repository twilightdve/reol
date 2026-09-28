import { availableLangsFor, isLocalizedRoute, localizePath, stripLangPrefix } from "../i18nRoutes";

describe("stripLangPrefix", () => {
  it("言語プレフィックスを取り除いて言語と日本語側のパスを返す", () => {
    expect(stripLangPrefix("/en/live/")).toEqual({ lang: "en", path: "/live/" });
    expect(stripLangPrefix("/zh-hant/songs/stats/")).toEqual({ lang: "zh-hant", path: "/songs/stats/" });
    expect(stripLangPrefix("/ko")).toEqual({ lang: "ko", path: "/" });
  });

  it("日本語のパスや言語ではないプレフィックスはそのまま日本語として扱う", () => {
    expect(stripLangPrefix("/live/")).toEqual({ lang: "ja", path: "/live/" });
    expect(stripLangPrefix("/ja/live/")).toEqual({ lang: "ja", path: "/ja/live/" });
    expect(stripLangPrefix("/fr/live/")).toEqual({ lang: "ja", path: "/fr/live/" });
  });
});

describe("isLocalizedRoute", () => {
  it("翻訳済みのルート(完全一致・パターン)を判定する", () => {
    expect(isLocalizedRoute("/")).toBe(true);
    expect(isLocalizedRoute("/songs/some-slug/")).toBe(true);
    expect(isLocalizedRoute("/on-this-day/09-28/")).toBe(true);
    expect(isLocalizedRoute("/quiz/reol-type/types/fgsa/")).toBe(true);
    expect(isLocalizedRoute("/live")).toBe(true); // 末尾スラッシュなしも同じ扱い
  });

  it("未翻訳のルートは false", () => {
    expect(isLocalizedRoute("/bijigaku-navi/")).toBe(false);
    expect(isLocalizedRoute("/relive/")).toBe(false);
  });
});

describe("localizePath", () => {
  it("翻訳済みのルートは言語プレフィックスを付け、クエリとハッシュを保つ", () => {
    expect(localizePath("/live/compare/?from=a&to=b", "en")).toBe("/en/live/compare/?from=a&to=b");
    expect(localizePath("/discography/#disc-x", "ko")).toBe("/ko/discography/#disc-x");
  });

  it("日本語・未翻訳のルート・外部URLはプレフィックスを付けない", () => {
    expect(localizePath("/live/", "ja")).toBe("/live/");
    expect(localizePath("/bijigaku-navi/", "en")).toBe("/bijigaku-navi/");
    expect(localizePath("https://reol.jp/", "en")).toBe("https://reol.jp/");
  });

  it("別の言語のURLを渡しても指定の言語に付け替える", () => {
    expect(localizePath("/en/live/", "zh-hans")).toBe("/zh-hans/live/");
    expect(localizePath("/en/live/", "ja")).toBe("/live/");
  });
});

describe("availableLangsFor", () => {
  it("翻訳済みなら全言語、未翻訳なら日本語だけ", () => {
    expect(availableLangsFor("/live/")).toEqual(["ja", "en", "zh-hant", "zh-hans", "ko"]);
    expect(availableLangsFor("/relive/")).toEqual(["ja"]);
  });
});
