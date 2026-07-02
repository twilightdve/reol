import type {
  AppSettings,
  AudioAnalysisCache,
  LiveMemoryPreset,
  LocalTrackRecord,
  ManualTrackMapping,
  PlaybackQueue,
} from "../types/relive";

const DB_NAME = "relive-player-v1";
const DB_VERSION = 2;

type StoreName =
  | "localTracks"
  | "manualTrackMappings"
  | "audioAnalysisCaches"
  | "liveMemoryPresets"
  | "playbackQueues"
  | "appSettings";

const stores: StoreName[] = [
  "localTracks",
  "manualTrackMappings",
  "audioAnalysisCaches",
  "liveMemoryPresets",
  "playbackQueues",
  "appSettings",
];

const keyPathForStore = (storeName: StoreName) => {
  if (storeName === "appSettings") return "settingsId";
  if (storeName === "manualTrackMappings") return "mappingId";
  if (storeName === "audioAnalysisCaches") return "cacheKey";
  if (storeName === "liveMemoryPresets") return "liveMemoryId";
  if (storeName === "playbackQueues") return "queueId";
  return undefined;
};

const openReliveDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      stores.forEach((storeName) => {
        const expectedKeyPath = keyPathForStore(storeName);
        if (db.objectStoreNames.contains(storeName)) {
          const currentStore = request.transaction?.objectStore(storeName);
          if (currentStore && currentStore.keyPath !== (expectedKeyPath ?? null)) {
            db.deleteObjectStore(storeName);
          }
        }
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, {
            keyPath: expectedKeyPath,
            autoIncrement: false,
          });
        }
      });
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });

/* ============================================================
 *  In-memory フォールバック
 *  IndexedDB が無効 (Safari Private Mode / 古いブラウザ / 容量制限) の環境でも
 *  少なくとも実行中の永続化機能をエミュレートし、機能停止を防ぐ。
 *  ページ再読込で失われるが、UI が "黙って死ぬ" よりはるかにマシ。
 * ============================================================ */
type MemoryStore = Map<IDBValidKey, unknown>;
const memoryStores: Record<StoreName, MemoryStore> = {
  localTracks: new Map(),
  manualTrackMappings: new Map(),
  audioAnalysisCaches: new Map(),
  liveMemoryPresets: new Map(),
  playbackQueues: new Map(),
  appSettings: new Map(),
};
let fallbackMode = false;
let fallbackWarned = false;

/** フォールバックモードに切替済みか? (テスト・UI 表示用) */
export const isStorageFallbackActive = () => fallbackMode;

const activateFallback = (reason: unknown) => {
  if (!fallbackMode) {
    fallbackMode = true;
  }
  if (!fallbackWarned) {
    fallbackWarned = true;
    const msg =
      reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason);
    // eslint-disable-next-line no-console
    console.warn(
      `[relive] IndexedDB が利用できないためインメモリ永続化に切り替えました (${msg})。設定はページ再読み込みで失われます。`
    );
  }
};

const memoryRunStore = <T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  op:
    | { kind: "getAll" }
    | { kind: "get"; key: IDBValidKey }
    | { kind: "put"; value: unknown; key?: IDBValidKey }
    | { kind: "delete"; key: IDBValidKey }
    | { kind: "clear" }
): T => {
  const store = memoryStores[storeName];
  const keyPath = keyPathForStore(storeName);
  switch (op.kind) {
    case "getAll":
      return Array.from(store.values()) as T;
    case "get":
      return (store.get(op.key) ?? undefined) as T;
    case "put": {
      let key: IDBValidKey | undefined = op.key;
      if (key === undefined && keyPath) {
        const candidate = (op.value as Record<string, unknown>)[keyPath];
        if (typeof candidate === "string" || typeof candidate === "number") {
          key = candidate as IDBValidKey;
        }
      }
      if (key === undefined) {
        throw new Error(`[relive] memoryStore put requires key for ${storeName}`);
      }
      store.set(key, op.value);
      return key as T;
    }
    case "delete":
      store.delete(op.key);
      return undefined as T;
    case "clear":
      store.clear();
      return undefined as T;
  }
  // 上の switch は完全網羅。
};

const runStore = async <T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => IDBRequest<T>,
  fallback?: () => T
) => {
  if (fallbackMode && fallback) {
    return fallback();
  }
  try {
    const db = await openReliveDb();
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const request = handler(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    if (fallback) {
      activateFallback(err);
      return fallback();
    }
    throw err;
  }
};

export const saveLocalTracks = async (records: LocalTrackRecord[]) => {
  if (fallbackMode) {
    const store = memoryStores.localTracks;
    store.clear();
    records.forEach((record) => store.set(record.fileKey, record));
    return;
  }
  try {
    const db = await openReliveDb();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("localTracks", "readwrite");
      const store = tx.objectStore("localTracks");
      store.clear();
      records.forEach((record) => store.put(record, record.fileKey));
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    activateFallback(err);
    const store = memoryStores.localTracks;
    store.clear();
    records.forEach((record) => store.set(record.fileKey, record));
  }
};

export const loadLocalTracks = () =>
  runStore<LocalTrackRecord[]>(
    "localTracks",
    "readonly",
    (store) => store.getAll(),
    () => memoryRunStore<LocalTrackRecord[]>("localTracks", "readonly", { kind: "getAll" })
  );

export const saveManualTrackMapping = (mapping: ManualTrackMapping) =>
  runStore<IDBValidKey>(
    "manualTrackMappings",
    "readwrite",
    (store) => store.put(mapping),
    () =>
      memoryRunStore<IDBValidKey>("manualTrackMappings", "readwrite", {
        kind: "put",
        value: mapping,
      })
  );

export const loadManualTrackMappings = () =>
  runStore<ManualTrackMapping[]>(
    "manualTrackMappings",
    "readonly",
    (store) => store.getAll(),
    () =>
      memoryRunStore<ManualTrackMapping[]>("manualTrackMappings", "readonly", {
        kind: "getAll",
      })
  );

export const deleteManualTrackMapping = (mappingId: string) =>
  runStore<undefined>(
    "manualTrackMappings",
    "readwrite",
    (store) => store.delete(mappingId),
    () =>
      memoryRunStore<undefined>("manualTrackMappings", "readwrite", {
        kind: "delete",
        key: mappingId,
      })
  );

export const saveAudioAnalysisCache = (cache: AudioAnalysisCache) => {
  const record = { cacheKey: `${cache.fileKey}|${cache.analysisVersion}`, ...cache };
  return runStore<IDBValidKey>(
    "audioAnalysisCaches",
    "readwrite",
    (store) => store.put(record),
    () =>
      memoryRunStore<IDBValidKey>("audioAnalysisCaches", "readwrite", {
        kind: "put",
        value: record,
      })
  );
};

export const loadAudioAnalysisCaches = () =>
  runStore<(AudioAnalysisCache & { cacheKey: string })[]>(
    "audioAnalysisCaches",
    "readonly",
    (store) => store.getAll(),
    () =>
      memoryRunStore<(AudioAnalysisCache & { cacheKey: string })[]>(
        "audioAnalysisCaches",
        "readonly",
        { kind: "getAll" }
      )
  );

export const saveLiveMemoryPreset = (preset: LiveMemoryPreset) =>
  runStore<IDBValidKey>(
    "liveMemoryPresets",
    "readwrite",
    (store) => store.put(preset),
    () =>
      memoryRunStore<IDBValidKey>("liveMemoryPresets", "readwrite", {
        kind: "put",
        value: preset,
      })
  );

export const loadLiveMemoryPresets = () =>
  runStore<LiveMemoryPreset[]>(
    "liveMemoryPresets",
    "readonly",
    (store) => store.getAll(),
    () =>
      memoryRunStore<LiveMemoryPreset[]>("liveMemoryPresets", "readonly", {
        kind: "getAll",
      })
  );

export const savePlaybackQueue = (queue: PlaybackQueue) =>
  runStore<IDBValidKey>(
    "playbackQueues",
    "readwrite",
    (store) => store.put(queue),
    () =>
      memoryRunStore<IDBValidKey>("playbackQueues", "readwrite", {
        kind: "put",
        value: queue,
      })
  );

export const loadPlaybackQueues = () =>
  runStore<PlaybackQueue[]>(
    "playbackQueues",
    "readonly",
    (store) => store.getAll(),
    () =>
      memoryRunStore<PlaybackQueue[]>("playbackQueues", "readonly", { kind: "getAll" })
  );

export const saveAppSettings = (settings: AppSettings) => {
  const record = { settingsId: "default", ...settings };
  return runStore(
    "appSettings",
    "readwrite",
    (store) => store.put(record),
    () =>
      memoryRunStore<IDBValidKey>("appSettings", "readwrite", {
        kind: "put",
        value: record,
      })
  );
};

export const loadAppSettings = async (): Promise<AppSettings | undefined> => {
  const result = await runStore<AppSettings & { settingsId: string }>(
    "appSettings",
    "readonly",
    (store) => store.get("default"),
    () =>
      memoryRunStore<AppSettings & { settingsId: string }>("appSettings", "readonly", {
        kind: "get",
        key: "default",
      })
  );
  if (!result) {
    return undefined;
  }

  return {
    schemaVersion: 1,
    performanceMode: result.performanceMode,
    outputDeviceProfile: result.outputDeviceProfile,
    wakeLockEnabled: result.wakeLockEnabled,
    mediaSessionEnabled: result.mediaSessionEnabled,
    deviceOrientationEnabled: result.deviceOrientationEnabled,
    visual: result.visual,
    audio: result.audio,
    privacy: result.privacy,
    updatedAt: result.updatedAt,
  };
};
