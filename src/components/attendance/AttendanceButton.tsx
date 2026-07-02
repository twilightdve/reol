import React, { useState } from 'react'
import { Check } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { invalidateVenueCache } from '../../services/venueService'

// XSS対策: HTMLエスケープ関数
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

interface AttendanceButtonProps {
  venueId: string
  venueName: string
  isAttending?: boolean
  onAttendanceChange?: (isAttending: boolean) => void
}

export const AttendanceButton: React.FC<AttendanceButtonProps> = ({
  venueId,
  venueName,
  isAttending = false,
  onAttendanceChange
}) => {
  const { user, profile, loading } = useAuth()
  const { t } = useTranslation('common')
  const [showRegistration, setShowRegistration] = useState(false)
  const [processingAttendance, setProcessingAttendance] = useState(false)

  // 参加表明処理
  const handleAttendance = async () => {
    if (!user) {
      // 未ログインの場合は登録フォームを表示
      setShowRegistration(true)
      return
    }

    setProcessingAttendance(true)
    try {
      if (isAttending) {
        // 参加取り消し
        if (supabase) {
          await supabase
            .from('venue_attendances')
            .delete()
            .eq('user_id', user.id)
            .eq('venue_id', venueId)
        }
        onAttendanceChange?.(false)
      } else {
        // 参加表明
        if (supabase) {
          await supabase
            .from('venue_attendances')
            .insert({
              user_id: user.id,
              venue_id: venueId,
              is_public: true
            })
        }
        onAttendanceChange?.(true)
      }
      
      // キャッシュを無効化
      invalidateVenueCache(venueId, user.id)
    } catch (error) {
      console.error('参加表明エラー:', error)
    } finally {
      setProcessingAttendance(false)
    }
  }

  if (loading) {
    return (
      <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg">
        {t('attendance.loading')}
      </button>
    )
  }

  return (
    <>
      <button
        onClick={handleAttendance}
        disabled={processingAttendance}
        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
          isAttending
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-400 text-white hover:bg-gray-500'
        } disabled:opacity-50`}
      >
        {processingAttendance ? (
          t('attendance.processing')
        ) : (
          <>
            <Check className="h-4 w-4" />
            <span>{isAttending ? t('attendance.attending') : t('attendance.notAttending')}</span>
          </>
        )}
      </button>

      {showRegistration && (
        <QuickRegistrationModal
          venueId={venueId}
          venueName={venueName}
          onClose={() => setShowRegistration(false)}
          onSuccess={() => {
            setShowRegistration(false)
            handleAttendance()
          }}
        />
      )}
    </>
  )
}

interface QuickRegistrationModalProps {
  venueId: string
  venueName: string
  onClose: () => void
  onSuccess: () => void
}

const QuickRegistrationModal: React.FC<QuickRegistrationModalProps> = ({
  venueId,
  venueName,
  onClose,
  onSuccess
}) => {
  const { signUpWithPassword } = useAuth()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId.trim()) {
      setError('ユーザーIDを入力してください')
      return
    }

    if (userId.includes('@')) {
      setError('ユーザーIDに「@」は使えません')
      return
    }

    if (!password) {
      setError('パスワードを入力してください')
      return
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }

    if (!username.trim()) {
      setError('表示名を入力してください')
      return
    }

    setLoading(true)
    setError('')

    try {
      await signUpWithPassword(
        userId.trim(),
        password,
        username.trim()
      )
      onSuccess()
    } catch (err: any) {
      setError(err?.message || '登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-90vh overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {venueName}への参加表明
        </h2>
        
        <p className="text-gray-600 mb-4 text-sm">
          参加表明するにはアカウント登録が必要です
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ユーザー ID（XのユーザID）
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value.replace(/@/g, ''))}
              placeholder="例: reol_fan_123"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              英数字とアンダースコアのみ使用可能（@は入力不可）
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8文字以上"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              minLength={8}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              8文字以上で入力してください
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              表示名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="例: Reol れをる"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? '登録中...' : '登録して参加表明'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}