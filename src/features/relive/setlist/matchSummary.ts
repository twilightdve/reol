/**
 * 音源マッチ結果の要約(plan/27 ステップ5・旧3-11「失敗状態を前面に出す」)。
 *
 * フォルダ選択直後に「セトリ24曲中 18曲が一致しました」のような結果と、一致しなかった曲の一覧を
 * プレイヤーより上に出すための純粋関数。UI から切り離してテストできるようにしている。
 */
import type { SetlistReadinessReport, TrackMatchStatus } from "../types/relive";

export type MatchSummaryState =
  /** まだ音源フォルダを選んでいない */
  | "no_files"
  /** 読み込み中 */
  | "loading"
  /** フォルダに対応形式の音源が1つも無かった */
  | "no_audio"
  /** 前回の音源情報はあるが、ファイル本体はこのセッションにない(再選択が必要) */
  | "reselect_needed"
  /** 音源はあるが、セトリの曲と1曲も一致しなかった */
  | "none_matched"
  /** 一部だけ一致 */
  | "partial"
  /** セトリの曲がすべて一致 */
  | "all_matched";

export type UnmatchedSong = {
  entryId: string;
  title: string;
  status: TrackMatchStatus;
  /** 候補ファイルがある(手動で選べば一致させられる見込みが高い) */
  hasCandidates: boolean;
};

export type MatchSummary = {
  state: MatchSummaryState;
  /** MC・SE・カバー等を除いた、照合対象の曲数 */
  songTotal: number;
  matched: number;
  special: number;
  unmatched: UnmatchedSong[];
};

export const STATUS_LABEL: Record<TrackMatchStatus, string> = {
  matched: "一致",
  candidate: "候補あり",
  manual_required: "要選択",
  missing: "未一致",
  special: "対象外",
};

/** 未一致の理由(内部値)を表示用の文言にする */
export const missingReasonLabel = (reason: string | undefined): string | undefined => {
  if (!reason) return undefined;
  if (reason === "file_blob_missing") return "ファイルの再選択が必要です";
  if (reason === "special_policy") return "MC・SE・カバー等は照合しません";
  return reason;
};

export const summarizeMatch = (params: {
  report: SetlistReadinessReport;
  titleOf: (entryId: string) => string;
  /** このセッションで選んだ音源ファイルの数 */
  sessionFileCount: number;
  /** 前回のセッションから復元した音源情報の数(ファイル本体は無い) */
  restoredTrackCount: number;
  isLoading: boolean;
  /** 直近に選んだフォルダ内のファイル数(対応形式以外も含む)。未選択なら null */
  lastSelectedFileCount: number | null;
}): MatchSummary => {
  const { report, titleOf, sessionFileCount, restoredTrackCount, isLoading, lastSelectedFileCount } = params;
  const special = report.entries.filter((e) => e.status === "special").length;
  const songTotal = report.totalEntries - special;
  const matched = report.entries.filter((e) => e.status === "matched").length;
  const unmatched: UnmatchedSong[] = report.entries
    .filter((e) => e.status !== "matched" && e.status !== "special")
    .map((e) => ({
      entryId: e.entryId,
      title: titleOf(e.entryId),
      status: e.status,
      hasCandidates: (e.candidates?.length ?? 0) > 0 && e.missingReason !== "file_blob_missing",
    }));

  const base = { songTotal, matched, special, unmatched };
  if (isLoading) return { ...base, state: "loading" };
  if (sessionFileCount === 0) {
    if (lastSelectedFileCount !== null && lastSelectedFileCount > 0) return { ...base, state: "no_audio" };
    if (restoredTrackCount > 0) return { ...base, state: "reselect_needed" };
    return { ...base, state: "no_files" };
  }
  if (matched === 0) return { ...base, state: "none_matched" };
  if (unmatched.length === 0) return { ...base, state: "all_matched" };
  return { ...base, state: "partial" };
};
