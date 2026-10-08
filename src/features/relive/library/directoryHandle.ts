/**
 * 「前回のフォルダを開く」のための File System Access API まわり(旧3-11 その他)。
 *
 * showDirectoryPicker が使えるブラウザ(Chromium 系のデスクトップ)では、選んだフォルダのハンドルを
 * IndexedDB に残し、次回はフォルダを選び直さずに読み込めるようにする。使えないブラウザでは何もしない
 * (従来の <input webkitdirectory> を使う)。モジュール読み込み時には window に触らない(静的ビルドのため)。
 */
import { setFileRelativePath } from "./localFiles";

// lib.dom に無い/環境で差がある部分だけを最小限の型で持つ
type PermissionMode = { mode: "read" };
type HandlePermissionState = "granted" | "denied" | "prompt";

export type FileHandleLike = {
  kind: "file";
  name: string;
  getFile: () => Promise<File>;
};

export type DirectoryHandleLike = {
  kind: "directory";
  name: string;
  values: () => AsyncIterable<FileHandleLike | DirectoryHandleLike>;
  queryPermission?: (descriptor: PermissionMode) => Promise<HandlePermissionState>;
  requestPermission?: (descriptor: PermissionMode) => Promise<HandlePermissionState>;
};

type WindowWithDirectoryPicker = Window & {
  showDirectoryPicker?: (options?: { id?: string; mode?: "read" }) => Promise<DirectoryHandleLike>;
};

export const supportsDirectoryPicker = () =>
  typeof window !== "undefined" &&
  typeof (window as WindowWithDirectoryPicker).showDirectoryPicker === "function";

/** フォルダ選択ダイアログを開く。キャンセル時は AbortError(DOMException)が投げられる */
export const pickAudioDirectory = () =>
  (window as WindowWithDirectoryPicker).showDirectoryPicker!({ id: "relive-audio", mode: "read" });

/**
 * 読み取り権限を確認し、必要なら求める。requestPermission はユーザー操作(クリック)の中で呼ぶこと。
 * 権限が得られたら true。
 */
export const ensureReadPermission = async (handle: DirectoryHandleLike) => {
  const descriptor: PermissionMode = { mode: "read" };
  if (!handle.queryPermission) return true;
  if ((await handle.queryPermission(descriptor)) === "granted") return true;
  if (!handle.requestPermission) return false;
  return (await handle.requestPermission(descriptor)) === "granted";
};

/**
 * フォルダ内のファイルを再帰的に集める。各ファイルには、フォルダ選択(webkitdirectory)の
 * webkitRelativePath と同じ「選んだフォルダ名/サブフォルダ/ファイル名」の相対パスを付ける。
 */
export const readFilesFromDirectory = async (
  root: DirectoryHandleLike,
  signal?: AbortSignal
): Promise<File[]> => {
  const files: File[] = [];
  const walk = async (dir: DirectoryHandleLike, prefix: string) => {
    for await (const entry of dir.values()) {
      if (signal?.aborted) throw new DOMException("aborted", "AbortError");
      const path = `${prefix}/${entry.name}`;
      if (entry.kind === "directory") {
        await walk(entry, path);
      } else {
        const file = await entry.getFile();
        setFileRelativePath(file, path);
        files.push(file);
      }
    }
  };
  await walk(root, root.name);
  return files;
};
