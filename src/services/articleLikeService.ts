import { supabase } from '../lib/supabase'

/**
 * 楽曲記事のいいね(supabase/features/supabase-article-likes.sql)。ログイン不要で誰でも押せる(2026-10-11 ユーザー決定)。
 * ブラウザごとに無作為な ID を localStorage に持ち、1記事1回まで。押した人は取り消せる。
 */
const CLIENT_ID_KEY = 'reol_article_like_client'

export type ArticleLikeState = { count: number; liked: boolean }

const newUuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  // randomUUID が無い古い環境向け(RFC 4122 v4 の形)
  const b = new Uint8Array(16)
  crypto.getRandomValues(b)
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

/** このブラウザの ID(無ければ作る)。localStorage が使えない環境では null(いいねできない) */
export const getLikeClientId = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY)
    if (!id) {
      id = newUuid()
      localStorage.setItem(CLIENT_ID_KEY, id)
    }
    return id
  } catch {
    return null
  }
}

const toState = (data: unknown): ArticleLikeState | null => {
  const row = Array.isArray(data) ? data[0] : data
  if (!row || typeof row !== 'object') return null
  const r = row as { like_count?: number | string; liked?: boolean }
  return { count: Number(r.like_count ?? 0), liked: Boolean(r.liked) }
}

export const fetchArticleLikes = async (articleId: string): Promise<ArticleLikeState | null> => {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('get_article_likes', {
    p_article_id: articleId,
    p_client_id: getLikeClientId(),
  })
  if (error) throw error
  return toState(data)
}

export const setArticleLike = async (articleId: string, like: boolean): Promise<ArticleLikeState | null> => {
  const clientId = getLikeClientId()
  if (!supabase || !clientId) return null
  const { data, error } = await supabase.rpc('set_article_like', {
    p_article_id: articleId,
    p_client_id: clientId,
    p_like: like,
  })
  if (error) throw error
  return toState(data)
}

/**
 * 記事ごとのいいね数をまとめて読む(読みもの一覧。supabase/features/supabase-article-like-counts.sql)。
 * 読めない時は null(一覧は数を出さずに表示する)
 */
export const fetchArticleLikeCounts = async (articleIds: string[]): Promise<Map<string, number> | null> => {
  if (!supabase || articleIds.length === 0) return null
  const { data, error } = await supabase.rpc('get_article_like_counts', { p_article_ids: articleIds })
  if (error || !Array.isArray(data)) return null
  const counts = new Map<string, number>()
  for (const row of data as { article_id: string; like_count: number | string }[]) {
    counts.set(row.article_id, Number(row.like_count ?? 0))
  }
  return counts
}
