import { supabase, setSessionToken, clearSessionToken } from '../lib/supabase'

/**
 * ユーザー登録(Supabase RPC経由)
 * パスワードはサーバー側でbcrypt化され、成功時にセッショントークンが発行される。
 */
export const signUpUser = async (userId: string, username: string, password: string) => {
  if (!supabase) throw new Error('Supabaseが初期化されていません')

  if (userId.includes('@')) {
    throw new Error('ユーザーIDに「@」は使用できません')
  }

  const { data, error } = await supabase.rpc('sign_up_user', {
    p_user_id: userId,
    p_username: username,
    p_password: password,
  })

  if (error) {
    throw new Error(`アカウント作成に失敗しました: ${error.message}`)
  }

  if (!data?.success) {
    throw new Error(data?.error || 'アカウント作成に失敗しました')
  }

  if (data.session_token) setSessionToken(data.session_token)
  return data.profile
}

/**
 * ユーザーログイン
 */
export const signInUser = async (userId: string, password: string) => {
  if (!supabase) throw new Error('Supabaseが初期化されていません')

  // パスワード検証はRPC側で行う（password_hash列は直接SELECT不可のため）
  const { data, error } = await supabase.rpc('verify_user_login', {
    p_user_id: userId,
    p_password: password,
  })

  if (error) {
    throw new Error('ユーザーIDまたはパスワードが正しくありません')
  }

  if (!data?.success) {
    throw new Error(data?.error || 'ユーザーIDまたはパスワードが正しくありません')
  }

  if (data.session_token) setSessionToken(data.session_token)
  return data.profile
}

/**
 * ログアウト: サーバー側のセッションを消してからトークンを破棄する
 */
export const signOutSession = async () => {
  try {
    if (supabase) await supabase.rpc('sign_out')
  } catch (e) {
    console.error('Sign out error:', e)
  } finally {
    clearSessionToken()
  }
}

/**
 * 保存済みトークンのセッションが有効か確認する。
 * 戻り値: セッションのユーザーID / 無効なら null / 確認できなかった(通信エラー等)なら undefined
 */
export const fetchSessionUserId = async (): Promise<string | null | undefined> => {
  if (!supabase) return undefined
  const { data, error } = await supabase.rpc('request_session_user_id')
  if (error) return undefined
  return (data as string | null) ?? null
}

/**
 * パスワード変更
 */
export const updatePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  if (!supabase) throw new Error('Supabaseが初期化されていません')

  // パスワード検証・更新はRPC側で行う（password_hash列は直接UPDATE不可のため）
  const { data, error } = await supabase.rpc('update_user_password', {
    p_user_id: userId,
    p_old_password: oldPassword,
    p_new_password: newPassword,
  })

  if (error) {
    throw new Error(`パスワード更新に失敗しました: ${error.message}`)
  }

  if (!data?.success) {
    throw new Error(data?.error || 'パスワード更新に失敗しました')
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

  const { data, error } = await supabase.rpc('change_user_id', {
    p_old_id: oldId,
    p_new_id: newId,
    p_password: password,
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

  const { data, error } = await supabase.rpc('delete_account', {
    p_user_id: userId,
    p_password: password,
  })

  if (error) {
    throw new Error(`アカウント削除に失敗しました: ${error.message}`)
  }

  if (!data?.success) {
    throw new Error(data?.error || 'アカウント削除に失敗しました')
  }

  // サーバー側のセッションはプロフィール削除に連動して消えるので、手元のトークンも破棄する
  clearSessionToken()
  return data
}
