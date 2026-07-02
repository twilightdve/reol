# 8. 計測設計

GA4導入済み(`src/utils/analytics.ts` の `trackSectionView` 等あり)なので、イベント設計を拡張する。

| 指標 | イベント/計測方法 | 目標の考え方 |
|---|---|---|
| トップ→主要コンテンツ遷移率 | 入口カードクリック / トップPV | 改修前後比較。まず+20% |
| 公式送客クリック率 | `official_link_click`(link_type: youtube/site/ticket/streaming) | **サイトの北極星指標** |
| 診断ファネル | `quiz_start`→`quiz_complete`→`quiz_share` | 完了率60%+、共有率10%を初期目標 |
| 共有URL経由流入 | UTM付き共有URL(`?utm_source=share_x`) | 診断・統計スニペットの拡散測定 |
| セトリ予想投票率 | `setlist_vote` / 予想ページPV | 公演サイクルごとに比較 |
| 統計・検索の利用 | `search_query`(0件クエリも記録)、statsソート操作 | 0件クエリはコンテンツ需要調査に転用 |
| ライブページ滞在 | engagement time(公演前後7日で区分) | ライブ前後モードの効果測定 |
| 再訪率 | GA4リテンション + PWAインストール数 | 今日の1曲導入後に比較 |
| SEO | Search Console: 指名/非指名クエリ別CTR・掲載順位 | description改修の前後比較(改修日をアノテーション) |
| Loading離脱 | statsページの直帰率・`data_load_error` イベント | P0-3([Issue 4](./issues/issue-04-stats-ssr.md))の効果検証 |

## 運用メモ

- 改修のデプロイ日はGA4/Search Consoleにアノテーションを残し、前後比較できるようにする
- 美辞学ナビの利用率(ナビクリック率)はP1-3(ツアーナビ常設化)の判断材料として先行計測する
