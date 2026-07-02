# 05. Layout to Acoustic Mapping

## 目的

会場レイアウト情報を、残響座標の音響・視覚に変換する。

## 使う情報

```txt
capacity
widthM / depthM / heightM
audienceMode
layoutShape
floor count
hasBalcony
listener normalizedX/Z/Y
stage position
zones
```

## acoustic derivation

```ts
type DerivedAcousticFromLayout = {
  stageWidth: number;
  depth: number;
  height: number;
  paSpread: number;
  defaultListenerPosition: Vec3;
  reverbAmountBias: number;
  preDelayMsBias: number;
  highDampingBias: number;
  bassPressureBias: number;
  earlyReflectionBias: number;
};
```

## venue type defaults

```ts
const layoutDefaults = {
  live_house: {
    widthM: 12,
    depthM: 24,
    heightM: 5,
    reverbAmountBias: 0.2,
    highDampingBias: 0.55,
    bassPressureBias: 0.8,
  },
  hall: {
    widthM: 24,
    depthM: 45,
    heightM: 12,
    reverbAmountBias: 0.45,
    highDampingBias: 0.35,
    bassPressureBias: 0.45,
  },
  arena: {
    widthM: 60,
    depthM: 100,
    heightM: 28,
    reverbAmountBias: 0.65,
    highDampingBias: 0.72,
    bassPressureBias: 0.7,
  },
  outdoor_festival: {
    widthM: 80,
    depthM: 120,
    heightM: 999,
    reverbAmountBias: 0.05,
    highDampingBias: 0.25,
    bassPressureBias: 0.55,
  }
};
```

## zone acoustic bias

### front

```txt
bassPressure +0.2
directSound +0.3
reverb -0.1
```

### rear

```txt
highDamping +0.2
preDelay +20ms
reverb +0.15
directSound -0.15
```

### balcony / second_floor

```txt
height +1
earlyReflection +0.1
bassPressure -0.1
```

### left/right

```txt
pan bias
one PA closer
```

## 注意

これは物理音響シミュレーションではない。  
「記憶としての聴こえ方」を支える近似である。
