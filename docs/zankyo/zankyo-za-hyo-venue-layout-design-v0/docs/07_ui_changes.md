# 07. UI Changes

## 立ち位置マップ強化

VenueLayoutMetadataがある場合、Player/Memory画面の立ち位置マップを会場タイプに応じて変える。

## v0 map

### live_house

```txt
┌─────────────┐
│   STAGE     │
├─────────────┤
│ front       │
│ middle      │
│ rear        │
└─────────────┘
```

### hall

```txt
┌─────────────┐
│   STAGE     │
├─────────────┤
│ front seats │
│ middle      │
│ rear        │
│ balcony?    │
└─────────────┘
```

### arena

```txt
┌─────────────────┐
│      STAGE      │
│ arena floor     │
│ stands / bowl   │
└─────────────────┘
```

## position preset UI

```txt
前方中央
前方下手
前方上手
中央
後方中央
2階/バルコニー
PA前
自分で置く
```

## warning display

layoutStatusが未検証の場合:

```txt
この会場レイアウトは推定です。
音響再現は体感補助として扱われます。
```

ただし、うるさく出しすぎない。  
設定画面や小さな注記でよい。

## 公式図面表示について

表示しない。  
必要なら外部リンクだけ。

```txt
会場公式サイトを見る
```
