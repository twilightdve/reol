/**
 * 美辞学ナビ共通型定義
 * 
 * Supabaseから取得するデータの型や、
 * コンポーネント間で共有するインターフェースを定義
 */

// ==============================
// 参加者関連
// ==============================

/** Supabase profiles テーブルの行データ */
export interface Profile {
  id: string
  username: string
  full_name: string | null
  display_name: string | null
  avatar_url: string | null
  is_public: boolean
  encounter_policy: 'ok' | 'ng' | null  // null = 未設定（初回モーダル表示）
  reol_type: string | null
  meta_tags?: string[]
  email?: string
}

/** 参加者一覧で使用する参加者データ（RPC get_all_attendees の戻り値） */
export interface Attendee {
  user_id: string
  id?: string  // user_id のフォールバック
  username: string
  full_name: string | null
  avatar_url: string | null
  encounter_policy: 'ok' | 'ng' | null
  reol_type: string | null
  meta_tags: string[]
  favorite_song: string | null
  updated_at?: string | null
}

// ==============================
// メタタグ定義
// ==============================

/** メタタグのキー */
export type MetaTagKey = 'first_live' | 'reol_first'

/** メタタグの定義 */
export interface MetaTagDefinition {
  key: MetaTagKey
  label: string
  emoji: string
  color: string       // Tailwind bg class
  darkColor: string   // Tailwind dark bg class
  textColor: string
  darkTextColor: string
}

/** 利用可能なメタタグ一覧 */
export const META_TAGS: MetaTagDefinition[] = [
  {
    key: 'first_live',
    label: 'ライヴ初参戦',
    emoji: '🔰',
    color: 'bg-green-100',
    darkColor: 'dark:bg-green-900/50',
    textColor: 'text-green-700',
    darkTextColor: 'dark:text-green-300',
  },
  {
    key: 'reol_first',
    label: 'Reol初参戦',
    emoji: '✨',
    color: 'bg-purple-100',
    darkColor: 'dark:bg-purple-900/50',
    textColor: 'text-purple-700',
    darkTextColor: 'dark:text-purple-300',
  },
]

/** 参加者のユーザーIDを解決するヘルパー */
export const getAttendeeUserId = (attendee: Attendee): string => {
  return attendee.user_id || attendee.id || ''
}

// ==============================
// コメント関連（commentService.ts から再エクスポート）
// ==============================

// Comment型は commentService.ts で定義済み
// import { Comment } from '../services/commentService' で使用

/** ユーザーごとの最新コメントマップ */
export type CommentMap = { [userId: string]: import('../services/commentService').Comment }

// ==============================
// 会場参加関連
// ==============================

/** ユーザーごとの参加会場IDマップ */
export type AttendeeVenuesMap = { [userId: string]: string[] }

/** 会場ごとの参加人数マップ */
export type VenueAttendanceCountMap = { [venueId: string]: number }

/** ユーザーごとの会場別エンカ設定マップ */
export type EncounterVenueMap = { [venueId: string]: boolean | null }

/** ユーザーごとのエンカ設定マップ（参加者一覧用） */
export type AttendeeEncounterMap = { [userId: string]: EncounterVenueMap }

/** 会場ごとのチェックリスト進捗率マップ */
export type ChecklistProgressMap = { [venueId: string]: number }

// ==============================
// 日付フォーマット
// ==============================

export interface FormattedDate {
  month: number
  day: number
  dayOfWeek: string
}

// ==============================
// 都道府県マッピング（英語→日本語）
// ==============================

/**
 * 英語の都道府県名を日本語に変換するマッピング
 * グラデーション取得時に使用
 */
export const PREFECTURE_EN_TO_JA: Record<string, string> = {
  'Tokyo': '東京都',
  'Osaka': '大阪府',
  'Aichi': '愛知県',
  'Fukuoka': '福岡県',
  'Hokkaido': '北海道',
  'Miyagi': '宮城県',
  'Tochigi': '栃木県',
  'Kanagawa': '神奈川県',
  'Niigata': '新潟県',
  'Ishikawa': '石川県',
  'Shizuoka': '静岡県',
  'Kyoto': '京都府',
  'Hyogo': '兵庫県',
  'Hiroshima': '広島県',
  'Ehime': '愛媛県',
  'Nagasaki': '長崎県',
  'Kumamoto': '熊本県',
  'Kagoshima': '鹿児島県',
  'Okinawa': '沖縄県',
  'Nagano': '長野県',
  'Aomori': '青森県',
  'Tokushima': '徳島県',
  'Yamaguchi': '山口県',
  'Mie': '三重県',
  'Gifu': '岐阜県',
  'TAIPEI': 'TAIPEI',
}
