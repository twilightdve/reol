# 47. 毎日の自動デプロイ

着手(2026-10-18): ユーザー「デイリーでデプロイを走らせるようにしたい」。表示回数(plan/46)はデプロイの時にしか変わらないため。

## 1. 何を出すか(ユーザー決定)

「最後に手動でデプロイした版を毎日作り直す」。コードの公開は今までどおり頼まれた時だけ(main へのマージは代理、デプロイは頼まれた時)。毎日変わるのは次だけ:

- 表示回数(GA4)
- シートのデータ(ビルドのたびに取り直すもの)
- 予約公開の記事の、静的HTML・サイトマップへの反映

main に未デプロイの変更がある日は出さない(手動でデプロイするまで待つ)。

## 2. 仕組み

- `npm run deploy` の後(postdeploy)に、デプロイした版(`git rev-parse HEAD`)を `.deploy-local/deployed-commit` に書く(git 管理外)。
- launchd(`~/Library/LaunchAgents/com.twilightea.reol.daily-deploy.plist`)が毎時0分に `scripts/daily-deploy.sh` を起こす。Mac が寝ていた時は起きた時に1回動く。
- `scripts/daily-deploy.ts` は、その日(日本時間)まだ試みておらず、4時を過ぎていれば、次をすべて満たす時だけ `npm run deploy` する:
  - 作業中のブランチが main
  - main の HEAD が、最後にデプロイした版と同じ
  - コミットされていない変更が無い(ビルドが作り直す static/data などは除く)
  - gatsby develop・build・serve、jest、playwright が動いていない(メモリ不足で PC が落ちたことがある)
- 作業中のコピーには触らない(git fetch・merge・checkout はしない)。
- 試みるのは1日1回まで(失敗しても、その日はもう試みない)。
- 40分で打ち切る(シートの認証が切れるとブラウザ待ちで止まるため)。
- 通知(macOS の通知センター):
  - 始める時(「終わるまで開発サーバーを起動しないで」)
  - 失敗した時
  - デプロイはできたが GA から表示回数を取れなかった時(認証切れの可能性)
  - 21時を過ぎても出せていない時(理由つき、1日1回)
- ログ: `~/Library/Logs/reol-daily-deploy.log`
- 登録・解除: `scripts/daily-deploy.sh install` / `uninstall`。確認だけ: `scripts/daily-deploy.sh check`

## 3. 注意

- Mac の電源が切れている日は動かない。寝ていた時は、起きた時(作業を始めた時)に動く。
- GA の認証(OAuth)は 2026-07-29・2026-10-18 に切れていた。GCP(reol-ga-mcp)の OAuth 同意画面が「テスト」のままだと7日で切れる(推測・未確認)。切れていると通知が出る。再認証は plan/24 の 0章。
- 自動デプロイの間にこのセッションで develop を起動しないこと(memory: develop と build の同時実行禁止)。

## 4. 確認

- 2026-10-18: 型チェック。launchd から check を動かし、GitHub への接続・条件判定を確認(結果は下)。
