/**
 * 会場ごとの音響プリセット (VenuePreset.acoustic) を推定するロジック。
 *
 * 2 層構成:
 *  1. `acousticForVenue(venue)` ─ 基本層。venue.type と venue.capacity から
 *     reverb/spatial/EQ/dynamics を連続的に算出。capacity が不明なら type の代表値。
 *     全 116 件の自動抽出済み会場をカバーする。
 *  2. `VENUE_ACOUSTIC_OVERRIDES` ─ 個別チューニング層。
 *     有名会場・容量実測済み会場の音響特性を手動で上書き。
 *
 * `deriveVenueAcoustic(venue)` が公開 API で、両層をマージして返す。
 *
 * 値は公式公表データ + 一般的なホール/アリーナ音響知識からの推定。
 * 厳密な実測値ではなく "それっぽい体験" を目的とする再生用パラメータ。
 */

import type { Vec3, VenuePreset } from "../types/relive";

type VenueLike = {
  venueId: string;
  type: "live_house" | "hall" | "arena" | "exhibition" | "outdoor_festival" | "virtual" | "unknown";
  capacity: number | null;
};

type Acoustic = VenuePreset["acoustic"];

/* ============================================================
 *  1. 基本層: type + capacity から連続的に算出
 * ============================================================ */

/**
 * type ごとの代表 capacity (capacity が null の会場で使う想定値)。
 */
const DEFAULT_CAPACITY: Record<VenueLike["type"], number> = {
  live_house: 1200,
  hall: 1800,
  arena: 12000,
  exhibition: 6000,
  outdoor_festival: 8000,
  virtual: 0,
  unknown: 1000,
};

/**
 * capacity を 0..1 の正規化値に変換 (会場規模スケール)。
 * 200 人以下 → 0, 20000 人 → 1.0 に対数スケールでマップ。
 */
const capacityScale = (capacity: number | null, type: VenueLike["type"]): number => {
  const c = capacity ?? DEFAULT_CAPACITY[type];
  if (c <= 0) return 0;
  // log10(200) ≒ 2.30, log10(20000) ≒ 4.30 の幅 2.0 を 0..1 に。
  const normalized = (Math.log10(Math.max(200, c)) - 2.3) / 2.0;
  return Math.max(0, Math.min(1, normalized));
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const acousticForVenue = (venue: VenueLike): Acoustic => {
  const type = venue.type;
  const scale = capacityScale(venue.capacity, type);
  const isHallLike = type === "hall" || type === "exhibition";
  const isArena = type === "arena";
  const isOutdoor = type === "outdoor_festival";
  const isLiveHouse = type === "live_house";

  // ─── reverb ───────────────────────────────
  // 屋外は基本デッド、live_house は中庸、ホール/アリーナは scale で大きく伸ばす。
  let amount: number;
  let decaySec: number;
  let preDelayMs: number;
  let damping: number;

  if (isOutdoor) {
    amount = 0.18;
    decaySec = lerp(0.9, 1.5, scale);
    preDelayMs = 8;
    damping = 0.78;
  } else if (isArena) {
    amount = lerp(0.55, 0.66, scale);
    decaySec = lerp(2.9, 3.8, scale);
    preDelayMs = lerp(28, 48, scale);
    damping = lerp(0.42, 0.36, scale);
  } else if (isHallLike) {
    amount = lerp(0.42, 0.62, scale);
    decaySec = lerp(1.9, 3.0, scale);
    preDelayMs = lerp(22, 40, scale);
    damping = lerp(0.5, 0.4, scale);
  } else if (isLiveHouse) {
    amount = lerp(0.28, 0.46, scale);
    decaySec = lerp(1.1, 2.1, scale);
    preDelayMs = lerp(12, 26, scale);
    damping = lerp(0.7, 0.55, scale);
  } else {
    // virtual / unknown
    amount = 0.32;
    decaySec = 1.6;
    preDelayMs = 18;
    damping = 0.6;
  }

  // ─── spatial ──────────────────────────────
  let stageWidth: number;
  let depth: number;
  let height: number;

  if (isArena) {
    stageWidth = lerp(34, 46, scale);
    depth = lerp(56, 78, scale);
    height = lerp(18, 28, scale);
  } else if (isHallLike) {
    stageWidth = lerp(22, 34, scale);
    depth = lerp(32, 50, scale);
    height = lerp(14, 22, scale);
  } else if (isOutdoor) {
    stageWidth = lerp(24, 40, scale);
    depth = lerp(40, 90, scale);
    height = 8;
  } else if (isLiveHouse) {
    stageWidth = lerp(12, 22, scale);
    depth = lerp(18, 34, scale);
    height = lerp(7, 12, scale);
  } else {
    stageWidth = 16;
    depth = 24;
    height = 9;
  }

  // PA は stageWidth に比例して左右に配置 (約 30% 外側に置く)。
  const paX = stageWidth * 0.3;
  const listenerZ = isOutdoor ? lerp(15, 35, scale) : depth * 0.4;

  // ─── EQ ───────────────────────────────────
  // 大会場ほど低域が回り高域が減衰する傾向を補正。
  const lowGain = isOutdoor ? 2.4 : isArena ? lerp(1.8, 2.6, scale) : isHallLike ? 1.4 : 1.0;
  const midGain = isHallLike || isArena ? lerp(-0.4, -0.8, scale) : 0.8;
  const highGain = isOutdoor ? 1.4 : isArena ? lerp(0.2, 0.8, scale) : isHallLike ? -0.2 : -0.1;

  // ─── dynamics ─────────────────────────────
  // 大会場ほどコンプ深く・出力ゲイン抑え気味 (PA の混雑感を出す)。
  const outputGainDb = isArena ? lerp(-1.5, -2.6, scale) : isHallLike ? -2 : -1;
  const ratio = isArena ? lerp(2.2, 2.8, scale) : 2.2;

  return {
    eq: {
      bands: [
        { type: "lowshelf", frequencyHz: 120, gainDb: Number(lowGain.toFixed(2)) },
        { type: "peaking", frequencyHz: 2600, gainDb: Number(midGain.toFixed(2)), q: 0.9 },
        { type: "highshelf", frequencyHz: 7200, gainDb: Number(highGain.toFixed(2)) },
      ],
    },
    reverb: {
      amount: Number(amount.toFixed(3)),
      decaySec: Number(decaySec.toFixed(2)),
      preDelayMs: Math.round(preDelayMs),
      damping: Number(damping.toFixed(2)),
    },
    reflections: {
      earlyReflectionAmount: isHallLike || isArena ? Number(lerp(0.45, 0.7, scale).toFixed(2)) : 0.38,
      slapDelayMs: Math.round(isHallLike || isArena ? lerp(36, 56, scale) : 28),
      sideReflectionMs: Math.round(isHallLike || isArena ? lerp(24, 36, scale) : 18),
    },
    spatial: {
      stageWidth: Number(stageWidth.toFixed(1)),
      depth: Number(depth.toFixed(1)),
      height: Number(height.toFixed(1)),
      leftPaPosition: { x: -Number(paX.toFixed(1)), y: 3, z: 0 },
      rightPaPosition: { x: Number(paX.toFixed(1)), y: 3, z: 0 },
      centerPosition: { x: 0, y: 2, z: 0 },
      subPosition: { x: 0, y: 0.5, z: 2 },
      defaultListenerPosition: { x: 0, y: 1.5, z: Number(listenerZ.toFixed(1)) },
      paSpread: isHallLike || isArena ? 0.7 : 0.5,
    },
    dynamics: {
      limiterEnabled: true,
      compressorEnabled: true,
      outputGainDb: Number(outputGainDb.toFixed(2)),
      thresholdDb: -18,
      ratio: Number(ratio.toFixed(2)),
      attackSec: 0.006,
      releaseSec: 0.18,
    },
  };
};

/* ============================================================
 *  2. 個別オーバーライド: 有名会場・実測情報がある会場
 * ============================================================ */

/**
 * Partial<Acoustic> をベースにディープマージ。
 * 各サブセクション (eq/reverb/...) は object スプレッドで上書きする。
 * eq.bands は丸ごと差し替え (部分上書きしない)。
 */
const mergeAcoustic = (base: Acoustic, patch?: DeepPartialAcoustic): Acoustic => {
  if (!patch) return base;
  let mergedSpatial: Acoustic["spatial"] = base.spatial;
  if (patch.spatial) {
    // position 系 (xyz) を分離してから残りをスプレッド。
    // こうしないと partial position が完全型 SpatialPreset にスプレッドされて
    // x/y/z が optional に隣接してしまう。
    const {
      leftPaPosition,
      rightPaPosition,
      centerPosition,
      subPosition,
      defaultListenerPosition,
      ...spatialRest
    } = patch.spatial;
    mergedSpatial = {
      ...base.spatial,
      ...spatialRest,
      leftPaPosition: leftPaPosition
        ? { ...base.spatial.leftPaPosition, ...leftPaPosition }
        : base.spatial.leftPaPosition,
      rightPaPosition: rightPaPosition
        ? { ...base.spatial.rightPaPosition, ...rightPaPosition }
        : base.spatial.rightPaPosition,
      // centerPosition / subPosition は optional のため、base 側が undefined だと
      // partial スプレッドだけでは Vec3 を満たせない。両側を確認して安全にマージ。
      centerPosition:
        centerPosition && base.spatial.centerPosition
          ? { ...base.spatial.centerPosition, ...centerPosition }
          : centerPosition && !base.spatial.centerPosition
          ? // base 無し時は partial で完全 Vec3 を組めるか確認
            centerPosition.x !== undefined &&
            centerPosition.y !== undefined &&
            centerPosition.z !== undefined
            ? (centerPosition as Vec3)
            : base.spatial.centerPosition
          : base.spatial.centerPosition,
      subPosition:
        subPosition && base.spatial.subPosition
          ? { ...base.spatial.subPosition, ...subPosition }
          : subPosition && !base.spatial.subPosition
          ? subPosition.x !== undefined &&
            subPosition.y !== undefined &&
            subPosition.z !== undefined
            ? (subPosition as Vec3)
            : base.spatial.subPosition
          : base.spatial.subPosition,
      defaultListenerPosition: defaultListenerPosition
        ? { ...base.spatial.defaultListenerPosition, ...defaultListenerPosition }
        : base.spatial.defaultListenerPosition,
    };
  }
  return {
    eq: patch.eq ? { ...base.eq, ...patch.eq } : base.eq,
    reverb: patch.reverb ? { ...base.reverb, ...patch.reverb } : base.reverb,
    reflections: patch.reflections ? { ...base.reflections, ...patch.reflections } : base.reflections,
    spatial: mergedSpatial,
    dynamics: patch.dynamics ? { ...base.dynamics, ...patch.dynamics } : base.dynamics,
  };
};

// 位置系プロパティ (xyz) は完全な型を交差させると Partial が打ち消されるため、
// Omit してから個別に Partial<...> を付け直す。これにより
// `leftPaPosition: { y: 7.8 }` のような部分上書きが可能になる。
type SpatialPositionKeys =
  | "leftPaPosition"
  | "rightPaPosition"
  | "centerPosition"
  | "subPosition"
  | "defaultListenerPosition";

type DeepPartialAcoustic = {
  eq?: Partial<Acoustic["eq"]>;
  reverb?: Partial<Acoustic["reverb"]>;
  reflections?: Partial<Acoustic["reflections"]>;
  spatial?: Partial<Omit<Acoustic["spatial"], SpatialPositionKeys>> & {
    leftPaPosition?: Partial<Acoustic["spatial"]["leftPaPosition"]>;
    rightPaPosition?: Partial<Acoustic["spatial"]["rightPaPosition"]>;
    centerPosition?: Partial<Acoustic["spatial"]["centerPosition"]>;
    subPosition?: Partial<Acoustic["spatial"]["subPosition"]>;
    defaultListenerPosition?: Partial<Acoustic["spatial"]["defaultListenerPosition"]>;
  };
  dynamics?: Partial<Acoustic["dynamics"]>;
};

/**
 * 個別チューニング辞書。venueId をキーに base から差分上書き。
 * 値はその会場の "らしさ" を強調するための主観調整。
 *
 *   - 武道館: 円形ドーム、長い余韻と中域の濁り、フラッターエコー
 *   - 横アリ: 角ばった大型アリーナ、よく回るが整理された残響
 *   - ぴあMM: 比較的明瞭、大型アリーナの中では短め余韻
 *   - 代々木: 吊り天井で不均一、独特のサイドリフレクション
 *   - LINE CUBE 渋谷: 旧渋谷公会堂、扇形シューボックス、明瞭
 *   - TOKYO DOME CITY HALL: 円形ホール、暗めで包まれる響き
 *   - オリックス劇場: 大阪の老舗、クラシック向きの長めの decay
 *   - フェスティバルホール: 響きが豊かで明瞭、大阪の名ホール
 *   - Zepp 系: 中型ライブハウス、低域こもり、Zepp 規格の似た傾向
 *   - なんばHatch: 横長 live_house、サイド反射強め
 *   - 神戸ハーバースタジオ: 小規模ホール、明瞭で近い距離感
 *   - 旭川 CASINO DRIVE: 超小規模 live_house、デッド気味
 *   - 中野サンプラザ: シューボックス型 hall、明瞭
 *   - 新木場 STUDIO COAST: 大型 live_house、低域強め
 */
export const VENUE_ACOUSTIC_OVERRIDES: Record<string, DeepPartialAcoustic> = {
  /* ── arena ───────────────────────────────── */
  venue_日本武道館: {
    reverb: { amount: 0.62, decaySec: 3.9, preDelayMs: 48, damping: 0.38 },
    reflections: { earlyReflectionAmount: 0.7, slapDelayMs: 58, sideReflectionMs: 38 },
    spatial: {
      stageWidth: 38,
      depth: 60,
      height: 24,
      paSpread: 0.74,
      sources: [
        {
          label: "日本武道館 公式サイト",
          url: "https://www.nipponbudokan.or.jp/",
          note: "公式サイトの存在は確認。コンサート時のステージ寸法・PA 機種・収容人数はトップページからは取得できず、stageWidth/depth/height は八角形アリーナ規模からの推定。",
        },
      ],
    },
    eq: {
      bands: [
        { type: "lowshelf", frequencyHz: 100, gainDb: 2.4 },
        { type: "peaking", frequencyHz: 380, gainDb: -1.4, q: 1.0 },
        { type: "peaking", frequencyHz: 2400, gainDb: -0.8, q: 0.9 },
        { type: "highshelf", frequencyHz: 7200, gainDb: 0.4 },
      ],
    },
    dynamics: { outputGainDb: -2.4, ratio: 2.6 },
  },
  venue_横浜アリ_ナ: {
    reverb: { amount: 0.6, decaySec: 3.5, preDelayMs: 44, damping: 0.4 },
    reflections: { earlyReflectionAmount: 0.66, slapDelayMs: 54, sideReflectionMs: 34 },
    spatial: {
      stageWidth: 44,
      depth: 72,
      height: 26,
      sources: [
        {
          label: "横浜アリーナ 公式「主な設備のご案内」",
          url: "https://www.yokohama-arena.co.jp/organizer/equipment/",
          note: "公式掲載値: メインアリーナ 面積 8,000㎡ (楕円形 114m × 78m)、最大収容人数 17,000人。電源容量 音響 300KVA / 照明 1,000KVA / 動力 500KVA。床・壁面に耐荷重1点あたり5tのフックを多数設置。コンサート時のステージ寸法・PA機種は非公開のため stageWidth/depth/height は推定。サウンド設備詳細: https://www.yokohama-arena.co.jp/organizer/equipment/sound.html",
        },
      ],
    },
    dynamics: { outputGainDb: -2.4 },
  },
  venue_ぴあアリ_ナmm: {
    reverb: { amount: 0.56, decaySec: 3.1, preDelayMs: 38, damping: 0.44 },
    spatial: { stageWidth: 40, depth: 64, height: 22 },
  },
  venue_国立代々木競技場第一体育館: {
    reverb: { amount: 0.6, decaySec: 3.6, preDelayMs: 46, damping: 0.36 },
    reflections: { earlyReflectionAmount: 0.7, slapDelayMs: 56, sideReflectionMs: 40 },
    spatial: {
      stageWidth: 42,
      depth: 66,
      height: 28,
      paSpread: 0.78,
      sources: [
        {
          label: "国立代々木競技場 第一体育館 公式施設概要",
          url: "https://www.jpnsport.go.jp/yoyogi/sisetu/tabid/70/Default.aspx",
          note: "公式掲載値: アリーナ面積 4,000㎡ (南北最大 47.7m / 東西最大約 96m)、収容人数 12,898席 (スタンド 8,636 + アリーナ最大 4,124 他)、延床面積 28,705㎡。コンサート時のステージ寸法・PA 配置は公式非掲載のため stageWidth/depth/height は会場規模からの推定。設備一覧 PDF: https://www.jpnsport.go.jp/yoyogi/Portals/0/yoyogi/pdf/2025/20250411_第一体育館設備一覧%20.pdf",
        },
      ],
    },
  },
  venue_静安体育中心: {
    reverb: { amount: 0.55, decaySec: 3.0, preDelayMs: 36, damping: 0.46 },
    spatial: { stageWidth: 36, depth: 58, height: 20 },
  },

  /* ── hall ────────────────────────────────── */
  venue_line_cube_shibuya: {
    reverb: { amount: 0.5, decaySec: 2.4, preDelayMs: 30, damping: 0.48 },
    spatial: { stageWidth: 26, depth: 38, height: 18 },
    eq: {
      bands: [
        { type: "lowshelf", frequencyHz: 120, gainDb: 1.2 },
        { type: "peaking", frequencyHz: 2600, gainDb: -0.4, q: 0.9 },
        { type: "highshelf", frequencyHz: 7200, gainDb: 0.2 },
      ],
    },
  },
  venue_tokyo_dome_city_hall: {
    reverb: { amount: 0.58, decaySec: 2.8, preDelayMs: 34, damping: 0.44 },
    spatial: {
      stageWidth: 30,
      depth: 44,
      height: 20,
      paSpread: 0.72,
      sources: [
        {
          label: "Kanadevia Hall (旧 東京ドームシティホール / TDC Hall) 公式",
          url: "https://www.tokyo-dome.co.jp/tdc-hall/",
          note: "公式表記「最大 3,000 人のキャパシティを誇る多機能ホール」。ステージ寸法・PA 配置は非掲載のため会場規模からの推定。",
        },
      ],
    },
  },
  venue_オリックス劇場: {
    reverb: { amount: 0.6, decaySec: 2.9, preDelayMs: 36, damping: 0.42 },
    spatial: { stageWidth: 30, depth: 44, height: 22 },
  },
  venue_フェスティバルホ_ル: {
    reverb: { amount: 0.62, decaySec: 3.0, preDelayMs: 38, damping: 0.4 },
    spatial: {
      stageWidth: 32,
      depth: 46,
      height: 22,
      paSpread: 0.72,
      sources: [
        {
          label: "フェスティバルホール 公式 施設概要 / ホール図面",
          url: "https://www.festivalhall.jp/about/outline.html",
          note: "公式に施設概要 PDF (https://www.festivalhall.jp/pdf/gaiyou.pdf) および舞台平面図・断面図 (https://www.festivalhall.jp/about/zumen.html) が公開されている。本メタデータでは詳細値未反映のため stageWidth/depth/height はコンサートホール規模からの推定。",
        },
      ],
    },
    reflections: { earlyReflectionAmount: 0.68, slapDelayMs: 52, sideReflectionMs: 34 },
  },
  venue_中野サンプラザ: {
    reverb: { amount: 0.5, decaySec: 2.3, preDelayMs: 28, damping: 0.5 },
    spatial: { stageWidth: 24, depth: 36, height: 18 },
  },
  venue_昭和女子大学人見記念講堂: {
    reverb: { amount: 0.52, decaySec: 2.5, preDelayMs: 30, damping: 0.46 },
    spatial: { stageWidth: 28, depth: 40, height: 20 },
  },
  venue_神奈川県民ホ_ル: {
    reverb: { amount: 0.56, decaySec: 2.7, preDelayMs: 32, damping: 0.44 },
    spatial: {
      stageWidth: 30,
      depth: 42,
      height: 22,
      sources: [
        {
          label: "神奈川県立県民ホール 公式サイト",
          url: "https://www.kanagawa-kenminhall.com/",
          note: "公式掲載: 1975 年開館。老朽化により 2025 年 3 月 31 日より休館。詳細仕様ページは休館伴い公開中止中のため stageWidth/depth/height は推定。",
        },
      ],
    },
  },

  /* ── live_house (Zepp 系) ───────────────── */
  venue_zepp_haneda: {
    reverb: { amount: 0.42, decaySec: 1.9, preDelayMs: 22, damping: 0.6 },
    spatial: {
      stageWidth: 22,
      depth: 32,
      height: 12,
      sources: [
        {
          label: "Zepp Haneda (TOKYO) 公式 FLOOR GUIDE",
          url: "https://www.zepp.co.jp/hall/haneda/",
          note: "公式から確認できるのは収容人数 (スタンディング 2,925 人 / 椅子使用時 1,207 人) のみ。ステージ寸法・PA 機種は非公開のため stageWidth/depth/height は Zepp 共通フォーマットからの推定。",
        },
        {
          label: "サウンド&レコーディング・マガジン 音響設備ファイル Vol.19 (Zepp 大阪ベイサイド)",
          url: "https://www.snrec.jp/entry/magazine/setsubi/64343",
          note: "Zepp 系統共通仕様の二次情報源。設計担当 トゥ・ミックス 児玉肇氏発言『Zepp は 20 年くらいの歴史があるが、スピーカーはずっと JBL PROFESSIONAL』『全国の Zepp で同じコンソールにしたい』(メイン卓 DiGiCo SD8) を引用。Zepp Haneda 個別の機種は本記事では言及なし。",
        },
      ],
    },
  },
  venue_zepp_osaka_bayside: {
    reverb: { amount: 0.42, decaySec: 1.9, preDelayMs: 22, damping: 0.6 },
    spatial: { stageWidth: 22, depth: 34, height: 12 },
  },
  venue_zepp_divercity: {
    reverb: { amount: 0.4, decaySec: 1.8, preDelayMs: 22, damping: 0.6 },
    spatial: {
      stageWidth: 22,
      depth: 30,
      height: 12,
      sources: [
        {
          label: "Zepp DiverCity (TOKYO) 公式 FLOOR GUIDE",
          url: "https://www.zepp.co.jp/hall/divercity/",
          note: "公式から確認できるのは収容人数 (スタンディング 2,473 人 / 椅子使用時 1,102 人) のみ。ステージ寸法・PA 機種は非公開のため stageWidth/depth/height は Zepp 共通フォーマットからの推定。",
        },
        {
          label: "サウンド&レコーディング・マガジン 音響設備ファイル Vol.19 (Zepp 大阪ベイサイド)",
          url: "https://www.snrec.jp/entry/magazine/setsubi/64343",
          note: "設計担当 トゥ・ミックス 児玉肇氏発言: 『VTX-V25 は Zepp ダイバーシティ東京でも使っていて、我々にとってはなじみのあるサウンド』『Zepp なんば大阪や Zepp ダイバーシティ東京で CODA AUDIO のモニターを使い始めた』。すなわちメイン PA は JBL PROFESSIONAL VTX-V25 ラインアレイ、ステージモニターは CODA AUDIO 系 (Vol.19 取材時点)。",
        },
      ],
    },
  },
  venue_zepp_divercity_tokyo: {
    reverb: { amount: 0.4, decaySec: 1.8, preDelayMs: 22, damping: 0.6 },
    spatial: {
      stageWidth: 22,
      depth: 30,
      height: 12,
      sources: [
        {
          label: "Zepp DiverCity (TOKYO) 公式 FLOOR GUIDE",
          url: "https://www.zepp.co.jp/hall/divercity/",
          note: "公式から確認できるのは収容人数 (スタンディング 2,473 人 / 椅子使用時 1,102 人) のみ。ステージ寸法・PA 機種は非公開のため stageWidth/depth/height は Zepp 共通フォーマットからの推定。",
        },
        {
          label: "サウンド&レコーディング・マガジン 音響設備ファイル Vol.19 (Zepp 大阪ベイサイド)",
          url: "https://www.snrec.jp/entry/magazine/setsubi/64343",
          note: "設計担当 トゥ・ミックス 児玉肇氏発言: 『VTX-V25 は Zepp ダイバーシティ東京でも使っていて、我々にとってはなじみのあるサウンド』『Zepp なんば大阪や Zepp ダイバーシティ東京で CODA AUDIO のモニターを使い始めた』。すなわちメイン PA は JBL PROFESSIONAL VTX-V25 ラインアレイ、ステージモニターは CODA AUDIO 系 (Vol.19 取材時点)。",
        },
      ],
    },
  },
  venue_zepp_namba: {
    reverb: { amount: 0.42, decaySec: 1.9, preDelayMs: 22, damping: 0.6 },
    spatial: {
      stageWidth: 22,
      depth: 32,
      height: 12,
      sources: [
        {
          label: "Zepp Namba (OSAKA) 公式 FLOOR GUIDE",
          url: "https://www.zepp.co.jp/hall/namba/",
          note: "公式から確認できるのは収容人数 (スタンディング 2,513 人 / 椅子使用時 1,206 人) のみ。ステージ寸法・PA 機種は非公開のため stageWidth/depth/height は Zepp 共通フォーマットからの推定。",
        },
        {
          label: "サウンド&レコーディング・マガジン 音響設備ファイル Vol.19 (Zepp 大阪ベイサイド)",
          url: "https://www.snrec.jp/entry/magazine/setsubi/64343",
          note: "設計担当 トゥ・ミックス 児玉肇氏発言: 『Zepp なんば大阪や Zepp ダイバーシティ東京で CODA AUDIO のモニターを使い始めた』。Zepp 系統共通方針として JBL PROFESSIONAL ラインアレイ + AMCRON IT 系パワーアンプ + DiGiCo SD8 メイン卓も確認 (Vol.19 取材時点)。",
        },
      ],
    },
  },
  venue_zeep_namba: {
    reverb: { amount: 0.42, decaySec: 1.9, preDelayMs: 22, damping: 0.6 },
    spatial: {
      stageWidth: 22,
      depth: 32,
      height: 12,
      sources: [
        {
          label: "Zepp Namba (OSAKA) 公式 FLOOR GUIDE",
          url: "https://www.zepp.co.jp/hall/namba/",
          note: "公式から確認できるのは収容人数 (スタンディング 2,513 人 / 椅子使用時 1,206 人) のみ。venue_id 表記揺れ用エイリアス。",
        },
        {
          label: "サウンド&レコーディング・マガジン 音響設備ファイル Vol.19 (Zepp 大阪ベイサイド)",
          url: "https://www.snrec.jp/entry/magazine/setsubi/64343",
          note: "設計担当 トゥ・ミックス 児玉肇氏発言: 『Zepp なんば大阪や Zepp ダイバーシティ東京で CODA AUDIO のモニターを使い始めた』。Zepp 系統共通方針として JBL PROFESSIONAL ラインアレイ + AMCRON IT 系パワーアンプ + DiGiCo SD8 メイン卓も確認 (Vol.19 取材時点)。",
        },
      ],
    },
  },
  venue_kt_zepp_yokohama: {
    reverb: { amount: 0.4, decaySec: 1.8, preDelayMs: 20, damping: 0.6 },
    spatial: {
      stageWidth: 22,
      depth: 30,
      height: 12,
      sources: [
        {
          label: "KT Zepp Yokohama 公式 FLOOR GUIDE",
          url: "https://www.zepp.co.jp/hall/yokohama/",
          note: "公式から確認できるのは収容人数 (スタンディング 2,146 人 / 椅子使用時 1,251 人) のみ。ステージ寸法・PA 機種は非公開のため stageWidth/depth/height は Zepp 共通フォーマットからの推定。",
        },
        {
          label: "VENUE LINK / KT Zepp Yokohama",
          url: "https://venue-link.com/s/281/1563/",
          note: "イベント会場予約プラットフォームの会場ページ。物理スペックの一次集約源として: 面積 4,504㎡ / 天井高 14m / 屋内 / シアター 1,251 名 / ホワイエ 608.2㎡ (天井高 7.4m) / 搬入口 5,300mm×3,000mm / 11t トラック 3 台対応。舞台平面図・断面図・回路図および照明機材 (LED Profile / LED Follow Spot Oz 等) のリストが画像で掲載。PA 機種・モニタースピーカー型番は本ページでも非公開。",
        },
        {
          label: "サウンド&レコーディング・マガジン 音響設備ファイル Vol.19 (Zepp 大阪ベイサイド)",
          url: "https://www.snrec.jp/entry/magazine/setsubi/64343",
          note: "Zepp 系統共通仕様の二次情報源。設計担当 トゥ・ミックス 児玉肇氏発言『Zepp は 20 年くらいの歴史があるが、スピーカーはずっと JBL PROFESSIONAL』『全国の Zepp で同じコンソールにしたい』(メイン卓 DiGiCo SD8) を引用。KT Zepp Yokohama 個別の機種は本記事では言及なし。",
        },
      ],
    },
  },
  venue_zepp_nagoya: {
    reverb: { amount: 0.4, decaySec: 1.7, preDelayMs: 20, damping: 0.62 },
    spatial: { stageWidth: 20, depth: 28, height: 11 },
  },
  venue_zepp_fukuoka: {
    reverb: { amount: 0.4, decaySec: 1.7, preDelayMs: 20, damping: 0.62 },
    spatial: { stageWidth: 20, depth: 28, height: 11 },
  },
  venue_zepp_new_taipei: {
    reverb: { amount: 0.42, decaySec: 1.8, preDelayMs: 22, damping: 0.6 },
    spatial: { stageWidth: 22, depth: 30, height: 12 },
  },
  venue_zepp_tokyo: {
    reverb: { amount: 0.42, decaySec: 1.9, preDelayMs: 22, damping: 0.6 },
    spatial: { stageWidth: 22, depth: 32, height: 12 },
  },

  /* ── live_house (その他主要) ────────────── */
  venue_なんばhatch: {
    reverb: { amount: 0.4, decaySec: 1.8, preDelayMs: 20, damping: 0.62 },
    spatial: { stageWidth: 22, depth: 30, height: 12 },
    reflections: { earlyReflectionAmount: 0.46, slapDelayMs: 32, sideReflectionMs: 22 },
  },
  venue_神戸harbor_studio: {
    reverb: { amount: 0.34, decaySec: 1.4, preDelayMs: 16, damping: 0.66 },
    spatial: { stageWidth: 14, depth: 20, height: 8 },
  },
  venue_神戸ハ_バ_スタジオ: {
    reverb: { amount: 0.34, decaySec: 1.4, preDelayMs: 16, damping: 0.66 },
    spatial: { stageWidth: 14, depth: 20, height: 8 },
  },
  venue_旭川casino_drive: {
    reverb: { amount: 0.28, decaySec: 1.15, preDelayMs: 12, damping: 0.7 },
    spatial: { stageWidth: 12, depth: 18, height: 7 },
  },
  venue_yokohama_bayhall: {
    reverb: { amount: 0.36, decaySec: 1.45, preDelayMs: 16, damping: 0.66 },
    spatial: {
      stageWidth: 8.55,
      depth: 4.5,
      height: 8,
      // 公式会場平面図 PDF には「メインスピーカー設置位置 FL+7,800mm」と記載されているが、
      // Web Audio の距離減衰は線形近似なため、那の値をそのまま入れると
      // y 成分 6.3m が常に乗り、リスナー位置を動かしても職人 PA が意図した
      // 「会場全体に均一に送る」チューニングと逆に過剰減衰させてしまう。
      // そのため実高さは citation note のみに記録し、座標は base レイヤー (y≈3) のまま使う。
      sources: [
        {
          label: "横浜ベイホール 公式 SPEC ページ",
          url: "https://bayhall.jp/spec/",
          note: "ホール仕様の一次情報源 (運営: 株式会社レベルポイント / 所在: 神奈川県横浜市中区新山下3-4-17 / 音響管理指定業者: 株式会社ゼロ・ディービー / 照明管理指定業者: 株式会社東舞トータルサービス)。STAGE / PA / LIGHT 各機材リスト・図面が PDF で公開されている。",
        },
        {
          label: "横浜ベイホール 会場平面図 PDF (Hall_BayHall_v6.pdf)",
          url: "http://bayhall.jp/wp-content/uploads/2025/06/Hall_BayHall_v6.pdf",
          note: "一次情報・物理スペック: ホール面積 400㎡ / ステージ面積 38.88㎡ / ホール床仕様 塩ビタイル / ステージ床仕様 リノリウム / 収容人数 スタンディング 1,100 人・着席 300 人 / 楽屋 3 室 (16㎡ + 14㎡ + 12㎡) / メインスピーカー設置位置 FL+7,800mm / オペレートブース FL+900mm。stageWidth はステージ図 PDF 記載寸法 8,550mm を採用。depth は (ステージ面積 38.88㎡ ÷ 幅 8.55m) より約 4.5m と算出。height はスピーカー懸架位置 7.8m + 余裕から 8m 推定。",
        },
        {
          label: "横浜ベイホール ステージ図 PDF (StageView2015.pdf)",
          url: "http://bayhall.jp/wp-content/uploads/2016/01/StageView2015.pdf",
          note: "舞台図面 (縮尺 B4=1/50, 2015.10.9 作成)。ステージ幅 8,550mm、ステージ高 H=780mm (アクリル ステージ高 H=450mm のサブステージ部有り)、フロア段差 900mm を明示。グリッド表記 (1.5/1/0.5/CL/0.5/1/1.5) からセンターライン基準で配置設計されている。",
        },
        {
          label: "横浜ベイホール PA 機材リスト PDF (BayHall_PAList_251219.pdf, 2025/12/19 最新版)",
          url: "http://bayhall.jp/wp-content/uploads/2025/12/BayHall_PAList_251219.pdf",
          note: "一次情報・PA 全機種: ハウス スピーカー Electro-Voice MTH-4P ×6 / ハウス パワーアンプ Electro-Voice MTL-4P ×6 + QSC Powerlight 4.0 ×12 + AMCRON XLS 1502 ×6 / FOH 卓 Yamaha CL-5 (+Rio3224-D2 + Rio1608-D2, 48 Inputs / 24 Omni Outputs) / モニター卓 Yamaha QL-5 (+Rio1608-D, 48 in / 24 out) / チャンネル ディバイダー dbx DriveRack 260 ×2 / FB (フロアモニター) スピーカー Yamaha CHR15M ×11 + EV SX300PI ×2 / サイドフィル EV TX1152 ×2 / FB アンプ Lab.Gruppen PLM5K44 ×3 (12 系統) + Yamaha PX-5 ×2 / マイク SHURE SM58-LC ×10 / SM57-LC ×10 / SM58S ×2 / BETA52A ×1, SENNHEISER MD-421u4 ×5 / E904 ×4, AKG C-391B ×4, audio-technica ATM25 ×1 / DI: COUNTRYMAN TYPE85 ×7 + BSS AR116 ×6 / HALL MULTI 32ch (16×2) + 16ch + 予備 12ch (FOH→FB→SR)。「ハウス卓 (CL-5) とモニター卓 (QL-5) の入れ替えはできません」と明記。",
        },
      ],
    },
    reflections: { earlyReflectionAmount: 0.38, slapDelayMs: 24, sideReflectionMs: 18 },
  },
  venue_新木場スタジオコ_スト: {
    reverb: { amount: 0.44, decaySec: 2.0, preDelayMs: 24, damping: 0.58 },
    spatial: { stageWidth: 22, depth: 32, height: 13 },
  },
  venue_豊洲pit: {
    reverb: { amount: 0.42, decaySec: 1.9, preDelayMs: 22, damping: 0.6 },
    spatial: { stageWidth: 22, depth: 32, height: 12 },
  },
  venue_赤坂blitz: {
    reverb: { amount: 0.4, decaySec: 1.8, preDelayMs: 20, damping: 0.6 },
    spatial: { stageWidth: 20, depth: 28, height: 12 },
  },
  venue_spotify_o_east: {
    reverb: { amount: 0.38, decaySec: 1.7, preDelayMs: 20, damping: 0.62 },
    spatial: {
      stageWidth: 20,
      depth: 28,
      height: 11,
      sources: [
        {
          label: "Spotify O-EAST 公式 ABOUT",
          url: "https://shibuya-o.com/east/about/",
          note: "公式掲載値: スタンディング 1,300 名 / シーティング 565 席 / ステージ背面 LED ビジョン 618inch 常設。ステージ寸法は公開 PDF (ホール資料 / 舞台資料 / 音響資料) で確認可能だが本メタデータでは未反映のため stageWidth/depth/height は会場規模からの推定。",
        },
      ],
    },
  },
  venue_tsutaya_o_east: {
    reverb: { amount: 0.38, decaySec: 1.7, preDelayMs: 20, damping: 0.62 },
    spatial: {
      stageWidth: 20,
      depth: 28,
      height: 11,
      sources: [
        {
          label: "Spotify O-EAST (旧 TSUTAYA O-EAST) 公式 ABOUT",
          url: "https://shibuya-o.com/east/about/",
          note: "TSUTAYA O-EAST は 2019 年に Spotify O-EAST へ名称変更。公式掲載値: スタンディング 1,300 名 / シーティング 565 席。ステージ寸法・PA 配置は会場規模からの推定。",
        },
      ],
    },
  },
  venue_ex_theater_roppongi: {
    reverb: { amount: 0.46, decaySec: 2.1, preDelayMs: 26, damping: 0.54 },
    spatial: {
      stageWidth: 22,
      depth: 32,
      height: 14,
      sources: [
        {
          label: "EX THEATER ROPPONGI 公式 ABOUT",
          url: "https://www.ex-theater.com/about/",
          note: "公式で確認できるのは「地上 2 階〜地下 3 階構造」「スタンディングから全シーティング対応」までで、寸法・PA 機種は非掲載。ステージ幅・奥行き・天井高は会場規模からの推定。SPEC ページ (https://www.ex-theater.com/spec/) も併せて参照。",
        },
      ],
    },
  },

  /* ── exhibition ─────────────────────────── */
  // 幕張メッセ全体は床面積 7.2万m²級。コンサート時は通常 3 ホール連結 (9-10-11) で
  // 約 9,000 人規模、奥行 100m 超。LRCS だけでは絶対に届かないので、speakerLayout 側で
  // depth/stageWidth から自動でディレイ・サイド・リアまで生成される値を与える。
  venue_幕張メッセ: {
    reverb: { amount: 0.58, decaySec: 3.4, preDelayMs: 42, damping: 0.4 },
    reflections: { earlyReflectionAmount: 0.7, slapDelayMs: 60, sideReflectionMs: 40 },
    spatial: { stageWidth: 48, depth: 110, height: 18, paSpread: 0.82 },
  },
  venue_幕張メッセ_ホ_ル_9_10_11: {
    reverb: { amount: 0.6, decaySec: 3.6, preDelayMs: 44, damping: 0.38 },
    reflections: { earlyReflectionAmount: 0.72, slapDelayMs: 62, sideReflectionMs: 42 },
    spatial: { stageWidth: 54, depth: 130, height: 18, paSpread: 0.82 },
  },

  /* ── outdoor ────────────────────────────── */
  venue_国営ひたち海浜公園: {
    reverb: { amount: 0.16, decaySec: 1.0, preDelayMs: 8, damping: 0.8 },
    spatial: { stageWidth: 36, depth: 80, height: 9 },
  },
  venue_舞洲スポ_ツアイランド: {
    reverb: { amount: 0.18, decaySec: 1.1, preDelayMs: 9, damping: 0.78 },
    spatial: { stageWidth: 38, depth: 90, height: 9 },
  },
  venue_千葉市蘇我スポ_ツ公園: {
    reverb: { amount: 0.18, decaySec: 1.1, preDelayMs: 9, damping: 0.78 },
    spatial: { stageWidth: 36, depth: 80, height: 9 },
  },
};

/* ============================================================
 *  公開 API
 * ============================================================ */

/**
 * 会場の venueId / type / capacity から最終的な VenueAcousticPreset を返す。
 * 1) 基本層 (acousticForVenue) で type+capacity 連続スケール
 * 2) VENUE_ACOUSTIC_OVERRIDES に該当があれば差分マージ
 */
export const deriveVenueAcoustic = (venue: VenueLike): Acoustic => {
  const base = acousticForVenue(venue);
  const override = VENUE_ACOUSTIC_OVERRIDES[venue.venueId];
  return mergeAcoustic(base, override);
};

/** 個別オーバーライドが定義されている venueId の一覧 (デバッグ用)。 */
export const listOverriddenVenueIds = (): string[] =>
  Object.keys(VENUE_ACOUSTIC_OVERRIDES);
