import React, { useState } from 'react'
import { X, AlertTriangle, ArrowRight } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

interface ChangeUserIdProps {
  onClose: () => void
}

const ChangeUserId: React.FC<ChangeUserIdProps> = ({ onClose }) => {
  const { user, changeUserId } = useAuth()
  const { t } = useTranslation('common')
  const [newId, setNewId] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newId.trim() || !password.trim()) return

    setError(null)
    setIsSubmitting(true)

    try {
      await changeUserId(newId.trim(), password)
      setSuccess(true)
      // 2秒後に閉じる
      setTimeout(() => {
        onClose()
        // ページをリロードして全体を更新
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'ID変更に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValidId = /^[A-Za-z0-9_]{1,30}$/.test(newId)
  const canSubmit = newId.trim() !== '' && password.trim() !== '' && isValidId && !isSubmitting

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('changeId.title', 'ユーザーID変更')}
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
            <div className="text-4xl mb-3">✅</div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {t('changeId.success', 'ID変更完了！')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('changeId.reloading', 'ページを更新しています...')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* 注意書き */}
            <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <p className="font-semibold">{t('changeId.warningTitle', '注意')}</p>
                <p>{t('changeId.warning1', 'IDはあなたのXアカウント名（@以降）を推奨します。')}</p>
                <p>{t('changeId.warning2', '参加登録や投票など全てのデータが新IDに引き継がれます。')}</p>
              </div>
            </div>

            {/* 現在のID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('changeId.currentId', '現在のID')}
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 text-sm font-mono">
                @{user?.id}
              </div>
            </div>

            {/* 新しいID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('changeId.newId', '新しいID')}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 font-mono">@</span>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => { setNewId(e.target.value); setError(null) }}
                  placeholder={t('changeId.newIdPlaceholder', '新しいID')}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  maxLength={30}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              {newId && !isValidId && (
                <p className="mt-1 text-xs text-red-500">
                  {t('changeId.invalidFormat', '英数字とアンダースコアのみ、1〜30文字')}
                </p>
              )}
              {newId && isValidId && newId !== user?.id && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-mono">@{user?.id}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-mono text-blue-600 dark:text-blue-400">@{newId}</span>
                </div>
              )}
            </div>

            {/* パスワード確認 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('changeId.password', 'パスワード（確認用）')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                placeholder={t('changeId.passwordPlaceholder', 'パスワードを入力')}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? t('changeId.submitting', '変更中...')
                : t('changeId.submit', 'IDを変更する')
              }
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ChangeUserId
