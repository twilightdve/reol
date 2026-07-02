# 02. Source to Target Mapping

## 入力: live.json

想定構造:

```ts
type SourceLive = {
  liveId: number
  type: string
  title: string
  name: string
  date: string
  siteUrl?: string | null
  spotifyPlaylistId?: string | null
  items: SourceLiveItem[]
  posts?: unknown[]
  reports?: unknown[]
}

type SourceLiveItem = {
  liveId: number
  liveItemNo: number
  liveItemName: string
  date: string
  place?: string | null
  placeSite?: string | null
  address?: string | null
  googleMapsUrl?: string | null
  spotifyPlaylistId?: string | null
  setList: SourceSetlistSong[]
}

type SourceSetlistSong = {
  liveId: number
  liveItemNo: number
  liveItemSongNo: number
  liveItemSongName: string
}
```

## 入力: discography.json

想定構造:

```ts
type SourceDiscography = {
  discographyId: number
  title: string
  releaseDate: string
  name: string
  format: string
  siteUrl?: string
  songs: SourceSong[]
}

type SourceSong = {
  songId: number
  discographyId: number
  discographyTitle: string
  songNo: number
  songName: string
  spotifyTrackId?: string
  lyricMember?: string
  musicMember?: string
  produceMember?: string
  feature?: {
    spotifyTrackId: string
    songName: string
    tempo?: number
    durationMs?: number
    energy?: number
    danceability?: number
    loudness?: number
    valence?: number
    acousticness?: number
    instrumentalness?: number
    liveness?: number
    key?: number
    mode?: number
    timeSignature?: number
  } | null
}
```

## 出力: tracks.json

discography songs から生成。

```ts
type GeneratedTracksJson = {
  schemaVersion: 1
  source: {
    discographyJsonPath: string
    generatedAt: string
  }
  tracks: TrackMaster[]
}
```

TrackMasterへの対応:

```txt
trackId:
  song_<songId>

canonicalTitle:
  song.songName

aliases:
  normalize前後の表記
  feature.songNameが違えば追加
  discography由来のバージョン違い候補

artistNames:
  discography.name
  "Reol" / "REOL" / "れをる" は必要に応じてalias扱い

expectedDurationSec:
  song.feature.durationMs / 1000

audioFeature:
  tempo, energy, danceability, loudness, valence 等を保持

source:
  discographyId, songId, spotifyTrackId
```

## 出力: setlists/*.json

live.items の1件につき1 Setlistを生成。

```txt
setlistId = live_<liveId>_item_<liveItemNo>
```

Setlistへの対応:

```txt
tourName / liveTitle:
  live.title

date:
  liveItem.date || live.date

venueName:
  liveItem.place

venueId:
  normalized placeから生成

entries:
  liveItem.setList を liveItemSongNo 順に変換
```

## 出力: venues.json

live.items の place を集約して生成。

```txt
venueId:
  venue_<normalized_place>

name:
  place

siteUrl:
  placeSite

address:
  address

googleMapsUrl:
  googleMapsUrl

type:
  名前ルールで推定

capacity:
  null

capacityStatus:
  "needs_web_verification"
```

## 出力: setlists/index.json

一覧表示用。

```ts
type SetlistIndexItem = {
  setlistId: string
  liveId: number
  liveItemNo: number
  title: string
  date?: string
  venueName?: string
  venueId?: string
  type?: string
  songCount: number
  playablePolicySummary: {
    required: number
    special: number
    medley: number
    cover: number
    se: number
    unknown: number
  }
}
```

## 出力: reports

### import-report.json

- source件数
- 生成件数
- 照合件数
- 未照合タイトル
- special分類数
- warnings

### venue-enrichment-tasks.csv

会場キャパや区分を後で補完するためのタスク。

列:

```txt
venueId,name,typeGuess,capacityStatus,siteUrl,address,sourceLiveIds
```

### unmatched-raw-titles.csv

discographyと照合できなかったセトリ表記。

列:

```txt
rawTitle,normalizedTitle,count,exampleSetlistIds,reason
```
