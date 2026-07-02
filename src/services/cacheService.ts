/**
 * キャッシュサービス
 * F5アタック対策のため、Supabaseへのリクエストをキャッシュ
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresIn: number
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private requestQueue: Map<string, Promise<any>> = new Map()

  /**
   * キャッシュからデータを取得、なければfetcherを実行
   * 同じキーで複数回呼ばれた場合は最初のリクエストを待つ（重複リクエスト防止）
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 60000 // デフォルト60秒
  ): Promise<T> {
    // キャッシュチェック
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.expiresIn) {
      return cached.data
    }

    // 既に同じキーでリクエスト中の場合は待つ
    const existingRequest = this.requestQueue.get(key)
    if (existingRequest) {
      return existingRequest
    }

    // 新しいリクエストを実行
    const request = fetcher()
      .then((data) => {
        // キャッシュに保存
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          expiresIn: ttl,
        })
        // リクエストキューから削除
        this.requestQueue.delete(key)
        return data
      })
      .catch((error) => {
        // エラー時もリクエストキューから削除
        this.requestQueue.delete(key)
        throw error
      })

    this.requestQueue.set(key, request)
    return request
  }

  /**
   * キャッシュを手動で無効化
   */
  invalidate(key: string) {
    this.cache.delete(key)
  }

  /**
   * すべてのキャッシュをクリア
   */
  clear() {
    this.cache.clear()
    this.requestQueue.clear()
  }

  /**
   * 期限切れキャッシュを削除
   */
  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.expiresIn) {
        this.cache.delete(key)
      }
    }
  }
}

// シングルトンインスタンス
export const cacheService = new CacheService()

// 定期的にキャッシュをクリーンアップ（5分ごと）
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheService.cleanup()
  }, 5 * 60 * 1000)
}
