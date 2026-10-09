/**
 * 楽曲記事(plan/29)のデータ型。
 *
 * - SongArticleRecord: 取込記録。文書ID・ファイルID・版を含むため非公開(.articles-local のみ)。
 * - SongArticleData: サイトが読む記事データ。公開用なので Docs/Drive の ID や管理表の内部情報を入れない。
 * - SongArticleEditorial: slug・公開日など編集上の決定。取込では上書きしない。
 */

export type TriState = boolean | null;

export type PublicationStatus = "draft" | "review" | "published";

/** 掲載用Markdownの記録(4種類の入力キーを正規化したもの) */
export type PublicationArtifact = {
  /** 入力に使われていたキー名(publication_markdown 等) */
  sourceKey: string;
  fileId: string | null;
  url: string | null;
  fileName: string | null;
  documentId: string | null;
  approvedRevision: number | null;
  sourceRevision: number | null;
  formatRevision: number | null;
  sha256: string | null;
  libraryFileId: string | null;
  sourceDocumentRevisionId: string | null;
};

export type SongArticleRecord = {
  articleId: string;
  songNumber: string | null;
  songTitle: string;
  documentId: string | null;
  bodyRevision: number | null;
  approvedRevision: number | null;
  userApproval: TriState;
  qaPass: TriState;
  publication: PublicationArtifact;
  /** 取得したMarkdownのバイト列から算出したsha256 */
  computedSha256: string;
  sourceSongUuids: string[];
  importRunId: string;
  importedAt: string;
};

export type SongArticleMedia = {
  kind: "youtube";
  url: string;
  /** 管理表の確認結果(例: official_mv)。未確認なら null */
  role: string | null;
};

/** 取込が毎回作り直す、本文由来・管理表由来の公開項目 */
export type SongArticleData = {
  id: string;
  kind: "song";
  songTitle: string;
  bodyRevision: number;
  formatRevision: number | null;
  bodySha256: string;
  /** 元song表の収録レコードuuid(song対応で記事へ対応づいたもの) */
  songRefs: string[];
  media: SongArticleMedia[];
};

/** 編集上の決定。ユーザーが決める(取込は初回に雛形を置くだけ) */
export type SongArticleEditorial = {
  slug: string | null;
  /** slug が提案のままかどうか。true の間は公開できない */
  slugProposed: boolean;
  status: PublicationStatus;
  summary: string | null;
  versionLabel: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  relatedArticleIds: string[];
};

/** 公開用ファイル(content/articles/<id>/article.json)の中身 */
export type SongArticleFile = SongArticleData & SongArticleEditorial;
