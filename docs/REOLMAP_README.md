# 🎵 ReolMap - 美辞学ツアー参加者マップ

Reolの全国ツアー「美辞学」の参加者を確認できるWebアプリケーション機能です。

## ✨ 主な機能

- **X認証ログイン**: Twitterアカウントでかんたんログイン
- **会場選択**: 参加予定の会場を選択・登録
- **参加者一覧**: 各会場の参加予定者をリアルタイム表示
- **ファン同士の発見**: 同じ会場に参加するファンを事前に確認
- **プライバシー保護**: 匿名参加オプション・ブロック機能

## 🚀 セットアップ手順

### 1. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Authentication → Sign-in method → Twitter を有効化
3. Firestore Database を作成（テストモードで開始）
4. Realtime Database を作成（チャット機能用）

### 2. 環境変数の設定

```bash
# .env.localファイルを作成
cp .env.example .env.local

# Firebase設定値を編集
vim .env.local
```

### 3. 依存関係のインストール

```bash
# 必要なパッケージがすでにインストール済み
npm install
```

### 4. Firebase初期化

```bash
# 会場データをFirestoreに登録
npm run init:firebase
```

### 5. 開発サーバー起動

```bash
# 開発サーバーを起動
npm run develop
```

## 📁 ディレクトリ構成

```
src/
├── components/reolmap/
│   ├── auth/                 # 認証関連コンポーネント
│   │   ├── LoginButton.tsx   # ログインボタン
│   │   └── UserProfile.tsx   # ユーザープロフィール
│   ├── venues/               # 会場関連コンポーネント
│   │   ├── VenueSelector.tsx # 会場選択
│   │   └── AttendeesList.tsx # 参加者一覧
│   └── layout/
│       └── ReolMapLayout.tsx # メインレイアウト
├── contexts/
│   └── AuthContext.tsx       # 認証コンテキスト
├── services/
│   ├── firebase.ts           # Firebase設定
│   └── firestore.ts          # Firestore操作
├── data/
│   └── venues.ts             # 会場データ
└── pages/reolmap/
    ├── index.tsx             # メインページ
    └── venue/
        └── [venueId].tsx     # 会場詳細ページ
```

## 🛠️ 技術スタック

- **フロントエンド**: Gatsby + React + TypeScript
- **スタイリング**: Tailwind CSS（既存設定継承）
- **認証**: Firebase Auth (Twitter OAuth 2.0)
- **データベース**: Firebase Firestore + Realtime Database
- **ホスティング**: GitHub Pages（既存）
- **アイコン**: Lucide React
- **通知**: React Hot Toast

## 📊 データ構造

### ユーザー情報 (Firestore: users)
```typescript
{
  id: string,                    // Twitter ID
  twitter: {
    username: string,            // @username
    displayName: string,         // 表示名
    profileImage: string,        // プロフィール画像URL
    isVerified: boolean         // 認証済みアカウントか
  },
  profile: {
    favoriteSongs?: string[],   // 好きな楽曲
    bio?: string,               // 自己紹介
    joinDate: string            // 参加日
  },
  attendingVenues: string[],    // 参加予定会場ID配列
  privacy: {
    showTwitter: boolean,       // Twitter情報表示可否
    allowDirectMessage: boolean // DM受信可否
  }
}
```

### 会場情報 (Firestore: venues)
```typescript
{
  id: string,                   // 会場ID
  name: string,                 // 会場名
  date: string,                 // 開催日時（ISO形式）
  location: {
    prefecture: string,         // 都道府県
    city: string               // 市区町村
  },
  capacity: number,            // キャパシティ
  attendees: string[],         // 参加者ID配列
  chatroom: string            // チャットルームID
}
```

### チャットメッセージ (Realtime Database: chats/{venueId}/messages)
```typescript
{
  userId: string,              // 送信者ID
  username: string,            // 送信者名
  message: string,             // メッセージ内容
  timestamp: number,           // タイムスタンプ
  type: 'text' | 'system'     // メッセージタイプ
}
```

## 🔐 Firestore セキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみ編集可能
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 会場情報は読み取りのみ
    match /venues/{venueId} {
      allow read: if request.auth != null;
      allow write: if false; // 管理者のみ
    }
  }
}
```

## 📱 ページ構成

- `/reolmap/` - メインダッシュボード
- `/reolmap/venues/` - 全会場一覧
- `/reolmap/venue/{venueId}/` - 会場詳細・参加者一覧
- `/reolmap/chat/{venueId}/` - 会場別チャット（Phase 2）

## 🚀 今後の拡張予定

### Phase 2
- リアルタイムチャット機能
- 相互フォロー検出
- 現地情報共有（グルメ・観光）
- プッシュ通知

### Phase 3
- モバイルアプリ化（PWA）
- 他アーティストへの展開
- イベント企画機能
- 公式連携

## ⚠️ 注意事項

- **プライバシー保護**: ユーザーの個人情報は最小限に留め、同意なしに表示しない
- **モデレーション**: 不適切なコンテンツの監視・対応体制が必要
- **スケーラビリティ**: ユーザー数増加に応じたFirebase料金プランの調整

## 🤝 コントリビューション

このプロジェクトはReolファンコミュニティのために開発されています。
バグ報告や機能提案はIssueまでお願いします。

---

*Let's enjoy Reol 美辞学 tour together! 🎵*