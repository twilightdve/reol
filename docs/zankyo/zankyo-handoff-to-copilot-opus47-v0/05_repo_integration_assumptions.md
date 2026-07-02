# 05. Repo Integration Assumptions

## 想定リポジトリ

既存Reol非公式ファンサイト。

過去の会話では、React + Gatsby + GitHub Pages構成として扱っている。

## 想定データ

```txt
static/data/live.json
static/data/discography.json
```

`live.json`:

- ライブ履歴
- 公演アイテム
- 会場名
- 住所
- Google Maps URL
- セトリ

`discography.json`:

- ディスコグラフィ
- 曲一覧
- songId
- songName
- Spotify Track ID
- durationMs
- tempo
- energy
- danceability
- loudness等

## Gatsby pathPrefix

既存サイトがGitHub Pagesのサブパス配下の場合、Gatsby `pathPrefix` がある可能性がある。

注意:

- URLを直書きしすぎない
- fetch pathは既存のURL helperまたは `withPrefix` を使う
- `/zankyo/generated/...` の参照が本番で崩れないよう確認する

## static出力

Gatsbyの `static/` 配下はビルド後にpublicへコピーされる。

したがって、生成先は以下が扱いやすい。

```txt
static/zankyo/generated/
```

## scripts

既存のpackage.json scriptsを確認して、壊さない。

既存の `prebuild` / `predevelop` がある場合は上書きしない。  
連結する。

例:

```json
{
  "scripts": {
    "generate:zankyo": "tsx scripts/generate-zankyo-data.ts",
    "prebuild": "npm run generate:zankyo && existing-prebuild-command"
  }
}
```

## tsxについて

`tsx` がない場合:

- 既存プロジェクトで使われているTypeScript実行手段に合わせる
- 追加してよいか判断する
- 追加する場合はdevDependency

## Git管理

初期は `static/zankyo/generated/` をGit管理してもよい。

理由:

- 差分レビューがしやすい
- 生成結果の確認が簡単
- 実装初期の品質担保になる

`.cache/zankyo-transform/` はignore推奨。
