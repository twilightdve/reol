# 02. Current Artifacts and Docs

以下の設計資料が存在する想定です。リポジトリ内に未配置なら、必要に応じて資料ZIPを展開してください。

## 1. zankyo-za-hyo-design-spec-v0

役割:

残響座標全体の基本設計。

含むもの:

- PRD
- アーキテクチャ
- データモデル
- 音響エンジン
- ビジュアルエンジン
- セトリ照合
- UI/UX
- PWA/端末連携
- 権利/プライバシー
- 受け入れ条件
- TypeScript型定義

優先度:

中。全体像確認用。

## 2. zankyo-za-hyo-fansite-integration-addendum-v0

役割:

既存Reolファンサイトの `/zankyo/` サブディレクトリに実装するための追補。

重要点:

- 独立サービスではなく既存ファンサイト内に置く
- `/zankyo/` 以外でAudioContextやCanvasループを起動しない
- 既存サイトの通常表示に影響させない
- heavy codeは遅延ロードする

優先度:

高。

## 3. zankyo-za-hyo-gatsby-transform-design-v0

役割:

`live.json` / `discography.json` から残響座標用JSONをGatsbyビルド時に生成する設計。

重要出力:

```txt
static/zankyo/generated/manifest.json
static/zankyo/generated/tracks.json
static/zankyo/generated/venues.json
static/zankyo/generated/setlists/index.json
static/zankyo/generated/setlists/*.json
static/zankyo/generated/reports/import-report.json
static/zankyo/generated/reports/unmatched-raw-titles.csv
static/zankyo/generated/reports/venue-enrichment-tasks.csv
```

優先度:

最優先。

## 4. zankyo-za-hyo-venue-layout-design-v0

役割:

会場レイアウトメタ情報を取り込む追加設計。

重要出力:

```txt
static/zankyo/generated/venue-layouts.json
static/zankyo/generated/reports/venue-layout-enrichment-tasks.csv
static/zankyo/generated/reports/venue-layout-coverage.json
```

重要制約:

- 会場公式フロアマップ画像を保存しない
- 外部Webをビルド時スクレイピングしない
- capacityは根拠なしに埋めない
- 不明ならnull / needs_verification

優先度:

高。ただしGatsby変換本体と同時または直後でよい。

## 5. zankyo-codex-purpose-drift-checklist-v0

役割:

目的・スコープ逸脱チェックリスト。

今回この引き継ぎ資料では `04_purpose_drift_checklist.md` として統合済み。

優先度:

レビュー時に必須。
