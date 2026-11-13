// 記録(kind: "record")の取込(plan/72)。
//
// .articles-local/records/<記事ID>/ に置いた原稿(body.md・media.json・meta.json)を検査して、
// 楽曲記事と同じ置き場 .articles-local/staging/<記事ID>/ に写す。ここまではどちらも git に入らない。
// プレビューは npm run articles:preview、公開は npm run articles:publish(楽曲記事と同じコマンド)。
//
// - body.md: 先頭の H1 が題名。写真・動画の置き場所は ```media ブロックで書く(src/utils/songArticles/markdown.ts)。
// - media.json: 写真・動画の定義(ID・画像のパスか YouTube の動画ID・alt・並び)と表紙。
// - meta.json: シリーズ・出来事の日付・関連リンクなど。initial は editorial.json を初めて作る時にだけ使う。
// - 本文・写真と動画の定義・画像の中身のどれかが変わると、版(bodyRevision)を1つ上げる。変わらなければ何も変えない。
// - editorial.json(slug・公開状態・要約・タグ・announce)は初回に雛形を置くだけで、2回目からは上書きしない。
//
// 使い方:
//   npm run articles:record -- --id record-fukuoka-place-20250216
//   npm run articles:record -- --all
//   npm run articles:record -- --id record-… --check     (書き込まずに検査だけ)

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { LOCAL_DIR, PUBLISHED_DIR, STAGING_DIR } from "../../src/utils/songArticles/load";
import { parseRecordMarkdown } from "../../src/utils/songArticles/markdown";
import { recordContentHash, recordProblems } from "../../src/utils/songArticles/recordCheck";
import {
  RecordArticleData,
  RecordArticleFile,
  RecordMediaFile,
  RecordRelatedLink,
  SongArticleEditorial,
} from "../../src/utils/songArticles/types";

export const RECORD_SOURCE_DIR = `${LOCAL_DIR}/records`;

/** meta.json(原稿のフォルダに置く) */
type RecordMeta = {
  seriesSlug: string;
  eventDate: string | null;
  eventDateEnd?: string | null;
  songRefs?: string[];
  relatedLinks?: RecordRelatedLink[];
  legacyPublishedAt?: string | null;
  /** editorial.json を初めて作る時の値。2回目からは使わない(slug などは editorial.json で決める) */
  initial?: { slug?: string | null; announce?: boolean; summary?: string | null; tags?: string[] };
};

const args = process.argv.slice(2);
const argValue = (name: string): string | null => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] ?? null : null;
};
const checkOnly = args.includes("--check");

const root = process.cwd();
const readJson = <T>(file: string): T => JSON.parse(fs.readFileSync(file, "utf8")) as T;
const writeJson = (file: string, value: unknown) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
const sha256 = (data: Buffer) => crypto.createHash("sha256").update(data).digest("hex");

const importOne = (id: string): boolean => {
  const src = path.join(root, RECORD_SOURCE_DIR, id);
  const staging = path.join(root, STAGING_DIR, id);
  const log = (message: string) => console.log(`[articles:record] ${id}: ${message}`);
  for (const name of ["body.md", "media.json", "meta.json"]) {
    if (!fs.existsSync(path.join(src, name))) {
      console.error(`[articles:record] ${id}: ${path.relative(root, path.join(src, name))} がありません`);
      return false;
    }
  }
  const body = fs.readFileSync(path.join(src, "body.md"));
  const media = readJson<RecordMediaFile>(path.join(src, "media.json"));
  const meta = readJson<RecordMeta>(path.join(src, "meta.json"));
  const parsed = parseRecordMarkdown(body.toString("utf8"));

  const fields = {
    seriesSlug: meta.seriesSlug,
    eventDate: meta.eventDate ?? null,
    eventDateEnd: meta.eventDateEnd ?? null,
    songRefs: meta.songRefs ?? [],
    relatedLinks: meta.relatedLinks ?? [],
    legacyPublishedAt: meta.legacyPublishedAt ?? null,
  };
  const contentSha256 = recordContentHash({ rootDir: root, body, media, data: fields });

  // 版: 前の取込・公開済みの版と内容が同じならそのまま、変わっていれば1つ上げる
  const previous = [path.join(staging, "article.json"), path.join(root, PUBLISHED_DIR, id, "article.json")]
    .filter((f) => fs.existsSync(f))
    .map((f) => readJson<RecordArticleData | RecordArticleFile>(f));
  const same = previous.find((p) => p.contentSha256 === contentSha256);
  const bodyRevision = same ? same.bodyRevision : Math.max(0, ...previous.map((p) => p.bodyRevision)) + 1;

  const data: RecordArticleData = {
    id,
    kind: "record",
    ...fields,
    bodyRevision,
    bodySha256: sha256(body),
    contentSha256,
  };
  const problems = recordProblems({ rootDir: root, article: data, body, parsed, media });
  if (problems.length > 0) {
    console.error(`[articles:record] ${id}: 取り込めません`);
    for (const p of problems) console.error(`  - ${p}`);
    return false;
  }

  const photos = media.items.filter((m) => m.type === "photo").length;
  const videos = media.items.length - photos;
  const stagedSame = fs.existsSync(path.join(staging, "article.json")) && readJson<RecordArticleData>(path.join(staging, "article.json")).contentSha256 === contentSha256;
  log(`「${parsed.title}」 写真${photos}枚・動画${videos}本・版${bodyRevision}${stagedSame ? "(前の取込から変更なし)" : ""}`);
  if (checkOnly) {
    log("検査だけ行いました(--check)。書き込んでいません");
    return true;
  }

  fs.mkdirSync(staging, { recursive: true });
  fs.writeFileSync(path.join(staging, "body.md"), body);
  writeJson(path.join(staging, "media.json"), media);
  writeJson(path.join(staging, "article.json"), data);
  const editorialFile = path.join(staging, "editorial.json");
  if (!fs.existsSync(editorialFile)) {
    const editorial: SongArticleEditorial = {
      slug: meta.initial?.slug ?? id.replace(/^record-/, ""),
      slugProposed: true,
      status: "review",
      summary: meta.initial?.summary ?? null,
      versionLabel: null,
      createdAt: new Date().toISOString(),
      tags: meta.initial?.tags ?? [],
      publishedAt: null,
      updatedAt: null,
      relatedArticleIds: [],
      ...(meta.initial?.announce === false ? { announce: false } : {}),
    };
    writeJson(editorialFile, editorial);
    log(`editorial.json の雛形を置きました(slug は提案「${editorial.slug}」。決めたら slugProposed を false に)`);
  }
  log(`${path.relative(root, staging)} に置きました。npm run articles:preview で確認し、公開は npm run articles:publish -- --id ${id} --revision ${bodyRevision}`);
  return true;
};

const main = () => {
  const sourceRoot = path.join(root, RECORD_SOURCE_DIR);
  const ids = args.includes("--all")
    ? fs.existsSync(sourceRoot)
      ? fs.readdirSync(sourceRoot, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
      : []
    : [argValue("--id")].filter((x): x is string => Boolean(x));
  if (ids.length === 0) {
    console.error("[articles:record] --id <記事ID> か --all を指定してください");
    process.exit(1);
  }
  const ok = ids.map(importOne);
  if (ok.includes(false)) process.exit(1);
};

if (require.main === module) main();
