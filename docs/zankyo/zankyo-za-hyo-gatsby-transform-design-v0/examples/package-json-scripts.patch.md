# package.json scripts example

既存scriptsに合わせて調整すること。

```json
{
  "scripts": {
    "generate:zankyo": "tsx scripts/generate-zankyo-data.ts",
    "generate:zankyo:force": "tsx scripts/generate-zankyo-data.ts --force",
    "predevelop": "npm run generate:zankyo",
    "prebuild": "npm run generate:zankyo",
    "develop": "gatsby develop",
    "build": "gatsby build"
  }
}
```

`tsx` が入っていない場合:

```bash
npm install -D tsx
```

既に `prebuild` / `predevelop` がある場合は、既存処理を壊さず連結する。
