/*
 * scripts/verify-matching.ts
 *
 * 指定フォルダ配下の音楽ファイル群に対して、現状の matching ロジック
 * (createLocalTrackRecord + applyMetadataToRecord + buildSetlistReadinessReport)
 * を実行し、各 setlist の matched / candidate / manual_required / missing
 * の件数と missing/誤マッチの詳細を報告する。
 *
 * 使い方:
 *   npx ts-node --transpile-only scripts/verify-matching.ts /Users/pochi/Music/mora
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { parseFile } from "music-metadata";
import {
  applyMetadataToRecord,
  createLocalTrackRecord,
} from "../src/features/relive/library/localFiles";
import { buildSetlistReadinessReport } from "../src/features/relive/setlist/matching";
import type {
  AudioMetadata,
  LocalTrackRecord,
  Setlist,
  TrackMaster,
} from "../src/features/relive/types/relive";

const AUDIO_EXT = new Set([".flac", ".mp3", ".m4a", ".aac", ".wav"]);

const walk = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (
      entry.isFile() &&
      AUDIO_EXT.has(path.extname(entry.name).toLowerCase())
    ) {
      out.push(full);
    }
  }
  return out;
};

const toMockFile = async (
  fullPath: string,
  rootDir: string
): Promise<File> => {
  const stat = await fs.stat(fullPath);
  const rel = path.relative(rootDir, fullPath);
  const file = new File([new Uint8Array(0)], path.basename(fullPath), {
    type: "application/octet-stream",
    lastModified: stat.mtimeMs,
  });
  // jsdom / Node の File に webkitRelativePath を後付け
  Object.defineProperty(file, "webkitRelativePath", {
    value: rel,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(file, "size", {
    value: stat.size,
    enumerable: true,
    configurable: true,
  });
  return file;
};

const readMetadata = async (
  fullPath: string
): Promise<AudioMetadata | undefined> => {
  try {
    const parsed = await parseFile(fullPath, {
      duration: false,
      skipCovers: true,
    });
    const common = parsed.common || {};
    const format = parsed.format || {};
    const trim = (v?: string) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
    const m: AudioMetadata = {
      title: trim(common.title),
      artist: trim(common.artist),
      album: trim(common.album),
      albumArtist: trim(common.albumartist),
      trackNo: typeof common.track?.no === "number" ? common.track.no : undefined,
      discNo: typeof common.disk?.no === "number" ? common.disk.no : undefined,
      durationSec: typeof format.duration === "number" ? format.duration : undefined,
      codec: trim(format.codec),
      sampleRate:
        typeof format.sampleRate === "number" ? format.sampleRate : undefined,
      bitRate: typeof format.bitrate === "number" ? format.bitrate : undefined,
      channels:
        typeof format.numberOfChannels === "number"
          ? format.numberOfChannels
          : undefined,
    };
    if (Object.values(m).every((v) => v === undefined)) return undefined;
    return m;
  } catch {
    return undefined;
  }
};

const main = async () => {
  const rootDir =
    process.argv[2] ||
    path.join(process.env.HOME || "", "Music", "mora");

  console.log(`[verify] scanning: ${rootDir}`);
  const files = await walk(rootDir);
  console.log(`[verify] audio files: ${files.length}`);

  // generated データ読み込み
  const generatedDir = path.join(
    __dirname,
    "..",
    "static",
    "relive",
    "generated"
  );
  const tracksDoc = JSON.parse(
    await fs.readFile(path.join(generatedDir, "tracks.json"), "utf8")
  );
  const tracks: TrackMaster[] = Array.isArray(tracksDoc)
    ? tracksDoc
    : tracksDoc.tracks || [];
  const setlistFiles = await fs.readdir(path.join(generatedDir, "setlists"));
  const setlistDocs = await Promise.all(
    setlistFiles
      .filter((f) => f.endsWith(".json"))
      .map(async (f) =>
        JSON.parse(
          await fs.readFile(path.join(generatedDir, "setlists", f), "utf8")
        )
      )
  );
  const setlists: Setlist[] = setlistDocs
    .flatMap((doc) =>
      Array.isArray(doc) ? doc : doc.setlists || (doc.setlistId ? [doc] : [])
    )
    .filter((s) => s && Array.isArray(s.entries));
  console.log(`[verify] tracks: ${tracks.length}, setlists: ${setlists.length}`);

  // ローカル record 構築 (metadata 並列抽出)
  const records: LocalTrackRecord[] = [];
  let metaSuccess = 0;
  let metaFail = 0;
  await Promise.all(
    files.map(async (full) => {
      const file = await toMockFile(full, rootDir);
      let record = createLocalTrackRecord(file);
      const meta = await readMetadata(full);
      if (meta) {
        metaSuccess++;
        record = applyMetadataToRecord(record, meta);
      } else {
        metaFail++;
      }
      records.push(record);
    })
  );
  console.log(
    `[verify] metadata: success=${metaSuccess} fail=${metaFail} total=${files.length}`
  );

  // 全 setlist に対して readiness を集計
  const trackById = new Map(tracks.map((t) => [t.trackId, t]));
  let totalEntries = 0;
  let totalMatched = 0;
  let totalSpecial = 0;
  let totalMissing = 0;
  let totalCandidate = 0;
  let totalManualReq = 0;

  type Issue = {
    setlistId: string;
    entryId: string;
    title: string;
    status: string;
    bestFile?: string;
    bestScore?: number;
    bestReasons?: string[];
  };
  const missingIssues: Issue[] = [];
  const candidateIssues: Issue[] = [];
  type Suspicious = {
    setlistId: string;
    title: string;
    file: string;
    score: number;
    reasons: string[];
    overlap: string;
  };
  const suspiciousMatches: Suspicious[] = [];

  const usedFileKeyToEntries = new Map<string, Array<{ setlistId: string; title: string }>>();

  // 「全く違う楽曲」判定: entry 側の cleanedTitle と file 側の (ID3 title || 名前) の
  // どちらかが他方を包含する OR 共通 N-gram があれば「同曲圏内」とみなす。
  // どちらも該当しなければ "全く違う楽曲へ自動マッチした" 疑いとして列挙する。
  const normalizeForOverlap = (s: string): string =>
    s
      .normalize("NFKC")
      .toLowerCase()
      .replace(/\.(flac|mp3|m4a|aac|wav)$/i, "")
      .replace(/^\d{1,3}[-.\s_]+/, "")
      .replace(/_\d{4,}$/, "")
      .replace(/[\s()\[\]【】「」『』〜~・,.\-_:：!?！？]+/g, "");

  const hasCommonSubstring = (a: string, b: string, minLen = 2): string | null => {
    if (!a || !b) return null;
    if (a.includes(b) || b.includes(a)) return a.length <= b.length ? a : b;
    const short = a.length <= b.length ? a : b;
    const long = a.length <= b.length ? b : a;
    for (let len = short.length; len >= minLen; len--) {
      for (let i = 0; i + len <= short.length; i++) {
        const sub = short.slice(i, i + len);
        if (long.includes(sub)) return sub;
      }
    }
    return null;
  };

  for (const setlist of setlists) {
    const report = buildSetlistReadinessReport(setlist, tracks, records);
    totalEntries += report.totalEntries;
    totalMissing += report.missingEntries;
    for (const e of report.entries) {
      if (e.status === "matched") {
        totalMatched++;
        if (e.matchedFileKey) {
          const list = usedFileKeyToEntries.get(e.matchedFileKey) || [];
          const entry = setlist.entries.find((x) => x.entryId === e.entryId);
          list.push({
            setlistId: setlist.setlistId,
            title: entry?.displayTitle || e.entryId,
          });
          usedFileKeyToEntries.set(e.matchedFileKey, list);

          // 全く違う楽曲への自動マッチ検出
          const rec = records.find((r) => r.fileKey === e.matchedFileKey);
          const entryTitle = entry?.displayTitle || "";
          if (rec && entryTitle) {
            const fileTitleSource =
              rec.metadata?.title || rec.fileName || "";
            const a = normalizeForOverlap(entryTitle);
            const b = normalizeForOverlap(fileTitleSource);
            const common = hasCommonSubstring(a, b, 2);
            const best = e.candidates[0];
            if (!common) {
              suspiciousMatches.push({
                setlistId: setlist.setlistId,
                title: entryTitle,
                file: rec.fileName,
                score: best?.score ?? 0,
                reasons: best?.reasons ?? [],
                overlap: "(共通文字なし)",
              });
            }
          }
        }
      } else if (e.status === "special") {
        totalSpecial++;
      } else if (e.status === "candidate") {
        totalCandidate++;
      } else if (e.status === "manual_required") {
        totalManualReq++;
      }

      const entry = setlist.entries.find((x) => x.entryId === e.entryId);
      const title = entry?.displayTitle || e.entryId;
      if (e.status === "missing" && entry?.policy === "required") {
        // 該当しそうな wantedKey に対する候補スコア 1 位を補足
        const best = e.candidates[0];
        missingIssues.push({
          setlistId: setlist.setlistId,
          entryId: e.entryId,
          title,
          status: e.status,
          bestFile: best
            ? records.find((r) => r.fileKey === best.fileKey)?.fileName
            : undefined,
          bestScore: best?.score,
          bestReasons: best?.reasons,
        });
      }
      if (e.status === "candidate" || e.status === "manual_required") {
        const best = e.candidates[0];
        candidateIssues.push({
          setlistId: setlist.setlistId,
          entryId: e.entryId,
          title,
          status: e.status,
          bestFile: best
            ? records.find((r) => r.fileKey === best.fileKey)?.fileName
            : undefined,
          bestScore: best?.score,
          bestReasons: best?.reasons,
        });
      }
    }
  }

  console.log("\n=== Summary ===");
  console.log(`total entries: ${totalEntries}`);
  console.log(`  matched        : ${totalMatched}`);
  console.log(`  special        : ${totalSpecial}`);
  console.log(`  candidate      : ${totalCandidate}`);
  console.log(`  manual_required: ${totalManualReq}`);
  console.log(`  missing        : ${totalMissing}`);

  // 全く違う楽曲への自動マッチ (entry title と file title の共通文字なし)
  console.log(
    `\n=== ★ 全く違う楽曲へのマッチ疑い : ${suspiciousMatches.length} 件 ===`
  );
  const susByPair = new Map<string, Suspicious & { count: number }>();
  for (const s of suspiciousMatches) {
    const key = `${s.title}\t${s.file}`;
    const ex = susByPair.get(key);
    if (ex) ex.count++;
    else susByPair.set(key, { ...s, count: 1 });
  }
  const susSorted = Array.from(susByPair.values()).sort(
    (a, b) => b.count - a.count
  );
  for (const s of susSorted.slice(0, 40)) {
    console.log(
      `  entry="${s.title}" ← file="${s.file}"  score=${s.score.toFixed(3)} reasons=${s.reasons.join(",")} (x${s.count})`
    );
  }
  if (susSorted.length > 40) {
    console.log(`  ... (+${susSorted.length - 40} more)`);
  }

  // 同一ファイルが複数 entry に matched している = 誤マッチの疑い
  const collisions = Array.from(usedFileKeyToEntries.entries())
    .filter(([, list]) => {
      const titles = new Set(list.map((x) => x.title));
      return titles.size > 1;
    })
    .map(([fileKey, list]) => {
      const record = records.find((r) => r.fileKey === fileKey);
      return {
        file: record?.fileName,
        titles: Array.from(new Set(list.map((x) => x.title))),
        count: list.length,
      };
    });
  console.log(
    `\n=== 同一ファイルが異なる entry に matched (誤マッチの疑い) : ${collisions.length} 件 ===`
  );
  for (const c of collisions.slice(0, 30)) {
    console.log(`  ${c.file}  ← ${c.titles.join(" / ")}  (x${c.count})`);
  }
  if (collisions.length > 30) {
    console.log(`  ... (+${collisions.length - 30} more)`);
  }

  // missing 集計 (必須エントリのみ、タイトル別)
  const missingByTitle = new Map<string, number>();
  for (const m of missingIssues) {
    missingByTitle.set(m.title, (missingByTitle.get(m.title) || 0) + 1);
  }
  const sortedMissing = Array.from(missingByTitle.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  console.log(
    `\n=== Missing (required) タイトル別 出現回数 : ${sortedMissing.length} 種 ===`
  );
  for (const [title, count] of sortedMissing.slice(0, 60)) {
    // どのファイルが本来あてるべきか推測
    const guess = records.find((r) => {
      const tn = title;
      const f = r.fileName;
      return f.includes(tn);
    });
    console.log(
      `  ${title.padEnd(30)} x${count}${guess ? `  (ローカル候補: ${guess.fileName})` : ""}`
    );
  }
  if (sortedMissing.length > 60) {
    console.log(`  ... (+${sortedMissing.length - 60} more)`);
  }

  // candidate / manual_required タイトル別
  const candByTitle = new Map<string, number>();
  for (const c of candidateIssues) {
    candByTitle.set(c.title, (candByTitle.get(c.title) || 0) + 1);
  }
  const sortedCand = Array.from(candByTitle.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  console.log(
    `\n=== Candidate / manual_required タイトル別 : ${sortedCand.length} 種 ===`
  );
  for (const [title, count] of sortedCand.slice(0, 30)) {
    console.log(`  ${title.padEnd(30)} x${count}`);
  }

  // 各 manual_required タイトルの上位2候補スコア例
  console.log(`\n=== manual_required / candidate 上位2候補 (タイトルごと最初の1例) ===`);
  const seenTitles = new Set<string>();
  for (const c of candidateIssues) {
    if (seenTitles.has(c.title)) continue;
    seenTitles.add(c.title);
    const entryReport = setlists
      .map((s) => ({
        setlist: s,
        report: buildSetlistReadinessReport(s, tracks, records),
      }))
      .find(({ setlist }) => setlist.setlistId === c.setlistId);
    if (!entryReport) continue;
    const e = entryReport.report.entries.find((x) => x.entryId === c.entryId);
    if (!e) continue;
    console.log(`\n[${c.status}] ${c.title} (setlist=${c.setlistId})`);
    for (const cand of e.candidates.slice(0, 3)) {
      const rec = records.find((r) => r.fileKey === cand.fileKey);
      console.log(
        `  score=${cand.score.toFixed(3)}  reasons=${cand.reasons.join(",")}  file=${rec?.fileName}`
      );
    }
  }

  // missing required タイトルごとに、ローカルに「それらしい」ファイルがあるか
  console.log(`\n=== Missing (required) の各タイトル ローカル候補チェック ===`);
  const seenMissing = new Set<string>();
  for (const m of missingIssues) {
    if (seenMissing.has(m.title)) continue;
    seenMissing.add(m.title);
    const norm = m.title.toLowerCase();
    const guess = records.filter((r) => r.fileName.toLowerCase().includes(norm.replace(/feat\..*$/i, "").trim().split(/\s+/)[0] || norm));
    console.log(`\n[missing] ${m.title}`);
    if (guess.length === 0) {
      console.log("  ローカルに該当しそうな .flac/.m4a なし");
    } else {
      for (const g of guess.slice(0, 3)) {
        console.log(`  候補ファイル: ${g.fileName}`);
      }
    }
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
