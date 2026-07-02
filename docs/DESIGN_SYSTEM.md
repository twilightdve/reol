# 美辞学ナビ デザインシステム

## フォントサイズ統一基準

### タイポグラフィスケール

#### 見出し (Headings)
- **h1**: `text-3xl` (30px) - ページタイトル
  - 例: "美辞学ナビ", "Setlist Prediction"
  
- **h2**: `text-2xl` (24px) - セクションタイトル
  - 例: "会場一覧", "投票数ランキング", モーダルタイトル
  
- **h3**: `text-xl` (20px) - サブセクションタイトル
  - 例: "参加予定会場の選択", アルバムタイトル
  
- **h4**: `text-lg` (18px) - カードタイトル
  - 例: 会場名、セットリスト予想カード

#### 本文 (Body Text)
- **本文標準**: `text-base` (16px) - 通常の説明文
  - 例: コメント本文、説明テキスト
  
- **本文小**: `text-sm` (14px) - 補足情報
  - 例: 会場詳細情報、日付表示、ボタンテキスト
  
- **キャプション**: `text-xs` (12px) - メタ情報
  - 例: タイムスタンプ、注釈、ヘルプテキスト

#### 統計・数値 (Statistics)
- **大きな数値**: `text-3xl` (30px) - 統計カード
  - 例: 総参加者数、選択会場数
  
- **中規模数値**: `text-2xl` (24px) - カード内数値

#### アイコン (Icons)
- **大**: `text-4xl` (36px) - 統計カード絵文字
- **中**: `text-2xl` (24px) - カード絵文字
- **小**: `h-5 w-5` (20px) - インライン SVG アイコン
- **極小**: `h-4 w-4` (16px) - 小さなアイコン

### 現状の問題点と修正提案

#### 1. 見出しの不統一
**問題:**
- モーダルタイトルが `text-xl` と `text-2xl` 混在
- セクションタイトルが `text-lg` と `text-2xl` 混在

**修正:**
- すべてのモーダルタイトル → `text-2xl`
- すべてのメインセクションタイトル → `text-2xl`
- すべてのサブセクション → `text-xl`
- すべてのカードタイトル → `text-lg`

#### 2. ボタンテキストの不統一
**問題:**
- ボタン内のテキストサイズが `text-xs`, `text-sm`, `text-base` 混在

**修正:**
- 主要アクションボタン → `text-sm`
- 小さいボタン → `text-xs`

#### 3. 説明テキストの不統一
**問題:**
- 説明文が `text-sm` と `text-base` 混在

**修正:**
- メイン説明 → `text-base`
- 補足説明 → `text-sm`
- 注釈 → `text-xs`

### 適用すべき修正箇所

#### ReolMapLayout.tsx
- Line 309: タイトル `text-2xl` → `text-3xl` (メインタイトル)
- Line 477: セクションタイトル `text-lg` → `text-2xl`
- Line 559: セクションタイトル `text-lg` → `text-2xl`
- Line 659: モーダルタイトル `text-xl` → `text-2xl`
- Line 787: モーダルタイトル `text-xl` → `text-2xl`

#### SettingsModal.tsx
- Line 23: モーダルタイトル `text-xl` → `text-2xl`
- Line 40: サブタイトル `text-lg` → `text-xl`

#### ProfileSideMenu.tsx
- Line 76: タイトル `text-xl` → `text-2xl`
- Line 131: セクションタイトル `text-lg` → `text-xl`

#### PasswordSetup.tsx
- Line 70: タイトル `text-xl` → `text-2xl`

#### LoginButton.tsx
- Line 68: タイトル `text-3xl` ✓ (正しい)

### スペーシング統一

#### パディング
- カード: `p-6`
- 小カード: `p-4`
- ボタン: `px-4 py-2` (標準), `px-3 py-1.5` (小)

#### マージン
- セクション間: `space-y-6`
- 要素間: `space-y-4`
- 小要素間: `space-y-2`

### カラーパレット

#### テキストカラー
- 主要テキスト: `text-gray-900 dark:text-white`
- 補足テキスト: `text-gray-600 dark:text-gray-400`
- 弱いテキスト: `text-gray-500 dark:text-gray-500`

#### アクセントカラー
- 主要アクション: `bg-emerald-600` / `text-emerald-600`
- セカンダリ: `bg-orange-600` / `text-orange-600`
- セットリスト: `bg-purple-600` / `text-purple-600`

### 実装優先度

1. **高**: 見出しサイズの統一 (h1, h2, h3)
2. **中**: 本文テキストサイズの統一
3. **低**: アイコンサイズの微調整
