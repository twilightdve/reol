import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

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
  signIn: (userId: string, username: string, isNewUser?: boolean) => Promise<void>
  signInWithPassword: (userId: string, password: string) => Promise<void>
  signUpWithPassword: (userId: string, password: string, username: string, xAccountUrl?: string) => Promise<void>
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>
  changeUserId: (newId: string, password: string) => Promise<void>
  deleteAccount: (password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  createProfileInSupabase: () => Promise<void>
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

  const signIn = async (userId: string, username: string, isNewUser: boolean = false) => {
    let profileData: Profile | null = null

    // Supabaseから既存プロフィールを取得または新規作成
    if (typeof window !== 'undefined') {
      try {
        const { supabase } = await import('../lib/supabase')
        if (supabase) {
          // 既存プロフィールを取得
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (existingProfile && !fetchError) {
            // 既存ユーザー: プロフィールを取得
            console.log('Existing user found:', existingProfile)
            profileData = existingProfile as Profile
          } else if (isNewUser) {
            // 新規ユーザー: プロフィールを作成
            console.log('Creating new profile in Supabase:', { userId, username })
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                username: username,
                full_name: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single()

            if (createError) {
              console.error('Error creating profile:', createError)
            } else if (newProfile) {
              console.log('Profile created successfully:', newProfile)
              profileData = newProfile as Profile
            }
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
      const profile = await signUpUser(userId, username, password, username)
      
      // ログイン状態をセット
      await signIn(profile.id, profile.username, true)
      
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
      await signIn(profile.id, profile.username, false)
      
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

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('reol_user_session')
      localStorage.removeItem('reol_user_profile')
    }
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

  const createProfileInSupabase = async () => {
    if (!user) {
      console.warn('No user logged in')
      return
    }

    try {
      const { supabase } = await import('../lib/supabase')
      if (supabase) {
        console.log('Manually creating profile in Supabase:', { userId: user.id, username: user.username })
        
        // 直接upsertを使用
        const { data, error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            username: user.username,
            full_name: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (error) {
          console.error('Error manually creating profile:', error)
        } else {
          console.log('Profile manually created successfully:', data)
        }
      }
    } catch (error) {
      console.error('Error in createProfileInSupabase:', error)
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
    createProfileInSupabase,
    isDevMode,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext