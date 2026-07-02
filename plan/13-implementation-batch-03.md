# 13. 実装計画書: 第3バッチ選定(Issue 11 / 7 / 13 +α)

作成日: 2026-07-02
ステータス: **実装・検証完了(2026-07-03)** — ブランチ `feature/batch-03-welcome-entrycards-stateui`(batch-02から積み上げ。マージ順: 02→03)
体制: 設計/検証: Fable 5、実装: Sonnet 5×3(並列)+小物はFable 5直接
ブランチ(予定): `feature/batch-03-welcome-entrycards-stateui`

## 残項目の棚卸しと選定理由

| 候補 | 優先度 | 判定 | 理由 |
|---|---|---|---|
| Issue 11: はじめてのReol | P1 | **採用(A)** | 新規向け静的入口の欠落は第1バッチ以来の最大の残穴。**曲データに `musicVideoUrl`(公式MV)/`downloadUrl`(reol.lnk.to)/`spotifyTrackId` が既存**と判明し、選曲も演奏統計から機械的に導出可能=コンテンツ作業がデータ駆動でできる |
| Issue 7: トップ入口3カード | P1 | **採用(B)** | 依存先の /welcome/(A)と同バッチなら空砲にならない。「ライブに行く」カードの遷移先も**既存の初参加ガイド記事**(live-tips-first-timer)が使える |
| Issue 13: 状態UI共通化の展開 | P2 | **採用(C)** | 第2バッチで作った LoadingSkeleton/ErrorRetry の展開先が具体化済み(下記)。`data_load_error` 計測も同時に入れる |
| stats行展開に公式送客リンク | P1相当 | **採用(D・ストレッチ)** | 曲データの `musicVideoUrl`/`downloadUrl` を使い「公式MVを見る/配信で聴く」を統計から直結=北極星指標(公式クリック)に直効。データ結合が重ければ見送り可 |
| P1-3: ツアーナビ常設化 | P1 | 見送り | 美辞学ツアーの会期状況が未確認のまま。URL変更を伴うためユーザーと方針確認してから単独バッチで |
| P1-4: 曲詳細ハブページ | P1 | 見送り | 中〜大規模(1〜2週相当)。Dで最小版の価値を先に検証してから |
| P2-1: モバイル下部タブバー | P2 | 見送り | ナビ全体のデザイン判断が必要。入口カード(B)の効果測定後に |
| P3: 英語対応/ライブ後モード | P3 | 見送り | 計画どおり将来 |

## 実装内容

### A: はじめてのReol(/welcome/)— Sonnet 5

- 静的ページ新設。構成: タグライン→年代別代表曲(discography.jsonの releaseDate と songStats の演奏回数上位から機械選定、各曲に公式MV埋め込み or リンク)→「次に聴くなら」分岐(ゴリゴリ/エモ=診断の軸を流用)→診断・楽曲統計・LIVEへの内部リンク→公式サイト/配信への送客CTA
- **埋め込み/リンクは `musicVideoUrl`(公式YouTube)と `downloadUrl`(reol.lnk.to)のみ使用**(権利方針)。アーティスト史の記述はサイト内データから導出できる事実のみ(リリース日・演奏回数)。主観的な紹介文は短く
- SEO: title「はじめてのReol - 入門ガイド」、個別description、BreadcrumbList。公式リンクは `official_link_click` 計測
- 文言トーンは [04-copywriting.md](./04-copywriting.md) に従う

### B: トップ入口3カード+タグライン — Sonnet 5

- `HomeSection.tsx` のMV直下にタグライン1行(「Reolの10年を、ぜんぶ遡れる。」)+3カード:
  1. はじめてのReol → `/welcome/`
  2. ライブに行く → `/live/`(サブリンクで初参加ガイド記事 `/bijigaku-navi/articles/live-tips-first-timer/`)
  3. データを掘る → `/songs/stats/`
- 既存の診断/美辞学ナビバナーとトーンを揃える。クリックは `entry_card_click` 計測(card_typeパラメータ)。モバイル375pxで崩れないこと

### C: 状態UI共通化の展開 — Sonnet 5

第2バッチ製 `LoadingSkeleton`/`ErrorRetry` を以下へ適用+失敗時 `data_load_error` イベント:

- `src/components/index/sections/PlaceSection.tsx`(読み込み中表示あり)
- `src/components/index/discography/song-live-history.tsx`(同上)
- `src/components/modules/SafeTweets.tsx`(同上)
- `src/components/setlist/SetlistPrediction.tsx`・`src/pages/quiz/reol-type/index.tsx` の分布表示(ロード表現の統一。i18n文言は既存キーを維持)
- ※ cgraph/relive/heatmapは独自レイアウトのため対象外(過剰統一しない)

### D: 楽曲統計→公式送客リンク(ストレッチ)— Fable 5直接

- stats行展開部に「公式MVを見る」「配信で聴く」(musicVideoUrl/downloadUrl)。SongStatsノードに該当フィールドが無い場合、gatsby-node側の songStats 生成にフィールド追加が必要 — 差分が大きくなるようなら本バッチでは見送り、Issue化して次へ

## 競合設計(並列実行の担当ファイル分離)

- A: `src/pages/welcome.tsx`(新規)のみ
- B: `src/components/index/sections/HomeSection.tsx` のみ
- C: 上記5コンポーネント(A/Bと互いに素)
- D: `src/pages/songs/stats.tsx`(+必要なら gatsby-node.ts)— Fable 5がC完了後に実施し衝突回避

## 検証(Fable 5)

- diffレビュー → typecheck → build → 成果物検証: /welcome/ のHTML(JSなしで全文可読・公式リンク・埋め込み)、トップのカード表示(375px)、各Loading箇所の3状態、`entry_card_click`/`data_load_error` のコード確認、リグレッション一式
- コミットはIssue単位、マージ判断はユーザー

## 期待効果

- 新規流入の受け皿完成(検索クエリ「Reol おすすめ曲/入門」)+トップ直帰率低下
- 公式送客の面が「フッター+診断出口」から「入門ページ+統計」へ拡大
- 「壊れて見える」箇所の全廃(P0-3の完全クローズ)

## 実装結果(2026-07-03)

Sonnet 5×3体で並列実装(A/Cはセッションリミット中断→SendMessage再開で完走)、DとフッターURL訂正はFable 5直接。typecheck・build成功、成果物検証すべて✅。

### 検証結果

| 項目 | 結果 |
|---|---|
| /welcome/ | ✅ 曲名・演奏回数が焼き込み、埋め込みはnocookie 3本のみ、公式リンクのみ、BreadcrumbList出力 |
| トップ入口カード | ✅ タグライン+3カード+初参加ガイドサブリンクが初期HTMLに出力 |
| 状態UI展開 | ✅ 旧「読み込み中」テキスト消滅、スケルトンがSSRに出力。data_load_error 6種(place_map/song_stats/twitter_widget/setlist_votes/setlist_voters/reol_type_distribution) |
| 統計→公式送客(D) | ✅ page-dataに musicVideoUrl 44曲 / downloadUrl 23曲(リンクは行展開時に表示) |
| 公式YouTube訂正 | ✅ 全コードから @reolofficial1587 残存ゼロ、フッターは **@reolch**(ユーザー指摘による訂正) |
| リグレッション | ✅ title/lang/JSON-LD/i18nキー露出なし |

### 選曲(すべて演奏統計からの機械選定)

- 埋め込み3曲: 第六感(85回)/No title(63回)/赤裸裸(54回)
- 年代別: 極彩色・宵々古今(2015-16)/サイサキ・LUVORATORRRRRY!(2017-19)/SCORPION・Boy(2020-22)/感情御中・切っ先(2023-)
- タイプ軸: ゴリゴリ=煽げや尊し、エモ=1LDK

### 要確認事項(レビュー時に見てほしい点)

1. セトリ予想の「投票者ロード失敗トースト」をインラインのErrorRetryに置き換えた(重複回避)— 意図に合うか
2. ErrorRetryの再試行ボタンラベルはEN切替時も日本語「再試行」(既存ロケールに該当キーがないため。必要ならロケール追加を第4バッチで)
3. 入口カードの絵文字(🔰🎤📊)の世界観適合はデザイン判断をお願いします

### コミット(feature/batch-03-welcome-entrycards-stateui)

048e655(welcome)/ c80e468(入口カード)/ 7f832ad(状態UI)/ 18f0e74(統計→公式送客)/ 9360420(@reolch訂正)/ f483b77(docs)
