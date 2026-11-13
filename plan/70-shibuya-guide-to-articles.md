# 70. 聖地巡礼ガイド 渋谷編を「読みもの」へ移す

- 日付: 2026-11-13
- きっかけ: 運営者「このReol聖地巡礼ガイド 渋谷編、読みものコンテンツの配下に置くのが正しい気がする」
- 状態: 実装して main に取り込み済み(コミット `57e3693de39`)。**デプロイはしていない**(本番はまだ前の URL `/place/shibuya/` のまま)

## 1. 決めたこと

| こと | 決め |
|------|------|
| 新しい URL | `/articles/shibuya-guide/` |
| 前の URL `/place/shibuya/` | 消さずに、新しい URL へ送るだけのページにした。見出しへのリンク(`#modi` など)は引き継ぐ。canonical は新しい URL。サイトマップからは外した。静的配信(GitHub Pages)なので、サーバーの側の転送(301)はできない |
| シリーズ | 新しく「聖地を歩く」(`/articles/series/seichi-wo-aruku/`)。「曲を読む」の後ろに並ぶ |
| 出る場所 | 読みものの一覧、シリーズのページ、RSS、HOME の読みもの。公開日(2026-11-12)がいちばん新しいので、HOME ではいま先頭の大きな枠に出る |
| 表紙 | ページの先頭に表紙(シリーズ名・題名・「〜渋谷はReolの交差点〜」・日付・順路の略図)を足した。一覧のカードと OGP の画像は、この表紙を撮ったもの |
| いいね数・表示回数 | ガイドには出さない(いいねの仕組みは楽曲記事のもの。表示回数は URL を移したので「公開日からの数」にならない) |
| 一覧の細かい所 | 「個人的な解釈です」の断り書きと「曲順」「いいねが多い順」は、楽曲記事のある一覧だけ。1本だけの一覧には並べ替えを出さない。ガイドの題名は全体を本文の色で出す(楽曲記事は曲名だけ強調) |
| 下のタブ | 読みもの(READING)が選ばれる |
| 本文 | 変えていない(「最終更新」の1行は表紙の日付に置き換えた) |

## 2. 変えたファイル

- `src/utils/songArticles/guides.ts`(新規): 手で書いた読みものの登録表。ここに足すと、一覧・RSS・HOME・OGP の撮影・デプロイ前の点検に載る
- `src/utils/songArticles/series.ts`: シリーズ「聖地を歩く」
- `src/pages/articles/shibuya-guide.tsx`: ガイド本体(`src/pages/place/shibuya.tsx` から移動)。表紙、パンくず(HOME / 読みもの / 題名)、記事としての構造化データ
- `src/pages/place/shibuya.tsx`: 新しい URL へ送るページ
- `gatsby-node.ts`: 読みものの一覧と HOME の読みものにガイドを足す(楽曲記事と slug が重なったらビルドを止める)
- `src/templates/song-articles-index.tsx`、`src/components/index/FeaturedArticle.tsx`、`src/components/songArticles/ArticleCoverCard.tsx`: 曲名の無い読みものの出し方
- `src/utils/jsonLd.ts`: 記事の構造化データで、曲の情報を任意に
- `gatsby-config.ts`: サイトマップから前の URL を外す
- `scripts/articles/capture-article-og.ts`、`scripts/check-deploy-ready.ts`: ガイドの表紙も撮る・点検する
- `static/articles-cover/shibuya-guide.jpg`、`static/articles-og/shibuya-guide.jpg`: 表紙の画像
- `src/components/index/sections/PlaceSection.tsx`: PLACE からのリンク先

## 3. 確かめたこと

`npx tsc --noEmit` エラーなし。jest 26 スイート・180 件通過。`gatsby build` 成功。ビルドしたものを手元で配信し、Playwright(Chromium・WebKit × 幅390・1280 × 暗・明)で確かめた。214 項目すべて通過(このほか PLACE 128、ガイド本体 86。plan/69 の 6-3)。

| 見たもの | 結果 |
|----------|------|
| ガイド | 題名、パンくず(HOME・読みもの)、表紙の日付「2026年11月12日 公開」、広い画面だけ略図が出る、canonical・og:image・og:type=article・構造化データ(パンくずと記事) |
| 下のタブ(幅390) | READING が選ばれている |
| 読みものの一覧 | 見出しが「シリーズ「曲を読む」」「シリーズ「聖地を歩く」」の順。ガイドのカードに表紙・題名・公開日・タグ(#渋谷 #聖地巡礼)。いいね数・表示回数は無い。「その他」の見出しは出ない。曲順にしてもガイドは残る |
| シリーズのページ | 題名「聖地を歩く」、ガイド1本。断り書きと並べ替えは出ない。「曲を読む」のページにガイドは出ない |
| HOME の読みもの | 先頭の大きな枠がガイド(1回だけ出る) |
| 前の URL | `/place/shibuya/#modi` を開くと `/articles/shibuya-guide/#modi` に移り、その見出しが画面に入る。JS なしでも移る(meta refresh) |
| PLACE | ガイドへのリンクが新しい URL。前の URL へのリンクは残っていない |
| 静的な出力 | サイトマップに新しい URL だけ。RSS にガイドの項目 |
| 横のはみ出し・コンソールのエラー | 0 |

まだ確かめていないこと: iPhone 実機。本番での表示(デプロイ前)。

## 4. 気づいたこと

- 検索に残っている前の URL は、canonical と転送で新しい URL に寄っていく見込みだが、いつ切り替わるかは分からない(数字の見込みは置かない)
- X で告知する文面(Git 対象外の下書き)の URL は、新しい URL に直した
- main にデプロイ前の変更があるあいだ、毎日の自動デプロイは止まる(plan/47 の決まり)
- ガイドの続き(ほかの街)を作る時は、`guides.ts` に足して `src/pages/articles/<slug>.tsx` を書く
