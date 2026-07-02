# 03. venue-layout-overrides.json

## なぜoverrideファイルにするか

Gatsbyビルド時に外部Webを巡回して会場情報を取るのは避ける。

理由:

- ビルドが不安定になる
- 公式サイトのHTML変更に弱い
- 著作権/利用規約上の扱いが面倒
- 出典管理が曖昧になる
- CI環境で失敗しやすい

そのため、会場レイアウト情報は人間が確認して `venue-layout-overrides.json` に蓄積する。

## 置き場所

```txt
src/data/zankyo/venue-layout-overrides.json
```

## merge方針

live.json由来のbase venueを作る。

```txt
base venue:
  venueId
  name
  siteUrl
  address
  googleMapsUrl
  typeGuess
```

そこへoverrideをマージする。

```txt
overrideがある:
  layoutStatusなどを適用

overrideがない:
  fallback simple layoutを生成
  layoutStatus = needs_verification
```

## overrideの優先順位

1. `venueId` 完全一致
2. normalized venue name一致
3. aliases一致
4. manual mapping

## 禁止

- 公式フロアマップ画像をbase64化して入れない
- 座席図画像URLをアプリ画面に直接表示しない
- 公式画像をダウンロードして同梱しない
- 出典なしにキャパシティを断定しない
