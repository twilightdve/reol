# 08. Human Operator Notes

## Copilotへ渡す前の準備

リポジトリ内に以下のように配置するのがおすすめ。

```txt
docs/zankyo/
  handoff-to-copilot-opus47/
    README.md
    00_copilot_start_prompt.md
    ...
  zankyo-za-hyo-design-spec-v0/
  zankyo-za-hyo-fansite-integration-addendum-v0/
  zankyo-za-hyo-gatsby-transform-design-v0/
  zankyo-za-hyo-venue-layout-design-v0/
```

## Copilotへの最初の指示

`00_copilot_start_prompt.md` の内容を貼る。

または短く:

```txt
docs/zankyo/handoff-to-copilot-opus47/00_copilot_start_prompt.md を読んで、指示に従って実装してください。
まずリポジトリ構成と既存Gatsby設定を確認し、実装方針を短く報告してから作業してください。
```

## レビュー時に見るところ

- package.json scripts
- scripts/generate-zankyo-data.ts
- src/features/zankyo/data-transform/
- static/zankyo/generated/
- reports/
- Gatsby build結果
- チェックリストNo項目

## 危険な兆候

- いきなりプレイヤーUIを作り始める
- 音源アップロードを実装しようとする
- 外部Webから会場情報を自動取得しようとする
- キャパシティを勝手に埋める
- 歌詞やジャケットを取り込む
- `/zankyo/` 以外に重い処理を入れる

その場合は作業を止めて、`04_purpose_drift_checklist.md` を再確認させる。
