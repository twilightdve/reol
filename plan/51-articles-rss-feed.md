# 51. 読みものの RSS フィード

2026-10-23 ユーザー「記事のRSSフィードを設定できるようにしたい」。

## 仕様

- URL: `https://reol.twilightea.com/articles/feed.xml`(RSS 2.0)。
- 載せる記事: 全体公開の記事だけ。限定公開・プレビュー・予約公開(公開日時がビルド時刻より後)は載せない。
  予約公開の記事は、公開日時を過ぎた後のビルド(毎日の自動デプロイ、または手動デプロイ)で載る。
- 並び: 公開日時の新しい順。項目は題名・URL(guid)・公開日時・要約(一覧と同じ)・タグ(category)。本文は載せない。
- 置き場所: ビルド時に gatsby-node の記事一覧を作る処理で `public/articles/feed.xml` に書き出す(`src/utils/songArticles/feed.ts`)。
- 見つけ方: 読みもの一覧の見出しの下に「RSS フィード」のリンク。一覧と各記事の `<head>` に `<link rel="alternate" type="application/rss+xml">`(リーダーにサイトの URL を入れても見つかる)。

## 確認

- 単体テスト `src/utils/__tests__/songArticlesFeed.test.ts`(載せる記事の絞り込みと順番、XML のエスケープ)。
- 開発サーバーで feed.xml を取得: 全体公開の14本が載り、限定公開の「生命線」は載らない。xmllint で XML として正しい。
- 一覧のリンクと `<link rel="alternate">` を Chromium・WebKit の 360・1280px で確認。
