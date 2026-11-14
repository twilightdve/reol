/**
 * @jest-environment node
 */
import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { feedArticles, type FeedArticle } from "../songArticles/feed";
import { formatEventDate } from "../songArticles/format";
import { loadRecordArticles, loadSongArticles, PUBLISHED_DIR, STAGING_DIR } from "../songArticles/load";
import { parseRecordMarkdown, recordMediaRefs, recordTextBlocks } from "../songArticles/markdown";
import { recordContentHash, recordProblems } from "../songArticles/recordCheck";
import { recordCoverPaths } from "../songArticles/recordMedia";
import { RECORD_LINK_QUOTE_MAX } from "../songArticles/types";
import type { RecordArticleData, RecordMediaFile } from "../songArticles/types";

// 記録(kind: "record"。plan/72)。実在する原稿・写真は使わず、一時ディレクトリに小さな検証用データを置く

const BODY = [
  "# 記録の題",
  "",
  "最初の段落。",
  "",
  "```media",
  '{ "type": "photo", "id": "p1" }',
  "```",
  "",
  "## 見出し",
  "",
  "```media",
  '{ "type": "gallery", "ids": ["p2", "v1"] }',
  "```",
  "",
].join("\n");

const MEDIA: RecordMediaFile = {
  cover: "p1",
  items: [
    { id: "p1", type: "photo", src: "src/images/test/one.webp", alt: "1枚目の写真" },
    { id: "p2", type: "photo", src: "src/images/test/two.webp", alt: "2枚目の写真" },
    { id: "v1", type: "youtube", videoId: "abcdefghijk", vertical: true, title: "動画" },
  ],
};

const FIELDS = {
  seriesSlug: "live-to-ensei-no-kiroku",
  eventDate: "2025-02-16",
  eventDateEnd: null,
  songRefs: [],
  relatedLinks: [{ label: "公演のページ", href: "/live/example/" }],
  legacyPublishedAt: null,
};

const sha256 = (v: string | Buffer) => crypto.createHash("sha256").update(v).digest("hex");

const writeImages = (root: string) => {
  fs.mkdirSync(path.join(root, "src/images/test"), { recursive: true });
  fs.writeFileSync(path.join(root, "src/images/test/one.webp"), "one");
  fs.writeFileSync(path.join(root, "src/images/test/two.webp"), "two");
};

const recordData = (root: string, id: string, body = BODY, media = MEDIA, fields = FIELDS): RecordArticleData => ({
  id,
  kind: "record",
  ...fields,
  bodyRevision: 1,
  bodySha256: sha256(body),
  contentSha256: recordContentHash({ rootDir: root, body, media, data: fields }),
});

const editorial = (slug: string, status: string, extra: object = {}) => ({
  slug,
  slugProposed: false,
  status,
  summary: null,
  versionLabel: null,
  createdAt: "2026-11-13T00:00:00.000Z",
  tags: [],
  publishedAt: status === "published" ? "2026-11-13T00:00:00+09:00" : null,
  updatedAt: null,
  relatedArticleIds: [],
  ...extra,
});

const writeDir = (dir: string, files: Record<string, unknown>, body: string) => {
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, value] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), JSON.stringify(value));
  fs.writeFileSync(path.join(dir, "body.md"), body);
};

describe("記録の本文(media ブロック)", () => {
  it("photo・gallery を本文の位置のまま読み、文章は楽曲記事と同じブロックになる", () => {
    const parsed = parseRecordMarkdown(BODY);
    expect(parsed.problems).toEqual([]);
    expect(parsed.title).toBe("記録の題");
    expect(parsed.blocks.map((b) => b.t)).toEqual(["p", "media", "h", "media"]);
    expect(recordMediaRefs(parsed.blocks)).toEqual(["p1", "p2", "v1"]);
    expect(recordTextBlocks(parsed.blocks).map((b) => b.t)).toEqual(["p", "h"]);
  });

  it("形の違う media ブロック・読めない JSON・余分なキーは問題として積む", () => {
    const bad = (json: string) => parseRecordMarkdown(`# 題\n\n\`\`\`media\n${json}\n\`\`\`\n`).problems;
    expect(bad('{ "type": "photo" }')).toHaveLength(1);
    expect(bad('{ "type": "gallery", "ids": ["p1"] }')).toHaveLength(1);
    expect(bad('{ "type": "photo", "id": "p1", "src": "src/images/x.webp" }')).toHaveLength(1);
    expect(bad('{ "type": "photo", "id": "../p1" }')).toHaveLength(1);
    expect(bad("{ type: photo }")).toHaveLength(1);
  });

  it("生の HTML は書けない", () => {
    expect(parseRecordMarkdown('# 題\n\n<img src="x.webp">\n').problems.length).toBeGreaterThan(0);
  });
});

describe("記録の検査とハッシュ", () => {
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "record-check-"));
    writeImages(root);
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  const problems = (over: { body?: string; media?: RecordMediaFile; fields?: typeof FIELDS; article?: Partial<RecordArticleData> } = {}) => {
    const body = over.body ?? BODY;
    const media = over.media ?? MEDIA;
    const article = { ...recordData(root, "record-test", body, media, over.fields ?? FIELDS), ...over.article };
    return recordProblems({ rootDir: root, article, body, parsed: parseRecordMarkdown(body), media });
  };

  it("そろった記録は問題なし", () => {
    expect(problems()).toEqual([]);
  });

  it("本文・写真の定義・画像の中身のどれが変わっても、ハッシュが変わる", () => {
    const hash = (body = BODY, media = MEDIA) => recordContentHash({ rootDir: root, body, media, data: FIELDS });
    const before = hash();
    expect(hash(BODY + "\n追記。\n")).not.toBe(before);
    expect(hash(BODY, { ...MEDIA, items: MEDIA.items.map((m) => (m.id === "p1" ? { ...m, alt: "別の説明" } : m)) })).not.toBe(before);
    expect(hash(BODY, { ...MEDIA, cover: "p2" })).not.toBe(before);
    fs.writeFileSync(path.join(root, "src/images/test/one.webp"), "changed");
    expect(hash()).not.toBe(before);
  });

  it("キーの順や、null と未指定の違いではハッシュが変わらない", () => {
    const a = recordContentHash({ rootDir: root, body: BODY, media: MEDIA, data: FIELDS });
    const reordered: RecordMediaFile = { items: MEDIA.items.map((m) => ({ ...m, caption: undefined })), cover: "p1" };
    expect(recordContentHash({ rootDir: root, body: BODY, media: reordered, data: { ...FIELDS, eventDateEnd: undefined } })).toBe(a);
  });

  it("取込の後で画像が変わると、取込し直すまで通らない", () => {
    const article = recordData(root, "record-test");
    fs.writeFileSync(path.join(root, "src/images/test/two.webp"), "changed");
    const found = recordProblems({ rootDir: root, article, body: BODY, parsed: parseRecordMarkdown(BODY), media: MEDIA });
    expect(found).toHaveLength(1);
    expect(found[0]).toContain("取込時から変わっています");
  });

  it("定義した写真・動画は、本文のちょうど1か所に置く", () => {
    const extra: RecordMediaFile = { ...MEDIA, items: [...MEDIA.items, { id: "p3", type: "photo", src: "src/images/test/two.webp", alt: "3枚目" }] };
    expect(problems({ media: extra }).join("\n")).toContain("本文に置かれていない写真・動画があります: p3");
    const twice = BODY + '\n```media\n{ "type": "photo", "id": "p1" }\n```\n';
    expect(problems({ body: twice }).join("\n")).toContain("同じ写真・動画を 2 回参照しています: p1");
    const unknown = BODY + '\n```media\n{ "type": "photo", "id": "p9" }\n```\n';
    expect(problems({ body: unknown }).join("\n")).toContain("定義の無い写真・動画を参照しています: p9");
  });

  it("画像は src/images/ の中だけ。alt の無い写真・表紙にできないものも止める", () => {
    const withItem = (item: RecordMediaFile["items"][number]): RecordMediaFile => ({ ...MEDIA, items: [item, ...MEDIA.items.slice(1)] });
    expect(problems({ media: withItem({ id: "p1", type: "photo", src: "static/data/x.webp", alt: "a" }) }).join("\n")).toContain("src/images/ の中");
    expect(problems({ media: withItem({ id: "p1", type: "photo", src: "src/images/../secret.webp", alt: "a" }) }).join("\n")).toContain("src/images/ の中");
    expect(problems({ media: withItem({ id: "p1", type: "photo", src: "src/images/test/none.webp", alt: "a" }) }).join("\n")).toContain("画像がありません");
    expect(problems({ media: withItem({ id: "p1", type: "photo", src: "src/images/test/one.webp", alt: " " }) }).join("\n")).toContain("代替テキスト");
    expect(problems({ media: { ...MEDIA, cover: "v1" } }).join("\n")).toContain("表紙(cover)は記事の中の写真");
  });

  it("計測用のパラメータの付いたリンク・登録の無いシリーズ・形の違う ID と日付を止める", () => {
    const link = (href: string) => problems({ fields: { ...FIELDS, relatedLinks: [{ label: "地図", href }] } }).join("\n");
    expect(link("https://maps.app.goo.gl/abc?g_st=ic")).toContain("計測用のパラメータ");
    expect(link("https://example.com/?utm_source=x")).toContain("計測用のパラメータ");
    expect(link("javascript:alert(1)")).toContain("行き先が違います");
    expect(problems({ body: BODY + "\n[店](https://example.com/?igsh=abc)\n" }).join("\n")).toContain("本文のリンクに計測用のパラメータ");
    expect(problems({ fields: { ...FIELDS, seriesSlug: "nai" } }).join("\n")).toContain("登録されていないシリーズ");
    expect(problems({ fields: { ...FIELDS, eventDate: "2025/02/16" } }).join("\n")).toContain("eventDate の形が違います");
    expect(problems({ article: { id: "Record_1" } }).join("\n")).toContain("記事IDの形が違います");
  });

  it("関連リンクの書き出し(quote)は版に数えない。改行と長すぎるものは止める", () => {
    const withQuote = (quote: string) => ({ ...FIELDS, relatedLinks: [{ label: "Reol の投稿(2025年2月16日)", href: "https://x.com/a/status/1", quote }] });
    const hash = (fields: typeof FIELDS) => recordContentHash({ rootDir: root, body: BODY, media: MEDIA, data: fields });
    const plain = { ...FIELDS, relatedLinks: [{ label: "Reol の投稿(2025年2月16日)", href: "https://x.com/a/status/1" }] };
    expect(hash(withQuote("投稿の書き出し"))).toBe(hash(plain));
    expect(problems({ fields: withQuote("投稿の書き出し") })).toEqual([]);
    expect(problems({ fields: withQuote("1行目\n2行目") }).join("\n")).toContain("改行のない文字");
    expect(problems({ fields: withQuote("あ".repeat(RECORD_LINK_QUOTE_MAX)) })).toEqual([]);
    expect(problems({ fields: withQuote("あ".repeat(RECORD_LINK_QUOTE_MAX + 1)) }).join("\n")).toContain("文字までです");
  });
});

describe("loadRecordArticles", () => {
  let root: string;
  const env = process.env.ARTICLES_PREVIEW;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "record-load-"));
    writeImages(root);
    // 公開済みの記録1件と楽曲記事1件を content/articles に、未公開の記録と下書きを staging に置く
    writeDir(
      path.join(root, PUBLISHED_DIR, "record-one"),
      { "article.json": { ...recordData(root, "record-one"), ...editorial("one", "published", { announce: false }) }, "media.json": MEDIA },
      BODY
    );
    writeDir(
      path.join(root, PUBLISHED_DIR, "song-1"),
      {
        "article.json": {
          id: "song-1",
          kind: "song",
          songTitle: "曲",
          bodyRevision: 1,
          formatRevision: 1,
          bodySha256: "x",
          songRefs: [],
          media: [],
          ...editorial("song", "published"),
        },
      },
      "# 楽曲記事\n\n本文\n"
    );
    writeDir(
      path.join(root, STAGING_DIR, "record-two"),
      { "article.json": recordData(root, "record-two"), "editorial.json": editorial("two", "review"), "media.json": MEDIA },
      BODY
    );
    writeDir(
      path.join(root, STAGING_DIR, "record-draft"),
      { "article.json": recordData(root, "record-draft"), "editorial.json": editorial("draft", "draft"), "media.json": MEDIA },
      BODY
    );
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    if (env === undefined) delete process.env.ARTICLES_PREVIEW;
    else process.env.ARTICLES_PREVIEW = env;
  });

  it("通常ビルドでは公開済みの記録だけを読む(staging は読まない)", () => {
    delete process.env.ARTICLES_PREVIEW;
    const loaded = loadRecordArticles(root);
    expect(loaded.map((a) => a.article.id)).toEqual(["record-one"]);
    expect(loaded[0].preview).toBe(false);
    expect(loaded[0].article.announce).toBe(false);
    expect(loaded[0].parsed.title).toBe("記録の題");
  });

  it("プレビューでは staging の記録も読む(下書きは読まない)", () => {
    process.env.ARTICLES_PREVIEW = "1";
    const loaded = loadRecordArticles(root);
    expect(loaded.map((a) => a.article.id).sort()).toEqual(["record-one", "record-two"]);
    expect(loaded.find((a) => a.article.id === "record-two")?.preview).toBe(true);
  });

  it("楽曲記事の読み込みは記録を読まず、記録の読み込みは楽曲記事を読まない", () => {
    process.env.ARTICLES_PREVIEW = "1";
    expect(loadSongArticles(root).map((a) => a.article.id)).toEqual(["song-1"]);
    expect(loadRecordArticles(root).every((a) => a.article.kind === "record")).toBe(true);
  });

  it("slug が楽曲記事・ガイドと重なれば止まる", () => {
    delete process.env.ARTICLES_PREVIEW;
    expect(() => loadRecordArticles(root, new Map([["one", "song-1"]]))).toThrow(/slug "one" が song-1 と record-one で重複/);
  });

  it("確認した版から中身が変わっていれば、ビルドを止める", () => {
    delete process.env.ARTICLES_PREVIEW;
    fs.writeFileSync(path.join(root, PUBLISHED_DIR, "record-one", "body.md"), BODY + "\n書き足し。\n");
    expect(() => loadRecordArticles(root)).toThrow(/record-one を読み込めません/);
  });
});

describe("記録の表示まわり", () => {
  it("出来事の日付: 1日・同じ月の複数日・月や年をまたぐ日", () => {
    expect(formatEventDate("2025-02-16")).toBe("2025年2月16日");
    expect(formatEventDate("2025-02-15", "2025-02-16")).toBe("2025年2月15日〜16日");
    expect(formatEventDate("2025-02-28", "2025-03-01")).toBe("2025年2月28日〜3月1日");
    expect(formatEventDate("2025-12-31", "2026-01-01")).toBe("2025年12月31日〜2026年1月1日");
    expect(formatEventDate("2025-02-16", "2025-02-16")).toBe("2025年2月16日");
    expect(formatEventDate(null)).toBeNull();
    expect(formatEventDate("2025/02/16")).toBeNull();
  });

  it("announce が false の記事は RSS に載せない(未指定は載せる)", () => {
    const base: FeedArticle = { slug: "a", title: "A", summary: null, publishedAt: "2026-10-01T00:00:00Z", tags: [], preview: false, unlisted: false };
    const list = feedArticles(
      [
        { ...base, slug: "default" },
        { ...base, slug: "announced", announce: true },
        { ...base, slug: "migrated", announce: false },
      ],
      Date.parse("2026-10-23T00:00:00Z")
    );
    expect(list.map((a) => a.slug).sort()).toEqual(["announced", "default"]);
  });

  it("表紙の URL は slug と内容のハッシュから決まり、表紙も動画も無ければ null", () => {
    expect(recordCoverPaths("one", "0123456789abcdef", { cover: "p1", items: [] })).toEqual({
      cover: "/articles-media/one/cover-01234567.jpg",
      ogImage: "/articles-media/one/og-01234567.jpg",
    });
    expect(recordCoverPaths("one", "0123456789abcdef", { cover: null, items: [] })).toEqual({ cover: null, ogImage: null });
  });

  it("表紙の写真が無く動画がある記録は、動画のサムネイルを一覧のカードに出す(横の動画を先に選ぶ)", () => {
    const tate = { id: "v1", type: "youtube" as const, videoId: "aaaaaaaaaaa", vertical: true, title: "縦" };
    const yoko = { id: "v2", type: "youtube" as const, videoId: "bbbbbbbbbbb", title: "横" };
    expect(recordCoverPaths("one", "0123456789abcdef", { cover: null, items: [tate, yoko] })).toEqual({
      cover: "https://i.ytimg.com/vi/bbbbbbbbbbb/hqdefault.jpg",
      ogImage: null,
    });
    expect(recordCoverPaths("one", "0123456789abcdef", { cover: null, items: [tate] })).toEqual({
      cover: "https://i.ytimg.com/vi/aaaaaaaaaaa/sddefault.jpg",
      ogImage: null,
    });
  });
});
