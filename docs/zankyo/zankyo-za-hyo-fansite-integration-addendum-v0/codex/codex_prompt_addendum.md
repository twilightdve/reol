# Codex Prompt Addendum: Existing Fansite Subdirectory

既存のReolファンサイトのサブディレクトリ配下に残響座標を実装してください。

## 重要

新規独立サービスとして作らないでください。  
既存ファンサイト内の `/zankyo/` 配下に隔離されたローカルプレイヤー領域として実装してください。

## 推奨URL

```txt
/zankyo/
```

## 実装方針

既存ファンサイトがReact/Gatsbyである場合:

- `src/pages/zankyo/index.tsx` を入口にする
- 機能本体は `src/features/zankyo/` に隔離する
- 音響・Canvas系の重いコードは `/zankyo/` に入るまでロードしない
- 既存サイトの通常ページでAudioContextを作らない
- IndexedDB名は `zankyo-za-hyo-v1` にする
- Static JSONは `/zankyo/*.json` または `/zankyo/setlists/*.json` から読む
- 既存ファンサイトのセトリDB/スプレッドシートから生成したJSONを使う

## 既存サイトと共有してよいもの

- 曲マスタJSON
- セトリJSON
- 会場名/日付などの公演情報
- 共通CSSのごく一部

## 既存サイトと共有しないもの

- AudioContext
- Web Audio node
- Canvas描画ループ
- IndexedDB database
- 音源File
- objectURL
- PWA Service Worker scope

## 実装除外

- デモモード
- SNS切り抜きモード
- 投稿用動画生成
- 共有機能
- 音源アップロード
- 歌詞表示
- 公式ジャケット/ロゴ取得

## 追加受け入れ条件

- `/zankyo/` 以外のファンサイト通常ページに音響処理が影響しない
- `/zankyo/` 配下でのみ音源選択・再生が発生する
- Service Workerを使う場合はscopeが `/zankyo/` に限定される
- IndexedDB名が既存サイトと衝突しない
- セトリページから `/zankyo/?setlist=<setlistId>` で遷移できる
