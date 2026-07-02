import { supabase } from '../lib/supabase'

export interface Comment {
  id: string
  user_id: string
  venue_id: string | null
  content: string
  created_at: string
  updated_at: string
  username?: string
  full_name?: string
  avatar_url?: string
}

/**
 * 全体コメントを取得
 */
export const getGlobalComments = async (): Promise<Comment[]> => {
  if (!supabase) return []
  
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        user_id,
        venue_id,
        content,
        created_at,
        updated_at,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .is('venue_id', null)
      .order('created_at', { ascending: false })

    if (error) throw error

    // プロフィール情報をフラット化
    return (data || []).map((comment: any) => ({
      id: comment.id,
      user_id: comment.user_id,
      venue_id: comment.venue_id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      username: comment.profiles?.username,
      full_name: comment.profiles?.full_name,
      avatar_url: comment.profiles?.avatar_url,
    }))
  } catch (error) {
    console.error('Error fetching global comments:', error)
    return []
  }
}

/**
 * 会場別コメントを取得
 */
export const getVenueComments = async (venueId: string): Promise<Comment[]> => {
  if (!supabase) return []
  
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        user_id,
        venue_id,
        content,
        created_at,
        updated_at,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // プロフィール情報をフラット化
    return (data || []).map((comment: any) => ({
      id: comment.id,
      user_id: comment.user_id,
      venue_id: comment.venue_id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      username: comment.profiles?.username,
      full_name: comment.profiles?.full_name,
      avatar_url: comment.profiles?.avatar_url,
    }))
  } catch (error) {
    console.error('Error fetching venue comments:', error)
    return []
  }
}

/**
 * コメントを作成
 */
export const createComment = async (
  content: string,
  venueId: string | null = null,
  userId?: string
): Promise<Comment | null> => {
  if (!supabase) return null
  
  try {
    // userIdが渡されていない場合はauth.getUser()を使う
    let finalUserId = userId
    if (!finalUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      finalUserId = user.id
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: finalUserId,
        venue_id: venueId,
        content: content.slice(0, 140), // 140文字制限
      })
      .select(`
        id,
        user_id,
        venue_id,
        content,
        created_at,
        updated_at,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    // プロフィール情報をフラット化
    const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
    return {
      id: data.id,
      user_id: data.user_id,
      venue_id: data.venue_id,
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at,
      username: profile?.username,
      full_name: profile?.full_name,
      avatar_url: profile?.avatar_url,
    }
  } catch (error) {
    console.error('Error creating comment:', error)
    return null
  }
}

/**
 * コメントを削除
 */
export const deleteComment = async (commentId: string): Promise<boolean> => {
  if (!supabase) return false
  
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting comment:', error)
    return false
  }
}

/**
 * ユーザーの最新コメントを取得（全体または会場別）
 */
export const getUserLatestComment = async (
  userId: string,
  venueId: string | null = null
): Promise<Comment | null> => {
  if (!supabase) return null
  
  try {
    let query = supabase
      .from('comments')
      .select(`
        id,
        user_id,
        venue_id,
        content,
        created_at,
        updated_at,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (venueId === null) {
      query = query.is('venue_id', null)
    } else {
      query = query.eq('venue_id', venueId)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows found
      throw error
    }

    // プロフィール情報をフラット化
    const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
    return {
      id: data.id,
      user_id: data.user_id,
      venue_id: data.venue_id,
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at,
      username: profile?.username,
      full_name: profile?.full_name,
      avatar_url: profile?.avatar_url,
    }
  } catch (error) {
    console.error('Error fetching user latest comment:', error)
    return null
  }
}
