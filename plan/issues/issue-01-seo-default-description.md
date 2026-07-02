# 【P0】SEOコンポーネントのデフォルトdescriptionがツアー固有文言のまま

## 背景

`SEO.tsx` は全ページ共通のメタタグ生成を担うが、美辞学ナビ機能開発時の文言が既定値として残存している。

## 現状の問題

`src/components/SEO.tsx:11`

```ts
const DEFAULT_DESCRIPTION = '美辞学ツアーの会場情報や参加者をチェックできます'
```

description未指定ページで、内容と無関係なツアー文言が検索結果・SNSカードに出力される。

## 期待する挙動

description未指定時はサイト全体の価値を表す汎用文が出る。

例: 「Reolの楽曲・ライブ・セトリ・聖地を横断できる非公式ファンサイト」

## 実装方針

1. `DEFAULT_DESCRIPTION` を汎用文に変更
2. `grep -rn "<SEO" src` で全呼び出しを監査し、description未指定のページには個別文を追加

## 影響範囲

全ページのmeta/OGP。

## 受け入れ条件

- [ ] 全ページでdescriptionがページ内容と一致している
- [ ] 「美辞学ツアーの会場情報…」が無関係なページに出力されない

## 確認方法

ビルド後 `public/**/index.html` を grep で検証。

## 優先度 / 見積もり難易度

P0 / 低(1〜2時間)
