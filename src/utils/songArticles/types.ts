/**
 * 楽曲記事(plan/29)のデータ型。
 *
 * - SongArticleRecord: 取込記録。文書ID・ファイルID・版を含むため非公開(.articles-local のみ)。
 * - SongArticleData: サイトが読む記事データ。公開用なので Docs/Drive の ID や管理表の内部情報を入れない。
 * - SongArticleEditorial: slug・公開日など編集上の決定。取込では上書きしない。
 */

export type TriState = boolean | null;

/**
 * draft: 未完成。プレビューにも出さない(2026-10-11 ユーザー「白夜は全然未完成なので表示しないで」)
 * review: 確認中。プレビュー(ARTICLES_PREVIEW=1)にだけ出す(取込の既定)
 * published: 公開済み(content/articles/)
 */
// unlisted = 限定公開(plan/43)。記事ページはデプロイして URL で読めるが、一覧・関連・曲ページ・HOME・サイトマップには出さず、noindex
export type PublicationStatus = "draft" | "review" | "published" | "unlisted";

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
  /**
   * 記事に表示する日付 = 原稿(Googleドキュメント)の作成日時(ISO 8601)。改稿しても変わらない(2026-10-10 ユーザー決定)。
   * 管理シートに「作成日」列があれば取込で入れる。無ければ手で記録する
   */
  createdAt?: string | null;
  /** 編集で足すタグ(任意)。楽曲記事は曲名・初出の作品・年のタグが自動で付く(src/utils/songArticles/series.ts) */
  tags?: string[] | null;
  /** 初回公開日時。公開コマンドが自動で記録する(表示しない。構造化データ・一覧の並び順に使う) */
  publishedAt: string | null;
  /** 公開後に本文を差し替えて再公開した日時。公開コマンドが自動で記録する */
  updatedAt: string | null;
  relatedArticleIds: string[];
};

/** 公開用ファイル(content/articles/<id>/article.json)の中身 */
export type SongArticleFile = SongArticleData & SongArticleEditorial;
