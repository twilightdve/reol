# 18. 実行計画書: バッチ8 — B案リデザインの磨き

作成日: 2026-07-09
ステータス: **実行中**(8a・8cの方針確定。2026-07-09ユーザー決定: **8a=オープニング演出を撤去**(BLACKBOX復活ではなく削除)、**8c=OG画像はスクリプト生成**)
体制: Sonnet 5メイン

plan/16 §2「バッチ8(B-4・任意): 磨き」の3項目を、実装前に現状調査した上で詳細化したもの。

## 0. 前提

- plan/16・plan/17(バッチ5〜7)は完了済み。本バッチは任意・優先度低として位置づけられている
- 3項目はそれぞれ独立して着手可能(依存関係なし)
- 触ってはいけない領域(plan/17 §3と同じ): bijigaku-navi/quiz/cgraph/heatmap/relive/design-preview

## 1. サブバッチ8a: オープニング演出の撤去(2026-07-09決定: 復活ではなく削除)

**方針変更**: 当初案(BLACKBOX復活+再着色)は不採用。ユーザー判断により「オープニングはなくします」で確定。以下、削除版の作業内容に置き換える。

### 削除の作業内容

1. `src/components/index/opening.tsx` を呼び出している箇所を特定し(`grep -rn "import Opening\|<Opening" src`)、呼び出し自体を削除
2. `Opening`コンポーネントが担っていた副作用(`document.body.classList.add("overflow-hidden")`によるスクロールロック、`sessionStorage`の`openingShown`フラグ、`playerRef`のミュート解除・自動再生トリガー)のうち、**他のコンポーネントが依存しているものがないか確認**。特に「動画をミュートして自動再生開始する」トリガーをOpeningが担っていた場合、削除後にその起動元がなくなるため、必要なら`PersistentMainVideo`側などに同等の初期化ロジックを移すか、そもそも同トリガーが不要か判断する
3. `src/components/index/opening.tsx`・`src/styles/opening.scss`・`src/images/cloud.png`(他で未使用なら)を削除
4. `tailwind.config.js`のOpening専用keyframe/animation(`turnAround`/`unbox`/`unboxReverse`/`byeShutter`/`shutterOpen`/`blink`/`cloud`/`intro`/`fadeOut`等、他のコンポーネントで使われていないもの)の要否を確認し、未使用なら削除(残しても実害はないが、CLAUDE.mdの「不要なものは削除してよい」方針に沿うなら削除)
5. GA4の`opening`/`unbox`イベント計測がなくなる旨を認識しておく(計測設計ドキュメントがあれば影響範囲として記録)

### 検証方針

`gatsby develop`でトップページを開き、オープニングなしで即座に本編(HomeSection等)が表示されること、スクロールロックが残留していないこと(`document.body`に`overflow-hidden`が残らないこと)を確認。

### 参考: 削除前の現状(調査時点の記録)

以下は削除前の`opening.tsx`の実装状況の記録(実装判断の根拠として残す)。

### 現状(`src/components/index/opening.tsx`、465行)

このファイルには演出が2系統実装されている。

- **現在アクティブ**(411〜461行目、`if (!onend && !isSkip) { return ... }`): 「空と雲」演出。`bg-gradient-to-br from-letter via-sky-600 to-white` + `cloud.png` の背景に、白い無地キューブ(`renderNoTitleBox`/`renderNoTitleCubeSide`)が回転し、テキスト(`text-theme`=gold「Reol」/ `text-gray-700`「Unofficial Fansite」/ `text-letter`=blue「!Legit」)が重なる。0.5秒後に自動フェードアウト。
- **現在無効**(165〜305行目 `renderUnbox`関数、462行目 `// return renderUnbox();` でコメントアウト): 旧「BLACKBOX」演出。黒背景(`bg-black`)+オレンジ(`#ea6000`)の配色で、「UNBOX?」ラベル付きキューブが浮遊し、周囲に回転した「BLACKBOX」テキストパネルが5枚配置される。クリックまたは自動タイマーで`unbox`状態になり、シャッターが開く演出(`animate-byeShutter`/`animate-shutterOpen`)で終了する。

アニメーションのkeyframe定義(`turnAround`/`unbox`/`unboxReverse`/`byeShutter`/`shutterOpen`/`blink`/`cloud`)は**すべて`tailwind.config.js`に既存**であり、新規追加は不要。`src/styles/opening.scss`は主に未使用のバブル用CSS(大半がコメントアウト済み)。

### 作業内容

1. アクティブな分岐を`renderUnbox()`ベースに切り替える(411〜461行目のクラウド演出を退役させ、462行目のコメントアウトを解除)
2. 配色をB案トークンに置き換える
   - `#ea6000`(オレンジ)→ `bx-yellow`(#e2bf57)
   - `bg-black` → `bg-bx-bg`
   - `border-white` → `border-bx-line`
   - イントロ部分の`bg-white` → `bg-bx-bg`、内側テキストの`text-black`→`text-bx-ink`
   - `text-theme`(gold)は既存のまま可、`text-letter`→`text-bx-blue`
3. 未使用になる`renderNoTitleBox`/`renderNoTitleCubeSide`、クラウド演出一式のコードを削除(CLAUDE.mdの既存方針: 不要コードは削除してよい)
4. `src/images/cloud.png`が他で使われていないか確認し、未使用なら併せて削除
5. `useReducedMotion`によるスキップ、`sessionStorage`の一度きり表示、GA4計測(`gtag({category: "click", action: "opening", label: "unbox"})`)のロジックは変更しない

### 検証方針

`gatsby develop`でトップページを開き、①自動アンボック(0.5秒後)②UNBOXクリックでの手動アンボック③`?op=0`クエリでのスキップ④`prefers-reduced-motion`時の全スキップ、の4パターンを目視確認。

### ユーザー確認が必要な点

**これは色の置き換えだけでなく体験自体の変更**(「空が晴れる」演出→「黒い箱が開く」演出)になる。デザイン判断であり、実装前に方向性の最終確認を推奨。

## 2. サブバッチ8b: era/作品別ダイナミックアクセント

### 現状確認結果

- `themeColorPrimary`/`themeColorSecondary`は discography・live 双方の実データ(`static/data/discography.json`等)に**既に個別の色が入っている**(例: 美辞学=`#B39267`/`#EAE0D7`、SHINOBI=`#140D14`/`#F1E4D3`、ULTRA C=`#3D4762`/`#5F5E64`)。プレースホルダーではなく本物の意匠データ。
- discography/liveの`enhanced-timeline-item.tsx`(バッチ7b/7cで**意図的に温存**)が`useColorPalette`フックでこれを取り込み、カード展開時の背景グラデーション・バッジ色に**直接DOM操作(`card.style.background = ...`)**で適用している。フォールバックは`#6366f1`(indigo)/`#8b5cf6`(purple)。
- `src/styles/dynamic-colors.css`は上記とは**別物**で、`/dynamic-color-demo/`という独立した実験ページ専用のCSS変数ベースのスタイル。本番の discography/live カードには使われていない。

### 作業内容

1. `dynamic-colors.css`自体に手を入れる必要は基本的にない(対象ページが異なるため)。`/dynamic-color-demo/`ページの要否(本番導線に載っているか、削除してよいか)は別途要確認
2. 実際に着手すべきは、`enhanced-timeline-item.tsx`の`colorPalette.primary/secondary`から作る背景グラデーションが、`bx-bg`(#0b0b10)の暗い背景の上で**コントラスト・視認性を保てているかの点検**。暗い作品色(例: SHINOBI `#140D14`)は背景に沈んで見えなくなる懸念がある
3. 必要なら、明度が低い色に対してのみ薄い発光オーバーレイを足す、またはテキスト側の`getContrastTextColor`しきい値を調整する程度の小規模な補正で対応できる見込み
4. フォールバック色(`#6366f1`/`#8b5cf6`)をbx-blue/bx-blueLight系に変更するかどうかも判断が必要(現状のfallbackは紫系でbxパレットと系統が異なる)

### 検証方針

明度・彩度の異なる作品色を数件(暗い色/明るい色/低彩度色)develop上でサンプル展開し、テキストの可読性を目視確認。

## 3. サブバッチ8c: OG画像のダークテーマ化

### 現状確認結果

- サイト全体の既定OG画像は`src/images/ogimage.png`(および`.webp`)という**静的なPNG画像**で、`src/components/SEO.tsx`の`OG_IMAGE`定数から参照されている。中身は白背景+gold「Reol」+黒文字「Unofficial Fansite」+blue「!Legit」の旧ライトテーマデザイン。
- 一方`/quiz/reol-type/`用の16タイプ別OG画像は`scripts/generate-reol-type-og.ts`でnode-canvasを使いビルド時生成されており、**既にダーク背景+タイプ色グラデーションで実装済み**(黒基調+タイプカラーのグロー)。plan/16の「OG画像のダークテーマ化」はこちらではなく、上記の既定OG画像を指していると判断。

### 作業内容

1. `src/images/ogimage.png`を、bx-bg黒背景+bx-blue「!Legit」+bx-yellow「Reol」の新デザインで作り直す
2. **2026-07-09決定: (b)スクリプト生成を採用**。`generate-reol-type-og.ts`と同様にnode-canvasでの生成スクリプトを新設し、ビルド時生成にする
3. `.webp`版の再生成、`public/`側のコピーの整合も確認

### 検証方針

生成後の画像を目視確認。実際のSNSシェアプレビュー(X/Facebookのデバッガー等)は非公開環境のため確認できないので、画像単体の見た目とSEO.tsxの参照パス不変のみ確認する。

## 4. 実行順序

低リスク・低工数のものから着手する: **8c(OG画像) → 8b(ダイナミックアクセント点検) → 8a(オープニング撤去)**。

## 5. 事前確認事項(解消済み・2026-07-09)

| 項目 | 決定内容 |
|---|---|
| 8a | オープニング演出は復活させず撤去する |
| 8c | OG画像はnode-canvasによるスクリプト生成 |

## 6. エスカレーション基準

plan/17 §7と同様: ①同じ問題に2回失敗 ②デザイン判断がbxトークン・リファレンス実装でカバーされない ③原因不明のビルド/データ破損 ④バッチ8完了後の全体レビュー
