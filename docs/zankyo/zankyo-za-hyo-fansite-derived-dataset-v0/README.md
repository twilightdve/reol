# 残響座標 Fansite Derived Dataset v0

`live.json` と `discography.json` から生成した、残響座標向けの実データ初期変換セットです。

## 入力ソース

- `live.json`
  - ライブ履歴
  - 公演回
  - 会場名
  - 会場URL/住所/Google Maps
  - セトリ
  - 関連投稿/レポート
- `discography.json`
  - ディスコグラフィ
  - 曲名
  - Spotify Track ID
  - BPM/tempo
  - durationMs
  - danceability/energy/loudness などのfeature

## 生成物

```txt
manifest.json
static/
  tracks.json
  venues.json
  setlists/
    index.json
    live_<liveId>_item_<liveItemNo>.json
reports/
  import-report.json
  venue-enrichment-tasks.csv
  unmatched-raw-titles.csv
codex/
  codex_prompt_real_data_import.md
```

## 集計

- source lives: 59
- source live items: 122
- source setlist entries: 1233
- source discographies: 85
- source discography songs: 157
- generated tracks: 156
- generated setlists: 122
- generated venue records: 104

## 注意

会場キャパシティは、この変換では埋めていません。
`capacity: null` / `capacityStatus: needs_web_verification` としてあります。

理由:
- キャパシティはスタンディング/着席/ホール利用/フェス利用で変わる
- 古い会場名や閉館・改名があり得る
- 誤った数字を入れると音響プリセットが汚れる

Codex実装時は、まず `type` と `venueSizeHint` を音響プリセット選択に使い、キャパは後続の会場メタ補完フェーズで埋めるのが安全です。

## セトリ照合

`discography.json` に存在する曲は `trackId` を自動付与しています。
カバー曲・コラボ曲・抽選会・Mashupヘッダ・表記揺れは `reports/unmatched-raw-titles.csv` に残しています。
