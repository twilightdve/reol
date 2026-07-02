# 【P0】トップページのmeta descriptionを価値提案文に変更

## 背景

トップページのdescription・og:description・twitter:descriptionは `gatsby-config.ts` の `siteMetadata.description` から生成され、検索結果とSNSカードの第一印象を決める。

## 現状の問題

`gatsby-config.ts:10-11` の説明文が自己言及的・謝罪的(「自己満足的な推し活の一環として…内容に偏りや間違いなどあるかもしれませんが」)で、検索結果とXカードにそのまま露出している(実HTMLで確認済み)。

## 期待する挙動

価値提案文が出力される。

案: 「Reol(れをる)の非公式ファンサイト。全楽曲のライブ演奏統計、歴代ライブのセットリスト、MVロケ地(聖地)マップ、ファンタイプ診断まで。10年分の活動を横断検索できます。」

## 実装方針

- `siteMetadata.description` を差し替え
- 免責文(謙遜トーン)はABOUTダイアログに残す(削除しない)

## 影響範囲

トップのmeta/OGP(siteMetadataを参照する他ページがあればそれも)。

## 受け入れ条件

- [ ] description / og:description / twitter:description が新文言になっている

## 確認方法

`curl -s https://reol.twilightea.com/ | grep description`、Xカードバリデータ。

## 優先度 / 見積もり難易度

P0 / 低(15分)
