# 6. SEO・SNS改善

検索順位だけを狙った不自然な文章や、権利的に危ういコンテンツは作らない。公式送客と信頼性表記を優先する。

## titleタグ

- 全ページ `ページ名 | !Legit - Reol非公式ファンサイト` に統一
- トップのみ `!Legit｜Reolの楽曲・ライブ・セトリを網羅する非公式ファンサイト`
- → [Issue 6](./issues/issue-06-title-unification.md)

## meta description

- トップ案: 「Reol(れをる)の非公式ファンサイト。全楽曲のライブ演奏統計、歴代ライブのセットリスト、MVロケ地(聖地)マップ、ファンタイプ診断まで。10年分の活動を横断検索できます。」
- `SEO.tsx` のデフォルト値をツアー文言から汎用文に変更([Issue 1](./issues/issue-01-seo-default-description.md))
- 全ページでページ内容に即した個別descriptionを設定

## OGP

1. ページ種別ごとのog:image(トップ/統計/LIVE/診断タイプ別)
2. `og:locale=ja_JP` 追加
3. 記事系は `og:type=article`

## Twitter/Xカード

- `summary_large_image` 継続
- 診断タイプ別画像が最優先([Issue 8](./issues/issue-08-quiz-type-ogp.md))

## 構造化データ(JSON-LD) → [Issue 10](./issues/issue-10-json-ld.md)

| 対象 | スキーマ |
|---|---|
| 全ページ | `WebSite`(+`SearchAction` でサイト内検索) |
| ライブ各件 | `MusicEvent`(name/startDate/location/performer=Reol)— セトリページの検索露出に効く |
| ディスコグラフィ | `MusicAlbum`/`MusicRecording`(byArtist=Reol、公式URLをsameAsに) |
| 記事 | `Article` |
| 全下層 | `BreadcrumbList` |

**注意**: 非公式サイトなので `Organization`/`Person` でReol本人を名乗る構造は避け、`about`/`performer` 参照に留める。

## ページ別キーワード設計

| ページ | 狙うクエリ |
|---|---|
| トップ | Reol ファンサイト |
| 楽曲統計 | Reol セトリ 回数 / ◯◯(曲名) ライブ |
| LIVE | Reol セトリ ◯◯(公演名) |
| PLACE | Reol MV ロケ地 / 聖地 |
| 初参加ガイド | Reol ライブ 初めて / 持ち物 |
| はじめてのReol | Reol おすすめ曲 / 入門 |

## 内部リンク設計

- 曲詳細をハブに stats⇔live⇔discography⇔検索 を相互接続
- フッターに主要ページリンク(現状フッターは運営Xのみ)

## 共有されやすいページ設計

診断タイプページ、統計スニペット、セトリ答え合わせ——いずれも**固有URL+固有OGP**を持たせる。

## 公式へのリンク設計

- 外部公式リンクは `rel="noopener"` のみ(nofollow不要、公式への送客は正当)
- テキストは「公式サイトで見る」「公式YouTubeで聴く」と行き先を明示

## 非公式サイトとしての信頼性表記

全ページフッターに:

> 本サイトはReol公式とは関係のない非公式ファンサイトです。楽曲・映像は公式の埋め込み/リンクのみ使用しています。

+問い合わせ導線。これ自体がGoogleのE-E-A-T的にもプラス。
