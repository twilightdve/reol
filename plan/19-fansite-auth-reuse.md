# 19. 検討メモ: 美辞学ナビ認証基盤のファンサイト転用

作成日: 2026-07-10
ステータス: 計画(実装前・ユーザー確認待ち)

## 0. 背景

美辞学ツアーが2026-07-10にファイナルを迎え終了することで、`bijigaku-navi`配下は近く不要になる見込み。
ただしそこで使っているログイン・プロフィール基盤(Supabase)は、ファンサイト側に転用したいという要望。

用途として挙がっているのは以下の2点。

1. **ファンタイプ診断(`/quiz/reol-type/`)の結果をアカウントに保存**
2. **LIVEページに「参戦した」フラグを付けられるようにする**(将来的機能)

## 1. 現状調査で判明したこと

- 認証基盤(`src/contexts/AuthContext.tsx`, `src/services/authService.ts`, `src/lib/supabase.ts`)は**bijigaku-navi専用ではなく、サイト共通のSupabaseプロジェクト**(環境変数`GATSBY_SUPABASE_URL`/`GATSBY_SUPABASE_ANON_KEY`)を使っている。コードの生成物としては既に「サイト全体で使える」形。
- `AuthProvider`は現状`src/pages/bijigaku-navi/setlist-prediction.tsx`でのみラップされている(他のページはコンテキスト未提供)。
- **タイプ診断結果の保存は実質ほぼ実装済み**: `src/pages/quiz/reol-type/index.tsx`が`localStorage.getItem('reol_user_profile')`(bijigaku-naviログイン時にAuthContextが書き込むキー)を直接参照し、`profile.reol_type`があれば「前回の診断結果」として表示する連携が既に組まれている。`profiles`テーブルにも`reol_type`カラムが既に存在する。
  - つまり `AuthProvider` をquizページ(または全ページ共通)にラップし、ログインUIを出すだけで、既存のauto-sync処理(`AuthContext.tsx`の`signIn`内、192行目付近)によりタイプ診断結果の保存・復元が動作する見込み。
- **LIVE「行った」フラグの雛形も存在**: `src/components/attendance/AttendanceButton.tsx` + Supabaseの`venue_attendances`テーブルとして、bijigaku-naviの会場ページ向けに同種の「参加表明」機能が既に実装されている。
  - ただしこれは`venueId`(会場ID)をキーにしており、ファンサイトの`Live`/`LiveItem`(公演・セット単位)とはデータモデルが異なる。そのままは使えず、**新規テーブル(例: `live_attendances`、`live_item_uuid`キー)を追加してAttendanceButtonと同様の設計を踏襲する**形になる見込み。

## 2. 想定スコープ(未実装・要合意)

### 2a. ログインUIのファンサイトへの露出

- どのページ/導線からログイン・新規登録できるようにするか(例: ヘッダーにログインボタン、`/mypage/`的な専用ページ新設 等)
- 現在の`QuickRegistrationModal`はユーザーID+パスワード方式(Xの投稿URLでの本人確認等、bijigaku-navi文脈の項目を含む可能性があるため要確認・簡略化が必要かも)

### 2b. タイプ診断結果の保存

- `AuthProvider`を`/quiz/reol-type/`配下(または全ページ)にラップ
- ログイン状態に応じた「診断結果を保存する」導線をquiz結果画面に追加
- 未ログイン時のUX(ゲストのまま診断は継続可能にし、ログインすると保存、程度が妥当か)

### 2c. LIVE参戦フラグ(将来機能)

- Supabaseに新規テーブル(`live_attendances`: `user_id`, `live_item_uuid`, `is_public`, `created_at`等)を追加
- RLS(Row Level Security)ポリシーの設計(本人のみ書き込み可、公開設定に応じた閲覧制御)
- LIVEページ(`live-item.tsx`/`enhanced-timeline-item.tsx`)にAttendanceButton相当のUIを追加

## 3. リスク・確認事項

- **データベースの破壊的変更に該当しうる**(新規テーブル追加自体は非破壊だが、Supabase側の変更はCLAUDE.mdの「作業前に確認する」対象)
- **認証情報・シークレットに関わる領域**(同上、要確認対象)
- 美辞学ナビ終了後、`bijigaku-navi`配下のコード自体を削除するかどうかは別途判断が必要(認証基盤だけ残し、UIページは削除する場合、`AttendanceButton`等bijigaku-navi専用コンポーネントの扱いも整理が要る)
- スコープが大きいため、2b(タイプ診断保存)と2c(LIVE参戦フラグ)は別バッチとして段階的に実施するのが妥当と考えられる

## 4. 次のアクション

上記2a〜2cについて、優先順位・UI方針をユーザーと合意した上で、実装計画を詳細化する。
