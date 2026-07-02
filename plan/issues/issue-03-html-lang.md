# 【P0】`<html lang="ja">` の付与

## 背景

言語属性はスクリーンリーダーの発音判定・検索エンジンの言語判定の基礎情報。

## 現状の問題

実HTMLで `<html>` にlang属性がないことを確認。`gatsby-ssr.tsx` に `onRenderBody` が未実装。

## 期待する挙動

全ページで `<html lang="ja">` が出力される。

## 実装方針

`gatsby-ssr.tsx` に追加:

```tsx
export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHtmlAttributes }) => {
  setHtmlAttributes({ lang: "ja" });
};
```

## 影響範囲

全ページのHTMLルート要素。

## 受け入れ条件

- [ ] 全ページで `<html lang="ja">` が出力される
- [ ] Lighthouse アクセシビリティの該当項目(`<html>` element does not have a `[lang]` attribute)が解消

## 確認方法

`curl -s https://reol.twilightea.com/ | head -c 200`、Lighthouse実行。

## 優先度 / 見積もり難易度

P0 / 低(10分)
