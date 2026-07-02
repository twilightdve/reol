import React, { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { LogIn, Eye } from 'lucide-react'
import { SimpleAuth } from '../../auth/SimpleAuth'

interface LoginButtonProps {
  compact?: boolean
}

const LoginButton: React.FC<LoginButtonProps> = ({ compact = false }) => {
  const { user, loading, isDevMode, signIn } = useAuth()
  const { t } = useTranslation('common')
  const [showAuth, setShowAuth] = useState(false)

  // すでにログイン済みの場合は何も表示しない
  if (user && !loading) {
    return null
  }

  const handleLogin = async (userId: string, username: string) => {
    await signIn(userId, username)
    setShowAuth(false)
  }

  // ヘッダー用のコンパクトボタン
  if (compact) {
    return (
      <>
        <button
          onClick={() => setShowAuth(true)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors whitespace-nowrap"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {loading ? '...' : t('auth.login')}
        </button>

        {showAuth && (
          <SimpleAuth
            onClose={() => setShowAuth(false)}
            onLogin={handleLogin}
          />
        )}
      </>
    )
  }

  // フルページレイアウト（元の実装）
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="space-y-4">
            {isDevMode && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
                <div className="flex items-center gap-2">
                  <span>🔧</span>
                  <span className="font-medium">{t('auth.devMode')}</span>
                </div>
                <p className="text-sm mt-1">{t('auth.devModeDescription')}</p>
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('mainPage.title')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('auth.tourDescription')}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <p>{t('auth.checkVenueInfo')}</p>
              <p>{t('auth.checkTouristSpots')}</p>
              <p>{t('auth.checkAttendees')}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowAuth(true)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              {loading ? t('auth.loggingIn') : isDevMode ? t('auth.devModeLogin') : t('auth.loginSignup')}
            </button>
            
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t('auth.viewOnly')}
            </p>
          </div>
          
          <div className="text-xs text-gray-400 dark:text-gray-500">
            <p>{t('auth.simpleLogin')}</p>
            <p>{t('auth.noEmail')}</p>
          </div>
        </div>
      </div>

      {showAuth && (
        <SimpleAuth
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
        />
      )}
    </>
  )
}

export default LoginButton