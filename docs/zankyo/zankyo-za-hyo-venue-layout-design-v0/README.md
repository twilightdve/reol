# 残響座標 Venue Layout Metadata Design v0

この設計書は、残響座標に会場レイアウト情報を取り込むための追加設計です。

## 目的

既存ファンサイトの `live.json` に含まれる `place`, `placeSite`, `address`, `googleMapsUrl` を起点に、会場ごとの以下を残響座標へ取り込む。

- 会場種別
- キャパシティ
- スタンディング/椅子あり/座席指定
- フロア数
- ステージ位置
- 客席エリアの概略形状
- 2階席/バルコニー/段差/PA卓/柱などの音響に効く構造
- 立ち位置プリセット
- 音響推定パラメータ
- 参照URLと検証状態

## 重要方針

- 会場公式のフロアマップ画像や座席図画像は再配布しない
- 画像を保存しない
- 外部サイトのHTMLをアプリに同梱しない
- 取り込むのは、手入力・検証済みのメタデータと参照URL
- Gatsbyビルド時に外部Webをスクレイピングしない
- 会場情報は `venue-layout-overrides.json` として人間が管理する
- 不明な情報は `null` と `needs_verification` にする
- 推測値は `confidence` を低くし、音響補助にだけ使う

## 追加される入力

```txt
src/data/zankyo/venue-layout-overrides.json
```

## 追加される出力

```txt
static/zankyo/generated/venue-layouts.json
static/zankyo/generated/reports/venue-layout-enrichment-tasks.csv
static/zankyo/generated/reports/venue-layout-coverage.json
```
