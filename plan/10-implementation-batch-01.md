# 10. 実装計画書: 第1バッチ(P0/P1から5件)

作成日: 2026-07-02
ステータス: **実装済み(2026-07-02)** — 検証結果は末尾「実装結果」を参照

> **インフラ前提(2026-07-02 追記)**: 本サイトは `gatsby build` によるSSGを `gh-pages -d public` でGitHub Pagesにホストしている(CNAME方式)。**SSRは不可**であり、初期HTML関連の施策はすべてビルド時静的生成で行う。

改善プラン([03-ui-ux-improvements.md](./03-ui-ux-improvements.md) / [issues/](./issues/))とコードの現状を照合し、最初に実装する5件を選定した。

---

## コード照合で判明した事実(計画に影響する点)

1. **`/search` と `/songs/stats` はSEOコンポーネント未使用**。`<title>検索 | Reol Fan Site</title>` のようなtitleタグ1個だけのHead(`src/pages/search.tsx:391`, `src/pages/songs/stats.tsx:457`)。この2ページはdescription・OGPが完全に欠落しており、タイトル表記ゆれの主因もここ
2. `SEO.tsx` を使うページは16ファイル。live/photos/discography/place は各ページで `title={`LIVE | ${siteMetadata.title}`}` とサフィックスを手組みしている → SEO.tsx側で一元化すれば全ページ同時に統一できる
3. **検索ページのデータは `/static/data/*.json` をクライアントfetch**している(`search.tsx:93-98`)。データはビルド時点でリポジトリ内に存在するため、楽曲統計のビルド時静的化(Issue 4)は想定より容易(ただし本バッチでは見送り)
4. 共通フッターの設置場所は `src/components/modules/body.tsx`(wrapRootElement配下)が適切。ただし bijigaku-navi / quiz/reol-type / cgraph / live/heatmap / relive はパス判定で独自レイアウトに分岐しているため出し分けが必要。`src/pages/index.tsx:43-62` に既存フッターがあり統合が必要
5. `src/utils/analytics.ts` に `trackEvent` ラッパーが既にあり、公式リンク計測ヘルパーの追加は数行で済む
6. `src/pages/search.tsx` にはエラー表示(`:254-256`)とスピナー(`:283-288`)が既にある。問題はタブ件数が未ロード時に `(0)` と出ること(`:259-264`)

---

## 実装する5件

### ① meta description刷新 + SEOデフォルト修正(Issue 1+2 / P0)

- **理由**: 全流入の第一印象を毀損している現行文言(トップ=謝罪文、デフォルト=ツアー文言)の修正。最小コスト・最大即効性
- **変更予定ファイル**:
  - `gatsby-config.ts` — siteMetadata.description差し替え
  - `src/components/SEO.tsx` — `DEFAULT_DESCRIPTION` を汎用文に。`SECTION_META.home` の「Reol公式情報の入り口」という誤解を招く文言も修正
- **実装方針**: トップは「Reol(れをる)の非公式ファンサイト。全楽曲のライブ演奏統計、歴代セットリスト、MVロケ地マップ、ファンタイプ診断まで。10年分の活動を横断検索できます。」に。免責文はABOUTダイアログに現状のまま残す
- **リスク**: ほぼなし。PWA(gatsby-plugin-offline)のService Workerキャッシュで反映が1訪問遅れる可能性がある程度
- **検証方法**: ビルド後 `public/**/index.html` をgrepし、旧文言が全ページから消えたことを確認。デプロイ後にXカードバリデータで確認

### ② `<html lang="ja">` + og:locale 付与(Issue 3 / P0)

- **理由**: a11y/SEOの土台。10分で終わりリスクゼロ
- **変更予定ファイル**:
  - `gatsby-ssr.tsx` — `onRenderBody` で `setHtmlAttributes({ lang: "ja" })` を追加
  - `src/components/SEO.tsx` — `og:locale=ja_JP` を1行追加
- **リスク**: なし
- **検証方法**: ビルド後HTMLの先頭を確認。Lighthouseのa11y該当項目(html lang欠落)解消

### ③ 公式リンクフッター(OFFICIAL LINKS)+ GA4計測(Issue 5 / P0)

- **理由**: サイト最重要方針「公式送客」の構造化と、以後の全改善を測る北極星指標(`official_link_click`)の創出
- **変更予定ファイル**:
  - `src/components/modules/OfficialFooter.tsx` — 新規。公式サイト/YouTube/X/Instagram/配信/チケット+非公式表記
  - `src/components/modules/body.tsx` — 通常テーマ分岐と美辞学ナビ分岐に配置。フルスクリーン系(quiz/cgraph/heatmap/relive)は意図的に除外
  - `src/pages/index.tsx` — 既存フッター(:43-62)をOfficialFooterに統合し重複排除
  - `src/utils/analytics.ts` — `trackOfficialLinkClick(linkType)` ヘルパー追加
- **実装方針**: 外部リンクは `target="_blank" rel="noopener noreferrer"`、クリックで `official_link_click` イベント(`link_type: site|youtube|x|instagram|streaming|ticket`)
- **リスク**:
  1. **公式URLは実装時に reol.jp から実リンクを確認して転記する**(記憶ベースでハードコードしない)
  2. body.tsxはパス出し分けロジックがあるため、全パスでの表示確認が必要
  3. index.tsx既存フッターとの二重表示に注意
- **検証方法**: `yarn develop` でトップ/live/discography/place/photos/美辞学ナビ/quiz各パスの表示を目視。GA4 DebugViewでイベント発火確認

### ④ ページタイトル統一 + search/statsのSEO欠落解消(Issue 6 / P1)

- **理由**: ブランド分散(4系統確認済み)の解消。①のdescription監査と作業が重なるため同バッチが効率的。副産物として search/stats に初めてdescription・OGPが付く
- **変更予定ファイル**:
  - `src/components/SEO.tsx` — titleに ` | !Legit - Reol非公式ファンサイト` を自動付与する仕様へ(トップ用にサフィックス省略オプション)
  - サフィックス手組みの4ページ: `src/pages/live/index.tsx`, `src/pages/discography/index.tsx`, `src/pages/place/index.tsx`, `src/pages/photos/index.tsx` — `title="LIVE"` のようにページ名のみ渡す形に
  - title単独Headの3ページ: `src/pages/search.tsx`, `src/pages/songs/stats.tsx`, `src/pages/404.tsx` — SEOコンポーネント利用に置換、個別description追加
  - `src/pages/timeline/index.jsx`, `src/pages/timeline/generator.jsx` — 手書きmetaをSEOコンポーネントに寄せる
  - その他の `<SEO` 呼び出し箇所(bijigaku-navi系・quiz系・templates 3種)のtitle渡し方を追従
- **リスク**: 触るファイルが約15と多く、機械的だが漏れ・二重サフィックスが起きやすい
- **検証方法**: ビルド後に `grep -rh "<title>" public --include=index.html | sort -u` で全ページのtitleフォーマットを全数検査

### ⑤ 検索ページの「(0)」表示と空状態改善(Issue 9 / P1)

- **理由**: DB性がサイトの看板なのに「すべて(0)」の初期表示が「データがないサイト」に見せている。修正箇所が特定済みで小さい
- **変更予定ファイル**: `src/pages/search.tsx` のみ
- **実装方針**:
  1. データ未ロード時(`!discography`)は件数 `(n)` を非表示(ラベルのみ表示)
  2. 未入力の空状態に、既存placeholder(「第六感 / 文明ココロミー / 武道館 / 2024」)を流用したサンプルクエリチップを表示。クリックで検索実行
  3. `search_query` イベント送信(0件クエリも記録し需要調査に転用)— 既存 `trackEvent` を利用
- **リスク**: 低。エラー表示は既に実装済みなので流用
- **検証方法**: DevToolsで低速回線シミュレーション→初期表示に「(0)」が出ないこと、チップクリックで検索されること、GA4 DebugView

---

## 実装順序

**② → ① → ④ → ⑤ → ③**

| 順 | 項目 | 理由 |
|---|---|---|
| 1 | ② lang/og:locale | 数分で終わるゼロリスク層 |
| 2 | ① description刷新 | 同上。④の前提整理を兼ねる |
| 3 | ④ タイトル統一 | ①のdescription監査と同時に流せる |
| 4 | ⑤ 検索(0)表示 | 独立・小規模 |
| 5 | ③ 公式リンクフッター | 公式URLの実確認という外部依存があるため最後 |

## 今回見送る改善(と理由)

| 見送り | 理由 |
|---|---|
| Issue 4: 楽曲統計のビルド時静的化(SSG) | 効果最大だが gatsby-node.ts のビルドパイプライン変更を伴い、単独バッチでリグレッションテストすべき。**次バッチの本命**(static/data/songStats.json が既存と判明したので想定より軽い)。※SSRではなくビルド時静的生成(GH Pagesホストのため) |
| Issue 7: トップ入口3カード | 遷移先の「はじめてのReol」(Issue 11)が未作成のうちに置くと空砲になる。デザイン判断も必要 |
| Issue 8: 診断タイプ別OGP | 画像16枚の生成方式(ビルド時 or 静的)の設計が必要。第2バッチ |
| Issue 10: JSON-LD | ①④でSEO.tsxが変わるので、その安定後に載せる方が手戻りがない |
| Issue 11: はじめてのReol | 選曲・執筆というコンテンツ作業が主。コード改善と分けて進める |
| Issue 12/13: bbq2025 Head・状態UI共通化 | P2。④・Issue 4のコンポーネント整備後の方が安い |

## 未確定事項(実装時に確認)

- ③の公式リンク掲載先(YouTube/X/Instagram/配信/チケット)は、指定がなければ実装時に reol.jp の公式導線から確認して採用する
- ビルドコマンド(`yarn build` 想定)と検証環境は実装時に package.json の scripts を確認する

---

# 実装結果(2026-07-02)

5件すべて実装し、`npm run typecheck`(lintスクリプトは無いため型検査で代替)と `npm run build`(SSG)の成功、およびビルド成果物 `public/**/index.html` の全数検査で検証済み。

## 検証結果サマリ

| 検証項目 | 結果 |
|---|---|
| `npm run typecheck` | ✅ エラーなし |
| `npm run build`(gatsby build) | ✅ exit 0 |
| 全ページ `<title>` フォーマット統一 | ✅ `ページ名 \| !Legit - Reol非公式ファンサイト` に統一(トップは専用タイトル) |
| `<html lang="ja">` | ✅ 全ページ出力 |
| `og:locale=ja_JP` | ✅ 出力確認(トップ/stats/search) |
| 旧デフォルトdescription(美辞学ツアー文言)のmeta残存 | ✅ 0ページ |
| 謝罪文descriptionのmeta残存 | ✅ 0ページ(ABOUTダイアログ内の本文は方針どおり残存) |
| OFFICIAL LINKSフッター | ✅ 64ページに出力(フルスクリーン系は意図的に除外) |
| 検索ページ初期表示の「すべて(0)」 | ✅ 初期HTMLは件数なしの「すべて」 |

## 実装中に発見・修正した追加問題(計画外)

1. **【P0級】ファンタイプ診断3ページで翻訳キーがtitle/OGPに露出**
   - 1回目のビルドで `reolType.seoIntroTitle | !Legit - ...` のようなタイトルが `/quiz/reol-type/`(index/quiz/result)に出力されていることを発見
   - 原因: Gatsby Head 内で `useTranslation()` の `t()` を使用しており、SSGビルド時のi18n初期化順によって未解決キーがそのまま出る(detailテンプレートは偶然解決されており、同じ潜在リスクを持っていた)
   - 修正: Head では `t()` を使わず `src/i18n/locales/ja/common.json` を直接import して参照(4ファイル: `quiz/reol-type/index.tsx`, `quiz.tsx`, `result.tsx`, `templates/reol-type-detail.tsx`)。2回目のビルドでキー露出0件を確認
2. **相関図ページのタイトル表記ゆれ**: `/cgraph/` が `Creator Relations | Reol fansite` という独自表記+手書きメタだったため、SEOコンポーネント利用に統一(`相関図(Creator Relations)`、noindexは維持)

## 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `gatsby-ssr.tsx` | `onRenderBody` で `<html lang="ja">` 付与 |
| `gatsby-config.ts` | siteMetadata.description を価値提案文に刷新 |
| `src/components/SEO.tsx` | デフォルトdescription刷新 / titleサフィックス自動付与(`title`はページ名のみ受け取り、省略時トップ用タイトル) / `og:locale=ja_JP` 追加 / SECTION_META.home 文言修正 |
| `src/components/modules/officialFooter.tsx` | **新規**。公式サイト/YouTube/X/Instagram/グッズへの送客フッター+非公式表記+運営クレジット。クリックでGA4計測 |
| `src/components/modules/body.tsx` | OfficialFooter を通常テーマ・美辞学ナビの両分岐に配置(フルスクリーン系は除外) |
| `src/utils/analytics.ts` | `trackOfficialLinkClick` ヘルパー追加 |
| `src/pages/index.tsx` | 旧フッターをOfficialFooterに統合(削除)/ Headのtitle渡しを新仕様に |
| `src/pages/search.tsx` | SEOコンポーネント導入(description/OGP新設)/ 件数はロード完了+クエリ入力後のみ表示 / 空状態にサンプルクエリチップ / `search_query` GA4イベント(1秒デバウンス、0件も記録) |
| `src/pages/songs/stats.tsx` | SEOコンポーネント導入(description/OGP新設) |
| `src/pages/404.tsx` | SEOコンポーネント導入 |
| `src/pages/live/index.tsx` `discography/index.tsx` `place/index.tsx` `photos/index.tsx` | titleをページ名のみに(サフィックス手組み廃止) |
| `src/pages/bijigaku-navi/index.tsx` `setlist-prediction.tsx` `live/heatmap.tsx` `dynamic-color-demo.tsx` | title表記調整 |
| `src/pages/timeline/index.jsx` `generator.jsx` | 手書きメタをSEOコンポーネントに統一 |
| `src/pages/quiz/reol-type/index.tsx` `quiz.tsx` `result.tsx` `src/templates/reol-type-detail.tsx` | Headの翻訳キー露出修正(jaロケール直接参照) |
| `src/pages/cgraph.tsx` | SEOコンポーネント導入(noindex維持) |

## 採用した公式リンク(実確認済み)

- 公式サイト: `https://reol.jp/`
- YouTube: `https://www.youtube.com/@reolofficial1587`(サイト使用中の公式動画のoEmbedで確認)
- X: `https://twitter.com/RRReol`(reol.jp掲載)
- Instagram: `https://www.instagram.com/rrreol999/`(reol.jp掲載)
- グッズ: `https://reol.ec-front.jp/`(reol.jp掲載)
- 音楽配信の公式ハブリンクは reol.jp 上で確認できなかったため**掲載見送り**(確認でき次第追加)

## デプロイ後の確認事項(残タスク)

- [ ] デプロイ(`npm run deploy`)後、Xカードバリデータでトップ/診断ページのOGP表示確認
- [ ] GA4 DebugView で `official_link_click` / `search_query` の発火確認
- [ ] PWA(gatsby-plugin-offline)のSWキャッシュにより、既存訪問者への反映は1訪問遅れる点に留意
- [ ] Search Console にデプロイ日をメモし、CTR前後比較の基準日とする
