# Dynamic Color Palette Feature

Spotify 風の動的カラーパレット機能を REOL サイトの Discography と Live コンテンツに実装しました。

## 🎨 機能概要

### 主要機能

- **画像からの色抽出**: アルバムアートワークやライブ画像から主要な色を自動的に抽出
- **プリセットカラーパレット**: 楽曲タイトルに基づく事前定義されたカラーパレット
- **動的 UI 更新**: ホバーや展開時のスムーズなカラートランジション
- **レスポンシブデザイン**: モバイルからデスクトップまで最適化されたレイアウト
- **アクセシビリティ対応**: 色覚障害やモーション感度に配慮

### 新しいコンポーネント

#### Discography

- `EnhancedDiscography`: メインのディスコグラフィーコンポーネント
- `EnhancedTimelineItem`: 個別アルバム/シングル用のタイムラインアイテム
- `Enhanced ItemSong`: 楽曲情報表示コンポーネント

#### Live

- `EnhancedLive`: メインのライブコンポーネント
- `EnhancedLiveTimelineItem`: 個別ライブ用のタイムラインアイテム
- `EnhancedLiveItem`: ライブ会場情報表示コンポーネント

#### ユーティリティ

- `colorExtractor.ts`: 色抽出とカラーパレット生成
- `useColorPalette.ts`: カラーパレット管理用フック

## 🛠 技術仕様

### 色抽出アルゴリズム

1. 画像を 50x50px にリサイズして処理速度を向上
2. 4 ピクセルおきにサンプリングして効率化
3. 色を 8 段階に量子化してノイズを削減
4. 出現頻度と彩度に基づいて主要色を選出
5. 補色計算と明度調整でバランスの取れたパレットを生成

### カラーパレットの構成

```typescript
interface ColorPalette {
  primary: string; // メインカラー
  primaryLight: string; // ライトバリエーション
  primaryDark: string; // ダークバリエーション
  secondary: string; // セカンダリカラー（補色）
  background: string; // 背景色
  text: string; // テキストカラー
  textSecondary: string; // セカンダリテキストカラー
  accent: string; // アクセントカラー
}
```

### プリセットカラー

特定の楽曲に対して事前定義されたカラーパレット:

- Ultra High: オレンジ系グラデーション
- シンコペーション: ピンク/紫系
- ニジイロストーリー: ブルー系
- MONSTER: ブラウン/オレンジ系
- ファクト: グレー/シアン系

## 📱 UI/UX 改善点

### Before (Original)

- 単色のシンプルなタイムライン表示
- 静的なカラースキーム
- 基本的なホバーエフェクト

### After (Enhanced)

- 動的カラーパレットによる個性的な表現
- Spotify 風のスムーズなトランジション
- 改良されたカード型レイアウト
- グリッド/タイムライン表示切り替え
- 音楽視覚化エフェクト

### 新しいインタラクション

- **ホバー時**: カードが浮き上がり、動的カラーで背景が変化
- **展開時**: コンテンツエリアにブランドカラーが適用
- **画像読み込み**: 非同期で色抽出し、UI に反映

## 🎯 使用方法

### 基本的な使い方

```tsx
import { EnhancedDiscography } from "./components/index/enhanced-index";

<EnhancedDiscography data={discographyData} />;
```

### カスタムカラーパレット

```tsx
import { useColorPalette } from "./hooks/useColorPalette";

const { colorPalette, applyColors } = useColorPalette({
  title: "楽曲名",
  imageSrc: "/path/to/artwork.jpg",
  autoApply: true,
});
```

## 🔧 カスタマイズ

### 新しいプリセットカラーの追加

`src/utils/colorExtractor.ts`の`contentColorPresets`に新しいエントリを追加:

```typescript
const contentColorPresets: Record<string, ColorPalette> = {
  新楽曲名: {
    primary: "#COLOR1",
    secondary: "#COLOR2",
    // ... その他のカラー
  },
};
```

### CSS 変数のカスタマイズ

`src/styles/dynamic-colors.css`でデフォルトカラーやアニメーションを調整可能。

## 🌐 ブラウザサポート

- **現代ブラウザ**: Chrome, Firefox, Safari, Edge (最新版)
- **機能**: Canvas API, CSS Custom Properties, CSS Grid
- **フォールバック**: プリセットカラーまたはデフォルトカラー

## ♿ アクセシビリティ

- **色覚障害対応**: 十分なコントラスト比の確保
- **モーション感度**: `prefers-reduced-motion`に対応
- **キーボードナビゲーション**: フォーカス可能な要素の適切な管理
- **スクリーンリーダー**: 適切な ARIA ラベルとセマンティック HTML

## 🚀 パフォーマンス最適化

- **画像処理**: 50x50px にリサイズして高速化
- **メモ化**: React.memo, useCallback, useMemo を適切に使用
- **遅延読み込み**: 画像の非同期読み込み
- **CSS 最適化**: GPU 加速を活用したトランジション

## 📂 ファイル構成

```
src/
├── components/index/
│   ├── discography/
│   │   ├── enhanced-discography.tsx
│   │   ├── enhanced-timeline-item.tsx
│   │   └── ...
│   ├── live/
│   │   ├── enhanced-live.tsx
│   │   ├── enhanced-timeline-item.tsx
│   │   ├── enhanced-live-item.tsx
│   │   └── ...
│   └── enhanced-index.ts
├── hooks/
│   └── useColorPalette.ts
├── utils/
│   └── colorExtractor.ts
├── styles/
│   └── dynamic-colors.css
├── pages/
│   └── dynamic-color-demo.tsx
└── types/
    ├── discography.ts (updated)
    └── live.ts (updated)
```

## 🧪 テスト

デモページ (`/dynamic-color-demo`) で以下をテスト可能:

- Enhanced vs Original の比較
- Discography vs Live の表示
- カラーパレットの動的変更
- レスポンシブ動作

## 🔮 今後の拡張案

1. **機械学習による色選択**: より洗練された色抽出アルゴリズム
2. **ユーザーカスタマイズ**: 個人の好みに基づくカラーテーマ
3. **アニメーション強化**: より複雑な視覚エフェクト
4. **ダークモード**: 自動的なダーク/ライトテーマ切り替え
5. **音楽同期**: 音楽再生に合わせたリアルタイムカラー変化

## 📞 サポート

質問や提案がありましたら、開発チームまでお気軽にご連絡ください。
