/**
 * ビルド時に楽曲記事を読み込む(gatsby-node.ts から使う)。
 *
 * - 通常ビルド: content/articles/<id>/ のうち status が "published" のものだけ。
 * - ARTICLES_PREVIEW=1: 加えて .articles-local/staging/<id>/ も読む(ローカル確認用)。
 *   プレビュー記事は noindex で、デプロイ前検査(scripts/check-deploy-ready.ts)が止める。
 */
import * as fs from "fs";
import * as path from "path";
import { SongArticleData, SongArticleEditorial, SongArticleFile } from "./types";
import { ParsedArticle, parseArticleMarkdown } from "./markdown";

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
    .map((dir) => loadDir(dir, false))
    .filter((a) => a.article.status === "published");

  const result = [...published];
  if (isArticlesPreview()) {
    const publishedIds = new Set(published.map((a) => a.article.id));
    for (const dir of listDirs(path.join(rootDir, STAGING_DIR))) {
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
