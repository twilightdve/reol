import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AudioAnalysisCache,
  AudioReactiveFrame,
  LocalTrackRecord,
  OutputDeviceProfile,
  ReverbPreset,
  VenuePreset,
} from "../types/relive";
import {
  getSpeakerLayout,
  type SpeakerSpec,
} from "./speakerLayout";

// 出力デバイス別の簡易 EQ ティルト。low shelf (150Hz) と high shelf (4.5kHz)。
const outputDeviceTilt: Record<OutputDeviceProfile, { lowDb: number; highDb: number }> = {
  default: { lowDb: 0, highDb: 0 },
  earphones: { lowDb: -1, highDb: -1.5 },
  airpods: { lowDb: -1.5, highDb: 1 },
  wired_headphones: { lowDb: 0, highDb: 0.5 },
  speaker: { lowDb: 2.5, highDb: 1 },
  car_bluetooth: { lowDb: 3, highDb: -1 },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** ユーザー調整可能な 8 バンドグラフィック EQ の中心周波数 (Hz)。 */
export const USER_EQ_FREQUENCIES = [60, 170, 350, 700, 1500, 3000, 6000, 12000] as const;
/** グラフィック EQ のバンド数。 */
export const USER_EQ_BAND_COUNT = USER_EQ_FREQUENCIES.length;

/** AudioListener の位置と向きを設定 (新/旧 API 対応)。 */
const setListenerPose = (
  listener: AudioListener,
  pos: { x: number; y: number; z: number },
  now: number
) => {
  type LegacyListener = AudioListener & {
    setPosition?: (x: number, y: number, z: number) => void;
    setOrientation?: (
      fx: number,
      fy: number,
      fz: number,
      ux: number,
      uy: number,
      uz: number
    ) => void;
  };
  if (listener.positionX) {
    listener.positionX.setTargetAtTime(pos.x, now, 0.08);
    listener.positionY.setTargetAtTime(pos.y, now, 0.08);
    listener.positionZ.setTargetAtTime(pos.z, now, 0.08);
    // ステージ (z=0) を向く forward = (0, 0, -1)。
    listener.forwardX.value = 0;
    listener.forwardY.value = 0;
    listener.forwardZ.value = -1;
    listener.upX.value = 0;
    listener.upY.value = 1;
    listener.upZ.value = 0;
  } else {
    (listener as LegacyListener).setPosition?.(pos.x, pos.y, pos.z);
    (listener as LegacyListener).setOrientation?.(0, 0, -1, 0, 1, 0);
  }
};

const silentFrame: AudioReactiveFrame = {
  lowEnergy: 0,
  midEnergy: 0,
  highEnergy: 0,
  rms: 0,
  kickLike: 0,
  snareLike: 0,
  hatLike: 0,
  bassFlow: 0,
  vocalBloom: 0,
};

const average = (data: Uint8Array, start: number, end: number) => {
  const from = Math.max(0, Math.floor(start));
  const to = Math.min(data.length, Math.floor(end));
  if (to <= from) {
    return 0;
  }

  let sum = 0;
  for (let i = from; i < to; i += 1) {
    sum += data[i];
  }

  return sum / (to - from) / 255;
};

type WindowWithAudioContext = Window & {
  webkitAudioContext?: typeof AudioContext;
};

type AnalysisAccumulator = {
  fileKey?: string;
  samples: number;
  rmsSum: number;
  lowSum: number;
  midSum: number;
  highSum: number;
  rmsMin: number;
  rmsMax: number;
};

const createAccumulator = (fileKey?: string): AnalysisAccumulator => ({
  fileKey,
  samples: 0,
  rmsSum: 0,
  lowSum: 0,
  midSum: 0,
  highSum: 0,
  rmsMin: 1,
  rmsMax: 0,
});

/**
 * ノイズ + 指数減衰でインパルス応答 (IR) を合成。
 * damping (0..1) が大きいほど高域減衰が強く、暗く長い余韻になる。
 */
const buildImpulseResponse = (
  ctx: BaseAudioContext,
  decaySec: number,
  damping: number
): AudioBuffer => {
  const sr = ctx.sampleRate;
  const safeDecay = clamp(decaySec, 0.05, 10);
  const safeDamping = clamp(damping, 0, 1);
  const length = Math.max(1, Math.floor(sr * safeDecay));
  const buffer = ctx.createBuffer(2, length, sr);
  // damping 大 → 1 極ローパスの係数を小さく (帯域を狭く)
  const lpCoef = 0.05 + (1 - safeDamping) * 0.55;
  // damping 大 → 減衰カーブを急峻ではなくテール長め、damping 小 → 早めに落ちる
  const decayExp = 2 + safeDamping * 4;
  for (let ch = 0; ch < 2; ch += 1) {
    const data = buffer.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < length; i += 1) {
      const noise = Math.random() * 2 - 1;
      lp += lpCoef * (noise - lp);
      const t = i / length;
      const env = Math.pow(1 - t, decayExp);
      data[i] = lp * env;
    }
  }
  return buffer;
};

export const useAudioEngine = (
  tracks: LocalTrackRecord[],
  sessionFiles: Map<string, File>,
  venue?: VenuePreset,
  masterGainDb = -3,
  limiterEnabled = true,
  onEnded?: () => void,
  listenerX = 0,
  listenerZ = 8,
  outputDeviceProfile: OutputDeviceProfile = "default",
  userEqBands?: number[],
  reverbOverride?: ReverbPreset,
  // true のとき会場/デバイス EQ・スピーカー配置・残響・リミッターを全てバイパスし、
  // 純粋な入力音 (inputGain → masterGain → 出力) を流す。素の音との A/B 比較用。
  effectsBypassed = false
) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const inputGainRef = useRef<GainNode | null>(null);
  // エフェクトチェーン全体への入力ゲート (バイパス時は 0)。
  const effectsGainRef = useRef<GainNode | null>(null);
  // バイパス経路 (inputGain → bypassGain → masterGain) のゲート (バイパス時のみ 1)。
  const bypassGainRef = useRef<GainNode | null>(null);
  const eqRefs = useRef<BiquadFilterNode[]>([]);
  // ユーザー調整可能なグラフィック EQ (peaking)。会場 EQ の後段、デバイスティルトの前段に挿入。
  const userEqRefs = useRef<BiquadFilterNode[]>([]);
  // ステレオを L/R チャンネルに分離して供給する splitter (deviceHigh の出力を受ける)。
  const channelSplitterRef = useRef<ChannelSplitterNode | null>(null);
  // スピーカー出力の集約点。
  const speakerMixRef = useRef<GainNode | null>(null);
  const speakerNodesRef = useRef<
    {
      spec: SpeakerSpec;
      delay: DelayNode;
      gain: GainNode;
      lowpass?: BiquadFilterNode;
      eqLow?: BiquadFilterNode;
      eqPeak?: BiquadFilterNode;
      eqHigh?: BiquadFilterNode;
      panner: StereoPannerNode;
    }[]
  >([]);
  const deviceLowRef = useRef<BiquadFilterNode | null>(null);
  const deviceHighRef = useRef<BiquadFilterNode | null>(null);
  // 残響 (リバーブ) チェーン。speakerMix の後段に dry/wet 並列で挿入。
  const reverbBusRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const preDelayRef = useRef<DelayNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  // IR 再生成判定用の現在の (decay, damping)
  const reverbIrParamsRef = useRef<{ decaySec: number; damping: number } | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const frequencyRef = useRef<Uint8Array | null>(null);
  const timeRef = useRef<Uint8Array | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const analysisRef = useRef<AnalysisAccumulator>(createAccumulator());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const currentTrack = tracks[currentIndex];

  useEffect(() => {
    analysisRef.current = createAccumulator(currentTrack?.fileKey);
  }, [currentTrack?.fileKey]);

  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  /**
   * 現状のスピーカーチェーンを破棄し、venue の構成 (PA 座標 or タイプ別フォールバック)
   * から作り直す。channelSplitter → speakerMix の間を構築。
   * L PA には L チャンネルのみ、R PA には R チャンネルのみ、C / S には L+R の和を送る。
   */
  const rebuildSpeakerChainInternal = useCallback(
    (ctx: AudioContext, currentVenue?: VenuePreset) => {
      const splitter = channelSplitterRef.current;
      const mix = speakerMixRef.current;
      if (!splitter || !mix) {
        return;
      }
      // 既存ノードを切断。
      try {
        splitter.disconnect();
      } catch {
        /* ignore */
      }
      speakerNodesRef.current.forEach((node) => {
        try {
          node.panner.disconnect();
          node.eqHigh?.disconnect();
          node.eqPeak?.disconnect();
          node.eqLow?.disconnect();
          node.lowpass?.disconnect();
          node.gain.disconnect();
          node.delay.disconnect();
        } catch {
          /* ignore */
        }
      });
      speakerNodesRef.current = [];

      const layout = getSpeakerLayout(currentVenue);

      layout.forEach((spec) => {
        // 到達遅延用 DelayNode。最大 500ms あれば 170m 程度まで対応可能。
        const delay = ctx.createDelay(0.5);
        const gain = ctx.createGain();
        gain.gain.value = spec.weight;
        let lowpass: BiquadFilterNode | undefined;
        if (spec.lowpassHz) {
          lowpass = ctx.createBiquadFilter();
          lowpass.type = "lowpass";
          lowpass.frequency.value = spec.lowpassHz;
        }

        // スピーカー種別ごとの周波数特性 (lowShelf → peaking → highShelf)。
        let eqLow: BiquadFilterNode | undefined;
        let eqPeak: BiquadFilterNode | undefined;
        let eqHigh: BiquadFilterNode | undefined;
        const eq = spec.eq;
        if (eq?.lowShelfHz !== undefined && eq.lowShelfGain !== undefined) {
          eqLow = ctx.createBiquadFilter();
          eqLow.type = "lowshelf";
          eqLow.frequency.value = eq.lowShelfHz;
          eqLow.gain.value = eq.lowShelfGain;
        }
        if (eq?.peakingHz !== undefined && eq.peakingGain !== undefined) {
          eqPeak = ctx.createBiquadFilter();
          eqPeak.type = "peaking";
          eqPeak.frequency.value = eq.peakingHz;
          eqPeak.gain.value = eq.peakingGain;
          eqPeak.Q.value = eq.peakingQ ?? 1.0;
        }
        if (eq?.highShelfHz !== undefined && eq.highShelfGain !== undefined) {
          eqHigh = ctx.createBiquadFilter();
          eqHigh.type = "highshelf";
          eqHigh.frequency.value = eq.highShelfHz;
          eqHigh.gain.value = eq.highShelfGain;
        }

        // HRTF だと listener 位置によって両 PA が同じ側に見えて反転するため、
        // シンプルに StereoPanner を使う:
        //   L / DL → 完全左 (-1), R / DR → 完全右 (+1)
        //   SL / RL → ほぼ左 (-0.85), SR / RR → ほぼ右 (+0.85)
        //   FL → やや左 (-0.6), FR → やや右 (+0.6)  ※フロントフィルは中央寄り
        //   C / S → センター (0)
        const panner = ctx.createStereoPanner();
        if (spec.kind === "L" || spec.kind === "DL") {
          panner.pan.value = -1;
        } else if (spec.kind === "R" || spec.kind === "DR") {
          panner.pan.value = 1;
        } else if (spec.kind === "SL" || spec.kind === "RL") {
          panner.pan.value = -0.85;
        } else if (spec.kind === "SR" || spec.kind === "RR") {
          panner.pan.value = 0.85;
        } else if (spec.kind === "FL") {
          panner.pan.value = -0.6;
        } else if (spec.kind === "FR") {
          panner.pan.value = 0.6;
        } else {
          panner.pan.value = 0;
        }

        // L 系 (L / FL / DL / SL / RL) には L チャンネル(splitter出力 0) のみ、
        // R 系 (R / FR / DR / SR / RR) には R チャンネル(splitter出力 1) のみ、
        // C / S には両チャンネル (splitter 両出力) を加算して送る。
        // splitter → delay (到達遅延) → gain (距離減衰込み) → [lowpass] → [eqLow] → [eqPeak] → [eqHigh] → panner → mix
        if (
          spec.kind === "L" ||
          spec.kind === "FL" ||
          spec.kind === "DL" ||
          spec.kind === "SL" ||
          spec.kind === "RL"
        ) {
          splitter.connect(delay, 0);
        } else if (
          spec.kind === "R" ||
          spec.kind === "FR" ||
          spec.kind === "DR" ||
          spec.kind === "SR" ||
          spec.kind === "RR"
        ) {
          splitter.connect(delay, 1);
        } else {
          splitter.connect(delay, 0);
          splitter.connect(delay, 1);
        }
        delay.connect(gain);
        let cursor: AudioNode = gain;
        if (lowpass) {
          cursor.connect(lowpass);
          cursor = lowpass;
        }
        if (eqLow) {
          cursor.connect(eqLow);
          cursor = eqLow;
        }
        if (eqPeak) {
          cursor.connect(eqPeak);
          cursor = eqPeak;
        }
        if (eqHigh) {
          cursor.connect(eqHigh);
          cursor = eqHigh;
        }
        cursor.connect(panner);
        panner.connect(mix);

        speakerNodesRef.current.push({
          spec,
          delay,
          gain,
          lowpass,
          eqLow,
          eqPeak,
          eqHigh,
          panner,
        });
      });
    },
    []
  );

  const ensureAudioGraph = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || typeof window === "undefined") {
      return;
    }

    const AudioContextClass =
      window.AudioContext || (window as WindowWithAudioContext).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error("AudioContext is not available");
    }

    if (!contextRef.current) {
      contextRef.current = new AudioContextClass();
      analyserRef.current = contextRef.current.createAnalyser();
      analyserRef.current.fftSize = 1024;
      // smoothingTimeConstant を下げてキック/ハット等の瞬発反応を強める。
      // 0.82 だと平滑化が強く、ビートに対する視覚反応が鈍く感じられる。
      analyserRef.current.smoothingTimeConstant = 0.55;
      frequencyRef.current = new Uint8Array(new ArrayBuffer(analyserRef.current.frequencyBinCount));
      timeRef.current = new Uint8Array(new ArrayBuffer(analyserRef.current.fftSize));
    }

    if (!sourceRef.current && analyserRef.current && contextRef.current) {
      sourceRef.current = contextRef.current.createMediaElementSource(audio);
      inputGainRef.current = contextRef.current.createGain();
      effectsGainRef.current = contextRef.current.createGain();
      effectsGainRef.current.gain.value = effectsBypassed ? 0 : 1;
      bypassGainRef.current = contextRef.current.createGain();
      bypassGainRef.current.gain.value = effectsBypassed ? 1 : 0;
      masterGainRef.current = contextRef.current.createGain();
      compressorRef.current = contextRef.current.createDynamicsCompressor();
      eqRefs.current = (venue?.acoustic.eq.bands || []).map((band) => {
        const node = contextRef.current?.createBiquadFilter() as BiquadFilterNode;
        node.type = band.type;
        node.frequency.value = band.frequencyHz;
        node.gain.value = band.gainDb;
        if (typeof band.q === "number") {
          node.Q.value = band.q;
        }
        return node;
      });

      // ユーザーグラフィック EQ: peaking フィルタ 8 本 (Q=1.0)。
      userEqRefs.current = USER_EQ_FREQUENCIES.map((frequency, index) => {
        const node = contextRef.current!.createBiquadFilter();
        node.type = "peaking";
        node.frequency.value = frequency;
        node.Q.value = 1.0;
        node.gain.value = userEqBands?.[index] ?? 0;
        return node;
      });

      // 出力デバイス別 EQ ティルト用シェルフ。
      deviceLowRef.current = contextRef.current.createBiquadFilter();
      deviceLowRef.current.type = "lowshelf";
      deviceLowRef.current.frequency.value = 150;
      deviceLowRef.current.gain.value = outputDeviceTilt[outputDeviceProfile].lowDb;

      deviceHighRef.current = contextRef.current.createBiquadFilter();
      deviceHighRef.current.type = "highshelf";
      deviceHighRef.current.frequency.value = 4500;
      deviceHighRef.current.gain.value = outputDeviceTilt[outputDeviceProfile].highDb;

      // スピーカーチェーンの splitter (ステレオ → L/R) / mix 点。
      channelSplitterRef.current = contextRef.current.createChannelSplitter(2);
      speakerMixRef.current = contextRef.current.createGain();
      speakerMixRef.current.gain.value = 1;

      // 残響チェーン (会場プリセット + ユーザー上書き) 。dry/wet 並列を reverbBus に集約。
      reverbBusRef.current = contextRef.current.createGain();
      reverbBusRef.current.gain.value = 1;
      dryGainRef.current = contextRef.current.createGain();
      dryGainRef.current.gain.value = 1;
      preDelayRef.current = contextRef.current.createDelay(0.5);
      preDelayRef.current.delayTime.value = 0;
      convolverRef.current = contextRef.current.createConvolver();
      wetGainRef.current = contextRef.current.createGain();
      wetGainRef.current.gain.value = 0;
      // 初期 IR を会場 or オーバーライドから生成。
      {
        const initialReverb = reverbOverride || venue?.acoustic.reverb;
        if (initialReverb) {
          const decay = initialReverb.decaySec ?? 1.2;
          const damping = initialReverb.damping ?? 0.5;
          convolverRef.current.buffer = buildImpulseResponse(
            contextRef.current,
            decay,
            damping
          );
          reverbIrParamsRef.current = { decaySec: decay, damping };
          preDelayRef.current.delayTime.value = (initialReverb.preDelayMs ?? 0) / 1000;
          wetGainRef.current.gain.value = clamp(initialReverb.amount ?? 0, 0, 1);
        } else {
          convolverRef.current.buffer = buildImpulseResponse(contextRef.current, 1.2, 0.5);
          reverbIrParamsRef.current = { decaySec: 1.2, damping: 0.5 };
        }
      }

      // メインチェーン：source → inputGain → effectsGain → venueEQ → userEQ → deviceLow → deviceHigh → channelSplitter
      //              → (各スピーカー) → speakerMix → compressor? → masterGain → analyser → dest
      // バイパス: source → inputGain → bypassGain → masterGain (会場/デバイス/PA/残響/リミッタを全て迂回)
      const trunk: AudioNode[] = [
        sourceRef.current,
        inputGainRef.current,
        effectsGainRef.current,
        ...eqRefs.current,
        ...userEqRefs.current,
        deviceLowRef.current,
        deviceHighRef.current,
        channelSplitterRef.current,
      ];
      for (let index = 0; index < trunk.length - 1; index += 1) {
        trunk[index].connect(trunk[index + 1]);
      }
      // バイパス分岐: inputGain → bypassGain → masterGain
      inputGainRef.current.connect(bypassGainRef.current);
      bypassGainRef.current.connect(masterGainRef.current);

      // スピーカーチェーンを venue に合わせて構築。
      rebuildSpeakerChainInternal(contextRef.current, venue);

      // speakerMix → (dry ・ wet) → reverbBus の並列接続。
      // dry: speakerMix → dryGain → reverbBus
      // wet: speakerMix → preDelay → convolver → wetGain → reverbBus
      speakerMixRef.current.connect(dryGainRef.current);
      dryGainRef.current.connect(reverbBusRef.current);
      speakerMixRef.current.connect(preDelayRef.current);
      preDelayRef.current.connect(convolverRef.current);
      convolverRef.current.connect(wetGainRef.current);
      wetGainRef.current.connect(reverbBusRef.current);

      const tail: AudioNode[] = [
        reverbBusRef.current,
        ...(limiterEnabled && compressorRef.current ? [compressorRef.current] : []),
        masterGainRef.current,
        analyserRef.current,
        contextRef.current.destination,
      ];
      for (let index = 0; index < tail.length - 1; index += 1) {
        tail[index].connect(tail[index + 1]);
      }

      // リスナー初期位置。
      setListenerPose(
        contextRef.current.listener,
        { x: listenerX, y: 1.5, z: listenerZ },
        contextRef.current.currentTime
      );
    }

    if (contextRef.current.state === "suspended") {
      await contextRef.current.resume();
    }
  }, [limiterEnabled, venue, listenerX, listenerZ, outputDeviceProfile, rebuildSpeakerChainInternal]);

  useEffect(() => {
    const now = contextRef.current?.currentTime ?? 0;
    const targetGain = 10 ** (masterGainDb / 20);
    masterGainRef.current?.gain.setTargetAtTime(targetGain, now, 0.05);

    const bands = venue?.acoustic.eq.bands || [];
    eqRefs.current.forEach((node, index) => {
      const band = bands[index];
      if (!band) {
        return;
      }
      node.type = band.type;
      node.frequency.setTargetAtTime(band.frequencyHz, now, 0.05);
      node.gain.setTargetAtTime(band.gainDb, now, 0.05);
      if (typeof band.q === "number") {
        node.Q.setTargetAtTime(band.q, now, 0.05);
      }
    });

    if (compressorRef.current && venue?.acoustic.dynamics) {
      const dynamics = venue.acoustic.dynamics;
      if (typeof dynamics.thresholdDb === "number") {
        compressorRef.current.threshold.setTargetAtTime(dynamics.thresholdDb, now, 0.05);
      }
      if (typeof dynamics.ratio === "number") {
        compressorRef.current.ratio.setTargetAtTime(dynamics.ratio, now, 0.05);
      }
      if (typeof dynamics.attackSec === "number") {
        compressorRef.current.attack.setTargetAtTime(dynamics.attackSec, now, 0.05);
      }
      if (typeof dynamics.releaseSec === "number") {
        compressorRef.current.release.setTargetAtTime(dynamics.releaseSec, now, 0.05);
      }
    }

    // 音像配置: リスナー位置に応じて StereoPanner と SPK 種別 EQ は維持しつつ、
    // ゲイン(距離減衰) と Delay(到達遅延) は完全に無効化する。
    //
    // 【理由】実 PA エンジニアは DSP の遅延補正と SPK 種別の EQ 調整で
    // 「リスナーがどこにいても、ほぼ均一に爆音で聴こえる」状態を作っている。
    // 仮想空間で距離減衰や delay をかけると:
    //   - 動かす前 (初期状態) と 動かした後 で音量が変わる (ユーザ報告)
    //   - 複数 SPK の delay 加算でコムフィルターが発生し低中域が打ち消される
    //   - 大会場ほど後方で音圧が下がり「爆音」感が失われる
    // よって距離減衰 distGain = 1.0、delay = 0 で固定する。
    // 体験差は StereoPanner (左右定位) と SPK 種別 EQ・lowpass のみで表現する。
    speakerNodesRef.current.forEach((node) => {
      node.gain.gain.setTargetAtTime(node.spec.weight, now, 0.08);
      node.delay.delayTime.setTargetAtTime(0, now, 0.05);
    });
    if (contextRef.current?.listener) {
      setListenerPose(
        contextRef.current.listener,
        { x: listenerX, y: 1.5, z: listenerZ },
        now
      );
    }
    const tilt = outputDeviceTilt[outputDeviceProfile];
    if (deviceLowRef.current) {
      deviceLowRef.current.gain.setTargetAtTime(tilt.lowDb, now, 0.08);
    }
    if (deviceHighRef.current) {
      deviceHighRef.current.gain.setTargetAtTime(tilt.highDb, now, 0.08);
    }
  }, [masterGainDb, venue, listenerX, listenerZ, outputDeviceProfile]);

  // ユーザーグラフィック EQ の gain 値を反映 (再生中もスムーズに変化)。
  useEffect(() => {
    const ctx = contextRef.current;
    if (!ctx || userEqRefs.current.length === 0) {
      return;
    }
    const now = ctx.currentTime;
    userEqRefs.current.forEach((node, index) => {
      const target = clamp(userEqBands?.[index] ?? 0, -24, 24);
      node.gain.setTargetAtTime(target, now, 0.05);
    });
  }, [userEqBands]);

  // エフェクトバイパス切替: エフェクト経路と素通し経路をクロスフェード。
  // クリックノイズを避けるため linearRampToValueAtTime で 60ms かけて入れ替える。
  useEffect(() => {
    const ctx = contextRef.current;
    const effectsGain = effectsGainRef.current;
    const bypassGain = bypassGainRef.current;
    if (!ctx || !effectsGain || !bypassGain) {
      return;
    }
    const now = ctx.currentTime;
    const rampSec = 0.06;
    effectsGain.gain.cancelScheduledValues(now);
    bypassGain.gain.cancelScheduledValues(now);
    effectsGain.gain.setValueAtTime(effectsGain.gain.value, now);
    bypassGain.gain.setValueAtTime(bypassGain.gain.value, now);
    effectsGain.gain.linearRampToValueAtTime(effectsBypassed ? 0 : 1, now + rampSec);
    bypassGain.gain.linearRampToValueAtTime(effectsBypassed ? 1 : 0, now + rampSec);
  }, [effectsBypassed]);

  // venue (会場) が切り替わったら、スピーカー配置を作り直す。
  useEffect(() => {
    const ctx = contextRef.current;
    if (!ctx || !channelSplitterRef.current || !speakerMixRef.current) {
      return;
    }
    rebuildSpeakerChainInternal(ctx, venue);
  }, [venue, rebuildSpeakerChainInternal]);

  // 残響 (リバーブ) パラメータの反映。reverbOverride を優先、無ければ venue.acoustic.reverb。
  // IR は decaySec / damping が変化したときのみ再生成する。
  useEffect(() => {
    const ctx = contextRef.current;
    const convolver = convolverRef.current;
    const preDelay = preDelayRef.current;
    const wet = wetGainRef.current;
    if (!ctx || !convolver || !preDelay || !wet) {
      return;
    }
    const effective = reverbOverride || venue?.acoustic.reverb;
    if (!effective) {
      wet.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
      return;
    }
    const decay = clamp(effective.decaySec ?? 1.2, 0.05, 10);
    const damping = clamp(effective.damping ?? 0.5, 0, 1);
    const prev = reverbIrParamsRef.current;
    if (!prev || prev.decaySec !== decay || prev.damping !== damping) {
      convolver.buffer = buildImpulseResponse(ctx, decay, damping);
      reverbIrParamsRef.current = { decaySec: decay, damping };
    }
    const now = ctx.currentTime;
    preDelay.delayTime.setTargetAtTime(
      clamp((effective.preDelayMs ?? 0) / 1000, 0, 0.5),
      now,
      0.05
    );
    wet.gain.setTargetAtTime(clamp(effective.amount ?? 0, 0, 1), now, 0.08);
  }, [venue, reverbOverride]);

  const loadTrack = useCallback(
    (track: LocalTrackRecord | undefined) => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      // 1) トラックが指定されない (キューが空 / 末尾を超えた) 場合は、
      //    既存の objectURL を必ず解放してから src を空にする。
      //    そうしないと前曲の Blob 参照が残り、メモリリークになる。
      if (!track) {
        cleanupObjectUrl();
        audio.removeAttribute("src");
        audio.load();
        setDuration(0);
        setCurrentTime(0);
        return;
      }

      const file = sessionFiles.get(track.fileKey);
      if (!file) {
        // セッションファイルが失われている場合も、古い objectURL は解放する。
        cleanupObjectUrl();
        audio.removeAttribute("src");
        audio.load();
        setError("このセッションで選択されたFile本体が見つかりません。もう一度選択してください。");
        return;
      }

      cleanupObjectUrl();
      const nextUrl = URL.createObjectURL(file);
      objectUrlRef.current = nextUrl;
      audio.src = nextUrl;
      audio.load();
      setDuration(0);
      setCurrentTime(0);
      setError(null);
    },
    [cleanupObjectUrl, sessionFiles]
  );

  useEffect(() => {
    loadTrack(currentTrack);
  }, [currentTrack, loadTrack]);

  useEffect(
    () => () => {
      cleanupObjectUrl();
      contextRef.current?.close().catch(() => undefined);
    },
    [cleanupObjectUrl]
  );

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) {
      return;
    }

    try {
      if (!audio.src) {
        loadTrack(currentTrack);
      }
      await ensureAudioGraph();
      await audio.play();
      setIsPlaying(true);
      setError(null);
    } catch (err) {
      setIsPlaying(false);
      // エラー種別ごとにユーザー向けメッセージを変える。
      // 1. AudioContext 自体が無い (古い iOS Safari / 一部 WebView)
      // 2. AutoplayPolicy で blocked (ユーザー操作なし)
      // 3. 音声フォーマット非対応 / デコード失敗
      if (err instanceof Error && err.message === "AudioContext is not available") {
        setError(
          "このブラウザは Web Audio API に対応していません。Chrome / Safari / Firefox の最新版でお試しください。"
        );
      } else if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError(
            "ブラウザの自動再生制限により再生できませんでした。もう一度再生ボタンを押してください。"
          );
        } else if (err.name === "NotSupportedError") {
          setError(
            "この音声形式はブラウザで再生できません。MP3 / AAC / FLAC など別形式でお試しください。"
          );
        } else {
          setError(`再生できませんでした (${err.name})。`);
        }
      } else {
        setError("再生できませんでした。ブラウザが対応する形式か確認してください。");
      }
    }
  }, [currentTrack, ensureAudioGraph, loadTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
      return;
    }
    void play();
  }, [isPlaying, pause, play]);

  const seek = useCallback((value: number) => {
    if (!audioRef.current) {
      return;
    }
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, Math.max(tracks.length - 1, 0)));
  }, [tracks.length]);

  const previous = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  const readFrame = useCallback((): AudioReactiveFrame => {
    const analyser = analyserRef.current;
    const frequency = frequencyRef.current;
    const time = timeRef.current;
    if (!analyser || !frequency || !time) {
      return silentFrame;
    }

    analyser.getByteFrequencyData(frequency);
    analyser.getByteTimeDomainData(time);

    const lowEnergy = average(frequency, 1, 8);
    const midEnergy = average(frequency, 8, 64);
    const highEnergy = average(frequency, 64, frequency.length);
    let rmsSum = 0;
    for (let i = 0; i < time.length; i += 1) {
      const centered = (time[i] - 128) / 128;
      rmsSum += centered * centered;
    }
    const rms = Math.sqrt(rmsSum / time.length);

    const frame = {
      lowEnergy,
      midEnergy,
      highEnergy,
      rms,
      kickLike: Math.min(1, lowEnergy * 1.6 + rms * 0.5),
      snareLike: Math.min(1, midEnergy * 1.25 + highEnergy * 0.25),
      hatLike: Math.min(1, highEnergy * 1.8),
      bassFlow: Math.min(1, lowEnergy * 0.8 + midEnergy * 0.35),
      vocalBloom: Math.min(1, midEnergy * 0.9 + rms * 0.55),
    };

    if (currentTrack) {
      const accumulator = analysisRef.current;
      if (accumulator.fileKey !== currentTrack.fileKey) {
        analysisRef.current = createAccumulator(currentTrack.fileKey);
      }
      const nextAccumulator = analysisRef.current;
      nextAccumulator.samples += 1;
      nextAccumulator.rmsSum += frame.rms;
      nextAccumulator.lowSum += frame.lowEnergy;
      nextAccumulator.midSum += frame.midEnergy;
      nextAccumulator.highSum += frame.highEnergy;
      nextAccumulator.rmsMin = Math.min(nextAccumulator.rmsMin, frame.rms);
      nextAccumulator.rmsMax = Math.max(nextAccumulator.rmsMax, frame.rms);
    }

    return frame;
  }, [currentTrack]);

  const buildAnalysisCache = useCallback((): AudioAnalysisCache | null => {
    if (!currentTrack || analysisRef.current.samples < 4) {
      return null;
    }

    const accumulator = analysisRef.current;
    const samples = accumulator.samples || 1;
    const lowEnergy = accumulator.lowSum / samples;
    const midEnergy = accumulator.midSum / samples;
    const highEnergy = accumulator.highSum / samples;

    return {
      schemaVersion: 1,
      analysisVersion: 1,
      fileKey: currentTrack.fileKey,
      durationSec: duration || currentTrack.metadata?.durationSec,
      summary: {
        averageRms: accumulator.rmsSum / samples,
        lowEnergy,
        midEnergy,
        highEnergy,
        spectralBrightness: Math.min(1, highEnergy / Math.max(0.001, lowEnergy + midEnergy + highEnergy)),
        dynamicRange: Math.max(0, accumulator.rmsMax - accumulator.rmsMin),
      },
      createdAt: new Date().toISOString(),
    };
  }, [currentTrack, duration]);

  const resetAnalysis = useCallback(() => {
    analysisRef.current = createAccumulator(currentTrack?.fileKey);
  }, [currentTrack?.fileKey]);

  const audioElement = useMemo(
    () => (
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime || 0);
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onEnded={onEnded || next}
      />
    ),
    [next, onEnded]
  );

  return {
    audioElement,
    currentTrack,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    duration,
    currentTime,
    error,
    play,
    pause,
    togglePlay,
    seek,
    next,
    previous,
    readFrame,
    buildAnalysisCache,
    resetAnalysis,
  };
};
