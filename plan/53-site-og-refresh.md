# 53. サイト共通OGP画像の作り直し(2026-10-23)

## 何を直したか
旧画像(バッチ8c)の問題:
- 下の説明文が幅に収まらず「…非公式フ…」で切れていた
- 一番大きい文字が「Reol」で、サイト名(!Legit)が脇役。ロゴの書体もサイトと違った
- 右半分が空いていて、どんなサイトか伝わる要素がなかった

新画像は、トップページのヒーローと同じ構成にした。
- 左上: ヘッダーと同じ `!Legit`(Cormorant 500)+ `REOL UNOFFICIAL FANSITE`
- `UNBOXED — SINCE 2012` と見出し「Reolのこれまでと、/これからを知る。」(これまで=青、これから=黄)
- 下段: トップと同じ数字(SONGS / LIVES / PERFORMANCES)と URL

## 仕組み
- `scripts/generate-site-og.ts` がビルド時(gatsby-node `sourceNodes`)に描く。数字は `createSongStatsNodes` が返す SiteStats と同じ値
- 数字はビルドのたびに変わり、画像 URL には既存のとおり `?t=ビルド時刻` が付くので SNS 側も読み直す
- 単体実行(数字なし)のときは数字の代わりに説明文を出す
- ロゴ書体は `@fontsource/cormorant`(OFL)の woff を node-canvas に登録。日本語は従来どおり Hiragino(デプロイはこの Mac)

## 残り
- 英語ページも同じ日本語の画像になる(以前も日本語混じり)
