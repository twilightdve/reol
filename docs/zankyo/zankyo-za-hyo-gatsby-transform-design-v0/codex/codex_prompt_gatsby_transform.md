# Codex Prompt: Gatsby Build-time Zankyo Data Transform

既存ReolファンサイトのGatsbyプロジェクトに、残響座標用データ生成フローを追加してください。

## 目的

既存の以下のJSONを一次ソースとして、Gatsbyのビルド時/Node実行フェーズで残響座標用の静的JSONへ変換します。

- `static/data/live.json`
- `static/data/discography.json`

クライアント側で毎回変換しないでください。

## 最初に読む設計書

以下を読んでから実装してください。

- `docs/zankyo/zankyo-za-hyo-gatsby-transform-design-v0/README.md`
- `docs/zankyo/zankyo-za-hyo-gatsby-transform-design-v0/docs/01_overview.md`
- `docs/zankyo/zankyo-za-hyo-gatsby-transform-design-v0/docs/02_source_to_target_mapping.md`
- `docs/zankyo/zankyo-za-hyo-gatsby-transform-design-v0/docs/03_transform_flow.md`
- `docs/zankyo/zankyo-za-hyo-gatsby-transform-design-v0/docs/04_gatsby_integration.md`
- `docs/zankyo/zankyo-za-hyo-gatsby-transform-design-v0/docs/05_track_matching_rules.md`
- `docs/zankyo/zankyo-za-hyo-gatsby-transform-design-v0/docs/06_venue_rules.md`
- `docs/zankyo/zankyo-za-hyo-gatsby-transform-design-v0/docs/09_testing_and_acceptance.md`

## 実装範囲

以下を実装してください。

1. `scripts/generate-zankyo-data.ts`
2. `src/features/zankyo/data-transform/` 配下の変換ロジック
3. `static/data/live.json` と `static/data/discography.json` の読み込み
4. `static/zankyo/generated/` への出力
5. `tracks.json`
6. `venues.json`
7. `setlists/index.json`
8. `setlists/*.json`
9. `reports/import-report.json`
10. `reports/venue-enrichment-tasks.csv`
11. `reports/unmatched-raw-titles.csv`
12. `package.json` の `generate:zankyo` script
13. 可能なら `prebuild` / `predevelop` に組み込み
14. 最小限のunit testまたはfixture test

## 絶対に守ること

- 音源ファイルは扱わない
- 歌詞本文を出力しない
- ジャケット画像や公式ロゴを取得しない
- ネットワークアクセスに依存しない
- 会場キャパシティを推測で埋めない
- capacityは未検証ならnull
- capacityStatusは `needs_web_verification`
- 変換ロジックはクライアントに持ち込まない
- `/zankyo/` ページでは生成済みJSONをfetchするだけにする

## 推奨出力先

```txt
static/zankyo/generated/
```

## 実装後に実行すること

```bash
npm run generate:zankyo
npm run build
```

既存プロジェクトのlint/testがあるならそれも実行してください。

## 完了報告に含めること

- 追加/変更したファイル
- 生成されたJSONの件数
- 未照合曲数
- 会場補完タスク件数
- 実行したコマンド
- build/lint/test結果
- 次にやるべきこと
