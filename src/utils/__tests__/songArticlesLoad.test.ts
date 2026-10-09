/**
 * @jest-environment node
 */
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { loadSongArticles, PUBLISHED_DIR, STAGING_DIR } from "../songArticles/load";
import { buildArticle } from "../jsonLd";

// 実在する原稿は使わず、一時ディレクトリに小さな検証用データを置く(設計書11章)

const data = (id: string) => ({
  id,
  kind: "song",
  songTitle: `曲${id}`,
  bodyRevision: 1,
  formatRevision: 1,
  bodySha256: "x",
  songRefs: [],
  media: [],
});
const editorial = (slug: string, status: string) => ({
  slug,
  slugProposed: false,
  status,
  summary: null,
  versionLabel: null,
  publishedAt: status === "published" ? "2026-10-10T00:00:00+09:00" : null,
  updatedAt: null,
  relatedArticleIds: [],
});

const writeArticle = (dir: string, files: Record<string, unknown>, body: string) => {
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, value] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), JSON.stringify(value));
  }
  fs.writeFileSync(path.join(dir, "body.md"), body);
};

describe("loadSongArticles", () => {
  let root: string;
  const env = process.env.ARTICLES_PREVIEW;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "song-articles-"));
    // 公開済み1件・公開前(review)1件を content/articles に、同じ記事の新しい版と未公開記事を staging に置く
    writeArticle(
      path.join(root, PUBLISHED_DIR, "a1"),
      { "article.json": { ...data("a1"), ...editorial("one", "published") } },
      "# 公開版の題\n\n本文\n"
    );
    writeArticle(
      path.join(root, PUBLISHED_DIR, "a2"),
      { "article.json": { ...data("a2"), ...editorial("two", "review") } },
      "# 公開前\n\n本文\n"
    );
    writeArticle(
      path.join(root, STAGING_DIR, "a1"),
      { "article.json": data("a1"), "editorial.json": editorial("one", "review") },
      "# 次の版の題\n\n本文\n"
    );
    writeArticle(
      path.join(root, STAGING_DIR, "a3"),
      { "article.json": data("a3"), "editorial.json": editorial("three", "review") },
      "# 未公開記事\n\n本文\n"
    );
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    if (env === undefined) delete process.env.ARTICLES_PREVIEW;
    else process.env.ARTICLES_PREVIEW = env;
  });

  it("通常ビルドでは status が published の記事だけを読む(staging は読まない)", () => {
    delete process.env.ARTICLES_PREVIEW;
    const loaded = loadSongArticles(root);
    expect(loaded.map((a) => a.article.id)).toEqual(["a1"]);
    expect(loaded[0].preview).toBe(false);
    expect(loaded[0].parsed.title).toBe("公開版の題");
  });

  it("プレビューでは staging も読むが、公開済みの記事は公開版を優先する", () => {
    process.env.ARTICLES_PREVIEW = "1";
    const loaded = loadSongArticles(root);
    expect(loaded.map((a) => [a.article.id, a.preview, a.parsed.title])).toEqual([
      ["a1", false, "公開版の題"],
      ["a3", true, "未公開記事"],
    ]);
    // staging は article.json と editorial.json を合わせて読む
    expect(loaded[1].article.slug).toBe("three");
  });

  it("slug が重複したら止める", () => {
    process.env.ARTICLES_PREVIEW = "1";
    fs.writeFileSync(
      path.join(root, STAGING_DIR, "a3", "editorial.json"),
      JSON.stringify(editorial("one", "review"))
    );
    expect(() => loadSongArticles(root)).toThrow(/重複/);
  });

  it("本文に未対応の要素があれば止める", () => {
    delete process.env.ARTICLES_PREVIEW;
    fs.writeFileSync(path.join(root, PUBLISHED_DIR, "a1", "body.md"), "# A\n\n# B\n");
    expect(() => loadSongArticles(root)).toThrow(/a1/);
  });

  it("フォルダが無ければ0件", () => {
    delete process.env.ARTICLES_PREVIEW;
    expect(loadSongArticles(path.join(root, "none"))).toEqual([]);
  });
});

describe("buildArticle", () => {
  it("画面と同じ値で Article を作り、未確定の著者は出さない", () => {
    const ld = buildArticle({
      headline: "題",
      path: "/articles/x/",
      description: "説明",
      datePublished: "2026-10-10T00:00:00+09:00",
      dateModified: null,
      songName: "曲",
    });
    expect(ld).toMatchObject({
      "@type": "Article",
      headline: "題",
      url: "https://reol.twilightea.com/articles/x/",
      inLanguage: "ja",
      datePublished: "2026-10-10T00:00:00+09:00",
      about: { "@type": "MusicRecording", name: "曲" },
    });
    expect(ld).not.toHaveProperty("author");
    expect(ld).not.toHaveProperty("dateModified");
  });
});
