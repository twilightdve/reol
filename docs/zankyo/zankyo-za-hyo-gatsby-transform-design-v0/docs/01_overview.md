# 01. Overview

## 背景

残響座標は、既存ファンサイトのライブ履歴・セトリ・ディスコグラフィ情報を使い、ユーザーのローカル音源とセトリを照合する。

すでにファンサイト側には以下のJSONがある。

- `live.json`
  - ライブ/イベント単位の情報
  - 各公演アイテム
  - 会場名
  - 日付
  - セトリ
  - 公式/関連投稿
  - レポートリンク

- `discography.json`
  - ディスコグラフィ
  - 曲名
  - Spotify Track ID
  - durationMs
  - tempo
  - energy
  - danceability
  - loudness
  - などの楽曲特徴量

## 変換後の用途

残響座標側では以下に使う。

- 曲マスタ
- セトリ選択
- セトリ充足チェック
- セトリ再生キュー生成
- BPM/テンポの初期値
- 曲ごとの色温度・演出強度の初期値
- 会場タイププリセット選択
- 会場メタ情報補完タスク

## Gatsbyで処理する理由

クライアントで毎回 `live.json` と `discography.json` 全体を変換すると重い。

Gatsbyのビルド時に変換すれば、ユーザー端末では以下だけを読む。

```txt
/zankyo/generated/tracks.json
/zankyo/generated/setlists/index.json
/zankyo/generated/setlists/<id>.json
/zankyo/generated/venues.json
```

## SSRという言葉の整理

この用途では、ページリクエストごとのSSR処理ではなく、GatsbyのNode実行フェーズ、つまりビルド時の静的データ生成として扱うのが適切。

理由:

- 入力JSONは静的
- 出力JSONも静的
- ユーザー別に変える必要がない
- ページアクセス時に変換する必要がない
- GitHub Pages等の静的ホスティングでも使える

したがって、本設計では「Gatsby SSR時」は「Gatsbyのビルド/Nodeフェーズで処理する」と解釈する。
