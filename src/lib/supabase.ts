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
    }
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