# 29. 楽曲記事(読みもの)の実装

起点: `Reol_記事実装設計書_Claude引継ぎ_v1.docx`(2026-10-09、以下「設計書」)。
本書は設計書の「実装時に確定」項目をリポジトリ調査で確定した記録と、初回実装(Boy / No title)の範囲・結果をまとめる。
本文の改稿・公開判断・掲載slug・公開日・著者表示は編集上の決定として**ユーザーに残す**。

## 1. 現行調査の結果(2026-10-09 時点で確認)

| 項目 | 確認結果 | 記事機能での扱い |
| --- | --- | --- |
| Gatsby | `gatsby@^5.13.7`(package.json) | 既存のまま拡張。Next.js移行・CMS・DBは入れない |
| Markdown | `gatsby-transformer-remark` は依存にあるが未設定。既存の `src/data/articles/parseMarkdown.ts` は独自パーサでインラインリンク非対応 | 依存ツリーに既にある `unified@9` + `remark-parse@9` を明示依存にし、ビルド時にmdastへ変換。MDXは不要 |
| 曲ページ | `/songs/<slug>/`。songStatsのslug、代表uuidは `buildCanonicalUuidMap`(src/utils/songMatcher.ts) | `source_song_uuid` → 代表uuid → 曲ページ。曲名一致は使わない |
| 多言語 | `isLocalizedRoute` に `/articles/` は含まれない | 記事は日本語のみ。`createPage`(ロケール複製なし) |
| サイトマップ | `gatsby-plugin-sitemap`。存在するページから生成 | 未公開記事はページ自体を作らない |
| 公開経路 | ローカル `npm run deploy`(gh-pages)。`scripts/check-deploy-ready.ts` が事前検査 | プレビュー用環境変数が立っていたらデプロイを止める検査を追加 |
| リポジトリ | GitHub上で**公開**(未認証APIで200) | 未公開本文・Docs/DriveのID・承認記録はgitに入れない |
| 管理表へのアクセス | repoの `token.json` は別アカウントで管理表を読めない(Sheets API 403) | 手渡しファイル(CSV)を入力にする取込経路を用意 |

## 2. 置き場所と公開/非公開の分離

公開リポジトリのため、設計書4章の「リポジトリへの配置案」を次のように調整した(理由: 未公開原稿をGitHubに出さないため)。

| 場所 | git | 中身 |
| --- | --- | --- |
| `.articles-local/inbox/` | 除外 | 手渡し入力。管理表の `記事.csv` `song対応.csv`、掲載用Markdown(Driveのファイル名のまま) |
| `.articles-local/staging/<article_id>/` | 除外 | 検証済みスナップショット `body.md`、取込記録 `record.json`(版・ハッシュ・文書ID)、編集用 `meta.json` |
| `.articles-local/reports/` | 除外 | dry-run / 取込結果のレポート |
| `content/articles/<article_id>/` | **対象** | 公開を決めた記事だけ。`body.md` と公開用 `meta.json`(Docs/DriveのIDを含まない) |

- 通常ビルドは `content/articles/` の `status: "published"` だけを読む。
- `ARTICLES_PREVIEW=1` のときだけ staging も読み、プレビュー表示(noindex・サイトマップ除外)する。デプロイ前検査はこの変数があると失敗する。
- 公開(staging → content)は `scripts/articles/publish-song-article.ts` を明示実行したときだけ。slug・公開日が未確定なら拒否する。

## 3. 取込処理(`scripts/articles/import-song-articles.ts`)

1. 管理表CSVを列名で解決(列位置を固定しない)。TRUE/FALSE/空欄 → true/false/null。
2. 対象 `article_id` を明示指定(既定で全件にはしない)。
3. 制作データJSONの掲載記録を4種のキー(`publication_markdown` / `markdown_publication` / `markdown_export` / `publication_format`)から正規化。複数あって中身が違えば保留。
4. 本文版・承認版・掲載記録の `source_revision` / `approved_revision` の一致を確認。本人合格 TRUE 以外は保留(自動合格だけでは公開候補にしない)。
5. inbox のMarkdownを掲載記録のファイル名で探し、sha256を算出。記録にsha256があれば照合。
6. song対応から uuid を集め、JSONの `source_song_uuids` との差を報告(管理表には書き戻さない)。
7. dry-runで 追加/変更/変更なし/保留 を出す。本番実行は一時ディレクトリに書いてから差し替え、失敗時は既存スナップショットを残す。

## 4. 表示

- `/articles/` 一覧、`/articles/<slug>/` 記事。本文はビルド時にmdastから安全な描画用ツリーへ変換し、Reactで描画(生HTMLは描画しない・http/httpsリンクのみ)。
- 先頭H1をページの唯一のH1として抽出(文言は保持)。冒頭の「MVを観る」リンクは、そのURLが対象曲の `musicVideoUrl` と同じ動画IDのときだけメディア部品にし、リンク自体も残す。
- メディアはクリックで読み込むYouTube(自動再生なし)。JSなしでも公式リンクとして使える。
- 曲ページから対応記事への逆引きリンク(公開記事のみ)。
- **記事ごとに独自のデザインにすることが要件**(2026-10-09 ユーザー指定。「作ってよい」ではない。9章)。現在の表示は既存B案トークン(bx-*)で読みやすさを優先した**仮の共通テンプレート**で、共通の骨格(本文幅・行間・見出し階層・導線)の土台にすぎない。記事別デザインは未着手(MV等の素材は視聴していない)。

## 5. 初回対象

| article_id | 曲番号 | 曲 | 本文版=承認版 | 掲載形式 | 記録キー | sha256 |
| --- | --- | --- | --- | --- | --- | --- |
| reol-song-080 | 095 | Boy | 1 = 1 | 1 | `markdown_publication` | 記録なし(取込時に算出) |
| reol-song-006 | 006 | No title | 2 = 2 | 1 | `publication_markdown` | 記録と一致 |

### 取込結果(2026-10-09)

- Boy(reol-song-080)・No title(reol-song-006)を staging に取り込み済み(status は review、slug は article_id の仮置き、公開日は未設定)。再実行は「変更なし」で、記事・slug は増えない。
- 本文・段落順・リンク(Boy 4件 / No title 5件)の文言とリンク先が原文と一致することを照合済み。冒頭のMVリンクはどちらも登録済みの公式MVと動画IDが一致したため、クリックで読み込むメディア部品にした(リンク自体も残す)。
- song対応のuuid(Boy 3件 / No title 5件)は制作データJSONの `source_song_uuids` と一致。曲ページは `/songs/boy/` `/songs/no-title/` に解決。
- 本人合格19件の dry-run: 取込可能は上記2件のみ。残りは掲載用Markdownが未入手(14件、必要なファイル名・Drive IDはレポートに出る)、掲載記録なし(secret trip・美辞目録)、`source_revision` 欠落(真空オールドローズ)で保留。Driveのファイル名もIDも記録されていない記事(ミュータント・切っ先・二等星)はLibraryから書き出したファイルを inbox に置けば、ファイル名一致で取り込める。

## 6. 検証結果(2026-10-09)

| 項目 | 結果 |
| --- | --- |
| 単体テスト | 全18スイート・107件合格(楽曲記事分33件: 3状態・キー揺れの矛盾・版不一致・H1二重・危険なリンク、公開分だけの読込・公開版優先・slug重複停止、Article構造化データを合成データで確認) |
| 型チェック | `tsc --noEmit` 合格 |
| プレビュービルド(`ARTICLES_PREVIEW=1`) | 記事2件・一覧を生成。noindex、canonical、静的HTMLに本文あり(JSなしで読める) |
| 通常ビルド | 記事0件。`public/` 全体(HTML・JS・page-data・サイトマップ)に本文の文・記事URL・文書IDとも0件、`/articles/` 自体なし |
| 画面 | 320px / 390px / PC で記事・一覧に横はみ出しなし。MVは自動再生せず、クリックでプレイヤーを読み込む。Tabで再生ボタンに移ると黄色の枠が出る。画像は `.articles-local/screenshots/`(git管理外) |
| 公開経路 | 一時ディレクトリで `articles:publish` を実行し、本文がバイト一致・公開用JSONに文書ID等なしを確認(リポジトリの `content/` は未作成) |
| 未検証 | 文字拡大、長い曲名・長い出典での表示、`npm run articles:preview`(develop経由)の起動、公開記事での構造化データ・サイトマップ掲載の実ビルド |
| デプロイ前検査 | `ARTICLES_PREVIEW` が立っていると停止することを確認 |

### 見つかった既存の不具合

- **静的HTMLにNUL文字(\x00)が混入する → 修正済み(2026-10-09)**: React 18.3.1 のサーバー描画(`react-dom/server` の `writeStringChunk`)が、2048バイトのバッファ末尾にマルチバイト文字が収まらなかったとき、未使用分の0バイトごとバッファを書き出すため。本番の既存ページ(例: /songs/boy/)にもあった。`gatsby-node.ts` の `onPostBuild` で、ビルド後のHTMLから NUL だけを取り除く(UTF-8 の文字に 0x00 は含まれないので本文は元に戻る)。通常ビルドで 470 ファイル・895 バイトを除去し、除去後の `public/` の HTML・JSON・JS に NUL は0件。修正前に控えた7ファイルは「NULを除いた修正前」と完全一致。
- 記事ページ(第2階層)ではサイト共通の小さな動画プレイヤーが右上に出て、スマートフォンではプレビュー表示の帯に重なる(既存の共通部品の挙動)。
- `/songs/no-title/` は 320px で文書幅が366pxになる。はみ出す要素は見当たらず、記事導線のある `/songs/boy/` では起きないため今回の変更とは別要因(原因未特定)。

## 9. デザインの要件と引継ぎの差分(2026-10-09)

### 要件

- **楽曲記事は記事ごとに独自のデザインにする。** 共通テンプレートのままでは完成・公開候補にしない。
- 引継ぎ設計書3章と元資料(S1・S2)はいずれも「作ってよい/優先できる」と書いており、要件として伝わっていなかった。

### 設計書に引き継がれていなかったこと(元資料 S1「Reol楽曲記事の制作方針.md」・S2「音楽記事のWebデザイン知見.md」にのみある)

1. 検討の順序: 素材の特徴 → 記事で伝える意味 → 配色・書体・構図・動き。S2の確認手順6段階(使う原稿とMVを確定し未見素材を明記/観察と解釈を分けて記録/同じ内容で配色の役割と面積だけを比べ一度に全部変えない/短い章・長い章・隣接章で確認/スマホ・文字拡大・リンク・映像未読込・動きなしを確認/見本の承認と実装・公開の許可は別)。
2. 品質目標と進め方: Awwwards・Webby・FWA の水準を目標に、**自分で点検と改善を繰り返してから提示する**。曲との関連性・読みやすさ・操作性・スマホ体験も確認し、静止画の評価と実装後の検証を区別する。
3. 知見: 色に役割を割り当てる(背景・本文・補足・リンク・曲の強調色。章の色を変えてもリンクの意味は安定)/共通骨格は保ち章の入口や映像の扱いで強弱/グラデーションは中間色と補間方式(Oklab・OkLCh)まで設計し読書中に不要な色変化を起こさない/読む順序を強制するスクロール演出を安易に入れない・動きなしでも成立。
4. 作品理解の手順: YouTubeコメントを補助資料として読む方法と、Boyで得た未確定の手掛かり(コメント由来であり直接の観察ではない)。
5. 動きの検証が必要なら実装で確かめる。

S4(記事基盤と人物紹介連載の既存計画)と S3補足(実行管理ページ)は ChatGPT 上の資料で開けず、デザインの記述の有無は未確認。

### 実装への影響(未決・要相談)

- 記事別デザインを差し込む仕組み(本文データとは独立させる)。方式は未決定。
- 公開の条件に「その記事の独自デザインがある」を加える(`articles:publish` で確認する等)。
- 検討の材料: 私(Claude)はMVを視聴できない。見られるのは静止画・原稿・公式の説明・コメント等。映像の印象はユーザーからの提供が必要。

## 7. 後回し(本書の範囲外)

- トップ・共通ナビの入口: 公開記事が0件のうちは出さない。初回公開時に追加する。
- 記事別デザイン(要件。9章)。検索・カテゴリ・RSS・連載。
- 残り17件の取込(同じ手順で `--ids` を増やす)。
- 編集上の決定(ユーザー): 公開する記事と順序、slug、公開日、著者表示、一覧の紹介文(現状は本文の最初の段落を表示)、`/articles/` 一覧の説明文(仮に Claude が書いた1文)。

## 8. 運用手順

1. 管理表の「記事」「song対応」シートをCSVで書き出し、`.articles-local/inbox/記事.csv` `song対応.csv` に置く。掲載用Markdownも同じ場所に置く。
2. `npm run articles:import -- --ids <article_id,...> --dry-run` で確認 → `--dry-run` を外して実行。
3. `npm run articles:preview` でローカル確認(`ARTICLES_PREVIEW=1 npm run develop`。未実行のため要確認)。確実なのは `ARTICLES_PREVIEW=1 npm run build` → `npx gatsby serve`(検証済み)。終わったら通常ビルドで `public/` を戻す。
4. 公開を決めたら `.articles-local/staging/<id>/editorial.json` の slug・slugProposed・publishedAt を決め、`npm run articles:publish -- --id <id> --revision <本文版>`。`content/articles/` の差分を確認してコミット。デプロイはユーザーの指示があるときだけ。
