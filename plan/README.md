# !Legit 改善計画(2026-07-02)

Reol非公式ファンサイト「!Legit」(https://reol.twilightea.com/) の UI/UX・情報設計・SEO・SNS拡散性・ファン化導線の改善計画。

実サイトのHTML/メタ情報の取得と、本リポジトリのコード実査(`SEO.tsx`、`gatsby-config.ts`、`gatsby-ssr.tsx`、header/footer、i18n構成など)に基づく。スクリーンショットによる視覚確認は未実施のため、視覚デザインの細部は「推測」と明記している。

## ドキュメント構成

| ファイル | 内容 |
|---|---|
| [01-assessment.md](./01-assessment.md) | 総評(強み・弱み・最大の伸びしろ)と勝ち筋 |
| [02-user-journeys.md](./02-user-journeys.md) | ユーザー別の理想導線 |
| [03-ui-ux-improvements.md](./03-ui-ux-improvements.md) | UI/UX改善提案(P0〜P3 優先度順) |
| [04-copywriting.md](./04-copywriting.md) | 訴求力改善(キャッチコピー・導入文・CTA文言案) |
| [05-content.md](./05-content.md) | コンテンツ改善提案(既存の見せ直し+新規案) |
| [06-seo-sns.md](./06-seo-sns.md) | SEO・SNS改善(title/description/OGP/構造化データ/内部リンク) |
| [07-roadmap.md](./07-roadmap.md) | 実装ロードマップ(1日/1週間/1か月/3か月) |
| [08-metrics.md](./08-metrics.md) | 計測設計(GA4イベント・指標) |
| [09-top10.md](./09-top10.md) | 最終提案(最重要改善トップ10) |
| [10-implementation-batch-01.md](./10-implementation-batch-01.md) | 実行計画書: 第1バッチ(P0/P1から5件・実装済み) |
| [11-implementation-batch-02.md](./11-implementation-batch-02.md) | 実行計画書: 第2バッチ(Issue 4/10/8/12・実装済み) |
| [12-repo-audit.md](./12-repo-audit.md) | リポジトリ未コミット差分の監査報告(整理実行済み) |
| [13-implementation-batch-03.md](./13-implementation-batch-03.md) | 実行計画書: 第3バッチ選定(Issue 11/7/13+α・承認待ち) |
| [issues/](./issues/) | GitHub Issue化できる粒度の個別Issue案(13件) |

## インフラ前提

- 本サイトは **Gatsby でSSG(静的生成)し、GitHub Pages にホスト**している
- ビルド: `npm run build`(`gatsby build` + `public/CNAME` 生成)、デプロイ: `npm run deploy`(`gh-pages -d public`)
- 独自ドメイン `reol.twilightea.com` は CNAME 方式
- **SSRは不可**。「初期HTMLにデータを含める」施策はすべてビルド時静的生成で行う

## 基本方針

- Reol本人・公式サイト・公式SNS・公式YouTube・配信・チケットへの導線を強化する
- 非公式サイトとして著作者の権利を尊重し、許可されていない転載を前提にした施策は行わない
- 公式コンテンツへの送客、節度ある引用、埋め込み可能な公式コンテンツの活用を優先する
- 既存ファンの熱量と新規リスナーの入りやすさを両立する

## 最初に着手すべき3タスク

1. **[Issue 2](./issues/issue-02-top-meta-description.md) + [Issue 1](./issues/issue-01-seo-default-description.md) + [Issue 3](./issues/issue-03-html-lang.md)**(meta description刷新 + SEOデフォルト修正 + lang属性) — 合計数時間・リスクゼロで、全流入の第一印象とSEO土台が直る
2. **[Issue 5](./issues/issue-05-official-links-footer.md)**(公式リンクフッター+計測イベント) — 最重要方針「公式送客」を構造化し、以後の全改善を測る北極星指標(公式クリック率)を得る
3. **[Issue 4](./issues/issue-04-stats-ssr.md)**(楽曲統計のビルド時静的化+状態UI) — 看板コンテンツが検索エンジンとユーザー双方に「空」に見えている最大の機会損失を解消する

この3つが済んだ時点で「入口(検索/SNS)→中身(統計/セトリ)→出口(公式)」の基本回路が初めて全部つながる。以降のP1(トップ入口カード、診断OGP、曲詳細ハブ)は、この回路に流量を増やす施策として順に積む。
