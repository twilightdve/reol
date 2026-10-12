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
- [x] 使っていない道具を外した(2026-10-12 ユーザー承認): `buildimage`(`webpack.config.js`・空の `src/index.js`・imagemin-webp-webpack-plugin・copy-webpack-plugin・webpack-cli)と `tailwind-config-viewer`。critical 1→0、high 82→67
  - `tailwindcss-3d` は**残す**。3D用クラスは使っていないが、このプラグインは `translate-*`・`rotate-*`・`scale-*` を個別の CSS プロパティ(`translate`・`rotate`・`scale`)で出力するよう変えている。外すと `transform` での出力に戻り、`transform` を使うアニメーションとぶつかって見た目が変わるおそれがある(ビルドの CSS を比べて判明)。残る lodash の `_.template` は、ビルド中に外部の文字列をテンプレートとして実行する場合にしか成り立たない
  - 外した後のビルドで、CSS が外す前と1バイトも違わないことを確認した
- [x] yarn.lock を削除した(2026-10-12 ユーザー承認。運用は npm。GitHub の件数の二重計上がなくなる)
- [x] 「非公開」設定を DB 側で効かせた(2026-10-12 ユーザー承認・ユーザーが SQL Editor で適用): `supabase/features/supabase-private-venue-selection.sql`
  - 適用後、ログインなしの API から読んで、会場選択 360件・来場者一覧 84人・会場ごとの参加者(例 yamaguchi_rising_hall 13人)が変更前と同じことを確認。Supabase の警告に新しいものは無い
  - 非公開の人が実際に隠れることは未確認(非公開の人が0人のため)

## 関連: メモリ不足対策(2026-10-12)

点検中に 16GB の Mac がメモリ不足で落ちた。jest(既定でコア数-1の作業プロセス)・tsc・npm の更新・ビルドを続けて動かしていた。
以後、jest は `maxWorkers: 2`、gatsby の develop/build は `GATSBY_CPU_COUNT=2`、重い処理は1つずつ動かす。

## 版上げの検討(2026-10-12。ユーザー「メリットがあるのであれば対応したい」)

### 実施: 今の版の範囲内での更新(`npm update`)

- `@supabase/supabase-js` 2.81 → 2.117(ブラウザで動く唯一の外部通信ライブラリ。不具合修正が多い)、gatsby の各プラグインを本体と同じ 5.16 系へ、ほか小さな更新。
- **除外**したもの:
  - `typescript`(5.4 → 5.9 にすると、古い `@types/node` 17 と噛み合わず型エラー15件・テスト1件が失敗。利用者への利点なし)
  - `gh-pages`(6.3 で high が1件増える)
  - `playwright`(確認用の道具。上げるとブラウザの再ダウンロードが要る)
- 確認: 型チェック・テスト123件通過。ビルドの件数は同じ。CSS の違いは Firefox 向けの古い接頭辞 `-moz-fit-content` が消えた6か所だけ(Firefox 94 以降は接頭辞なしで対応)。
  ビルド済みサイトを Chrome・WebKit で開き、記事のいいね数・会場ページ(会場選択・来場者一覧・コメントなど)の Supabase 通信がすべて 200 で、エラーが無いことを確認。

### 版上げで消せない high(gatsby を使い続ける限り残る)

- gatsby 本体はすでに最新(5.16.1)。残る high の多く(path-to-regexp・tmp・webpack-dev-middleware・serialize-javascript・braces・@graphql-tools/utils・immutable・semver・postcss)は gatsby とその公式プラグインの中にある。
  npm の提案(`gatsby-plugin-manifest@1.0.15` など)は大昔の版に戻すもので、採れない。
- `sharp`: 本体を 0.35 に上げても、gatsby の部品(gatsby-sharp)が 0.32 を使い続けるので消えない。扱うのは自分たちのアイコン画像だけ。
- `googleapis`(node-forge)・`firebase`(@grpc/grpc-js): 前者は Google のサーバーとだけ通信するシート取得、後者は Node 用の経路で、ブラウザ版では使われない。版上げは認証の流れを壊す危険の方が大きい。

### 勧めない大きな版上げ(利点より手間と危険が大きい)

| 版上げ | 理由 |
|---|---|
| React 19 | gatsby 5 が React 18 までしか対応していない |
| Tailwind CSS 4 | 設定の書き方が全面的に変わる。flowbite・tailwindcss-3d の対応も要る。見た目の利点はない |
| Redux 5 / RTK 2・react-redux 9 | 状態管理の書き換えが要る。利用者への利点なし |
| TypeScript 5.9 以降・Babel 8 | 上記のとおり型の不整合が出る。gatsby 5 は Babel 7 前提 |
| flowbite 4・lucide-react 1・react-icons 5 など | 見た目・部品の作り直しが要る |

根本的に high を減らすには gatsby からの移行(例: Astro・Next.js の静的出力)が要るが、サイト全体の作り直しになる。今のところ、残る high は利用者に届かないので、移行の理由にはならない。

### 開発サーバー

- 同じ Wi-Fi の iPhone から実機確認するため、`-H 0.0.0.0` は残す(ユーザー指定)。

## 追記: 直近に足した機能の点検(2026-10-12)

ユーザー「デプロイ後、もし直近追加した機能面で脆弱性がないかチェックしておいてください」。対象: いいね(`article_likes`・`get_article_likes`・`set_article_like`・`get_article_like_counts`)、記事末尾(その他の記事)、一覧の並べ替え、動画・地図の埋め込み、OGP 画像の時刻、記事別デザインの部品。

| 重要度 | 内容 | 対応 |
| --- | --- | --- |
| 中 | いいねは誰でも書き込める。ブラウザの ID は押す側が作れるので、作り替え続ければ件数の水増しや大量の行の書き込みができる(ブラウザごとの制限だけでは防げない)。記事 ID も形しか見ていないので、存在しない記事の行も作れる → DB の容量を食いつぶせる | `supabase/features/supabase-article-likes-hardening.sql`: 全体で 1分 60件・1日 2000件の上限、記事 ID を `reol-<種類>-<番号>` の形に絞る、`created_at` の索引。ユーザーが SQL Editor で適用済み(2026-10-13)。適用後、本番の API で、おかしな記事 ID が拒否されること(`invalid article like request`)、いいね・取り消しが今までどおりできること(試した分は取り消して元の件数に戻した)を確認。水増しそのものは完全には防げない(仕様として受け入れ済み) |
| 低 | 動画IDの形を確かめずに、埋め込み・サムネイルの URL に使っていた(原稿は管理された内容) | `youtubeVideoId` で英数字・_・- の11文字だけ受け付ける。テスト追加。公開中の7本の動画IDは変わらないことを確認 |
| 低 | JSON-LD を `<script>` にそのまま書き出していた(`</script>` を含む題名などで抜け出せる。中身は管理された内容) | `<` を `<` に置き換えて書き出す(JSON としては同じ値)。3記事で JSON として読めることを確認 |
| 情報 | いいねの「送れない」時も「読み込めませんでした」と出ていた | 文言を分けた(上限に達した時は「いいねを送れませんでした」) |

問題なしと判断したもの:
- `get_article_like_counts`: 一度に200本まで・記事 ID の形で絞る・数だけを返す。サイトから呼べるが中身は書き換えられない(SECURITY DEFINER・search_path 空)。
- `get_article_likes` は他人のブラウザ ID を知らなければ「押したか」は分からない(ID は無作為な UUID で、その人のブラウザにだけある)。取り消しも同じ。
- 一覧の並べ替えは URL の `?sort=` を `likes` かどうかでだけ見る。`history.replaceState` に渡すのは自分で組み立てた URL。
- 記事末尾・一覧の題名などは React が文字として出す(HTML として差し込まない)。
- Google マップの埋め込みはユーザーが Google で作った URL(Google のドメインだけ)。YouTube は youtube-nocookie でクリックした時だけ読み込む。
- Supabase の性能の警告に、今回の機能に関わるものはない。
- コードの修正(動画IDの形・JSON-LD・文言)は 2026-10-13 にデプロイ(main @ b2ee0eb04)。本番の記事ページで、動画・いいね・JSON-LD(JSON として読める)を確認。
