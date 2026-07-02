# 【P2】bbq2025クイズページ群のHead/SEO欠落

## 背景

過去イベント用クイズページがHead exportなしで公開されている。

## 現状の問題

`src/pages/quiz/bbq2025/` 配下の4ファイル(`bbq2025.jsx`, `intro.jsx`, `result.jsx`, `result-waiting.jsx`)にHead/SEOがない(grep確認済み)。タイトル・description・OGPが皆無。

## 期待する挙動

- 各ページに適切なtitle/description/OGPが付く
- 過去イベントであれば noindex またはアーカイブ表記を付ける

## 実装方針

1. 各ファイルに `export const Head` を追加し `<SEO>` を使用
2. イベント終了済みなら `<meta name="robots" content="noindex">` を追加(SEO.tsxに `noindex?: boolean` prop追加)
3. ページ上部に「このイベントは終了しました」のアーカイブ表記を検討

## 影響範囲

`src/pages/quiz/bbq2025/*.jsx`、必要なら `SEO.tsx`。

## 受け入れ条件

- [ ] 4ページ全てにtitle/descriptionが出力される
- [ ] noindex方針が決定・反映されている

## 確認方法

ビルド後HTMLのhead確認。

## 優先度 / 見積もり難易度

P2 / 低(1〜2時間)
