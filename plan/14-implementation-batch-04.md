# 14. 実装計画書: 第4バッチ選定(曲詳細ハブ+小物)

作成日: 2026-07-03
ステータス: **実装・検証完了(2026-07-03)** — ブランチ `feature/batch-04-song-pages`(batch-03から積み上げ)。**slug設計の確認事項あり(下記)**
体制: 設計/検証: Fable 5、実装: 曲詳細ハブはSonnet 5、小物はFable 5直接
ブランチ(予定): `feature/batch-04-song-pages`(batch-03から積み上げ)

## 残項目の棚卸しと選定理由

| 候補 | 優先度 | 判定 | 理由 |
|---|---|---|---|
| P1-4: 曲詳細ハブページ | P1 | **採用(A・本命)** | 最終提案トップ10の#8で唯一残る大物。データ検証済み: **130曲・slug全ユニーク・演奏実績113曲**で静的生成可能。stats/検索/セトリ/welcomeを繋ぐ回遊の中心装置になり、「曲名 Reol」検索の受け皿(SEO)にもなる |
| ErrorRetryのENロケール | P2 | **採用(B・小物)** | 第3バッチの積み残し。再試行ボタンがEN表示でも日本語のまま |
| 配信リンクでダイアログが開く挙動 | P2 | **採用(C・小物)** | 調査で発見済みの `item-song.tsx` `handleDownloadClick` のコピペ由来バグ(リンク遷移+不要な `showModal()`) |
| データスナップショット更新 | - | **採用(D・即時)** | developがシートから最新取得(曲127→130等)。コミットして固定 |
| P1-3: ツアーナビ常設化 | P1 | 見送り(要確認) | **美辞学ツアーの会期状況を確認したい**(終了済みなら次バッチ本命候補、開催中なら塩漬け) |
| P2-1: モバイル下部タブバー | P2 | 見送り | 入口カード(第3バッチ)の効果を見てから |
| P3-1: 英語対応本格化 / P3-2: ライブ後モード | P3 | 見送り | 計画どおり将来 |

## 実装内容

### A: 曲詳細ハブページ(/songs/&lt;slug&gt;/)— Sonnet 5

- `gatsby-node.ts` の `createPages` で SongStats から**130ページを静的生成**(pageContextに曲単位のデータを焼き込み — 曲単位ならplays込みでも小さい)
- テンプレート `src/templates/song.tsx`:
  1. 曲名+基本情報(収録アルバムへのリンク、作詞/作曲クレジット)
  2. 演奏統計(通算回数・初披露・最終演奏)+**演奏履歴タイムライン**(全publicな見せ場。各行からライブ詳細 `/live/#live-item-<slug>` へ)
  3. 公式導線: 公式MV(埋め込み1本)・配信で聴く(downloadUrl)・歌詞(uta-net)— `official_link_click` 計測
  4. 回遊導線: 楽曲統計・横断検索・(演奏実績なしの曲は)DISCOGRAPHYへ
- SEO: title=`{曲名}(Reol)`、description機械生成(「通算◯回演奏。初披露は◯年◯月…」)、JSON-LD **MusicRecording**(byArtist=MusicGroup Reol)+BreadcrumbList
- 接続(既存ページの改修):
  - `/songs/stats/` の行展開に「この曲のページへ →」
  - `/search/` の曲ヒットの遷移先を `/songs/<slug>/` に
  - 旧ディープリンク `?songSlug=`/`#song-` は互換維持
- クレジット等の曲メタは discography データと songUuid で結合(welcome.tsx の結合ロジックが先例)

### B: ErrorRetry再試行ボタンのi18n対応 — Fable 5直接

- `ErrorRetry` に `retryLabel?: string` prop(デフォルト「再試行」)を追加し、i18nコンテキスト(SetlistPrediction / quiz分布)では `t()` で渡す。ja/en の common.json に `common.retry` キー追加

### C: 配信リンクのダイアログ誤表示修正 — Fable 5直接

- `item-song.tsx` `handleDownloadClick` から `showModal()` と `overflow-hidden` 付与を除去(計測+stopPropagation+リンク遷移のみに)

### D: データスナップショット更新 — 即時コミット

- `static/data/discography.json` `static/data/live.json` `static/relive/generated/`(シート最新化に伴う再生成)

## 競合設計

- A: `src/templates/song.tsx`(新規)、`gatsby-node.ts`(createPages追記)、`src/pages/songs/stats.tsx`(リンク1行)、`src/pages/search.tsx`(遷移先変更)
- B: `ErrorRetry.tsx`+ロケールJSON+利用2箇所 / C: `item-song.tssx` のみ — A とファイル競合なし(B/CはFableがA起動後に実施)

## 検証(Fable 5)

- diffレビュー → typecheck → **developの停止確認(lsof -i :8000)** → build → 成果物検証: 130ページ生成・曲ページHTML(統計/公式リンク/JSON-LD)・検索からの遷移・リグレッション
- ※ 開始前に batch-02/03 のマージ+デプロイを済ませるのを推奨(本番がまだ第1バッチ以前のため、改善が1つもユーザーに届いていない)

## ユーザーへの確認事項(回答済み 2026-07-03)

1. **美辞学ツアーは開催中**(公式確認: Reol Oneman Live 2026「美辞学」、残り 7/4 愛知・**7/10 東京 LINE CUBE SHIBUYA ファイナル**)→ ツアーナビ常設化は7/10終了後に第5バッチ以降の本命候補として再検討。むしろ会期終盤の今は美辞学ナビ/セトリ予想の需要が最高潮
2. 曲ページURLは **`/songs/<slug>/` で確定**(ユーザー承認)

## 実装結果(2026-07-03)

A=Sonnet 5、B/C/D=Fable 5直接。typecheck・build成功。

| 項目 | 結果 |
|---|---|
| 曲ページ生成 | ✅ **130ページ**(`/songs/<slug>/`、slug="stats"衝突ガード付き) |
| 代表ページ検証(第六感) | ✅ 演奏履歴85件(各行→ライブ詳細リンク)、統計カード、公式MV/配信/歌詞リンク、機械生成description、JSON-LD MusicRecording+BreadcrumbList |
| 演奏実績0曲 | ✅ EmptyStateで空状態表示 |
| 接続 | ✅ 検索の曲ヒット→曲ページ、statsの行展開に「この曲のページへ」(いずれもクライアント描画のためソースで確認) |
| B: ErrorRetry i18n | ✅ `ui.retry`(ja/en)を3箇所に適用 |
| C: 配信リンクのダイアログ誤表示 | ✅ showModal除去 |
| リグレッション | ✅ lang/title/welcome等 |

### slugの品質改善(GAS改修で対応・2026-07-03)

130曲中**51曲のslugがハッシュ状**(uuid末尾12文字フォールバック)だった。原因はGAS `slugify_` が英数字以外を全削除するため日本語曲名が空になること。**`scripts/gas/add-uuid-slug.gs` を改修**(ユーザー提案の方針):

- `makeSlugFromName_`: ①括弧内の公式英題(例: `おとめの肖像 (Portrait of Her)`→`portrait-of-her`)→ ②ASCII → ③**かな→ヘボン式ローマ字**(`ヒビカセ`→`hibikase`)→ ④uuidフォールバック。漢字の読みは誤読防止のため機械推測しない
- `regenerateFallbackSlugs()`: **フォールバックslugのみ**安全に再生成(手動編集slugは温存)、残件をレポート

**残作業(ユーザー操作)**: ①改修版GASをApps Scriptへ反映 → ②`regenerateFallbackSlugs()` 実行(かな26曲が自動修正、漢字含み約24曲がレポートに残る)→ ③残件のslugをシートに手動入力(公式ローマ字)→ ④報告を受けてFableが再ビルド検証。**デプロイ後のslug変更はURL切れになるため、初回デプロイ前に完了させること**

※②は実行済み(2026-07-03のシート取得で確認)。③の支援として **slug候補の自動生成機能を追加(2026-07-06)**: メニュー[UUID 移行]→「slug: 候補を生成」で `slug_suggestions` シートに候補が出る。「採用slug」列に確定値を入力→「slug: 採用slugを反映」で song シートへ反映(slugify正規化+重複は-2連番)。候補を直接自動採用しないのは誤読・誤訳を恒久URLにしないため。

- **候補1 = ローマ字読み**(Google翻訳の翻字+マクロンをou/uu展開。ユーザー方針: 英訳ではなくローマ字)。24曲シミュレーション済み: `rettou-joutou`(公式一致)/`bonnou-yuugi`/`dairokkan` 等は良好。**要手修正の既知例**: 平面鏡(候補空→heimenkyou)、極彩色(gokusai**shoku**誤読→MV候補が正)、宵々古今(yoi-kokon→MV候補yoiyoi-kokonが正)、真空オールドローズ(カナ長音が乱れる)、すゝめ/つづき(susu-me/tsudzuki)
- **候補2 = 公式MVタイトルの英字部分**(oEmbed。gokusaishiki / yoiyoi-kokon / the-sixth-sense / lost-paradise と公式表記どおり取れることを実MVで確認済み。`[Live at …]`等の角括弧は除去)

### 第5バッチ候補メモ

- ツアーナビ常設化+美辞学アーカイブ(**7/10のツアーファイナル後に着手**)
- モバイル下部タブバー(入口カードの計測結果を見て)
- 曲ページの拡張(同時期に演奏された曲・関連曲、Spotify特徴量の表示強化)
