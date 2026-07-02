import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { User, LogIn, UserPlus, X, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface SimpleAuthProps {
  onClose?: () => void
  onLogin?: (userId: string, username: string) => void
}

export const SimpleAuth: React.FC<SimpleAuthProps> = ({ onClose, onLogin }) => {
  const { signInWithPassword, signUpWithPassword } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [xVerificationStatus, setXVerificationStatus] = useState<'none' | 'checking' | 'verified' | 'failed'>('none')

  // Xアカウント形式の有効性をチェック（簡易版）
  const checkXAccount = async (xUsername: string) => {
    try {
      setXVerificationStatus('checking')
      
      // X形式かどうかの基本的なチェック
      // 実際のアカウント存在確認ではなく、形式の妥当性のみ
      const response = await fetch(`https://twitter.com/${xUsername}`, {
        method: 'HEAD',
        mode: 'no-cors'
      })
      
      // no-corsモードでは実際のレスポンスは確認できないため、
      // ここではユーザー名の形式チェックのみ実行
      const isValidXUsername = /^[A-Za-z0-9_]{1,15}$/.test(xUsername)
      
      if (isValidXUsername) {
        setXVerificationStatus('verified')
        return true
      } else {
        setXVerificationStatus('failed')
        return false
      }
    } catch (error) {
      console.error('X format check failed:', error)
      setXVerificationStatus('failed')
      return false
    }
  }

  // ユーザーID変更時にX形式チェックを実行（登録モードのみ）
  useEffect(() => {
    if (mode === 'register' && userId.trim() && userId.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkXAccount(userId.trim())
      }, 500) // 500ms後にチェック実行（デバウンス）
      
      return () => clearTimeout(timeoutId)
    } else {
      setXVerificationStatus('none')
    }
  }, [userId, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId.trim()) {
      toast.error('ユーザーIDを入力してください')
      return
    }

    if (mode === 'register' && userId.includes('@')) {
      toast.error('ユーザーIDに「@」は使えません')
      return
    }

    if (!password) {
      toast.error('パスワードを入力してください')
      return
    }

    if (password.length < 8) {
      toast.error('パスワードは8文字以上で入力してください')
      return
    }

    if (mode === 'register' && !username.trim()) {
      toast.error('表示名を入力してください')
      return
    }

    setLoading(true)

    try {
      // X形式の場合、XアカウントURLを自動生成
      let xAccountUrl: string | undefined
      if (mode === 'register' && xVerificationStatus === 'verified') {
        xAccountUrl = `https://x.com/${userId.trim()}`
      }

      if (mode === 'login') {
        await signInWithPassword(userId.trim(), password)
        toast.success('ログインしました！')
      } else {
        await signUpWithPassword(
          userId.trim(),
          password,
          username.trim() || userId.trim(),
          xAccountUrl
        )
        toast.success('アカウントを作成しました！')
      }
      
      if (onLogin) {
        onLogin(userId.trim(), username.trim() || userId.trim())
      }
      
      if (onClose) {
        onClose()
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'エラーが発生しました'
      toast.error(errorMessage)
      console.error('Auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {mode === 'login' ? 'ログイン' : 'アカウント作成'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'login' 
              ? 'ユーザーIDでログインしてください' 
              : '新しいアカウントを作成してください'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ユーザー ID（XのユーザID）
            </label>
            <input
              id="userId"
              name="username"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value.replace(/@/g, ''))}
              placeholder="例: reol_fan_123"
              autoComplete="username"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                英数字とアンダースコアのみ使用可能（@は入力不可）
                {mode === 'register' && <span className="block">※Xのユーザーをお持ちの場合、XのIDと同じにしてください（例：@RRReol → RRReol）</span>}
              </p>
              {mode === 'register' && xVerificationStatus !== 'none' && (
                <div className="flex items-center space-x-1">
                  {xVerificationStatus === 'checking' && (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500"></div>
                      <span className="text-xs text-blue-600">形式チェック中...</span>
                    </>
                  )}
                  {xVerificationStatus === 'verified' && (
                    <>
                      <span className="text-xs text-green-600">✓ X形式に対応</span>
                    </>
                  )}
                  {xVerificationStatus === 'failed' && (
                    <>
                      <span className="text-xs text-gray-500">一般ユーザーID</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              パスワード
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8文字以上"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              8文字以上で入力してください
            </p>
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                表示名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例: Reol れをる"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-md font-medium transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : mode === 'login' ? (
              <LogIn className="h-5 w-5" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウント作成'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            {mode === 'login' 
              ? 'アカウントをお持ちでない方はこちら' 
              : '既にアカウントをお持ちの方はこちら'
            }
          </button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            📝 メールアドレスは不要です。覚えやすいユーザーIDを設定してください。
          </p>
        </div>
      </div>
    </div>
  )
}