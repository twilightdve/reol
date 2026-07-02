# 03. Next Implementation Scope

## 今回のPRでやること

Gatsbyビルド時に、既存ファンサイトのJSONから残響座標用JSONを生成する。

## 入力

```txt
static/data/live.json
static/data/discography.json
```

任意:

```txt
src/data/zankyo/venue-layout-overrides.json
```

存在しない場合は空配列扱いで続行する。

## 出力

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

## 推奨追加ファイル

```txt
scripts/generate-zankyo-data.ts

src/features/zankyo/data-transform/
  index.ts
  source-types.ts
  generated-types.ts
  normalize.ts
  hash.ts
  io.ts
  transform-discography.ts
  transform-live.ts
  infer-venue.ts
  match-track.ts
  classify-entry.ts
  create-venue-layouts.ts
  merge-venue-layout-overrides.ts
  write-generated-files.ts
  write-reports.ts

src/data/zankyo/
  venue-layout-overrides.json
```

## package.json

可能なら追加。

```json
{
  "scripts": {
    "generate:zankyo": "tsx scripts/generate-zankyo-data.ts",
    "generate:zankyo:force": "tsx scripts/generate-zankyo-data.ts --force"
  }
}
```

既存の `prebuild` / `predevelop` があれば壊さずに組み込む。  
`tsx` がない場合は、プロジェクト方針に合わせて追加するか、既存のTypeScript実行方法に合わせる。

## 実装しないこと

今回のPRでは以下はやらない。

- ローカル音源選択UI
- Web Audio再生
- Canvas残光アート
- PWA
- Media Session
- Wake Lock
- 立ち位置マップUI
- セトリ充足チェックUI
- 音源解析

ただし、後続が作りやすいデータ形式にはしておく。
