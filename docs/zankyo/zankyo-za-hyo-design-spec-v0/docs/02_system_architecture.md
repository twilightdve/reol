# 02. System Architecture

## 全体レイヤー

```txt
App Shell
  ↓
File / Library Layer
  ↓
Player Layer
  ↓
Audio Engine Layer
  ↓
Visual Engine Layer
  ↓
Setlist / Memory Layer
  ↓
Persistence Layer
```

## App Shell

Next.js App Routerを想定。

- `/` Home
- `/library`
- `/setlists`
- `/player`
- `/memory`
- `/settings`

v0では単一画面アプリに近い構成でもよい。  
重要なのは状態の責務を分けること。

## File / Library Layer

責務:

- ファイル/フォルダ選択
- Fileオブジェクトのセッション保持
- LocalTrackRecordへの変換
- IndexedDBへのメタ情報保存
- 対応拡張子フィルタリング

永続化しないもの:

- Fileオブジェクト
- objectURL
- AudioContext
- AudioNode

## Player Layer

責務:

- 再生/停止/シーク
- 再生キュー管理
- 現在曲管理
- HTMLAudioElement管理
- AudioContext開始/停止
- 曲終了時のafterglow tail
- 終演後モード遷移

## Audio Engine Layer

責務:

- Web Audio graph構築
- AnalyserNode解析
- EQ
- PannerNode
- 初期反射
- 疑似リバーブ
- Dynamics/limiter
- 擬似音ハメイベント算出
- 解析キャッシュ生成

初期は簡易実装でよい。

## Visual Engine Layer

責務:

- Canvas初期化
- requestAnimationFrame loop
- AudioFeatures → VisualState変換
- 会場・記憶プリセット反映
- 粒子、残光、亀裂、光核描画
- performance mode反映

## Setlist / Memory Layer

責務:

- TrackMaster読込
- Setlist読込
- セトリ充足チェック
- 手動紐付け
- VenuePreset選択
- LiveMemoryPreset作成/編集
- 無言タグ
- 再生キュー生成

## Persistence Layer

IndexedDBを想定。  
idbライブラリなどの薄いラッパー利用可。

ストア:

- localTracks
- manualTrackMappings
- audioAnalysisCaches
- liveMemoryPresets
- playbackQueues
- appSettings

## データの配置

```txt
static data:
  TrackMaster
  Setlist
  VenuePreset

browser persistent data:
  LocalTrackRecord
  ManualTrackMapping
  AudioAnalysisCache
  LiveMemoryPreset
  PlaybackQueue
  AppSettings

session data:
  File
  objectURL
  HTMLAudioElement
  AudioContext
  AudioNode
```

## 推奨ディレクトリ構成

```txt
app/
  page.tsx
  library/page.tsx
  setlists/page.tsx
  player/page.tsx
  memory/page.tsx
  settings/page.tsx

components/
  AudioFolderPicker.tsx
  LocalLibraryList.tsx
  SetlistReadinessView.tsx
  PlayerControls.tsx
  AfterglowCanvas.tsx
  PositionMap.tsx
  MemoryTagEditor.tsx

features/
  library/
  player/
  audio-engine/
  visual-engine/
  setlist/
  memory/
  storage/

lib/
  normalize.ts
  file-key.ts
  time.ts
  guards.ts

data/
  tracks.json
  venues.json
  setlists/

types/
  zankyo.ts
```

## 依存ライブラリ候補

必須ではないが便利。

- `idb`
- `zustand`
- `music-metadata-browser` または `jsmediatags`
- `zod`

v0ではメタデータ解析を後回しにして、ファイル名中心でもよい。
