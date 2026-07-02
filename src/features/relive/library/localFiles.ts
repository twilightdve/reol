import type { AudioExtension, AudioMetadata, LocalTrackRecord } from "../types/relive";
import { readAudioMetadata } from "./audioMetadata";

const SUPPORTED_EXTENSIONS = new Set(["flac", "mp3", "m4a", "aac", "wav"]);

export const normalizeTrackName = (input: string) =>
  input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\.(flac|mp3|m4a|aac|wav)$/i, "")
    .replace(/[【】「」『』[\]()（）]/g, " ")
    .replace(/\b(reol|れをる|レヲル)\b/gi, " ")
    .replace(/\s+/g, "")
    // `?` `!` は短い曲名 (例: "Q?") を識別するために保持する。
    // それ以外の記号は従来通り除去する。
    .replace(/[^\p{L}\p{N}?!]/gu, "");

/**
 * ファイル名先頭のトラック番号 prefix を取り除く。
 * 例: "01 第六感.flac" -> "第六感.flac", "1-02 たいと.mp3" -> "たいと.mp3"
 *
 * 短い曲名 (≤3 文字) はファイル名キーに `01` 等の数字が混じると
 * 完全一致が成立せず、SUBSTRING_MATCH_MIN_LEN により部分一致も拾えない。
 * 剝がしたバリアントを別キーとして登録することで、短曲名の自動マッチを救う。
 */
const stripTrackNoPrefix = (fileName: string) => {
  const withoutExt = fileName.replace(/\.(flac|mp3|m4a|aac|wav)$/i, "");
  const patterns: RegExp[] = [
    /^\s*disc[-.\s_]?\d+[-.\s_]+\d{1,3}[-.\s_]+/i, // "Disc1-01 "
    /^\s*\d{1,2}[-.\s_]+\d{1,3}[-.\s_]+/, // "1-02 ", "1.02 "
    /^\s*(?:track[-.\s_]?)?\d{1,3}[-.\s_]+/i, // "01 ", "Track 02-"
    /^\s*[a-z]\d{1,3}[-.\s_]+/i, // "A1 " "M01-"
  ];
  for (const pattern of patterns) {
    if (pattern.test(withoutExt)) {
      return withoutExt.replace(pattern, "");
    }
  }
  return withoutExt;
};

/**
 * 括弧内の付加情報 (例: "(Live Ver.)", "（Instrumental）") を除去する。
 * 短曲名 (例: "白夜") + 括弧サフィックスのファイル名・ID3 タグを
 * 完全一致に持ち込めるようにする。
 */
const stripParenthetical = (input: string) =>
  input.replace(/[（(\[【「『][^)）\]】」』]*[)）\]】」』]/g, " ");

/**
 * バージョン / Live 等の後置サフィックスを除去する。
 * "白夜 - Live", "白夜 -Remix-", "白夜 ver.2025" → "白夜"
 * "感情御中 -CRUSHed Remix-" → "感情御中"
 */
const stripVersionSuffix = (input: string) =>
  input
    .replace(
      /[\s\-ー~〜]+-?\s*(?:live|instrumental|inst\.?|remix|edit|version|ver\.?\d*|anime ver\.?|aoex edit|crushed remix|big death edition)\s*-?.*$/i,
      ""
    )
    .trim();

/**
 * mora 等の配信サイトでファイル名末尾に付くトラックID (例: "_20092353") を除去。
 * "04-白夜_20092353.flac" → "04-白夜" になる前段として使う。
 */
const stripTrailingId = (input: string) =>
  input.replace(/_\d{4,}$/g, "").trim();

/**
 * "曲名 feat.XXX" / "曲名 feat XXX" のフィーチャリング表記を剝がす。
 * "第六感 feat.東京ゲゲゲイ" → "第六感"
 */
// feat. 表記を末尾ごと剝がす。
// "X feat. Y" / "X feat.Y" (mora "第六感 feat.東京ゲゲゲイ") / "X -feat.Y-" など
// `feat.` 直後がスペース無しでも丸ごと除去できるようにする。
// ただし "feature" 等を誤爆しないよう、`feat.` (ピリオド付き) か
// `feat ` (スペース必須) のどちらかを必須とする。
const stripFeat = (input: string) =>
  input
    .replace(/\s*[\-]?\s*feat\.\s*[^\-\(\)\[\]]*$/i, "")
    .replace(/\s*[\-]?\s*feat\s+.*$/i, "")
    .trim();

const dedupeKeys = (values: Array<string | undefined>) => {
  const seen = new Set<string>();
  const out: string[] = [];
  values.forEach((v) => {
    if (!v) return;
    if (seen.has(v)) return;
    seen.add(v);
    out.push(v);
  });
  return out;
};

const getRelativePath = (file: File) => {
  const maybeDirectoryFile = file as File & { webkitRelativePath?: string };
  return maybeDirectoryFile.webkitRelativePath || undefined;
};

export const isSupportedAudioFile = (file: File) => {
  const extension = (file.name.split(".").pop()?.toLowerCase() || "") as AudioExtension;
  return SUPPORTED_EXTENSIONS.has(extension);
};

export const createFileKey = (file: File) => {
  const relativePath = getRelativePath(file);
  return [relativePath ?? file.name, file.size, file.lastModified].join("|");
};

export const createLocalTrackRecord = (file: File): LocalTrackRecord => {
  const extension = (file.name.split(".").pop()?.toLowerCase() || "") as AudioExtension;
  const relativePath = getRelativePath(file);
  const fileNameKey = normalizeTrackName(file.name);
  // 1. 末尾 ID (mora 由来 "_20092353") を剝がす → "04-白夜"
  // 2. 先頭 trackNo (例 "04-") を剝がす → "白夜"
  // 3. 括弧 / バージョンサフィックスを剝がす → 純粋な曲名
  // 4. feat. 表記を剝がす
  const baseName = file.name.replace(/\.(flac|mp3|m4a|aac|wav)$/i, "");
  const noTrailingId = stripTrailingId(baseName);
  const noPrefix = stripTrackNoPrefix(noTrailingId);
  const cleanedTitle = stripFeat(
    stripVersionSuffix(stripParenthetical(noPrefix))
  );
  const strippedFileNameKey = normalizeTrackName(noPrefix);
  const strippedParenKey = normalizeTrackName(cleanedTitle);
  const audioExtension: AudioExtension = SUPPORTED_EXTENSIONS.has(extension)
    ? extension
    : "unknown";

  return {
    schemaVersion: 1,
    fileKey: createFileKey(file),
    fileName: file.name,
    relativePath,
    extension: audioExtension,
    size: file.size,
    lastModified: file.lastModified,
    mimeType: file.type,
    normalized: {
      // 先頭の `fileNameKey` は従来互換 (生ファイル名 normalize)。
      // trackNo / 末尾ID / 括弧 / Live・ver / feat. 各サフィックス除去の
      // バリアントを後続に追加し、短曲名 (例: 白夜 / ダリ / Q?) や
      // mora 形式ファイル名 ("04-白夜_20092353.flac") を完全一致で拾えるようにする。
      titleKeys: dedupeKeys([fileNameKey, strippedFileNameKey, strippedParenKey]),
      artistKeys: [],
      fileNameKey,
      pathKey: relativePath ? normalizeTrackName(relativePath) : undefined,
    },
    scannedAt: new Date().toISOString(),
  };
};

/**
 * 取得済みメタデータを LocalTrackRecord に適用する。
 * - record.metadata を更新
 * - normalized.titleKeys / artistKeys に metadata 由来キーを追加
 *   (先頭に追加することで matching 側で「メタデータ由来」と判別できる
 *    ※ 現状の matching は順序に依存しないが、metadata_exact reason は
 *      `record.metadata.title` を直接見て判定する設計にする)
 */
export const applyMetadataToRecord = (
  record: LocalTrackRecord,
  metadata: AudioMetadata | undefined
): LocalTrackRecord => {
  if (!metadata) return record;
  const metaTitleRaw = metadata.title || "";
  const metaTitleKey = metaTitleRaw ? normalizeTrackName(metaTitleRaw) : "";
  // ID3 title が "白夜 (Live)" "ヒビカセ -instrumental-" のように装飾されていても
  // 完全一致に持ち込めるよう、括弧 / ver / feat. サフィックス除去版もキーに加える。
  const metaTitleStrippedKey = metaTitleRaw
    ? normalizeTrackName(
        stripFeat(stripVersionSuffix(stripParenthetical(metaTitleRaw)))
      )
    : "";
  const metaArtistKey = metadata.artist ? normalizeTrackName(metadata.artist) : "";
  const metaAlbumArtistKey = metadata.albumArtist
    ? normalizeTrackName(metadata.albumArtist)
    : "";

  return {
    ...record,
    metadata,
    normalized: {
      ...record.normalized,
      // album は曲名と一致するケース (例: アルバム名 "事実無根" と曲名 "事実無根")
      // で他曲ファイルまで巻き込んで誤マッチさせるため titleKeys には含めない。
      titleKeys: dedupeKeys([
        metaTitleKey,
        metaTitleStrippedKey,
        ...record.normalized.titleKeys,
      ]),
      artistKeys: dedupeKeys([
        metaArtistKey,
        metaAlbumArtistKey,
        ...record.normalized.artistKeys,
      ]),
    },
  };
};

export const collectLocalAudioFiles = (fileList: FileList | null) => {
  const files = Array.from(fileList || []).filter(isSupportedAudioFile);
  const records = files.map(createLocalTrackRecord);
  const sessionFiles = new Map(files.map((file) => [createFileKey(file), file]));

  return { records, sessionFiles };
};

export type CollectLocalAudioFilesProgress = {
  processed: number;
  total: number;
  records: LocalTrackRecord[];
  sessionFiles: Map<string, File>;
};

export type CollectLocalAudioFilesBatchedOptions = {
  /** 1 バッチあたりの処理ファイル数。デフォルト 25。 */
  batchSize?: number;
  /** 各バッチ後に進捗を通知するコールバック。 */
  onProgress?: (progress: CollectLocalAudioFilesProgress) => void;
  /** 中断用シグナル。 */
  signal?: AbortSignal;
  /**
   * 各ファイルから ID3 等のメタデータを抽出するかどうか。
   * デフォルト true。マッチング精度を上げる目的で `metadata.title` を
   * titleKeys に取り込む。失敗したファイルはメタデータなしで保持する。
   */
  extractMetadata?: boolean;
  /** メタデータ抽出の並列数。デフォルト 4。 */
  metadataConcurrency?: number;
};

const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_METADATA_CONCURRENCY = 4;

const yieldToBrowser = () =>
  new Promise<void>((resolve) => {
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });

/**
 * バッチ内のファイル群からメタデータを並列抽出する。
 * 個別の失敗はそのファイルのメタデータが undefined になるだけで、
 * 全体の処理は止めない。
 */
const enrichRecordsInChunk = async (
  chunk: File[],
  records: LocalTrackRecord[],
  startIndex: number,
  concurrency: number,
  signal?: AbortSignal
) => {
  const queue = chunk.map((file, idx) => ({ file, idx }));
  const worker = async () => {
    while (queue.length > 0) {
      if (signal?.aborted) return;
      const next = queue.shift();
      if (!next) return;
      const metadata = await readAudioMetadata(next.file);
      if (!metadata) continue;
      const recordIdx = startIndex + next.idx;
      records[recordIdx] = applyMetadataToRecord(records[recordIdx], metadata);
    }
  };
  const workerCount = Math.max(1, Math.min(concurrency, chunk.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
};

/**
 * 大量ファイルでもメインスレッドを長時間ブロックしないよう、
 * バッチ単位で `LocalTrackRecord` を生成する。
 */
export const collectLocalAudioFilesBatched = async (
  fileList: FileList | null,
  options: CollectLocalAudioFilesBatchedOptions = {}
) => {
  const {
    batchSize = DEFAULT_BATCH_SIZE,
    onProgress,
    signal,
    extractMetadata = true,
    metadataConcurrency = DEFAULT_METADATA_CONCURRENCY,
  } = options;
  const files = Array.from(fileList || []).filter(isSupportedAudioFile);
  const total = files.length;
  const records: LocalTrackRecord[] = [];
  const sessionFiles = new Map<string, File>();

  if (total === 0) {
    onProgress?.({ processed: 0, total: 0, records, sessionFiles });
    return { records, sessionFiles };
  }

  const effectiveBatchSize = Math.max(1, batchSize);

  for (let offset = 0; offset < total; offset += effectiveBatchSize) {
    if (signal?.aborted) {
      throw new DOMException("aborted", "AbortError");
    }
    const chunk = files.slice(offset, offset + effectiveBatchSize);
    const chunkStartIndex = records.length;
    chunk.forEach((file) => {
      const record = createLocalTrackRecord(file);
      records.push(record);
      sessionFiles.set(record.fileKey, file);
    });

    if (extractMetadata) {
      await enrichRecordsInChunk(
        chunk,
        records,
        chunkStartIndex,
        metadataConcurrency,
        signal
      );
      // enrichRecordsInChunk 中に fileKey は変わらないので sessionFiles はそのまま。
      // ただし records[i] が applyMetadataToRecord で差し替わるため、
      // sessionFiles のキー (fileKey) は不変であることをここで保証する。
    }

    onProgress?.({
      processed: Math.min(offset + chunk.length, total),
      total,
      records,
      sessionFiles,
    });
    // 次バッチに進む前にブラウザに描画機会を返す
    if (offset + effectiveBatchSize < total) {
      await yieldToBrowser();
    }
  }

  return { records, sessionFiles };
};
