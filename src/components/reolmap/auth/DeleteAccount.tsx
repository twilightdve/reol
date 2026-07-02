import React, { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

interface DeleteAccountProps {
  onClose: () => void
}

const DeleteAccount: React.FC<DeleteAccountProps> = ({ onClose }) => {
  const { user, deleteAccount } = useAuth()
  const { t } = useTranslation('common')
  const [confirmId, setConfirmId] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmId.trim() || !password.trim()) return

    // ID確認チェック
    if (confirmId.trim() !== user?.id) {
      setError('IDが一致しません')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await deleteAccount(password)
      setSuccess(true)
      // 2秒後にトップページへリダイレクト
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/bijigaku-navi/'
        }
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'アカウント削除に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = confirmId.trim() === user?.id && password.trim() !== '' && !isSubmitting

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
            {t('deleteAccount.title', 'アカウント削除')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {t('deleteAccount.success', 'アカウントが削除されました')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('deleteAccount.redirecting', 'トップページに戻ります...')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* 警告 */}
            <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {t('deleteAccount.description', 'アカウントを削除すると、参加登録・投票・コメントなど全てのデータが完全に削除されます。この操作は取り消せません。')}
              </p>
            </div>

            {/* ID確認入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('deleteAccount.confirmLabel', '確認のため、あなたのIDを入力してください')}
              </label>
              <div className="px-3 py-1.5 mb-2 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-400 font-mono">
                @{user?.id}
              </div>
              <input
                type="text"
                value={confirmId}
                onChange={(e) => { setConfirmId(e.target.value); setError(null) }}
                placeholder={user?.id}
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {/* パスワード確認 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('deleteAccount.password', 'パスワード')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                placeholder={t('deleteAccount.passwordPlaceholder', 'パスワードを入力')}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isSubmitting}
              />
            </div>

            {/* エラー */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* ボタン */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? t('deleteAccount.submitting', '削除中...')
                : t('deleteAccount.submit', 'アカウントを削除する')
              }
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default DeleteAccount
