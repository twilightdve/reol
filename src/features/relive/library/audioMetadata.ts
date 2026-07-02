import type { AudioMetadata } from "../types/relive";

// `music-metadata` は ESM のみ提供されているため、Jest (CJS) 環境や
// SSR でも安全に動かせるよう動的 import を介して読み込む。
type ParseBlobFn = (
  blob: Blob,
  options?: Record<string, unknown>
) => Promise<{
  common?: {
    title?: string;
    artist?: string;
    albumartist?: string;
    album?: string;
    track?: { no?: number | null };
    disk?: { no?: number | null };
  };
  format?: {
    duration?: number;
    codec?: string;
    sampleRate?: number;
    bitrate?: number;
    numberOfChannels?: number;
  };
}>;

let parseBlobPromise: Promise<ParseBlobFn | null> | null = null;

const loadParseBlob = (): Promise<ParseBlobFn | null> => {
  if (parseBlobPromise) {
    return parseBlobPromise;
  }
  parseBlobPromise = (async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const mod = await (Function(
        "return import('music-metadata')"
      )() as Promise<{ parseBlob?: ParseBlobFn }>);
      return typeof mod.parseBlob === "function" ? mod.parseBlob : null;
    } catch {
      return null;
    }
  })();
  return parseBlobPromise;
};

/**
 * File / Blob から ID3 等のメタデータを抽出する。
 * 失敗時 (パーサ未ロード・破損ファイル等) は undefined を返す。
 * - 仕様上の最大読み込み量を抑えるため `duration: false` を渡し、
 *   タグ取得後すぐにストリームを閉じる。
 */
export const readAudioMetadata = async (
  file: Blob
): Promise<AudioMetadata | undefined> => {
  const parseBlob = await loadParseBlob();
  if (!parseBlob) {
    return undefined;
  }
  try {
    const result = await parseBlob(file, {
      duration: false,
      skipCovers: true,
    });
    const common = result.common || {};
    const format = result.format || {};
    const trimmed = (value?: string) => {
      if (typeof value !== "string") return undefined;
      const v = value.trim();
      return v.length > 0 ? v : undefined;
    };

    const metadata: AudioMetadata = {
      title: trimmed(common.title),
      artist: trimmed(common.artist),
      album: trimmed(common.album),
      albumArtist: trimmed(common.albumartist),
      trackNo:
        typeof common.track?.no === "number" ? common.track.no : undefined,
      discNo: typeof common.disk?.no === "number" ? common.disk.no : undefined,
      durationSec:
        typeof format.duration === "number" ? format.duration : undefined,
      codec: trimmed(format.codec),
      sampleRate:
        typeof format.sampleRate === "number" ? format.sampleRate : undefined,
      bitRate:
        typeof format.bitrate === "number" ? format.bitrate : undefined,
      channels:
        typeof format.numberOfChannels === "number"
          ? format.numberOfChannels
          : undefined,
    };

    // 空オブジェクト (全項目 undefined) なら返さない
    if (Object.values(metadata).every((v) => v === undefined)) {
      return undefined;
    }
    return metadata;
  } catch {
    return undefined;
  }
};

/**
 * メタデータ取得を直列で行うと、数百件規模ファイルで体感がかなり遅くなる。
 * Promise.allSettled + 上限同時数 で並列化するヘルパー。
 */
export const readAudioMetadataAll = async (
  files: File[],
  options: {
    concurrency?: number;
    onEach?: (file: File, metadata?: AudioMetadata) => void;
    signal?: AbortSignal;
  } = {}
): Promise<Map<File, AudioMetadata | undefined>> => {
  const { concurrency = 4, onEach, signal } = options;
  const result = new Map<File, AudioMetadata | undefined>();
  const queue = files.slice();

  const worker = async () => {
    while (queue.length > 0) {
      if (signal?.aborted) return;
      const next = queue.shift();
      if (!next) return;
      const metadata = await readAudioMetadata(next);
      result.set(next, metadata);
      onEach?.(next, metadata);
    }
  };

  const workers = Array.from(
    { length: Math.max(1, Math.min(concurrency, files.length)) },
    () => worker()
  );
  await Promise.all(workers);
  return result;
};
