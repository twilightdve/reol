import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Link as LinkIcon,
  MapPin,
  Pause,
  Play,
  Save,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { useAudioEngine, USER_EQ_FREQUENCIES } from "./audio-engine/useAudioEngine";
import { getSpeakerLayout } from "./audio-engine/speakerLayout";
import SpeakerWaveOverlay from "./visual-engine/SpeakerWaveOverlay";
import { collectLocalAudioFilesBatched } from "./library/localFiles";
import { buildSetlistReadinessReport } from "./setlist/matching";
import { buildPlaybackQueue } from "./setlist/playbackQueue";
import {
  bundledSampleData,
  loadGeneratedSetlist,
  loadReliveSampleData,
  type ReliveSampleData,
} from "./setlist/sampleData";
import {
  loadAppSettings,
  loadLiveMemoryPresets,
  loadLocalTracks,
  loadManualTrackMappings,
  saveAudioAnalysisCache,
  saveAppSettings,
  saveLiveMemoryPreset,
  saveLocalTracks,
  saveManualTrackMapping,
  savePlaybackQueue,
} from "./storage/db";
import type {
  AppSettings,
  LiveMemoryPreset,
  LocalTrackRecord,
  ManualTrackMapping,
  MemoryTags,
  PerformanceMode,
  PlaybackQueue,
  Vec3,
} from "./types/relive";
import ReliveCanvas from "./visual-engine/ReliveCanvas";

const defaultSettings: AppSettings = {
  schemaVersion: 1,
  performanceMode: "standard",
  // スマホ / PC スピーカーよりイヤホン接続を想定したチューニングをデフォルトにする。
  outputDeviceProfile: "earphones",
  wakeLockEnabled: false,
  mediaSessionEnabled: false,
  deviceOrientationEnabled: false,
  visual: {
    showTrackTitle: true,
    showPositionMap: false,
    reduceMotion: false,
  },
  audio: {
    masterGainDb: -3,
    limiterEnabled: true,
    normalizeTrackGain: false,
    userEqBands: [0, 0, 0, 0, 0, 0, 0, 0],
    // 未指定の間は会場プリセットの reverb を利用。
    reverb: undefined,
  },
  privacy: {
    localOnlyNoticeAccepted: false,
    analyticsEnabled: false,
  },
  updatedAt: new Date().toISOString(),
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${rest}`;
};

const makeId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const mergeSettings = (saved: AppSettings): AppSettings => ({
  ...defaultSettings,
  ...saved,
  visual: {
    ...defaultSettings.visual,
    ...saved.visual,
  },
  audio: {
    ...defaultSettings.audio,
    ...saved.audio,
    // userEqBands は既存データに無いことがあるため、長さを保証してフォールバック。
    userEqBands:
      Array.isArray(saved.audio?.userEqBands) && saved.audio.userEqBands.length === 8
        ? saved.audio.userEqBands
        : defaultSettings.audio.userEqBands,
    // reverb は saved にあればそれを使う。 undefined なら会場プリセットを使う。
    reverb: saved.audio?.reverb,
  },
  privacy: {
    ...defaultSettings.privacy,
    ...saved.privacy,
  },
});

const defaultMemoryTags: MemoryTags = {
  heat: 0.55,
  pressure: 0.55,
  pain: 0.35,
  release: 0.5,
  distance: 0.45,
  aftertaste: 0.72,
};

// 組み込み EQ プリセット (8 バンド: 60/170/350/700/1500/3000/6000/12000 Hz)。
const BUILT_IN_EQ_PRESETS: { id: string; name: string; bands: number[] }[] = [
  { id: "flat", name: "フラット", bands: [0, 0, 0, 0, 0, 0, 0, 0] },
  { id: "bass_boost", name: "重低音", bands: [6, 5, 3, 1, 0, 0, 0, 0] },
  { id: "vocal", name: "ボーカル", bands: [0, 0, -1, 2, 4, 3, 1, 0] },
  { id: "v_shape", name: "Vシェイプ", bands: [4, 3, 0, -2, -2, 0, 3, 4] },
  { id: "bright", name: "ブライト", bands: [0, 0, 0, 0, 1, 2, 3, 4] },
  { id: "warm", name: "ウォーム", bands: [3, 2, 1, 0, -1, -2, -2, -1] },
  { id: "rock", name: "ロック", bands: [4, 3, 1, 0, -1, 1, 3, 3] },
  { id: "pop", name: "ポップ", bands: [2, 1, 0, 1, 2, 2, 1, 2] },
];

const eqBandsEqual = (a: number[] | undefined, b: number[]) => {
  if (!a || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (Math.abs(a[i] - b[i]) > 0.05) return false;
  }
  return true;
};

const makeDefaultMemory = (sampleData: ReliveSampleData): LiveMemoryPreset => {
  const venue =
    sampleData.venues.find((item) => item.venueId === sampleData.setlist.venueId) ||
    sampleData.venues[0];
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    liveMemoryId: makeId("memory"),
    title: sampleData.setlist.liveTitle || "ライブメモリー",
    tourName: sampleData.setlist.tourName,
    liveTitle: sampleData.setlist.liveTitle,
    date: sampleData.setlist.date,
    venueId: venue?.venueId,
    venueName: sampleData.setlist.venueName || venue?.name,
    setlistId: sampleData.setlist.setlistId,
    listener: {
      // 1マス ≒ 1人。最前列から 2 マス (z=2) を既定位置とする (会場側で defaultListenerPosition があれば優先)。
      position: venue?.acoustic.spatial.defaultListenerPosition || { x: 0, y: 1.5, z: 2 },
      label: "center",
    },
    visual: {
      palette: {
        background: "#030407",
        primary: "#fff4ce",
        secondary: "#d93733",
        accent: "#4e94b8",
      },
      particleDensity: venue?.visualBias?.particleDensity ?? 0.72,
      afterglowDecay: venue?.visualBias?.afterglowDecay ?? 0.88,
      pressureBias: venue?.visualBias?.pressureBias ?? 0.7,
      bloomBias: venue?.visualBias?.bloomBias ?? 0.65,
      fractureBias: venue?.visualBias?.fractureBias ?? 0.55,
      driftBias: 0.45,
      beatSensitivity: 0.66,
      bassGravity: 0.64,
    },
    memoryTags: defaultMemoryTags,
    createdAt: now,
    updatedAt: now,
  };
};

type WakeLockSentinelLike = {
  release: () => Promise<void>;
};

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
};

/** 各パラメータの簡潔な説明文。? ボタン押下時に表示される。 */
const PARAM_HELP: Record<string, string> = {
  performanceMode:
    "視覚表現の濃さと処理負荷を切替えます。軽量=パーティクル少なめで省電力、標準=バランス、濃い=粒子多くアフターグロー長め。",
  venue:
    "会場プリセット。会場 EQ・ダイナミクス・スピーカー配置 (PA/サブ位置) が切り替わり、音の広がり方と残響が変わります。",
  outputDeviceProfile:
    "出力デバイス別の簡易 EQ ティルト。スピーカーは低域+2.5dB、car は低域+3dB/高域-1dB など、聴く環境に合わせ補正。",
  userEq:
    "8 バンドのグラフィックEQ (peaking, Q=1.0)。中心周波数 60/170/350/700Hz/1.5/3/6/12kHz を ±12dB の範囲で個別調整できます。",
  reverbAmount:
    "反響 (リバーブ) の混ぜ量 (wet)。0 でドライのみ、1.0 で反響送りフル。会場プリセットの初期値から手動で上書きします。",
  reverbDecay:
    "反響の減衰時間 (秒)。長いほど余韻が伸び、ホールやアリーナのような広い空間感に。",
  reverbPreDelay:
    "初期反射までの遅延 (ms)。大きいほどステージが近く・会場が遠く感じられる。\n会場プリセット使用時はポジションマップの前後位置 (奥行き) に応じて自動加算されます (約 1ms / マス, 上限 60ms)。",
  reverbDamping:
    "ダンピング。大きいほど余韻の高域が早く減衰して、暗く柔らかな响きに。",
  mediaSession:
    "OS のメディアコントロール (ロック画面・通知センター・Bluetooth リモコン) と連携します。",
  wakeLock:
    "再生中に画面が消えないようロックします。スマホで連続再生する時に便利。",
  listenerX:
    "音像配置の左右位置。AudioListener の X 座標を動かし、スピーカーとの位置関係で L/R 各音源の聞こえ方が変わります。",
  listenerZ:
    "ステージからの距離。離れるほどスピーカーまでの減衰で音量・サブの体感が下がります。会場タイプで減衰量も変化。",
  heat: "熱量。粒子密度とコアの明るさが上がり、視覚的に熱い表現に。",
  pressure: "音圧の手応え。低域に対するコア径と圧の効きを強める。",
  pain: "亀裂・鋭さ。高域反応で走る亀裂線の本数と太さが増える。",
  release: "解放感。視覚の抜け・空間の広さに寄与 (将来の reverb 連動用)。",
  distance: "心理的距離感。視点と中央のオフセットを調整 (将来拡張)。",
  aftertaste: "余韻の長さ。明滅の減衰が遅くなり、afterglow が長く残る。",
};

interface ParamHelpProps {
  id: string;
  text: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}

const ParamHelp: React.FC<ParamHelpProps> = ({ id, text, openId, setOpenId }) => {
  const open = openId === id;
  return (
    <span className="relive-help">
      <button
        type="button"
        className="relive-help-button"
        aria-expanded={open}
        aria-label="このパラメータの説明"
        onClick={(event) => {
          // label 内に置かれる場合に input がフォーカスされないよう抑制。
          event.preventDefault();
          event.stopPropagation();
          setOpenId(open ? null : id);
        }}
      >
        ?
      </button>
      {open && (
        <span className="relive-help-popover" role="tooltip">
          {text}
        </span>
      )}
    </span>
  );
};

const RelivePlayerApp: React.FC = () => {
  const directoryInputRef = useRef<HTMLInputElement | null>(null);
  const queueAdvanceRef = useRef<() => void>(() => undefined);
  // 非キューモードで「setlist 順に次/前の matched エントリへジャンプ」するためのヘルパー。
  // readinessReport が下の方で定義される都合上、ref 越しに最新版を参照する。
  // direction=+1 で次、-1 で前の matched setlist エントリに対応する tracks index を返す。
  // 一致が無い、または setlist 末端/先頭で更にめくれない場合は -1。
  const findSetlistTrackIndexRef = useRef<(direction: 1 | -1) => number>(
    () => -1
  );
  // 次に currentTrack が変化したら自動的に player.play() を呼ぶフラグ。
  // Next/Previous ボタンや auto-end (曲終端) でジャンプしたとき、
  // setCurrentIndex だけでは新トラックがロードされても再生は始まらないため、
  // ロード後の最初の render でこのフラグを見て play() する。
  const autoPlayOnTrackChangeRef = useRef(false);
  const lastPlayedFileKeyRef = useRef<string | undefined>(undefined);
  const [tracks, setTracks] = useState<LocalTrackRecord[]>([]);
  const [sessionFiles, setSessionFiles] = useState<Map<string, File>>(new Map());
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [sampleData, setSampleData] = useState<ReliveSampleData>(bundledSampleData);
  const [manualMappings, setManualMappings] = useState<ManualTrackMapping[]>([]);
  const [memoryPresets, setMemoryPresets] = useState<LiveMemoryPreset[]>([]);
  const [currentMemory, setCurrentMemory] = useState<LiveMemoryPreset>(() =>
    makeDefaultMemory(bundledSampleData)
  );
  const [activeQueue, setActiveQueue] = useState<PlaybackQueue | null>(null);
  const [isLoadingSetlist, setIsLoadingSetlist] = useState(false);
  const [isSampleDataLoaded, setIsSampleDataLoaded] = useState(false);
  // 公演ドロップダウンを「全て / ワンマン / イベント」で絞り込むフィルタ。
  // setlistsIndex の `type` フィールド ("oneman" | "event" | null) と対応。
  const [setlistTypeFilter, setSetlistTypeFilter] = useState<
    "all" | "oneman" | "event" | "other"
  >("all");
  const [queueIndex, setQueueIndex] = useState(0);
  const [queueRunning, setQueueRunning] = useState(false);
  const [queuePhaseRemaining, setQueuePhaseRemaining] = useState(0);
  const [storageNote, setStorageNote] = useState("");
  // どのパラメータの ? が開いているか (排他: 同時に開くのは 1 つだけ)。
  const [openHelpId, setOpenHelpId] = useState<string | null>(null);
  // 音声エフェクト (会場 EQ / デバイス EQ / PA スピーカー配置 / 残響 / リミッタ) を
  // すべてバイパスして素の音と比較するためのトグル。設定として永続化はしない。
  const [effectsBypassed, setEffectsBypassed] = useState(false);
  const selectedVenue =
    sampleData.venues.find((venue) => venue.venueId === currentMemory.venueId) ||
    sampleData.venues[0];

  const currentQueueItem = activeQueue?.items[queueIndex];
  const queuedFileKeys = activeQueue
    ? activeQueue.items
        .filter((item) => item.kind === "track" && item.fileKey)
        .map((item) => item.fileKey as string)
    : [];
  const playbackTracks =
    queuedFileKeys.length > 0
      ? queuedFileKeys
          .map((fileKey) => tracks.find((track) => track.fileKey === fileKey))
          .filter((track): track is LocalTrackRecord => Boolean(track))
      : tracks;
  const currentQueueTrackIndex =
    activeQueue && currentQueueItem?.kind === "track"
      ? activeQueue.items
          .slice(0, queueIndex + 1)
          .filter((item) => item.kind === "track" && item.fileKey).length - 1
      : -1;
  // ユーザー上書きがあればそれを使い、無ければ会場プリセット + 距離 (listenerZ) に応じた
  // プリディレイ自動加算 (1ms / 座席マス、上限 60ms) を適用する。
  // listener.x は寄与が小さいため連動対象外。
  const effectiveReverb = useMemo(() => {
    if (settings.audio.reverb) {
      return settings.audio.reverb;
    }
    const base = selectedVenue?.acoustic.reverb;
    if (!base) return undefined;
    const distanceBonusMs = Math.max(0, currentMemory.listener.position.z) * 1.0;
    return {
      ...base,
      preDelayMs: Math.min(60, (base.preDelayMs ?? 0) + distanceBonusMs),
    };
  }, [settings.audio.reverb, selectedVenue, currentMemory.listener.position.z]);

  const player = useAudioEngine(
    playbackTracks,
    sessionFiles,
    selectedVenue,
    settings.audio.masterGainDb + (selectedVenue?.acoustic.dynamics.outputGainDb ?? 0),
    settings.audio.limiterEnabled,
    () => queueAdvanceRef.current(),
    currentMemory.listener.position.x,
    currentMemory.listener.position.z,
    settings.outputDeviceProfile,
    settings.audio.userEqBands,
    effectiveReverb,
    effectsBypassed
  );

  // currentTrack 変更後に autoPlayOnTrackChangeRef が立っていたら自動再生する。
  // useAudioEngine の loadTrack effect は audio.src を差し替えるだけで play() を
  // 呼ばないため、Next/Previous/auto-end で曲を切り替えた直後に再生が止まる。
  // RelivePlayerApp 側でフラグを立てて、ロード反映後に明示的に play() を呼ぶ。
  useEffect(() => {
    const newKey = player.currentTrack?.fileKey;
    if (newKey === lastPlayedFileKeyRef.current) return;
    lastPlayedFileKeyRef.current = newKey;
    if (!autoPlayOnTrackChangeRef.current) return;
    autoPlayOnTrackChangeRef.current = false;
    if (!newKey) return;
    void player.play();
  }, [player.currentTrack?.fileKey, player.play]);

  useEffect(() => {
    directoryInputRef.current?.setAttribute("webkitdirectory", "");
    directoryInputRef.current?.setAttribute("directory", "");

    void loadAppSettings()
      .then((saved) => {
        if (saved) {
          setSettings(mergeSettings(saved));
        }
      })
      .catch((err) => {
        console.warn("[relive] loadAppSettings failed", err);
        setStorageNote((current) => current || "保存済みのアプリ設定を読み込めませんでした。");
      });

    void loadLocalTracks()
      .then((savedTracks) => {
        if (savedTracks.length > 0) {
          setTracks(savedTracks);
          setStorageNote("前回のファイルメタ情報を読み込みました。再生には再選択が必要です。");
        }
      })
      .catch((err) => {
        console.warn("[relive] loadLocalTracks failed", err);
        setStorageNote(
          (current) => current || "保存済みのファイル一覧を読み込めませんでした。"
        );
      });

    void loadReliveSampleData()
      .then((loaded) => {
        setSampleData(loaded);
        setIsSampleDataLoaded(true);
        setCurrentMemory((current) => ({
          ...makeDefaultMemory(loaded),
          ...current,
          venueId: current.venueId || loaded.venues[0]?.venueId,
          venueName: current.venueName || loaded.setlist.venueName || loaded.venues[0]?.name,
        }));
      })
      .catch((err) => {
        console.warn("[relive] loadReliveSampleData failed", err);
        setStorageNote(
          (current) =>
            current ||
            `静的JSON (${err instanceof Error ? err.message : "不明なエラー"}) の取得に失敗したため、内蔵フォールバックを使っています。`
        );
      });

    void loadManualTrackMappings()
      .then(setManualMappings)
      .catch((err) => {
        console.warn("[relive] loadManualTrackMappings failed", err);
      });

    void loadLiveMemoryPresets()
      .then((presets) => {
        setMemoryPresets(presets);
        if (presets[0]) {
          setCurrentMemory(presets[0]);
        }
      })
      .catch((err) => {
        console.warn("[relive] loadLiveMemoryPresets failed", err);
      });

    return () => {
      // 進行中のファイル読み込みを中断
      fileLoadAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    void saveAppSettings({ ...settings, updatedAt: new Date().toISOString() }).catch((err) =>
      console.warn("[relive] saveAppSettings failed", err)
    );
  }, [settings]);

  const saveCurrentAnalysis = useCallback(() => {
    const cache = player.buildAnalysisCache();
    if (!cache) {
      return;
    }
    void saveAudioAnalysisCache(cache).catch(() => {
      setStorageNote("解析キャッシュをIndexedDBへ保存できませんでした。");
    });
    player.resetAnalysis();
  }, [player.buildAnalysisCache, player.resetAnalysis]);

  const advanceQueue = useCallback(() => {
    saveCurrentAnalysis();
    if (!activeQueue) {
      // 非キューモードでも setlist が読まれていれば、tracks 配列の次の要素ではなく
      // setlist 上で次に matched している曲へジャンプする。
      const nextIdx = findSetlistTrackIndexRef.current(1);
      if (nextIdx >= 0) {
        autoPlayOnTrackChangeRef.current = true;
        player.setCurrentIndex(nextIdx);
        return;
      }
      // setlist が無い (= 自由再生) 場合のみ従来通り tracks を進める。
      // setlist 末端に到達したケースは「公演終了」として停止する。
      const hasSetlist = (sampleData.setlist.entries?.length ?? 0) > 0;
      if (hasSetlist) {
        player.pause();
        return;
      }
      autoPlayOnTrackChangeRef.current = true;
      player.next();
      return;
    }

    setQueueIndex((current) => {
      if (current >= activeQueue.items.length - 1) {
        setQueueRunning(false);
        setQueuePhaseRemaining(0);
        setStorageNote("キューは終演しました。残光だけが残っています。");
        player.pause();
        return current;
      }
      return current + 1;
    });
  }, [
    activeQueue,
    player.next,
    player.pause,
    player.setCurrentIndex,
    saveCurrentAnalysis,
    sampleData.setlist.entries,
  ]);

  useEffect(() => {
    queueAdvanceRef.current = advanceQueue;
  }, [advanceQueue]);

  useEffect(() => {
    if (!activeQueue || !currentQueueItem) {
      return;
    }

    if (currentQueueItem.kind === "track") {
      if (currentQueueTrackIndex >= 0 && player.currentIndex !== currentQueueTrackIndex) {
        player.setCurrentIndex(currentQueueTrackIndex);
      }
      return;
    }

    player.pause();
  }, [
    activeQueue,
    currentQueueItem,
    currentQueueTrackIndex,
    player.currentIndex,
    player.pause,
    player.setCurrentIndex,
  ]);

  useEffect(() => {
    if (!queueRunning || !activeQueue || !currentQueueItem) {
      return undefined;
    }

    if (currentQueueItem.kind === "track") {
      setQueuePhaseRemaining(0);
      void player.play();
      return undefined;
    }

    player.pause();
    const durationSec =
      currentQueueItem.durationSec || (currentQueueItem.kind === "afterglow" ? 9 : 4);
    const startedAt = Date.now();
    setQueuePhaseRemaining(durationSec);

    const interval = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      setQueuePhaseRemaining(Math.max(0, durationSec - elapsed));
    }, 250);
    const timeout = window.setTimeout(() => {
      advanceQueue();
    }, durationSec * 1000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [activeQueue, advanceQueue, currentQueueItem, player.pause, player.play, queueRunning]);

  useEffect(() => {
    if (!settings.mediaSessionEnabled || typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title:
        player.currentTrack?.metadata?.title ||
        player.currentTrack?.fileName ||
        "Relive Player",
      artist: player.currentTrack?.metadata?.artist || "Local file",
      album: player.currentTrack?.metadata?.album || currentMemory.title,
    });
    navigator.mediaSession.setActionHandler("play", () => {
      void player.play();
    });
    navigator.mediaSession.setActionHandler("pause", player.pause);
    navigator.mediaSession.setActionHandler("previoustrack", player.previous);
    navigator.mediaSession.setActionHandler("nexttrack", player.next);
  }, [
    currentMemory.title,
    player.currentTrack?.fileName,
    player.currentTrack?.metadata?.title,
    player.currentTrack?.metadata?.artist,
    player.currentTrack?.metadata?.album,
    player.next,
    player.pause,
    player.play,
    player.previous,
    settings.mediaSessionEnabled,
  ]);

  useEffect(() => {
    let sentinel: WakeLockSentinelLike | null = null;
    if (!settings.wakeLockEnabled || typeof navigator === "undefined") {
      return undefined;
    }

    void (navigator as NavigatorWithWakeLock).wakeLock
      ?.request("screen")
      .then((nextSentinel) => {
        sentinel = nextSentinel;
      })
      .catch(() => undefined);

    return () => {
      void sentinel?.release().catch(() => undefined);
    };
  }, [settings.wakeLockEnabled]);

  const readinessReport = useMemo(() => {
    const base = buildSetlistReadinessReport(
      sampleData.setlist,
      sampleData.tracks,
      tracks,
      manualMappings
    );
    // sessionFiles に実 File blob がない場合 (リロード直後など) は
    // metadata 上は matched/candidate でも実際には再生不可。
    // UI 表示は missing 扱いに格下げして counts も再計算する。
    const adjustedEntries = base.entries.map((entry) => {
      if (entry.status === "matched" && entry.matchedFileKey) {
        if (!sessionFiles.has(entry.matchedFileKey)) {
          return {
            ...entry,
            status: "missing" as const,
            matchedFileKey: undefined,
            missingReason: "file_blob_missing",
          };
        }
      }
      if (entry.status === "candidate" || entry.status === "manual_required") {
        const hasAnyBlob = (entry.candidates || []).some(
          (candidate) => candidate.fileKey && sessionFiles.has(candidate.fileKey)
        );
        if (!hasAnyBlob) {
          return {
            ...entry,
            status: "missing" as const,
            missingReason: "file_blob_missing",
          };
        }
      }
      return entry;
    });
    const playableEntries = adjustedEntries.filter(
      (entry) => entry.status === "matched" || entry.status === "special"
    ).length;
    const missingEntries = adjustedEntries.filter(
      (entry) => entry.status === "missing"
    ).length;
    const candidateEntries = adjustedEntries.filter(
      (entry) => entry.status === "candidate" || entry.status === "manual_required"
    ).length;
    const specialEntries = adjustedEntries.filter(
      (entry) => entry.status === "special"
    ).length;
    return {
      ...base,
      entries: adjustedEntries,
      playableEntries,
      missingEntries,
      candidateEntries,
      specialEntries,
      isFullyPlayable: missingEntries === 0 && candidateEntries === 0,
      isPlayableWithWarnings: playableEntries > 0 && missingEntries === 0,
    };
  }, [manualMappings, sampleData, tracks, sessionFiles]);

  // セトリ切替時に「1曲目」へ意味的にジャンプする。
  // - tracks[0] (任意の最初のローカルファイル) ではなく、
  //   readinessReport から "最初に matched なエントリ" を探し、その fileKey に対応する
  //   `tracks` (キュー未起動時は full tracks) のインデックスへ設定する。
  // - 1曲目が special / missing の場合は誤って関係ない曲を選ばないよう、
  //   後続の最初に matched なエントリへ進める。matched が無ければ何もしない。
  // - readinessReport は新セトリの load 完了後に同 setlistId で再計算されるため、
  //   setlistId 一致をガード条件にしている。
  const lastJumpedSetlistIdRef = useRef<string | null>(null);
  useEffect(() => {
    const id = sampleData.setlist.setlistId;
    if (!id || readinessReport.setlistId !== id) {
      return;
    }
    if (lastJumpedSetlistIdRef.current === id) {
      return;
    }
    if (activeQueue) {
      player.setCurrentIndex(0);
      lastJumpedSetlistIdRef.current = id;
      return;
    }
    const firstMatched = readinessReport.entries.find(
      (entry) => entry.status === "matched" && entry.matchedFileKey
    );
    if (firstMatched?.matchedFileKey) {
      const idx = tracks.findIndex(
        (track) => track.fileKey === firstMatched.matchedFileKey
      );
      if (idx >= 0) {
        player.setCurrentIndex(idx);
        lastJumpedSetlistIdRef.current = id;
        return;
      }
      // 該当 fileKey がまだ tracks に出揃っていない: 次の更新で再評価する。
      return;
    }
    // matched エントリが 1 つも無い: 不適切な自動選曲を避けるため currentIndex は変更しない。
    // ref はロックしない (後で sessionFiles が揃って matched に復帰した際に再評価する)。
  }, [
    sampleData.setlist.setlistId,
    readinessReport,
    tracks,
    activeQueue,
    player.setCurrentIndex,
  ]);

  const entryById = useMemo(
    () => new Map(sampleData.setlist.entries.map((entry) => [entry.entryId, entry])),
    [sampleData]
  );

  // readinessReport を entryId で逆引きするための Map。
  const readinessByEntryId = useMemo(
    () => new Map(readinessReport.entries.map((e) => [e.entryId, e])),
    [readinessReport]
  );

  // findSetlistTrackIndexRef を最新値で更新する。
  // (advanceQueue 等が readinessReport 宣言より上にあるため、ref 経由で参照する)
  useEffect(() => {
    findSetlistTrackIndexRef.current = (direction: 1 | -1) => {
      const entries = sampleData.setlist.entries ?? [];
      if (entries.length === 0) return -1;
      const currentFileKey = player.currentTrack?.fileKey;
      let startIdx = -1;
      if (currentFileKey) {
        const match = readinessReport.entries.find(
          (e) =>
            e.status === "matched" && e.matchedFileKey === currentFileKey
        );
        if (match) {
          startIdx = entries.findIndex((e) => e.entryId === match.entryId);
        }
      }
      // 現在曲が setlist にマッチしていない場合は、direction=+1 のとき
      // 「最初の matched」、-1 のときは諦めて -1 を返す。
      if (startIdx === -1 && direction === -1) return -1;
      const len = entries.length;
      for (let step = 1; step <= len; step += 1) {
        const idx = startIdx + direction * step;
        if (idx < 0 || idx >= len) return -1;
        const entry = entries[idx];
        const matched = readinessByEntryId.get(entry.entryId);
        if (
          !matched ||
          matched.status !== "matched" ||
          !matched.matchedFileKey
        ) {
          continue;
        }
        const trackIdx = tracks.findIndex(
          (t) => t.fileKey === matched.matchedFileKey
        );
        if (trackIdx >= 0) return trackIdx;
      }
      return -1;
    };
  }, [
    sampleData.setlist.entries,
    readinessReport,
    readinessByEntryId,
    tracks,
    player.currentTrack?.fileKey,
  ]);

  // 音源をフォルダ単位でグルーピングしたドロップダウンリストを作る。
  // relativePath がないファイル (ファイル選択ケース) は "(ファイル選択)" グループへ。
  // sessionFiles に実 File blob が無いトラック (リロード直後など) は実際には
  // 再生できないのでリストから除外する。
  const tracksByFolder = useMemo(() => {
    const folderMap = new Map<string, LocalTrackRecord[]>();
    tracks.forEach((track) => {
      if (!sessionFiles.has(track.fileKey)) {
        return;
      }
      const rel = track.relativePath;
      const folder = rel && rel.includes("/")
        ? rel.slice(0, rel.lastIndexOf("/"))
        : "(ファイル選択)";
      const list = folderMap.get(folder);
      if (list) {
        list.push(track);
      } else {
        folderMap.set(folder, [track]);
      }
    });
    return Array.from(folderMap.entries())
      .map(([folder, items]) => ({
        folder,
        tracks: [...items].sort((a, b) => a.fileName.localeCompare(b.fileName)),
      }))
      .sort((a, b) => a.folder.localeCompare(b.folder));
  }, [tracks, sessionFiles]);

  // 自動デフォルト紐付け済みの mappingId 集合。
  // setlist 切り替え時にリセットし、同一 entry に対して何度も上書きしないようにする。
  const autoAppliedMappingIdsRef = useRef<Set<string>>(new Set());
  const urlSetlistAppliedRef = useRef(false);
  useEffect(() => {
    autoAppliedMappingIdsRef.current = new Set();
  }, [sampleData.setlist.setlistId]);

  // URL クエリ `?setlistId=...` で指定された公演を初回ロード時に自動適用する。
  // ファンサイト側のセットリスト表示からRelive Playerへ遷移したときの主要導線。
  // bundledSampleData の setlistsIndex は fallback 1件のみのため、
  // 必ず async ロード完了 (isSampleDataLoaded) を待ってから判定する。
  useEffect(() => {
    if (urlSetlistAppliedRef.current) return;
    if (typeof window === "undefined") return;
    if (!isSampleDataLoaded) return;
    const params = new URLSearchParams(window.location.search);
    const urlSetlistId = params.get("setlistId") || params.get("setlist");
    urlSetlistAppliedRef.current = true;
    if (!urlSetlistId) return;
    const exists = sampleData.setlistsIndex.some(
      (item) => item.setlistId === urlSetlistId
    );
    if (!exists) return;
    if (urlSetlistId !== sampleData.setlist.setlistId) {
      handleSetlistChange(urlSetlistId);
    }
  }, [isSampleDataLoaded, sampleData.setlistsIndex, sampleData.setlist.setlistId]);

  const fileLoadAbortRef = useRef<AbortController | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileLoadProgress, setFileLoadProgress] = useState<{
    processed: number;
    total: number;
  } | null>(null);

  // バッチ処理に切り替えるしきい値。これ以下なら同期処理。
  // - createLocalTrackRecord は純粋な文字列正規化のみで 1件あたり <1ms 想定
  // - 50件 / バッチで rAF を挟むと、iPhone でも数百ms単位のフリーズに収まる試算
  // - 数千件規模では FileList 確保自体が支配的になるため、これ以上増やしてもメリットが薄い
  const BATCH_THRESHOLD = 50;
  const BATCH_SIZE = 50;
  // 進捗 UI は最大このペースで更新する（React 再描画の暴走を防ぐ）
  const PROGRESS_UPDATE_INTERVAL_MS = 120;

  const handleFiles = (fileList: FileList | null) => {
    // 既存読み込みを中断
    fileLoadAbortRef.current?.abort();

    const fileCount = fileList?.length ?? 0;

    if (fileCount === 0) {
      return;
    }

    // 大量ファイル: バッチ処理でメインスレッドを解放しながら進める。
    // 50 件以下は 1 バッチで完了するため、同期パスと async パスを統一して
    // メタデータ (ID3) 抽出を全ケースで有効化する。
    const controller = new AbortController();
    fileLoadAbortRef.current = controller;

    setActiveQueue(null);
    setQueueIndex(0);
    setQueueRunning(false);
    setQueuePhaseRemaining(0);
    // tracks 刷新に合わせて自動ジャンプ ref をリセット。
    lastJumpedSetlistIdRef.current = null;
    setStorageNote("");
    // 小ファイル数のときは進捗 UI を出さない (体感即時にする)
    const showProgress = fileCount > BATCH_THRESHOLD;
    setIsLoadingFiles(showProgress);
    setFileLoadProgress(showProgress ? { processed: 0, total: fileCount } : null);

    let lastProgressUpdateAt = 0;

    void collectLocalAudioFilesBatched(fileList, {
      batchSize: BATCH_SIZE,
      signal: controller.signal,
      extractMetadata: true,
      onProgress: (progress) => {
        if (controller.signal.aborted || !showProgress) {
          return;
        }
        const now =
          typeof performance !== "undefined" ? performance.now() : Date.now();
        const isFinal = progress.processed >= progress.total;
        if (!isFinal && now - lastProgressUpdateAt < PROGRESS_UPDATE_INTERVAL_MS) {
          return;
        }
        lastProgressUpdateAt = now;
        setFileLoadProgress({ processed: progress.processed, total: progress.total });
      },
    })
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }
        setTracks(result.records);
        setSessionFiles(result.sessionFiles);
        setIsLoadingFiles(false);
        setFileLoadProgress(null);
        void saveLocalTracks(result.records).catch(() => {
          setStorageNote("IndexedDBに保存できませんでした。セッション中の再生は続けられます。");
        });
      })
      .catch((error) => {
        if ((error as { name?: string })?.name === "AbortError") {
          return;
        }
        setIsLoadingFiles(false);
        setFileLoadProgress(null);
        setStorageNote("ファイル読み込み中にエラーが発生しました。");
      });
  };

  const updatePerformanceMode = (performanceMode: PerformanceMode) => {
    setSettings((current) => ({ ...current, performanceMode }));
  };

  const updateMemoryPosition = (axis: keyof Vec3, value: number) => {
    setCurrentMemory((current) => ({
      ...current,
      listener: {
        ...current.listener,
        position: {
          ...current.listener.position,
          [axis]: value,
        },
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  /**
   * ポジションマップの横スケール (m → %)。
   *
   * 旧実装は「1m = 4%」固定だったため、ライブハウス (L/R が ±3m) では中央寄り、
   * アリーナ (SL/SR が ±18m) では端で頭打ち、という不自然な描画になっていた。
   * 会場の SPK 最大 |x| に 15% の余白を足した値をマップ半幅 (= 44%) として使う。
   * 最低 ±6m は確保し、フォールバック (selectedVenue 未選択) は ±8m。
   */
  const mapHalfWidthM = useMemo(() => {
    if (!selectedVenue) return 8;
    const layout = getSpeakerLayout(selectedVenue);
    const maxAbsX = layout.reduce(
      (max, spec) => Math.max(max, Math.abs(spec.position.x)),
      0
    );
    return Math.max(maxAbsX * 1.15, 6);
  }, [selectedVenue]);
  /** x(m) → left(%) (50 ± 44 にクランプ)。 */
  const xToLeftPct = useCallback(
    (xM: number) =>
      50 + Math.max(-44, Math.min(44, (xM / mapHalfWidthM) * 44)),
    [mapHalfWidthM]
  );

  /**
   * ポジションマップ上のポインタイベントから listener.position(x, z) を直接設定する。
   * マップの縦軸 (top 4%–92%) は会場の depth(m) にマップされる:
   *   z(m) = ((topPct - 4) / 88) * depthM
   * 横軸はマップ半幅 mapHalfWidthM(m) を ±44% にマップ:
   *   x(m) ≒ ((leftPct - 50) / 44) * mapHalfWidthM
   */
  const handlePositionMapPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    // 主ボタン(左クリック)以外、または接触がリリースされた後の hover は無視。
    if (event.pointerType === "mouse" && event.buttons === 0 && event.type !== "pointerdown") {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    const leftPct = ((event.clientX - rect.left) / rect.width) * 100;
    const topPct = ((event.clientY - rect.top) / rect.height) * 100;
    const venueType = selectedVenue?.type;
    const depthM =
      selectedVenue?.acoustic.spatial?.depth ??
      (venueType === "arena"
        ? 70
        : venueType === "outdoor"
        ? 60
        : venueType === "hall"
        ? 44
        : 28);
    // 逆変換 + 会場範囲にクランプ。
    const xRaw = ((leftPct - 50) / 44) * mapHalfWidthM;
    const x = Math.max(-mapHalfWidthM, Math.min(mapHalfWidthM, xRaw));
    const zRaw = ((Math.max(4, Math.min(92, topPct)) - 4) / 88) * depthM;
    const z = Math.max(0, Math.min(depthM, zRaw));
    setCurrentMemory((current) => ({
      ...current,
      listener: {
        ...current.listener,
        position: {
          ...current.listener.position,
          x: Math.round(x * 10) / 10,
          z: Math.round(z * 10) / 10,
        },
      },
      updatedAt: new Date().toISOString(),
    }));
    // pointerdown 時のみキャプチャしてドラッグ追従を有効化。
    if (event.type === "pointerdown") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  /**
   * セトリスト上の任意の曲をクリックしてそこにジャンプして再生を開始する。
   * - activeQueue (再生キュー作成済) の場合: キュー内の同 fileKey の track item を探して
   *   queueIndex をそこに移し、queueRunning を true にしてキューを開始させる。
   * - キュー未作成の場合: tracks に同 fileKey を探して player.setCurrentIndex し、
   *   autoPlayOnTrackChangeRef を立てて負荷完了後に自動再生させる。
   */
  const handleJumpToSetlistEntry = (matchedFileKey: string | null | undefined) => {
    if (!matchedFileKey) return;
    if (activeQueue) {
      const qIdx = activeQueue.items.findIndex(
        (it) => it.kind === "track" && it.fileKey === matchedFileKey
      );
      if (qIdx >= 0) {
        setQueueIndex(qIdx);
        setQueuePhaseRemaining(0);
        setQueueRunning(true);
        return;
      }
    }
    const idx = tracks.findIndex((t) => t.fileKey === matchedFileKey);
    if (idx < 0) return;
    autoPlayOnTrackChangeRef.current = true;
    player.setCurrentIndex(idx);
  };

  const handleManualMapping = (entryId: string, fileKey: string) => {
    const entry = entryById.get(entryId);
    if (!entry || !fileKey) {
      return;
    }
    const mapping: ManualTrackMapping = {
      schemaVersion: 1,
      mappingId: `${sampleData.setlist.setlistId}:${entry.entryId}`,
      setlistEntryTrackId: entry.trackId,
      setlistEntryTitle: entry.displayTitle,
      trackId: entry.trackId,
      fileKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setManualMappings((current) => [
      ...current.filter((item) => item.mappingId !== mapping.mappingId),
      mapping,
    ]);
    void saveManualTrackMapping(mapping).catch(() => {
      setStorageNote("手動紐付けをIndexedDBへ保存できませんでした。");
    });
  };

  // 候補スコアが十分に高い entry については、ユーザー操作を省くため
  // トップ候補を自動デフォルトとして紐付ける。
  // - 既に手動 / 自動マッピング済みのものは触らない
  // - 同一 entry に対して二度自動適用しない（ユーザーが空に戻した場合の暴走防止）
  const AUTO_DEFAULT_MIN_SCORE = 0.6;
  useEffect(() => {
    if (tracks.length === 0) {
      return;
    }
    const existingMappingIds = new Set(manualMappings.map((mapping) => mapping.mappingId));
    readinessReport.entries.forEach((item) => {
      if (item.status !== "candidate" && item.status !== "manual_required") {
        return;
      }
      const top = item.candidates?.[0];
      if (!top || !top.fileKey || top.score < AUTO_DEFAULT_MIN_SCORE) {
        return;
      }
      const mappingId = `${sampleData.setlist.setlistId}:${item.entryId}`;
      if (existingMappingIds.has(mappingId)) {
        return;
      }
      if (autoAppliedMappingIdsRef.current.has(mappingId)) {
        return;
      }
      autoAppliedMappingIdsRef.current.add(mappingId);
      handleManualMapping(item.entryId, top.fileKey);
    });
    // handleManualMapping は安定参照ではないが、依存は readinessReport / tracks の変化で十分。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readinessReport, tracks, sampleData.setlist.setlistId]);

  // セトリ + readinessReport が確定したら自動で再生キューを生成する。
  // (旧: 「playable queueを作る」ボタンを押させていたが、ボタンを廃止して自動化)
  // - state 更新のみで player.setCurrentIndex はここでは触らない
  //   (別の useEffect が「最初に matched な entry」へジャンプする副作用を持っているため)
  // - IndexedDB への保存もここでは行わない
  //   (毎回 readiness が変化するたびに書き込みが発生して無駄になるため)
  useEffect(() => {
    if (!sampleData.setlist) {
      return;
    }
    const queue = buildPlaybackQueue(
      sampleData.setlist,
      readinessReport,
      sampleData.setlist.liveTitle || "残響キュー"
    );
    setActiveQueue(queue);
  }, [sampleData.setlist, readinessReport]);

  const handleSetlistChange = (setlistId: string) => {
    if (!setlistId || setlistId === sampleData.setlist.setlistId) {
      return;
    }

    setIsLoadingSetlist(true);
    setActiveQueue(null);
    setQueueIndex(0);
    setQueueRunning(false);
    setQueuePhaseRemaining(0);
    player.pause();
    // ここでは player.setCurrentIndex を呼ばない。
    // 新しいセトリの readinessReport が確定した後、
    // 「最初に matched なエントリ」へジャンプする副作用に任せる。
    // (1曲目が special / missing の場合に無関係な tracks[0] が再生される不具合を防ぐ)

    void loadGeneratedSetlist(setlistId)
      .then((setlist) => {
        setSampleData((current) => ({
          ...current,
          setlist,
        }));
        const venue =
          sampleData.venues.find((item) => item.venueId === setlist.venueId) ||
          sampleData.venues[0];
        setCurrentMemory((current) => ({
          ...current,
          title: setlist.liveTitle || setlist.tourName || current.title,
          tourName: setlist.tourName,
          liveTitle: setlist.liveTitle,
          date: setlist.date,
          venueId: venue?.venueId || setlist.venueId,
          venueName: setlist.venueName || venue?.name,
          setlistId: setlist.setlistId,
          listener: {
            ...current.listener,
            position: venue?.acoustic.spatial.defaultListenerPosition || current.listener.position,
          },
          updatedAt: new Date().toISOString(),
        }));
        setStorageNote("");
      })
      .catch(() => {
        setStorageNote("セトリJSONを読み込めませんでした。");
      })
      .finally(() => {
        setIsLoadingSetlist(false);
      });
  };

  const handleSaveMemory = () => {
    const preset = {
      ...currentMemory,
      updatedAt: new Date().toISOString(),
    };
    setCurrentMemory(preset);
    setMemoryPresets((current) => [
      preset,
      ...current.filter((item) => item.liveMemoryId !== preset.liveMemoryId),
    ]);
    void saveLiveMemoryPreset(preset).catch(() => {
      setStorageNote("公演記憶をIndexedDBへ保存できませんでした。");
    });
  };

  const handleTogglePlayback = () => {
    if (!activeQueue) {
      player.togglePlay();
      return;
    }

    if (queueRunning) {
      setQueueRunning(false);
      player.pause();
      return;
    }

    setStorageNote("");
    setQueueRunning(true);
  };

  const handlePrevious = () => {
    if (!activeQueue) {
      const prevIdx = findSetlistTrackIndexRef.current(-1);
      if (prevIdx >= 0) {
        // 現在再生中ならジャンプ後も再生を継続。ポーズ中ならトラック読み込みのみ。
        autoPlayOnTrackChangeRef.current = player.isPlaying;
        player.setCurrentIndex(prevIdx);
        return;
      }
      const hasSetlist = (sampleData.setlist.entries?.length ?? 0) > 0;
      if (hasSetlist) return; // setlist 先頭で更に戻れない場合は no-op
      autoPlayOnTrackChangeRef.current = player.isPlaying;
      player.previous();
      return;
    }

    setQueueRunning(false);
    player.pause();
    setQueuePhaseRemaining(0);
    setQueueIndex((current) => Math.max(0, current - 1));
  };

  const handleNext = () => {
    if (!activeQueue) {
      const nextIdx = findSetlistTrackIndexRef.current(1);
      if (nextIdx >= 0) {
        autoPlayOnTrackChangeRef.current = player.isPlaying;
        player.setCurrentIndex(nextIdx);
        return;
      }
      const hasSetlist = (sampleData.setlist.entries?.length ?? 0) > 0;
      if (hasSetlist) return;
      autoPlayOnTrackChangeRef.current = player.isPlaying;
      player.next();
      return;
    }
    advanceQueue();
  };

  // セトリが選ばれている場合は "再生キュー" が組まれていなくても、現在曲名として
  // セトリの並び順に対応する曲名を表示する。これによりセトリ確定 → 一曲目が即座に
  // 表示される自然な挙動になる。
  // tracks (ユーザーがローカルで読み込んだ任意のオーディオ並び) のインデックスと
  // setlist エントリのインデックスは無関係なので、現在再生中の fileKey が
  // どの setlist エントリに matched しているかを readinessReport から逆引きする。
  const setlistEntries = sampleData.setlist.entries ?? [];
  const currentSetlistEntry = (() => {
    if (setlistEntries.length === 0) return undefined;
    const currentFileKey = player.currentTrack?.fileKey;
    if (currentFileKey) {
      const match = readinessReport.entries.find(
        (entry) =>
          entry.status === "matched" && entry.matchedFileKey === currentFileKey
      );
      if (match) {
        const entry = setlistEntries.find((e) => e.entryId === match.entryId);
        if (entry) return entry;
      }
    }
    // 現在曲が setlist にマッチしていない (まだ未選曲 / 未マッチ) なら
    // 1 曲目をプレースホルダとして表示する。
    return setlistEntries[0];
  })();
  const currentSetlistEntryIndex = currentSetlistEntry
    ? setlistEntries.findIndex((e) => e.entryId === currentSetlistEntry.entryId)
    : -1;
  const currentQueueLabel = activeQueue
    ? `${Math.min(queueIndex + 1, activeQueue.items.length)} / ${activeQueue.items.length}`
    : setlistEntries.length > 0
      ? `${currentSetlistEntryIndex >= 0 ? currentSetlistEntryIndex + 1 : 1} / ${setlistEntries.length}`
      : tracks.length > 0
        ? `${player.currentIndex + 1} / ${tracks.length}`
        : "0 / 0";
  // プレイヤー表示タイトルはファイルのメタデータ (ID3 タグ等) を最優先して表示する。
  // メタデータが無い場合はセトリ表示名 / ファイル名 / 「音源未選択」の順でフォールバック。
  const currentTrackTitle =
    player.currentTrack?.metadata?.title ||
    currentSetlistEntry?.displayTitle ||
    player.currentTrack?.fileName ||
    "音源未選択";
  const currentQueueTitle = activeQueue
    ? currentQueueItem?.kind === "track"
      ? currentTrackTitle
      : currentQueueItem?.title || "残光"
    : currentTrackTitle;
  const currentQueueDetail = activeQueue
    ? currentQueueItem?.kind === "track"
      ? `${activeQueue.title} / local track`
      : `${activeQueue.title} / ${currentQueueItem?.kind || "afterglow"} ${formatTime(queuePhaseRemaining)}`
    : currentSetlistEntry
      ? `${sampleData.setlist.liveTitle || sampleData.setlist.tourName || "セトリ"} / ${currentSetlistEntry.policy}`
      : player.currentTrack?.extension.toUpperCase() || "FLAC / MP3 / M4A / AAC / WAV";
  const canPlay = activeQueue ? Boolean(currentQueueItem) : Boolean(player.currentTrack);
  const canGoPrevious = activeQueue ? queueIndex > 0 : player.currentIndex > 0;
  const canGoNext = activeQueue
    ? queueIndex < activeQueue.items.length - 1
    : tracks.length > 0 && player.currentIndex < tracks.length - 1;

  const visualIntensity =
    settings.performanceMode === "battery_saver"
      ? 0.5
      : settings.performanceMode === "high_visual"
        ? 1.7
        : 1.0;

  return (
    <main className="relive-shell">
      {player.audioElement}
      <section className="relive-room">
        <div className="relive-hero">
          <p className="relive-kicker">!Legit private room</p>
          <h1>Relive Player</h1>
          <p>当プレーヤーでは音源は含まれていません。</p>
          <p>選択された音源は外部のサーバ等へは一切アップロードされないため、ページを開く度に再読み込みが必要です。</p>
          <p className="relive-disclaimer">非公式ファンサイト内のローカル再生室です。</p>
        </div>

        <section className="relive-panel relive-setlist-picker" aria-label="公演選択">
          <div className="relive-panel-title">
            <h2>公演を選ぶ</h2>
          </div>
          <div
            className="relive-setlist-filter"
            role="radiogroup"
            aria-label="公演カテゴリで絞り込み"
          >
            {(
              [
                { value: "all", label: "すべて" },
                { value: "oneman", label: "ワンマン" },
                { value: "event", label: "イベント" },
                { value: "other", label: "その他" },
              ] as const
            ).map((opt) => {
              const count =
                opt.value === "all"
                  ? sampleData.setlistsIndex.length
                  : sampleData.setlistsIndex.filter((s) =>
                      opt.value === "other"
                        ? !s.type || (s.type !== "oneman" && s.type !== "event")
                        : s.type === opt.value
                    ).length;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={setlistTypeFilter === opt.value}
                  className={`relive-setlist-filter-chip${
                    setlistTypeFilter === opt.value ? " is-active" : ""
                  }`}
                  onClick={() => setSetlistTypeFilter(opt.value)}
                  disabled={count === 0}
                >
                  {opt.label}
                  <span className="relive-setlist-filter-count">({count})</span>
                </button>
              );
            })}
          </div>
          {(() => {
            // フィルタ条件を適用 + 選択中の公演が外れないよう必ず残す
            const filtered = sampleData.setlistsIndex.filter((s) => {
              if (setlistTypeFilter === "all") return true;
              if (setlistTypeFilter === "other") {
                return !s.type || (s.type !== "oneman" && s.type !== "event");
              }
              return s.type === setlistTypeFilter;
            });
            const selectedId = sampleData.setlist.setlistId;
            const selectedItem = sampleData.setlistsIndex.find(
              (s) => s.setlistId === selectedId
            );
            if (selectedItem && !filtered.some((s) => s.setlistId === selectedId)) {
              filtered.unshift(selectedItem);
            }

            // liveUuid 単位で「ツアー」グループに集約
            const groups = new Map<string, typeof filtered>();
            for (const s of filtered) {
              const arr = groups.get(s.liveUuid) || [];
              arr.push(s);
              groups.set(s.liveUuid, arr);
            }
            const tours = Array.from(groups.values()).map((arr) =>
              arr.slice().sort((a, b) => a.liveItemUuid.localeCompare(b.liveItemUuid))
            );
            tours.sort(
              (a, b) =>
                (b[0].date || "").localeCompare(a[0].date || "") ||
                b[0].liveUuid.localeCompare(a[0].liveUuid)
            );

            const currentTour =
              tours.find((t) => t[0].liveUuid === selectedItem?.liveUuid) ||
              (selectedItem ? [selectedItem] : []);

            // ツアー名表示: 複数会場ある場合は会場名らしき末尾を取り除く
            const tourLabel = (
              head: (typeof filtered)[number],
              count: number
            ) => {
              const dateLabel = head.date || "date unknown";
              if (count <= 1) return `${dateLabel} ${head.title}`;
              const stripped = head.venueName
                ? head.title.replace(head.venueName, "").trim()
                : head.title;
              const tourName = stripped || head.title;
              return `${dateLabel}〜 ${tourName} (全${count}会場)`;
            };

            return (
              <>
                <label className="relive-setlist-picker-field">
                  <span className="relive-sr">ツアー</span>
                  <select
                    value={selectedItem?.liveUuid ?? ""}
                    disabled={isLoadingSetlist}
                    onChange={(event) => {
                      const liveUuid = event.target.value;
                      const tour = tours.find((t) => t[0].liveUuid === liveUuid);
                      if (tour && tour[0]) handleSetlistChange(tour[0].setlistId);
                    }}
                  >
                    {tours.map((tour) => (
                      <option key={tour[0].liveUuid} value={tour[0].liveUuid}>
                        {tourLabel(tour[0], tour.length)}
                      </option>
                    ))}
                  </select>
                </label>
                {currentTour.length > 1 && (
                  <label className="relive-setlist-picker-field">
                    <span className="relive-sr">会場</span>
                    <select
                      value={sampleData.setlist.setlistId}
                      disabled={isLoadingSetlist}
                      onChange={(event) => handleSetlistChange(event.target.value)}
                    >
                      {currentTour.map((s) => (
                        <option key={s.setlistId} value={s.setlistId}>
                          {`${s.date || "date unknown"} ${s.venueName || s.title} (${s.songCount}曲)`}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            );
          })()}
          <p className="relive-note">
            選んだ公演のセットリスト順で再生キューを構築します。
          </p>
        </section>
        <div className="relive-actions" aria-label="音源選択">
          <button type="button" onClick={() => directoryInputRef.current?.click()}>
            <Upload size={18} aria-hidden="true" />
            音源フォルダを選ぶ
          </button>
          <input
            ref={directoryInputRef}
            type="file"
            multiple
            hidden
            accept=".flac,.mp3,.m4a,.aac,.wav,audio/flac,audio/mpeg,audio/mp4,audio/aac,audio/wav"
            onChange={(event) => handleFiles(event.target.files)}
          />
        </div>

        <section className="relive-stage" aria-label="プレイヤー">
          <ReliveCanvas
            readFrame={player.readFrame}
            performanceMode={settings.performanceMode}
            intensity={visualIntensity}
            venue={selectedVenue}
            memoryTags={currentMemory.memoryTags}
            onMemoryTagsChange={(tags) =>
              setCurrentMemory((current) => ({
                ...current,
                memoryTags: tags,
                updatedAt: new Date().toISOString(),
              }))
            }
            onPerformanceModeChange={updatePerformanceMode}
          />
          <div className="relive-now">
            <span>{currentQueueLabel}</span>
            <strong>{currentQueueTitle}</strong>
            <small>{currentQueueDetail}</small>
          </div>
        </section>

        <section className="relive-controls" aria-label="再生操作">
          <div className="relive-transport">
            <button type="button" onClick={handlePrevious} disabled={!canGoPrevious}>
              <SkipBack size={20} aria-hidden="true" />
              <span className="relive-sr">前曲</span>
            </button>
            <button type="button" className="relive-play" onClick={handleTogglePlayback} disabled={!canPlay}>
              {player.isPlaying || queueRunning ? <Pause size={24} aria-hidden="true" /> : <Play size={24} aria-hidden="true" />}
              <span className="relive-sr">{player.isPlaying || queueRunning ? "停止" : "再生"}</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
            >
              <SkipForward size={20} aria-hidden="true" />
              <span className="relive-sr">次曲</span>
            </button>
          </div>
          <label className="relive-seek">
            <span>{formatTime(player.currentTime)}</span>
            <input
              type="range"
              min={0}
              max={player.duration || 0}
              step={0.1}
              value={Math.min(player.currentTime, player.duration || 0)}
              disabled={!player.currentTrack || !player.duration || currentQueueItem?.kind !== "track" && Boolean(activeQueue)}
              onChange={(event) => player.seek(Number(event.target.value))}
            />
            <span>{formatTime(player.duration)}</span>
          </label>
          <div className="relive-effects-toggle" role="group" aria-label="音声エフェクト">
            <button
              type="button"
              className={`relive-effects-toggle-button${effectsBypassed ? " is-bypassed" : ""}`}
              onClick={() => setEffectsBypassed((current) => !current)}
              aria-pressed={effectsBypassed}
              title={
                effectsBypassed
                  ? "会場 EQ・PA・残響・リミッタを全てバイパス中 (素の音)。クリックでエフェクトを戻す。"
                  : "会場 EQ・PA・残響・リミッタを全てバイパスして素の音と比較する。"
              }
            >
              <span className="relive-effects-toggle-led" aria-hidden="true" />
              <span className="relive-effects-toggle-label">
                {effectsBypassed
                  ? "音声エフェクト: OFF (素の音)"
                  : "音声エフェクト: ON (会場·PA·残響)"}
              </span>
            </button>
          </div>
          {player.error && <p className="relive-error">{player.error}</p>}
          {storageNote && <p className="relive-note">{storageNote}</p>}
          {isLoadingFiles && fileLoadProgress && (
            <p className="relive-note">
              音源を読み込み中… {fileLoadProgress.processed} / {fileLoadProgress.total}
            </p>
          )}
        </section>

        {(() => {
          // 音源マッチは「うまくマッチしない時だけ調整する」セクション。
          // 普段は折りたたみで、要調整 (candidate / missing) が残っているときだけ
          // サマリに警告マークを出して目立たせる。
          const needsAttention =
            readinessReport.candidateEntries + readinessReport.missingEntries > 0;
          return (
            <details
              className={`relive-panel relive-matching${needsAttention ? " relive-matching-attention" : ""}`}
            >
              <summary className="relive-matching-summary">
                <span className="relive-matching-title">
                  音源マッチ
                  {needsAttention && (
                    <span className="relive-matching-badge" aria-label="要調整">
                      要調整
                    </span>
                  )}
                </span>
                <span className="relive-matching-counts">
                  matched {readinessReport.playableEntries - readinessReport.specialEntries}
                  {" / "}candidate {readinessReport.candidateEntries}
                  {" / "}missing {readinessReport.missingEntries}
                  {readinessReport.specialEntries > 0 && (
                    <> / special {readinessReport.specialEntries}</>
                  )}
                </span>
              </summary>
              <div className="relive-panel-heading">
                <div>
                  <h2>
                    {sampleData.setlist.liveTitle ||
                      sampleData.setlist.tourName ||
                      readinessReport.setlistId}
                  </h2>
                  <p>{sampleData.setlist.venueName || sampleData.venues[0]?.name}</p>
                </div>
                <dl className="relive-summary">
                  <div>
                    <dt>matched</dt>
                    <dd>{readinessReport.playableEntries - readinessReport.specialEntries}</dd>
                  </div>
                  <div>
                    <dt>candidate</dt>
                    <dd>{readinessReport.candidateEntries}</dd>
                  </div>
                  <div>
                    <dt>missing</dt>
                    <dd>{readinessReport.missingEntries}</dd>
                  </div>
                  <div>
                    <dt>special</dt>
                    <dd>{readinessReport.specialEntries}</dd>
                  </div>
                </dl>
              </div>
              {activeQueue && (
                <p className="relive-note">
                  {activeQueue.items.filter((item) => item.kind === "track").length} tracks /{" "}
                  {activeQueue.items.filter((item) => item.kind !== "track").length} afterglow or special
                </p>
              )}
              <ol className="relive-setlist">
                {readinessReport.entries.map((item) => {
                  const entry = entryById.get(item.entryId);
                  const candidateFileKeys = (item.candidates || [])
                    .map((candidate) => candidate.fileKey)
                    .filter((fileKey): fileKey is string => Boolean(fileKey));
                  const candidateFileKeySet = new Set(candidateFileKeys);
                  const hasBackedTracks = tracksByFolder.some(
                    (group) => group.tracks.length > 0
                  );
                  const canSelect = item.status !== "special" && hasBackedTracks;
                  return (
                    <li key={item.entryId} className={`status-${item.status}`}>
                      <span>{entry?.order}</span>
                      <div>
                        <div className="relive-setlist-title-row">
                          {item.matchedFileKey && (
                            <button
                              type="button"
                              className="relive-setlist-play-button"
                              onClick={() =>
                                handleJumpToSetlistEntry(item.matchedFileKey)
                              }
                              aria-label={`${entry?.displayTitle || item.entryId} を再生`}
                              title="この曲を再生"
                            >
                              {player.isPlaying &&
                              player.currentTrack?.fileKey === item.matchedFileKey ? (
                                <Pause size={13} aria-hidden="true" />
                              ) : (
                                <Play size={13} aria-hidden="true" />
                              )}
                            </button>
                          )}
                          <strong>{entry?.displayTitle || item.entryId}</strong>
                        </div>
                        <small>
                          {item.matchedFileKey ||
                            item.missingReason ||
                            `${item.candidates?.length || 0} candidate`}
                        </small>
                        {canSelect && (
                          <label className="relive-mapping-select">
                            <LinkIcon size={13} aria-hidden="true" />
                            <select
                              value={item.matchedFileKey || ""}
                              onChange={(event) =>
                                handleManualMapping(item.entryId, event.target.value)
                              }
                            >
                              <option value="">
                                {item.matchedFileKey ? "音源を選び直す" : "音源を紐付ける"}
                              </option>
                              {tracksByFolder.map(({ folder, tracks: folderTracks }) => (
                                <optgroup key={folder} label={folder}>
                                  {folderTracks.map((track) => {
                                    const isCandidate = candidateFileKeySet.has(track.fileKey);
                                    return (
                                      <option key={track.fileKey} value={track.fileKey}>
                                        {isCandidate ? `★ ${track.fileName}` : track.fileName}
                                      </option>
                                    );
                                  })}
                                </optgroup>
                              ))}
                            </select>
                          </label>
                        )}
                      </div>
                      <em>{item.status}</em>
                    </li>
                  );
                })}
              </ol>
            </details>
          );
        })()}

        <section className="relive-panel" aria-label="会場設定">
          <div className="relive-panel-title">
            <MapPin size={17} aria-hidden="true" />
            <h2>会場</h2>
          </div>
          <p className="relive-note">
            {currentMemory.venueName || selectedVenue?.name || "会場未設定"}
            <span className="relive-note-hint"> ／ セトリ選択で自動設定されます</span>
          </p>
          <p className="relive-position-map-hint">
            マップをタップ / ドラッグすると視聴位置を移動できます (左右・前後)
          </p>
          <div
            className="relive-position-map"
            role="application"
            aria-label="音像配置 (タップで位置指定)"
            onPointerDown={handlePositionMapPointer}
            onPointerMove={handlePositionMapPointer}
          >
            {(() => {
              // ポジションマップの縦軸は会場の depth(m) を 0–88% にマップする統一座標系。
              //   ステージ (z=0m) → top 4%、最後尾 (z=depthM) → top 92%
              // スピーカーもリスナーも同じスケールでプロットする。
              const venueType = selectedVenue?.type;
              const depthM =
                selectedVenue?.acoustic.spatial?.depth ??
                (venueType === "arena"
                  ? 70
                  : venueType === "outdoor"
                  ? 60
                  : venueType === "hall"
                  ? 44
                  : 28);
              const zToTopPct = (zM: number) =>
                4 + (Math.max(0, Math.min(depthM, zM)) / depthM) * 88;
              const speakerLayout = getSpeakerLayout(selectedVenue);
              return (
                <>
                  {/* 音響特性反映の波形オーバーレイ (SPK 種別ごとに色/速度/太さが変化) */}
                  <SpeakerWaveOverlay
                    speakers={speakerLayout}
                    depthM={depthM}
                    mapHalfWidthM={mapHalfWidthM}
                    isPlaying={player.isPlaying || queueRunning}
                    readFrame={player.readFrame}
                  />
                  {speakerLayout.map((spec, index) => (
                    <div
                      key={`${spec.kind}-${index}`}
                      className={`relive-speaker-marker relive-speaker-${spec.kind.toLowerCase()}${
                        player.isPlaying || queueRunning ? " is-playing" : ""
                      }`}
                      style={{
                        left: `${xToLeftPct(spec.position.x)}%`,
                        top: `${zToTopPct(spec.position.z)}%`,
                        // 各スピーカーのアニメーション開始タイミングをずらして
                        // 同時に膨らむのを避ける (会場内の到達時間差を擬似的に表現)。
                        animationDelay: `${(index % 6) * 0.18}s`,
                      }}
                      aria-label={`speaker ${spec.kind}`}
                    >
                      {spec.kind}
                    </div>
                  ))}
                  <div
                    className="relive-position-dot"
                    style={{
                      left: `${xToLeftPct(currentMemory.listener.position.x)}%`,
                      top: `${zToTopPct(currentMemory.listener.position.z)}%`,
                    }}
                  />
                </>
              );
            })()}
          </div>
          {(() => {
            const sources = selectedVenue?.acoustic.spatial?.sources;
            if (sources && sources.length > 0) {
              return (
                <div className="relive-speaker-sources" aria-label="スピーカー構成の出典">
                  <p className="relive-speaker-sources-title">PA / スピーカー構成の出典</p>
                  <ul>
                    {sources.map((src, idx) => (
                      <li key={`${src.label}-${idx}`}>
                        {src.url ? (
                          <a href={src.url} target="_blank" rel="noopener noreferrer">
                            {src.label}
                          </a>
                        ) : (
                          <span>{src.label}</span>
                        )}
                        {src.note && (
                          <span className="relive-speaker-sources-note"> — {src.note}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            return (
              <p className="relive-speaker-sources-fallback">
                ※ この会場の PA / スピーカー構成は実情報源が未登録のため、
                会場タイプ・ステージ幅・奥行きから一般的な PA 構成を{" "}
                <strong>推定</strong>して表示しています (実際の運用とは異なる場合があります)。
              </p>
            );
          })()}
          <div className="relive-field-grid">
            <label>
              <span>
                左右
                <ParamHelp
                  id="listenerX"
                  text={PARAM_HELP.listenerX}
                  openId={openHelpId}
                  setOpenId={setOpenHelpId}
                />
              </span>
              <input
                type="range"
                min={-10}
                max={10}
                step={0.1}
                value={currentMemory.listener.position.x}
                onChange={(event) => updateMemoryPosition("x", Number(event.target.value))}
              />
            </label>
            <label>
              <span>
                距離
                <ParamHelp
                  id="listenerZ"
                  text={PARAM_HELP.listenerZ}
                  openId={openHelpId}
                  setOpenId={setOpenHelpId}
                />
              </span>
              <input
                type="range"
                min={1}
                max={80}
                step={0.5}
                value={currentMemory.listener.position.z}
                onChange={(event) => updateMemoryPosition("z", Number(event.target.value))}
              />
            </label>
          </div>
          <button type="button" className="relive-wide-button" onClick={handleSaveMemory}>
            <Save size={17} aria-hidden="true" />
            公演記憶を保存
          </button>
          <p className="relive-note">{memoryPresets.length} memories saved locally</p>
        </section>

        <section className="relive-panel" aria-label="音声設定">
          <div className="relive-panel-title">
            <SlidersHorizontal size={17} aria-hidden="true" />
            <h2>音声</h2>
          </div>
          <div className="relive-field-grid">
            <label>
              <span>
                出力
                <ParamHelp
                  id="outputDeviceProfile"
                  text={PARAM_HELP.outputDeviceProfile}
                  openId={openHelpId}
                  setOpenId={setOpenHelpId}
                />
              </span>
              <select
                value={settings.outputDeviceProfile}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    outputDeviceProfile: event.target.value as AppSettings["outputDeviceProfile"],
                  }))
                }
              >
                <option value="default">default</option>
                <option value="earphones">earphones</option>
                <option value="wired_headphones">wired</option>
                <option value="speaker">speaker</option>
                <option value="car_bluetooth">car</option>
              </select>
            </label>
          </div>
          <div className="relive-eq">
            <div className="relive-eq-header">
              <span>
                グラフィックEQ
                <ParamHelp
                  id="userEq"
                  text={PARAM_HELP.userEq}
                  openId={openHelpId}
                  setOpenId={setOpenHelpId}
                />
              </span>
              <button
                type="button"
                className="relive-eq-reset"
                onClick={() =>
                  setSettings((current) => ({
                    ...current,
                    audio: {
                      ...current.audio,
                      userEqBands: [0, 0, 0, 0, 0, 0, 0, 0],
                    },
                  }))
                }
              >
                リセット
              </button>
            </div>
            {(() => {
              const currentBands = settings.audio.userEqBands ?? [0, 0, 0, 0, 0, 0, 0, 0];
              const customPresets = settings.audio.customEqPresets ?? [];
              const allPresets = [...BUILT_IN_EQ_PRESETS, ...customPresets];
              const matched = allPresets.find((preset) =>
                eqBandsEqual(currentBands, preset.bands)
              );
              const matchedCustom = matched
                ? customPresets.find((preset) => preset.id === matched.id)
                : undefined;
              const handleSelectPreset = (presetId: string) => {
                const preset = allPresets.find((item) => item.id === presetId);
                if (!preset) return;
                setSettings((current) => ({
                  ...current,
                  audio: { ...current.audio, userEqBands: [...preset.bands] },
                }));
              };
              const handleSavePreset = () => {
                if (typeof window === "undefined") return;
                const name = window.prompt(
                  "保存するEQプリセット名を入力してください",
                  `カスタム ${customPresets.length + 1}`
                );
                if (!name) return;
                const trimmed = name.trim();
                if (!trimmed) return;
                const newPreset = {
                  id: makeId("eq"),
                  name: trimmed,
                  bands: [...currentBands],
                };
                setSettings((current) => ({
                  ...current,
                  audio: {
                    ...current.audio,
                    customEqPresets: [...(current.audio.customEqPresets ?? []), newPreset],
                  },
                }));
              };
              const handleDeletePreset = () => {
                if (!matchedCustom) return;
                if (typeof window !== "undefined") {
                  const confirmed = window.confirm(
                    `カスタムEQ「${matchedCustom.name}」を削除しますか?`
                  );
                  if (!confirmed) return;
                }
                setSettings((current) => ({
                  ...current,
                  audio: {
                    ...current.audio,
                    customEqPresets: (current.audio.customEqPresets ?? []).filter(
                      (preset) => preset.id !== matchedCustom.id
                    ),
                  },
                }));
              };
              return (
                <div className="relive-eq-presets">
                  <select
                    value={matched?.id ?? ""}
                    onChange={(event) => handleSelectPreset(event.target.value)}
                  >
                    <option value="" disabled>
                      {matched ? "プリセット選択" : "カスタム (未保存)"}
                    </option>
                    <optgroup label="組み込み">
                      {BUILT_IN_EQ_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name}
                        </option>
                      ))}
                    </optgroup>
                    {customPresets.length > 0 && (
                      <optgroup label="カスタム">
                        {customPresets.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {preset.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <button
                    type="button"
                    className="relive-eq-reset"
                    onClick={handleSavePreset}
                    title="現在のスライダー値をカスタムプリセットとして保存"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    className="relive-eq-reset"
                    onClick={handleDeletePreset}
                    disabled={!matchedCustom}
                    title={
                      matchedCustom
                        ? `「${matchedCustom.name}」を削除`
                        : "カスタムプリセット選択中のみ削除可能"
                    }
                  >
                    削除
                  </button>
                </div>
              );
            })()}
            <div className="relive-eq-bands">
              {USER_EQ_FREQUENCIES.map((frequency, index) => {
                const value = settings.audio.userEqBands?.[index] ?? 0;
                const labelHz = frequency >= 1000 ? `${frequency / 1000}k` : `${frequency}`;
                return (
                  <div key={frequency} className="relive-eq-band">
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={0.5}
                      value={value}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        setSettings((current) => {
                          const bands = [...(current.audio.userEqBands ?? [0, 0, 0, 0, 0, 0, 0, 0])];
                          bands[index] = next;
                          return {
                            ...current,
                            audio: { ...current.audio, userEqBands: bands },
                          };
                        });
                      }}
                      aria-label={`${labelHz}Hz`}
                    />
                    <span className="relive-eq-band-value">{value > 0 ? `+${value}` : value}</span>
                    <span className="relive-eq-band-label">{labelHz}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relive-reverb">
            <div className="relive-eq-header">
              <span>反響 (リバーブ)</span>
              <button
                type="button"
                className="relive-eq-reset"
                onClick={() =>
                  setSettings((current) => ({
                    ...current,
                    audio: { ...current.audio, reverb: undefined },
                  }))
                }
                title="会場プリセットの値に戻す"
              >
                会場値に戻す
              </button>
            </div>
            {(() => {
              const venueReverb = selectedVenue?.acoustic.reverb;
              const effective = settings.audio.reverb ||
                venueReverb || {
                  amount: 0,
                  decaySec: 1.2,
                  preDelayMs: 0,
                  damping: 0.5,
                };
              const updateReverb = (patch: Partial<typeof effective>) => {
                setSettings((current) => ({
                  ...current,
                  audio: {
                    ...current.audio,
                    reverb: {
                      amount: effective.amount,
                      decaySec: effective.decaySec,
                      preDelayMs: effective.preDelayMs,
                      damping: effective.damping,
                      ...patch,
                    },
                  },
                }));
              };
              return (
                <div className="relive-field-grid">
                  <label>
                    <span>
                      反響量
                      <ParamHelp
                        id="reverbAmount"
                        text={PARAM_HELP.reverbAmount}
                        openId={openHelpId}
                        setOpenId={setOpenHelpId}
                      />
                      <span className="relive-eq-band-value">
                        {effective.amount.toFixed(2)}
                      </span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={effective.amount}
                      onChange={(event) => updateReverb({ amount: Number(event.target.value) })}
                    />
                  </label>
                  <label>
                    <span>
                      減衰
                      <ParamHelp
                        id="reverbDecay"
                        text={PARAM_HELP.reverbDecay}
                        openId={openHelpId}
                        setOpenId={setOpenHelpId}
                      />
                      <span className="relive-eq-band-value">
                        {effective.decaySec.toFixed(2)}s
                      </span>
                    </span>
                    <input
                      type="range"
                      min={0.1}
                      max={6}
                      step={0.05}
                      value={effective.decaySec}
                      onChange={(event) => updateReverb({ decaySec: Number(event.target.value) })}
                    />
                  </label>
                  {/* プリディレイはポジションマップの職訂計算 (effectiveReverb useMemo) で
                      自動加算されるため、手動スライダーは提供しない。
                      ダンピングも会場プリセットに含まれるため隐す。 */}
                </div>
              );
            })()}
          </div>
          <div className="relive-toggle-row">
            <label>
              <input
                type="checkbox"
                checked={settings.mediaSessionEnabled}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    mediaSessionEnabled: event.target.checked,
                  }))
                }
              />
              Media Session
              <ParamHelp
                id="mediaSession"
                text={PARAM_HELP.mediaSession}
                openId={openHelpId}
                setOpenId={setOpenHelpId}
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.wakeLockEnabled}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    wakeLockEnabled: event.target.checked,
                  }))
                }
              />
              Wake Lock
              <ParamHelp
                id="wakeLock"
                text={PARAM_HELP.wakeLock}
                openId={openHelpId}
                setOpenId={setOpenHelpId}
              />
            </label>
          </div>
        </section>
      </section>
    </main>
  );
};

export default RelivePlayerApp;
