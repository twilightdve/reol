# Venues データ構造の改善

## 変更内容

大きな単一ファイル（venues.ts）を管理しやすい構造に分割しました。

## 新しいディレクトリ構造

```
src/data/
├── venues.ts (後方互換性のためのリダイレクト)
└── venues/
    ├── index.ts          # メインエクスポート（VENUES_2026配列）
    ├── types.ts          # 型定義（Venue, VenueLocation, etc.）
    └── data/             # 各会場の個別ファイル
        ├── tochigi_heavens_rock.ts
        ├── tokushima_grindhouse.ts
        ├── yamaguchi_rising_hall.ts
        ├── hyogo_harbor_studio.ts
        ├── mie_maxa.ts
        ├── aomori_quarter.ts
        ├── nagasaki_drum_be7.ts
        ├── kumamoto_b9.ts
        ├── okinawa_sakurazaka.ts
        ├── asahikawa_casino_drive.ts
        ├── sapporo_penny_lane.ts
        ├── yokohama_bayhall.ts
        ├── nagano_junk_box.ts
        ├── niigata_lots.ts
        ├── kyoto_fanj.ts
        ├── gifu_club_g.ts
        ├── sendai_talknet_hall.ts
        ├── osaka_orix_theater.ts
        ├── fukuoka_convention_center.ts
        ├── nagoya_kokaido.ts
        └── tokyo_line_cube.ts
```

## メリット

1. **編集しやすい**: 各会場を個別に編集可能（300行程度/ファイル）
2. **エラー分離**: 1つの会場のエラーが他に影響しない
3. **Git管理が容易**: 変更差分が明確
4. **並行作業可能**: 複数人で異なる会場を同時編集可能
5. **後方互換性**: 既存のインポート文（`from './data/venues'`）はそのまま動作

## 使用方法

### インポート方法（既存コードはそのまま動作）
```typescript
// 従来通り
import { VENUES_2026 } from '@/data/venues'

// または新しい構造から直接
import { VENUES_2026 } from '@/data/venues/index'
import tochigi_heavens_rock from '@/data/venues/data/tochigi_heavens_rock'
```

### 個別会場の編集
各会場ファイルを直接編集：
```bash
code src/data/venues/data/tochigi_heavens_rock.ts
```

### 型定義の参照
```typescript
import { Venue, VenueImage, LongDistanceAccess } from '@/data/venues/types'
```

## 次のステップ

1. **構文エラー修正**: 各会場ファイルの構文エラーを個別に修正
2. **重複データ削除**: 各ファイル内の重複プロパティを削除
3. **画像データ追加**: VenueImageフィールドにfind47.jpやUnsplashの画像を追加
4. **施設情報統合**: CSV・JSONからの施設データを各ファイルに統合

## バックアップ

- 元のファイル: `src/data/venues.ts.old`
- バックアップ: `src/data/venues.ts.backup`
