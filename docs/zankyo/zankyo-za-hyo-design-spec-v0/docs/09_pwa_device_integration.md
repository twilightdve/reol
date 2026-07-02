# 09. PWA and Device Integration

## PWA

目的:

- ホーム画面から起動
- アプリ本体をキャッシュ
- 静的セトリ/曲マスタ/会場プリセットをキャッシュ
- 遠征先や通信不安定でも使える

注意:

- 音源ファイルはキャッシュしない
- Fileオブジェクトは保存しない
- ユーザーは必要に応じてフォルダを再選択する

## Service Worker

キャッシュ対象:

- app shell
- JS/CSS
- static JSON
- icons
- manifest

非対象:

- audio files
- object URLs
- user selected files

## Media Session

目的:

- ロック画面/イヤホン操作の再生・停止・次/前
- Now Playing情報

注意:

- 公式ジャケット画像は使わない
- artworkなし、または抽象ローカル生成画像のみ
- Media Sessionが使えない環境では無視

## Wake Lock

目的:

- 鑑賞モード中に画面が暗くなるのを防ぐ

方針:

- ユーザー設定でON/OFF
- 再生中かつPlayer表示中のみ要求
- 停止時/画面非表示時はrelease
- 失敗してもアプリは継続

## Device Orientation

目的:

- スマホの傾きで頭の向き・残光の流れを微調整

方針:

- デフォルトOFF
- 対応端末のみ
- 許可が必要なら明示操作
- 省電力モードではOFF

## Autoplay

ブラウザはユーザー操作なしの音声再生をブロックすることがある。  
初回操作で AudioContext.resume() と audio.play() を行う。

## オフライン

初回アクセス後:

- アプリ本体はオフライン起動可能
- static JSONはキャッシュ済みなら利用可能
- 音源はユーザーが端末から選ぶ
- 解析キャッシュ・記憶はIndexedDBから利用可能
