# 06. Venue Layout Enrichment Workflow

## フロー

```txt
generate:zankyo
  ↓
venue-layout-enrichment-tasks.csv
  ↓
人間が公式サイト等で確認
  ↓
venue-layout-overrides.json に追記
  ↓
generate:zankyo
  ↓
venue-layout-coverage.json で進捗確認
```

## 優先順位

1. ユーザーが参加した/参加予定の公演会場
2. ワンマン会場
3. セトリが充実している会場
4. 繰り返し出てくる会場
5. フェス/イベント会場

## 確認する項目

```txt
capacity
standing/seated
floor count
balcony
stage position
floor shape
official site URL
floor map URL if linking only
notes
```

## 参照ソース優先順位

1. 会場公式サイト
2. 公演公式ページ
3. チケット販売ページ
4. 自治体/施設ページ
5. 信頼できるイベント主催ページ
6. 手動メモ

## 注意

キャパシティやフロア図は、確認できなければ空欄でよい。  
無理に埋めないことが品質。
