# Relive Player v0

`/relive/` 配下だけで読み込まれる、ローカル音源プレイヤーの初期実装です。

- 音源ファイルはアプリに含めません。
- 選択された `File` オブジェクトはブラウザセッション中の React state にだけ保持します。
- IndexedDB `relive-player-v1` へ保存するのは、ファイルメタ情報とアプリ設定です。
- 再生対象のファイルにだけ `objectURL` を作成し、曲変更やアンマウント時に `URL.revokeObjectURL` します。
- `AudioContext` と Canvas の描画ループは `/relive/` ページのコンポーネント内でのみ起動します。
- 公式アプリではなく、既存非公式ファンサイト内の私的再生室として扱います。
