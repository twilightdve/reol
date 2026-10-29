# 56. プライバシーポリシー(/privacy/)

2026-10-29。GA の表示回数の取得(plan/46)に使う OAuth 同意画面(GCP `reol-ga-mcp`)を「本番」にするには、プライバシーポリシーの URL が要る(ユーザー)。サイトは GA4・アカウント・コメント・いいね・外部の埋め込みを使っており、Google アナリティクスの規約上も開示が要るため、サイトのページとして作った。

## 1. 中身(すべてコードと本番の通信で確かめた事実だけ)

| 節 | 根拠 |
| --- | --- |
| アクセス解析: GA4、Cookie `_ga` など、`/card/view/` は送らない、オプトアウト。運営者は集計データだけを自分のアカウントで読む | `gatsby-config.ts`(gatsby-plugin-google-gtag)、本番の Cookie(`_ga`・`_ga_<ID>`)、`scripts/fetch-article-pageviews.ts` |
| アカウント: ユーザー ID・表示名・パスワード(元に戻せない形)・任意の X の URL など、記録・投稿、ログイン中の診断結果。メールアドレスは聞かない。公開・非公開の切り替え。削除で関連データも消える | `services/authService.ts`、`supabase/migrations/*`(bcrypt、`delete_account`)、`pages/quiz/reol-type/result.tsx` |
| いいね: ブラウザごとの無作為な ID を localStorage に持ち、DB に送る | `services/articleLikeService.ts` |
| ブラウザに保存するもの | localStorage の使い方(言語・診断・地図の会場・ログイン状態) |
| 外部の埋め込み: YouTube(サムネイルは表示時、動画は押した時だけ)、Spotify・X(表示時、Cookie あり)、OpenStreetMap(地図) | 本番を Playwright で開いて記録した通信先と Cookie(/、曲ページ、記事、/place/ ほか) |
| 置き場所: GitHub Pages | site-infra |
| 問い合わせ: 運営者の X @twilightplc | フッターと同じ |

- 書かなかったこと: 保存期間・対応期限など、確かめられない約束。
- 日本語版だけ(`i18nRoutes` の多言語の対象に入れない)。各言語のフッターに「プライバシーポリシー(日本語)」のリンク。

## 2. 確認

開発サーバーの Chromium・WebKit、360・390・1280px。横はみ出しなし、ページのエラーなし、フッターのリンクあり。`/en/privacy/` は作らない(404)。英語版のフッターからは `/privacy/` へ。

## 3. 公開後に GCP でやること(ユーザー)

OAuth 同意画面(Google Auth Platform → ブランディング): アプリのホームページ `https://reol.twilightea.com/`、プライバシーポリシー `https://reol.twilightea.com/privacy/`、承認済みドメイン `twilightea.com`。その後「対象」で本番に push し、ログインし直す。ドメインの所有確認(Search Console)を求められる可能性がある。
