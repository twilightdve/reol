# 11. 実装計画書: 第2バッチ(Issue 4 / 10 / 8 / 12)

作成日: 2026-07-02
ステータス: **実装・検証完了(2026-07-02)** — ブランチ `feature/batch-02-stats-jsonld-ogp`。レビュー後のマージはユーザーが実施。
体制: 設計/検証: Fable 5、実装: Sonnet 5 サブエージェント×3(並列)+ Issue 12はFable 5直接

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

## 実装結果(2026-07-02)

Sonnet 5×3体が並列実装(セッションリミットで一時中断→SendMessageで再開)、Fable 5がdiffレビュー・typecheck・build・成果物検証を実施。

### 検証結果(すべて✅)

| 項目 | 結果 |
|---|---|
| `npm run typecheck` / `npm run build` | ✅ ともに成功 |
| 統計ページ: 曲名がビルドHTMLに焼き込み | ✅(「読み込み中」表示は0件に) |
| JSON-LD | ✅ トップ=WebSite+SearchAction、/live/=BreadcrumbList+ItemList(**MusicEvent 165件**、日付が範囲表記の2件は正しくスキップ)、discography/place/photos/search=BreadcrumbList。全ブロックJSONパース成功 |
| タイプ別OG画像 | ✅ 16枚生成(1200x630、各150〜208KB)、タイプページのog:imageに反映、目視で日本語描画・非公式表記を確認 |
| bbq2025 | ✅ 4ページにtitle/description+noindex |
| リグレッション | ✅ トップtitle・lang=ja・OFFICIAL LINKS・i18nキー露出0件 |

### Issue 4(楽曲統計)実装メモ

- クライアントfetch→`SongStats`ノードへのGatsbyページクエリに置換。**playsはクエリから除外**しpage-data肥大を回避
- 演奏履歴は初回行展開時に `songStats.json` を一度だけ遅延fetchしMapにキャッシュ。ロード中=LoadingSkeleton、失敗=ErrorRetry(再試行ボタン)
- 共通コンポーネント新設: `src/components/common/LoadingSkeleton.tsx` / `ErrorRetry.tsx`(第3バッチのIssue 13で他ページへ展開予定)
- 検索stateを `query`→`keyword` に改名(ページクエリ `export const query` との衝突回避)

### Issue 10(JSON-LD)実装メモ

- `SEO.tsx` に `jsonLd` prop、ヘルパーは `src/utils/jsonLd.ts`(`REOL_PERFORMER` はMusicGroup+sameAsのみ — 非公式サイト制約を遵守)
- MusicEventは公演(liveItem)単位で生成。親ライブのdate(範囲表記あり)は不使用、`isValidIsoDate` で厳密チェック
- 未対応(将来検討): 未来イベントの `eventStatus`/`offers`、WebSiteのname定数がSEO.tsxと二重管理

### Issue 8(OG画像)実装メモ

- `scripts/generate-reol-type-og.ts`(canvas使用、冪等、単体実行可)を `sourceNodes` から呼び出し(reliveの先例に準拠)。`static/reol-type-og/` + `public/reol-type-og/` に出力
- 絵文字グリフ不使用・タイプカラーのYIQ輝度補正で視認性確保。**macOSビルド前提**(Hiragino Sans。他環境ではフォールバック)
- 共有URL変更: result.tsxの共有先を診断トップ→**タイプ詳細ページ**+`?utm_source=share_x` に(タイプ別OGカードを出すため。流入先が変わるトレードオフあり)

### コミット(feature/batch-02-stats-jsonld-ogp)

Issue単位で4コミット+docs(下記git log参照)。マージ判断はユーザー。
