# 🔧 ReolMap 開発モード設定

## ローカル動作確認手順

### 1. 環境変数設定

```bash
# 開発用環境変数ファイルを作成
cp .env.example .env.local

# 内容を編集（Firebase設定は不要）
# GATSBY_REOLMAP_DEV_MODE=true だけ追加
```

### 2. 開発サーバー起動

```bash
npm run develop
```

### 3. ReolMapアクセス

```
http://localhost:8000/reolmap/
```

## 🎯 開発モードの機能

### ✅ 利用可能な機能
- ✨ UI/UX の確認
- 🎮 会場選択機能（ローカル保存）
- 👥 モックユーザーでのログイン体験
- 📱 レスポンシブデザイン確認
- 🎨 デザインテーマ確認

### ❌ 制限事項
- 🔥 Firebase連携（認証・DB）は動作しない
- 💬 リアルタイムチャットは動作しない
- 👫 実際の参加者データは表示されない
- 💾 データ永続化はされない

## 🔧 開発モードでできること

1. **UIコンポーネントの確認**
   - ログインボタン
   - 会場選択画面
   - 参加者一覧（モックデータ）
   - ユーザープロフィール

2. **機能フローの体験**
   - ログイン → 会場選択 → 参加者確認

3. **レスポンシブデザイン**
   - モバイル・タブレット・デスクトップ対応

## 🚀 本番環境への切り替え

1. Firebase プロジェクト作成
2. `.env.local` にFirebase設定値を追加
3. `GATSBY_REOLMAP_DEV_MODE=false` に変更
4. 再起動

## 📝 開発モード用モックデータ

```json
{
  "user": {
    "username": "dev_user",
    "displayName": "開発用ユーザー", 
    "attendingVenues": ["sendai_darwin", "tokyo_shibuya_wwwx", "osaka_namba_hatch"]
  }
}
```

---

*Firebase設定なしでも、ReolMapのUI/UXを完全に体験できます！🎵*