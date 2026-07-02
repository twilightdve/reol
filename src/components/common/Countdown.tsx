import React, { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { VENUES_2026 } from '../../data/venues'
import { Calendar, MapPin, Loader2 } from 'lucide-react'
import { getVenueCheckins, checkinToVenue, checkoutFromVenue, type CheckinUser } from '../../services/checkinService'

interface CountdownProps {
  currentUserId?: string
}

const DEBUG_FORCE_TODAY = false

export const Countdown: React.FC<CountdownProps> = ({ currentUserId }) => {
  const { t, i18n } = useTranslation('common')
  const [checkinUsers, setCheckinUsers] = useState<CheckinUser[]>([])
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const nextVenue = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 未来の日付の会場を探す
    const upcoming = VENUES_2026.filter(venue => {
      const venueDate = new Date(venue.date)
      venueDate.setHours(0, 0, 0, 0)
      return venueDate >= today
    })
    
    return upcoming.length > 0 ? upcoming[0] : null
  }, [])

  const daysUntil = useMemo(() => {
    if (!nextVenue) return -1
    if (DEBUG_FORCE_TODAY) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const venueDate = new Date(nextVenue.date)
    venueDate.setHours(0, 0, 0, 0)
    const diffTime = venueDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }, [nextVenue])

  const isToday = daysUntil === 0

  // 当日の場合、チェックインユーザーを取得
  useEffect(() => {
    if (!isToday || !nextVenue) return
    const loadCheckins = async () => {
      const users = await getVenueCheckins(nextVenue.id)
      setCheckinUsers(users)
      if (currentUserId) {
        setIsCheckedIn(users.some(u => u.user_id === currentUserId))
      }
    }
    loadCheckins()
  }, [isToday, nextVenue, currentUserId])

  const handleCheckin = async () => {
    if (!currentUserId || !nextVenue || isLoading) return
    setIsLoading(true)
    if (isCheckedIn) {
      const ok = await checkoutFromVenue(currentUserId, nextVenue.id)
      if (ok) {
        setIsCheckedIn(false)
        setCheckinUsers(prev => prev.filter(u => u.user_id !== currentUserId))
      }
    } else {
      const ok = await checkinToVenue(currentUserId, nextVenue.id)
      if (ok) {
        setIsCheckedIn(true)
        // リロードして最新リストを取得
        const users = await getVenueCheckins(nextVenue.id)
        setCheckinUsers(users)
      }
    }
    setIsLoading(false)
  }

  if (!nextVenue) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <Calendar className="h-12 w-12 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {t('countdown.lookingForward')}
          </span>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const locale = i18n.language === 'en' ? 'en-US' : 'ja-JP'
    return date.toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    })
  }

  // 当日モード: チェックイン表示
  if (isToday) {
    return (
      <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/40 dark:via-orange-950/30 dark:to-yellow-950/20 rounded-lg shadow-md p-6 text-center border border-red-200 dark:border-red-800/50">
        {/* ヘッダー: 本日公演 */}
        <div className="flex items-center gap-3 justify-center mb-4">
          <span className="text-3xl animate-pulse">🎤</span>
          <div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              本日公演！
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {nextVenue.name}
            </div>
          </div>
        </div>

        {/* チェックインボタン */}
        {currentUserId && (
          <button
            onClick={handleCheckin}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 mb-4 ${
              isCheckedIn
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-2 border-dashed border-gray-300 dark:border-gray-500 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className={`w-4 h-4 ${isCheckedIn ? 'text-white' : ''}`} />
            )}
            {isCheckedIn ? '会場前にいます！' : '会場前チェックイン'}
          </button>
        )}

        {/* チェックインユーザーバッジ */}
        {checkinUsers.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              📍 会場前にいるみんな（{checkinUsers.length}人）
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {checkinUsers.map(user => (
                <a
                  key={user.user_id}
                  href={`https://x.com/${user.username?.trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-600 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  {user.full_name || user.username || user.user_id}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 通常モード: カウントダウン
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
      <div className="flex items-center gap-4 justify-center flex-wrap">
        <Calendar className="h-10 w-10 text-red-600 dark:text-red-400" />
        <div className="text-center sm:text-left">
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            {t('countdown.nextShow')}
          </div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            {t('countdown.days', { count: daysUntil })}
          </div>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
          {formatDate(nextVenue.date)}<br />
          {nextVenue.name}
        </div>
      </div>
    </div>
  )
}
