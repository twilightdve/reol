# 26. GEO(生成AI最適化)向け構造化データの現状と改善案

作成日: 2026-07-30
ステータス: 調査完了、提案段階(実装未着手)

## 0. 背景

「SEOだけでなくGEO(Generative Engine Optimization、ChatGPT/Perplexity/Google AI Overviews等の生成AI検索への最適化)も意識すべき」という話を受けて現状を調査した。

まず`robots.txt`(`gatsby-plugin-robots-txt`生成)を確認したところ、`/relive/`以外は`userAgent: "*"`で許可済みで、GPTBot/ClaudeBot/PerplexityBot等を明示的にブロックするルールはない。クロールアクセス自体は既に開いている。

## 1. 構造化データ(JSON-LD)の現状

`src/utils/jsonLd.ts`という共通ヘルパーが既にあり、16ファイルで使われている。`src/components/SEO.tsx`は複数スキーマを配列で受け取り、それぞれ独立した`<script type="application/ld+json">`として出力する実装になっており(1ページ1スキーマしか出せない、という制約は無い)、基盤は健全。

現状の内訳:
- `buildWebSite`: トップページのみ
- `buildBreadcrumbList`: ほぼ全ページ(パンくずのみ)
- `buildMusicEvent`/`buildMusicEventItemList`: `/live/`一覧ページ、LIVE詳細ページ(日付が正しい場合のみ)
- `buildMusicRecording`: 曲詳細ページ(曲名+アルバム名のみ)

## 2. 見つかったギャップ

### 2-1. 曲詳細ページ(`song.tsx`)— 最大のギャップ

`gatsby-node.ts`は既に`totalPlays`/`firstPlayedDate`/`lastPlayedDate`をページコンテキストに渡しており、テンプレート自体も演奏履歴(`sortedPlays`、日付+公演スラッグ付き)を組み立てて「PERFORMANCE HISTORY」欄に表示している。しかしこのデータは`MusicRecording`(曲名+アルバム名のみ)にしか使われておらず、演奏履歴自体は構造化データ化されていない。

「この曲はいつ初披露/最後に演奏されたか」という、まさにAI検索が抜き出したがる質問形式に対して、**必要なデータは既に同じファイル内にある**。`buildMusicEvent`/`buildMusicEventItemList`を演奏履歴に対して適用するだけで実装できる。

- 実装コスト: 小(新規データ取得不要、既存配列を渡すだけ)
- 効果: 高

### 2-2. LIVE詳細ページ(`live-item.tsx`)

セットリスト(`setList`)は既にページコンテキストで渡っているが、曲数カウント(meta description用)にしか使われていない。「この公演で何を演奏したか」に答える構造化データ(セットリストのトラックリスト相当)が無い。

- 実装コスト: 中
- 効果: 中〜高

### 2-3. DISCOGRAPHY一覧(`discography/index.tsx`)

リリース一覧を丸ごとGraphQLで取得しているにもかかわらず、パンくず以外の構造化データが無い。リリースごとの`MusicAlbum`が無いため「アルバムYに収録されている曲」に答えられない。

- 実装コスト: 中
- 効果: 中

### 2-4. FAQ形式のページにFAQPageスキーマが無い

`live/guide.tsx`(ライブ参戦ガイド)、`live/setlist-grammar.tsx`、`welcome.tsx`、`about/data.tsx`など、実質的にQ&A形式のコンテンツを持つページがあるが、`FAQPage`/`Question`/`acceptedAnswer`は現状サイト内に一切無い。AI回答エンジンがFAQ形式を直接引用しやすい形式なので、GEO的には見過ごせない。

- 実装コスト: 中(既存文章をQ&A形式に再整理する判断が必要)
- 効果: 高

### 2-5. アーティスト参照(`REOL_PERFORMER`)のsameAsが手薄

`REOL_PERFORMER`(全ページ共通の`MusicGroup`参照、非公式サイトなので本人を名乗らずsameAsで紐付けのみ)は現状`reol.jp`への1リンクしか持っていない。公式X/YouTube/Spotify等へのsameAsを増やすことで、AI側がエンティティを正しく認識しやすくなる。

- 実装コスト: 小(1ファイルの定数を増やすだけ)
- 効果: 中(エンティティ認識の土台として効く)

## 3. 優先順位案

| # | 項目 | コスト | 効果 |
|---|---|---|---|
| 2-5 | REOL_PERFORMERのsameAs拡充 | 小 | 中 |
| 2-1 | 曲詳細ページの演奏履歴を構造化データ化 | 小 | 高 |
| 2-2 | LIVE詳細ページのセットリスト構造化 | 中 | 中〜高 |
| 2-3 | DISCOGRAPHY一覧にMusicAlbum追加 | 中 | 中 |
| 2-4 | FAQPageスキーマ追加 | 中 | 高 |

2-5と2-1は低コストで着手しやすく、効果も見込める。2-4はコンテンツの再整理判断が要るため単独で相談したい。

## 4. 留意点

- AIによる引用効果を直接計測する手段が無い(GA4のクリック計測のような検証ができない)。効果検証がしづらい前提で進める。
- `sameAs`拡充・`REOL_PERFORMER`まわりは、reol-official-linksの正誤情報(公式YouTubeは`@reolch`等)と整合させる必要がある。
