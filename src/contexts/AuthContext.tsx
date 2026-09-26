import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import toast from 'react-hot-toast'

type CollectionNamespace = 'owned' | 'attended' | 'visited'
const COLLECTION_NAMESPACES: CollectionNamespace[] = ['owned', 'attended', 'visited']
const COLLECTION_BASE_KEYS: Record<CollectionNamespace, string> = {
  owned: 'reol-collection-owned',
  attended: 'reol-collection-attended',
  visited: 'reol-collection-visited',
}

/**
 * コレクション台帳(owned/attended/visited)をDBから取り直し、ユーザー専用の
 * localStorageキャッシュを最新化する。
 *
 * ログイン時(mergeGuestData=true)はゲスト時のローカル分をDBにまだ無ければ
 * push した上で合流させる。それ以外(セッション復元時、mergeGuestData=false)は
 * 複数端末間の同期のため、単純にDBを正としてキャッシュを上書きする
 * (別端末で行った変更をこの端末にも反映するため。ログイン状態はlocalStorageの
 * セッション復元だけで継続し、明示的なsignIn()は最初の1回しか呼ばれないため、
 * ここで定期的にDBを見に行かないと他端末の変更が反映されなかった)。
 */
const syncCollectionsFromDb = async (userId: string, mergeGuestData: boolean) => {
  if (typeof window === 'undefined') return
  try {
    const { supabase } = await import('../lib/supabase')
    if (!supabase) return

    const { data: dbRows, error: fetchError } = await supabase
      .from('user_collections')
      .select('namespace, item_uuid')
      .eq('user_id', userId)

    if (fetchError) return

    const dbByNs: Record<CollectionNamespace, Set<string>> = {
      owned: new Set(),
      attended: new Set(),
      visited: new Set(),
    }
    ;(dbRows || []).forEach((row: { namespace: string; item_uuid: string }) => {
      if (dbByNs[row.namespace as CollectionNamespace]) {
        dbByNs[row.namespace as CollectionNamespace].add(row.item_uuid)
      }
    })

    for (const ns of COLLECTION_NAMESPACES) {
      const userKey = `${COLLECTION_BASE_KEYS[ns]}:${userId}`
      const dbSet = dbByNs[ns]

      if (mergeGuestData) {
        const guestKey = COLLECTION_BASE_KEYS[ns]
        let guestSet = new Set<string>()
        try {
          const raw = localStorage.getItem(guestKey)
          if (raw) {
            const arr = JSON.parse(raw)
            if (Array.isArray(arr)) guestSet = new Set(arr)
          }
        } catch {
          // ignore
        }

        const toPush = Array.from(guestSet).filter((uuid) => !dbSet.has(uuid))
        if (toPush.length > 0) {
          const { error: upsertError } = await supabase
            .from('user_collections')
            .upsert(
              toPush.map((uuid) => ({ user_id: userId, namespace: ns, item_uuid: uuid })),
              { onConflict: 'user_id,namespace,item_uuid', ignoreDuplicates: true }
            )
          if (upsertError) {
            console.error(`collection sync error (${ns}):`, upsertError)
          } else {
            toPush.forEach((uuid) => dbSet.add(uuid))
          }
        }
      }

      localStorage.setItem(userKey, JSON.stringify(Array.from(dbSet)))
    }

    window.dispatchEvent(new Event('reol-collection-changed'))
    window.dispatchEvent(new Event('reol-collection-attended-changed'))
    window.dispatchEvent(new Event('reol-collection-visited-changed'))
  } catch (e) {
    console.error('collection sync error:', e)
  }
}

/**
 * プロフィール(ニックネーム等)をDBから取り直す。複数端末間の同期のため、
 * セッション復元時にlocalStorageのキャッシュだけでなくDBの最新値を反映する
 * (別端末でニックネームを変更しても、この端末はローカルキャッシュを
 * 読むだけで再ログインもしないため、DBを見に行かないと反映されなかった)。
 */
const fetchProfileFromDb = async (userId: string): Promise<Profile | null> => {
  if (typeof window === 'undefined') return null
  try {
    const { supabase } = await import('../lib/supabase')
    if (!supabase) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, is_public, encounter_policy, reol_type, meta_tags, favorite_song, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error || !data) return null
    return data as Profile
  } catch (e) {
    console.error('profile sync error:', e)
    return null
  }
}

interface Profile {
  id: string
  username: string
  full_name: string | null
  display_name?: string | null
  avatar_url: string | null
  is_public?: boolean
  encounter_policy?: 'ok' | 'ng' | null
  reol_type?: string | null
  meta_tags?: string[]
  favorite_song?: string | null
}

interface SimpleUser {
  id: string
  username: string
  email?: string | null
  createdAt?: string
}

interface AuthContextType {
  user: SimpleUser | null
  profile: Profile | null
  loading: boolean
  signIn: (userId: string, username: string) => Promise<void>
  signInWithPassword: (userId: string, password: string) => Promise<void>
  signUpWithPassword: (userId: string, password: string, username: string, xAccountUrl?: string) => Promise<void>
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>
  changeUserId: (newId: string, password: string) => Promise<void>
  deleteAccount: (password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  isDevMode?: boolean
}

// 開発モード用のモックユーザーデータ
const mockProfile: Profile = {
  id: 'dev_user_123',
  username: 'dev_user',
  full_name: '開発用ユーザー',
  avatar_url: 'https://via.placeholder.com/40x40/6366f1/ffffff?text=🎵'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SimpleUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // 開発モードの検出
  const isDevMode = typeof window !== 'undefined' && 
    process.env.GATSBY_REOLMAP_DEV_MODE === 'true'

  const signIn = async (userId: string, username: string) => {
    let profileData: Profile | null = null

    // Supabaseからプロフィールを取得(新規作成は sign_up_user RPC が行う)
    if (typeof window !== 'undefined') {
      try {
        const { supabase } = await import('../lib/supabase')
        if (supabase) {
          // 既存プロフィールを取得
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, is_public, encounter_policy, reol_type, meta_tags, favorite_song, created_at, updated_at')
            .eq('id', userId)
            .single()

          if (existingProfile && !fetchError) {
            profileData = existingProfile as Profile
          }
        }
      } catch (error) {
        console.error('Error with Supabase profile:', error)
      }
    }

    // プロフィールが取得できなかった場合のフォールバック
    if (!profileData) {
      profileData = {
        id: userId,
        username: username,
        full_name: null,
        avatar_url: null
      }
    }

    // === コレクション台帳(owned/attended/visited) ログイン時の合流 ===
    // setUser()より前に完了させる: useCollectionOwnedはuserIdの変化を検知した
    // 瞬間にユーザー専用キーを読みに行くため、後で合流させるとその一瞬だけ
    // 空/ゲスト状態を読んでしまい、直後のトグル操作が合流処理に上書きされうる。
    await syncCollectionsFromDb(userId, true)

    const userData: SimpleUser = {
      id: userId,
      username: profileData.username,
      createdAt: new Date().toISOString()
    }

    setUser(userData)
    setProfile(profileData)

    // ローカルストレージに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('reol_user_session', JSON.stringify(userData))
      localStorage.setItem('reol_user_profile', JSON.stringify(profileData))

      // === reol_type 自動同期 ===
      // localStorageに診断結果が残っていて、まだプロフィールに紐付いていなければ自動保存
      try {
        const savedTypeResult = localStorage.getItem('reol_type_result')
        if (savedTypeResult && profileData && !profileData.reol_type) {
          const updatedProfile = { ...profileData, reol_type: savedTypeResult }
          localStorage.setItem('reol_user_profile', JSON.stringify(updatedProfile))
          setProfile(updatedProfile as Profile)

          const { supabase } = await import('../lib/supabase')
          if (supabase) {
            supabase
              .from('profiles')
              .update({ reol_type: savedTypeResult })
              .eq('id', userId)
              .then(({ error }) => {
                if (error) console.error('Auto-sync reol_type error:', error)
                else console.log('Auto-synced reol_type:', savedTypeResult)
              })
          }
        }
      } catch (e) {
        console.error('reol_type auto-sync error:', e)
      }
    }
  }

  // ユーザID・パスワードでサインアップ
  const signUpWithPassword = async (userId: string, password: string, username: string, _xAccountUrl?: string) => {
    try {
      const { signUpUser } = await import('../services/authService')
      
      // ユーザー登録
      const profile = await signUpUser(userId, username, password)
      
      // ログイン状態をセット
      await signIn(profile.id, profile.username)
      
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  // ユーザID・パスワードでログイン
  const signInWithPassword = async (userId: string, password: string) => {
    try {
      const { signInUser } = await import('../services/authService')
      
      // ユーザー認証
      const profile = await signInUser(userId, password)
      
      // ログイン状態をセット
      await signIn(profile.id, profile.username)
      
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  // パスワード変更
  const updatePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) throw new Error('ログインしていません')
    
    try {
      const { updatePassword: updatePwd } = await import('../services/authService')
      await updatePwd(user.id, oldPassword, newPassword)
    } catch (error) {
      console.error('Password update error:', error)
      throw error
    }
  }

  // ユーザーID変更
  const changeUserId = async (newId: string, password: string) => {
    if (!user) throw new Error('ログインしていません')
    
    try {
      const { changeUserId: changeId } = await import('../services/authService')
      await changeId(user.id, newId, password)
      
      // ローカル状態を新IDで更新
      const updatedUser = { ...user, id: newId, username: newId }
      const updatedProfile = profile ? { ...profile, id: newId } : null
      setUser(updatedUser)
      setProfile(updatedProfile)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('reol_user_session', JSON.stringify(updatedUser))
        if (updatedProfile) {
          localStorage.setItem('reol_user_profile', JSON.stringify(updatedProfile))
        }
      }
    } catch (error) {
      console.error('Change user ID error:', error)
      throw error
    }
  }

  // アカウント削除
  const deleteAccount = async (password: string) => {
    if (!user) throw new Error('ログインしていません')
    
    try {
      const { deleteAccount: deleteAcc } = await import('../services/authService')
      await deleteAcc(user.id, password)
      
      // ローカル状態をクリア
      setUser(null)
      setProfile(null)
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('reol_user_session')
        localStorage.removeItem('reol_user_profile')
        localStorage.removeItem('reolmap_selected_venues')
      }
    } catch (error) {
      console.error('Delete account error:', error)
      throw error
    }
  }

  const clearLocalSession = () => {
    setUser(null)
    setProfile(null)

    if (typeof window !== 'undefined') {
      localStorage.removeItem('reol_user_session')
      localStorage.removeItem('reol_user_profile')
    }
  }

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      const { signOutSession } = await import('../services/authService')
      await signOutSession()
    }
    clearLocalSession()
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return

    const updatedProfile = { ...profile, ...updates }
    
    // 開発モードの場合はローカル更新のみ
    if (isDevMode) {
      console.log('開発モードのため、Supabase更新をスキップ')
      // ローカル状態を更新
      setProfile(updatedProfile)
      
      // ユーザー情報も更新（usernameが変更された場合）
      if (updates.username) {
        const updatedUser = { ...user, username: updates.username }
        setUser(updatedUser)
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('reol_user_session', JSON.stringify(updatedUser))
        }
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('reol_user_profile', JSON.stringify(updatedProfile))
      }
      
      return
    }

    // Supabaseに更新を送信
    try {
      const { supabase } = await import('../lib/supabase')
      
      if (supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({
            username: updatedProfile.username,
            full_name: updatedProfile.full_name,
            avatar_url: updatedProfile.avatar_url,
            ...(updates.encounter_policy !== undefined && { encounter_policy: updates.encounter_policy }),
            ...(updates.reol_type !== undefined && { reol_type: updates.reol_type }),
            ...(updates.meta_tags !== undefined && { meta_tags: updates.meta_tags }),
            ...(updates.favorite_song !== undefined && { favorite_song: updates.favorite_song }),
          })
          .eq('id', user.id)

        if (error) {
          console.error('プロフィールの更新エラー:', error)
          throw new Error(`プロフィールの更新に失敗しました: ${error.message}`)
        }
      }
    } catch (error) {
      console.error('Supabase更新エラー:', error)
      throw error
    }

    // ローカル状態を更新
    setProfile(updatedProfile)
    
    // ユーザー情報も更新（usernameが変更された場合）
    if (updates.username) {
      const updatedUser = { ...user, username: updates.username }
      setUser(updatedUser)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('reol_user_session', JSON.stringify(updatedUser))
      }
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('reol_user_profile', JSON.stringify(updatedProfile))
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    // 開発モードの場合はモックデータを使用
    if (isDevMode) {
      // 美辞学ナビ開発モード
      setTimeout(() => {
        setProfile(mockProfile)
        setUser({ id: mockProfile.id, username: mockProfile.username })
        setLoading(false)
      }, 1000)
      return
    }

    // ローカルストレージからセッションを復元
    try {
      const savedUser = localStorage.getItem('reol_user_session')
      const savedProfile = localStorage.getItem('reol_user_profile')
      
      if (savedUser) {
        const userData = JSON.parse(savedUser) as SimpleUser
        setUser(userData)

        void (async () => {
          // サーバー発行のセッショントークンが無い/無効なら、書き込みはすべてサーバーで
          // 拒否されるため、ログイン状態を解除して再ログインしてもらう。
          // (トークン導入前にログインしたユーザーはトークンを持っていない)
          const { getSessionToken, clearSessionToken } = await import('../lib/supabase')
          if (!getSessionToken()) {
            clearLocalSession()
            toast('セキュリティ強化のため、お手数ですが再度ログインしてください')
            return
          }
          const { fetchSessionUserId } = await import('../services/authService')
          const sessionUserId = await fetchSessionUserId()
          if (sessionUserId !== undefined && sessionUserId !== userData.id) {
            clearSessionToken()
            clearLocalSession()
            toast('ログインの有効期限が切れました。再度ログインしてください')
            return
          }

          // 複数端末間の同期のため、セッション復元時(=既にログイン済みの状態で
          // サイトを開き直した時)もコレクション台帳をDBから取り直す。
          // signIn()内の合流はアカウントへの明示ログイン時にしか走らないため、
          // これが無いと別端末で行った変更がこの端末にいつまでも反映されなかった。
          void syncCollectionsFromDb(userData.id, false)

          // 同様の理由で、プロフィール(ニックネーム等)もDBから取り直す。
          // 別端末でニックネームを変更しても、ローカルキャッシュのままだと
          // この端末には反映されなかった。
          const freshProfile = await fetchProfileFromDb(userData.id)
          if (!freshProfile) return
          setProfile(freshProfile)
          setUser((prev) => (prev ? { ...prev, username: freshProfile.username } : prev))
          localStorage.setItem('reol_user_profile', JSON.stringify(freshProfile))
          localStorage.setItem(
            'reol_user_session',
            JSON.stringify({ ...userData, username: freshProfile.username })
          )
        })()
      }

      if (savedProfile) {
        const profileData = JSON.parse(savedProfile) as Profile
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error restoring session:', error)
    }
    
    setLoading(false)
  }, [isDevMode])

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signInWithPassword,
    signUpWithPassword,
    updatePassword,
    changeUserId,
    deleteAccount,
    signOut,
    updateProfile,
    isDevMode,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext