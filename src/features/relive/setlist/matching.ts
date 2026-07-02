import { normalizeTrackName } from "../library/localFiles";
import type {
  LocalTrackRecord,
  ManualTrackMapping,
  Setlist,
  SetlistEntry,
  SetlistEntryMatch,
  SetlistReadinessReport,
  TrackMaster,
  TrackMatchCandidate,
  TrackMatchReason,
} from "../types/relive";

const SPECIAL_POLICIES = new Set(["cover", "medley", "se", "unreleased"]);

// 自動紐付けのしきい値。
// - 0.88 以上なら無条件で matched 扱い
// - 0.7 以上で、2位候補との差が 0.08 以上あれば「明確な勝者」として matched 扱い
const AUTO_MATCH_HIGH_CONFIDENCE = 0.88;
const AUTO_MATCH_MIN_SCORE = 0.7;
// 2 位との差が AUTO_MATCH_MARGIN 以上なら自動採用。
// remix / FIRST TAKE 版など同曲別バージョンが拮抗する場合に
// マージンを厳しくすると manual_required が増え過ぎるので、
// 「完全同点でなければ採用」寄りに緩めにする。
const AUTO_MATCH_MARGIN = 0.01;
// includes ベースの部分一致を許容する最小キー長。
// 1〜2 文字 (例: "Q?" → "q?", 仮想の 1 文字曲名) は他曲の任意の文字列に
// 偶発的に含まれて誤マッチしやすいので、完全一致 (===) でしか拾わない。
// 3 文字 (例: "白夜"→"白夜", "DDD", "第六感", "金字塔", "ディア") は
// substring を許可しないと "01 第六感.flac" のように prefix 剝がしで救えない
// ファイル名 (例: 連結記号無し "M01白夜.flac") を拾えなくなるため許可する。
const SUBSTRING_MATCH_MIN_LEN = 3;

// メタデータ (ID3 等) 由来一致のスコア。ファイル名一致より高い信頼度を与える。
const METADATA_EXACT_SCORE = 0.97;
const METADATA_ALIAS_BASE = 0.8;
const METADATA_ALIAS_RANGE = 0.15;
const FILENAME_EXACT_SCORE = 0.92;
const FILENAME_ALIAS_BASE = 0.7;
const FILENAME_ALIAS_RANGE = 0.18;
const DURATION_HINT_SCORE = 0.3;

const isDurationClose = (a?: number, b?: number) =>
  typeof a === "number" && typeof b === "number" && Math.abs(a - b) <= 4;

const collectEntryKeys = (entry: SetlistEntry, track?: TrackMaster) =>
  [
    entry.displayTitle,
    ...(entry.aliases || []),
    track?.canonicalTitle,
    ...(track?.aliases || []),
    ...(track?.matchHints || []),
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeTrackName)
    .filter(Boolean);

const addReason = (
  candidate: TrackMatchCandidate,
  score: number,
  reason: TrackMatchReason
) => {
  candidate.score = Math.max(candidate.score, score);
  if (!candidate.reasons.includes(reason)) {
    candidate.reasons.push(reason);
  }
};

const buildCandidates = (
  entry: SetlistEntry,
  track: TrackMaster | undefined,
  localTracks: LocalTrackRecord[]
) => {
  const wantedKeys = collectEntryKeys(entry, track);
  const candidatesByFileKey = new Map<string, TrackMatchCandidate>();

  const ensureCandidate = (fileKey: string) => {
    const current = candidatesByFileKey.get(fileKey);
    if (current) {
      return current;
    }
    const next: TrackMatchCandidate = { fileKey, score: 0, reasons: [] };
    candidatesByFileKey.set(fileKey, next);
    return next;
  };

  localTracks.forEach((localTrack) => {
    // メタデータ (ID3 等) 由来のキーは信頼度が高いので分離して扱う。
    // album は曲名と一致するケース (例: アルバム名 "事実無根" と曲名 "事実無根")
    // で他曲を巻き込んで誤マッチさせるため metadataKeys には含めない。
    // titleKeys 内に applyMetadataToRecord で追加された metadata 由来キーが
    // 含まれているので、ここでは metadata.title から正規化したキーのみを
    // metadata 由来とみなす。
    const metadataTitle = localTrack.metadata?.title;
    const metadataKeys = metadataTitle
      ? Array.from(
          new Set(
            [
              normalizeTrackName(metadataTitle),
            ].filter(Boolean)
          )
        )
      : [];
    const metadataKeySet = new Set(metadataKeys);

    // ファイル名/パス由来のキー。metadata 重複は除外して filename スコアの
    // 過剰加点を避ける。
    const filenameKeys = [
      localTrack.normalized.fileNameKey,
      localTrack.normalized.pathKey,
      ...(localTrack.normalized.titleKeys || []),
    ]
      .filter((value): value is string => Boolean(value))
      .filter((value) => !metadataKeySet.has(value));

    wantedKeys.forEach((wantedKey) => {
      if (!wantedKey) return;

      // 1) メタデータ完全一致 / 部分一致
      metadataKeys.forEach((localKey) => {
        if (!localKey) return;
        if (localKey === wantedKey) {
          addReason(
            ensureCandidate(localTrack.fileKey),
            METADATA_EXACT_SCORE,
            "metadata_exact"
          );
          return;
        }
        if (
          wantedKey.length < SUBSTRING_MATCH_MIN_LEN ||
          localKey.length < SUBSTRING_MATCH_MIN_LEN
        ) {
          return;
        }
        if (localKey.includes(wantedKey) || wantedKey.includes(localKey)) {
          const ratio =
            Math.min(localKey.length, wantedKey.length) /
            Math.max(localKey.length, wantedKey.length);
          addReason(
            ensureCandidate(localTrack.fileKey),
            METADATA_ALIAS_BASE + METADATA_ALIAS_RANGE * ratio,
            "metadata_alias"
          );
        }
      });

      // 2) ファイル名完全一致 / 部分一致
      filenameKeys.forEach((localKey) => {
        if (!localKey) return;
        if (localKey === wantedKey) {
          addReason(
            ensureCandidate(localTrack.fileKey),
            FILENAME_EXACT_SCORE,
            "filename_exact"
          );
          return;
        }
        // 短すぎる key の部分一致は偶発マッチ (例: "q?" がパス文字列に含まれる) を
        // 引き起こすため、両端のいずれかが SUBSTRING_MATCH_MIN_LEN 未満なら
        // 完全一致以外は採用しない。
        if (
          wantedKey.length < SUBSTRING_MATCH_MIN_LEN ||
          localKey.length < SUBSTRING_MATCH_MIN_LEN
        ) {
          return;
        }
        if (localKey.includes(wantedKey) || wantedKey.includes(localKey)) {
          const ratio =
            Math.min(localKey.length, wantedKey.length) /
            Math.max(localKey.length, wantedKey.length);
          addReason(
            ensureCandidate(localTrack.fileKey),
            FILENAME_ALIAS_BASE + FILENAME_ALIAS_RANGE * ratio,
            "filename_alias"
          );
        }
      });
    });

    if (
      isDurationClose(
        localTrack.metadata?.durationSec,
        entry.expectedDurationSec || track?.expectedDurationSec
      )
    ) {
      addReason(
        ensureCandidate(localTrack.fileKey),
        DURATION_HINT_SCORE,
        "duration_hint"
      );
    }
  });

  return Array.from(candidatesByFileKey.values()).sort((a, b) => b.score - a.score);
};

export const buildSetlistReadinessReport = (
  setlist: Setlist,
  tracks: TrackMaster[],
  localTracks: LocalTrackRecord[],
  manualMappings: ManualTrackMapping[] = []
): SetlistReadinessReport => {
  const trackById = new Map(tracks.map((track) => [track.trackId, track]));

  const entries: SetlistEntryMatch[] = setlist.entries.map((entry) => {
    // SE / MC / segment / cover / medley / unreleased は常にマッチ対象外。
    // 過去の手動マッピングや auto-default の残骸があっても matched に昇格させない。
    if (SPECIAL_POLICIES.has(entry.policy)) {
      return {
        schemaVersion: 1,
        setlistId: setlist.setlistId,
        entryId: entry.entryId,
        status: "special",
        candidates: [],
        missingReason: "special_policy",
      };
    }

    const manual = manualMappings.find(
      (mapping) =>
        mapping.fileKey &&
        (mapping.setlistEntryTrackId === entry.trackId ||
          mapping.setlistEntryTitle === entry.displayTitle ||
          mapping.trackId === entry.trackId)
    );

    if (manual) {
      return {
        schemaVersion: 1,
        setlistId: setlist.setlistId,
        entryId: entry.entryId,
        status: "matched",
        matchedFileKey: manual.fileKey,
        candidates: [{ fileKey: manual.fileKey, score: 1, reasons: ["manual"] }],
      };
    }

    const track = entry.trackId ? trackById.get(entry.trackId) : undefined;
    const candidates = buildCandidates(entry, track, localTracks);
    const best = candidates[0];
    const second = candidates[1];

    if (best) {
      const isClearWinner =
        !second || best.score - second.score >= AUTO_MATCH_MARGIN;
      const shouldAutoMatch =
        best.score >= AUTO_MATCH_HIGH_CONFIDENCE ||
        (best.score >= AUTO_MATCH_MIN_SCORE && isClearWinner);

      if (shouldAutoMatch) {
        return {
          schemaVersion: 1,
          setlistId: setlist.setlistId,
          entryId: entry.entryId,
          status: "matched",
          matchedFileKey: best.fileKey,
          candidates,
        };
      }

      return {
        schemaVersion: 1,
        setlistId: setlist.setlistId,
        entryId: entry.entryId,
        status: candidates.length > 1 ? "manual_required" : "candidate",
        candidates,
      };
    }

    return {
      schemaVersion: 1,
      setlistId: setlist.setlistId,
      entryId: entry.entryId,
      status: "missing",
      candidates: [],
      missingReason: "対応するローカル音源が見つかりません",
    };
  });

  const missingEntries = entries.filter((entry) => entry.status === "missing").length;
  const candidateEntries = entries.filter(
    (entry) => entry.status === "candidate" || entry.status === "manual_required"
  ).length;
  const specialEntries = entries.filter((entry) => entry.status === "special").length;
  const playableEntries = entries.filter(
    (entry) => entry.status === "matched" || entry.status === "special"
  ).length;

  return {
    schemaVersion: 1,
    setlistId: setlist.setlistId,
    totalEntries: entries.length,
    playableEntries,
    missingEntries,
    candidateEntries,
    specialEntries,
    isFullyPlayable: missingEntries === 0 && candidateEntries === 0,
    isPlayableWithWarnings: missingEntries === 0,
    entries,
    checkedAt: new Date().toISOString(),
  };
};
