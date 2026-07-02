/**
 * AttendeeSection - 参加者一覧セクション
 * 
 * ReolMapLayoutのOverviewTabから抽出。
 * 全参加者のカードをグリッド表示する。
 * 自分のカードを先頭に表示、残りは選択したソート順。
 * 10人単位のページングで「もっと見る」ボタンで追加表示。
 */
import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ArrowUp, ArrowDown, ArrowUpDown, Coffee, MapPin, X, Heart } from 'lucide-react'
import { AttendeeCard } from '../attendance/AttendeeCard'
import { getVenueByIdAndLocale } from '../../../data/venues'
import type { Attendee, AttendeeVenuesMap, CommentMap, AttendeeEncounterMap } from '../../../types/bijigaku'
import { getAttendeeUserId } from '../../../types/bijigaku'

const PAGE_SIZE = 10

type SortKey = 'default' | 'venues' | 'shared' | 'name' | 'updated'
type SortOrder = 'asc' | 'desc'

interface AttendeeSectionProps {
  allAttendees: Attendee[]
  attendeeVenues: AttendeeVenuesMap
  globalComments: CommentMap
  attendeeEncounters: AttendeeEncounterMap
  currentUserVenues?: string[]
  currentUserId?: string
  currentUserEncounterPolicy?: 'ok' | 'ng' | null
  currentUserMetaTags?: string[]
  currentUserFavoriteSong?: string | null
  encounterWants?: string[]
  encounterWantedBy?: string[]
  encounterWantCounts?: Record<string, number>
  onEncounterPolicyToggle?: () => void
  onMetaTagsChange?: (tags: string[]) => void
  onFavoriteSongChange?: (song: string | null) => void
  onEncounterWantToggle?: (targetUserId: string) => void
  onCommentPosted?: () => void
}

const AttendeeSection: React.FC<AttendeeSectionProps> = ({
  allAttendees,
  attendeeVenues,
  globalComments,
  attendeeEncounters,
  currentUserVenues = [],
  currentUserId,
  currentUserEncounterPolicy,
  currentUserMetaTags = [],
  currentUserFavoriteSong,
  encounterWants = [],
  encounterWantedBy = [],
  encounterWantCounts = {},
  onEncounterPolicyToggle,
  onMetaTagsChange,
  onFavoriteSongChange,
  onEncounterWantToggle,
  onCommentPosted,
}) => {
  const { t, i18n } = useTranslation('common')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [encounterFilter, setEncounterFilter] = useState(false)
  const [encounterWantFilter, setEncounterWantFilter] = useState(false)
  const [venueFilter, setVenueFilter] = useState<string>('')

  // 会場フィルタ用: attendeeVenuesから全ユニーク会場IDを収集
  const venueOptions = useMemo(() => {
    const venueIdSet = new Set<string>()
    Object.values(attendeeVenues).forEach(ids => ids.forEach(id => venueIdSet.add(id)))
    return Array.from(venueIdSet)
      .map(id => {
        const venue = getVenueByIdAndLocale(id, i18n.language === 'en' ? 'en' : 'ja')
        return { id, name: venue?.name || id, date: venue?.date || '' }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [attendeeVenues, i18n.language])

  // 共通会場数を計算
  const getSharedVenueCount = (userVenueIds: string[]): number => {
    if (currentUserVenues.length === 0) return 0
    return userVenueIds.filter(vid => currentUserVenues.includes(vid)).length
  }

  // ユーザーが「エンカOK」かどうかを判定
  // 1件でも会場別にOKがある、または基本方針がOKかつ全会場NGでなければOK
  const isAttendeeEncounterOk = (attendee: Attendee): boolean => {
    const userId = getAttendeeUserId(attendee)
    const policy = attendee.encounter_policy
    const venueEncounters = attendeeEncounters[userId]

    if (!policy) return false // 未設定は非表示

    if (venueEncounters) {
      // 会場別設定がある場合:
      // - 明示的にtrueの会場が1つでもあればOK
      const hasExplicitOk = Object.values(venueEncounters).some(v => v === true)
      if (hasExplicitOk) return true
      // - 全会場が明示的にfalseならNG
      const allExplicitNg = Object.values(venueEncounters).every(v => v === false)
      if (allExplicitNg) return false
    }

    // 会場別設定がない or nullの会場がある場合: 基本方針に従う
    return policy === 'ok'
  }

  // 各ソートキーのデフォルト方向
  const defaultOrder: Record<SortKey, SortOrder> = {
    default: 'desc',
    venues: 'desc',
    shared: 'desc',
    name: 'asc',
    updated: 'desc',
  }

  // ソートオプション定義
  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'default', label: t('attendees.sortDefault', '登録順') },
    { key: 'updated', label: t('attendees.sortByUpdated', '更新順') },
    { key: 'venues', label: t('attendees.sortByVenues', '参加公演数') },
    ...(currentUserId ? [{ key: 'shared' as SortKey, label: t('attendees.sortByShared', '共通会場数') }] : []),
    { key: 'name', label: t('attendees.sortByName', '名前') },
  ]

  // 自分を先頭、残りはソート順
  const sortedAttendees = useMemo(() => {
    const me = currentUserId
      ? allAttendees.find(a => getAttendeeUserId(a) === currentUserId)
      : undefined
    const others = currentUserId
      ? allAttendees.filter(a => getAttendeeUserId(a) !== currentUserId)
      : [...allAttendees]

    // ソート
    const dir = sortOrder === 'asc' ? 1 : -1

    switch (sortKey) {
      case 'venues':
        others.sort((a, b) => {
          const aCount = (attendeeVenues[getAttendeeUserId(a)] || []).length
          const bCount = (attendeeVenues[getAttendeeUserId(b)] || []).length
          return (aCount - bCount) * dir
        })
        break
      case 'shared':
        others.sort((a, b) => {
          const aShared = getSharedVenueCount(attendeeVenues[getAttendeeUserId(a)] || [])
          const bShared = getSharedVenueCount(attendeeVenues[getAttendeeUserId(b)] || [])
          return (aShared - bShared) * dir
        })
        break
      case 'name':
        others.sort((a, b) => {
          const aName = (a.full_name || a.username || getAttendeeUserId(a)).toLowerCase()
          const bName = (b.full_name || b.username || getAttendeeUserId(b)).toLowerCase()
          return aName.localeCompare(bName, 'ja') * dir
        })
        break
      case 'updated':
        others.sort((a, b) => {
          const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
          const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
          return (aTime - bTime) * dir
        })
        break
      default:
        // 登録順: desc=新しい順（元の配列順）、asc=古い順
        if (sortOrder === 'asc') {
          others.reverse()
        }
        break
    }

    return me ? [me, ...others] : others
  }, [allAttendees, currentUserId, sortKey, sortOrder, attendeeVenues, currentUserVenues])

  // エンカフィルタ + 会場フィルタを適用
  const filteredAttendees = useMemo(() => {
    let result = sortedAttendees

    if (encounterFilter) {
      result = result.filter(a => {
        if (currentUserId && getAttendeeUserId(a) === currentUserId) return true
        return isAttendeeEncounterOk(a)
      })
    }

    if (encounterWantFilter) {
      result = result.filter(a => {
        if (currentUserId && getAttendeeUserId(a) === currentUserId) return true
        return encounterWants.includes(getAttendeeUserId(a))
      })
    }

    if (venueFilter) {
      result = result.filter(a => {
        if (currentUserId && getAttendeeUserId(a) === currentUserId) return true
        const userVenues = attendeeVenues[getAttendeeUserId(a)] || []
        return userVenues.includes(venueFilter)
      })
    }

    return result
  }, [sortedAttendees, encounterFilter, encounterWantFilter, venueFilter, attendeeVenues, encounterWants])

  const displayedAttendees = filteredAttendees.slice(0, visibleCount)
  const remaining = filteredAttendees.length - visibleCount

  const handleShowMore = () => {
    setVisibleCount(prev => prev + PAGE_SIZE)
  }

  const handleSortChange = (key: SortKey) => {
    if (key === sortKey) {
      // 同じキーを再タップ → 昇順降順を切り替え
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      // 別のキーに変更 → デフォルトの方向を設定
      setSortKey(key)
      setSortOrder(defaultOrder[key])
    }
    setVisibleCount(PAGE_SIZE) // ソート変更時はページングをリセット
  }

  return (
    <div id="attendees-section" className="space-y-5">
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              <a href="#attendees-section" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                {t('attendees.sectionTitle')}
                <span className="ml-1.5 text-gray-300 dark:text-gray-600 text-lg">#</span>
              </a>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('attendees.sectionDescription')}
            </p>
          </div>
        </div>

        {/* ソートセレクト */}
        <div className="flex items-center gap-2 mt-3">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {sortOptions.map(option => {
              const isActive = sortKey === option.key
              return (
                <button
                  key={option.key}
                  onClick={() => handleSortChange(option.key)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                  {isActive && (
                    sortOrder === 'asc'
                      ? <ArrowUp className="w-3 h-3" />
                      : <ArrowDown className="w-3 h-3" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* フィルター */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {/* 会場フィルター */}
          <div className="relative inline-flex items-center">
            <MapPin className="w-3 h-3 absolute left-2.5 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
            <select
              value={venueFilter}
              onChange={(e) => {
                setVenueFilter(e.target.value)
                setVisibleCount(PAGE_SIZE)
              }}
              className={`appearance-none pl-7 pr-7 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                venueFilter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <option value="">{t('attendees.venueFilterAll', { defaultValue: 'すべての会場' })}</option>
              {venueOptions.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            {venueFilter && (
              <button
                onClick={() => {
                  setVenueFilter('')
                  setVisibleCount(PAGE_SIZE)
                }}
                className="ml-1 p-0.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setEncounterFilter(prev => !prev)
              setVisibleCount(PAGE_SIZE)
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              encounterFilter
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Coffee className="w-3 h-3" />
            {t('encounter.filterLabel', { defaultValue: 'エンカOKのみ' })}
          </button>

          {currentUserId && encounterWants.length > 0 && (
            <button
              onClick={() => {
                setEncounterWantFilter(prev => !prev)
                setVisibleCount(PAGE_SIZE)
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                encounterWantFilter
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Heart className="w-3 h-3" />
              エンカしたい人
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
        {displayedAttendees.map((attendee, idx) => {
          const userId = getAttendeeUserId(attendee)
          const venueIds = attendeeVenues[userId] || []
          const comment = globalComments[userId]
          const sharedCount = getSharedVenueCount(venueIds)
          const isCurrent = !!currentUserId && userId === currentUserId

          return (
            <AttendeeCard
              key={userId}
              userId={userId}
              username={attendee.username}
              fullName={attendee.full_name}
              avatarUrl={attendee.avatar_url}
              venueIds={venueIds}
              comment={comment?.content}
              commentDate={comment?.created_at}
              sharedVenueCount={sharedCount}
              isCurrentUser={isCurrent}
              encounterOk={isAttendeeEncounterOk(attendee)}
              encounterPolicy={isCurrent ? currentUserEncounterPolicy : undefined}
              reolType={attendee.reol_type}
              metaTags={isCurrent ? currentUserMetaTags : (attendee.meta_tags || [])}
              favoriteSong={isCurrent ? currentUserFavoriteSong : attendee.favorite_song}
              encounterWanted={!isCurrent && encounterWants.includes(userId)}
              encounterMutual={!isCurrent && encounterWants.includes(userId) && encounterWantedBy.includes(userId)}
              encounterWantCount={encounterWantCounts[userId] || 0}
              onEncounterPolicyToggle={isCurrent ? onEncounterPolicyToggle : undefined}
              onMetaTagsChange={isCurrent ? onMetaTagsChange : undefined}
              onFavoriteSongChange={isCurrent ? onFavoriteSongChange : undefined}
              onEncounterWantToggle={!isCurrent && currentUserId ? onEncounterWantToggle : undefined}
              onCommentPosted={isCurrent ? onCommentPosted : undefined}
            />
          )
        })}
      </div>

      {/* もっと見るボタン */}
      {remaining > 0 && (
        <div className="flex justify-center px-4">
          <button
            onClick={handleShowMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            {t('attendees.showMore', 'もっと見る（+{{count}}名）', { count: Math.min(remaining, PAGE_SIZE) })}
          </button>
        </div>
      )}
    </div>
  )
}

export default AttendeeSection
