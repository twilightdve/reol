# カラーパレット データベース設計提案

## 概要
各コンテンツ（Discography、Song、Live、LiveItem）に個別のカラーパレットを保存し、UI表示に反映させるためのデータベース設計。

## 設計方針

### 1. 専用テーブル方式（推奨）
各エンティティのカラー情報を専用テーブルで管理する方法。

#### メリット
- 既存テーブル構造を変更せずに追加可能
- カラー情報の有無が柔軟（NULL許容）
- カラー情報のみの更新が容易
- 将来的に複数のカラーバリエーションを持つ場合にも対応しやすい

#### デメリット
- JOINが必要（ただしパフォーマンスへの影響は軽微）

---

## データベーススキーマ

### テーブル: `discography_colors`
```sql
CREATE TABLE discography_colors (
  discography_id INT PRIMARY KEY,
  primary_color VARCHAR(50) NOT NULL,          -- 例: "rgb(255, 100, 50)"
  primary_light VARCHAR(50) NOT NULL,          -- 明るいプライマリ
  primary_dark VARCHAR(50) NOT NULL,           -- 暗いプライマリ
  secondary_color VARCHAR(50) NOT NULL,        -- セカンダリカラー
  accent_color VARCHAR(50) NOT NULL,           -- アクセントカラー
  background_color VARCHAR(50) DEFAULT NULL,   -- 背景色（オプション）
  text_color VARCHAR(50) DEFAULT NULL,         -- テキスト色（オプション）
  text_secondary_color VARCHAR(50) DEFAULT NULL, -- セカンダリテキスト色
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (discography_id) REFERENCES discography(discography_id) ON DELETE CASCADE
);
```

### テーブル: `song_colors`
```sql
CREATE TABLE song_colors (
  song_id INT PRIMARY KEY,
  primary_color VARCHAR(50) NOT NULL,
  primary_light VARCHAR(50) NOT NULL,
  primary_dark VARCHAR(50) NOT NULL,
  secondary_color VARCHAR(50) NOT NULL,
  accent_color VARCHAR(50) NOT NULL,
  background_color VARCHAR(50) DEFAULT NULL,
  text_color VARCHAR(50) DEFAULT NULL,
  text_secondary_color VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (song_id) REFERENCES song(song_id) ON DELETE CASCADE
);
```

### テーブル: `live_colors`
```sql
CREATE TABLE live_colors (
  live_id INT PRIMARY KEY,
  primary_color VARCHAR(50) NOT NULL,
  primary_light VARCHAR(50) NOT NULL,
  primary_dark VARCHAR(50) NOT NULL,
  secondary_color VARCHAR(50) NOT NULL,
  accent_color VARCHAR(50) NOT NULL,
  background_color VARCHAR(50) DEFAULT NULL,
  text_color VARCHAR(50) DEFAULT NULL,
  text_secondary_color VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (live_id) REFERENCES live(live_id) ON DELETE CASCADE
);
```

### テーブル: `live_item_colors`
```sql
CREATE TABLE live_item_colors (
  live_id INT NOT NULL,
  live_item_no INT NOT NULL,
  primary_color VARCHAR(50) NOT NULL,
  primary_light VARCHAR(50) NOT NULL,
  primary_dark VARCHAR(50) NOT NULL,
  secondary_color VARCHAR(50) NOT NULL,
  accent_color VARCHAR(50) NOT NULL,
  background_color VARCHAR(50) DEFAULT NULL,
  text_color VARCHAR(50) DEFAULT NULL,
  text_secondary_color VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (live_id, live_item_no),
  FOREIGN KEY (live_id, live_item_no) REFERENCES live_item(live_id, live_item_no) ON DELETE CASCADE
);
```

---

## TypeScript型定義の拡張

### `src/types/colorPalette.ts` (新規作成)
```typescript
/**
 * データベースから取得するカラーパレット情報
 */
export type ColorPaletteData = {
  primaryColor: string;
  primaryLight: string;
  primaryDark: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor?: string | null;
  textColor?: string | null;
  textSecondaryColor?: string | null;
};

/**
 * UIで使用するカラーパレット（既存のColorPaletteと互換性を持つ）
 */
export type ColorPalette = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textSecondary: string;
};

/**
 * データベース形式からUI形式への変換
 */
export function toColorPalette(data: ColorPaletteData): ColorPalette {
  return {
    primary: data.primaryColor,
    primaryLight: data.primaryLight,
    primaryDark: data.primaryDark,
    secondary: data.secondaryColor,
    accent: data.accentColor,
    background: data.backgroundColor || "#FAFAFA",
    text: data.textColor || "#1F2937",
    textSecondary: data.textSecondaryColor || "#6B7280",
  };
}

/**
 * UI形式からデータベース形式への変換
 */
export function fromColorPalette(palette: ColorPalette): ColorPaletteData {
  return {
    primaryColor: palette.primary,
    primaryLight: palette.primaryLight,
    primaryDark: palette.primaryDark,
    secondaryColor: palette.secondary,
    accentColor: palette.accent,
    backgroundColor: palette.background,
    textColor: palette.text,
    textSecondaryColor: palette.textSecondary,
  };
}
```

### `src/types/discography.ts` への追加
```typescript
import { ColorPaletteData } from "./colorPalette";

export type Discography = {
  discographyId: number;
  title: string;
  releaseDate?: string;
  name?: string;
  format?: string;
  siteUrl?: string;
  xfdUrl?: string | null;
  artworkUrl?: string | null;
  // カラーパレット情報（オプション）
  colorPalette?: ColorPaletteData | null;
};

export type Song = {
  songId: number;
  discographyId: number;
  discographyTitle: string;
  songNo: number;
  songName: string;
  tieupDescription: string;
  downloadUrl?: string | null;
  musicVideoUrl?: string | null;
  lyricVideoUrl?: string | null;
  liveVideoUrl?: string | null;
  lyricUrl?: string | null;
  spotifyTrackId?: string | null;
  lyricMember?: string | null;
  musicMember?: string | null;
  produceMember?: string | null;
  etcMember?: string | null;
  feature?: SongFeature | null;
  // カラーパレット情報（オプション）
  colorPalette?: ColorPaletteData | null;
};
```

### `src/types/live.ts` への追加
```typescript
import { ColorPaletteData } from "./colorPalette";

export type Live = {
  liveId: number;
  type: string;
  title: string;
  name: string;
  date: string;
  siteUrl: string | null;
  spotifyPlaylistId: string | null;
  imageUrl?: string | null;
  // カラーパレット情報（オプション）
  colorPalette?: ColorPaletteData | null;
};

export type LiveItem = {
  liveId: number;
  liveItemNo: number;
  liveItemName: string | null;
  date: string;
  place: string | null;
  placeSite: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  spotifyPlaylistId: string | null;
  // カラーパレット情報（オプション）
  colorPalette?: ColorPaletteData | null;
};
```

---

## GraphQLクエリの拡張例

### Discography クエリ
```graphql
query {
  discography {
    discographyWithSongs {
      discographyId
      title
      # ... 他のフィールド
      colorPalette {
        primaryColor
        primaryLight
        primaryDark
        secondaryColor
        accentColor
        backgroundColor
        textColor
        textSecondaryColor
      }
      songs {
        songId
        songName
        # ... 他のフィールド
        colorPalette {
          primaryColor
          primaryLight
          primaryDark
          secondaryColor
          accentColor
        }
      }
    }
  }
}
```

---

## 実装例：コンポーネントでの使用

### `enhanced-timeline-item.tsx`
```typescript
import { toColorPalette } from "../../../types/colorPalette";

const SongCard: React.FC<SongCardProps> = ({ song, ... }) => {
  // データベースにカラーパレットがあればそれを使用、なければ自動生成
  const { colorPalette } = useColorPalette({
    title: song.songName,
    autoApply: false,
    prefix: `song-${song.songId}`,
    // データベースから取得したカラーパレットを渡す
    initialPalette: song.colorPalette 
      ? toColorPalette(song.colorPalette) 
      : undefined,
  });

  // ... 以降は同じ
};
```

### `useColorPalette` フックの拡張
```typescript
export interface UseColorPaletteProps {
  title?: string;
  imageSrc?: string;
  autoApply?: boolean;
  prefix?: string;
  // データベースから取得したカラーパレット（優先使用）
  initialPalette?: ColorPalette;
}

export function useColorPalette({
  title,
  imageSrc,
  autoApply = false,
  prefix = "",
  initialPalette,
}: UseColorPaletteProps): UseColorPaletteReturn {
  // initialPaletteがあればそれを使用、なければタイトルから生成
  const computedInitialPalette = React.useMemo(() => {
    if (initialPalette) {
      return initialPalette;
    }
    if (title) {
      return getColorPaletteForContent(title);
    }
    return defaultColorPalette;
  }, [title, initialPalette]);

  // ... 残りの実装
}
```

---

## データ投入の流れ

### 1. 初期データ生成スクリプト
既存の全コンテンツに対して自動でカラーパレットを生成してDBに保存するスクリプトを作成：

```typescript
// scripts/generateColorPalettes.ts
import { getColorPaletteForContent } from "../src/utils/colorExtractor";

async function generateAndSaveColorPalettes() {
  // 全Discographyを取得
  const discographies = await db.query("SELECT * FROM discography");
  
  for (const disco of discographies) {
    const palette = getColorPaletteForContent(disco.title);
    await db.query(`
      INSERT INTO discography_colors 
      (discography_id, primary_color, primary_light, primary_dark, 
       secondary_color, accent_color)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      disco.discography_id,
      palette.primary,
      palette.primaryLight,
      palette.primaryDark,
      palette.secondary,
      palette.accent,
    ]);
  }
  
  // Song、Live、LiveItemも同様に処理
}
```

### 2. 管理画面での編集機能
- カラーピッカーUIで各色を手動調整
- プレビュー機能で実際の見た目を確認
- 「自動生成」ボタンでタイトルから再生成

---

## 移行戦略

### フェーズ1: DBテーブル追加
- 4つのカラーテーブルを作成
- 既存データには影響なし

### フェーズ2: 型定義拡張
- TypeScript型に`colorPalette`フィールドを追加（オプション）
- 変換関数を実装

### フェーズ3: 自動生成スクリプト実行
- 既存全データのカラーパレットを生成・保存

### フェーズ4: GraphQLスキーマ更新
- カラーパレットフィールドをクエリに追加

### フェーズ5: フロントエンド更新
- `useColorPalette`に`initialPalette`対応追加
- コンポーネントでDBデータを優先使用

### フェーズ6: 管理画面追加（オプション）
- カラー編集UI実装

---

## カラーフォーマット推奨

### RGB形式（推奨）
```
"rgb(255, 100, 50)"
```
- 透明度指定が容易（rgba変換）
- 現在のコードと互換性が高い

### HEX形式（代替案）
```
"#FF6432"
```
- データサイズが小さい
- 変換関数が必要

### HSL形式（高度）
```
"hsl(200, 80%, 60%)"
```
- 色相・彩度・明度の調整が直感的
- 変換関数が必要

---

## まとめ

**推奨アプローチ:**
1. 専用カラーテーブルを4つ作成
2. RGB形式で色を保存
3. オプショナルフィールドとして型定義に追加
4. 既存データへの影響なし
5. 段階的な移行が可能

**データの持ち方:**
- `primary_color`: メインカラー（必須）
- `primary_light`: 明るいバリエーション（必須）
- `primary_dark`: 暗いバリエーション（必須）
- `secondary_color`: セカンダリカラー（必須）
- `accent_color`: アクセントカラー（必須）
- `background_color`: 背景色（オプション）
- `text_color`: テキスト色（オプション）
- `text_secondary_color`: セカンダリテキスト色（オプション）

このアプローチにより、柔軟で保守性の高いカラー管理システムを構築できます。
