import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getVenueAttendees, getVenueAttendanceCount } from '../../services/venueService'
import { useAuth } from '../../contexts/AuthContext'
import { type Comment } from '../../services/commentService'

interface Attendee {
  user_id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

interface VenueAttendeesListProps {
  venueId: string
  comments?: { [userId: string]: Comment }
}

export const VenueAttendeesList: React.FC<VenueAttendeesListProps> = ({ venueId, comments = {} }) => {
  const { profile } = useAuth()
  const { t } = useTranslation('common')
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [attendanceCount, setAttendanceCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showList, setShowList] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const INITIAL_DISPLAY_COUNT = 10

  useEffect(() => {
    loadAttendanceData()
  }, [venueId, profile])

  const loadAttendanceData = async () => {
    setLoading(true)
    try {
      const [attendeesList, count] = await Promise.all([
        getVenueAttendees(venueId),
        getVenueAttendanceCount(venueId)
      ])
      
      // 全参加者を表示（自分自身も含む）
      const filteredAttendees = attendeesList
      
      console.log(`[VenueAttendeesList] Loaded data for venue ${venueId}:`, {
        attendeesCount: attendeesList.length,
        filteredCount: filteredAttendees.length,
        attendanceCount: count,
        currentUser: profile?.username,
        attendees: filteredAttendees
      })
      
      setAttendees(filteredAttendees)
      setAttendanceCount(count)
      
      // 参加者がいる場合は初期状態でリストを表示
      if (attendeesList.length > 0) {
        setShowList(true)
      }
    } catch (error) {
      console.error('参加者データの取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDisplayName = (attendee: Attendee) => {
    return attendee.username || attendee.full_name || 'Unknown'
  }

  // 検索フィルター
  const filteredAttendees = attendees.filter((attendee: Attendee) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const displayName = getDisplayName(attendee).toLowerCase()
    const username = attendee.username.toLowerCase()
    return displayName.includes(query) || username.includes(query)
  })

  // 表示する参加者リストを決定
  const displayedAttendees = showAll ? filteredAttendees : filteredAttendees.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMoreAttendees = filteredAttendees.length > INITIAL_DISPLAY_COUNT

  console.log(`[VenueAttendeesList] Render state:`, {
    loading,
    attendeesLength: attendees.length,
    displayedAttendeesLength: displayedAttendees.length,
    attendanceCount,
    showList,
    showAll,
    hasMoreAttendees
  })

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('attendees.title')}
        </h3>
        <span className="text-sm text-gray-500">
          {attendanceCount}{t('attendees.count')}
        </span>
      </div>

      {attendanceCount === 0 ? (
        <p className="text-gray-500 text-sm">
          {t('attendees.noAttendees')}
        </p>
      ) : (
        <>
          <button
            onClick={() => {
              setShowList(!showList)
              if (showList) {
                setShowAll(false) // リストを閉じる時は「もっと見る」もリセット
              }
            }}
            className="w-full text-left text-purple-600 hover:text-purple-700 text-sm font-medium mb-3"
          >
            {showList ? '▼' : '▶'} {t('attendees.toggleView', { action: showList ? t('attendees.hide') : t('attendees.show') })}
          </button>

          {showList && (
            <>
              {/* 検索ボックス */}
              <div className="mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('attendees.search')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2 max-h-[712px] overflow-y-auto">
                {/* デバッグ用コンソール出力 */}
                {(() => {
                  console.log(`[VenueAttendeesList] About to render ${displayedAttendees.length} attendees:`, displayedAttendees)
                  return null
                })()}
                
                {displayedAttendees.length > 0 ? (
                  displayedAttendees.map((attendee, index) => {
                    const comment = comments[attendee.user_id]
                    return (
                      <div
                        key={`${attendee.user_id}-${index}`}
                        className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <a
                          href={`https://x.com/${attendee.user_id.trim()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            {/* アバター */}
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                              {attendee.avatar_url ? (
                                <img 
                                  src={attendee.avatar_url} 
                                  alt={getDisplayName(attendee)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-purple-600 text-[8px] font-bold">
                                  {getDisplayName(attendee).charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* 名前とユーザー名 */}
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-base text-gray-900 truncate">
                                {getDisplayName(attendee)}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                <span>ID: {attendee.user_id}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {/* Xアイコン */}
                            <div className="text-blue-600" title="Xアカウント">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                            </div>
                          </div>
                        </a>
                        
                        {/* コメント吹き出し */}
                        {comment && (
                          <div className="mt-2 bg-white rounded-lg p-3 relative border border-gray-200">
                            <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm text-gray-700 relative z-10">
                                  {comment.content}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 relative z-10">
                                  {new Date(comment.created_at).toLocaleString('ja-JP', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZone: 'Asia/Tokyo'
                                  }).replace(/\//g, '-')}
                                </p>
                              </div>
                              {profile?.id === attendee.user_id && (
                                <button
                                  onClick={async () => {
                                    if (confirm('コメントを削除しますか？')) {
                                      const { deleteComment } = await import('../../services/commentService')
                                      const success = await deleteComment(comment.id)
                                      if (success) {
                                        // ページをリロードして更新
                                        window.location.reload()
                                      }
                                    }
                                  }}
                                  className="px-1.5 py-0.5 bg-red-500 hover:bg-red-600 text-white rounded text-xl font-bold relative z-10 flex-shrink-0 w-7 h-7 flex items-center justify-center leading-none"
                                  title="削除"
                                >
                                  <span className="block -mt-0.5">×</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center text-gray-500 py-4 text-sm">
                    {t('attendees.noResults')}
                  </div>
                )}
              </div>
              
              {/* もっと見るボタン */}
              {hasMoreAttendees && (
                <div className="mt-3 text-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors font-medium"
                  >
                    {showAll 
                      ? `▲ ${t('attendees.showLess', { count: INITIAL_DISPLAY_COUNT })}` 
                      : `▼ ${t('attendees.showMore', { count: filteredAttendees.length - INITIAL_DISPLAY_COUNT })}`
                    }
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

// 会場カード用の簡単な参加者数表示コンポーネント
interface AttendanceCountDisplayProps {
  venueId: string
}

export const AttendanceCountDisplay: React.FC<AttendanceCountDisplayProps> = ({ venueId }) => {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const loadCount = async () => {
      try {
        const attendanceCount = await getVenueAttendanceCount(venueId)
        setCount(attendanceCount)
      } catch (error) {
        console.error('参加者数の取得エラー:', error)
        setCount(0)
      }
    }

    loadCount()
  }, [venueId])

  if (count === null) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
    )
  }

  return (
    <span className="text-sm text-gray-600">
      参加表明: {count}名
    </span>
  )
}