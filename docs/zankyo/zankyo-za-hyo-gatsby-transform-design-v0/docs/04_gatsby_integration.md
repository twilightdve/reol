# 04. Gatsby Integration

## 推奨方式A: npm prebuild/predevelop

最も安全で分かりやすい。

### package.json

```json
{
  "scripts": {
    "generate:zankyo": "tsx scripts/generate-zankyo-data.ts",
    "predevelop": "npm run generate:zankyo",
    "prebuild": "npm run generate:zankyo",
    "develop": "gatsby develop",
    "build": "gatsby build"
  }
}
```

メリット:

- Gatsbyの内部ライフサイクルに依存しにくい
- ローカルでもCIでも同じ
- 失敗時にビルド前に止まる
- テストしやすい

デメリット:

- generateだけ実行し忘れる可能性がある
- package scriptsの調整が必要

## 推奨方式B: gatsby-node onPreBootstrap/onPreBuild

GatsbyのNode APIで自動実行する方式。

```ts
// gatsby-node.ts
import type { GatsbyNode } from "gatsby"
import { generateZankyoData } from "./src/features/zankyo/data-transform"

export const onPreBootstrap: GatsbyNode["onPreBootstrap"] = async ({ reporter }) => {
  reporter.info("[zankyo] generating data")
  await generateZankyoData({
    liveJsonPath: "static/data/live.json",
    discographyJsonPath: "static/data/discography.json",
    outputDir: "static/zankyo/generated",
  })
}
```

メリット:

- Gatsby実行時に必ず走る
- 実行忘れがない

デメリット:

- Gatsby起動ごとに変換が走る
- Gatsbyのエラーログに埋もれる
- watch/develop時の再生成制御が必要

## 推奨方式C: sourceNodes/createPages

GraphQLに取り込みたい場合のみ。

用途:

- `/zankyo/setlists/<setlistId>/` のような静的ページを大量生成したい
- GraphQLでセトリ情報を参照したい

v0では必須ではない。

## 出力先

### 推奨

```txt
static/zankyo/generated/
```

理由:

- Gatsby buildでpublicへコピーされる
- クライアントからfetchしやすい
- 既存サイトの通常データと分離できる

### fetch URL

既存サイトのpathPrefixを考慮する。

```ts
const ZANKYO_DATA_BASE = withPrefix("/zankyo/generated")
```

または環境変数:

```ts
const ZANKYO_DATA_BASE =
  process.env.GATSBY_ZANKYO_DATA_BASE ?? "/zankyo/generated"
```

## Gatsby SSRでやらないこと

以下は `gatsby-ssr.tsx` でやらない。

- live.json全件変換
- discography.json全件変換
- 大きなファイル書き込み
- AudioContext関連
- Browser API参照

`gatsby-ssr` はReact描画側の調整に使う。  
データ変換はNodeスクリプトか `gatsby-node` に寄せる。

## Clientとの接続

```txt
/zankyo/ page
  ↓ fetch
/zankyo/generated/manifest.json
/zankyo/generated/tracks.json
/zankyo/generated/venues.json
/zankyo/generated/setlists/index.json
  ↓ user selects setlist
/zankyo/generated/setlists/<setlistId>.json
```

## キャッシュ戦略

- generated JSONは静的ファイル
- Service Workerがある場合も、音源ではなくJSONだけキャッシュ対象にする
- manifestに `sourceHash` を持たせ、更新判定に使う
