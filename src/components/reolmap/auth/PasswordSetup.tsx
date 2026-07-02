import React, { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface PasswordSetupProps {
  onClose?: () => void
}

const PasswordSetup: React.FC<PasswordSetupProps> = ({ onClose }) => {
  const { user } = useAuth()
  const { t } = useTranslation('common')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasPassword, setHasPassword] = useState(false) // 既存パスワードの有無

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (hasPassword && !currentPassword) {
      toast.error(t('auth.enterCurrentPassword'))
      return
    }

    if (newPassword.length < 8) {
      toast.error(t('auth.passwordMin8'))
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('auth.passwordMismatch'))
      return
    }

    setLoading(true)

    try {
      const { updatePassword } = await import('../../../services/authService')
      
      // パスワード更新（現在のパスワードが必要）
      await updatePassword(user?.id || '', currentPassword, newPassword)
      
      toast.success(t('auth.passwordSet'))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      if (onClose) {
        onClose()
      }
    } catch (error: any) {
      console.error('Password update error:', error)
      toast.error(error.message || t('auth.passwordSetFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t('auth.passwordSetup')}
        </h2>
      </div>

      <form onSubmit={handleSetPassword} className="space-y-4">
        {/* 現在のパスワード */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('auth.currentPassword')}
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={t('auth.currentPassword')}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* 新しいパスワード */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('auth.newPassword')}
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={t('auth.min8chars')}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('auth.passwordRecommendation')}
          </p>
        </div>

        {/* パスワード確認 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('auth.confirmPassword')}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={t('auth.confirmPassword')}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('auth.cancel')}
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {loading ? t('auth.settingPassword') : t('auth.setPassword')}
          </button>
        </div>
      </form>

      {/* 注意事項 */}
      <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-xs text-amber-800 dark:text-amber-200">
          <strong>{t('auth.passwordNote').split(':')[0]}:</strong> {t('auth.passwordNote').split(':')[1]}
        </p>
      </div>
    </div>
  )
}

export default PasswordSetup
