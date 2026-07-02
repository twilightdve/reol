import { supabase } from '../lib/supabase'

/**
 * パスワードをハッシュ化（Web Crypto API使用）
 */
export const hashPassword = async (password: string): Promise<string> => {
  // 開発用: 簡易ハッシュ（本番ではbcryptを使用すべき）
  // TODO: bcryptjsをインストールして実装
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * パスワードを検証
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const inputHash = await hashPassword(password)
  return inputHash === hash
}

/**
 * ユーザー登録
 */
export const signUpUser = async (
  userId: string,
  username: string,
  password: string,
  fullName?: string
) => {
  if (!supabase) throw new Error('Supabaseが初期化されていません')

  if (userId.includes('@')) {
    throw new Error('ユーザーIDに「@」は使用できません')
  }
  
  // パスワードをハッシュ化
  const passwordHash = await hashPassword(password)

  // プロフィール作成
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username: username,
      password_hash: passwordHash,
      full_name: fullName || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('このユーザーIDは既に使用されています')
    }
    throw new Error(`アカウント作成に失敗しました: ${error.message}`)
  }

  return data
}

/**
 * ユーザーログイン
 */
export const signInUser = async (userId: string, password: string) => {
  if (!supabase) throw new Error('Supabaseが初期化されていません')
  
  // ユーザー情報を取得
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    throw new Error('ユーザーIDまたはパスワードが正しくありません')
  }

  // パスワード検証
  const isValid = await verifyPassword(password, profile.password_hash)
  
  if (!isValid) {
    throw new Error('ユーザーIDまたはパスワードが正しくありません')
  }

  // パスワードハッシュを除外して返す
  const { password_hash, ...userProfile } = profile
  return userProfile
}

/**
 * パスワード変更
 */
export const updatePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  if (!supabase) throw new Error('Supabaseが初期化されていません')
  
  // 現在のパスワードを検証
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('password_hash')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    throw new Error('ユーザーが見つかりません')
  }

  const isValid = await verifyPassword(oldPassword, profile.password_hash)
  
  if (!isValid) {
    throw new Error('現在のパスワードが正しくありません')
  }

  // 新しいパスワードをハッシュ化
  const newPasswordHash = await hashPassword(newPassword)

  // パスワードを更新
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      password_hash: newPasswordHash,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (updateError) {
    throw new Error(`パスワード更新に失敗しました: ${updateError.message}`)
  }

  return true
}

/**
 * ユーザーID変更（Supabase RPC経由）
 */
export const changeUserId = async (oldId: string, newId: string, password: string) => {
  if (!supabase) throw new Error('Supabaseが初期化されていません')

  // 入力チェック
  if (!newId || newId.trim() === '') {
    throw new Error('新しいIDを入力してください')
  }

  if (!/^[A-Za-z0-9_]{1,30}$/.test(newId)) {
    throw new Error('IDは英数字とアンダースコアのみ、1〜30文字で入力してください')
  }

  if (newId === oldId) {
    throw new Error('現在のIDと同じです')
  }

  // パスワードをハッシュ化して送信
  const passwordHash = await hashPassword(password)

  const { data, error } = await supabase.rpc('change_user_id', {
    p_old_id: oldId,
    p_new_id: newId,
    p_password_hash: passwordHash,
  })

  if (error) {
    throw new Error(`ID変更に失敗しました: ${error.message}`)
  }

  if (!data?.success) {
    throw new Error(data?.error || 'ID変更に失敗しました')
  }

  return data
}

/**
 * アカウント削除（Supabase RPC経由）
 */
export const deleteAccount = async (userId: string, password: string) => {
  if (!supabase) throw new Error('Supabaseが初期化されていません')

  // パスワードをハッシュ化して送信
  const passwordHash = await hashPassword(password)

  const { data, error } = await supabase.rpc('delete_account', {
    p_user_id: userId,
    p_password_hash: passwordHash,
  })

  if (error) {
    throw new Error(`アカウント削除に失敗しました: ${error.message}`)
  }

  if (!data?.success) {
    throw new Error(data?.error || 'アカウント削除に失敗しました')
  }

  return data
}
