/**
 * ビルド時に楽曲記事を読み込む(gatsby-node.ts から使う)。
 *
 * - 通常ビルド: content/articles/<id>/ のうち status が "published" と "unlisted"(限定公開。plan/43)のもの。
 * - ARTICLES_PREVIEW=1: 加えて .articles-local/staging/<id>/ も読む(ローカル確認用)。
 *   プレビュー記事は noindex で、デプロイ前検査(scripts/check-deploy-ready.ts)が止める。
 */
import * as fs from "fs";
import * as path from "path";
import {
  RecordArticleData,
  RecordArticleFile,
  RecordMediaFile,
  SongArticleData,
  SongArticleEditorial,
  SongArticleFile,
} from "./types";
import { ParsedArticle, ParsedRecord, parseArticleMarkdown, parseRecordMarkdown } from "./markdown";
import { recordProblems } from "./recordCheck";

export const PUBLISHED_DIR = "content/articles";
export const LOCAL_DIR = ".articles-local";
export const STAGING_DIR = `${LOCAL_DIR}/staging`;

export const isArticlesPreview = (): boolean => process.env.ARTICLES_PREVIEW === "1";

export type LoadedSongArticle = {
  article: SongArticleFile;
  parsed: ParsedArticle;
  /** staging から読んだプレビュー記事か */
  preview: boolean;
};

const readJson = <T>(file: string): T => JSON.parse(fs.readFileSync(file, "utf8")) as T;

const listDirs = (root: string): string[] =>
  fs.existsSync(root)
    ? fs
        .readdirSync(root, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => path.join(root, d.name))
    : [];

/** 記録(kind: "record")のフォルダか。記録は楽曲記事とは別の読み込み(loadRecordArticles)で扱う(plan/72) */
const isRecordDir = (dir: string): boolean => {
  const file = path.join(dir, "article.json");
  return fs.existsSync(file) && readJson<{ kind?: string }>(file).kind === "record";
};

const loadDir = (dir: string, preview: boolean): LoadedSongArticle => {
  const article: SongArticleFile = preview
    ? {
        ...readJson<SongArticleData>(path.join(dir, "article.json")),
        ...readJson<SongArticleEditorial>(path.join(dir, "editorial.json")),
      }
    : readJson<SongArticleFile>(path.join(dir, "article.json"));
  const parsed = parseArticleMarkdown(fs.readFileSync(path.join(dir, "body.md"), "utf8"));
  if (parsed.problems.length > 0) {
    throw new Error(`[articles] ${article.id} の本文に未対応の要素があります: ${parsed.problems.join(" / ")}`);
  }
  return { article, parsed, preview };
};

export const loadSongArticles = (rootDir: string): LoadedSongArticle[] => {
  const published = listDirs(path.join(rootDir, PUBLISHED_DIR))
    .filter((dir) => !isRecordDir(dir))
    .map((dir) => loadDir(dir, false))
    .filter((a) => a.article.status === "published" || a.article.status === "unlisted");

  const result = [...published];
  if (isArticlesPreview()) {
    const publishedIds = new Set(published.map((a) => a.article.id));
    for (const dir of listDirs(path.join(rootDir, STAGING_DIR))) {
      if (isRecordDir(dir)) continue;
      const loaded = loadDir(dir, true);
      // 未完成(draft)の記事はプレビューにも出さない
      if (loaded.article.status === "draft") continue;
      // 公開済みの記事は公開スナップショットを優先(次の版が確定するまで現行を維持)
      if (!publishedIds.has(loaded.article.id)) result.push(loaded);
    }
  }

  const slugs = new Map<string, string>();
  for (const { article } of result) {
    if (!article.slug) {
      throw new Error(`[articles] ${article.id} に slug がありません`);
    }
    const dup = slugs.get(article.slug);
    if (dup) {
      throw new Error(`[articles] slug "${article.slug}" が ${dup} と ${article.id} で重複しています`);
    }
    slugs.set(article.slug, article.id);
  }
  return result;
};

export type LoadedRecordArticle = {
  article: RecordArticleFile;
  parsed: ParsedRecord;
  media: RecordMediaFile;
  /** staging から読んだプレビュー記事か */
  preview: boolean;
};

const loadRecordDir = (rootDir: string, dir: string, preview: boolean): LoadedRecordArticle => {
  const article: RecordArticleFile = preview
    ? {
        ...readJson<RecordArticleData>(path.join(dir, "article.json")),
        ...readJson<SongArticleEditorial>(path.join(dir, "editorial.json")),
      }
    : readJson<RecordArticleFile>(path.join(dir, "article.json"));
  const body = fs.readFileSync(path.join(dir, "body.md"));
  const parsed = parseRecordMarkdown(body.toString("utf8"));
  const mediaFile = path.join(dir, "media.json");
  if (!fs.existsSync(mediaFile)) throw new Error(`[articles] ${article.id} に media.json がありません`);
  const media = readJson<RecordMediaFile>(mediaFile);
  // 公開コマンドと同じ検査。確認した版から本文・写真の定義・画像が変わっていれば、ここで止める
  const problems = recordProblems({ rootDir, article, body, parsed, media });
  if (problems.length > 0) {
    throw new Error(`[articles] ${article.id} を読み込めません: ${problems.join(" / ")}`);
  }
  return { article, parsed, media, preview };
};

/**
 * 記録(kind: "record")を読み込む。出す範囲は楽曲記事と同じ
 * (通常ビルドは content/articles の published・unlisted、ARTICLES_PREVIEW=1 なら staging の draft 以外も)。
 * slug は楽曲記事とも重ならないようにする(otherSlugs に楽曲記事・ガイドの slug を渡す)。
 */
export const loadRecordArticles = (rootDir: string, otherSlugs: Map<string, string> = new Map()): LoadedRecordArticle[] => {
  const published = listDirs(path.join(rootDir, PUBLISHED_DIR))
    .filter(isRecordDir)
    .map((dir) => loadRecordDir(rootDir, dir, false))
    .filter((a) => a.article.status === "published" || a.article.status === "unlisted");

  const result = [...published];
  if (isArticlesPreview()) {
    const publishedIds = new Set(published.map((a) => a.article.id));
    for (const dir of listDirs(path.join(rootDir, STAGING_DIR))) {
      if (!isRecordDir(dir)) continue;
      // 未完成(draft)はプレビューにも出さない。公開済みの記事は公開スナップショットを優先する
      if (readJson<SongArticleEditorial>(path.join(dir, "editorial.json")).status === "draft") continue;
      const loaded = loadRecordDir(rootDir, dir, true);
      if (!publishedIds.has(loaded.article.id)) result.push(loaded);
    }
  }

  const slugs = new Map(otherSlugs);
  for (const { article } of result) {
    if (!article.slug) {
      throw new Error(`[articles] ${article.id} に slug がありません`);
    }
    const dup = slugs.get(article.slug);
    if (dup) {
      throw new Error(`[articles] slug "${article.slug}" が ${dup} と ${article.id} で重複しています`);
    }
    slugs.set(article.slug, article.id);
  }
  return result;
};
