# 03. Transform Flow

## 全体フロー

```txt
Gatsby build/develop start
  ↓
scripts/generate-zankyo-data.ts
  ↓
read static/data/live.json
read static/data/discography.json
  ↓
parse and validate source JSON
  ↓
build TrackMaster from discography
  ↓
build alias index
  ↓
build Venue records from live items
  ↓
build Setlist records from live items
  ↓
match setlist song names to TrackMaster
  ↓
classify special entries
  ↓
write generated JSON files
  ↓
Gatsby build copies static files to public
  ↓
/zankyo/ frontend fetches generated data
```

## 変換関数分割

```txt
loadSourceJson()
  ↓
transformDiscographyToTracks()
  ↓
createTrackAliasIndex()
  ↓
transformLiveToVenues()
  ↓
transformLiveToSetlists()
  ↓
matchSetlistEntries()
  ↓
writeGeneratedFiles()
  ↓
writeReports()
```

## Pure function化

Gatsby依存は入口だけにする。

よい:

```ts
const tracks = transformDiscographyToTracks(discographies)
```

避ける:

```ts
transformDiscographyToTracks(gatsbyActions, reporter, cache)
```

Gatsbyの `reporter` などは外側で使う。

## 変換の冪等性

同じ入力なら同じ出力を生成する。

- generatedAt はmanifestだけに入れるか、必要最小限にする
- setlists/*.json の中身は安定させる
- 配列は必ずsortする
- JSON stringifyは2スペース固定

## 差分を安定させるルール

- tracksは canonicalTitle または songId 順
- setlists indexは date desc, liveId desc
- setlist entriesは liveItemSongNo順
- venuesは name順
- unmatched titlesは count desc, rawTitle asc

## 入力欠損時

- live.itemsが空: setlist生成なし、reportにwarning
- liveItem.placeが空: venueIdなし、type = "virtual" or "unknown"
- setListが空: songCount = 0
- liveItemSongNameが "-" のみ: special entry
- discography songsが空: track生成なし、reportにwarning

## エラーにする条件

- live.jsonが存在しない
- discography.jsonが存在しない
- JSON parseできない
- 出力ディレクトリに書けない
- schemaVersion不整合が明確に起きる

## warningで続行する条件

- 曲名照合できない
- 会場タイプ推定できない
- capacity未検証
- Spotify featureなし
- 同名曲が複数候補
