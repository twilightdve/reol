# 17. 実行計画書: バッチ7 — B案リデザインの全ページ展開

作成日: 2026-07-08
ステータス: **完了(2026-07-08)**
体制: **Sonnet 5メイン**(必要なら自身のサブエージェントに分割委譲)。Fable 5は相談役(下記エスカレーション基準)

## 完了記録(2026-07-08)

ブランチ: `feature/batch-07-redesign-rollout`(`feature/batch-06-redesign-pages`から分岐)

| サブバッチ | コミット | 内容 |
|---|---|---|
| 7a | `28eb981` | welcome.tsx・TimelineSection・xtimeline・PhotosSection・photography |
| 7b | `19add27` | discography一式(DiscographySection + discography/配下6ファイル)。`themeColorPrimary/Secondary`の動的色ロジックは指示通り温存 |
| 7c | `10c61f7` | live一式(LiveSection + live/配下)。`enhanced-timeline-item.tsx`のSetCard静的色をbx化、動的色ロジックは温存 |
| 7d | `0f5c8c1` | PlaceSection/PlaceMap・SectionSkeleton・BackToTopButton |
| 7e | `baa447c` | TrackingFooterをbody.tsx(非除外パス)に集約し個別ページ実装を撤去。7d時点でtone="dark"付与漏れがあったPlaceSectionのEmptyState/ErrorRetry/LoadingSkeletonを追加修正。StaticYoutubeのbg-theme→bg-bx-yellow。trackingFooter.test.tsxの期待クラスを新デザインに追従(バッチ5由来の既存壊れテストも合わせて修正) |

7b・7cはサブエージェントに並行委譲(discography/liveでファイルが排他的なため)、7a・7d・7eはメインセッションで直接実装。

**検証**: 各サブバッチでtypecheck通過。全体まとめでjest全5スイート33件通過、`npm run build`成功、生成HTMLへの`bg-white/[6-9]`等残存なし。

**ブラウザ検証(2026-07-08追加実施)**: playwrightを開発依存に導入(`2c011c9`)し、headless Chromiumで実機相当の確認を実施。
- 下部タブ(TrackingFooter)表示: `/` `/discography/` `/live/` `/place/` `/photos/` `/welcome/` `/songs/stats/` `/search/` の8ページで表示を確認
- 下部タブ非表示: `/cgraph/` `/quiz/reol-type/` `/bijigaku-navi/` `/relive/` `/live/heatmap/` `/design-preview/` の6ページでハイドレーション後に非表示になることを確認(§残課題のSSG初期描画の懸念は、クライアント側で正しく補正されることを実測で確認できた)
- discographyのアルバムカードクリック展開: 動的テーマカラー(`themeColorPrimary`由来のcyan)を保持したまま曲目リストと埋め込み動画が展開されることを確認
- liveのライブカードクリック展開: セトリ(Set 1/Set 2)が展開されることを確認
- discography/liveのタグフィルタピル(#Reol等): クリックで黄色ハイライト+件数フィルタが機能することを確認
- placeページ: Leaflet地図とマーカー46件の描画を確認
- コンソールエラー: bijigaku-navi配下のSupabase fetch失敗のみ検出(本セッションのサンドボックスにネットワーク到達性が無いことが原因の環境起因。バッチ7の変更対象外領域かつコード上の回帰ではない)

**残課題(解消済み)**: `body.tsx`のパス判定によるSSG初期描画時の一瞬の非除外分岐レンダリングは、上記ブラウザ検証によりクライアントhydration後に正しく除外される(除外ページで下部タブが表示されない)ことを実測確認済み。運用上の問題なしと判断。

## 0. 最初に読むもの

1. `plan/16-implementation-plan-b.md` — B案全体計画とバッチ5・6の完了内容
2. `tailwind.config.js` の `bx` トークン(色はこれ以外使わない。hex直書き禁止、rgba()グローのみ例外)
3. **完成済みリファレンス**(見た目とコードパターンの正):
   - トップ: `src/components/index/sections/HomeSection.tsx` + `src/components/redesign/`(GlassCard/Kicker/StatCounter/ExploreGrid/EraChips)
   - 曲詳細: `src/templates/song.tsx` / 統計: `src/pages/songs/stats.tsx` / 検索: `src/pages/search.tsx`
   - クローム: `header.tsx` / `officialFooter.tsx` / `trackingFooter.tsx`(ダーク済み)
4. CLAUDE.md(effort方針: 通常medium)

## 1. スタイル変換ルール(機械的に適用)

| 旧(ライト) | 新(B案ダーク) |
|---|---|
| `bg-white/60〜95` のカード | `bg-white/5` + `border border-bx-line` + `rounded-xl`(または `GlassCard`) |
| `text-shadow` / `text-shadow-venue` | 削除(ダーク背景では不要) |
| 本文 `text-gray-700〜900` | `text-bx-ink` |
| 弱文字 `text-gray-500〜600` | 12px以上=`text-bx-ink2`、12px未満=`text-bx-ink3` |
| `border-gray-200〜300` | `border-bx-line` |
| `bg-theme`(金)のボタン/帯 | CTA=`bg-bx-yellow text-bx-bg`、非CTA=枠線ピル(`border-bx-line text-bx-ink`) |
| `text-letter`(青) | `text-bx-blue` |
| 紫/青緑/虹色などのグラデ装飾 | 撤去し単色アクセント(blue/yellow/blueLight)に |
| セクション見出し | `Kicker`(英字トラッキング見出し)+ `text-bx-ink` のh2 |
| 絵文字アイコン | react-icons v4 の線画系に置換 or 削除 |
| ホバー | `hover:border-bx-blue` / `hover:bg-white/5` に統一 |

**挙動不変の大原則**: GA4計測(trackEvent/trackOfficialLinkClick)・リンク先URL・SEO/JSON-LD・i18n・ダイアログ/展開/ソートのロジック・データ取得は一切変更しない。色とレイアウトのみ。

## 2. サブバッチ分割(この順で。各サブバッチごとに typecheck→コミット)

### 7a: welcome + timeline + photos(軽め・ウォームアップ)
- `src/pages/welcome.tsx`(553行。ERAS紹介・埋め込み枠は `border-bx-line rounded-xl` 化。youtube-nocookie埋め込み自体は不変)
- `src/components/index/sections/TimelineSection.tsx` + `src/components/modules/xtimeline.tsx`(text-shadow-venue除去)
- `src/components/index/sections/PhotosSection.tsx` + `src/components/index/photography/photography.tsx`

### 7b: discography(最大ボリューム)
- `src/components/index/sections/DiscographySection.tsx`
- `src/components/index/discography/`: discography.tsx / enhanced-discography.tsx / enhanced-timeline-item.tsx / timeline-item.tsx / item-song.tsx / song-live-history.tsx
- 注意: 作品ごとの `themeColorPrimary/Secondary` を使う動的色があれば**残す**(バッチ8のダイナミックアクセントの布石)。dialog(実物大表示等)の開閉挙動は不変

### 7c: live
- `src/components/index/sections/LiveSection.tsx`
- `src/components/index/live/`: live.tsx / enhanced-live.tsx / enhanced-live-item.tsx / enhanced-timeline-item.tsx / timeline-item.tsx / live-item.tsx / related-lives.tsx
- セトリ表示・`#live-item-<slug>` アンカー・SetlistPrediction への導線は挙動不変

### 7d: place + 共通小物
- `src/components/index/sections/PlaceSection.tsx` + `PlaceMap.tsx` の周辺UI(**地図タイル・マーカー画像は不変**。infoWindowの吹き出しは可能な範囲で)
- `src/components/common/`: SectionCard.tsx / SectionSkeleton.tsx / BackToTopButton.tsx をダーク対応(tone方式=ErrorRetry/EmptyState参照、または全面ダークでよいか使用箇所をgrepして判断)

### 7e: 下部タブ全ページ常設(P2-1)+白スタイル一掃+最終検証
- `TrackingFooter` を各ページ(index/discography/live/place/photos)のレンダリングから外し、`body.tsx` の非除外パスで常設に移す。**除外パス(bijigaku-navi/quiz/cgraph/heatmap/relive/design-preview)には出さない**。固定フッター分の `pb-14` 程度を本文側に確保
- ROUTE_NAMESベースのタブは現状維持でよい(welcome/songsタブ追加はやらない。回遊はEXPLORE/ヘッダーが担う)
- 仕上げに `grep -rn "bg-white/[6-9]|text-shadow|bg-theme|text-letter" src/` で残存を棚卸し(下記の対象外領域を除く)。残っていたら潰す

## 3. 触ってはいけない領域

- `src/pages/bijigaku-navi/` 配下・和紙テーマ(実質別サイト)
- `src/pages/quiz/`・`src/pages/cgraph.tsx`・`src/pages/live/heatmap.tsx`・`src/pages/relive/`・`src/features/relive/`(独自テーマ、body.tsxの除外分岐対象)
- `src/pages/design-preview/`(モック。歴史的記録として現状凍結)
- `src/components/index/opening.tsx`・`mainVideo.tsx`/`persistentMainVideo.tsx`(バッチ8で演出ごと再設計)
- `scripts/`・`gatsby-node.ts`(今バッチでは変更不要のはず)

## 4. 既知の罠(このリポジトリ固有)

- **gatsby developとbuildの同時実行禁止**。ビルド前に `lsof -i :8000 -sTCP:LISTEN` を確認。壊れたら残プロセスkill+`.cache`/`public`削除
- ビルド/開発サーバがシートを再取得し `static/data/*.json`・`static/relive/generated/*` に差分が出る。**意味のある差分(slug等)以外は `git restore` で戻してからコミット**
- Gatsby Head内で `t()` 使用禁止(翻訳キー露出の実績)。既存Headは触らない
- lintスクリプトなし。`npm run typecheck` で代替
- 公式リンクは確定値のみ(公式YouTube=@reolch)。新規リンクを足さない

## 5. 検証(7e完了時)

typecheck → develop停止確認 → `npm run build` → 生成HTML検証:
`/discography/` `/live/` `/place/` `/photos/` `/timeline/` `/welcome/` にダーククラス適用+旧クラスのマークアップ残存なし(共通CSS定義の残存は無害)、`/`(トップ)と `/songs/*` のリグレッションなし、下部タブが全対象ページに出る/除外ページに出ない。
ブラウザ目視(develop)で: discographyのdialog開閉、liveのセトリ展開、placeの地図とマーカー、モバイル幅での下部タブ。

## 6. コミット規約

- サブバッチ単位でコミット(`feat(redesign): バッチ7a — welcome/timeline/photosのダーク化` の形式)
- ブランチ: `feature/batch-07-redesign-rollout` を最新の `feature/batch-06-redesign-pages` から作成
- 完了したら本ファイルと `plan/16` §6 に結果を追記

## 7. エスカレーション基準(Fable 5に相談)

①同じ問題に2回失敗 ②デザイン判断がbxトークン・リファレンス実装でカバーされない ③原因不明のビルド/データ破損 ④バッチ7完了後の全体レビュー(/code-review でも可)
