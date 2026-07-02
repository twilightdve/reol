# 残響座標 Handoff Package for Copilot / Opus 4.7 v0

この資料は、CodexのRate Limitにより作業が中断したため、GitHub Copilot / Opus 4.7 へ作業を引き継ぐためのパッケージです。

## まず読む順番

1. `00_copilot_start_prompt.md`
2. `01_project_overview.md`
3. `02_current_artifacts_and_docs.md`
4. `03_next_implementation_scope.md`
5. `04_purpose_drift_checklist.md`
6. `05_repo_integration_assumptions.md`
7. `06_acceptance_criteria_for_next_pr.md`

## 引き継ぎの目的

既存のReol非公式ファンサイト内に、`/zankyo/` サブディレクトリとして「残響座標」を実装する。

ただし、まず作るべきはプレイヤー本体ではなく、既存ファンサイトの `live.json` / `discography.json` から、残響座標用の静的JSONをGatsbyビルド時に生成する変換フロー。

## 最優先タスク

```txt
Gatsby build-time data transform

static/data/live.json
static/data/discography.json
src/data/zankyo/venue-layout-overrides.json optional
  ↓
static/zankyo/generated/
  manifest.json
  tracks.json
  venues.json
  venue-layouts.json
  setlists/index.json
  setlists/*.json
  reports/*.json
  reports/*.csv
```

## 絶対に守ること

- 音源ファイルは扱わない
- 音源アップロードを作らない
- 歌詞本文を出力しない
- ジャケット画像・公式ロゴを取得しない
- デモモードを作らない
- SNS切り抜き・動画生成・共有機能を作らない
- `/zankyo/` 以外の既存ファンサイト通常ページに重い処理を入れない
- 会場キャパシティを根拠なしに埋めない
- 会場公式フロアマップ画像や座席図を保存・同梱しない
