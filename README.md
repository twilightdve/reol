# !Legit — Reol 非公式ファンサイト

https://reol.twilightea.com/

Gatsby 5 のビルド時静的HTML生成(SSG)で作り、GitHub Pages(`gh-pages` ブランチ)に置いているサイトです。サーバー側の処理はありません。改善計画と経緯は [`plan/`](./plan/README.md) にまとめています。

## 開発

```sh
npm install
npm run develop      # http://localhost:8000
npm run typecheck
npm test
```

- `develop` と `build` を同時に動かさないでください(`.cache` / `public` を取り合って不規則に失敗します)。ビルド前に `lsof -i :8000` で開発サーバーが止まっていることを確認します
- `develop` を起動するたびにスプレッドシートのデータを取り直すため、`static/data` などに大きな差分が出ます。これは正常です

## データの取り込み

楽曲・ライブ・聖地などのデータは Google スプレッドシートにあり、**ビルドのたびに**読み込んで `static/data/*.json` とページを生成します。スプレッドシートを更新しても、次にビルドしてデプロイするまで本番には反映されません。

ビルドには次の3つがリポジトリ直下に必要です(どれも秘密情報なのでコミットしません。`.gitignore` 済み)。

| ファイル | 内容 |
| --- | --- |
| `.env` | `SPREADSHEET_ID=<スプレッドシートのID>` |
| `credentials.json` | Google Cloud の OAuth クライアント情報 |
| `token.json` | 読み取り権限(spreadsheets.readonly)のトークン。初回ビルド時にブラウザで認可すると作られる |

## 告知や公演を反映する手順(手動デプロイ)

スプレッドシートに新しい告知・公演・セットリストを追加したら、次の手順で本番に反映します。

1. main ブランチを最新にし、作業ツリーをきれいにする
   ```sh
   git checkout main
   git pull
   git status   # 何も出ないこと
   ```
2. 開発サーバーが動いていないことを確認する
   ```sh
   lsof -i :8000   # 何も出ないこと。出たら develop を止める
   ```
3. デプロイする
   ```sh
   npm run deploy
   ```
   - 最初に `scripts/check-deploy-ready.ts` が走り、コミットされていない変更があると中止します(ビルドで作り直す `static/data` などは対象外)
   - 続けて `npm run build`(スプレッドシートの読み込みを含む)と `gh-pages -d public` が実行されます
4. ビルドで更新された `static/relive/generated` は日時が変わっただけなので戻す
   ```sh
   git restore static/relive/generated
   ```
5. 1〜2分待ってから本番を確認する。GitHub Pages への反映には少し時間がかかり、直後は 404 や古い内容が見えることがあります。開いたままのタブは Service Worker が新しい版を検出すると自動で再読み込みします

ビルドがまれに `Couldn't find temp query result` で失敗することがあります。もう一度実行すれば通ります。

## 多言語対応

英語・中国語(繁体字/簡体字)・韓国語のページを `/en/` `/zh-hant/` `/zh-hans/` `/ko/` の下に生成しています。言語は URL だけで決まります。設計と対象ページは [`plan/28-i18n-legit.md`](./plan/28-i18n-legit.md) を参照してください。中国語・韓国語は機械翻訳です。
