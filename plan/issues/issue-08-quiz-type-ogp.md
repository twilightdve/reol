# 【P1】ファンタイプ診断タイプ別OG画像

## 背景

診断の共有カード画像生成・X intent・navigator.share は実装済み(`src/pages/quiz/reol-type/result.tsx`, `src/templates/reol-type-detail.tsx` で確認)。拡散装置として最後のピースだけが欠けている。

## 現状の問題

og:imageが全サイト共通の `ogimage.png` のため、共有URLを踏んだ人のタイムラインカードにタイプが反映されない(タイプ別ページのog:image上書き有無は未確認・推測)。

## 期待する挙動

タイプ別ページ(例: `/quiz/reol-type/types/<code>`)ごとに専用og:imageが出力され、Xカードにタイプ名・ビジュアルが表示される。

## 実装方針

1. 16タイプ分のOG画像(1200x630)をビルド時生成(既存の共有カード生成ロジックを流用)or 静的アセット化
2. `reol-type-detail.tsx` の Head で `<SEO image={...}>` を渡す
3. 共有ボタンの誘導先URLをタイプ別ページに統一し、UTM(`?utm_source=share_x`)を付与

## 影響範囲

`src/templates/reol-type-detail.tsx`、OG画像アセット、共有ボタン。

## 受け入れ条件

- [ ] Xカードバリデータで16タイプ全てにタイプ別画像が表示される
- [ ] 共有URLにUTMが付く

## 確認方法

Xカードバリデータ(またはOGPデバッガ)で16 URL確認。GA4で `utm_source=share_x` セッション計測。

## 優先度 / 見積もり難易度

P1 / 低〜中(1〜2日)
