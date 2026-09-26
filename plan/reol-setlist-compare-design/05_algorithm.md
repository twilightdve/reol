# 05. 比較アルゴリズム

1. 両セトリを正規化
2. 比較キー生成
3. union作成
4. A/B位置付与
5. common / onlyA / onlyB 判定
6. summary計算

## 類似度
Jaccard係数を推奨。
`common / union`

別に `common / min(A,B)` を「共通率」として表示してもよい。

## 曲順差
`positionDiff = bPosition - aPosition`
正ならBで後ろへ、負ならBで前へ。

## 最大曲順変動
共通曲の `abs(positionDiff)` 最大値。

## 曲名正規化
- Unicode NFKC
- trim
- 連続空白圧縮
- 英字小文字化

ただし Remix 等を勝手に同一曲扱いしない。
