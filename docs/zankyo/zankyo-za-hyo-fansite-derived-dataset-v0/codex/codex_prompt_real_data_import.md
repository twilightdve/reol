# Codex Prompt: Import Real Fansite JSON Dataset

既存ファンサイト内の `/zankyo/` 実装に、ファンサイト由来の実データセットを接続してください。

## 読むデータ

以下の生成済みJSONを読み込んでください。

```txt
static/tracks.json
static/venues.json
static/setlists/index.json
static/setlists/live_<liveId>_item_<liveItemNo>.json
reports/import-report.json
```

## 実装方針

1. `tracks.json` を TrackMaster として読み込む
2. `setlists/index.json` をセトリ一覧として表示する
3. ユーザーがセトリを選んだら、対応する `static/setlists/<setlistId>.json` を読み込む
4. `venues.json` から `venueId` で会場メタを引く
5. `venue.type` と `venue.acousticPresetHint.basePresetType` を音響プリセットの初期値に使う
6. `capacity` は null の可能性があるため、必須にしない
7. セトリ内の `entry.trackId` がある曲は自動照合候補として使う
8. `entry.trackId` がない曲は、ローカルファイル名照合または手動紐付けへ回す
9. `entry.policy` が `medley` / `se` / `unknown` のものは special 扱いにする

## 絶対にしないこと

- 音源ファイルを同梱しない
- 音源をアップロードしない
- 歌詞・ジャケット・公式ロゴを表示しない
- `reports/unmatched-raw-titles.csv` を自動で正解扱いしない
- `capacity: null` の会場に適当なキャパを入れない

## 受け入れ条件

- セトリ一覧に公演名・日付・会場名・曲数が表示される
- セトリ詳細に曲順が表示される
- `trackId` 付きの曲は曲マスタにリンクできる
- `trackId` なしの曲は手動紐付け/特殊扱いとして表示できる
- 会場タイプから live_house / hall / arena / outdoor / default の初期音響プリセットを選べる
- 既存ファンサイトの通常ページに影響しない
