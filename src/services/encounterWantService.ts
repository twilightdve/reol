import { supabase } from '../lib/supabase'

/** 自分が「エンカしたい」を押した対象ユーザーIDリストを取得 */
export const getMyEncounterWants = async (userId: string): Promise<string[]> => {
  if (!supabase) return []

  const { data, error } = await supabase.rpc('get_encounter_wants', {
    target_user: userId,
  })

  if (error) {
    console.error('Error fetching encounter wants:', error)
    return []
  }

  return (data as { target_user_id: string }[])?.map(d => d.target_user_id) || []
}

/** 全ユーザーの「エンカしたい」された数を取得 */
export const getEncounterWantCounts = async (): Promise<Record<string, number>> => {
  if (!supabase) return {}

  const { data, error } = await supabase.rpc('get_encounter_want_counts')

  if (error) {
    console.error('Error fetching encounter want counts:', error)
    return {}
  }

  const counts: Record<string, number> = {}
  for (const row of (data as { target_user_id: string; want_count: number }[]) || []) {
    counts[row.target_user_id] = row.want_count
  }
  return counts
}

/** 自分に「エンカしたい」を押してくれたユーザーIDリストを取得 */
export const getWhoWantsMe = async (userId: string): Promise<string[]> => {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('encounter_wants')
    .select('user_id')
    .eq('target_user_id', userId)

  if (error) {
    console.error('Error fetching who wants me:', error)
    return []
  }

  return (data as { user_id: string }[])?.map(d => d.user_id) || []
}

/** エンカしたいをトグル（追加/解除） */
export const toggleEncounterWant = async (
  userId: string,
  targetUserId: string
): Promise<boolean> => {
  if (!supabase) return false

  // まず既存のレコードを確認
  const { data: existing } = await supabase
    .from('encounter_wants')
    .select('id')
    .eq('user_id', userId)
    .eq('target_user_id', targetUserId)
    .maybeSingle()

  if (existing) {
    // 既にある → 解除
    const { error } = await supabase
      .from('encounter_wants')
      .delete()
      .eq('user_id', userId)
      .eq('target_user_id', targetUserId)

    if (error) {
      console.error('Error removing encounter want:', error)
      return false
    }
  } else {
    // ない → 追加
    const { error } = await supabase
      .from('encounter_wants')
      .insert({ user_id: userId, target_user_id: targetUserId })

    if (error) {
      console.error('Error adding encounter want:', error)
      return false
    }
  }

  return true
}
