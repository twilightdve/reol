import { buildArticlesFeed, feedArticles, type FeedArticle } from "../songArticles/feed";

const BUILT_AT = Date.parse("2026-10-23T00:00:00Z");
const base: FeedArticle = { slug: "a", title: "A", summary: null, publishedAt: "2026-10-01T00:00:00Z", tags: [], preview: false, unlisted: false };

describe("読みものの RSS フィード", () => {
  it("全体公開で公開日時を過ぎた記事だけを、新しい順に載せる", () => {
    const list = feedArticles(
      [
        { ...base, slug: "old", publishedAt: "2026-09-01T00:00:00Z" },
        { ...base, slug: "new", publishedAt: "2026-10-20T00:00:00Z" },
        { ...base, slug: "unlisted", unlisted: true, publishedAt: null },
        { ...base, slug: "preview", preview: true },
        { ...base, slug: "scheduled", publishedAt: "2026-11-01T00:00:00Z" },
      ],
      BUILT_AT
    );
    expect(list.map((a) => a.slug)).toEqual(["new", "old"]);
  });

  it("題名・要約・タグを XML として正しくエスケープし、絶対 URL で書く", () => {
    const xml = buildArticlesFeed({
      siteUrl: "https://example.com",
      description: "説明",
      builtAt: BUILT_AT,
      articles: [{ ...base, slug: "x", title: "A & B <C>", summary: "「要約」'", tags: ["極彩色"] }],
    });
    expect(xml).toContain("<title>A &amp; B &lt;C&gt;</title>");
    expect(xml).toContain("<description>「要約」&apos;</description>");
    expect(xml).toContain("<category>極彩色</category>");
    expect(xml).toContain('<guid isPermaLink="true">https://example.com/articles/x/</guid>');
    expect(xml).toContain('<atom:link href="https://example.com/articles/feed.xml" rel="self"');
    expect(xml).toContain("<pubDate>Thu, 01 Oct 2026 00:00:00 GMT</pubDate>");
  });
});
