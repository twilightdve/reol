# 09. Testing and Acceptance

## Unit Tests

対象:

- normalizeTitle
- normalizeVenueName
- inferVenueType
- transformDiscographyToTracks
- transformLiveToSetlists
- matchSetlistEntry
- classifySpecialEntry

## Fixture Tests

小さいfixtureを用意する。

```txt
fixtures/
  live.min.json
  discography.min.json
```

検証:

- 1 discography song → 1 track
- 1 live item → 1 setlist
- "-" → special
- `<br/>`を含むmashup → medley
- `日本武道館` → arena
- `Spotify O-EAST` → live_house
- `YouTube` → virtual

## Snapshot Tests

生成JSONのsnapshotを取る。

- tracks snapshot
- setlists index snapshot
- one setlist snapshot
- venues snapshot

## Build Test

```bash
npm run generate:zankyo
npm run build
```

## Acceptance Criteria

- `static/data/live.json` と `static/data/discography.json` から生成できる
- 生成処理がクライアントではなくNode側で走る
- `/zankyo/generated/manifest.json` が生成される
- `tracks.json` が生成される
- `venues.json` が生成される
- `setlists/index.json` が生成される
- `setlists/*.json` が生成される
- 会場capacityは未検証ならnull
- venue enrichment CSVが生成される
- unmatched raw titles CSVが生成される
- Gatsby buildが通る
- `/zankyo/` から生成済みJSONをfetchできる
- 音源ファイルを一切扱わない
- 歌詞/ジャケット/公式ロゴを出力しない
