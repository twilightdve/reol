# Supabase F5アタック対策

## 概要

美辞学ナビでは、F5連打やDDoS攻撃によるコスト増大を防ぐため、以下の対策を実装しています。

## 実装内容

### 1. クライアント側キャッシュ（`cacheService.ts`）

**特徴:**
- メモリベースのLRUキャッシュ
- TTL（Time To Live）設定によるキャッシュ有効期限管理
- 重複リクエスト防止（同じキーで複数回呼ばれた場合は最初のリクエストを待つ）
- 自動クリーンアップ（5分ごと）

**キャッシュTTL設定:**
```typescript
TOTAL_COUNT: 5分          // 全体参加者数
VENUE_COUNT: 3分          // 会場別参加者数
VENUE_ATTENDEES: 2分      // 会場別参加者リスト
USER_ATTENDANCE: 30秒     // ユーザー参加状況
```

**使用例:**
```typescript
// venueService.tsで自動的に使用
const count = await getTotalAttendeesCount() // キャッシュから返される（5分間）
```

### 2. Row Level Security (RLS)

**テーブルポリシー:**

#### profiles テーブル
- ✅ SELECT: 全ユーザー閲覧可能
- ✅ INSERT: 全ユーザー作成可能（簡易認証のため）
- ✅ UPDATE: 全ユーザー更新可能（簡易認証のため）
- ❌ DELETE: 削除不可

#### venue_attendances テーブル
- ✅ SELECT: 全ユーザー閲覧可能
- ✅ INSERT: 全ユーザー作成可能（簡易認証のため）
- ❌ UPDATE: 更新不可（削除して再作成）
- ✅ DELETE: 全ユーザー削除可能（簡易認証のため）

### 3. Supabase関数（SECURITY DEFINER）

**get_total_attendees_count()**
- ユニークユーザー数をカウント
- 認証不要で実行可能
- 関数レベルで権限制御

**get_venue_attendance_count(venue_id)**
- 会場別の参加者数を取得
- 認証不要で実行可能

**get_venue_attendees(venue_id)**
- 会場別の参加者リストを取得
- プロフィール情報と結合
- 認証不要で実行可能

### 4. インデックス設定

パフォーマンス向上のため以下のインデックスを作成:
```sql
idx_venue_attendances_user_id
idx_venue_attendances_venue_id
idx_venue_attendances_created_at
```

## セットアップ手順

### 1. Supabase SQLエディタでRLS設定を実行

```bash
# supabase-rls-setup.sql の内容をコピー
# Supabase Dashboard > SQL Editor > New Query
# SQLを貼り付けて実行
```

### 2. キャッシュの動作確認

開発環境でキャッシュが正常に動作しているか確認:

```typescript
import { cacheService } from './services/cacheService'

// キャッシュ状態をチェック
console.log('Cache size:', cacheService['cache'].size)

// 手動でキャッシュをクリア（必要に応じて）
cacheService.clear()
```

### 3. データ更新時のキャッシュ無効化

参加表明/取り消し時に自動的にキャッシュが無効化されます:

```typescript
// AttendanceButton.tsx, VenueSelector.tsx で自動実行
invalidateVenueCache(venueId, userId)
```

## コスト削減効果

### キャッシュなしの場合（F5連打）
- 10秒間に100回リクエスト = 100 requests
- 1時間 = 36,000 requests
- 1日 = 864,000 requests

### キャッシュありの場合
- 10秒間に100回リクエスト = 1 request（残り99回はキャッシュから）
- 1時間 = 360 requests（5分キャッシュの場合）
- 1日 = 8,640 requests

**削減率: 約99%**

## 追加の推奨対策

### 1. Supabase設定

**APIレート制限:**
```
Dashboard > Settings > API
- Rate Limiting: 有効化
- Max Requests per Second: 10-20（適宜調整）
```

### 2. Cloudflare設定（推奨）

**WAFルール:**
- Rate Limiting: 1分間に60リクエストまで
- Bot Fight Mode: 有効化
- Challenge Passage: 有効化

**例:**
```
(http.request.uri.path contains "/api/") and 
(rate(1m) > 60)
```

### 3. 監視・アラート

**Supabase Dashboard:**
- Database > Usage: 定期的に確認
- API > Usage: リクエスト数を監視

**アラート設定:**
- 1時間のリクエスト数が10,000を超えたら通知
- Database接続数が上限の80%を超えたら通知

## トラブルシューティング

### キャッシュが効かない

```typescript
// キャッシュの状態を確認
import { cacheService } from './services/cacheService'
console.log('Cache entries:', Array.from(cacheService['cache'].keys()))
```

### データが古い

```typescript
// 手動でキャッシュを無効化
import { invalidateVenueCache } from './services/venueService'
invalidateVenueCache(venueId, userId)
```

### RLSエラー

```sql
-- Supabase SQL Editorで確認
SELECT * FROM profiles LIMIT 1;
SELECT * FROM venue_attendances LIMIT 1;

-- ポリシーを確認
SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'venue_attendances');
```

## 注意事項

1. **簡易認証について**
   - 現在のRLSポリシーは簡易認証用（true設定）
   - 本格的な認証が必要な場合は`auth.uid()`を使用

2. **キャッシュの限界**
   - ブラウザのメモリに保存されるため、タブを閉じるとクリア
   - 複数タブ間での共有はされない
   - サーバーサイドキャッシュ（Redis等）も検討可能

3. **コスト監視**
   - Supabaseの無料枠: 500MB Database, 2GB Bandwidth/month
   - 超過時の従量課金に注意

## 参考リンク

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Cloudflare Rate Limiting](https://developers.cloudflare.com/waf/rate-limiting-rules/)
