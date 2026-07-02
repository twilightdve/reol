# 7. 実装ロードマップ

## 1日でできる改善

| タスク | 対応Issue |
|---|---|
| gatsby-config description書き換え(P0-2) | [Issue 2](./issues/issue-02-top-meta-description.md) |
| SEO.tsx デフォルトdescription修正(P0-1) | [Issue 1](./issues/issue-01-seo-default-description.md) |
| `setHtmlAttributes({lang:"ja"})` 追加(P0-4前半) | [Issue 3](./issues/issue-03-html-lang.md) |
| フッターにOFFICIAL LINKS+非公式表記(P0-5簡易版) | [Issue 5](./issues/issue-05-official-links-footer.md) |
| タイトル表記統一(P1-2) | [Issue 6](./issues/issue-06-title-unification.md) |

- **リスク**: ほぼゼロ
- **期待効果**: 検索・共有の第一印象が即改善

## 1週間でできる改善

| タスク | 対応Issue |
|---|---|
| トップのタグライン+入口3カード(P1-1) | [Issue 7](./issues/issue-07-top-entry-cards.md) |
| JSON-LD(WebSite/MusicEvent/BreadcrumbList) | [Issue 10](./issues/issue-10-json-ld.md) |
| 診断タイプ別OG画像(P1-5) | [Issue 8](./issues/issue-08-quiz-type-ogp.md) |
| ローディングのスケルトン化+エラーUI(P0-3前半) | [Issue 13](./issues/issue-13-loading-error-states.md) |
| bbq2025のHead追加(P2-4) | [Issue 12](./issues/issue-12-bbq2025-head.md) |
| 「はじめてのReol」ページv1 | [Issue 11](./issues/issue-11-welcome-page.md) |

- **リスク**: トップ改修のデザイン調整コスト
- **期待効果**: 新規流入の受け皿と拡散装置が揃う

## 1か月でできる改善

| タスク | 備考 |
|---|---|
| 楽曲統計のビルド時静的化(P0-3本丸) | [Issue 4](./issues/issue-04-stats-ssr.md) |
| 曲詳細ページ(P1-4) | stats・検索・セトリのハブ |
| ライブ初参加ガイド | checklist資産転用 |
| 検索の空状態・サジェスト(P2-3) | [Issue 9](./issues/issue-09-search-empty-state.md) |
| モバイルナビ再設計(P2-1) | 下部タブバー検討 |

- **リスク**: ビルドパイプライン変更はリグレッションテスト必須
- **期待効果**: 看板コンテンツの検索流入と回遊の本格化

## 3か月で育てる改善

| タスク | 備考 |
|---|---|
| ツアーナビ常設化+美辞学アーカイブ(P1-3) | 次ツアー発表時に即転用できる構造へ |
| 英語対応段階導入(P3-1) | hreflang+主要ページ英語要約から |
| ライブ後モード(P3-2) | 公演翌日〜1週間の自動表示 |
| 今日の1曲・余韻アーカイブ | 再訪動機の創出 |
| 聖地モデルコース | PLACE の編集強化 |

- **リスク**: 運用負荷が上がるので自動化(ビルド時生成)前提で設計
- **期待効果**: 再訪率・海外流入・ライブサイクル需要の獲得
