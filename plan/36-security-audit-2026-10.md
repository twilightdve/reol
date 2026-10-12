# 36. 脆弱性の点検(2026-10-12)

GitHub の push 時の表示(Dependabot: 510件、critical 18・high 256)をきっかけに点検した。
並べ方は npm の重要度ラベルではなく、**このサイトで実際に外から突かれうるか**の順。

## 前提: このサイトの攻撃面

- 公開サイトは `gatsby build` で作った静的ファイルを GitHub Pages に置くだけ。サーバー側のプログラムは動いていない。
- 外から書き込める場所は **Supabase(DB と RPC 関数)** だけ。サイトは独自のセッショントークン(`x-session-token`)で本人を確かめる。
- npm の脆弱性の大半は、ビルド・テスト・開発サーバーの道具(gatsby・jest・webpack・画像圧縮)の中にあり、訪問者のブラウザには届かない。
  影響があるのは、主に「この Mac でビルドや開発サーバーを動かしている時」。

## 1. Supabase(本番のデータ) — 問題なし

読み取り専用の接続で確認した(変更はしていない)。

- 全テーブルで RLS(行単位の制限)が有効。書き込みのポリシーはすべて `user_id = request_session_user_id()`(本人のセッションのみ)。
- `profiles.password_hash` は anon・authenticated とも読めない(列の権限なし)。
- `user_sessions`・`article_likes` はテーブルに直接触れない(関数経由のみ)。
- Supabase の警告「ログインなしで SECURITY DEFINER 関数を呼べる」(21件)は、すべて意図どおり:
  - 書き込み系(`change_user_id`・`delete_account`・`update_user_password`・`update_venue_encounter`・`reset_all_venue_encounters`)は、関数の中で本人のセッションを確かめている。パスワード系は試行回数の制限つき(`_verify_password_with_limit`)。
  - 読み取り系(来場者一覧・チェックイン・セトリ投票数など)は、もともと公開している情報を返す。
  - `sign_up_user`・`verify_user_login`・`sign_out` はログイン前に呼ぶ必要がある。

### 要判断(ユーザー): 「非公開」設定が効いていない

- 会場の画面(`VenueSelector.tsx`)には、参加記録を非公開にする切り替え(`profiles.is_public`)がある。
- ところが、`profiles` の SELECT ポリシー・`get_all_attendees`・`get_venue_checkins` は `is_public` を見ていない。非公開にしても、他の人から見える。
- 現時点で非公開にしている人は **0人**(2026-10-12 確認)なので、今漏れているものはない。
- 直すなら SQL の変更が要る(この接続は読み取り専用なので、ユーザーが SQL Editor で実行する)。どこまで隠すか(一覧から外す/名前だけ隠す)を決めてから書く。
- 同様に、`encounter_wants`(誰が誰に会いたいか)は誰でも読める。機能として相手に見せる前提なら問題ない。

## 2. 開発サーバー(この Mac) — 現状の設定では成り立たない

- `npm run develop`(と `articles:preview`)は `-H 0.0.0.0` で起動するので、同じ Wi-Fi の他の端末からつながる(iPhone での確認用)。
- 中の webpack-dev-middleware(4.3.0)に high の「パストラバーサル(ファイルの読み出し)」がある(GHSA-g84c-rxfj-3j2c)。直った版は 7.4.5 で、gatsby 5 では上げられない。
- ただし成り立つ条件は「publicPath の末尾がスラッシュでない」こと。gatsby の開発サーバーの publicPath は `/`(`GATSBY_WEBPACK_PUBLICPATH` 未設定)なので、**この構成では成り立たない**。
- 別の問題として、開発サーバーには未公開の原稿(プレビュー)も出る。カフェなど知らない人と同じ Wi-Fi で使う時は、`-H 0.0.0.0` を外す(`npm run start` は localhost のみ)ことを勧める。

## 3. npm の依存(ビルド・開発の道具)

### 実施: `npm audit fix`(互換性を壊さない更新のみ。`--force` は使わない)

| | critical | high | moderate | low | 合計 |
|---|---|---|---|---|---|
| 前 | 7 | 129 | 47 | 11 | 194 |
| 後 | 1 | 82 | 70 | 5 | 158 |

(moderate が増えたのは、更新で依存の木が変わり、別の経路で数え直されたため)

- `package-lock.json` と `yarn.lock` の両方が更新された(npm は yarn.lock があると一緒に更新する)。
- `--force` の提案は採らない。gatsby を 5.12 に下げる、`babel-preset-gatsby@0.12`・`gatsby-plugin-manifest@1.0` という大昔の版に戻す、tailwindcss 4(作り直し)にするなど、サイトが壊れる変更を含むため。

### 残り(critical・high)と扱い

| 残っているもの | 経路 | 扱い |
|---|---|---|
| decompress(critical)・got・cross-spawn・semver-regex・http-cache-semantics | `imagemin-webp-webpack-plugin`(`npm run buildimage`) | 道具ごと外すしかない。`webpack.config.js` は 2025-04 から触られていない。**使っていなければ削除を提案(要確認)** |
| lodash(`_.template`) | `tailwindcss-3d` | 使っていなければ外せる(要確認) |
| webpack-dev-middleware | gatsby の開発サーバー | 上記2のとおり、この構成では成り立たない |
| path-to-regexp・tmp | gatsby | gatsby の更新待ち |
| @graphql-tools/utils・immutable | `gatsby-plugin-typegen` | 型生成の道具。直すには大きい版上げ |
| braces・postcss | tailwindcss 3・gatsby-plugin-sass | ビルド時のみ。直すには大きい版上げ |
| serialize-javascript | `copy-webpack-plugin`(`buildimage` 用) | `buildimage` と一緒に外せる |
| sharp(libvips) | 画像処理(ビルド時) | 扱うのは自分たちの画像だけ。0.35 は大きい版上げ |
| node-forge | `googleapis`(シート取得の開発用) | 相手は Google の正規のサーバーのみ |
| @grpc/grpc-js | `firebase`(Node 用の経路) | ブラウザ版の Firestore は gRPC を使わない |
| semver | `babel-preset-gatsby` | ビルド時のみ |

## 4. GitHub の件数(510件)と npm の件数(194件)が違う理由

- GitHub(Dependabot)は `package-lock.json` と `yarn.lock` を別々に数える。npm audit は package-lock.json だけ。
- どちらを正とするか決めれば(このサイトの運用は npm)、yarn.lock を消して件数の重複をなくせる(**削除は要確認**)。

## 対応の状況

- [x] Supabase の点検(問題なし。要判断1件)
- [x] 開発サーバーの脆弱性の成立条件の確認(成り立たない)
- [x] `npm audit fix`(critical 7→1、high 129→82)。型チェック・テスト 123件 通過
- [x] 本番ビルドでの確認(Mac 再起動後に実施。生成件数は前回と同じ: 記事5・曲128・公演170・On This Day 365、OG 画像も同数。ビルド済みサイトを Chrome と WebKit で開き、HOME・記事・公演・一覧を確認。公演ページのエラー1件は本番でも出ている既存のもの)
- [ ] 要確認: `buildimage`(imagemin・copy-webpack-plugin)と `tailwindcss-3d`・`tailwind-config-viewer` を外すか
- [ ] 要確認: yarn.lock を消すか
- [ ] 要判断: 「非公開」設定を DB 側で効かせるか

## 関連: メモリ不足対策(2026-10-12)

点検中に 16GB の Mac がメモリ不足で落ちた。jest(既定でコア数-1の作業プロセス)・tsc・npm の更新・ビルドを続けて動かしていた。
以後、jest は `maxWorkers: 2`、gatsby の develop/build は `GATSBY_CPU_COUNT=2`、重い処理は1つずつ動かす。
