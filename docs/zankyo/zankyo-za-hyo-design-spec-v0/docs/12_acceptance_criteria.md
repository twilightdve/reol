# 12. Acceptance Criteria

## Privacy / Local Only

- [ ] 音源ファイルをサーバーへ送信しない
- [ ] ネットワークタブで音源アップロードが発生しない
- [ ] FileオブジェクトをIndexedDBへ保存しない
- [ ] ファイル名/パス/メタデータを外部送信しない
- [ ] トップ画面に「音源なし」「アップロードなし」が表示される

## File / Library

- [ ] 複数音源を選択できる
- [ ] 可能な環境ではフォルダ選択できる
- [ ] FLAC, MP3, M4A/AAC, WAVを拡張子フィルタできる
- [ ] LocalTrackRecordが生成される
- [ ] 再選択時にfileKeyで既存情報を復元できる

## Playback

- [ ] ユーザー操作後に再生開始する
- [ ] 再生/停止/シークできる
- [ ] 前/次曲ができる
- [ ] 曲終了後にafterglow tailを挟める
- [ ] セトリ終了後に終演後モードへ入れる

## Audio Engine

- [ ] AnalyserNodeで周波数データを取れる
- [ ] low/mid/high/rmsを算出できる
- [ ] 擬似kick/snare/hatを算出できる
- [ ] EQプリセットを適用できる
- [ ] 音響処理後に音量が危険に跳ねない
- [ ] 非対応機能はフォールバックできる

## Visual Engine

- [ ] Canvasがスマホ縦画面で描画される
- [ ] 音に合わせて光核/粒子/亀裂が変化する
- [ ] 残光が減衰しながら残る
- [ ] 会場タイプで見え方が変わる
- [ ] 記憶タグで見え方が変わる
- [ ] 軽量モードで粒子数などが減る

## Setlist

- [ ] Setlist JSONを読み込める
- [ ] TrackMasterと照合できる
- [ ] LocalTrackRecordと照合できる
- [ ] matched/candidate/missing/specialを表示できる
- [ ] 候補を手動紐付けできる
- [ ] PlaybackQueueを生成できる

## Memory

- [ ] VenuePresetとLiveMemoryPresetを分離して扱える
- [ ] 立ち位置を保存できる
- [ ] 位置ラベルを保存できる
- [ ] 無言タグを保存できる
- [ ] 公演記憶を選んで再生に反映できる

## PWA / Device

- [ ] PWA manifestがある
- [ ] アプリ本体をキャッシュできる
- [ ] 音源はキャッシュしない
- [ ] Media Sessionは対応環境で効く
- [ ] Wake Lockは対応環境で効く
- [ ] Device Orientationは許可時のみ使う
- [ ] 非対応でも壊れない

## Excluded Features

- [ ] デモモードが存在しない
- [ ] SNS切り抜きモードが存在しない
- [ ] 投稿用動画生成が存在しない
- [ ] 共有機能が存在しない
- [ ] 歌詞表示が存在しない
- [ ] 公式ジャケット/ロゴ取得が存在しない
