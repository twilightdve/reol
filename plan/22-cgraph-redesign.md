# Creator Relations (`/cgraph/`) UI/UX 再設計プラン

## 背景

Six Degrees of Reol 導入以降、以下の順で場当たり的な調整を重ねてきた結果「UIがとっちらかっている」というフィードバックを受けた。

1. Six Degrees パネル追加 → z-index不足で見えない
2. From/To をドロップダウン化
3. ドロップダウンの並び順修正 + CTAボタンを目立たせる（グラデーションボタンをタイトル直下に追加）
4. 「なんだかUIがとっちらかっててUXが悪い」→ AskUserQuestionで診断: 
   - (a) ヘッダー全体（検索/PNG保存/ロールchip/年スライダー/プリセット）が情報量多すぎ
   - (b) Six Degreesパネルがグラフに重なって見づらい
5. → 「相関図全体のUIUXを再設計してほしい」（本プラン）

個別修正の繰り返しではなく、ページ全体のレイアウト・操作モデルを一度作り直す。

## 現状構造（変更前）

```
.cgraph-root (flex column, height: calc(100vh - 4rem))
├── .cgraph-header (常時表示、折りたたみは全部纏めて1段階のみ)
│   ├── タイトル + 説明文 + Six Degrees CTA（グラデーションボタン、浮いてる）
│   ├── .cgraph-controls: 検索 / 年スライダー / PNG保存 （横並び、折り返し）
│   ├── .cgraph-roles: ロールchip 9個 + release線トグル + 遠ノードトグル
│   └── .cgraph-presets: プリセットタブ5個 + 人数カウント
├── .cgraph-main (flex: 1 1 auto, position: relative)
│   ├── .cgraph-canvas (absolute inset:0)
│   ├── .cgraph-sixdeg (absolute top-left, グラフに重なる)
│   └── .cgraph-inspector (absolute top-right, グラフに重なる)
└── .cgraph-footer
```

問題点:
- ヘッダーが5段構成（タイトル/CTA/コントロール/ロール/プリセット）で常時全表示、情報が一度に流れ込む
- Six DegreesとInspectorが両方 absolute overlay で、開くとグラフを隠す。同時に開くと重なる
- グラデーションCTAだけ配色が浮いている（サイトパレットは `#fafaf5`/`#111827`/グレー+ロールchipの彩度のみ）

## 再設計の方針

### 1. ヘッダーをツールバー1段に集約

現在の4段（タイトル+説明文＋CTA / コントロール / ロール / プリセット）を、常時表示は1段の細いツールバーのみにする。

```
[Creator Relations]  [🔍検索]  [絞り込み ▾]  [Six Degrees]  [⋯ PNG保存]
```

- 検索: アイコンボタン→クリックでインライン展開（現状の常時表示inputをやめる）
- 「絞り込み」: ロールchip・年スライダー・release線トグル・遠ノードトグル・プリセットタブをまとめてポップオーバー/ドロワーに格納。トグル数が多いことは変えず、露出方法だけ変える
- 説明文（使い方の説明）はオンボーディングダイアログと重複するため、常時表示をやめて「?」ボタンからオンボーディングを再表示できるようにする
- PNG保存はテキストボタンではなく「⋯」メニュー配下（将来のエクスポート系機能もここに集約できる）

モバイルでは、絞り込みドロワーは下からのbottom sheet、検索はツールバー内で全幅展開。

### 2. Six Degrees と Inspector を「右ドック」に統一

現状は2つの absolute パネルがグラフに重なる。これを「右ドックスロット」1つに統一し、Inspector か Six Degrees のどちらかを排他的に表示する（同時に開かない）。ドックが開いている間は `.cgraph-main` を CSS Grid 2カラム（`grid-template-columns: 1fr 300px`、閉時は `1fr 0` + transition）にして、キャンバスの描画領域自体を縮める。オーバーレイではなく「グラフ領域を譲る」設計にする。

- ノードを選択 → 右ドックに Inspector を表示（Six Degreesが開いていれば閉じる）
- Six Degrees ボタン押下 → 右ドックに Six Degrees を表示（Inspectorが開いていれば閉じる）
- モバイル（640px以下）は右ドックではなく下部bottom sheetのまま（現状のInspector mobile対応を踏襲）

これにより「重なって見づらい」問題を、z-index対応ではなくレイアウト変更で解消する。

### 3. 配色の統一

- グラデーションCTA（`#f59e0b`→`#ec4899`）を廃止。ツールバーボタンはサイトの中立パレット（グレー系ボーダー + ホバーで `#111827` の淡い塗り）に統一し、Six Degreesボタンだけ強調したい場合はロールchipで使っている単色（例: vocal色等）のうち1色をアクセントボーダーとして使う程度に留める。

### 4. 影響を受けないもの（変更しない）

- BFS pathfinder、build-graph、role-config のロジックは変更しない
- Inspector内のコンテンツ構成（Reol関係セクション→その他情報の順）は現状維持
- URLパラメータ同期ロジックは維持（q/preset/year/node）
- プリセット・ロール・年フィルタの「絞り込みルール」自体は変えない。露出方法(UI)のみ変える

## 実装ステップ

1. `CGraphPage.tsx`: state整理 — `rightDock: "inspector" | "sixdegrees" | null` に統一（`selected`と`showSixDegrees`から導出しつつ排他制御）。ヘッダーJSXをツールバー1段+ポップオーバー/ドロワー2種（検索・絞り込み）に再構成
2. `cgraph.css`: `.cgraph-header` を1段ツールバーのスタイルに全面書き換え。`.cgraph-main` をgrid化しドック用カラムを追加。`.cgraph-sixdeg`/`.cgraph-inspector` の `position: absolute` overlay スタイルをドック内配置用に書き換え。グラデーションCTAスタイル削除
3. モバイル用メディアクエリ（640px以下）の再確認 — ドロワー/bottom sheet表示、ドックはbottom sheetのまま
4. 型チェック・lintを実行、`gatsby develop` で実機（PC幅・スマホ幅）確認
5. 差分確認後コミット（`static/relive/generated/*.json` の無関係diffは `git checkout --` で除外）

## 検証方法

- `npm run typecheck` / lint
- dev server起動状態で `/cgraph/` を開き、以下を目視確認:
  - ツールバーが1段に収まっている
  - 検索・絞り込みドロワーの開閉
  - ノード選択でInspectorが右ドックに出て、キャンバスが自然に縮む（重ならない）
  - Six Degrees起動でドックが切り替わる（Inspectorと同時に出ない）
  - モバイル幅（640px以下）でヘッダー折りたたみ・bottom sheetが機能する
  - PersistentMainVideoの継続再生に影響がないこと（`/cgraph/`遷移前後でiframeが維持されるか）
