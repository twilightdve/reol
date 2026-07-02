# 【P1】JSON-LD構造化データ導入

## 背景

構造化データが全サイトでゼロ(grep確認済み)。ライブ・ディスコグラフィという構造化に最適なデータを持ちながら、リッチリザルトの機会を逃している。

## 現状の問題

`application/ld+json` がどのページにも出力されていない。

## 期待する挙動

| 対象 | スキーマ |
|---|---|
| 全ページ | `WebSite`(+`SearchAction` でサイト内検索) |
| ライブ各件 | `MusicEvent`(name/startDate/location/performer=Reol) |
| ディスコグラフィ | `MusicAlbum`/`MusicRecording`(byArtist=Reol、公式URLをsameAsに) |
| 記事(美辞学ナビ等) | `Article` |
| 全下層 | `BreadcrumbList` |

## 実装方針

1. `SEO.tsx` に `jsonLd?: object[]` propを追加し、`<script type="application/ld+json">` を出力
2. トップ=WebSite+SearchAction、/live配下=MusicEvent、/discography=MusicAlbum、記事=Article、下層=BreadcrumbList を各ページ/テンプレートで生成

## 制約(重要)

非公式サイトなので `Organization`/`Person` でReol本人を名乗る構造は避け、`about`/`performer` 参照に留める。

## 影響範囲

`src/components/SEO.tsx`、各ページ/テンプレートのHead。

## 受け入れ条件

- [ ] リッチリザルトテストで全スキーマがvalid
- [ ] Search Consoleでエラーが出ない

## 確認方法

Googleリッチリザルトテスト、Schema.orgバリデータ。

## 優先度 / 見積もり難易度

P1 / 中(1〜2日)
