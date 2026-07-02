# 【P0】全ページ共通の公式リンクフッター(OFFICIAL LINKS)

## 背景

本サイトの最重要方針は「公式への送客」。しかし現状、公式導線が構造的に存在しない。

## 現状の問題

- 公式リンクは reol.jp がABOUTダイアログ内に1つだけ
- フッターは運営Xと©表記のみ(`src/pages/index.tsx:43-62`)
- 公式YouTube・公式X・Instagram・配信・チケットへのリンクがサイト内に常設されていない

## 期待する挙動

全ページ下部に以下が表示される:

- 公式サイト / 公式YouTube / 公式X / Instagram / 配信(公式リンクページ) / チケット へのリンク
- 「本サイトはReol公式とは関係のない非公式ファンサイトです。楽曲・映像は公式の埋め込み/リンクのみ使用しています」の表記

## 実装方針

1. `src/components/modules/OfficialFooter.tsx` を新設
2. `wrapRootElement` 配下(body.tsx等)で全ページ共通表示
3. クリック時にGA4 `official_link_click` イベント送信(`src/utils/analytics.ts` 拡張、パラメータ `link_type: youtube|site|ticket|streaming|sns`)
4. 外部リンクは `target="_blank" rel="noopener noreferrer"`

## 影響範囲

全ページのフッター、analytics。

## 受け入れ条件

- [ ] 全ページで表示される
- [ ] 各リンククリックでGA4イベントが発火する
- [ ] 非公式表記が表示される

## 確認方法

主要5ページ(トップ/live/discography/stats/quiz)で目視+GA4 DebugView。

## 優先度 / 見積もり難易度

P0 / 低(半日)
