# Codex Implementation Prompt

あなたは熟練のフロントエンドエンジニアです。  
このリポジトリに、設計書に従って「残響座標」のv0実装を追加してください。

## プロダクト概要

残響座標は、ユーザーが自分で用意したローカル音源をブラウザ内で再生・解析し、Reolのライブ体験を「公演・会場・立ち位置・音響・余韻」として再構成するスマホファーストのローカルプレイヤーです。

## 絶対に守ること

- 音源ファイルをサーバーへアップロードしない
- 音源ファイルを配信しない
- 音源ファイル、歌詞、ジャケット、公式ロゴ、ライブ映像をアプリに含めない
- SNS切り抜きモード、投稿用動画生成、共有機能、デモモードを作らない
- 音声再生はユーザー操作後に開始する
- ローカルファイルの `File` オブジェクトはセッション中だけ保持し、永続化しない
- 永続化するのはファイルメタ情報、解析キャッシュ、手動紐付け、記憶プリセットだけ
- まずはスマホ縦画面を第一対象にする
- 処理が重い場合は軽量モードへフォールバックする

## 初期実装範囲 v0

以下を実装してください。

1. ローカル音源フォルダ/複数ファイル選択
   - `multiple`
   - `webkitdirectory` は使える場合だけ
   - 対応候補: flac, mp3, m4a, aac, wav
   - 選択後、ファイル一覧を `LocalTrackRecord` に変換する

2. ローカル音源ライブラリ
   - ファイル名、相対パス、サイズ、最終更新時刻、拡張子、簡易メタ情報
   - `fileKey = relativePath or name + size + lastModified`
   - File本体は保存しない

3. 再生プレイヤー
   - 再生 / 停止 / シーク
   - 次曲 / 前曲
   - ユーザー操作後に `AudioContext` を開始
   - `HTMLAudioElement` + `createMediaElementSource` を基本にする

4. Web Audio解析
   - `AnalyserNode` で低域・中域・高域・RMS相当を取る
   - 擬似 `kickLike`, `snareLike`, `hatLike`, `bassFlow`, `vocalBloom` を算出
   - 初期は簡易アルゴリズムでよい
   - 解析値はCanvas描画へ渡す

5. Canvas残光アート
   - スマホ縦画面
   - 黒に近い背景
   - 音圧で中央光核が沈む/膨らむ
   - 高域ピークで亀裂
   - ハイハット相当で粒子
   - 音が小さくなっても残光が減衰しながら残る

6. 会場タイププリセット
   - live_house / hall / arena / outdoor
   - EQ、疑似リバーブ、初期反射、空間サイズ、仮想PA位置
   - 実装はまず型と設定画面/選択だけでもよい
   - 音響処理は段階的に実装してよい

7. 立ち位置マップ
   - 2Dマップでリスナー位置を編集
   - x: 左右、z: ステージからの距離
   - 位置に応じてビジュアルの偏りを変える
   - 音響への反映は後続フェーズでもよい

8. セトリJSON読み込み
   - static JSONからSetlistをロード
   - TrackMasterと照合
   - ローカルライブラリと曲名照合
   - matched / candidate / missing / special を表示
   - 候補は手動紐付け可能にする

9. IndexedDB
   - localTracks
   - manualTrackMappings
   - audioAnalysisCaches
   - liveMemoryPresets
   - playbackQueues
   - appSettings
   - まずはidbライブラリ利用可

10. 基本UI
    - Home: 音源フォルダを選ぶ
    - Library: 音源一覧
    - Setlist: セトリ選択と充足チェック
    - Player: Canvas残光、最小限の曲情報、再生操作
    - Memory: 立ち位置、無言タグ、会場/公演記憶

## 使う型

`src/zankyo-types.ts` を実装の基準にしてください。必要なら型を追加してよいですが、既存の概念分離を壊さないでください。

特に以下を混同しないでください。

- TrackMaster: 曲の概念
- LocalTrackRecord: ユーザー端末内のファイル情報
- ManualTrackMapping: 曲とファイルの手動紐付け
- VenuePreset: 会場の性質
- LiveMemoryPreset: その日の公演記憶
- AudioAnalysisCache: ファイルごとの解析結果
- PlaybackQueue: 実際に再生可能なキュー

## 実装優先順位

### Phase 1
- 型定義
- ファイル選択
- ローカルライブラリ構築
- 基本再生
- Canvas残光

### Phase 2
- Web Audio解析
- 低中高域反応
- 擬似音ハメ
- セトリ充足チェック

### Phase 3
- 会場プリセット
- EQ
- 疑似リバーブ
- 立ち位置
- 公演記憶保存

### Phase 4
- PWA
- Media Session
- Wake Lock
- オフライン対応
- 軽量モード

## 完了条件

`docs/12_acceptance_criteria.md` を参照してください。
