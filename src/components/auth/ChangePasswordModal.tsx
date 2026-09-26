import React, { useState } from 'react'
import { X, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

interface ChangePasswordModalProps {
  onClose: () => void
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const { updatePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  useBodyScrollLock()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 8) {
      toast.error('新しいパスワードは8文字以上で入力してください')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('新しいパスワードが一致しません')
      return
    }

    setLoading(true)
    try {
      await updatePassword(currentPassword, newPassword)
      toast.success('パスワードを変更しました')
      onClose()
    } catch (error: any) {
      toast.error(error?.message || 'パスワード変更に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-bx-bg border border-bx-line rounded-lg shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-bx-line">
          <h3 className="flex items-center gap-2 text-lg font-bold text-bx-ink">
            <Lock className="h-5 w-5" />
            パスワード変更
          </h3>
          <button onClick={onClose} className="text-bx-ink2 hover:text-bx-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-bx-ink2 mb-1">現在のパスワード</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-bx-line rounded-md bg-bx-bg text-bx-ink focus:outline-none focus:ring-2 focus:ring-bx-blue"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-bx-ink2 hover:text-bx-ink"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-bx-ink2 mb-1">新しいパスワード</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8文字以上"
              className="w-full px-3 py-2 border border-bx-line rounded-md bg-bx-bg text-bx-ink focus:outline-none focus:ring-2 focus:ring-bx-blue"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bx-ink2 mb-1">新しいパスワード（確認）</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-bx-line rounded-md bg-bx-bg text-bx-ink focus:outline-none focus:ring-2 focus:ring-bx-blue"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-bx-yellow text-bx-bg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? '変更中...' : 'パスワードを変更する'}
          </button>
        </form>
      </div>
    </div>
  )
}
