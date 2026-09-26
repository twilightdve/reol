# 27. サイト課題の棚卸しと改善プラン(2026-09-27)

作成日: 2026-09-27
ステータス: 調査完了、提案段階(コード変更は未着手)

## 0. 前提と方法

- plan/01〜26 と [legit-improvement-plan.md](./legit-improvement-plan.md)(07-26)の提案は、旧フェーズ1〜4と新規案A/B/C/E/F/H/I/Jの大半が実装済み。本書は**前回(07-26〜07-30)以降の変化と、まだ指摘されていない問題**に絞る
- legit-improvement-plan.md §6「見送るもの」は再提案しない
- 根拠: 2026-09-27 時点の本番サイト実測(curl で全主要ページ・On This Day 全365ページを取得、Chrome で目視)、コード実査、Supabase の advisor とテーブル一覧(読み取りのみ)
- **未確認の範囲**
  - GA4: analytics-mcp が今回のセッションでは接続に失敗した。数値は plan/24(07-29時点)を参照
  - モバイル表示: ブラウザのリサイズが効かなかったため確認できていない

確度のラベル:

| ラベル | 意味 |
|---|---|
| **確定** | 実測またはコードで確認した |
| **要確認** | 定義ファイルや外部観察だけに基づく |
| **提案** | 設計上の提案 |

---

## 1. 課題一覧

### P0-1 本番が未コミットの作業ツリーからビルドされている【確定】

- 本番トップの新しいタグライン「これまでと、これからを知る」は、HEAD の `HomeSection.tsx` に無く、作業ツリーにだけある
- 本番の app.js に含まれる「マイページ」「user_collections」も HEAD には無い。未コミットで未レビューの機能(ログインまわりとコレクション同期を含む)がすでに公開されている
- 最終コミットと最終デプロイはどちらも 07-29。それから2か月、ソースコードで35ファイル・+1,829/−1,860 行が未コミットのまま
  - 主な中身: /live/compare・tour-heatmap・similarity-ranking、ソーターのトーナメント化、plan/26 の JSON-LD、アカウント系のモーダル群
  - static/ の再生成データはこの数に含めていない
- DBスキーマも git とずれている。`get_collection_count` は本番DBにあるが、その migration は未コミット
- `predeploy` は `gatsby build` を直接呼ぶため、`prebuild` の `generate:relive` を通らない。作業ツリーにある生成物がそのまま本番に載る
- main は58コミット遅れている。ブランチ名 `feature/phase5-six-degrees` と中身が合っていない。CI は無く、テストは5本
- **リスク**: 本番を git から再現できず、ロールバックもできない

### P0-2 認可設計の見直し【本番DBで確定・緊急/詳細は非公開メモ】

リポジトリが公開されているため、具体的な内容はここに書かない。対応はステップ1を参照。

### P0-3 インデックス品質【確定】

- robots.txt の `Sitemap: /sitemap.xml` が404になる。実体は `/sitemap-index.xml`
- On This Day 365ページのうち **172ページ**が「記録はまだありません」だけの空ページなのに、index 可のままサイトマップに載っている。全数を取得して数えた結果で、サイトマップ734URLの約23%にあたる
  - 旧3-10のフォールバックは HOME のウィジェットにしか無く、`src/templates/on-this-day.tsx` には無い
- noindex を付けた `/design-preview/*`(5ページ)、`/cgraph/`、`/quiz/bbq2025*` がサイトマップに載っている。`gatsby-config.ts` の sitemap の `excludes` は /relive/ だけ
- `SEO.tsx` に canonical が無いため、`?section=` 付きURLが重複扱いされうる

### P1-1 全ページに約1MBのCSSがインラインで入っている【確定(原因の一部は推定)】

- 全ページのHTMLが1.04〜1.29MBあり、gzip 後でもトップは568KB
  - base64 のフォントが約590KB(Noto Sans JP 430KB / Klee One 143KB / Cormorant / Niconne)
  - 残りの約420KBは Tailwind・leaflet・cgraph・relive などの共通CSS
- 原因
  - `gatsby-browser.tsx:1-4` が @fontsource の4書体を全ページで import している
  - CSS はどこで import しても1つの `styles` チャンクにまとめられ、各HTMLに `<style>` として埋め込まれる
  - Gatsby のフォント用ローダーは url-loader で上限 `limit: 10000` のため、10KB未満のサブセットが base64 に変換される。Noto Sans JP は124分割のうち31個が該当し、woff と woff2 の両方が入る
- 実際の使われ方
  - Klee One は bbq2025 の4ページだけ
  - Niconne はどこからもルーティングされていない `components/fs` だけ
  - Cormorant はロゴだけで、webfonts プラグインがすでに配信している
  - Noto Sans JP は font stack の順番が system-ui / Hiragino より後ろ。B案(plan/15 W5)でも和文はシステムフォントが前提なので、意図して採用したものではない。Mac/iOS では実質使われていない(Windows/Android ではフォールバック先になりうる。推測)
- フォントの供給元が2系統ある。webfonts プラグインは Cormorant と、使われていない Noto Serif JP を全ページで preload し、@fontsource は base64 でインライン化している
- 全ページに入る不要なCSS
  - leaflet(15KB)・relive(29KB)・cgraph(15KB)。どれも一部のページでしか使わない
  - `tailwind.config.js` が `node_modules/flowbite-react/**` をまるごと走査している
- app.js は gzip 後 230KB。全ページ共通のJSに入っている不要物
  - supabase-js: `useCollectionOwned.ts` の静的 import があるため、AuthContext 側の動的 import が効いていない
  - qrcode.react
  - flowbite 本体: `layout.tsx` が `initFlowbite()` を呼んでいるが、対象の data-* 属性はコード中に1つも無い
  - i18next: 使っているのは美辞学ナビ系だけ

### P1-2 ビルド時に生成した静的HTMLとブラウザで違う画面を描いている【静的HTMLで確定/実害の程度は要確認】

※ 本サイトは SSG(`gatsby build` で静的HTMLを生成し GitHub Pages で配信)で、サーバーでの SSR は使っていない。ここで言う不一致は、ビルド時に生成された静的HTMLと、ブラウザでの hydrate 後の描画の食い違いのこと。

- `body.tsx:101` の `useState(getInitialPathname)` は `gatsby build` の静的HTML生成時(`window` が無い)に `""` を返す
- そのため /cgraph/・/relive/・/live/heatmap/・/bijigaku-navi などの静的HTMLに、ファンサイトのヘッダーとフッターが入る。ブラウザ側では別の画面に描き直している
- 実測: 3ページの静的HTMLに OFFICIAL LINKS が含まれていた
- 影響: ハイドレーションの不一致、表示のちらつき、クローラーが見る内容のずれ

### P1-3 Tailwind の content 漏れ【確定(コード)】

- `tailwind.config.js` の `content` に `src/templates` と `src/features` が入っていない
- そのため `on-this-day.tsx`(`bg-black/25` など)や `reol-type-detail.tsx` の一部のクラスが生成されていない
- テンプレートの13クラスは、design-preview がたまたま同じクラスを使っているおかげで生成されている。**design-preview を外す前に content を直す必要がある**
- `darkMode` が未指定(= media)なので、`dark:` の721か所はサイトのテーマ切り替えではなく OS の設定に従う。テーマ切り替えとの関係は要確認

### P1-4 Service Worker が古い版を出し続ける【コードで確定/体感は要確認】

- gatsby-plugin-offline に `onServiceWorkerUpdateReady` が無いため、デプロイ後も古いHTMLやデータが表示されうる
- 1MBを超えるHTMLがそのままキャッシュされる

### P1-5 データの鮮度がビルド頻度に左右される【仕組みは確定/影響は要確認】

- Sheets のデータはビルド時に取得している
- 07-29 以降は再ビルドしていないので、それ以降の告知や公演は本番に反映されていない可能性がある。具体的な取りこぼしは未確認

### P2 残っている価値の高い既存提案(状況を更新)

- `/features/` ハブと HOME 入口の3階層化(旧4-1/3-3)。作業ツリーの HOME の MORE TOOLS はカードが8枚まで増えている
- 公演・On This Day ページのOG画像(旧4-5)。曲ページ用は `scripts/generate-song-og.ts` で生成済み
- 案K「生で聴いた曲 N/M」とシェアカード(plan/25 §1・§6 とまとめて)
- 関連ポストの日付差分ラベル(旧3-9)
- plan/26 の JSON-LD(未コミットで実装中)と FAQPage の拡張、データセット公開(旧4-7)
- 小物
  - Immitation の綴り(tracks.json)
  - /posts/ が横断検索に出ない
  - Relive のβ表記と失敗時の表示(旧3-11)

### P3 コードの健全性とアクセシビリティ【確定(コード)】

- **テスト**
  - `jest.config.js:19` が `moduleNameMapping` になっている(正しくは `moduleNameMapper`)。このため CSS のモックと `@/` エイリアスが効いていない
  - `jest.config.new.js` は同じ内容の重複
  - テストは5本で、`src/utils` のテストは無い。`tsc --noEmit` はエラー0件
- **依存関係**
  - 未使用: @amcharts、Google Maps 系3つ、html2canvas、react-player、colorthief、canvas-confetti、react-ga4、redux-logger、canvas、false
  - 置き場所の修正: googleapis と @google-cloud/local-auth は devDependencies へ、@reduxjs/toolkit は dependencies へ
  - Redux の Provider が二重になっている
- **残骸**
  - `bk/fs` と `src/components/fs` が重複していて、どちらもルーティングされていない
  - `posts.ts` の `/fs/20240817/` はリンク切れ
  - `LiveWorldMap.tsx` は未使用、`src/data/venues.ts.old` は残骸
- **スラッグ**: `/songs/0/`(-#000000-)のように、シート由来で URL に向かないスラッグがある。GitHub Pages ではサーバー側でリダイレクトできないので、変える場合はクライアント側のリダイレクト用スタブが必要
- **アクセシビリティ**
  - aria-label の無いアイコンボタンが約22個
  - 代わりの表示が無い `focus:outline-none` が5か所
  - bbq2025 に alt の無い画像がある
  - 旧色 `#D2AF57` は白背景でコントラスト比2.1
  - `global.scss` のアニメーションが reduced-motion に対応していない

---

## 2. 改善プラン(実行順)

**制約**
- main へのマージ・push とデプロイはユーザーだけが行う。作業は feature ブランチで進める
- GitHub Pages ではサーバー側のリダイレクトができない
- 認証・DBの変更と外部への送信は、事前にユーザーの確認を取る

### ステップ0: 作業中の変更の救出と再現性の回復(半日・最優先)

1. 未コミットの差分をテーマごとのブランチに分ける
   - `feature/setlist-compare`: 3ページと gatsby-node の事前計算
   - `feature/auth-collection-sync`: アカウント系のモーダル・コレクション同期・migration
   - `feature/sorter-bracket`
   - `feature/jsonld-geo`
   - `chore/remove-legacy-timeline`
   - データ更新(static/data・relive/generated・og)
2. 未コミットの Supabase migration もコミットし、本番DBとの差分を記録する
3. 各ブランチで `npm run typecheck` と `npm test` を通す
4. デプロイのガードを入れる
   - `predeploy` を `npm run build` 経由に変え、`generate:relive` を通るようにする
   - 作業ツリーが dirty ならデプロイを止める
5. ユーザーが main にマージしたら、以後は main のクリーンなコミットからだけデプロイする。`feature/auth-collection-sync` はステップ1が終わるまでマージを保留するのがおすすめ

### ステップ1: 認可設計の見直し(1〜2日)

- 方針はユーザーが決定済み(独自認証を維持し、サーバー側のトークンで検証する)
- 手順
  1. 本番DBの実際の定義を読み取りで確認する
  2. migration を作る
  3. Supabase CLI のローカル環境か開発ブランチで検証する
  4. ユーザーの承認を得てから本番に適用する
- 詳しい内容は非公開メモに記載。migration のコミットメッセージや PR の説明文も中立的な表現にする

### ステップ2: SEO の即効修正(2〜3時間)

1. **最初に** `tailwind.config.js` の `content` に `./src/templates/**` と `./src/features/**` を追加する(P1-3)
2. `gatsby-config.ts`
   - robots-txt の `sitemap` を `${siteUrl}/sitemap-index.xml` に直す
   - sitemap の `excludes` に `/cgraph/` と `/quiz/bbq2025*` を加える
3. `/design-preview/*` を本番ビルドから外す(ユーザー決定)。`gatsby-node.ts` の `onCreatePage` で、production のときに `deletePage` する
4. `SEO.tsx` に canonical を追加する(クエリの無い正規URL)
5. On This Day の空の日
   - `gatsby-node.ts` の On This Day 生成部で、出来事が0件かどうかを context に渡す
   - テンプレートの Head に `noindex,follow` を出し、サイトマップからも外す
   - 本文には既存の `shiftMonthDay` を使って「前後±7日の出来事」を表示し、行き止まりをなくす

### ステップ3: CSS・フォント・共通JSの軽量化(1日)

1. `gatsby-browser.tsx:1-4` の @fontsource の import を削除する
2. `gatsby-config.ts` の webfonts 設定から、使っていない Noto Serif JP を削除する
3. Klee One は bbq2025 の `Head` で `<link>` として読み込む。ページ側で import してもグローバルCSSに入ってしまうため
4. Noto Sans JP は撤去し、システムフォント優先の stack のままにする。Windows での見え方を確認し、必要なら base64 にしない形でセルフホストする
5. flowbite-react の glob を、実際に使っている Timeline / Spinner / Badge / Button に絞る
6. 共通JSを減らす
   - supabase を動的 import に戻す
   - `initFlowbite()` を削除する
   - i18next を美辞学ナビ配下だけで読み込む
7. 余力があれば
   - `onPreRenderHTML` で `<style>` をハッシュ付きの `<link>` に置き換え、ブラウザにキャッシュさせる
   - ページ限定のCSSをページ単位に分ける

**目標**: トップのHTMLを1.06MBから300KB未満にし、`data:font` を0件にする

### ステップ3b: 表示の正しさ(半日)

- `body.tsx` で、ビルド時の静的HTML生成でも pathname を初期値として使えるようにする(静的HTML生成用の `gatsby-ssr.tsx` の引数 `pathname` か、`wrapPageElement` の `props.location` を渡す。サーバー側の処理は増えない)
- gatsby-plugin-offline に更新時のリロード処理を加える。gatsby-plugin-remove-serviceworker に移行するかはユーザーが判断する

### ステップ4: データの鮮度(ユーザー判断が必要)

- 案: GitHub Actions で毎日ビルドして gh-pages にデプロイする。Sheets の認証情報を Secrets に登録する必要があるので、ユーザーの判断が要る
- 当面は、告知があったときの手動再ビルド手順を README に書いておく

### ステップ5: P2・P3 を順に

1. `/features/` ハブを作り、MORE TOOLS をテキストリストにする
2. 公演・On This Day のOG画像
3. 案K(ステップ1のあと)
4. 関連ポストの日付差分ラベル
5. 小物

並行して P3 を進める:
- jest の設定を直し、`src/utils` に最小限のテストを足す
- 未使用の依存と残骸を削除する(削除は事前に確認する)
- アクセシビリティの修正(aria-label・フォーカス表示)

---

## 3. 検証方法

| ステップ | 確認すること |
|---|---|
| 0 | `git status` がクリーン。各ブランチで `npm run typecheck` / `npm test` / `npm run build` が通る(実行前に `lsof -i :8000` で develop が止まっていることを確認) |
| 1 | 非公開メモの検証手順に従う。`get_advisors(security)` の警告が減ること、既存のログインとコレクション同期が手動で動くこと |
| 2 | `public/robots.txt` の Sitemap 行。`public/sitemap-0.xml` に design-preview と空の日が無いこと。空の日のHTMLに noindex があること |
| 3 | `public/index.html` のサイズと、`<style>` 内の `data:font` の件数。bbq2025・on-this-day・reol-type 詳細の表示を Chrome で確認する(クラスの欠落が無いこと) |
| 3b | `public/cgraph/index.html` などにファンサイトのフッターが含まれないこと。コンソールにハイドレーションの警告が出ないこと |
