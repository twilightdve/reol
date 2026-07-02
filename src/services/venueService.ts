import { supabase } from '../lib/supabase'
import { cacheService } from './cacheService'

// キャッシュTTL設定
const CACHE_TTL = {
  TOTAL_COUNT: 5 * 60 * 1000,      // 全体参加者数: 5分
  VENUE_COUNT: 3 * 60 * 1000,      // 会場別参加者数: 3分
  VENUE_ATTENDEES: 2 * 60 * 1000,  // 会場別参加者リスト: 2分
  USER_ATTENDANCE: 30 * 1000,      // ユーザー参加状況: 30秒
}

// デバッグ用：データベースの状況を確認
export const debugDatabase = async () => {
  if (!supabase) {
    // Supabase client is null - using mock mode
    return
  }

  // Database Debug Info
  
  // 1. venue_attendancesテーブルの存在確認
  try {
    const { data: attendances, error: attendanceError } = await supabase
      .from('venue_attendances')
      .select('*')
      .limit(5)
    
    console.log('venue_attendances table:', { data: attendances, error: attendanceError })
  } catch (err) {
    console.error('venue_attendances query failed:', err)
  }

  // 2. profilesテーブルの存在確認
  try {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    console.log('profiles table:', { data: profiles, error: profileError })
  } catch (err) {
    console.error('profiles query failed:', err)
  }

  // 3. 関数の存在確認
  try {
    const { data: functionResult, error: functionError } = await supabase
      .rpc('get_total_attendees_count')
    
    console.log('get_total_attendees_count function:', { data: functionResult, error: functionError })
  } catch (err) {
    console.error('get_total_attendees_count function failed:', err)
  }

  // End Debug Info
}

// 全体の参加表明者数を取得（認証不要・ユニークユーザー数）
export const getTotalAttendeesCount = async (): Promise<number> => {
  return cacheService.get(
    'total_attendees_count',
    async () => {
      try {
        if (!supabase) {
          // 開発モードの場合は固定のモックデータを返す
          return 127 // 固定値
        }

        const { data, error } = await supabase
          .rpc('get_total_attendees_count')

        if (error) {
          console.error('Error fetching total attendees count:', error)
          // デバッグ情報も出力
          await debugDatabase()
          return 0
        }

        return data || 0
      } catch (error) {
        console.error('Error in getTotalAttendeesCount:', error)
        return 0
      }
    },
    CACHE_TTL.TOTAL_COUNT
  )
}

// 会場別の参加者数を取得（認証不要）
export const getVenueAttendanceCount = async (venueId: string) => {
  return cacheService.get(
    `venue_count:${venueId}`,
    async () => {
      try {
        if (!supabase) {
          console.log('[getVenueAttendanceCount] Supabase not available')
          return 0
        }

        const { data, error } = await supabase
          .rpc('get_venue_attendance_count', { venue_id_param: venueId })

        if (error) {
          console.error('Error fetching attendance count:', error)
          return 0
        }

        return data || 0
      } catch (error) {
        console.error('Error in getVenueAttendanceCount:', error)
        return 0
      }
    },
    CACHE_TTL.VENUE_COUNT
  )
}

// 会場別の参加者リストを取得（認証不要）
export const getVenueAttendees = async (venueId: string) => {
  return cacheService.get(
    `venue_attendees:${venueId}`,
    async () => {
      try {
        if (!supabase) {
          console.log('[getVenueAttendees] Supabase not available')
          return []
        }

        const { data, error } = await supabase
          .rpc('get_venue_attendees', { venue_id_param: venueId })

        if (error) {
          console.error('Error fetching venue attendees:', error)
          return []
        }

        return data || []
      } catch (error) {
        console.error('Error in getVenueAttendees:', error)
        return []
      }
    },
    CACHE_TTL.VENUE_ATTENDEES
  )
}

// 全参加者リストを取得（認証不要）
export const getAllAttendees = async () => {
  return cacheService.get(
    'all_attendees',
    async () => {
      try {
        if (!supabase) {
          console.log('[getAllAttendees] Supabase not available')
          return []
        }

        const { data, error } = await supabase
          .rpc('get_all_attendees')

        if (error) {
          console.error('Error fetching all attendees:', error)
          return []
        }

        return data || []
      } catch (error) {
        console.error('Error in getAllAttendees:', error)
        return []
      }
    },
    CACHE_TTL.VENUE_ATTENDEES
  )
}

// 全会場の参加者数を一括取得（認証不要）
export const getAllVenueAttendanceCounts = async (venueIds: string[]) => {
  const counts: { [venueId: string]: number } = {}
  
  await Promise.all(
    venueIds.map(async (venueId) => {
      counts[venueId] = await getVenueAttendanceCount(venueId)
    })
  )
  
  return counts
}

// ユーザーの参加状況を確認（認証必要）
export const getUserVenueAttendance = async (userId: string) => {
  return cacheService.get(
    `user_attendance:${userId}`,
    async () => {
      if (!supabase) {
        // 開発モードの場合はモックデータ
        return ['sendai_darwin', 'tokyo_shibuya_wwwx', 'osaka_namba_hatch']
      }

      try {
        const { data, error } = await supabase
          .from('venue_attendances')
          .select('venue_id')
          .eq('user_id', userId)

        if (error) {
          console.error('Error fetching user attendance:', error)
          return []
        }

        return data?.map(item => item.venue_id) || []
      } catch (error) {
        console.error('Error in getUserVenueAttendance:', error)
        return []
      }
    },
    CACHE_TTL.USER_ATTENDANCE
  )
}

// ユーザーが参加する会場IDリストを取得（認証不要）
export const getUserAttendedVenues = async (userId: string): Promise<string[]> => {
  return cacheService.get(
    `user_attended_venues:${userId}`,
    async () => {
      if (!supabase) {
        // 開発モードの場合はモックデータ
        return ['sendai_darwin', 'tokyo_shibuya_wwwx']
      }

      try {
        const { data, error } = await supabase
          .from('venue_attendances')
          .select('venue_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching user attended venues:', error)
          return []
        }

        return data?.map(item => item.venue_id) || []
      } catch (error) {
        console.error('Error in getUserAttendedVenues:', error)
        return []
      }
    },
    CACHE_TTL.USER_ATTENDANCE
  )
}

/**
 * キャッシュを無効化（データ更新時に使用）
 */
export const invalidateVenueCache = (venueId?: string, userId?: string) => {
  // 全体カウントは常に無効化
  cacheService.invalidate('total_attendees_count')
  
  if (venueId) {
    cacheService.invalidate(`venue_count:${venueId}`)
    cacheService.invalidate(`venue_attendees:${venueId}`)
  }
  
  if (userId) {
    cacheService.invalidate(`user_attendance:${userId}`)
    cacheService.invalidate(`encounter_venues:${userId}`)
  }
}

// ==============================
// エンカウント機能
// ==============================

/** ユーザーの会場別エンカウント設定を取得 */
export const getUserEncounterVenues = async (userId: string): Promise<{ [venueId: string]: boolean | null }> => {
  return cacheService.get(
    `encounter_venues:${userId}`,
    async () => {
      if (!supabase) return {}

      try {
        const { data, error } = await supabase
          .from('venue_attendances')
          .select('venue_id, encounter_ok')
          .eq('user_id', userId)

        if (error) {
          // encounter_ok カラムが存在しない場合もエラーになるので静かに空を返す
          return {}
        }

        const map: { [venueId: string]: boolean | null } = {}
        data?.forEach(item => {
          map[item.venue_id] = item.encounter_ok
        })
        return map
      } catch (error) {
        console.error('Error in getUserEncounterVenues:', error)
        return {}
      }
    },
    CACHE_TTL.USER_ATTENDANCE
  )
}

/** 会場別エンカウント設定を更新（RPC経由でRLSバイパス） */
export const updateVenueEncounter = async (userId: string, venueId: string, encounterOk: boolean | null): Promise<boolean> => {
  if (!supabase) return false

  try {
    const { data, error } = await supabase
      .rpc('update_venue_encounter', {
        target_user_id: userId,
        target_venue_id: venueId,
        new_encounter_ok: encounterOk,
      })

    if (error) {
      console.error('Error updating venue encounter:', error)
      return false
    }

    // キャッシュを無効化
    cacheService.invalidate(`encounter_venues:${userId}`)
    cacheService.invalidate('all_attendees')
    return true
  } catch (error) {
    console.error('Error in updateVenueEncounter:', error)
    return false
  }
}

/** 全会場のエンカウント設定を一括リセット（RPC経由でRLSバイパス） */
export const resetAllVenueEncounters = async (userId: string): Promise<boolean> => {
  if (!supabase) return false

  try {
    const { data, error } = await supabase
      .rpc('reset_all_venue_encounters', {
        target_user_id: userId,
      })

    if (error) {
      console.error('Error resetting venue encounters:', error)
      return false
    }

    cacheService.invalidate(`encounter_venues:${userId}`)
    cacheService.invalidate('all_attendees')
    return true
  } catch (error) {
    console.error('Error in resetAllVenueEncounters:', error)
    return false
  }
}