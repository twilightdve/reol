# 07. Next Phase After Transform

Gatsby変換フローが完成した後にやること。

## Phase 2: /zankyo/ page shell

- `/zankyo/` ページ作成
- 生成済みmanifest/tracks/setlists/venues/venue-layoutsをfetch
- スマホファーストの最小UI
- 音源はまだ扱わなくてよい
- セトリ一覧表示
- 会場/日付表示

## Phase 3: Local audio library

- ファイル/フォルダ選択
- FLAC / MP3 / M4A / AAC / WAV
- LocalTrackRecord生成
- fileKey生成
- IndexedDB保存
- File本体は保存しない

## Phase 4: Setlist readiness check

- setlist entryとlocal tracks照合
- matched / candidate / missing / special
- candidate手動紐付け
- PlaybackQueue生成

## Phase 5: Basic player

- 1曲再生
- HTMLAudioElement
- AudioContext
- AnalyserNode
- 再生/停止/シーク

## Phase 6: Canvas afterglow

- Canvas 2D
- low/mid/high/rms
- 光核/粒子/亀裂/残光
- afterglow tail

## Phase 7: Venue layout and position map

- venue-layouts.json読み込み
- 立ち位置プリセット
- normalizedX/Z保存
- LiveMemoryPresetへの保存

## Phase 8: Audio spatial/acoustic

- EQ
- 疑似リバーブ
- 初期反射
- 3D音像
- limiter

## Phase 9: Memory

- 無言タグ
- 公演記憶保存
- 終演後モード
