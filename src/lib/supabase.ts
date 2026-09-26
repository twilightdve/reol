import { createClient } from '@supabase/supabase-js'

// 環境変数の安全な取得
const getSupabaseUrl = () => {
  if (typeof window === 'undefined') {
    // サーバーサイドでは環境変数が利用できない場合があります
    return process.env.GATSBY_SUPABASE_URL || ''
  }
  return process.env.GATSBY_SUPABASE_URL || ''
}

const getSupabaseAnonKey = () => {
  if (typeof window === 'undefined') {
    return process.env.GATSBY_SUPABASE_ANON_KEY || ''
  }
  return process.env.GATSBY_SUPABASE_ANON_KEY || ''
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseAnonKey()

// ログイン/新規登録時にサーバーが発行するセッショントークン。
// DB側のRLSは x-session-token ヘッダーのトークンから「誰のリクエストか」を判定するため、
// 全リクエストに付けて送る(supabase-session-token-phase-a.sql / phase-b.sql)。
const SESSION_TOKEN_KEY = 'reol_session_token'

export const getSessionToken = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY)
  } catch {
    return null
  }
}

export const setSessionToken = (token: string) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, token)
  } catch {
    // localStorageが使えない環境ではトークンを保持できない(書き込みはサーバーで拒否される)
  }
}

export const clearSessionToken = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY)
  } catch {
    // ignore
  }
}

export const fetchWithSessionToken: typeof fetch = (input, init) => {
  const token = getSessionToken()
  if (!token) return fetch(input, init)
  // 第1引数が Request の場合、init にヘッダーが無ければ Request 側のヘッダーを引き継ぐ
  const baseHeaders =
    init?.headers ??
    (typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined)
  const headers = new Headers(baseHeaders)
  headers.set('x-session-token', token)
  return fetch(input, { ...init, headers })
}

// 開発モードまたは環境変数が設定されていない場合はnullクライアントを返す
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase設定が見つかりません。開発モードを使用してください。')
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      fetch: fetchWithSessionToken,
    },
  })
}

export const supabase = createSupabaseClient()

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          reol_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          reol_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          reol_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      venue_attendances: {
        Row: {
          id: string
          user_id: string
          venue_id: string
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          venue_id: string
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          venue_id?: string
          is_public?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      public_venue_attendances: {
        Row: {
          id: string
          venue_id: string
          created_at: string
          username: string
          full_name: string | null
          avatar_url: string | null
        }
      }
    }
    Functions: {
      get_venue_attendance_count: {
        Args: { venue_id_param: string }
        Returns: number
      }
      get_venue_attendees: {
        Args: { venue_id_param: string }
        Returns: Array<{
          username: string
          full_name: string | null
          avatar_url: string | null
          joined_at: string
        }>
      }
    }
  }
}