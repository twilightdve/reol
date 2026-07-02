# 06. Visual Engine

## 目的

音声特徴量、会場タイプ、公演記憶を、スマホ縦画面の抽象アートへ変換する。

## 基本コンセプト

ミュージックビジュアライザーではなく、余韻翻訳機。

音に即時反応しすぎない。  
少し遅れ、少し残る。  
曲が小さくなっても画面は完全には止まらない。

## Canvas

v0はCanvas 2D。

- WebGL/three.jsは後回し
- requestAnimationFrameで描画
- resize対応
- devicePixelRatio対応
- 背景は深い夜色
- UIとは別レイヤー

## 描画要素

### 光核

中央、または立ち位置に応じて少し偏る。  
低音・音圧で沈む/膨らむ。

### 粒子

ハイハット相当、高域、会場密度で増減。  
ライブハウスは密。アリーナは遠く広がる。

### 亀裂

スネア相当、高域ピーク、痛みタグで発火。  
一瞬だけ出て、すぐ残光になる。

### 残光

afterglowDecayで減衰。  
曲後にも残る。

### 波紋

アリーナ/ホールで強め。  
低音・大きなピークで広がる。

## VisualState

```ts
type VisualState = {
  time: number;
  pressure: number;
  bloom: number;
  fracture: number;
  particles: number;
  afterglow: number;
  drift: number;
  darkness: number;
  colorTemperature: number;
};
```

## AudioFeatures → VisualState

```txt
lowEnergy + kickLike
  → pressure

midEnergy + vocalBloom
  → bloom

highEnergy + snareLike
  → fracture

hatLike
  → particles

rms
  → total brightness

spectralFlux
  → sharpness

afterglowTail
  → afterglow decay only
```

## 会場タイプ別の見た目

### live_house

- 粒子密度高
- 近い光
- 暗さ強
- 低音で画面が沈む
- 亀裂多め

### hall

- 光が澄む
- 粒子少なめ
- 縦に伸びる
- 余白が綺麗

### arena

- 大きな波紋
- 遅れて広がる
- 粒子が遠い
- 高域は少し丸い
- afterglow長め

### outdoor

- 余白広い
- 空へ抜ける
- 残響少なめ
- 黒より青寄り

## LiveMemoryPresetによる補正

```txt
heat
  → 暖色、発光量

pressure
  → 低音反応、光核サイズ

pain
  → 亀裂、鋭さ

release
  → 上方向の粒子、広がり

distance
  → 光核の遠さ、粒子の小ささ

aftertaste
  → afterglow decay
```

## 曲後の残光時間

PlaybackQueueItem.kind = afterglow の間は音楽が鳴らない。  
ただし直前のVisualStateを減衰させて描画を続ける。

## 終演後モード

全キュー終了後:

- 音楽停止
- UI最小
- 残光だけが残る
- タップで戻る
- 長押しで記憶保存

## UI非表示について

「鑑賞モード」は作る。  
ただし「SNS切り抜きモード」ではない。

鑑賞モード:

- UIを薄くする
- タップで戻す
- 動画出力はしない
