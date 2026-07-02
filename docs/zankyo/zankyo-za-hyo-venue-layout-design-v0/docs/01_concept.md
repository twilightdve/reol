# 01. Concept

## なぜ会場レイアウトが必要か

残響座標の音響再現は、会場タイプだけでも動く。

しかし、より「あの日の場所」に近づけるには、以下の情報が効く。

```txt
ステージの位置
客席の奥行き
横幅
天井の高さ
2階席やバルコニーの有無
段差
柱
PA卓
スタンディングか座席か
自分の立ち位置がフロアのどの領域だったか
```

これらは、音の距離感、反響、低音の圧、視覚上の残光の広がりに反映できる。

## 目指す精度

完全な建築図面ではなく、音響・視覚演出に使える概略モデルを目指す。

```txt
正確な座席番号単位の再現:
  目指さない

会場の体感サイズ・位置関係・階層構造:
  目指す

ユーザーが自分のいた場所を置ける:
  目指す

音と光の方向・距離・反響に効く:
  目指す
```

## 座標系

```txt
x:
  左右。客席からステージを見て左が負、右が正。

z:
  ステージから客席奥方向。ステージ前が0、後方ほど大きい。

y:
  高さ。床が0。2階席やバルコニーで使う。
```

## レイアウト粒度

v0では以下の3段階。

### Level 1: Venue Type

live_house / hall / arena / outdoor_festival / exhibition / virtual / unknown

### Level 2: Simple Layout

stage position / audience area rectangle/trapezoid / capacity / standing/seated / floor count

### Level 3: Zones

front / middle / rear / left / center / right / balcony / second floor / PA area
