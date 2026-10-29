# 58. Claude の動作確認を GA の表示回数に入れない

2026-10-30 ユーザー指定:「Claude が動作確認する際に計測されている GA の PV を除外したい」

## やったこと

- 自動操作のブラウザ(`navigator.webdriver === true`)では GA に送らない。
  - Claude の確認は Playwright(Chromium・WebKit)で開くので、どちらも `navigator.webdriver` が true になる。
  - 止め方は運営ログイン中と同じで、gtag の公式の止め方 `window["ga-disable-<測定ID>"] = true` を使う。
- `gatsby-ssr.tsx` の `<head>` 先頭のスクリプトで、gtag の設定より前に立てる。
- `src/contexts/AuthContext.tsx` はログイン・ログアウトに合わせてこのフラグを切り替える。自動操作のときは、ログインしていなくても解除しないようにした。

## 確かめたこと(本番ビルドをローカルで配信。GA へのリクエストは止めて数えた)

| ブラウザ | 状態 | ga-disable | collect |
|---|---|---|---|
| Chromium | Playwright のまま | true | 0 |
| Chromium | webdriver=false(普通の訪問者を模擬) | false | 1 |
| WebKit | Playwright のまま | true | 0 |
| WebKit | webdriver=false(普通の訪問者を模擬) | false | 1 |

- tsc は通り、jest は 157 件すべて通った。

## 対象外・残り

- **これまでの確認の分**: GA から取る数には、これまでの確認の分がもう入っている。
  - GA4 のデータ API では、自動操作の表示だけを後から見分けられない。
  - 公開前の確認は、公開日時より前を捨てる仕組み(plan/46)で、もともと数えていない。
- **Claude in Chrome**: ユーザーの普段の Chrome を操作するので `navigator.webdriver` は false。この経路は止まらない。
  - 運営アカウントでログインしていれば、既存の仕組みで止まる。
- **ほかの自動操作**: Googlebot など `navigator.webdriver` が true の自動操作も数えなくなる。表示回数の目的(人の閲覧数)には合う。
