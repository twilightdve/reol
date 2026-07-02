# 残響座標 Design Spec v0

残響座標は、ユーザーが自分で用意したローカル音源をブラウザ内で再生・解析し、Reolのライブ体験を「公演・会場・立ち位置・音響・余韻」として再構成するスマホファーストのローカルプレイヤーです。

## 重要な前提

- 音源はアプリに含めない
- 音源をアップロードしない
- 音源を配信しない
- 歌詞、ジャケット画像、公式ロゴ、ライブ映像は扱わない
- SNS切り抜きモード、投稿支援、共有機能、デモモードは作らない
- ユーザーが自分の端末内の音源フォルダを選んだときだけ起動する
- 公開Webアプリではあるが、音楽サービスではなく「私的再生室」として設計する

## ドキュメント構成

- `00_codex_prompt.md`  
  Codexへ渡す実装依頼プロンプト。

- `01_product_requirement.md`  
  プロダクト要件定義。

- `02_system_architecture.md`  
  システム構成、レイヤー、依存関係。

- `03_data_model.md`  
  データモデル設計。TypeScript定義は `src/zankyo-types.ts` にも切り出し。

- `04_storage_and_file_handling.md`  
  ローカルファイル選択、フォルダ選択、IndexedDB、キャッシュ設計。

- `05_audio_engine.md`  
  Web Audio、EQ、3D音像、疑似リバーブ、音声解析。

- `06_visual_engine.md`  
  Canvas残光アート、音ハメエフェクト、会場・記憶連動。

- `07_setlist_matching.md`  
  セトリ充足チェック、曲名照合、手動紐付け。

- `08_ui_ux_mobile.md`  
  スマホファーストUI/UX。

- `09_pwa_device_integration.md`  
  PWA、オフライン、Media Session、Wake Lock、傾き連動。

- `10_security_privacy_copyright.md`  
  ローカル完結、権利・プライバシー・安全方針。

- `11_implementation_plan.md`  
  実装フェーズ、タスク分解。

- `12_acceptance_criteria.md`  
  受け入れ条件。

- `13_references.md`  
  参考Web API資料。

- `contracts/sample-static-data-contract.md`  
  静的JSON・DB連携の契約。

- `src/zankyo-types.ts`  
  実装用TypeScript型定義。

## 推奨初期スタック

- Next.js App Router
- React
- TypeScript
- Canvas 2D
- Web Audio API
- IndexedDB
- PWA対応
- 最初はWebGL/three.jsを使わない
