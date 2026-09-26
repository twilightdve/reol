import React, { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

interface DeleteAccountModalProps {
  onClose: () => void
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ onClose }) => {
  const { user, deleteAccount } = useAuth()
  const [confirmId, setConfirmId] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  useBodyScrollLock()

  const canSubmit = confirmId.trim() === user?.id && password.trim() !== '' && !isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setError(null)
    setIsSubmitting(true)

    try {
      await deleteAccount(password)
      setSuccess(true)
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }, 2000)
    } catch (err: any) {
      setError(err?.message || 'アカウント削除に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-bx-bg border border-bx-line rounded-lg shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-bx-line">
          <h3 className="text-lg font-bold text-red-500">アカウント削除</h3>
          <button onClick={onClose} className="text-bx-ink2 hover:text-bx-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <p className="text-lg font-semibold text-bx-ink mb-1">アカウントが削除されました</p>
            <p className="text-sm text-bx-ink2">トップページに戻ります...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-md">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">
                アカウントを削除すると、参戦履歴・コメントなど全てのデータが完全に削除されます。この操作は取り消せません。
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-bx-ink2 mb-1">
                確認のため、あなたのIDを入力してください
              </label>
              <div className="px-3 py-1.5 mb-2 bg-bx-surface/10 rounded text-xs text-bx-ink2 font-mono">
                {user?.id}
              </div>
              <input
                type="text"
                value={confirmId}
                onChange={(e) => { setConfirmId(e.target.value); setError(null) }}
                placeholder={user?.id}
                className="w-full px-3 py-2 border border-bx-line rounded-md bg-bx-bg text-bx-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bx-ink2 mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                className="w-full px-3 py-2 border border-bx-line rounded-md bg-bx-bg text-bx-ink text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-sm text-red-500">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-2.5 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? '削除中...' : 'アカウントを削除する'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
