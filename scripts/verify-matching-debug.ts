/*
 * scripts/verify-matching-debug.ts
 * 特定の entry タイトルがどう判定されるか詳細にダンプする。
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { parseFile } from "music-metadata";
import {
  applyMetadataToRecord,
  createLocalTrackRecord,
} from "../src/features/relive/library/localFiles";
import {
  buildSetlistReadinessReport,
} from "../src/features/relive/setlist/matching";
import type {
  AudioMetadata,
  LocalTrackRecord,
  Setlist,
  TrackMaster,
} from "../src/features/relive/types/relive";

const AUDIO_EXT = new Set([".flac", ".mp3", ".m4a", ".aac", ".wav"]);
const TARGETS = ["DEAD CENTER", "第六感", "不乱不破"];

const walk = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (e.isFile() && AUDIO_EXT.has(path.extname(e.name).toLowerCase()))
      out.push(full);
  }
  return out;
};

const toMockFile = async (full: string, root: string): Promise<File> => {
  const st = await fs.stat(full);
  const rel = path.relative(root, full);
  const f = new File([new Uint8Array(0)], path.basename(full), {
    type: "application/octet-stream",
    lastModified: st.mtimeMs,
  });
  Object.defineProperty(f, "webkitRelativePath", { value: rel });
  Object.defineProperty(f, "size", { value: st.size });
  return f;
};

const readMeta = async (full: string): Promise<AudioMetadata | undefined> => {
  try {
    const p = await parseFile(full, { skipCovers: true });
    const c = p.common || {};
    const f = p.format || {};
    const trim = (v?: string) =>
      typeof v === "string" && v.trim() ? v.trim() : undefined;
    const m: AudioMetadata = {
      title: trim(c.title),
      artist: trim(c.artist),
      album: trim(c.album),
      albumArtist: trim(c.albumartist),
      trackNo: typeof c.track?.no === "number" ? c.track.no : undefined,
      discNo: typeof c.disk?.no === "number" ? c.disk.no : undefined,
      durationSec: typeof f.duration === "number" ? f.duration : undefined,
      codec: trim(f.codec),
      sampleRate: typeof f.sampleRate === "number" ? f.sampleRate : undefined,
      bitRate: typeof f.bitrate === "number" ? f.bitrate : undefined,
      channels:
        typeof f.numberOfChannels === "number" ? f.numberOfChannels : undefined,
    };
    return Object.values(m).every((v) => v === undefined) ? undefined : m;
  } catch {
    return undefined;
  }
};

const main = async () => {
  const root = process.argv[2] || path.join(process.env.HOME || "", "Music", "mora");
  const files = await walk(root);
  const gen = path.join(__dirname, "..", "static", "relive", "generated");
  const tracksDoc = JSON.parse(await fs.readFile(path.join(gen, "tracks.json"), "utf8"));
  const tracks: TrackMaster[] = tracksDoc.tracks || tracksDoc;
  const setlistFiles = await fs.readdir(path.join(gen, "setlists"));
  const docs = await Promise.all(
    setlistFiles
      .filter((f) => f.endsWith(".json"))
      .map(async (f) =>
        JSON.parse(await fs.readFile(path.join(gen, "setlists", f), "utf8"))
      )
  );
  const setlists: Setlist[] = docs
    .flatMap((d) =>
      Array.isArray(d) ? d : d.setlists || (d.setlistId ? [d] : [])
    )
    .filter((s) => s && Array.isArray(s.entries));

  const records: LocalTrackRecord[] = [];
  await Promise.all(
    files.map(async (full) => {
      const file = await toMockFile(full, root);
      let r = createLocalTrackRecord(file);
      const m = await readMeta(full);
      if (m) r = applyMetadataToRecord(r, m);
      records.push(r);
    })
  );

  const trackById = new Map(tracks.map((t) => [t.trackId, t]));

  for (const target of TARGETS) {
    console.log(`\n========== "${target}" ==========`);
    // 該当する entry を探して1例だけ拾う
    let foundExample: { setlist: Setlist; entry: any } | null = null;
    for (const sl of setlists) {
      const ent = sl.entries.find((e: any) => e.displayTitle === target);
      if (ent) {
        foundExample = { setlist: sl, entry: ent };
        break;
      }
    }
    if (!foundExample) {
      console.log("  該当 entry なし");
      continue;
    }
    const { setlist, entry } = foundExample;
    console.log(`entry: ${JSON.stringify({
      entryId: entry.entryId,
      displayTitle: entry.displayTitle,
      trackId: entry.trackId,
      policy: entry.policy,
      expectedDurationSec: entry.expectedDurationSec,
    })}`);
    const tr = entry.trackId ? trackById.get(entry.trackId) : undefined;
    console.log(`track: ${tr ? JSON.stringify({
      trackId: tr.trackId,
      canonicalTitle: tr.canonicalTitle,
      aliases: tr.aliases,
    }) : "(none)"}`);

    const report = buildSetlistReadinessReport(setlist, tracks, records);
    const em = report.entries.find((e) => e.entryId === entry.entryId);
    console.log(`status: ${em?.status}  matchedFileKey: ${em?.matchedFileKey}`);
    if (em?.matchedFileKey) {
      const rec = records.find((r) => r.fileKey === em.matchedFileKey);
      console.log(`matched file: ${rec?.fileName}`);
      console.log(`  metadata: ${JSON.stringify(rec?.metadata)}`);
      console.log(`  titleKeys: ${JSON.stringify(rec?.normalized.titleKeys)}`);
    }
    console.log("top candidates:");
    for (const c of (em?.candidates || []).slice(0, 5)) {
      const rec = records.find((r) => r.fileKey === c.fileKey);
      console.log(
        `  score=${c.score.toFixed(3)} reasons=${c.reasons.join(",")} file=${rec?.fileName} metaTitle=${rec?.metadata?.title}`
      );
    }
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
