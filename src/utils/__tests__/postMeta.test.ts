import { classifyPostHandle, parsePostEmbedHtml, relativeDate } from "../postMeta";

describe("parsePostEmbedHtml", () => {
  it("埋め込みHTMLからハンドル・表示名・投稿日を取り出す", () => {
    const html =
      '<blockquote><p>text</p>&mdash; Reol (@RRReol) <a href="https://twitter.com/RRReol/status/123?ref_src=x">August 15, 2024</a></blockquote>';
    expect(parsePostEmbedHtml(html)).toEqual({ handle: "RRReol", displayName: "Reol", postedAt: "2024-08-15" });
  });
});

describe("classifyPostHandle", () => {
  it("確認済みのハンドルだけを分類する(大文字小文字は区別しない)", () => {
    expect(classifyPostHandle("RRReol")).toBe("本人");
    expect(classifyPostHandle("reol_info")).toBe("公式");
    expect(classifyPostHandle("someone")).toBe("その他");
    expect(classifyPostHandle(null)).toBe("その他");
  });
});

describe("relativeDate", () => {
  it("当日・日・月・年の単位で差を返す", () => {
    expect(relativeDate("2024-08-17", "2024-08-17")).toEqual({ unit: "same" });
    expect(relativeDate("2024-08-15", "2024-08-17")).toEqual({ unit: "day", amount: 2, direction: "before" });
    expect(relativeDate("2024-08-18", "2024-08-17")).toEqual({ unit: "day", amount: 1, direction: "after" });
    expect(relativeDate("2024-05-17", "2024-08-17")).toEqual({ unit: "month", amount: 3, direction: "before" });
    expect(relativeDate("2026-08-17", "2024-08-17")).toEqual({ unit: "year", amount: 2, direction: "after" });
  });

  it("基準が期間表記(ツアー)なら最初の日付を使い、不正なら null", () => {
    expect(relativeDate("2025-04-18", "2025-04-18〜2025-04-20")).toEqual({ unit: "same" });
    expect(relativeDate(null, "2024-08-17")).toBeNull();
    expect(relativeDate("2024-08-17", "未定")).toBeNull();
  });
});
