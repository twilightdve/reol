import { missingReasonLabel, summarizeMatch } from "../matchSummary";
import type { SetlistEntryMatch, SetlistReadinessReport } from "../../types/relive";

const entry = (entryId: string, status: SetlistEntryMatch["status"], extra: Partial<SetlistEntryMatch> = {}): SetlistEntryMatch => ({
  schemaVersion: 1,
  setlistId: "s",
  entryId,
  status,
  candidates: [],
  ...extra,
});

const report = (entries: SetlistEntryMatch[]): SetlistReadinessReport => ({
  schemaVersion: 1,
  setlistId: "s",
  totalEntries: entries.length,
  playableEntries: entries.filter((e) => e.status === "matched" || e.status === "special").length,
  missingEntries: entries.filter((e) => e.status === "missing").length,
  candidateEntries: entries.filter((e) => e.status === "candidate" || e.status === "manual_required").length,
  specialEntries: entries.filter((e) => e.status === "special").length,
  isFullyPlayable: false,
  isPlayableWithWarnings: false,
  entries,
  checkedAt: "2026-09-30T00:00:00Z",
});

const titles: Record<string, string> = { a: "第六感", b: "白夜", c: "MC", d: "ウテナ" };
const base = {
  titleOf: (id: string) => titles[id] ?? id,
  restoredTrackCount: 0,
  isLoading: false,
  lastSelectedFileCount: null,
};

describe("summarizeMatch", () => {
  const r = report([
    entry("a", "matched", { matchedFileKey: "f1" }),
    entry("b", "candidate", { candidates: [{ fileKey: "f2", score: 0.6, reasons: ["filename_alias"] }] }),
    entry("c", "special"),
    entry("d", "missing"),
  ]);

  it("一部一致なら件数と一致しなかった曲を返す(MC などは数えない)", () => {
    const s = summarizeMatch({ ...base, report: r, sessionFileCount: 10 });
    expect(s.state).toBe("partial");
    expect(s.songTotal).toBe(3);
    expect(s.matched).toBe(1);
    expect(s.unmatched.map((u) => [u.title, u.hasCandidates])).toEqual([
      ["白夜", true],
      ["ウテナ", false],
    ]);
  });

  it("音源を選んでいなければ no_files、前回分だけ残っていれば reselect_needed", () => {
    expect(summarizeMatch({ ...base, report: r, sessionFileCount: 0 }).state).toBe("no_files");
    expect(summarizeMatch({ ...base, report: r, sessionFileCount: 0, restoredTrackCount: 5 }).state).toBe("reselect_needed");
  });

  it("フォルダを選んだのに対応形式が無ければ no_audio", () => {
    expect(summarizeMatch({ ...base, report: r, sessionFileCount: 0, lastSelectedFileCount: 3 }).state).toBe("no_audio");
  });

  it("1曲も一致しなければ none_matched、全曲一致なら all_matched、読み込み中は loading", () => {
    const none = report([entry("a", "missing"), entry("b", "missing")]);
    expect(summarizeMatch({ ...base, report: none, sessionFileCount: 4 }).state).toBe("none_matched");
    const all = report([entry("a", "matched"), entry("c", "special")]);
    expect(summarizeMatch({ ...base, report: all, sessionFileCount: 4 }).state).toBe("all_matched");
    expect(summarizeMatch({ ...base, report: all, sessionFileCount: 4, isLoading: true }).state).toBe("loading");
  });

  it("ファイル本体が無いだけの曲は「候補あり」にしない", () => {
    const blob = report([entry("a", "missing", { missingReason: "file_blob_missing", candidates: [{ fileKey: "f", score: 1, reasons: ["manual"] }] })]);
    expect(summarizeMatch({ ...base, report: blob, sessionFileCount: 1 }).unmatched[0].hasCandidates).toBe(false);
  });
});

describe("missingReasonLabel", () => {
  it("内部の理由を表示用の文言にする", () => {
    expect(missingReasonLabel("file_blob_missing")).toBe("ファイルの再選択が必要です");
    expect(missingReasonLabel(undefined)).toBeUndefined();
    expect(missingReasonLabel("その他の理由")).toBe("その他の理由");
  });
});
