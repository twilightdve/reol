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
  /**
   * HOME の新着と RSS に出すか(plan/72)。無ければ出す。false にするのは、PHOTO から移した過去の記録のように
   * 「新しく書いた記事」として知らせないもの。一覧・シリーズ・関連記事・サイトマップには false でも出る。
   * 公開した後は変えない(公開コマンドが前の値を引き継ぐ)
   */
  announce?: boolean;
};

/** 公開用ファイル(content/articles/<id>/article.json)の中身 */
export type SongArticleFile = SongArticleData & SongArticleEditorial;

/**
 * 記録(kind: "record")。ライヴ・遠征・聖地・イベントの写真や動画の記録(plan/72)。
 * 楽曲記事と違い、記事ごとの React/CSS は持たず、共通のテンプレート(src/templates/record-article.tsx)で描く。
 */

/** 記事の末尾に出す関連リンク。href が "/" で始まればサイト内、http(s) なら外部 */
export type RecordRelatedLink = {
  label: string;
  href: string;
  /** リンクの下に小さく添える一言(どの場所の出典か、など) */
  note?: string | null;
  /**
   * リンク先(X の投稿など)の本文の書き出し。あれば、これを題の位置に1行で出し、label(誰のいつの投稿か)を下に小さく出す。
   * 表示のための短い引用で、改行なし・RECORD_LINK_QUOTE_MAX 文字まで(recordCheck)。版(contentSha256)には数えない
   */
  quote?: string | null;
};

/** 関連リンクの quote の長さの上限(1行に出す書き出しなので短く。長い投稿は「…」で切って入れる) */
export const RECORD_LINK_QUOTE_MAX = 51;

export type RecordPhoto = {
  /** 記事の中で変えない ID(英小文字・数字・ハイフン)。本文の media ブロックと書き出すファイル名に使う */
  id: string;
  type: "photo";
  /** リポジトリの中の画像(src/images/ 以下)。公開ページにはこのパスを出さない */
  src: string;
  /** 画像を実際に見て書いた代替テキスト */
  alt: string;
  caption?: string | null;
  /** 移行元(例: "photo-002:0" = PHOTO の2件目の1つ目)。画面には出さない */
  from?: string | null;
};

export type RecordVideo = {
  id: string;
  type: "youtube";
  videoId: string;
  /** 縦長の動画 */
  vertical?: boolean;
  /** 再生ボタンの読み上げと小窓の題 */
  title: string;
  caption?: string | null;
  from?: string | null;
};

export type RecordMediaItem = RecordPhoto | RecordVideo;

/** media.json。写真・動画の定義と表紙 */
export type RecordMediaFile = {
  /** 表紙にする写真の ID。無ければ null(一覧のカードは題名だけ) */
  cover: string | null;
  /** 表紙を切り出す縦の位置(0 = 上端 〜 1 = 下端)。無ければ中央 */
  coverFocusY?: number | null;
  items: RecordMediaItem[];
};

/** 取込(npm run articles:record)が毎回作り直す項目 */
export type RecordArticleData = {
  id: string;
  kind: "record";
  seriesSlug: string;
  /** 出来事の日付(YYYY-MM-DD)。分からなければ null */
  eventDate: string | null;
  /** 複数日にわたる時の最終日 */
  eventDateEnd?: string | null;
  bodyRevision: number;
  bodySha256: string;
  /** 本文・写真と動画の定義・使っている画像の中身・この型の他の項目をまとめたハッシュ。確認した版と公開する版が同じかを見る */
  contentSha256: string;
  songRefs: string[];
  relatedLinks: RecordRelatedLink[];
  /** PHOTO に載せた日(分かる時だけ。画面には出さない) */
  legacyPublishedAt: string | null;
};

/** 公開用ファイル(content/articles/<id>/article.json)の中身 */
export type RecordArticleFile = RecordArticleData & SongArticleEditorial;

/** ページに渡す写真(公開用の URL と大きさ) */
export type RecordPhotoAsset = {
  type: "photo";
  id: string;
  /** いちばん大きい版(拡大表示にも使う) */
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
  caption: string | null;
};
/** ページに渡す動画(YouTube。再生するまで埋め込まない) */
export type RecordVideoAsset = {
  type: "youtube";
  id: string;
  videoId: string;
  vertical: boolean;
  title: string;
  caption: string | null;
};
export type RecordMediaAsset = RecordPhotoAsset | RecordVideoAsset;
