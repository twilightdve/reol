import { readFilesFromDirectory, type DirectoryHandleLike, type FileHandleLike } from "../directoryHandle";
import { collectLocalAudioFiles, createFileKey } from "../localFiles";

const fileHandle = (name: string, size = 10): FileHandleLike => ({
  kind: "file",
  name,
  getFile: async () => new File([new Uint8Array(size)], name, { lastModified: 1700000000000 }),
});

const dirHandle = (name: string, entries: (FileHandleLike | DirectoryHandleLike)[]): DirectoryHandleLike => ({
  kind: "directory",
  name,
  values: async function* () {
    yield* entries;
  },
});

describe("readFilesFromDirectory", () => {
  const root = dirHandle("Reol", [
    fileHandle("01_第六感.m4a"),
    dirHandle("ハーメルン", [fileHandle("02_ゆーれいずみー.mp3", 20), fileHandle("cover.jpg")]),
  ]);

  it("フォルダ選択(webkitdirectory)と同じ「選んだフォルダ名/…」の相対パスで fileKey を作る", async () => {
    const files = await readFilesFromDirectory(root);
    expect(files.map((f) => createFileKey(f))).toEqual([
      "Reol/01_第六感.m4a|10|1700000000000",
      "Reol/ハーメルン/02_ゆーれいずみー.mp3|20|1700000000000",
      "Reol/ハーメルン/cover.jpg|10|1700000000000",
    ]);
  });

  it("集めたファイルを既存の取り込み処理に渡すと、対応形式だけが相対パス付きで記録される", async () => {
    const files = await readFilesFromDirectory(root);
    const { records, sessionFiles } = collectLocalAudioFiles(files);
    expect(records.map((r) => r.relativePath)).toEqual([
      "Reol/01_第六感.m4a",
      "Reol/ハーメルン/02_ゆーれいずみー.mp3",
    ]);
    expect([...sessionFiles.keys()]).toEqual(records.map((r) => r.fileKey));
  });

  it("中断されたら AbortError を投げる", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(readFilesFromDirectory(root, controller.signal)).rejects.toMatchObject({ name: "AbortError" });
  });
});
