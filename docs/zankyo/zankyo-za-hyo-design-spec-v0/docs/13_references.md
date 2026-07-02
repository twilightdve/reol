# 13. References

実装時の参照先。  
最新仕様・ブラウザ互換は必ず実装時に再確認すること。

## Web Audio

- Web Audio API
- AnalyserNode
- BiquadFilterNode
- ConvolverNode
- PannerNode
- OfflineAudioContext
- DynamicsCompressorNode

用途:

- 再生
- 周波数解析
- EQ
- 疑似リバーブ
- 空間配置
- 事前解析
- 音量安全弁

## Media / Autoplay

- Autoplay guide for media and Web Audio APIs

方針:

- ユーザー操作後に再生
- 初回 `AudioContext.resume()`
- `audio.play()` のPromise失敗を扱う

## Canvas / Animation

- Canvas API
- requestAnimationFrame

方針:

- Canvas 2Dから開始
- requestAnimationFrameで描画
- バッテリー/バックグラウンド時の停止に注意

## Local Files

- HTMLInputElement files
- multiple file input
- webkitdirectory
- File API

方針:

- 複数ファイル選択
- フォルダ選択は対応環境のみ
- File本体は永続化しない

## Persistence

- IndexedDB API

方針:

- ローカルメタ情報
- 手動紐付け
- 解析キャッシュ
- 公演記憶
- アプリ設定

## Device Integration

- Media Session API
- Screen Wake Lock API
- DeviceOrientationEvent
- Service Worker / PWA

方針:

- 便利機能は対応時のみ
- 失敗しても再生体験を壊さない
