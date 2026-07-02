import { buildSetlistReadinessReport } from "../matching";
import { buildPlaybackQueue, playableFileKeysFromQueue } from "../playbackQueue";
import {
  applyMetadataToRecord,
  createLocalTrackRecord,
  normalizeTrackName,
} from "../../library/localFiles";
import type {
  AudioMetadata,
  LocalTrackRecord,
  Setlist,
  TrackMaster,
} from "../../types/relive";

const makeLocal = (
  fileKey: string,
  fileNameKey: string,
  durationSec?: number
): LocalTrackRecord => ({
  schemaVersion: 1,
  fileKey,
  fileName: `${fileKey}.flac`,
  extension: "flac",
  size: 1,
  lastModified: 0,
  normalized: {
    titleKeys: [fileNameKey],
    artistKeys: [],
    fileNameKey,
  },
  metadata: durationSec !== undefined ? { durationSec } : undefined,
  scannedAt: new Date(0).toISOString(),
});

const makeFile = (name: string): File =>
  new File([new Uint8Array([0])], name, { type: "application/octet-stream" });

const makeLocalFromFile = (
  name: string,
  metadata?: AudioMetadata
): LocalTrackRecord => {
  const record = createLocalTrackRecord(makeFile(name));
  return metadata ? applyMetadataToRecord(record, metadata) : record;
};

const baseSetlist: Setlist = {
  schemaVersion: 1,
  setlistId: "sl_test",
  entries: [
    {
      schemaVersion: 1,
      entryId: "e_song",
      order: 1,
      trackId: "t_giraffe",
      displayTitle: "Giraffe",
      policy: "required",
    },
    {
      schemaVersion: 1,
      entryId: "e_se",
      order: 2,
      displayTitle: "SE",
      policy: "se",
    },
    {
      schemaVersion: 1,
      entryId: "e_missing",
      order: 3,
      trackId: "t_unknown_song",
      displayTitle: "存在しない曲",
      policy: "required",
    },
  ],
};

const tracks: TrackMaster[] = [
  {
    schemaVersion: 1,
    trackId: "t_giraffe",
    canonicalTitle: "Giraffe",
    aliases: [],
    artistNames: ["Reol"],
    kind: "original",
  },
];

describe("buildSetlistReadinessReport", () => {
  it("ファイル名が一致するエントリは matched、SE は special、見つからないものは missing", () => {
    const localTracks: LocalTrackRecord[] = [makeLocal("file_giraffe", "giraffe")];
    const report = buildSetlistReadinessReport(baseSetlist, tracks, localTracks);

    const byId = new Map(report.entries.map((e) => [e.entryId, e]));
    expect(byId.get("e_song")?.status).toBe("matched");
    expect(byId.get("e_song")?.matchedFileKey).toBe("file_giraffe");
    expect(byId.get("e_se")?.status).toBe("special");
    expect(byId.get("e_missing")?.status).toBe("missing");

    expect(report.totalEntries).toBe(3);
    expect(report.playableEntries).toBe(2); // matched + special
    expect(report.missingEntries).toBe(1);
    expect(report.isFullyPlayable).toBe(false);
    expect(report.isPlayableWithWarnings).toBe(false);
  });

  it("manualMappings は完全一致より優先される", () => {
    const localTracks: LocalTrackRecord[] = [
      makeLocal("file_giraffe_v1", "giraffe"),
      makeLocal("file_manual_override", "totallydifferent"),
    ];
    const report = buildSetlistReadinessReport(baseSetlist, tracks, localTracks, [
      {
        schemaVersion: 1,
        mappingId: "m1",
        setlistEntryTrackId: "t_giraffe",
        fileKey: "file_manual_override",
        createdAt: new Date(0).toISOString(),
        updatedAt: new Date(0).toISOString(),
      },
    ]);
    const matched = report.entries.find((e) => e.entryId === "e_song");
    expect(matched?.status).toBe("matched");
    expect(matched?.matchedFileKey).toBe("file_manual_override");
  });
});

describe("buildPlaybackQueue", () => {
  it("matched + special の各エントリからキュー項目を作る", () => {
    const localTracks: LocalTrackRecord[] = [makeLocal("file_giraffe", "giraffe")];
    const report = buildSetlistReadinessReport(baseSetlist, tracks, localTracks);
    const queue = buildPlaybackQueue(baseSetlist, report, "テストキュー");

    expect(queue.title).toBe("テストキュー");
    expect(queue.setlistId).toBe("sl_test");

    const kinds = queue.items.map((item) => item.kind);
    expect(kinds).toEqual(expect.arrayContaining(["track", "gap"]));
    // missing は queue に含まれない
    const missingInQueue = queue.items.some((item) => item.entryId === "e_missing");
    expect(missingInQueue).toBe(false);
  });

  it("playableFileKeysFromQueue は track 種別の fileKey だけ返す", () => {
    const localTracks: LocalTrackRecord[] = [makeLocal("file_giraffe", "giraffe")];
    const report = buildSetlistReadinessReport(baseSetlist, tracks, localTracks);
    const queue = buildPlaybackQueue(baseSetlist, report);
    const fileKeys = playableFileKeysFromQueue(queue);
    expect(fileKeys).toEqual(["file_giraffe"]);
  });
});

describe("精度改善: 短曲名 / メタデータ照合", () => {
  // 短曲名 (≤3 文字) を含むセットリスト
  const shortTitleSetlist: Setlist = {
    schemaVersion: 1,
    setlistId: "sl_short",
    entries: [
      {
        schemaVersion: 1,
        entryId: "e_hakuya",
        order: 1,
        trackId: "t_hakuya",
        displayTitle: "白夜",
        policy: "required",
      },
      {
        schemaVersion: 1,
        entryId: "e_q",
        order: 2,
        trackId: "t_q",
        displayTitle: "Q?",
        policy: "required",
      },
    ],
  };
  const shortTitleTracks: TrackMaster[] = [
    {
      schemaVersion: 1,
      trackId: "t_hakuya",
      canonicalTitle: "白夜",
      aliases: [],
      artistNames: ["Reol"],
      kind: "original",
    },
    {
      schemaVersion: 1,
      trackId: "t_q",
      canonicalTitle: "Q?",
      aliases: [],
      artistNames: ["Reol"],
      kind: "original",
    },
  ];

  it("trackNo prefix 付きファイル名でも短曲名が matched になる (例: '01 白夜.flac')", () => {
    const localTracks = [makeLocalFromFile("01 白夜.flac")];
    const report = buildSetlistReadinessReport(
      shortTitleSetlist,
      shortTitleTracks,
      localTracks
    );
    const byId = new Map(report.entries.map((e) => [e.entryId, e]));
    expect(byId.get("e_hakuya")?.status).toBe("matched");
    expect(byId.get("e_hakuya")?.matchedFileKey).toBe(localTracks[0].fileKey);
  });

  it("normalizeTrackName は '?' '!' を保持する (Q? → q?)", () => {
    expect(normalizeTrackName("Q?")).toBe("q?");
    expect(normalizeTrackName("01 Q?.flac")).toBe("01q?");
  });

  it("trackNo prefix 付きの 'Q?' ファイル名で matched になる", () => {
    const localTracks = [makeLocalFromFile("01 Q?.flac")];
    const report = buildSetlistReadinessReport(
      shortTitleSetlist,
      shortTitleTracks,
      localTracks
    );
    const matched = report.entries.find((e) => e.entryId === "e_q");
    expect(matched?.status).toBe("matched");
    expect(matched?.matchedFileKey).toBe(localTracks[0].fileKey);
  });

  it("メタデータ title による完全一致は filename ノイズに勝つ (Track02.flac + ID3 'ヒビカセ')", () => {
    const setlist: Setlist = {
      schemaVersion: 1,
      setlistId: "sl_meta",
      entries: [
        {
          schemaVersion: 1,
          entryId: "e_hibikase",
          order: 1,
          trackId: "t_hibikase",
          displayTitle: "ヒビカセ",
          policy: "required",
        },
      ],
    };
    const metaTracks: TrackMaster[] = [
      {
        schemaVersion: 1,
        trackId: "t_hibikase",
        canonicalTitle: "ヒビカセ",
        aliases: [],
        artistNames: ["Reol"],
        kind: "original",
      },
    ];
    const localTracks = [
      makeLocalFromFile("Track 02.flac", { title: "ヒビカセ", artist: "Reol" }),
      // ファイル名は別曲名だがメタデータなし
      makeLocalFromFile("drop pop candy.flac"),
    ];
    const report = buildSetlistReadinessReport(setlist, metaTracks, localTracks);
    const matched = report.entries.find((e) => e.entryId === "e_hibikase");
    expect(matched?.status).toBe("matched");
    expect(matched?.matchedFileKey).toBe(localTracks[0].fileKey);
    expect(matched?.candidates?.[0]?.reasons).toContain("metadata_exact");
  });

  it("短い matchHints (1〜3文字) はファイル名部分一致を引き起こさない", () => {
    // 1 文字の matchHint "q" を持つ track。たまたま別曲ファイル名 "qualia.flac" を含むが
    // 短キー完全一致のみ許容 (substring 不可) なので誤マッチしない。
    const setlist: Setlist = {
      schemaVersion: 1,
      setlistId: "sl_q",
      entries: [
        {
          schemaVersion: 1,
          entryId: "e_q",
          order: 1,
          trackId: "t_q",
          displayTitle: "Q?",
          policy: "required",
        },
      ],
    };
    const qTracks: TrackMaster[] = [
      {
        schemaVersion: 1,
        trackId: "t_q",
        canonicalTitle: "Q?",
        aliases: [],
        artistNames: ["Reol"],
        kind: "original",
        matchHints: ["q"], // 旧データ互換: 1 文字 hint
      },
    ];
    // "qualia" は "q" を含むが、短キー完全一致のみのルールで誤マッチしない
    const localTracks = [makeLocalFromFile("qualia.flac")];
    const report = buildSetlistReadinessReport(setlist, qTracks, localTracks);
    const matched = report.entries.find((e) => e.entryId === "e_q");
    expect(matched?.status).toBe("missing");
  });
});

