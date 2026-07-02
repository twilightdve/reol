# 05. Track Matching Rules

## 目的

セトリ表記 `liveItemSongName` を `TrackMaster` に対応付ける。

## 正規化

```ts
export function normalizeTitle(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&amp;/g, "&")
    .replace(/\.(flac|mp3|m4a|aac|wav)$/i, "")
    .replace(/[【】「」『』\[\]\(\)（）]/g, " ")
    .replace(/\b(reol|れをる|レヲル)\b/gi, " ")
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "")
}
```

## alias index

discographyから以下をindexに入れる。

- songName
- feature.songName
- 括弧内feat除去版
- バージョン表記除去版
- 全角/半角正規化版
- 記号除去版

## 表記揺れ例

```txt
感情御中 -WANT U LUV IT
感情御中 - WANT U LUV IT-
感情御中 - WANT U LUV IT

煽げや尊し
煽げや尊し(Agitate)

ギガンティックO.T.N
ギガンティックO.T.N -Big Death Edition-

drop pop candy
drop pop candy (feat. ギガ)
```

## special分類

### se

以下はSE扱い候補。

```txt
-Opening-
-Ending-
-Interlude-
introduction
intro
ending
opening
```

### medley

以下を含む場合はmedley扱い。

```txt
Mashup
Mushuppppp
メドレー
コーナー
<br/>
～
~
```

### unknown / placeholder

```txt
-
未定
不明
```

### cover

live.titleやnoteで外部イベント/カバーと分かる場合、または曲マスタにないが明らかにReol持ち曲ではない場合はcover候補。

ただし自動cover判定は危険なので、v0では `unknown_special` または `manual_required` に寄せる。

## matching score

```txt
exact normalized match:
  1.0

alias match:
  0.92

version-stripped match:
  0.85

contains / partial:
  0.60

duration hint:
  +0.05

multiple candidates:
  candidate
```

## 出力

SetlistEntryに以下を含める。

```ts
type GeneratedSetlistEntry = {
  entryId: string
  order: number
  rawTitle: string
  displayTitle: string
  normalizedTitle: string
  policy: SetlistEntryPolicy
  trackId?: string
  match?: {
    status: "matched" | "candidate" | "missing" | "special"
    score?: number
    candidates?: string[]
    reason?: string
  }
  afterglowTailSec?: number
}
```

## afterglowTailSec 初期値

暫定:

```txt
通常曲:
  8

高energy曲:
  10

バラード/低energy:
  14

SE:
  4

medley:
  12

終盤曲:
  +4
```

discography featureがある場合:

```txt
afterglow = clamp(6 + energy * 5 + (1 - danceability) * 4, 6, 16)
```
