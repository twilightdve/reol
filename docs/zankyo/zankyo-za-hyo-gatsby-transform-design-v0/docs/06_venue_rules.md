# 06. Venue Rules

## 目的

live.jsonの `place` から、残響座標のVenuePreset候補を作る。

## 基本方針

会場キャパシティは外部確認が必要なため、自動推定値を入れない。

```ts
capacity: null
capacityStatus: "needs_web_verification"
```

## venueId

```ts
venueId = "venue_" + normalizeVenueName(place)
```

同一会場の表記揺れはaliasで吸収する。

## 会場タイプ推定

### live_house

名前に以下を含む。

```txt
Zepp
Hatch
O-EAST
O-WEST
O-Crest
O-nest
DRUM
PIT
CLUB
LOFT
BIGCAT
LIQUIDROOM
WWW
UNIT
QUATTRO
```

### hall

```txt
ホール
市民会館
文化会館
公会堂
会館
HALL
Hall
```

ただし `KINTEX HALL`, `幕張メッセHALL` などは exhibition / arena寄り。

### arena

```txt
アリーナ
ARENA
日本武道館
横浜アリーナ
大阪城ホール
代々木
さいたまスーパーアリーナ
```

### exhibition

```txt
幕張メッセ
KINTEX
インテックス
展示場
```

### outdoor_festival

```txt
公園
野外
FES
フェス
MUSIC FESTIVAL
```

### virtual

```txt
YouTube
VRChat
配信
オンライン
```

## 出力フィールド

```ts
type GeneratedVenue = {
  schemaVersion: 1
  venueId: string
  name: string
  aliases: string[]
  type: VenueType
  typeGuessReason: string[]
  siteUrl?: string | null
  address?: string | null
  googleMapsUrl?: string | null
  capacity: number | null
  capacityStatus: "needs_web_verification" | "verified" | "unknown"
  sourceLiveIds: number[]
  sourceSetlistIds: string[]
}
```

## enrichment task

外部確認が必要なものをCSVに出す。

```csv
venueId,name,typeGuess,capacityStatus,siteUrl,address,sourceLiveIds
venue_nippon_budokan,日本武道館,arena,needs_web_verification,https://www.nipponbudokan.or.jp/,...,"55"
```

## 将来の補完

後で `venue-overrides.json` を用意する。

```json
{
  "venue_nippon_budokan": {
    "capacity": 14471,
    "capacityStatus": "verified",
    "type": "arena",
    "sourceUrl": "..."
  }
}
```

v0では `venue-overrides.json` は空でもよい。
