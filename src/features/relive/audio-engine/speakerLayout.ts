import type { VenuePreset, VenueType } from "../types/relive";

/**
 * スピーカーの種別。
 * - L/R: メイン PA (FOH)
 * - C: センタークラスタ / センターフィル
 * - S: サブウーファー (低域専用)
 * - FL/FR: フロントフィル (前列向けの近距離補強)
 * - DL/DR: ディレイクラスター (後方席向けの遠距離補強)
 * - SL/SR: サイドフィル (両翼席 / 横長ホール向け側方補強)
 * - RL/RR: リアディレイ (アリーナ後方〜スタンド向け、サラウンド気味の遠距離補強)
 */
export type SpeakerKind =
  | "L"
  | "R"
  | "C"
  | "S"
  | "FL"
  | "FR"
  | "DL"
  | "DR"
  | "SL"
  | "SR"
  | "RL"
  | "RR";

/**
 * スピーカーの周波数特性。PA システムの各役割によって典型的な音色傾向が異なるため、
 * lowShelf / peaking / highShelf の組み合わせで模擬する。dB 値はそのまま BiquadFilter の gain。
 */
export interface SpeakerEq {
  /** 低域シェルフ (この周波数以下を gain[dB] で増減) */
  lowShelfHz?: number;
  lowShelfGain?: number;
  /** ピーキング (中域ブースト/カット) */
  peakingHz?: number;
  peakingGain?: number;
  peakingQ?: number;
  /** 高域シェルフ (この周波数以上を gain[dB] で増減) */
  highShelfHz?: number;
  highShelfGain?: number;
}

export interface SpeakerSpec {
  kind: SpeakerKind;
  position: { x: number; y: number; z: number };
  /** ゲイン重み。L/R を 1.0 基準とした相対値。 */
  weight: number;
  /** S (サブ) の場合に低域へ制限するための lowpass カットオフ。 */
  lowpassHz?: number;
  /** kind 別の周波数特性プロファイル。 */
  eq?: SpeakerEq;
}

/**
 * スピーカー種別ごとのデフォルト EQ プロファイル。
 * 役割の典型的な音色を模擬する (実機の標準的設定を参考にした概念モデル)。
 *
 * - L/R FOH: 客席全体に向けたメイン PA。広帯域でほぼフラット、超高域はわずかに抑える。
 * - C: センターフィル / クラスタ。ボーカル明瞭度のため中高域 (2.5kHz) をわずかにブースト。
 * - FL/FR: フロントフィル。最前列用で低域を出さず (lowShelf 大幅カット) 中高域寄り。
 * - SL/SR: サイドフィル。横方向への補強でやや中域寄り、高域は控えめ。
 * - DL/DR: ディレイクラスター。遠方席向けで空気減衰を模擬し高域を強めにロールオフ。
 * - RL/RR: リアディレイ。さらに遠方なので高域/低域ともに削り、こもった音色に。
 * - S: サブウーファー。lowpass のみで EQ は不要。
 */
export const speakerEqByKind = (kind: SpeakerKind): SpeakerEq | undefined => {
  switch (kind) {
    case "L":
    case "R":
      return { highShelfHz: 12000, highShelfGain: -1.5 };
    case "C":
      return {
        peakingHz: 2500,
        peakingGain: 1.5,
        peakingQ: 1.0,
        highShelfHz: 10000,
        highShelfGain: -1,
      };
    case "FL":
    case "FR":
      return {
        lowShelfHz: 120,
        lowShelfGain: -6,
        peakingHz: 2500,
        peakingGain: 1.5,
        peakingQ: 1.0,
        highShelfHz: 12000,
        highShelfGain: 1,
      };
    case "SL":
    case "SR":
      return {
        peakingHz: 1500,
        peakingGain: 1,
        peakingQ: 0.9,
        highShelfHz: 10000,
        highShelfGain: -2,
      };
    case "DL":
    case "DR":
      return {
        lowShelfHz: 100,
        lowShelfGain: -3,
        highShelfHz: 8000,
        highShelfGain: -4,
      };
    case "RL":
    case "RR":
      return {
        lowShelfHz: 100,
        lowShelfGain: -5,
        highShelfHz: 6000,
        highShelfGain: -8,
      };
    case "S":
    default:
      return undefined;
  }
};

const attachDefaultEq = (specs: SpeakerSpec[]): SpeakerSpec[] =>
  specs.map((s) => ({ ...s, eq: s.eq ?? speakerEqByKind(s.kind) }));

/**
 * 会場タイプ別の rolloffFactor。
 * 実際の PA は会場全体にほぼ均一に届くようチューニングされ、リスナーが客席内のどこにいても
 * ほぼ同じ「爆音」レベルで聴こえる。視覚的な距離感のため対数式 (useAudioEngine 側) で
 * わずかにロールオフさせるが、係数はかなり控えめにする。
 * 例: arena d=70m → distGain ≒ 1/(1+0.05*log(70)) ≒ 0.83 (約 -1.6dB)
 */
export const venueRolloff: Record<VenueType, number> = {
  live_house: 0.10,
  hall: 0.07,
  arena: 0.05,
  outdoor: 0.08,
  other: 0.07,
};

/** 音速 (m/s)。20℃ の標準的な空気中の値。到達遅延 = distance / SPEED_OF_SOUND。 */
export const SPEED_OF_SOUND_MPS = 343;

/**
 * 会場タイプ別のフォールバックスピーカー配置 (実データが無い場合の一般的構成)。
 * 単位はメートル、ステージは z=0、客席は z 正方向に伸びる想定。
 *
 * 実在のライブハウス / ホール / アリーナはほぼ全て最低でも L/R FOH + サブウーファー を備え、
 * 中規模以上では C (センターフィル) や FL/FR (フロントフィル) を、
 * 大規模会場では DL/DR (ディレイクラスター) を加えるのが一般的。
 * 「L/R 2 台だけ」は PC のステレオ・スピーカーの想定であり、ライブ会場としては非現実的なので採用しない。
 */
const fallbackLayoutByType = (type?: VenueType): SpeakerSpec[] => {
  switch (type) {
    case "hall":
      return [
        { kind: "L", position: { x: -7, y: 3.2, z: 0 }, weight: 1.15 },
        { kind: "R", position: { x: 7, y: 3.2, z: 0 }, weight: 1.15 },
        { kind: "C", position: { x: 0, y: 3.8, z: 0 }, weight: 0.35 },
        { kind: "FL", position: { x: -3, y: 1.4, z: 0.5 }, weight: 0.42 },
        { kind: "FR", position: { x: 3, y: 1.4, z: 0.5 }, weight: 0.42 },
        { kind: "SL", position: { x: -10, y: 3, z: 16 }, weight: 0.4 },
        { kind: "SR", position: { x: 10, y: 3, z: 16 }, weight: 0.4 },
        { kind: "S", position: { x: 0, y: 0.3, z: 0 }, weight: 0.6, lowpassHz: 120 },
      ];
    case "arena":
      return [
        { kind: "L", position: { x: -12, y: 5, z: 0 }, weight: 1.2 },
        { kind: "R", position: { x: 12, y: 5, z: 0 }, weight: 1.2 },
        { kind: "C", position: { x: 0, y: 6, z: 0 }, weight: 0.35 },
        { kind: "FL", position: { x: -4, y: 1.8, z: 0.5 }, weight: 0.4 },
        { kind: "FR", position: { x: 4, y: 1.8, z: 0.5 }, weight: 0.4 },
        { kind: "DL", position: { x: -8, y: 4, z: 28 }, weight: 0.55 },
        { kind: "DR", position: { x: 8, y: 4, z: 28 }, weight: 0.55 },
        { kind: "SL", position: { x: -16, y: 5, z: 18 }, weight: 0.45 },
        { kind: "SR", position: { x: 16, y: 5, z: 18 }, weight: 0.45 },
        { kind: "RL", position: { x: -10, y: 5, z: 50 }, weight: 0.4 },
        { kind: "RR", position: { x: 10, y: 5, z: 50 }, weight: 0.4 },
        { kind: "S", position: { x: 0, y: 0.4, z: 0 }, weight: 0.7, lowpassHz: 100 },
      ];
    case "outdoor":
      return [
        { kind: "L", position: { x: -10, y: 4, z: 0 }, weight: 1.2 },
        { kind: "R", position: { x: 10, y: 4, z: 0 }, weight: 1.2 },
        { kind: "DL", position: { x: -8, y: 4, z: 30 }, weight: 0.55 },
        { kind: "DR", position: { x: 8, y: 4, z: 30 }, weight: 0.55 },
        { kind: "RL", position: { x: -10, y: 4, z: 52 }, weight: 0.4 },
        { kind: "RR", position: { x: 10, y: 4, z: 52 }, weight: 0.4 },
        { kind: "S", position: { x: 0, y: 0.3, z: 0 }, weight: 0.6, lowpassHz: 110 },
      ];
    case "live_house":
    case "other":
    default:
      // ライブハウスでも実際は最低でも L/R FOH + サブ + 狭ステージ向けセンターフィル相当を備える。
      return [
        { kind: "L", position: { x: -3, y: 2.5, z: 0 }, weight: 1.2 },
        { kind: "R", position: { x: 3, y: 2.5, z: 0 }, weight: 1.2 },
        { kind: "C", position: { x: 0, y: 2.8, z: 0 }, weight: 0.3 },
        { kind: "S", position: { x: 0, y: 0.3, z: 0 }, weight: 0.55, lowpassHz: 130 },
      ];
  }
};

/**
 * VenuePreset.acoustic.spatial に PA 座標があればそれを使う。
 * 無ければ venue.type のフォールバック配置を返す。
 *
 * spatial 由来でも、現実の PA システムなら必ず備わる
 * サブウーファー (S) は subPosition が未指定でも L/R の中央床に合成する。
 * さらに hall / arena 規模ならステージ幅からフロントフィル (FL/FR) を、
 * arena / outdoor で depth が十分あるならディレイクラスター (DL/DR) も補う。
 */
export const getSpeakerLayout = (venue?: VenuePreset): SpeakerSpec[] => {
  const spatial = venue?.acoustic.spatial;
  if (!spatial) {
    return attachDefaultEq(fallbackLayoutByType(venue?.type));
  }
  const layout: SpeakerSpec[] = [
    { kind: "L", position: spatial.leftPaPosition, weight: 1.15 },
    { kind: "R", position: spatial.rightPaPosition, weight: 1.15 },
  ];
  if (spatial.centerPosition) {
    layout.push({ kind: "C", position: spatial.centerPosition, weight: 0.35 });
  }

  // PA 構成はタイプ名ではなく会場のサイズ (stageWidth / depth) で決める。
  // live_house は L/R + サブのみで完結するので拡張しない。
  // それ以外 (hall / arena / outdoor / other = 展示場・武道館的多目的施設 等) は
  // 規模に応じてフロントフィル → サイドフィル → ディレイクラスター → リアディレイを順に足す。
  const venueType = venue?.type;
  const stageWidth = spatial.stageWidth ?? 0;
  const depth = spatial.depth ?? 0;
  const isLargeFormat = venueType !== "live_house";

  // フロントフィル: stageWidth ≥ 6m から。最前列センター付近の音飛びを埋める。
  if (isLargeFormat && stageWidth >= 6) {
    const ffX = Math.min(4, stageWidth * 0.18);
    const ffY = Math.max(1.2, (spatial.leftPaPosition.y ?? 2) * 0.45);
    layout.push({ kind: "FL", position: { x: -ffX, y: ffY, z: 0.5 }, weight: 0.42 });
    layout.push({ kind: "FR", position: { x: ffX, y: ffY, z: 0.5 }, weight: 0.42 });
  }

  // サイドフィル: 横長会場 (stageWidth ≥ 10) の両翼席向け。
  // L/R の更に外側に置き、横方向の聞こえムラを補う。z は前方〜中央 (depth × 0.35)。
  if (isLargeFormat && stageWidth >= 10) {
    const sideX = Math.abs(spatial.leftPaPosition.x ?? 8) * 1.35;
    const sideY = Math.max(2.5, (spatial.leftPaPosition.y ?? 3) * 0.9);
    const sideZ = Math.max(8, depth * 0.35);
    layout.push({ kind: "SL", position: { x: -sideX, y: sideY, z: sideZ }, weight: 0.42 });
    layout.push({ kind: "SR", position: { x: sideX, y: sideY, z: sideZ }, weight: 0.42 });
  }

  // ディレイクラスター: depth ≥ 20m で追加。会場中央〜中後方 (depth × 0.5) あたりに吊る想定。
  // 幕張メッセ・代々木第一・武道館スタンド裏など、奥行きの長い会場で必須。
  if (isLargeFormat && depth >= 20) {
    const delayZ = depth * 0.5;
    const delayX = Math.abs(spatial.leftPaPosition.x ?? 8) * 0.7;
    const delayY = Math.max(3, (spatial.leftPaPosition.y ?? 4) * 0.85);
    layout.push({ kind: "DL", position: { x: -delayX, y: delayY, z: delayZ }, weight: 0.55 });
    layout.push({ kind: "DR", position: { x: delayX, y: delayY, z: delayZ }, weight: 0.55 });
  }

  // リアディレイ: depth ≥ 30m の超大規模会場 (アリーナ後方席 / 屋外 / 大型展示場) のみ追加。
  // 会場後方席のすぐ近く (depth × 0.85) に天井から吊られる想定。
  if (isLargeFormat && depth >= 30) {
    const rearZ = depth * 0.85;
    const rearX = Math.abs(spatial.leftPaPosition.x ?? 8) * 0.85;
    const rearY = Math.max(3, (spatial.leftPaPosition.y ?? 4) * 0.85);
    layout.push({ kind: "RL", position: { x: -rearX, y: rearY, z: rearZ }, weight: 0.4 });
    layout.push({ kind: "RR", position: { x: rearX, y: rearY, z: rearZ }, weight: 0.4 });
  }

  // サブウーファー: 明示位置があればそれを優先、無ければ L/R の中央床面に合成する。
  if (spatial.subPosition) {
    layout.push({
      kind: "S",
      position: spatial.subPosition,
      weight: 0.65,
      lowpassHz: 120,
    });
  } else {
    const subX = (spatial.leftPaPosition.x + spatial.rightPaPosition.x) / 2;
    layout.push({
      kind: "S",
      position: { x: subX, y: 0.3, z: 0 },
      weight: 0.55,
      lowpassHz: 120,
    });
  }

  return attachDefaultEq(layout);
};

