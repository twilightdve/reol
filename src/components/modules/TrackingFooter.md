# TrackingFooter Component

## 概要

`TrackingFooter`は、アプリケーションの下部に固定表示されるナビゲーションフッターコンポーネントです。各セクション間のナビゲーションを提供し、現在のルートを視覚的に表示します。

## 特徴

### アクセシビリティ

- **WCAG 2.1 準拠**: フルキーボードナビゲーション対応
- **ARIA 属性**: スクリーンリーダー対応
- **フォーカス管理**: 適切なタブインデックス設定
- **キーボードショートカット**: 矢印キーによるナビゲーション

### パフォーマンス

- **React.memo**: 不要な再レンダリングを防止
- **useMemo**: アイコンマッピングのメモ化
- **useCallback**: イベントハンドラーの最適化

### レスポンシブデザイン

- **モバイルファースト**: タッチデバイス対応
- **アダプティブレイアウト**: 画面サイズに応じた調整

## API

### Props

このコンポーネントは外部プロパティを受け取りません。Redux store から状態を取得します。

### Redux State

```typescript
interface RouteState {
  route: {
    currentRoute: string;
  };
}
```

## 使用方法

```tsx
import TrackingFooter from "./components/modules/TrackingFooter";

function App() {
  return (
    <div>
      {/* アプリケーションのコンテンツ */}
      <TrackingFooter />
    </div>
  );
}
```

## キーボードナビゲーション

| キー                | 動作                 |
| ------------------- | -------------------- |
| `Tab` / `Shift+Tab` | フォーカス移動       |
| `Enter` / `Space`   | 選択したルートに移動 |
| `←` / `→`           | 前/次のルートに移動  |

## 技術仕様

- **React**: 関数コンポーネント + Hooks
- **Redux**: 状態管理
- **TypeScript**: 型安全性
- **Tailwind CSS**: スタイリング
- **React Icons**: アイコン表示

## カスタマイズ

### アイコンの変更

`iconMap`オブジェクトを編集してアイコンを変更できます：

```tsx
const iconMap = useMemo(() => {
  const iconProps = {
    className: "text-sm mb-1",
    "aria-hidden": "true" as const,
  };
  return {
    [ROUTE_NAMES[0]]: <CustomIcon {...iconProps} />,
    // ...
  };
}, []);
```

### スタイルの調整

Tailwind CSS クラスを編集してスタイルをカスタマイズできます。

## パフォーマンス考慮事項

1. **メモ化**: アイコンマッピングとイベントハンドラーはメモ化済み
2. **バンドルサイズ**: tree-shaking に対応したアイコンインポート
3. **レンダリング**: React.memo による最適化

## アクセシビリティチェックリスト

- ✅ キーボードナビゲーション
- ✅ スクリーンリーダー対応
- ✅ 適切なコントラスト比
- ✅ フォーカス表示
- ✅ ARIA 属性の適切な使用

## トラブルシューティング

### ナビゲーションが動作しない

1. Redux store が正しく設定されているか確認
2. `ROUTE_NAMES`が正しく定義されているか確認
3. ブラウザの開発者ツールでエラーを確認

### アクセシビリティの問題

1. axe-core や WAVE ツールでテスト
2. キーボードのみでナビゲーションをテスト
3. スクリーンリーダーでテスト
