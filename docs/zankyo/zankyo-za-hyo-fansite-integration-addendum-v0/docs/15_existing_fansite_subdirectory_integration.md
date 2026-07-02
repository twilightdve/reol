# 15. Existing Fansite Subdirectory Integration

## 目的

残響座標を、既存のReolファンサイトのサブディレクトリ配下に実装する。

例:

```txt
https://example.com/zankyo/
https://example.com/zankyo/player
https://example.com/zankyo/setlists
```

またはGitHub Pages等なら:

```txt
https://username.github.io/fansite/zankyo/
```

## 位置付け

残響座標は独立サービスではなく、既存ファンサイト内の隔離された機能領域。

```txt
Existing Reol Fansite
  ├ Discography
  ├ Live Setlists
  ├ Sacred Places
  └ Zankyo / 残響座標
```

ただしUIや思想はサービス寄りにしない。  
ファンサイトの情報アーカイブから、ローカル音源を使う私的再生室へ入る導線として扱う。

## 推奨ルート

第一候補:

```txt
/zankyo/
```

理由:

- 短い
- 日本語名「残響座標」と対応する
- 既存ファンサイトの他機能と衝突しにくい
- PWA scopeを切りやすい

第二候補:

```txt
/afterglow/
```

英語寄りにしたい場合。

## 実装方式

### 方式A: 既存Gatsby/Reactサイト内に直接実装

既存ファンサイトがGatsby/Reactの場合の推奨。

```txt
src/pages/zankyo/index.tsx
src/features/zankyo/
src/features/zankyo/audio-engine/
src/features/zankyo/visual-engine/
src/features/zankyo/setlist/
src/features/zankyo/storage/
src/data/zankyo/
```

メリット:

- 既存のデータ/ビルド/デプロイに乗せやすい
- 既存サイトのセトリDBやJSON生成フローを使いやすい
- URL設計が自然
- GitHub Pages等の静的ホスティングに載せやすい

注意:

- 残響座標関連の状態・IndexedDB・PWA scopeを既存サイトから分離する
- 既存サイト全体のService Workerと競合させない
- 既存サイトのグローバルCSSにCanvas/Playerが壊されないようにする

### 方式B: 別ビルドの静的マイクロアプリを `/zankyo/` に配置

既存サイトと依存関係を分けたい場合。

```txt
apps/zankyo/
  build output → public/zankyo/
```

メリット:

- 既存サイトを壊しにくい
- PWA/Service Workerのscopeを `/zankyo/` に限定しやすい
- 音響・Canvasまわりの依存を隔離できる

注意:

- asset pathを必ず `/zankyo/` 前提にする
- 既存サイトとデータ連携する場合、static JSONの配置ルールを決める
- ビルド/デプロイスクリプトが少し増える

## Gatsby前提の注意

既存Gatsbyサイトにページとして入れるなら、通常は `/src/pages/zankyo/index.tsx` で `/zankyo/` を作る。

もしサイト全体がGitHub Pagesのプロジェクトページなどサブパス配下にデプロイされている場合は、Gatsbyの `pathPrefix` と `--prefix-paths` の既存設定に合わせる。

例:

```js
// gatsby-config.js
module.exports = {
  pathPrefix: "/reol-fansite",
}
```

既存サイトがすでに `pathPrefix` を使っている場合、残響座標側でURLを直書きしない。  
`withPrefix` や既存のURL helperを使う。

## Next.jsを別ビルドする場合

Next.jsで別マイクロアプリとして作るなら、サブパス用に `basePath` を使う。

```js
// next.config.js
const nextConfig = {
  output: "export",
  basePath: "/zankyo",
}

module.exports = nextConfig
```

注意:

- `basePath` はビルド時設定
- deploy先の実パスと一致させる
- App Router static exportで使えない機能を避ける
- 音源処理は全てclient componentで行う

## Service Worker / PWA Scope

残響座標のService Workerを登録する場合は、scopeを `/zankyo/` に限定する。

```ts
navigator.serviceWorker.register("/zankyo/sw.js", {
  scope: "/zankyo/",
});
```

既存ファンサイト全体のService Workerがある場合:

- 既存SWが `/` scopeなら競合に注意
- 残響座標専用SWを使わない選択肢もある
- v0ではPWAを後回しにしてもよい
- PWA化する場合、キャッシュ対象はアプリ本体と静的JSONのみ
- 音源ファイルは絶対にキャッシュしない

## IndexedDB namespace

既存ファンサイトのDBと衝突しない名前にする。

```ts
const DB_NAME = "zankyo-za-hyo-v1";
```

store名:

```txt
localTracks
manualTrackMappings
audioAnalysisCaches
liveMemoryPresets
playbackQueues
appSettings
```

もし既存ファンサイト側でもIndexedDBを使っている場合、DB名を必ず分ける。

## Static JSON配置

既存ファンサイトのセトリDB/スプレッドシートから、残響座標用にJSONを生成する。

推奨配置:

```txt
/static/zankyo/tracks.json
/static/zankyo/venues.json
/static/zankyo/setlists/*.json
```

Gatsbyの `static` ディレクトリに置く場合、ビルド後にルート配下へコピーされるため、最終URLは以下のようにする。

```txt
/zankyo/tracks.json
/zankyo/venues.json
/zankyo/setlists/sample.json
```

ただし既存サイトがpathPrefix配下ならprefix込み。

## URL helper

サブディレクトリやpathPrefixに強くするため、URLを直書きしない。

```ts
const ZANKYO_BASE_PATH = process.env.GATSBY_ZANKYO_BASE_PATH ?? "/zankyo";

export function zankyoPath(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${ZANKYO_BASE_PATH}${clean}`;
}
```

GatsbyのpathPrefixを使っているなら、既存の `withPrefix` と合わせる。

## 既存ファンサイトとのデータ連携

既存側:

- 曲マスタ
- セトリ
- 公演情報
- 会場名
- 日付

残響座標側:

- 音源ファイルは持たない
- ユーザーのローカルライブラリと照合する
- TrackMaster/Setlist/VenuePreset JSONだけ読む

## 既存サイトナビへの出し方

大きく宣伝しない。  
隠し扉寄りでよい。

例:

```txt
Tools
  └ 残響座標
```

またはライブセトリページからだけ導線を出す。

```txt
このセトリを残響座標で開く
```

このリンクは音源を持つ人だけが意味を持つ。

## セトリページとの連携

既存セトリページから残響座標へ渡すURL。

```txt
/zankyo/?setlist=bijigaku-2026-asahikawa
```

残響座標はクエリを読み、該当Setlist JSONをロードする。

直接音源は渡さない。

## ルーティング案

```txt
/zankyo/
  Home / audio folder selection

/zankyo/library/
  local audio library

/zankyo/setlists/
  setlist selection and readiness check

/zankyo/player/
  player and afterglow canvas

/zankyo/memory/
  live memory presets

/zankyo/settings/
  local settings
```

v0では `/zankyo/` 単一画面にまとめてもよい。

## 実装時の追加制約

- 既存ファンサイトの通常ページにAudioContextを作らない
- `/zankyo/` に入るまで音声関連コードをロードしない
- dynamic importで音響/Canvasエンジンを遅延ロードする
- ファンサイトの通常閲覧パフォーマンスに影響させない

例:

```tsx
const ZankyoApp = React.lazy(() => import("../features/zankyo/ZankyoApp"));
```

Nextなら:

```tsx
const ZankyoApp = dynamic(() => import("@/features/zankyo/ZankyoApp"), {
  ssr: false,
});
```

## Build / Deploy

### 同一Gatsbyサイト内

```txt
gatsby build
deploy public/
```

残響座標のstatic JSONも同じビルド成果物に含める。

### 別マイクロアプリ

```txt
build fansite
build zankyo
copy zankyo/out/* → fansite/public/zankyo/
deploy fansite/public/
```

## 受け入れ条件追加

- `/zankyo/` 以外のページでAudioContextや重いCanvas処理が起動しない
- `/zankyo/` 配下でローカル音源選択ができる
- 既存ファンサイトの通常ページ表示に影響しない
- 既存のセトリデータからSetlist JSONを読める
- Service Workerを使う場合、scopeが既存サイトを侵食しない
- IndexedDB名が既存サイトと衝突しない
- 既存サイトのナビゲーションに公式アプリと誤認される表現を置かない
