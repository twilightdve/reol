# 06. Acceptance Criteria for Next PR

このPRの完了条件。

## 必須

- [ ] `npm run generate:zankyo` が存在する
- [ ] `npm run generate:zankyo` が成功する
- [ ] `npm run build` が成功する
- [ ] `static/data/live.json` を読み込んでいる
- [ ] `static/data/discography.json` を読み込んでいる
- [ ] `static/zankyo/generated/manifest.json` が生成される
- [ ] `static/zankyo/generated/tracks.json` が生成される
- [ ] `static/zankyo/generated/venues.json` が生成される
- [ ] `static/zankyo/generated/venue-layouts.json` が生成される
- [ ] `static/zankyo/generated/setlists/index.json` が生成される
- [ ] `static/zankyo/generated/setlists/*.json` が生成される
- [ ] `static/zankyo/generated/reports/import-report.json` が生成される
- [ ] `static/zankyo/generated/reports/unmatched-raw-titles.csv` が生成される
- [ ] `static/zankyo/generated/reports/venue-enrichment-tasks.csv` が生成される
- [ ] `static/zankyo/generated/reports/venue-layout-enrichment-tasks.csv` が生成される
- [ ] `static/zankyo/generated/reports/venue-layout-coverage.json` が生成される

## データ品質

- [ ] tracks件数が0ではない
- [ ] setlists件数が0ではない
- [ ] venues件数が0ではない
- [ ] venue-layouts件数がvenues件数と整合する
- [ ] unmatched raw titlesがreportされる
- [ ] capacity不明の会場は `null` / `needs_verification`
- [ ] special entryが単純missingになりすぎていない
- [ ] setlist entryのorderが維持されている
- [ ] source liveId / liveItemNo が追跡できる

## 安全性

- [ ] 音源ファイルを扱っていない
- [ ] 歌詞本文を出力していない
- [ ] 公式画像を保存していない
- [ ] 公式ロゴを使っていない
- [ ] Gatsby build時に外部Webスクレイピングしていない
- [ ] 既存サイト通常ページに副作用を入れていない

## 報告

PR完了報告に以下を含める。

```txt
変更ファイル:
生成ファイル:
tracks件数:
setlists件数:
venues件数:
venue-layouts件数:
unmatched raw titles件数:
venue enrichment tasks件数:
venue layout enrichment tasks件数:
実行コマンド:
build結果:
lint/test結果:
チェックリストでNoだった項目:
次にやるべきこと:
```
