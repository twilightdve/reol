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
| [13-implementation-batch-03.md](./13-implementation-batch-03.md) | 実行計画書: 第3バッチ(Issue 11/7/13+α・実装済み) |
| [14-implementation-batch-04.md](./14-implementation-batch-04.md) | 実行計画書: 第4バッチ選定(曲詳細ハブ+小物・実装済み) |
| [15-uiux-redesign-ab.md](./15-uiux-redesign-ab.md) | デザイン提案: UI/UX評価とリデザインA/B案(B案採用・青×黄で確定) |
| [16-implementation-plan-b.md](./16-implementation-plan-b.md) | 実行計画書: B案「BLACKBOX / CHRONICLE」本実装(バッチ5〜8すべて完了) |
| [17-implementation-batch-07.md](./17-implementation-batch-07.md) | 実行計画書: バッチ7 全ページ展開(完了。playwright導入によるブラウザ検証結果を含む) |
| [18-implementation-batch-08.md](./18-implementation-batch-08.md) | 実行計画書: バッチ8「磨き」(オープニング撤去/ダイナミックアクセント点検/OG画像ダーク化) — ✅完了(2026-07-10) |
| [19-fansite-auth-reuse.md](./19-fansite-auth-reuse.md) | 検討メモ: 美辞学ナビ認証基盤のファンサイト転用(タイプ診断結果保存・LIVE参戦フラグ) — 計画段階、ユーザー確認待ち |
| [20-release-review.md](./20-release-review.md) | リリース前サイト評価: P0修正3件/リリース時判断/追加コンテンツ提案(On This Day等) — 提案段階 |
| [21-ga4-analysis-improvement-plan.md](./21-ga4-analysis-improvement-plan.md) | GA4実データ分析(analytics-mcp)とタグ運用・導線改善プラン(2026-07-16) — 分析完了、提案段階 |
| [22-cgraph-redesign.md](./22-cgraph-redesign.md) | 相関図(/cgraph/)のUI/UX再設計: ツールバー1段化+右ドック統一 — 実装済み |
| [23-scroll-14years-draft.md](./23-scroll-14years-draft.md) | 新規コンテンツ案D「スクロールで読む◯年」の骨子+本文ドラフト(名義3章構成) — 要監修、実装未着手 |
| [24-ga4-content-reassessment-and-new-content-ideas.md](./24-ga4-content-reassessment-and-new-content-ideas.md) | GA4再評価(実データ取得済み)+コード実査によるコンテンツギャップ洗い出し+新規コンテンツ提案4件(音響特性チャート復活/演奏履歴映像バッジ/マイコレクション統合/診断結果パーソナライズ)。Spotify Audio Features API復活なしを確認 — 提案段階 |
| [25-collection-based-content-ideas.md](./25-collection-based-content-ideas.md) | コレクション台帳のDB永続化(`user_collections`実装済み)を受けた新規コンテンツ提案7件(達成率サマリー/ギャップ表示/年代別コンプリート率/バッジ/集計カウンター/シェアカード/ランキング) — 提案段階 |
| [26-geo-structured-data-gaps.md](./26-geo-structured-data-gaps.md) | GEO(生成AI最適化)向けJSON-LD構造化データの現状監査+ギャップ5件(演奏履歴/セットリスト/MusicAlbum/FAQPage/sameAs拡充) — 調査完了、提案段階 |
| [27-site-audit-2026-09.md](./27-site-audit-2026-09.md) | サイト課題の棚卸しと改善プラン(2026-09-27): 本番の作業ツリー依存デプロイ/認可設計の見直し/On This Day空ページ172件のindex/全ページ約1MBのインラインCSS(base64フォント)/静的HTMLとクライアント描画の不一致/Tailwind content漏れ等と実行順プラン — ステップ0〜5とP3を実施(残りは本文) |
| [28-i18n-legit.md](./28-i18n-legit.md) | !Legit の多言語対応(英語・中国語 繁体字/簡体字・韓国語): 言語別URL、URLのみから言語を決める設計、ルート定義の一元化、SEO(canonical/hreflang)、段階計画と検証項目 — 第1弾(4言語・主要ページ)・第2弾(聖地・検索・入門・ツール等14ページ)・第3弾(ガイド・On This Day・診断・相関図)完了 |
| [29-song-articles.md](./29-song-articles.md) | 楽曲記事(読みもの)の実装: 引継ぎ設計書の実装時確定事項(配置・公開/非公開の分離・取込・表示)、Boy / No title の取込結果と未決事項 — 取込・表示の土台とプレビューまで(公開は未実施) |
| [30-boy-article-design.md](./30-boy-article-design.md) | 楽曲記事「Boy」の記事別デザイン: 素材の観察→意味→表現、淡いコンクリートのA案、記事別デザインの登録の仕組み |
| [31-notitle-article-design.md](./31-notitle-article-design.md) | 楽曲記事「No title」の記事別デザイン: 見上げる空・縦書き・ウォータークラウン・波紋、ユーザーとの調整の記録 |
| [32-monster-article-design.md](./32-monster-article-design.md) | 楽曲記事「MONSTER」の記事別デザイン: 2025年のライブ映像の黒い積乱雲とカラスから、怪物を内側から湧く嵐として描く |
| [33-articles-series-tags.md](./33-articles-series-tags.md) | 読みものの分類: シリーズ(楽曲記事は「曲を読む」)+タグ(作品・年など)、一覧の絞り込み・シリーズのページ・記事末尾の帯 |
| [34-scorpion-article-design.md](./34-scorpion-article-design.md) | 楽曲記事「SCORPION」の記事別デザイン: 文字のポスター(紺黒・深い赤・生成り)と、積み重ねた過去を表すサソリの尾 |
| [35-1ldk-article-design.md](./35-1ldk-article-design.md) | 楽曲記事「1LDK」の記事別デザイン: 暗い部屋から朝の光へ、奥へ連なる額縁と壁の額 |
| [36-security-audit-2026-10.md](./36-security-audit-2026-10.md) | 脆弱性の点検(2026-10): Supabase は問題なし、npm audit fix で critical 7→1・high 129→82、残りの扱いと要判断事項 |
| [37-drop-pop-candy-article-design.md](./37-drop-pop-candy-article-design.md) | 楽曲記事「drop pop candy」の記事別デザイン: 低気圧の灰色の雨がキャンディの色になる、二人の掛け合いの線、水たまりから星へのひとっ飛び、閉じた傘 |
| [38-mutant-article-design.md](./38-mutant-article-design.md) | 楽曲記事「ミュータント」の記事別デザイン: 夜の海、海に浮かんで溶ける題名、ループ橋と吊り橋、二重の螺旋、世界線の移り変わり |
| [39-vacuum-oldrose-article-design.md](./39-vacuum-oldrose-article-design.md) | 楽曲記事「真空オールドローズ」の記事別デザイン: 古い紙の地、ガラスの覆いの中の薔薇と煙、断ち切った線、太陽の軌道の図、薄れる花びら、覆いが閉じる結び |
| [41-heimenkyou-article-design.md](./41-heimenkyou-article-design.md) | 楽曲記事「平面鏡」の記事別デザイン: 濃い青の闇、縦の鏡の線と反転した題名、ダーツの的、閉じる三面鏡、市松の帯、三つの年の曲順 |
| [42-missing-article-design.md](./42-missing-article-design.md) | 楽曲記事「ミッシング」の記事別デザイン: 夜の街と環状線を回るタクシー、運賃メーター、追い越される道路、四十九の灯、走り去るタクシー |
| [43-scheduled-publish.md](./43-scheduled-publish.md) | 楽曲記事の予約公開: 公開日時が未来の記事はページを置き、一覧・関連・曲ページ・HOME・サイトマップには公開日時を過ぎるまで出さない(JS で今の時刻と比べる) |
| [44-cult-article-design.md](./44-cult-article-design.md) | 楽曲記事「カルト」の記事別デザイン: 闇のろうそく、語源の枝分かれ、静けさとハイトーンの波形、表と裏の声、消える光背、信仰と芸術の境界 |
| [45-akayoroshi-article-design.md](./45-akayoroshi-article-design.md) | 楽曲記事「あ可よろし」の記事別デザイン: 明るい紙面、明けていく空と赤短、五曲の並び、彼岸花を抜ける光、「前」を指す針 |
| [46-article-pageviews.md](./46-article-pageviews.md) | 読みものの一覧に表示回数(GA4)を出す: デプロイ前に GA から取得、公開日以降だけ数える、よく読まれている順 |
| [47-daily-deploy.md](./47-daily-deploy.md) | 毎日の自動デプロイ: 最後に手動で出した版を launchd で毎日作り直す(表示回数・シート・予約公開の反映) |
| [48-profile-card.md](./48-profile-card.md) | プロフィールカード(ライヴ会場での自己紹介): 見せる・QR・画像、QR はカードの内容そのもの(サーバーに置かない)、会員/非会員(実装済み) |
| [49-nil-gokusaishiki-article-design.md](./49-nil-gokusaishiki-article-design.md) | 楽曲記事「-nil-／極彩色」の記事別デザイン: 白い紙(無)に水彩のにじみ、境目の無い帯、16曲の輪、四人の表現、終わりを始まりへ(限定公開) |
| [50-seimeisen-article-design.md](./50-seimeisen-article-design.md) | 楽曲記事「生命線」の記事別デザイン: 深い青の地に一本の線、刻む断片がサビで開ける、嫌いと好きが同じ線の上と下、傷と色が重なる手のひらの線(限定公開) |
| [51-articles-rss-feed.md](./51-articles-rss-feed.md) | 読みものの RSS フィード(/articles/feed.xml): 全体公開の記事だけ、一覧にリンク、head に alternate |
| [52-articles-index-cards.md](./52-articles-index-cards.md) | 読みもの一覧をカード型に: 記事の表紙を撮った画像(articles-cover)を上に、1〜3列 |
| [53-site-og-refresh.md](./53-site-og-refresh.md) | サイト共通OGP画像をトップのヒーローと同じ構成に(ロゴ・見出し・数字)。説明文の切れも解消 |
| [54-minasoko-article-design.md](./54-minasoko-article-design.md) | 楽曲記事「水底游歩道」のデザイン: 読み進めるほど水の底へ沈む地、沈む月、浮かんでは潜る線、ほどける手紙 |
| [55-harushian-article-design.md](./55-harushian-article-design.md) | 楽曲記事「ハルシアン」のデザイン: 方眼ノートとボルドー、背伸びの目盛り、甘えと対等のシーソー、舌打ちの文字の図。本文版4〜6で、あとから開いたページと、春・青(ひっくり返った青春)の図 |
| [56-privacy-policy.md](./56-privacy-policy.md) | プライバシーポリシー(/privacy/): GA4・アカウント・いいね・外部の埋め込みの事実だけを書く。OAuth 同意画面の本番化のため |
| [57-gokusaishiki-xfd-covers.md](./57-gokusaishiki-xfd-covers.md) | MV の無い『極彩色』の曲(生命線・水底游歩道・ハルシアン)の表紙に、XFD を曲の場面から置き、下に Spotify で聴くリンク |
| [58-ga-skip-automated-browsers.md](./58-ga-skip-automated-browsers.md) | 自動操作のブラウザ(Claude の Playwright での確認)では GA に送らない |
| [59-home-redesign.md](./59-home-redesign.md) | HOME とサイト全体のデザイン再考。読みものの表紙を主役に、層を分けて組み直す案と段取り |
| [60-global-player.md](./60-global-player.md) | MainVideo をやめ、どこからでも再生できて、スクロール・画面遷移しても右上隅で流れ続けるプレイヤーにする |
| [61-logic-agent-article-design.md](./61-logic-agent-article-design.md) | 楽曲記事「ロジックエージェント」の記事別デザイン(光と影、二つの高さで並ぶ声) |
| [62-orderly-article-design.md](./62-orderly-article-design.md) | 楽曲記事「-orderly-」の記事別デザイン(白と黒、ループに加わっていく音) |
| [63-mede-mede-article-design.md](./63-mede-mede-article-design.md) | 楽曲記事「mede:mede」の記事別デザイン(白と光、回り続ける問い、1K と 1LDK)。取込の `markdown` キー対応 |
| [64-birthday-letters.md](./64-birthday-letters.md) | Reol 誕生日の手紙企画「件名のないふくろう便」(投稿・閲覧・本人修正・運営確認・印刷の版管理。本文非公開は DB 側で守る) |
| [65-syrup-article-design.md](./65-syrup-article-design.md) | 楽曲記事「Syrup」の記事別デザイン(深い夜の地に薄紅と虹、半分沈む題名、澄んでいく三つの層、二つの「半分」、朝に混ざる結び) |
| [66-site-review-and-proposals.md](./66-site-review-and-proposals.md) | サイトの現状調査(本番390px・GA4・データ)と、改善・新コンテンツの提案。最優先は公演ページを「公演の前と後に開くページ」にすること。新シリーズ「ツアーを読む」、年の記録ページ。提案段階(未実装) |
| [67-inflow-diagnosis-and-plan.md](./67-inflow-diagnosis-and-plan.md) | 流入が少ない原因の切り分け(検索にほぼ載っていない／いちばん届いた X 投稿がサイトに繋がっていない／記事13本が未告知)と、新しく訪れる人を増やす提案。最初の3施策(検索に載せる土台・公演当日のセトリ・聖地ガイド)と4週間の順番、題名と告知文の見本。Search Console は未取得(必要資料を記載)。提案段階(未実装) |
| [68-inflow-followup-deliverables.md](./68-inflow-followup-deliverables.md) | 報告67の補正(`site:` 件数≠登録数、未登録が最大原因は未検証の仮説、ほか5点)と、採否を決めるための具体物。A: 検索の土台の差分案(LIVE 一覧・曲ページから個別公演への href、公演ページの題名、診断結果画面の noindex。`68-a-changes.patch`、実装・デプロイ済み)。B: 告知が見つからなかった記事2本の告知一式。C: 渋谷の聖地ガイドのサイト掲載用原稿・略図・X 投稿(`/place/shibuya/` として実装・デプロイ済み)。B・C の本文は Git 対象外の `.articles-local/plan68/`。X への投稿はしていない |
| [69-place-redesign.md](./69-place-redesign.md) | PLACE(聖地)の作り直し。地図と一覧の行き来(ピン→カード→一覧の行、一覧→地図)、サイトの色のピン、スマホは2本指で地図、広い画面は一覧と地図の2段、絞り込みを1行に、作品カードを button に。WebKit で暗い地図に黒い帯が残る不具合の直し(LIVE 開催地マップも同じ指定)。追記: スポットの詳細に Google マップと YouTube の埋め込み、色と文字の見直し(unslop を参考)。実装済み・main に取り込み済み、デプロイは指示待ち |
| [70-shibuya-guide-to-articles.md](./70-shibuya-guide-to-articles.md) | 聖地巡礼ガイド 渋谷編を読みものへ移す。新しい URL `/articles/shibuya-guide/`、シリーズ「聖地を歩く」、表紙と OGP、読みものの一覧・RSS・HOME への掲載、前の URL `/place/shibuya/` からの転送。実装・main 取り込み済み、デプロイはまだ |
| [71-less-cards.md](./71-less-cards.md) | カードを減らす。読みものの見た目(枠なしの一本の段・小さいラベル・細い罫線・文字リンク)をサイト全体に広げるルールと、第1段で変えた画面(HOME・DISCOGRAPHY・LIVE・PLACE・PHOTO・曲・公演・今日は何の日・タイムマシン・検索・機能一覧・はじめての Reol・聖地巡礼ガイド)。共通部品 `LinkRows`。ガイドへの LiLiBET TEA HOUSE の追加。残りの画面(第2段)の一覧 |
| [72-photo-to-articles.md](./72-photo-to-articles.md) | PHOTO を読みものへ移す(第1段: 共通の土台と先行2本のプレビュー)。読みものの2つ目の種類「記録」(写真・動画を本文に置く共通テンプレート、`announce`、出来事の日付順)、旧 PHOTO 89 件の台帳と検査(`npm run articles:photo`)、取込(`npm run articles:record`)、先行2本(福岡の聖地・ラッキーフェス 2023)の対応表、決めたこと、検証、残っている確認。公開・デプロイ・ナビの切り替えはまだ |
| [40-end-article-design.md](./40-end-article-design.md) | 楽曲記事「エンド」の記事別デザイン: 曇った海の水平線に沈む終止符、エンド●レス、黒枠の葬式、届かない電話、光に包まれた終止符 |
| [legit-improvement-plan.md](./legit-improvement-plan.md) | 外部観察ベースの改善プラン・実装引き継ぎ資料(2026-07-26)。見送り項目リスト(§6)を含む — 大半実装済み(状況は27で更新) |
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
