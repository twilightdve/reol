# 04. Storage and File Handling

## 対応音源

初期対応:

- FLAC
- MP3
- M4A/AAC
- WAV

後回し:

- OGG
- OPUS
- ALAC
- AIFF

## ファイル選択

### 複数ファイル

```tsx
<input
  type="file"
  accept=".flac,.mp3,.m4a,.aac,.wav,audio/flac,audio/mpeg,audio/mp4,audio/aac,audio/wav"
  multiple
/>
```

### フォルダ選択

```tsx
<input
  type="file"
  accept=".flac,.mp3,.m4a,.aac,.wav,audio/flac,audio/mpeg,audio/mp4,audio/aac,audio/wav"
  multiple
  // @ts-expect-error non-standard
  webkitdirectory=""
/>
```

`webkitdirectory` は標準的な名前ではないため、使える場合だけ使う。  
未対応環境では複数ファイル選択へフォールバックする。

## セッションと永続化の分離

永続化する:

- fileKey
- fileName
- relativePath
- extension
- size
- lastModified
- metadata
- normalized keys

永続化しない:

- File
- objectURL
- AudioContext
- AudioNode
- HTMLAudioElement

## fileKey

```ts
function makeLocalFileKey(file: File, relativePath?: string): string {
  return [
    relativePath ?? file.name,
    file.size,
    file.lastModified,
  ].join("|");
}
```

## objectURL管理

- 再生対象ファイルだけ `URL.createObjectURL(file)` を作る
- 曲を外す/ページを離れる/キューを破棄する時に `URL.revokeObjectURL(url)`
- 全曲分のobjectURLを最初から作らない

## FLAC運用時の注意

- 大容量なので全曲decodeしない
- 再生中または解析対象の1曲だけ扱う
- 事前解析はバックグラウンド的に少しずつ行う
- 省電力モードでは事前解析を抑える

## IndexedDBストア

```txt
localTracks
manualTrackMappings
audioAnalysisCaches
liveMemoryPresets
playbackQueues
appSettings
```

## 推奨キー

```txt
localTracks:
  fileKey

manualTrackMappings:
  mappingId

audioAnalysisCaches:
  `${fileKey}|analysisVersion`

liveMemoryPresets:
  liveMemoryId

playbackQueues:
  queueId

appSettings:
  "default"
```

## 再選択時の復元

ユーザーが次回フォルダを選ぶ。  
同じ fileKey が見つかれば、保存済みの手動紐付けや解析キャッシュを再利用する。

```txt
folder selected
  ↓
scan files
  ↓
make fileKey
  ↓
match localTracks
  ↓
restore manual mappings
  ↓
restore analysis caches
```

## プライバシー

- ファイル名、パス、メタデータは端末内だけに保存する
- 外部送信しない
- analyticsはデフォルトなし
- privacy.analyticsEnabled は常に false
