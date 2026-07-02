import { supabase } from '../lib/supabase'

export interface VenueChecklist {
  id?: number
  user_id: string
  venue_id: string
  ticket_checked: boolean
  transportation_checked: boolean
  accommodation_checked: boolean
  schedule_checked: boolean
  companion_checked: boolean
  goods_checked: boolean
  belongings_checked: boolean
  day_before_checked: boolean
  budget_checked: boolean
  sightseeing_checked: boolean
  weather_checked: boolean
  notes?: string
  created_at?: string
  updated_at?: string
}

// チェックリストを取得
export const getVenueChecklist = async (
  userId: string,
  venueId: string
): Promise<VenueChecklist | null> => {
  try {
    if (!supabase) {
      return null
    }

    const { data, error } = await supabase
      .from('venue_checklists')
      .select('*')
      .eq('user_id', userId)
      .eq('venue_id', venueId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching venue checklist:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getVenueChecklist:', error)
    return null
  }
}

// チェックリストを作成または更新
export const upsertVenueChecklist = async (
  checklist: Omit<VenueChecklist, 'id' | 'created_at' | 'updated_at'>
): Promise<VenueChecklist | null> => {
  try {
    if (!supabase) {
      return null
    }

    const { data, error } = await supabase
      .from('venue_checklists')
      .upsert(
        {
          user_id: checklist.user_id,
          venue_id: checklist.venue_id,
          ticket_checked: checklist.ticket_checked,
          transportation_checked: checklist.transportation_checked,
          accommodation_checked: checklist.accommodation_checked,
          schedule_checked: checklist.schedule_checked,
          companion_checked: checklist.companion_checked,
          goods_checked: checklist.goods_checked,
          belongings_checked: checklist.belongings_checked,
          day_before_checked: checklist.day_before_checked,
          budget_checked: checklist.budget_checked,
          sightseeing_checked: checklist.sightseeing_checked,
          weather_checked: checklist.weather_checked,
          notes: checklist.notes,
        },
        {
          onConflict: 'user_id,venue_id',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error upserting venue checklist:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in upsertVenueChecklist:', error)
    return null
  }
}

// チェックリスト項目を更新
export const updateChecklistItem = async (
  userId: string,
  venueId: string,
  field: keyof Pick<VenueChecklist, 'ticket_checked' | 'transportation_checked' | 'accommodation_checked' | 'schedule_checked' | 'companion_checked' | 'goods_checked' | 'belongings_checked' | 'day_before_checked' | 'budget_checked' | 'sightseeing_checked' | 'weather_checked'>,
  checked: boolean
): Promise<boolean> => {
  try {
    if (!supabase) {
      return false
    }

    // 既存のチェックリストを取得
    const existing = await getVenueChecklist(userId, venueId)

    if (existing) {
      // 更新
      const { error } = await supabase
        .from('venue_checklists')
        .update({ [field]: checked })
        .eq('user_id', userId)
        .eq('venue_id', venueId)

      if (error) {
        console.error('Error updating checklist item:', error)
        return false
      }
    } else {
      // 新規作成
      const newChecklist: Omit<VenueChecklist, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        venue_id: venueId,
        ticket_checked: field === 'ticket_checked' ? checked : false,
        transportation_checked: field === 'transportation_checked' ? checked : false,
        accommodation_checked: field === 'accommodation_checked' ? checked : false,
        schedule_checked: field === 'schedule_checked' ? checked : false,
        companion_checked: field === 'companion_checked' ? checked : false,
        goods_checked: field === 'goods_checked' ? checked : false,
        belongings_checked: field === 'belongings_checked' ? checked : false,
        day_before_checked: field === 'day_before_checked' ? checked : false,
        budget_checked: field === 'budget_checked' ? checked : false,
        sightseeing_checked: field === 'sightseeing_checked' ? checked : false,
        weather_checked: field === 'weather_checked' ? checked : false,
      }

      const { error } = await supabase
        .from('venue_checklists')
        .insert(newChecklist)

      if (error) {
        console.error('Error creating checklist:', error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error in updateChecklistItem:', error)
    return false
  }
}

// メモを更新
export const updateChecklistNotes = async (
  userId: string,
  venueId: string,
  notes: string
): Promise<boolean> => {
  try {
    if (!supabase) {
      return false
    }

    const existing = await getVenueChecklist(userId, venueId)

    if (existing) {
      const { error } = await supabase
        .from('venue_checklists')
        .update({ notes })
        .eq('user_id', userId)
        .eq('venue_id', venueId)

      if (error) {
        console.error('Error updating checklist notes:', error)
        return false
      }
    } else {
      const newChecklist: Omit<VenueChecklist, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        venue_id: venueId,
        ticket_checked: false,
        transportation_checked: false,
        accommodation_checked: false,
        schedule_checked: false,
        companion_checked: false,
        goods_checked: false,
        belongings_checked: false,
        day_before_checked: false,
        budget_checked: false,
        sightseeing_checked: false,
        weather_checked: false,
        notes,
      }

      const { error } = await supabase
        .from('venue_checklists')
        .insert(newChecklist)

      if (error) {
        console.error('Error creating checklist with notes:', error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error in updateChecklistNotes:', error)
    return false
  }
}

// チェックリストを削除
export const deleteVenueChecklist = async (
  userId: string,
  venueId: string
): Promise<boolean> => {
  try {
    if (!supabase) {
      return false
    }

    const { error } = await supabase
      .from('venue_checklists')
      .delete()
      .eq('user_id', userId)
      .eq('venue_id', venueId)

    if (error) {
      console.error('Error deleting venue checklist:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteVenueChecklist:', error)
    return false
  }
}

// チェックリストの進捗率を計算（0-100%）
export const calculateChecklistProgress = (checklist: VenueChecklist | null): number => {
  if (!checklist) {
    return 0
  }

  const checkItems = [
    checklist.ticket_checked,
    checklist.transportation_checked,
    checklist.accommodation_checked,
    checklist.schedule_checked,
    checklist.companion_checked,
    checklist.goods_checked,
    checklist.belongings_checked,
    checklist.day_before_checked,
    checklist.budget_checked,
    checklist.sightseeing_checked,
    checklist.weather_checked,
  ]

  const checkedCount = checkItems.filter(item => item === true).length
  const totalCount = checkItems.length

  return Math.round((checkedCount / totalCount) * 100)
}
