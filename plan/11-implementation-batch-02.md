# 11. 実装計画書: 第2バッチ(Issue 4 / 10 / 8 / 12)

作成日: 2026-07-02
ステータス: **保留** — 着手前にリポジトリの未コミット差分の精査・整理を最優先で実施(ユーザー指示)。整理完了後、featureブランチを切って本バッチを開始する。
体制: 設計/検証: Fable 5、実装: Sonnet 5 サブエージェント×3(並列)

## スコープ

| # | Issue | 優先度 | 担当 |
|---|---|---|---|
| A | [Issue 4: 楽曲統計のビルド時静的化(SSG)+状態UI](./issues/issue-04-stats-ssr.md) | P0 | Sonnet 5 |
| B | [Issue 10: JSON-LD構造化データ](./issues/issue-10-json-ld.md) | P1 | Sonnet 5 |
| C | [Issue 8: 診断タイプ別OG画像](./issues/issue-08-quiz-type-ogp.md) | P1 | Sonnet 5 |
| D | [Issue 12: bbq2025のHead欠落](./issues/issue-12-bbq2025-head.md) | P2(小物) | Fable 5 直接 |

見送り: Issue 7(入口カード)・Issue 11(はじめてのReol)は選曲/文言のコンテンツ作業を伴うため第3バッチへ。Issue 13(状態UI共通化の全面適用)はAで作る共通コンポーネントを他ページへ展開する形で第3バッチへ。

## 設計判断(調査に基づく)

### A: Issue 4 — 楽曲統計

- `gatsby-node.ts:411-420` で `SongStats` GraphQLノードが**既に生成されている**(summary + songStats配列)。`static/data/songStats.json`(1.1MB)の書き出しも同所
- 方針: stats.tsx のクライアントfetchを**Gatsbyページクエリに置換**し、一覧テーブル(曲名/演奏回数/初出/最終)を初期HTMLに焼き込む
- ただし演奏履歴全体(plays配列、2107エントリ)をページクエリに含めるとpage-data.jsonが約1MB膨らむため、**一覧に必要なフィールドのみクエリ**し、行展開時の演奏履歴は従来どおり `songStats.json` を**遅延fetch**(初回展開時のみ)
- 遅延fetch部に共通 `LoadingSkeleton` / `ErrorRetry` コンポーネント(新設、`src/components/common/`)を適用

### B: Issue 10 — JSON-LD

- `SEO.tsx` に `jsonLd?: object | object[]` propを追加し `<script type="application/ld+json">` を出力
- トップ: `WebSite` + `SearchAction`(→ `/search/?q={search_term_string}`)
- `/live/`: `ItemList` + `MusicEvent`(performer は `MusicGroup` name:"Reol"、sameAs: https://reol.jp/ — 非公式サイトなので本人を名乗るOrganization/Personは作らない)
- 主要下層(live/discography/place/photos/search): `BreadcrumbList`
- **競合回避**: stats.tsx(Aが改修)と quiz系(Cが改修)はBのスコープ外

### C: Issue 8 — タイプ別OG画像

- 依存に `canvas@3.2.0` が既存 → ビルド時にPNG生成可能
- `static/relive/generated` への生成(sourceNodesから `generateReliveData` を呼ぶ)という**先行事例に倣い**、`scripts/generate-reol-type-og.ts` を新設して sourceNodes から呼び、`static/reol-type-og/<code>.png`(+public mirror)に16枚生成
- デザインは絵文字グリフに依存しない(node-canvasのカラー絵文字描画は不安定)。タイプカラー×タイポグラフィで構成
- `reol-type-detail.tsx` の Head で `image` を絶対URLで指定

## 検証(Fable 5)

- 各エージェントのdiffレビュー
- `npm run typecheck` / `npm run build`
- ビルド成果物: statsページのHTMLに曲名が含まれること、JSON-LDのスキーマ妥当性、OG画像16枚の生成とHTML参照、リグレッション(タイトル/lang/フッター)
- OG画像はRead(画像表示)で目視確認

## 実装結果

(完了後に追記)
