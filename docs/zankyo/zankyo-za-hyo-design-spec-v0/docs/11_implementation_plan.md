# 11. Implementation Plan

## Phase 1: ローカルプレイヤー核

### Tasks

- TypeScript型追加
- static JSON読込基盤
- 音源ファイル/フォルダ選択
- 対応拡張子フィルタ
- LocalTrackRecord生成
- IndexedDB保存
- HTMLAudioElement再生
- 再生/停止/シーク
- スマホ縦画面Player
- 最小Canvas描画

### Done

- FLAC/MP3/M4A/WAVのファイルを選べる
- 選択ファイル一覧が表示される
- 1曲再生できる
- 音源がアップロードされない
- Canvasに最低限の残光が描かれる

## Phase 2: 音が光る

### Tasks

- AudioContext
- createMediaElementSource
- AnalyserNode
- low/mid/high/rms算出
- 擬似kick/snare/hat
- VisualState変換
- 粒子/光核/亀裂
- afterglow decay

### Done

- 曲再生に合わせてCanvasが変化する
- 低音で光核が反応
- 高域ピークで粒子または亀裂が出る
- 音が小さくなっても余韻が残る

## Phase 3: セトリ充足チェック

### Tasks

- TrackMaster
- Setlist
- normalizeTrackName
- match scoring
- SetlistReadinessReport
- candidate UI
- ManualTrackMapping
- PlaybackQueue生成

### Done

- セトリに対して音源の有無が分かる
- 候補を手動紐付けできる
- matched曲でセトリ再生キューを作れる

## Phase 4: あの日の場所になる

### Tasks

- VenuePreset
- EQ chain
- PannerNode基礎
- 立ち位置マップ
- 疑似初期反射
- 疑似リバーブ
- limiter
- 会場タイプ別visual bias

### Done

- 会場タイプを変えると音/画が変わる
- 立ち位置を動かすと視覚が偏る
- 音量が危険に跳ねない
- 軽量モードへ切替可能

## Phase 5: 記憶の装置になる

### Tasks

- LiveMemoryPreset
- 無言タグ
- 位置ラベル
- 公演記憶保存
- 曲後の残光時間
- 終演後モード
- 公演ごとの残響アーカイブ

### Done

- 公演記憶を保存/再利用できる
- セトリ終了後に終演後モードへ入る
- 記憶タグで見え方が変わる

## Phase 6: 手のひらの再生室

### Tasks

- PWA manifest
- Service Worker
- static JSON cache
- Media Session
- Wake Lock
- Device Orientation
- battery_saver/high_visual
- エラーフォールバック

### Done

- ホーム画面から起動できる
- オフラインでもアプリ本体が開く
- ロック画面操作が可能な環境では効く
- Wake Lockは対応時のみ効く
- 非対応環境でも壊れない
