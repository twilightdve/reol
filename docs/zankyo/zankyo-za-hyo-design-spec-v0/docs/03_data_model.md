# 03. Data Model

TypeScript定義本体は `src/zankyo-types.ts` を参照。

## 重要な概念分離

### TrackMaster

「曲」という概念。  
ユーザーのローカルファイルではない。

### LocalTrackRecord

ユーザー端末内に存在するファイルのメタ情報。  
File本体は保持しない。

### ManualTrackMapping

TrackMaster/SetlistEntryとLocalTrackRecordを手動で結びつける。

### VenuePreset

会場そのもの、または会場タイプの音響傾向。

### LiveMemoryPreset

その公演で自分が浴びた記憶。  
同じ会場でも、公演日・立ち位置・体感が違えば別物。

### AudioAnalysisCache

ファイルごとの解析結果。  
解析ロジックが変わったら `analysisVersion` を上げる。

### PlaybackQueue

実際に再生できるキュー。  
セトリ、ローカル音源、afterglow tail、special entryを統合する。

## 保存先

```txt
TrackMaster:
  static JSON / site DB

Setlist:
  static JSON / site DB

VenuePreset:
  static JSON + user custom可能

LocalTrackRecord:
  IndexedDB

ManualTrackMapping:
  IndexedDB

AudioAnalysisCache:
  IndexedDB

LiveMemoryPreset:
  IndexedDB

PlaybackQueue:
  IndexedDB or session

AppSettings:
  IndexedDB
```

## schemaVersion

全ての永続化データに `schemaVersion` を入れる。  
保存済みデータ移行のために必須。

## fileKey

ローカルファイルの疑似ID。

```ts
fileKey = `${relativePath ?? file.name}|${file.size}|${file.lastModified}`
```

注意:

- 完全な一意性を保証しない
- でもフォルダ再選択時の再照合には実用的
- 後で必要ならハッシュ計算を追加する
- ハッシュ計算は大容量FLACで重くなるためv0では避ける

## 正規化キー

曲名照合では、以下を正規化して使う。

- NFKC
- lower case
- 括弧除去
- 空白除去
- 拡張子除去
- 記号除去
- Reol/REOL/れをる等のアーティスト名除去

## LiveMemoryPresetとVenuePresetの関係

```txt
VenuePreset
  = 会場の物理・音響傾向

LiveMemoryPreset
  = その日の記憶
  = VenuePresetを参照し、必要に応じてacousticOverrideで上書き
```

## 再生キュー生成

```txt
Setlist
  + SetlistReadinessReport
  + ManualTrackMapping
  + LocalTrackRecord
  + LiveMemoryPreset
  ↓
PlaybackQueue
```

特殊エントリ:

- cover
- se
- medley
- unreleased

これらは `special` または `gap` としてキューに入れることができる。
