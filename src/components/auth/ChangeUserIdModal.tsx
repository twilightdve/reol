import React, { useState } from 'react'
import { X, AlertTriangle, ArrowRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

interface ChangeUserIdModalProps {
  onClose: () => void
}

export const ChangeUserIdModal: React.FC<ChangeUserIdModalProps> = ({ onClose }) => {
  const { user, changeUserId } = useAuth()
  const [newId, setNewId] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  useBodyScrollLock()

  const isValidId = /^[A-Za-z0-9_]{1,30}$/.test(newId)
  const canSubmit = newId.trim() !== '' && password.trim() !== '' && isValidId && !isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setError(null)
    setIsSubmitting(true)

    try {
      await changeUserId(newId.trim(), password)
      setSuccess(true)
      setTimeout(() => {
        onClose()
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      }, 2000)
    } catch (err: any) {
      setError(err?.message || 'ID変更に失敗しました')
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
          <h3 className="text-lg font-bold text-bx-ink">ユーザーID変更</h3>
          <button aria-label="閉じる" onClick={onClose} className="text-bx-ink2 hover:text-bx-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-lg font-semibold text-bx-ink mb-1">ID変更完了！</p>
            <p className="text-sm text-bx-ink2">ページを更新しています...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div className="flex gap-3 p-3 bg-bx-bg border border-bx-line rounded-md">
              <AlertTriangle className="h-5 w-5 text-bx-yellow flex-shrink-0 mt-0.5" />
              <div className="text-xs text-bx-ink3 space-y-1">
                <p className="font-semibold text-bx-ink2">注意</p>
                <p>参戦履歴やコメントなど全てのデータが新IDに引き継がれます。</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bx-ink2 mb-1">現在のID</label>
              <div className="px-3 py-2 bg-bx-surface/10 rounded-md text-bx-ink2 text-sm font-mono">
                {user?.id}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bx-ink2 mb-1">新しいID</label>
              <input
                type="text"
                value={newId}
                onChange={(e) => { setNewId(e.target.value); setError(null) }}
                placeholder="新しいID"
                className="w-full px-3 py-2 border border-bx-line rounded-md bg-bx-bg text-bx-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-bx-blue"
                maxLength={30}
                disabled={isSubmitting}
                autoFocus
              />
              {newId && !isValidId && (
                <p className="mt-1 text-xs text-red-500">英数字とアンダースコアのみ、1〜30文字</p>
              )}
              {newId && isValidId && newId !== user?.id && (
                <div className="mt-2 flex items-center gap-2 text-xs text-bx-ink2">
                  <span className="font-mono">{user?.id}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-mono text-bx-blue">{newId}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-bx-ink2 mb-1">パスワード（確認用）</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                className="w-full px-3 py-2 border border-bx-line rounded-md bg-bx-bg text-bx-ink text-sm focus:outline-none focus:ring-2 focus:ring-bx-blue"
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
              className="w-full py-2.5 rounded-md bg-bx-yellow text-bx-bg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? '変更中...' : 'IDを変更する'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
