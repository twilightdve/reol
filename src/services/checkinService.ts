import { supabase } from '../lib/supabase'

export interface CheckinUser {
  user_id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  checked_in_at: string
}

/** 会場のチェックインユーザー一覧を取得 */
export const getVenueCheckins = async (venueId: string): Promise<CheckinUser[]> => {
  if (!supabase) return []

  const { data, error } = await supabase.rpc('get_venue_checkins', {
    target_venue_id: venueId,
  })

  if (error) {
    console.error('Error fetching venue checkins:', error)
    return []
  }

  return (data as CheckinUser[]) || []
}

/** チェックインする */
export const checkinToVenue = async (userId: string, venueId: string): Promise<boolean> => {
  if (!supabase) return false

  const { error } = await supabase
    .from('venue_checkins')
    .upsert({ user_id: userId, venue_id: venueId }, { onConflict: 'user_id,venue_id' })

  if (error) {
    console.error('Error checking in:', error)
    return false
  }

  return true
}

/** チェックインを取り消す */
export const checkoutFromVenue = async (userId: string, venueId: string): Promise<boolean> => {
  if (!supabase) return false

  const { error } = await supabase
    .from('venue_checkins')
    .delete()
    .eq('user_id', userId)
    .eq('venue_id', venueId)

  if (error) {
    console.error('Error checking out:', error)
    return false
  }

  return true
}
