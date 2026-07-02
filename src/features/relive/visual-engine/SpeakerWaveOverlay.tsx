import React, { useEffect, useRef } from "react";

import type { SpeakerKind, SpeakerSpec } from "../audio-engine/speakerLayout";
import type { AudioReactiveFrame } from "../types/relive";

/**
 * ポジションマップに重ねる「スピーカーの音響特性を反映した波形オーバーレイ」。
 *
 * 各スピーカー位置から同心円状の波が外側へ広がるアニメーションを SVG / DIV で描画する。
 * 波の見た目は各 SPK の `eq` プロファイル (lowShelfHz / peakingHz / highShelfHz / lowpassHz) から導出:
 *
 * - **色相 (hue)**: 代表周波数 (peakingHz > S なら 60Hz > 1000Hz fallback) を 60Hz→0deg(赤) / 20kHz→280deg(紫) に
 *   対数マップ。サブウーファーは赤系・センター/フロントフィルは緑〜青系・高域寄りは青紫。
 * - **波長 (リング間隔) と速度**: 低域は遅く長周期、高域は速く短周期。
 *   duration = 1.4s + lowness * 2.6s (1.4〜4.0s)。
 * - **太さ**: 各 EQ 帯域の |gainDb| 合計から導出 (フラットなら 1px、強いブースト/カットがあるほど太い)。
 * - **明度 / 不透明度**: SPK の weight に比例。停止時は最小値で静止表示。
 *
 * 物理的に正確な放射ではなく、PA システムの音色傾向を視覚化する「概念的な可視化」。
 */

interface SpeakerWaveOverlayProps {
  speakers: SpeakerSpec[];
  /** 会場の前後方向長 (m)。スピーカーの top(%) 計算に使用。 */
  depthM: number;
  /** マップの半幅 (m)。SPK 最大 |x| + 15% 余白。left(%) 計算に使用。 */
  mapHalfWidthM: number;
  /** 再生中かどうか。false の場合は静止表示 (最初のリングのみ薄く表示)。 */
  isPlaying: boolean;
  /**
   * 音連動用のオーディオフレームを読むセレクタ。
   * 提供されると、SPK ごとの代表エネルギー帯を拾って
   * --wave-amp (0..1) を rAF で上書きし、波の輝度・脱乗感を音量に同期させる。
   * 未提供なら従来通り一定途明度の CSS アニメのみ。
   */
  readFrame?: () => AudioReactiveFrame;
}

interface WaveStyleVars {
  hue: number;
  saturation: number;
  /** リング展開周期 (秒)。低域ほど長い。 */
  durationSec: number;
  /** リング線の太さ (px)。 */
  strokeWidthPx: number;
  /** 最終的な拡大率。マップ短辺に対する比率で、低域ほど大きく広がる。 */
  maxScale: number;
  /** 不透明度 (0..1) ピーク値。 */
  alpha: number;
}

/**
 * 代表周波数を SPK の EQ から決定する。
 *   - lowpassHz があれば (= Sub) その帯域中央 (50Hz 付近) とみなす
 *   - peakingHz があればそれを代表値
 *   - それ以外は lowShelf と highShelf のバランスから推定
 *   - フォールバック: 1000Hz
 */
const representativeFrequencyHz = (spec: SpeakerSpec): number => {
  if (spec.lowpassHz !== undefined) {
    // Sub は lowpass / 2 を代表値とする (50〜80Hz 帯)。
    return Math.max(40, spec.lowpassHz / 2);
  }
  const eq = spec.eq;
  if (eq?.peakingHz !== undefined) {
    return eq.peakingHz;
  }
  // peaking が無い (= L/R など) 場合は高域 shelf 寄りに少し寄せる。
  if (eq?.highShelfHz !== undefined && (eq.highShelfGain ?? 0) > 0) {
    return eq.highShelfHz * 0.5;
  }
  return 1000;
};

/**
 * 周波数 (Hz) → 色相 (deg) と「低域度合い (0..1)」を返す。
 * 60Hz→赤 (0°), 1kHz→緑 (140°), 20kHz→紫 (280°)。
 */
const hueAndLowness = (freqHz: number): { hue: number; lowness: number } => {
  const minHz = 60;
  const maxHz = 20000;
  const clamped = Math.max(minHz, Math.min(maxHz, freqHz));
  const t = Math.log2(clamped / minHz) / Math.log2(maxHz / minHz); // 0..1
  return {
    hue: t * 280,
    lowness: 1 - t,
  };
};

/**
 * SPK の EQ から太さ係数 (0..1) を返す。EQ ブースト/カットの絶対値合計を 0〜12dB レンジに正規化。
 */
const eqIntensity = (spec: SpeakerSpec): number => {
  const eq = spec.eq;
  if (!eq) return spec.lowpassHz ? 0.9 : 0.4;
  const sum =
    Math.abs(eq.lowShelfGain ?? 0) +
    Math.abs(eq.peakingGain ?? 0) +
    Math.abs(eq.highShelfGain ?? 0);
  return Math.min(1, sum / 12);
};

const deriveWaveStyle = (spec: SpeakerSpec): WaveStyleVars => {
  const freq = representativeFrequencyHz(spec);
  const { hue, lowness } = hueAndLowness(freq);
  const intensity = eqIntensity(spec);
  // 低域ほどゆっくり長周期 (1.4〜4.0s)。
  const durationSec = 1.4 + lowness * 2.6;
  // 低域ほど大きく広がる (短辺の 35%→65%)。
  const maxScale = 0.35 + lowness * 0.3;
  // EQ 強度で太さ (1〜3px)。
  const strokeWidthPx = 1 + intensity * 2;
  // weight (通常 0.6〜1.0) を 0.35〜0.75 にマップ。
  const alpha = 0.35 + Math.min(1, spec.weight) * 0.4;
  return {
    hue,
    saturation: 78,
    durationSec,
    strokeWidthPx,
    maxScale,
    alpha,
  };
};

const RING_COUNT = 3;

/**
 * SPK 種別ごとに「どの周波数帯に反応させるか」を決める。
 * AudioReactiveFrame の low/mid/high/rms を帯域の重み付けで合成し 0..1 にクランプ。
 */
const amplitudeForKind = (kind: SpeakerKind, f: AudioReactiveFrame): number => {
  switch (kind) {
    case "S":
      return Math.min(1, f.lowEnergy * 1.3 + f.kickLike * 0.4);
    case "RL":
    case "RR":
      return Math.min(1, f.lowEnergy * 0.55 + f.midEnergy * 0.45 + f.rms * 0.2);
    case "DL":
    case "DR":
      return Math.min(1, f.lowEnergy * 0.45 + f.midEnergy * 0.55 + f.rms * 0.2);
    case "L":
    case "R":
      return Math.min(1, f.rms * 1.4 + f.midEnergy * 0.3);
    case "C":
      return Math.min(1, f.midEnergy * 1.0 + f.vocalBloom * 0.4);
    case "FL":
    case "FR":
      return Math.min(1, f.midEnergy * 0.55 + f.highEnergy * 0.6);
    case "SL":
    case "SR":
      return Math.min(1, f.midEnergy * 0.7 + f.highEnergy * 0.4);
    default:
      return f.rms;
  }
};

const SpeakerWaveOverlay: React.FC<SpeakerWaveOverlayProps> = ({
  speakers,
  depthM,
  mapHalfWidthM,
  isPlaying,
  readFrame,
}) => {
  const emitterRefs = useRef<Array<HTMLDivElement | null>>([]);

  // 再生中かつ readFrame 提供時のみ rAF で --wave-amp を更新。
  // 停止中は CSS の静止表示に任せるため --wave-amp を 1 に戻しておく。
  useEffect(() => {
    if (!isPlaying || !readFrame) {
      emitterRefs.current.forEach((el) => {
        el?.style.setProperty("--wave-amp", "1");
      });
      return;
    }
    let raf = 0;
    const tick = () => {
      const frame = readFrame();
      speakers.forEach((spec, i) => {
        const el = emitterRefs.current[i];
        if (!el) return;
        const ampRaw = amplitudeForKind(spec.kind, frame);
        // ダイナミックレンジ拡張: ampRaw^1.7 で中音量を押さえてピークを残し、
        // 「小さい音はより小さく、大きい音はより大きく」のメリハリを出す。
        const amp = Math.pow(ampRaw, 1.7);
        // 静音フロア 0.08 + 連動分 0.92 で 0.08..1.0 に収める。
        // これは opacity のみに使う (emitter に scale を乗せると
        // keyframe で一方向に広がるリングに脈動が鲨り、
        // 「拡大収縮を繰り返しながら広がる」不快な動きになる)。
        el.style.setProperty("--wave-amp", (0.08 + amp * 0.92).toFixed(3));
      });
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [isPlaying, readFrame, speakers]);

  if (depthM <= 0 || mapHalfWidthM <= 0 || speakers.length === 0) return null;
  // 親 (.relive-position-map) と同じ座標系で配置する。SPK 位置算出は親側と同一ロジック。
  const zToTopPct = (zM: number) =>
    4 + (Math.max(0, Math.min(depthM, zM)) / depthM) * 88;
  const xToLeftPct = (xM: number) =>
    50 + Math.max(-44, Math.min(44, (xM / mapHalfWidthM) * 44));
  return (
    <div
      className={`relive-speaker-wave-overlay${isPlaying ? " is-playing" : ""}`}
      aria-hidden="true"
    >
      {speakers.map((spec, index) => {
        const style = deriveWaveStyle(spec);
        const left = `${xToLeftPct(spec.position.x)}%`;
        const top = `${zToTopPct(spec.position.z)}%`;
        return (
          <div
            key={`wave-${spec.kind}-${index}`}
            ref={(el) => {
              emitterRefs.current[index] = el;
            }}
            className="relive-wave-emitter"
            style={
              {
                left,
                top,
                "--wave-hue": `${style.hue.toFixed(0)}`,
                "--wave-sat": `${style.saturation}%`,
                "--wave-dur": `${style.durationSec.toFixed(2)}s`,
                "--wave-stroke": `${style.strokeWidthPx.toFixed(2)}px`,
                "--wave-scale": `${style.maxScale.toFixed(2)}`,
                "--wave-alpha": `${style.alpha.toFixed(2)}`,
              } as React.CSSProperties
            }
          >
            {Array.from({ length: RING_COUNT }).map((_, ringIdx) => (
              <span
                key={ringIdx}
                className="relive-wave-ring"
                style={{
                  // 同一 SPK 内のリングを 1/RING_COUNT 周期ずつずらして連続放射を表現。
                  animationDelay: `${(-ringIdx * style.durationSec) / RING_COUNT}s`,
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default SpeakerWaveOverlay;
