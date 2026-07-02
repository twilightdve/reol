# Copilot / Opus 4.7 Start Prompt

以下をGitHub Copilot Chatまたは作業エージェントに貼ってください。

---

このリポジトリは既存のReol非公式ファンサイトです。  
CodexのRate Limitで作業が止まったため、あなたに「残響座標」実装を引き継いでもらいます。

まず、この引き継ぎ資料を読んでください。

```txt
docs/zankyo/handoff-to-copilot-opus47/README.md
docs/zankyo/handoff-to-copilot-opus47/01_project_overview.md
docs/zankyo/handoff-to-copilot-opus47/02_current_artifacts_and_docs.md
docs/zankyo/handoff-to-copilot-opus47/03_next_implementation_scope.md
docs/zankyo/handoff-to-copilot-opus47/04_purpose_drift_checklist.md
docs/zankyo/handoff-to-copilot-opus47/05_repo_integration_assumptions.md
docs/zankyo/handoff-to-copilot-opus47/06_acceptance_criteria_for_next_pr.md
```

さらに、以下の設計書がリポジトリに展開済みなら必ず読んでください。

```txt
docs/zankyo/zankyo-za-hyo-design-spec-v0/
docs/zankyo/zankyo-za-hyo-fansite-integration-addendum-v0/
docs/zankyo/zankyo-za-hyo-gatsby-transform-design-v0/
docs/zankyo/zankyo-za-hyo-venue-layout-design-v0/
```

## 今回あなたにやってほしいこと

まず、プレイヤー本体ではなく、Gatsbyビルド時のデータ変換フローを実装してください。

入力:

```txt
static/data/live.json
static/data/discography.json
```

任意入力:

```txt
src/data/zankyo/venue-layout-overrides.json
```

出力:

```txt
static/zankyo/generated/manifest.json
static/zankyo/generated/tracks.json
static/zankyo/generated/venues.json
static/zankyo/generated/venue-layouts.json
static/zankyo/generated/setlists/index.json
static/zankyo/generated/setlists/*.json
static/zankyo/generated/reports/import-report.json
static/zankyo/generated/reports/unmatched-raw-titles.csv
static/zankyo/generated/reports/venue-enrichment-tasks.csv
static/zankyo/generated/reports/venue-layout-enrichment-tasks.csv
static/zankyo/generated/reports/venue-layout-coverage.json
```

## 実装方針

- クライアント側で毎回変換しない
- Gatsbyのbuild/develop前、またはGatsby Nodeフェーズで一度だけ変換する
- 推奨は `scripts/generate-zankyo-data.ts`
- `package.json` に `generate:zankyo` を追加する
- 可能なら `prebuild` / `predevelop` に組み込む
- 変換ロジックは `src/features/zankyo/data-transform/` に置き、純粋関数としてテストしやすくする

## 絶対に守ること

- 音源ファイルを扱わない
- 音源アップロードを作らない
- 歌詞本文を出力しない
- ジャケット画像や公式ロゴを取得・同梱しない
- デモモードを作らない
- SNS切り抜き・動画生成・共有機能を作らない
- 会場キャパシティは推測で埋めない
- 不明なcapacityは `null`
- 未検証なら `capacityStatus: "needs_verification"`
- Gatsbyビルド時に外部Webをスクレイピングしない
- 会場公式フロアマップ画像や座席図を保存しない

## 最初の手順

1. リポジトリ構成を確認してください
2. Gatsbyのバージョン、TypeScript有無、既存scriptsを確認してください
3. `static/data/live.json` と `static/data/discography.json` の存在と構造を確認してください
4. 実装方針を短く報告してください
5. 実装してください
6. `npm run generate:zankyo` を実行してください
7. `npm run build` を実行してください
8. 結果を報告してください

## 完了報告に含めること

- 変更したファイル
- 生成されたJSON/CSV
- tracks件数
- setlists件数
- venues件数
- venue-layouts件数
- unmatched raw titles件数
- venue enrichment tasks件数
- 実行したコマンド
- build/lint/test結果
- `04_purpose_drift_checklist.md` に照らしてNoまたは懸念がある項目
- 次にやるべき作業
