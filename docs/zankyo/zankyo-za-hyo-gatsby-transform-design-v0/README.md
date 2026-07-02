# 残響座標 Gatsby Build/SSR Data Transform Design v0

この設計書は、既存Reolファンサイト内の `live.json` / `discography.json` を元に、Gatsbyのビルド時またはSSR相当のNode実行フェーズで、残響座標用の静的JSONへ変換するための設計です。

## 目的

手元で行った変換処理を、Gatsbyプロジェクト内で再現可能なビルドフローにする。

入力:

- `static/data/live.json`
- `static/data/discography.json`

出力:

- `static/zankyo/generated/tracks.json`
- `static/zankyo/generated/venues.json`
- `static/zankyo/generated/setlists/index.json`
- `static/zankyo/generated/setlists/*.json`
- `static/zankyo/generated/reports/import-report.json`
- `static/zankyo/generated/reports/venue-enrichment-tasks.csv`
- `static/zankyo/generated/reports/unmatched-raw-titles.csv`

## 重要方針

- クライアント側で毎回変換しない
- GatsbyのNode実行フェーズで一度だけ変換する
- ネットワーク取得に依存しない
- 既存ファンサイトの `live.json` / `discography.json` を一次ソースとする
- 音源ファイルは扱わない
- 歌詞・ジャケット・公式ロゴは扱わない
- 会場キャパシティは推定値を勝手に入れず、未検証タスクとして出力する
- 変換ロジックはGatsby依存に閉じ込めず、純粋関数としてテスト可能にする

## 推奨実装

```txt
src/features/zankyo/data-transform/
  index.ts
  types.ts
  normalize.ts
  transform-discography.ts
  transform-live.ts
  infer-venue.ts
  match-track.ts
  write-generated-files.ts

scripts/
  generate-zankyo-data.ts

gatsby-node.ts
```

## Gatsby統合の推奨順

第一候補:

```txt
npm scripts:
  prebuild:gatsby = tsx scripts/generate-zankyo-data.ts
  predevelop = tsx scripts/generate-zankyo-data.ts
```

第二候補:

```txt
gatsby-node.ts:
  onPreBootstrap or onPreBuild で generateZankyoData() を呼ぶ
```

第三候補:

```txt
sourceNodes / createPages でGraphQL node化
```

v0では第一候補を推奨。
