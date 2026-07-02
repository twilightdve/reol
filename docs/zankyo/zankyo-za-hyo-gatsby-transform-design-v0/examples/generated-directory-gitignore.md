# .gitignore policy examples

## 生成物をGit管理する場合

`.gitignore` に追加しない。

## 生成物をGit管理しない場合

```gitignore
static/zankyo/generated/
.cache/zankyo-transform/
```

v0では生成結果の差分レビューが便利なので、最初はGit管理を推奨。
ただし `.cache/zankyo-transform/` は常にignore推奨。
