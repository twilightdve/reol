# 16. 実行計画書: B案「BLACKBOX / CHRONICLE」本実装

作成日: 2026-07-03
ステータス: **計画(着手条件待ち)** — デザインはプレビューで確定済み(plan/15 §5)
体制: 設計/検証: Fable 5、実装: バッチ単位でSonnet 5に委譲

## 0. 確定済みデザイン仕様(plan/15 §3 + ユーザーフィードバック)

- ベース: 黒 `#0b0b10` / 文字 `#f2f0eb`(黒背景維持はユーザー承認済み)
- アクセント: **公式カラーセット(reol.jp実測)の青×黄**
  - 黄 `#e2bf57`: CTA・ハイライト・「現在」
  - 青 `#6b8ce0`(公式 `#27489b` の明度調整版): 構造・リンク・見出し
  - 青 `#27489b` 原色: グロー・面 / 淡青 `#a8c0ff`: 第3アクセント
- タグライン: **「Reolのこれまでを、まるっと遡れる。」**(確定・HomeSectionにも適用済み)
- 主要セクション導線: **EXPLOREグリッド**(DISCOGRAPHY/LIVE/PLACE/PHOTO大タイル)をヒーロー直下に常設
- 仕様のリファレンス実装 = `/design-preview/b/`(`src/pages/design-preview/b.tsx`)

## 1. 着手条件(2026-07-07 すべて解消 → 着手済み)

1. ~~slug整備完了~~ → ✅ 完了(2026-07-07検証済み)
2. ~~ブランチマージ~~ → ✅ mainへFFマージ済み(`bb0b626`)
3. ~~7/10ツアーファイナル後~~ → **撤回(ユーザー指摘)**: このゲートは「本番の見た目を会期中に変えない」ためのものだったが、デプロイをリニューアル完了後に一本化したため開発作業を待つ理由がない

**デプロイはリニューアル(B案)完了後に一回だけ行う**(ユーザー決定)。
→ 途中デプロイはしないため、§3の「前後比較」は本番ベースラインなしの導入後計測に変わる。
　現本番は第1バッチ以前の状態のまま維持される。

## 2. バッチ分割

### バッチ5(B-0+B-1): 基盤+トップページ刷新

**基盤**
- `tailwind.config.js`: `bx` カラートークン追加(`bg/ink/ink2/line/blue/blueDeep/blueLight/yellow` = 上記確定値)
- 和文ディスプレイ書体1種をself-host(候補: Shippori Antique B1、見出し用400のみ・woff2サブセット、`static/fonts/` + `src/styles/fonts.css`、font-display: swap)
- 共通コンポーネント `src/components/redesign/`: `GlassCard`(ダークガラス+アクセントボーダー)/ `Kicker`(トラッキング見出し)/ `StatCounter`(カウントアップ、reduced-motion対応 — design-preview/b.tsx の `CountUp` を昇格)/ `ExploreGrid` / `EraChips`+`YearRail` / `TheaterFrame`(公式YouTube埋め込みの黒フレーム)
- **ビルド時統計**: `gatsby-node.ts` sourceNodes に `SiteStats` ノード追加(songCount / liveItemCount / performanceCount=全setList合計 / nextLive)。カウントアップの最終値をGraphQLで焼き込み(現プレビューのハードコードを置換)

**トップページ**
- `index.tsx`/`contents.tsx`/`HomeSection.tsx` を新構成に: Hero(タグライン+統計)→ NEXT LIVE行 → EXPLORE → CHRONICLE → 入口カード(welcome/live/stats)→ THEATER(PersistentMainVideoを統合)→ Pick Up Post(ダーク化)
- `body.tsx`: 空グラデ+雲背景 → 黒ベース+青グロー背景に差し替え(bijigaku-navi等の除外分岐は現状維持)
- `header.tsx`: ダーク化+グローバルナビ常設(DISCOGRAPHY/LIVE/PLACE/PHOTO/TIMELINE+検索、B案プレビューの構成)
- `officialFooter.tsx`: ダーク化+REOL.JP黄CTA
- `trackingFooter.tsx`(下部タブ): ダーク化。全ページ常設化(P2-1統合)はバッチ7でも可
- GA4: 既存イベント名を維持(前後比較のため)。EXPLOREタイルは `entry_card_click` の `card_type: "explore_<section>"`

### バッチ6(B-2): 曲詳細+statsのダーク化

- `src/templates/song.tsx` / `src/pages/songs/stats.tsx` をB案システムに(GlassCard/Kicker適用、演奏履歴タイムラインを年表色に)
- `LoadingSkeleton`/`ErrorRetry`/`EmptyState` のダークトーン対応(tone prop拡張)
- `/search/` も同時にダーク化(曲ページとの回遊が密なため)

### バッチ7(B-3): 全ページ展開

- discography / live / place / photos / timeline / welcome の各ページ・セクションコンポーネント
- 白半透明カード前提の既存スタイル(`bg-white/70` 等)の一掃
- 下部タブ全ページ常設(P2-1)
- 別テーマ領域(bijigaku-navi=和紙 / quiz / relive)は**変更しない**(境界=body.tsxの分岐を維持)

### バッチ8(B-4・任意): 磨き

- 旧BLACKBOXオープニング(`opening.tsx` `renderUnbox`系)を**青×黄に再着色して復活**(現行の空と雲openingと差し替え)
- era/作品別ダイナミックアクセント(`themeColorPrimary/Secondary` + dynamic-colors.css基盤)
- OG画像のダークテーマ化(`generate-reol-type-og.ts` 等)

## 3. 計測(リニューアル一括デプロイ後2週間 ※途中デプロイなしのため旧デザインとの厳密な前後比較は不可)

- 北極星: `official_link_click` 率(前後比較)
- `entry_card_click`(card_type別 — EXPLORE経由の回遊が増えるか)
- GA4エンゲージメント率・平均セッション時間、`search_query` 件数
- 悪化が明確なら `body.tsx` の背景とヘッダーを旧テーマに戻すだけで大部分をロールバック可能(バッチ5の変更はコンポーネント単位で独立)

## 4. リスクと対策

| リスク | 対策 |
|---|---|
| 黒背景でのコントラスト不足 | ink2 `#8f8e96` は小さい文字で4.5:1を割る組合せがあるため、本文用に `#a5a4ac` 程度の明度も用意し、AA目視+ツール確認をバッチごとに実施 |
| 既存の白前提コンポーネントの取りこぼし | バッチ7で `bg-white` 系クラスをgrepで棚卸し |
| 常連の見慣れ | デプロイ告知(X)+フィードバック導線。2週間の計測で判断 |
| フォントサイズ増(self-hostサブセット) | 見出し用1ウェイトのみ・woff2・preload。増分が100KB超なら書体を再選定 |

## 5. 検証方針(各バッチ共通)

typecheck → develop停止確認(lsof -i :8000)→ build → 生成HTML検証(該当ページ)→ 主要フローの目視(トップ→EXPLORE→各セクション→公式リンク)→ reduced-motion確認

## 6. 進捗

| 項目 | 状態 |
|---|---|
| デザイン確定(配色・タグライン・導線) | ✅ 2026-07-03(plan/15 §5) |
| リファレンス実装(/design-preview/b/) | ✅ 青×黄版・EXPLORE入り(`4b8c29a`)+タグライン(`54d07cd`) |
| サブページのB案プレビュー(曲詳細/stats)+ハブ(/design-preview/) | ✅ 2026-07-03(`ecef89f`、実データ・noindex・build検証済み) |
| タグライン「Reolのこれまでを、まるっと遡れる。」本番HomeSectionへ適用 | ✅ `54d07cd` |
| **バッチ5(基盤+トップ刷新+クローム)** | ✅ **実装・検証完了(2026-07-07)** — `feature/batch-05-redesign-foundation`(`b1d21a2`+`6eb5591`)。bxトークン/SiteStatsノード/黒背景/redesignコンポーネント/HomeSection刷新(統計130・167・2,069焼き込み+NEXT LIVE)/ヘッダーナビ常設/フッター黄CTA/下部タブダーク化。typecheck・build・生成HTML検証済み |
| バッチ5の既知残: opening演出は空と雲のまま(バッチ8で青×黄化)、THEATER統合(PersistentMainVideoは現状維持)、self-hostフォント未導入 | バッチ6以降で対応 |
| **バッチ6(曲詳細+stats+検索のダーク化)** | ✅ **実装・検証完了(2026-07-07)** — `feature/batch-06-redesign-pages`(`f71d8de`+`c715ef0`)。状態系tone対応/曲詳細130ページ/統計ダークテーブル/検索カテゴリ別グルーピング。typecheck・build・生成HTML検証済み。※検索結果はフラット関連度順→カテゴリ別グルーピングに変更(要ユーザー確認) |
| バッチ7(discography/live/place/photos/timeline/welcome展開+白前提スタイル一掃+下部タブ全ページ常設) | ✅ **実装・検証完了(2026-07-08)** — `feature/batch-07-redesign-rollout`(7a〜7e、詳細はplan/17 §完了記録)。typecheck・jest全件・build・生成HTML残存クラス検証済み。playwright導入(`2c011c9`)しdialog開閉/setlist展開/地図マーカー/下部タブ表示分岐をheadless Chromiumで実測確認済み |
