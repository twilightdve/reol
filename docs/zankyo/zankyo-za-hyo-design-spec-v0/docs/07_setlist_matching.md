# 07. Setlist Matching

## 目的

サイトDB/スプレッドシート由来のセトリに対し、ユーザーが選択したローカル音源が足りているかを判定する。

## 入力

- TrackMaster[]
- Setlist
- LocalTrackRecord[]
- ManualTrackMapping[]

## 出力

- SetlistReadinessReport
- PlaybackQueue

## 判定ステータス

```txt
matched:
  自動または手動で確定

candidate:
  候補あり。ユーザー確認が必要

missing:
  必須曲が見つからない

manual_required:
  候補が複数または特殊で手動指定が必要

special:
  cover / se / medley / unreleased など
```

## 照合優先順位

```txt
1. 手動紐付け
2. trackIdベースの既存マッピング
3. metadata.title 完全一致
4. metadata.title alias一致
5. fileName 完全一致
6. fileName alias一致
7. relativePath / album補助
8. duration ± 許容秒数
9. candidate提示
```

## 正規化

```ts
function normalizeTrackName(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\.(flac|mp3|m4a|aac|wav)$/i, "")
    .replace(/[【】「」『』\[\]\(\)（）]/g, " ")
    .replace(/\b(reol|れをる|レヲル)\b/gi, " ")
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}
```

## スコアリング例

```txt
manual:
  1.0

metadata exact + duration:
  0.95-0.99

metadata alias:
  0.85-0.94

filename exact:
  0.82-0.92

filename alias:
  0.72-0.88

duration only:
  0.25-0.4
```

## policyごとの扱い

### required

ない場合はmissing。

### optional

なくても再生可能。

### substitutable

通常音源や別バージョンで代替可。candidateになりやすい。

### cover

special。ローカル音源がなくてもよい。

### medley

specialまたはmanual_required。  
複数曲をつなげるか、gapで代替する。

### se

special。音源なしならgap/afterglow扱い。

### unreleased

special。音源なしを前提にする。

## 手動紐付け

候補からユーザーが選択すると ManualTrackMapping を保存する。

保存後は次回以降manual優先。

## 画面表示

```txt
✅ 4 / 6 playable
⚠️ 1 candidate
◌ 2 special
❌ 0 missing
```

各行:

```txt
01 ✅ 第六感 → Reol/AlbumA/第六感.flac
02 ✅ 404 not found → Reol/AlbumB/404 not found.flac
03 ⚠️ syrup → 候補あり
04 ✅ エンド → Reol/AlbumC/END.m4a
05 ◌ 津軽海峡冬景色 → cover special
06 ◌ Opening SE → se special
```

## PlaybackQueue生成

matched:

- track item
- afterglow item

candidate:

- 手動確定後にtrack item
- 未確定ならqueue生成時に除外またはmanual_required

special:

- special item
- gap item
- afterglow item

missing:

- queue生成不可、または警告付きでスキップ
