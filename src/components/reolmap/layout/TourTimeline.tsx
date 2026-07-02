/**
 * TourTimeline - ツアー日程タイムライン
 * 
 * 全公演を時系列で一覧表示。
 * 終了済み/当日/今後の公演をバッジで区別。
 * 参加会場にはチェックリスト進捗も表示。
 * ログイン不要で閲覧可能。
 */
import React, { useMemo, useState } from 'react'
import { Link } from 'gatsby'
import { useTranslation } from 'react-i18next'
import { MapPin, Calendar, Users, CheckCircle2, Star, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { type Venue } from '../../../data/venues'
import { getVenueGradient } from '../../../utils/venueGradient'
import type { VenueAttendanceCountMap } from '../../../types/bijigaku'

interface TourTimelineProps {
  venues: Venue[]
  venueAttendanceCounts: VenueAttendanceCountMap
  getPrefectureName: (prefecture: string) => string
  selectedVenues?: string[]
  userDisplayName?: string | null
}

type VenueStatus = 'finished' | 'today' | 'upcoming' | 'next'

const TourTimeline: React.FC<TourTimelineProps> = ({
  venues,
  venueAttendanceCounts,
  getPrefectureName,
  selectedVenues = [],
  userDisplayName,
}) => {
  const { t } = useTranslation('common')
  const [showFinished, setShowFinished] = useState(false)

  const getVenueStatus = (dateString: string): VenueStatus => {
    const now = new Date()
    const venueDate = new Date(dateString)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const venueDateOnly = new Date(venueDate.getFullYear(), venueDate.getMonth(), venueDate.getDate())
    
    if (venueDateOnly.getTime() === today.getTime()) return 'today'
    if (venueDateOnly < today) return 'finished'
    return 'upcoming'
  }

  // 次の公演を特定
  const timelineData = useMemo(() => {
    let foundNext = false
    return venues.map(venue => {
      let status = getVenueStatus(venue.date)
      if (!foundNext && status === 'upcoming') {
        status = 'next'
        foundNext = true
      }
      return { venue, status }
    })
  }, [venues])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const daysOfWeek = t('dateTime.daysOfWeek', { returnObjects: true }) as string[]
    return {
      month: date.getMonth() + 1,
      day: date.getDate(),
      dayOfWeek: daysOfWeek[date.getDay()],
    }
  }

  const getStatusBadge = (status: VenueStatus) => {
    switch (status) {
      case 'finished':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            <CheckCircle2 className="h-3 w-3" />
            {t('timeline.finished', '終了')}
          </span>
        )
      case 'today':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
            <Star className="h-3 w-3" />
            {t('timeline.today', 'TODAY')}
          </span>
        )
      case 'next':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
            <Clock className="h-3 w-3" />
            {t('timeline.next', 'NEXT')}
          </span>
        )
      default:
        return null
    }
  }

  const getDaysUntil = (dateString: string): number => {
    const now = new Date()
    const venueDate = new Date(dateString)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const venueDateOnly = new Date(venueDate.getFullYear(), venueDate.getMonth(), venueDate.getDate())
    return Math.ceil((venueDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  // 月別にグループ化
  const monthGroups = useMemo(() => {
    const groups: { month: string; items: typeof timelineData }[] = []
    let currentMonth = ''
    
    timelineData.forEach(item => {
      const date = new Date(item.venue.date)
      const monthKey = `${date.getFullYear()}/${date.getMonth() + 1}`
      
      if (monthKey !== currentMonth) {
        currentMonth = monthKey
        groups.push({ month: monthKey, items: [] })
      }
      groups[groups.length - 1].items.push(item)
    })
    
    return groups
  }, [timelineData])

  // 終了済み公演数
  const finishedCount = useMemo(() =>
    timelineData.filter(item => item.status === 'finished').length
  , [timelineData])

  // 表示用月グループ（終了済みを除外可能）
  const visibleMonthGroups = useMemo(() => {
    if (showFinished) return monthGroups
    return monthGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => item.status !== 'finished'),
      }))
      .filter(group => group.items.length > 0)
  }, [monthGroups, showFinished])

  // 参加会場数
  const attendingCount = selectedVenues.length

  return (
    <div id="tour-timeline-section" className="space-y-5">
      <div className="px-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t('timeline.title', 'ツアー日程')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('timeline.description', '各公演をタップすると、会場アクセス・収容人数・参加者一覧などの詳細を確認できます')}
        </p>
        {attendingCount > 0 && (
          <p className="text-sm text-[#977c30] font-medium mt-1">
            {userDisplayName || t('mainPage.you', 'あなた')}: {attendingCount}{t('timeline.showsAttending', '公演参加予定')}
          </p>
        )}
      </div>

      {finishedCount > 0 && (
        <div className="mx-4">
          <button
            onClick={() => setShowFinished(prev => !prev)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-full justify-center"
          >
            {showFinished ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {showFinished
              ? t('timeline.hideFinished', '終了した公演を非表示')
              : t('timeline.showFinished', '終了した公演を表示（{{count}}件）', { count: finishedCount })
            }
          </button>
        </div>
      )}

      <div className="mx-4 space-y-6">
        {visibleMonthGroups.map(group => (
          <div key={group.month}>
            {/* 月ヘッダー */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#977c30] text-white rounded-full text-sm font-bold">
                <Calendar className="h-4 w-4" />
                {group.month.split('/')[1]}{t('timeline.month', '月')}
              </div>
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* タイムラインアイテム */}
            <div className="space-y-3">
              {group.items.map(({ venue, status }, itemIndex) => {
                const dateInfo = formatDate(venue.date)
                const count = venueAttendanceCounts[venue.id] || 0
                const gradient = getVenueGradient(venue)
                const isFinished = status === 'finished'
                const isToday = status === 'today'
                const isNext = status === 'next'
                const isAttending = selectedVenues.includes(venue.id)
                const daysUntil = getDaysUntil(venue.date)

                return (
                  <div key={venue.id}>
                    <div className="min-w-0">
                      <Link
                        to={`/bijigaku-navi/venue/${venue.id}/`}
                        className={`block rounded-lg p-3 transition-all border ${
                          isToday
                            ? 'border-red-400 shadow-lg shadow-red-100 dark:shadow-red-900/20'
                            : isNext
                            ? 'border-amber-400 shadow-md shadow-amber-100 dark:shadow-amber-900/20'
                            : isAttending
                            ? 'border-amber-300/60 dark:border-amber-600/40'
                            : 'border-gray-200 dark:border-gray-700'
                        } ${isFinished ? 'opacity-60' : 'hover:shadow-md hover:-translate-y-0.5'} transition-all duration-200`}
                        style={{
                          background: isFinished ? undefined : gradient,
                        }}
                      >
                        <div className={`${isFinished ? '' : 'text-white'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-bold text-sm ${isFinished ? 'text-gray-700 dark:text-gray-300' : 'text-shadow-venue'}`}>
                                {dateInfo.month}/{dateInfo.day}({dateInfo.dayOfWeek})
                              </span>
                              {getStatusBadge(status)}
                              {isAttending && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500 text-white">
                                  ✓ {t('timeline.attending', '参加予定')}
                                </span>
                              )}
                            </div>
                            {(isNext || (status === 'upcoming' && daysUntil <= 30)) && (
                              <span className={`text-xs font-medium ${isFinished ? 'text-gray-500' : 'text-white/80'}`}>
                                {t('timeline.daysUntil', 'あと{{days}}日', { days: daysUntil })}
                              </span>
                            )}
                          </div>

                          <h3 className={`font-semibold ${isFinished ? 'text-gray-800 dark:text-gray-200' : 'text-shadow-venue'}`}>
                            {venue.name}
                          </h3>

                          <div className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm mt-1 ${isFinished ? 'text-gray-600 dark:text-gray-400' : 'text-white/90'}`}>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {getPrefectureName(venue.location.prefecture)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {t('venueList.doorsOpen')}{venue.times.open} / {t('venueList.showStart')}{venue.times.start}
                            </span>
                            <span>
                              {t('venueList.capacity')} {venue.capacity?.toLocaleString() || '?'}{t('venueList.people')}
                            </span>
                            {count > 0 && (
                              <span className={`flex items-center gap-1 font-medium ${isFinished ? 'text-amber-600' : 'text-yellow-200'}`}>
                                <Users className="h-3 w-3" />
                                {count}{t('venueList.people')}
                              </span>
                            )}
                          </div>

                        </div>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TourTimeline
