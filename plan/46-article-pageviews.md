# 46. 読みものの一覧に表示回数(GA4)を出す

着手(2026-10-18): ユーザー「記事のPV数をGAから取得して一覧に出すことはできる?」→ 3案(デプロイ時に取得/Supabase で毎日取り込み/自前で数える)から「デプロイのときに GA から取って、一覧に書き込む」を選択。

## 1. 仕組み

1. `npm run deploy` の predeploy で、`check-deploy-ready` のあとに `npm run articles:pageviews`(`scripts/fetch-article-pageviews.ts`)が動く。
   - GA4 Data API(`properties/414261169` = reol-fansite)から、`hostName = reol.twilightea.com` かつ `pagePath` が `/articles/` で始まる表示回数(`screenPageViews`)を、ページ×日ごとに取る(2026-10-01 以降)。
   - `/articles/<slug>/` だけを記事ごと・日ごとにまとめて `.analytics-local/article-pageviews.json` に書く(git 管理外)。
   - 認証はこの PC の Application Default Credentials(analytics-mcp と同じ。GCP プロジェクト reol-ga-mcp の OAuth クライアント)。認証情報はビルドの出力にもリポジトリにも入らない。
   - 取れなかった時は警告だけ出して、前回のファイルのままビルドを続ける(デプロイは止めない)。
2. ビルド(`gatsby-node.ts`)がそのファイルを読み、記事ごとに **公開日(日本時間)以降の日だけ** を足して一覧のページ情報に入れる(`src/utils/songArticles/pageviews.ts`)。限定公開での確認中の表示は数えない。限定公開の記事は数を出さない。
3. 一覧(`src/templates/song-articles-index.tsx`)
   - カードの日付・いいねの並びに、目の形と表示回数。静的HTMLにも出る。
   - 並べ替えに「よく読まれている順」(`?sort=views`)。同数は新着順のまま。
   - 並べ替えの下に「表示回数は公開日からの数で、○月○日時点のものです(Google アナリティクスの計測。計測されない閲覧もあります)」。
   - ファイルが無いビルド(`npm run build` だけ・取得に失敗し前回のファイルも無い)では、数も並べ替えも出ない。

## 2. 注意

- 数が変わるのはデプロイの時だけ。
- GA は広告ブロッカーなどで計測されない閲覧があり、実際より少なめ。当日・前日分は GA 側でまだ出そろっていないことがある。
- 認証(OAuth のリフレッシュトークン)は 2026-07-29 と 2026-10-18 に `invalid_grant` で切れていた。切れると数が古いまま(警告はデプロイの出力に出る)。再認証は plan/24 の 0章のコマンド。
  - 推測(未確認): OAuth 同意画面が「テスト」状態だと、リフレッシュトークンが7日で切れる。「本番」にすれば切れにくくなる。

## 3. 確認

- 2026-10-18: 単体テスト(公開日より前の日を捨てる・ファイル無し・公開日時無し)、型チェック。仮の数字のファイルでビルドし、一覧の表示と並べ替えを Chromium・WebKit で確認(仮の数字は確認後に消した)。
- GA の実データでの取得: 認証切れのため未確認(ユーザーの再認証待ち)。
