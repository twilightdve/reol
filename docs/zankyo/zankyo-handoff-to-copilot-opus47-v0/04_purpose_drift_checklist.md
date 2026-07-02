# 04. Purpose / Scope Drift Checklist

このチェックリストは、実装が残響座標の目的からズレていないかを確認するためのものです。

実装前、実装途中、PR前に確認してください。

## 0. 一文定義

残響座標は、ユーザーが自分で持っているローカル音源をブラウザ内で再生・解析し、既存ファンサイト由来のセトリ・曲マスタ・会場情報と組み合わせて、「あの日の会場・立ち位置・音響・余韻」を再構成するスマホファーストWebプレイヤーである。

- [ ] 今回の実装は、この一文定義に直接つながっている
- [ ] 実装の目的を音楽配信サービスに変えていない
- [ ] 実装の目的を汎用ビジュアライザーに変えていない
- [ ] 実装の目的をSNS投稿支援に変えていない
- [ ] 実装の目的を歌詞・ジャケット閲覧機能に変えていない

## 1. ローカル音源原則

- [ ] 音源ファイルをサーバーへ送信していない
- [ ] 音源ファイルをfetch/upload/API request/FormDataに載せていない
- [ ] 音源ファイルをpublic/static/assetsへコピーしていない
- [ ] 音源ファイルをIndexedDBへBlob/Fileとして永続化していない
- [ ] Fileオブジェクトはセッション中だけ保持する設計である
- [ ] 永続化するのはfileKey、ファイル名、相対パス、サイズ、lastModified、メタ情報、解析結果だけである

今回のGatsby変換PRでは、そもそも音源ファイルを扱わないこと。

## 2. 既存ファンサイト非侵襲

- [ ] `/zankyo/` 配下に閉じる設計になっている
- [ ] `/zankyo/` 以外でAudioContextを生成しない
- [ ] `/zankyo/` 以外でCanvas描画ループを起動しない
- [ ] 既存サイトの通常閲覧に重い処理を混ぜない
- [ ] IndexedDB名は既存サイトと衝突しない
- [ ] Service Workerを使う場合、scopeを既存サイト全体に広げない

今回のGatsby変換PRでは、`/zankyo/` ページ本体に触る場合でも重いクライアント処理は入れない。

## 3. Gatsby変換の目的

- [ ] `static/data/live.json` を一次ソースにしている
- [ ] `static/data/discography.json` を一次ソースにしている
- [ ] クライアント側で毎回全変換していない
- [ ] Gatsbyのビルド前またはNode実行フェーズで変換している
- [ ] 生成JSONは `static/zankyo/generated/` に出ている
- [ ] 変換ロジックは純粋関数としてテスト可能に分離されている
- [ ] 入力JSONがない場合は明確に失敗する
- [ ] 曲名未照合や会場未検証はwarning/reportに出す
- [ ] Gatsby buildが通る

## 4. データモデル分離

- [ ] TrackMasterは曲の概念であり、ローカル音源ファイルではない
- [ ] LocalTrackRecordはユーザー端末内ファイルのメタ情報であり、曲そのものではない
- [ ] Setlistは公演の曲順であり、音源ファイルを含まない
- [ ] Venueは会場の基本情報である
- [ ] VenueLayoutMetadataは会場構造・立ち位置・ゾーンである
- [ ] LiveMemoryPresetはその日の自分の記憶であり、会場そのものではない
- [ ] PlaybackQueueは実際に再生できるキューであり、今回PRではまだ作らなくてもよい

## 5. セトリ変換・曲名照合

- [ ] setlist entryに `matched / candidate / missing / special` の考え方がある
- [ ] `required / optional / substitutable / cover / medley / se / unreleased` の扱いがある
- [ ] 表記ゆれをnormalizeしている
- [ ] alias照合がある
- [ ] カバー、SE、メドレー、未音源化を単純なmissingとして扱っていない
- [ ] 未照合タイトルをCSV/reportに出している

## 6. 会場・レイアウト安全性

- [ ] 会場公式のフロアマップ画像を保存していない
- [ ] 座席図画像をアプリに同梱していない
- [ ] 外部HTMLを保存していない
- [ ] 参照URLだけを保持している
- [ ] capacityは未検証ならnullである
- [ ] capacityStatusは未検証ならneeds_verificationである
- [ ] dimensionsは未検証ならnullである
- [ ] 推定値を使う場合はstatusをestimatedにしている
- [ ] venue-layout-overrides.jsonがなくてもbase layoutを生成できる
- [ ] venue-layout-enrichment-tasks.csvを出力している
- [ ] venue-layout-coverage.jsonを出力している

## 7. 除外機能混入チェック

以下は作らない。

- [ ] 音源アップロード
- [ ] 音源配信
- [ ] 歌詞表示
- [ ] ジャケット画像取得
- [ ] 公式ロゴ使用
- [ ] ライブ映像再現
- [ ] デモモード
- [ ] SNS切り抜きモード
- [ ] 投稿用動画生成
- [ ] 共有機能
- [ ] 外部アカウント連携
- [ ] クラウド同期

1つでも実装されていたら削除または設計確認。

## 8. 生成物レビュー

- [ ] `manifest.json` が生成されている
- [ ] `tracks.json` が生成されている
- [ ] `venues.json` が生成されている
- [ ] `venue-layouts.json` が生成されている
- [ ] `setlists/index.json` が生成されている
- [ ] `setlists/*.json` が生成されている
- [ ] `import-report.json` が生成されている
- [ ] `unmatched-raw-titles.csv` が生成されている
- [ ] `venue-enrichment-tasks.csv` が生成されている
- [ ] `venue-layout-enrichment-tasks.csv` が生成されている
- [ ] `venue-layout-coverage.json` が生成されている
- [ ] 生成ファイルに音源本体が含まれていない
- [ ] 生成ファイルに歌詞本文が含まれていない
- [ ] 生成ファイルに公式画像/ロゴが含まれていない

## 9. 赤信号

以下が出たら作業を止めて設計確認。

- 音源アップロードが必要になった
- 外部音源URLを再生する設計になった
- デモ音源を入れた
- 歌詞表示を追加した
- ジャケット画像を取得した
- 公式ロゴを使った
- SNS投稿/動画書き出しを追加した
- `/zankyo/` 以外でAudioContextが起動した
- Gatsby build時に外部Webスクレイピングを必須にした
- 会場キャパを根拠なく埋めた
- TrackMasterにローカルFile情報を入れた
- LiveMemoryPresetとVenuePresetを混ぜた
- 汎用音楽サービス風UIになった
