# 05. Audio Engine

## 目的

ローカル音源を、会場・立ち位置・記憶に応じて再構成し、同時にビジュアル用の音声特徴量を生成する。

## 初期Audio Graph

```txt
HTMLAudioElement
  ↓ createMediaElementSource
SourceNode
  ↓
Input Gain
  ↓
Venue EQ Chain
  ↓
Spatial / Position Processing
  ↓
Early Reflection Bus
  ↓
Reverb Bus
  ↓
Output Device Correction
  ↓
Dynamics / Limiter
  ↓
AnalyserNode
  ↓
Destination
```

v0ではすべてを完全実装しなくてよい。  
最小は Source → AnalyserNode → Destination。

## EQ

BiquadFilterNodeを複数つなげる。

基本5バンド:

```txt
LowShelf    80Hz
Peaking    160Hz
Peaking    400Hz
Peaking    2.5kHz
HighShelf  8kHz
```

会場タイプ別の傾向:

- live_house: 低域・中低域強め、高域少し丸める
- hall: 中高域きれい、低域は締める
- arena: 低域厚め、高域丸め、広い反響
- outdoor: ドライ、反響少なめ

## Spatial Audio

PannerNodeを使う。  
v0ではL/Rチャンネル完全分離までは必須ではない。

段階:

1. 音源全体を1つのPannerNodeで配置
2. L/Rチャンネルを仮想PAへ分ける
3. サブ/センターの補助バスを追加
4. 立ち位置/傾き連動

座標:

- x: 左右
- y: 高さ
- z: ステージから客席方向

## 初期反射

DelayNode + GainNodeで近似。

```txt
source
  ├ dry
  ├ delay 24ms side reflection
  ├ delay 42ms slap reflection
  └ reverb
```

## 疑似リバーブ

ConvolverNodeで実装。  
v0では疑似IRを生成する。

疑似IRの考え方:

- white noise
- exponential decay
- dampingで高域を削る
- decaySecとamountで会場ごとの残響を表現

## Dynamics / Limiter

EQ・リバーブ・低音ブーストで音量が跳ねるため、最終段に安全弁を置く。

- DynamicsCompressorNode
- masterGain
- limiterEnabled

## Real-time Audio Features

```ts
type AudioFeatures = {
  rms: number;
  lowEnergy: number;
  midEnergy: number;
  highEnergy: number;
  spectralFlux: number;
  kickLike: number;
  snareLike: number;
  hatLike: number;
  bassFlow: number;
  vocalBloom: number;
};
```

## 周波数帯の目安

```txt
low:
  40-160Hz

bassFlow:
  40-220Hz 平滑化

snareLike:
  150-250Hz + 1k-4kHz transient

hatLike:
  5k-10kHz peak

vocalBloom:
  500Hz-4kHz smooth energy
```

厳密な楽器認識ではなく、気持ちよい擬似音ハメを目指す。

## 事前解析

OfflineAudioContextまたはdecode済みAudioBufferで実施。

生成するもの:

- BPM
- BeatEvent[]
- AudioPeakEvent[]
- PseudoInstrumentEvent[]
- AudioSection[]

解析キャッシュは fileKey + analysisVersion で保存。

## 省電力モード

battery_saver:

- FFTサイズを小さく
- 粒子数を減らす
- 事前解析を停止
- リバーブを簡略化
- 傾き連動OFF

standard:

- 通常

high_visual:

- 粒子数増
- afterglow強め
- 解析密度高め
