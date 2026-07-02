# 残響座標 sample dataset v0

これは実装検証用のサンプルデータセットです。
実際のReol公演セトリを保証するものではありません。

## ディレクトリ

- static/tracks.json
  - 曲マスタ。音源は含みません。
- static/venues.json
  - 会場タイプ別の音響プリセット。
- static/setlists/sample_bijigaku_2026_asahikawa.json
  - 仮のセトリ。
- user/local-library-scan.json
  - ユーザーがローカル音源フォルダを選んだ後のスキャン結果例。
- user/reports/setlist-readiness-sample.json
  - セトリ充足チェック結果例。
- user/live-memory-sample.json
  - 公演記憶プリセット例。
- user/analysis-cache/404-not-found-analysis.json
  - 音声解析キャッシュ例。
- user/playback-queue-sample.json
  - セトリ再生キュー例。
- user/app-settings-sample.json
  - アプリ設定例。

## 方針

音源ファイルそのものは含めない。
ファイル参照は fileKey で扱い、File オブジェクトはセッション中だけ保持する想定。
