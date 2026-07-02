# Dynamic Color Palette Enhancement

REOL ファンサイトに追加された動的カラーパレット機能の詳細説明です。

## 🎨 新機能概要

各アルバムやライブのコンセプトアートから自動的に色情報を抽出し、コンテンツの個性を視覚的に表現する機能を追加しました。YouTube のシネマティックモードや音楽プレイヤーのジャケット連動カラーのような体験を提供します。

## ✨ 主な機能

### 1. 動的カラー抽出

- **画像ベース抽出**: ColorThief ライブラリを使用してアルバムアートから主要色を自動抽出
- **プリセットパレット**: 各アルバム/ライブ用に手動で調整されたカラーパレット
- **リアルタイム適用**: ホバー時やフォーカス時にスムーズなカラートランジション

### 2. 拡張 UI コンポーネント

- **DiscographyEnhanced**: ディスコグラフィー用の拡張コンポーネント
- **LiveEnhanced**: ライブ情報用の拡張コンポーネント
- **TimelineItemEnhanced**: 個別アイテム用の拡張タイムラインアイテム

### 3. インタラクティブ機能

- **モード切り替え**: 通常モードと拡張モードの切り替え可能
- **ホバーエフェクト**: マウスオーバー時のダイナミックなカラー変更
- **スムーズトランジション**: 全ての色変更に滑らかなアニメーション

## 🛠️ 技術実装

### ファイル構成

```
src/
├── utils/
│   └── colorExtractor.ts          # 色抽出・パレット生成ユーティリティ
├── hooks/
│   └── useColorPalette.ts         # カラーパレット管理フック
├── components/
│   └── index/
│       ├── contents-enhanced.tsx  # 拡張コンテンツコンポーネント
│       ├── discography/
│       │   ├── discography-enhanced.tsx
│       │   └── timeline-item-enhanced.tsx
│       └── live/
│           └── live-enhanced.tsx
└── pages/
    ├── index.tsx                  # メインページ（拡張モード対応）
    └── color-test.tsx             # テスト・デモページ
```

### 主要な実装

#### 1. カラー抽出システム (`colorExtractor.ts`)

```typescript
// 画像から色を抽出
export async function extractColorsFromImage(
  imageSrc: string
): Promise<ColorPalette | null>;

// プリセットカラーパレット
export const presetColorPalettes: Record<string, ColorPalette>;

// CSS変数への適用
export function applyColorPalette(palette: ColorPalette, prefix?: string): void;
```

#### 2. React フック (`useColorPalette.ts`)

```typescript
// 単一コンテンツ用
export function useColorPalette(
  props: UseColorPaletteProps
): UseColorPaletteReturn;

// 複数コンテンツ用
export function useMultipleColorPalettes<T>(
  items: T[]
): Record<string | number, ColorPalette>;

// 一時的適用用
export function useTemporaryColorPalette(prefix?: string);
```

#### 3. 拡張コンポーネント

各コンポーネントは以下の機能を持ちます：

- 動的カラーパレットの適用
- ホバー時のインタラクティブなカラー変更
- スムーズなトランジション効果
- 既存コンポーネントとの互換性

## 🎯 使用方法

### 基本的な使い方

1. **拡張モードの有効化**

   ```
   https://your-site.com/?enhanced=true
   ```

   または、ページ左上の「🎨 カラフルモードを試す」ボタンをクリック

2. **個別コンポーネントでの利用**

   ```tsx
   import { useColorPalette } from "../hooks/useColorPalette";

   const MyComponent = ({ title, imageSrc }) => {
     const { colorPalette, isLoading } = useColorPalette({
       title,
       imageSrc,
       autoApply: true,
     });

     return (
       <div style={{ backgroundColor: colorPalette.background }}>
         <h1 style={{ color: colorPalette.primary }}>{title}</h1>
       </div>
     );
   };
   ```

3. **CSS 変数での利用**
   ```css
   .dynamic-element {
     background: var(--color-primary);
     color: var(--color-text);
     transition: all 0.3s ease-in-out;
   }
   ```

### プリセットカラーパレット

以下のアルバム/ライブには専用のカラーパレットが設定されています：

- **No title**: ダークでミニマルなモノクローム
- **極彩色**: 鮮やかな赤とオレンジのグラデーション
- **Σ**: 紫とブルーの神秘的なパレット
- **事実上**: 緑をベースとした自然な配色
- **虚構集**: グレーとピンクのコントラスト
- **BLACK BOX**: 黒をベースとしたシックな配色
- **第六感**: 紫系の幻想的なパレット

### ライブ専用カラー

- **UNBOX**: オレンジと黒の力強いコントラスト
- **激情アラート**: 赤をベースとした情熱的な配色
- **Neo Nostalgia**: 紫と青の幻想的なグラデーション

## 🧪 テスト・デバッグ

### テストページの利用

`/color-test/` ページでカラー抽出機能をテストできます：

1. プリセットカラーのテスト
2. 画像からのリアルタイム色抽出
3. カラーパレットの視覚的確認
4. CSS 適用のテスト

### デバッグ情報

ブラウザの開発者ツールで以下をチェック：

```javascript
// CSS変数の確認
getComputedStyle(document.documentElement).getPropertyValue("--color-primary");

// カラーパレット適用状況
console.log(document.documentElement.style.cssText);
```

## 📱 レスポンシブ対応

- **モバイル**: タッチインタラクションに最適化
- **タブレット**: 中間サイズでの適切な表示
- **デスクトップ**: ホバーエフェクトの完全活用

## 🔧 カスタマイズ

### 新しいプリセットの追加

```typescript
// colorExtractor.ts に追加
export const presetColorPalettes: Record<string, ColorPalette> = {
  "New Album": {
    primary: "#YOUR_COLOR",
    secondary: "#YOUR_COLOR",
    accent: "#YOUR_COLOR",
    background: "#YOUR_COLOR",
    text: "#YOUR_COLOR",
    gradients: {
      primary: "linear-gradient(135deg, #COLOR1, #COLOR2)",
      background: "linear-gradient(135deg, #COLOR1, #COLOR2)",
    },
  },
  // ... 既存のパレット
};
```

### カスタムトランジション

```scss
// global.scss で調整
:root {
  --transition-duration: 0.3s;
  --transition-easing: ease-in-out;
}

.dynamic-transition {
  transition: all var(--transition-duration) var(--transition-easing);
}
```

## 🚀 パフォーマンス最適化

- **遅延読み込み**: 画像ベースの色抽出は必要時のみ実行
- **メモ化**: 一度抽出した色情報はキャッシュ
- **CSS 変数**: JavaScript 再計算を最小限に抑制
- **トランジション最適化**: transform/opacity を活用

## 🐛 已知の制限事項

1. **CORS 制限**: 外部画像からの色抽出には制限があります
2. **ブラウザ互換性**: CSS 変数をサポートしないブラウザでは一部機能が制限されます
3. **パフォーマンス**: 大量の画像処理時は読み込み時間が増加する可能性があります

## 🔄 今後の改善予定

- [ ] 機械学習ベースのより高精度な色抽出
- [ ] ユーザーカスタムパレットの保存機能
- [ ] アニメーション効果の追加オプション
- [ ] アクセシビリティの更なる向上
- [ ] パフォーマンス最適化の継続

---

この機能により、REOL の各楽曲やライブの世界観をより豊かに表現し、ユーザーの視覚的体験を大幅に向上させることができます。
