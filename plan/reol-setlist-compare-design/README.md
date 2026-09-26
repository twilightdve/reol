# Reolファンサイト セトリ比較機能 設計パッケージ

このZIPは、既存の `live.json` / `discography.json` を前提にしたセトリ比較機能の実装設計一式です。

## 収録内容
- 01_overview.md: 機能コンセプト、MVP、将来拡張
- 02_data_model.md: 現行データ構造、比較用正規化モデル、songId移行案
- 03_ui_spec.md: 2公演比較、サマリー、差分表示、ツアーヒートマップ
- 04_routing_and_state.md: Gatsby/React想定のURL設計・状態管理
- 05_algorithm.md: 比較アルゴリズム、類似度、曲順差分
- 06_api_and_components.md: コンポーネント構成・責務分離
- 07_implementation_plan.md: MVPから拡張までの実装順序
- 08_test_cases.md: テスト観点
- src/: TypeScript実装雛形

## 前提
- `live.json` は `items[].setList[]` に曲順を持つ
- セトリ曲は `liveItemSongNo` と `liveItemSongName` を持つ
- `discography.json` の楽曲は `songId` を持つ
- MVPは曲名比較で実装可能
- 長期的にはセトリ側にも `songId` を持たせるのが望ましい
