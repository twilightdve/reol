# 残響座標 Existing Fansite Integration Addendum v0

この追補は、残響座標を既存のReolファンサイトのサブディレクトリ配下に実装するための追加設計です。

前提:
- 残響座標は独立サービスではない
- 既存ファンサイト内の隔離されたローカルプレイヤー領域として実装する
- 推奨URLは `/zankyo/` または `/afterglow/`
- 音源アップロードなし
- デモなし
- SNS切り抜きなし
- 共有なし
- 既存ファンサイトのDB/スプレッドシート由来の曲マスタ・セトリJSONを読む

含むもの:
- docs/15_existing_fansite_subdirectory_integration.md
- codex/codex_prompt_addendum.md
