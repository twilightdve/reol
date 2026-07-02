# 08. Incremental Cache

## 目的

Gatsby develop時に毎回全変換すると重いため、入力ハッシュでスキップする。

## cache file

```txt
.cache/zankyo-transform/manifest.json
```

内容:

```json
{
  "schemaVersion": 1,
  "liveJsonHash": "...",
  "discographyJsonHash": "...",
  "outputHash": "...",
  "generatedAt": "..."
}
```

## 動作

```txt
read input files
  ↓
calculate sha256
  ↓
compare .cache/zankyo-transform/manifest.json
  ↓
same:
  skip generation unless --force
different:
  regenerate
```

## force option

```bash
npm run generate:zankyo -- --force
```

## CI

CIでは毎回生成してもよい。  
ただし出力が安定していることを確認する。

## watch

v0ではwatch不要。  
必要なら `chokidar` で `static/data/live.json` と `discography.json` を監視する。

## Git管理

推奨:

```txt
static/zankyo/generated/
  Git管理するかどうかは運用次第
```

### Git管理する場合

メリット:

- 差分レビューしやすい
- 静的ホスティングに安全
- Codex/CIで変化が見える

デメリット:

- JSON差分が大きくなる

### Git管理しない場合

メリット:

- repoが軽い
- 常にビルド生成

デメリット:

- deploy環境でgenerate必須
- 出力差分レビューしにくい

推奨は最初だけGit管理。  
安定後にCI生成へ移す。
