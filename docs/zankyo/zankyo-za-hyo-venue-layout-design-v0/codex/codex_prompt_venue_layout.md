# Codex Prompt: Add Venue Layout Metadata to Zankyo Gatsby Transform

既存の残響座標 Gatsby build-time data transformに、会場レイアウト情報を取り込む設計を追加実装してください。

## 最初に読む資料

以下を読んでください。

- `docs/zankyo/zankyo-za-hyo-venue-layout-design-v0/README.md`
- `docs/zankyo/zankyo-za-hyo-venue-layout-design-v0/docs/01_concept.md`
- `docs/zankyo/zankyo-za-hyo-venue-layout-design-v0/docs/02_data_model.md`
- `docs/zankyo/zankyo-za-hyo-venue-layout-design-v0/docs/03_override_file_design.md`
- `docs/zankyo/zankyo-za-hyo-venue-layout-design-v0/docs/04_transform_flow_changes.md`
- `docs/zankyo/zankyo-za-hyo-venue-layout-design-v0/docs/05_layout_to_acoustic_mapping.md`
- `docs/zankyo/zankyo-za-hyo-venue-layout-design-v0/docs/06_enrichment_workflow.md`
- `docs/zankyo/zankyo-za-hyo-venue-layout-design-v0/docs/07_ui_changes.md`

## 目的

`live.json` に含まれる `place`, `placeSite`, `address`, `googleMapsUrl` を起点に、会場ごとのレイアウトメタ情報を生成・上書きできるようにしてください。

## 実装内容

1. `VenueLayoutMetadata` 型を追加
2. `venue-layout-overrides.json` を読み込めるようにする
3. overrideがなくても全venueにbase layoutを生成する
4. 会場タイプに応じてdefault zones / listener presetsを生成する
5. overrideがある場合はbase layoutへマージする
6. `static/zankyo/generated/venue-layouts.json` を出力する
7. `static/zankyo/generated/reports/venue-layout-enrichment-tasks.csv` を出力する
8. `static/zankyo/generated/reports/venue-layout-coverage.json` を出力する
9. `manifest.json` にvenueLayouts pathを追加する
10. 既存のGatsby buildが通るようにする

## 絶対に守ること

- Gatsbyビルド時に外部Webをスクレイピングしない
- 会場公式のフロアマップ画像や座席図画像を保存しない
- 画像をbase64化して埋め込まない
- 公式画像やHTMLをアプリに同梱しない
- 取り込むのは手入力/検証済みメタデータと参照URLのみ
- キャパシティを推測で断定しない
- 不明なcapacityはnull
- capacityStatusはneeds_verification
- 不明なdimensionsもnull
- 推定値を使う場合はstatusをestimatedにする

## 出力先

```txt
static/zankyo/generated/venue-layouts.json
static/zankyo/generated/reports/venue-layout-enrichment-tasks.csv
static/zankyo/generated/reports/venue-layout-coverage.json
```

## 入力override候補

```txt
src/data/zankyo/venue-layout-overrides.json
```

存在しない場合は空配列扱いで続行してください。

## 完了後に実行

```bash
npm run generate:zankyo
npm run build
```

## 完了報告

- 変更ファイル
- 生成されたvenue-layouts件数
- coverage summary
- enrichment task件数
- 実行したコマンド
- build結果
- 未実装/次タスク
