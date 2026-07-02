# 10. Implementation Files

## 追加ファイル案

```txt
scripts/generate-zankyo-data.ts

src/features/zankyo/data-transform/
  index.ts
  source-types.ts
  generated-types.ts
  normalize.ts
  hash.ts
  io.ts
  transform-discography.ts
  transform-live.ts
  infer-venue.ts
  match-track.ts
  classify-entry.ts
  write-generated-files.ts

src/features/zankyo/data/
  load-generated-data.ts
```

## scripts/generate-zankyo-data.ts

責務:

- CLI引数読む
- input/output path決定
- generateZankyoData呼び出し
- 結果をconsoleに出す
- エラー時process.exit(1)

例:

```ts
import { generateZankyoData } from "../src/features/zankyo/data-transform";

await generateZankyoData({
  liveJsonPath: "static/data/live.json",
  discographyJsonPath: "static/data/discography.json",
  outputDir: "static/zankyo/generated",
  cacheDir: ".cache/zankyo-transform",
  force: process.argv.includes("--force"),
});
```

## index.ts

```ts
export async function generateZankyoData(options: GenerateZankyoDataOptions) {
  const sources = await loadSources(options);
  const tracks = transformDiscographyToTracks(sources.discographies);
  const trackIndex = createTrackAliasIndex(tracks);
  const venues = transformLiveToVenues(sources.lives);
  const setlists = transformLiveToSetlists(sources.lives, trackIndex);
  const reports = createReports({ sources, tracks, venues, setlists });
  await writeGeneratedFiles(options.outputDir, { tracks, venues, setlists, reports });
}
```

## load-generated-data.ts

クライアント側で生成済みJSONを読む。

```ts
export async function loadZankyoManifest() {
  const res = await fetch(withPrefix("/zankyo/generated/manifest.json"));
  if (!res.ok) throw new Error("Failed to load zankyo manifest");
  return res.json();
}
```

## Gatsby page

```txt
src/pages/zankyo/index.tsx
```

このページは変換しない。  
生成済みJSONをfetchするだけ。
