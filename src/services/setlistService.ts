import { supabase } from '../lib/supabase'

export interface SetlistVote {
  id: string
  user_id: string
  song_uuid: string
  created_at: string
  updated_at: string
}

export interface VoteCount {
  song_uuid: string
  vote_count: number
}

export interface Voter {
  user_id: string
  username: string
  avatar_url?: string
  voted_at: string
  x_user_id?: string
}

// 投票を追加
export async function addVote(userId: string, songUuid: string): Promise<boolean> {
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('setlist_votes')
      .insert({
        user_id: userId,
        song_uuid: songUuid
      })

    if (error) {
      console.error('Error adding vote:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error adding vote:', error)
    return false
  }
}

// 投票を削除
export async function removeVote(userId: string, songUuid: string): Promise<boolean> {
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('setlist_votes')
      .delete()
      .eq('user_id', userId)
      .eq('song_uuid', songUuid)

    if (error) {
      console.error('Error removing vote:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error removing vote:', error)
    return false
  }
}

// 全楽曲の投票数を取得
export async function getVoteCounts(): Promise<VoteCount[]> {
  if (!supabase) return []

  try {
    const { data, error } = await supabase.rpc('get_setlist_vote_counts')

    if (error) {
      console.error('Error getting vote counts:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting vote counts:', error)
    return []
  }
}

// ユーザーの投票を取得
export async function getUserVotes(userId: string): Promise<string[]> {
  if (!supabase) return []

  try {
    const { data, error } = await supabase.rpc('get_user_setlist_votes', {
      user_id_param: userId
    })

    if (error) {
      console.error('Error getting user votes:', error)
      return []
    }

    return data ? data.map((v: any) => v.song_uuid) : []
  } catch (error) {
    console.error('Error getting user votes:', error)
    return []
  }
}

// 特定の楽曲に投票したユーザー一覧を取得
export async function getVotersBySong(songUuid: string): Promise<Voter[]> {
  if (!supabase) return []

  try {
    // まず投票データを取得
    const { data: votes, error: votesError } = await supabase
      .from('setlist_votes')
      .select('user_id, created_at')
      .eq('song_uuid', songUuid)
      .order('created_at', { ascending: false })

    if (votesError) {
      console.error('Error getting votes:', votesError)
      return []
    }

    if (!votes || votes.length === 0) {
      return []
    }

    // ユーザーIDのリストを取得
    const userIds = votes.map(v => v.user_id)

    // プロフィール情報を取得
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds)

    if (profilesError) {
      console.error('Error getting profiles:', profilesError)
      // プロフィール取得に失敗しても、投票データは返す
      return votes.map(v => ({
        user_id: v.user_id,
        username: 'Unknown User',
        avatar_url: undefined,
        x_user_id: undefined,
        voted_at: v.created_at
      }))
    }

    // プロフィール情報をマップに変換
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

    // 投票データとプロフィール情報を結合
    return votes.map(v => {
      const profile = profileMap.get(v.user_id)
      
      return {
        user_id: v.user_id,
        username: profile?.username || 'Unknown User',
        avatar_url: profile?.avatar_url,
        x_user_id: profile?.id, // idを使用
        voted_at: v.created_at
      }
    })
  } catch (error) {
    console.error('Error getting voters:', error)
    return []
  }
}
