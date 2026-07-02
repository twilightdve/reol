/**
 * VenueListItem - 会場一覧のカードアイテム
 * 
 * ReolMapLayoutから抽出。参加表明会場・全会場一覧の各アイテムで再利用。
 */
import React from 'react'
import { Link } from 'gatsby'
import { useTranslation } from 'react-i18next'
import { MapPin, Clock, ArrowRight, Home, Building2 } from 'lucide-react'
import { type Venue } from '../../../data/venues'
import { getVenueType } from '../../../constants/bijigaku'
import type { FormattedDate } from '../../../types/bijigaku'

interface VenueListItemProps {
  venue: Venue
  dateInfo: FormattedDate
  venueGradient: string
  venueAttendanceCount?: number
  checklistProgress?: number
  getPrefectureName: (prefecture: string) => string
  /** trueの場合、会場タイプアイコン（ホール/ライブハウス）を表示 */
  showTypeIcon?: boolean
}

const VenueListItem: React.FC<VenueListItemProps> = ({
  venue,
  dateInfo,
  venueGradient,
  venueAttendanceCount,
  checklistProgress,
  getPrefectureName,
  showTypeIcon = false,
}) => {
  const { t } = useTranslation('common')
  const venueType = getVenueType(venue.name, venue.capacity)

  return (
    <Link
      to={`/bijigaku-navi/venue/${venue.id}/`}
      className={`block ${showTypeIcon ? 'p-3' : 'p-4'} rounded-lg transition-colors border border-gray-100 dark:border-gray-600`}
      style={{ background: venueGradient }}
    >
      <div className="flex items-center justify-between">
        <div className={showTypeIcon ? 'flex items-center gap-3' : ''}>
          {showTypeIcon && (
            venueType === 'hall' ? (
              <Building2 className="h-5 w-5 text-emerald-400 flex-shrink-0 icon-shadow" />
            ) : (
              <Home className="h-5 w-5 text-orange-400 flex-shrink-0 icon-shadow" />
            )
          )}
          <div>
            <h3 className="font-medium text-white text-shadow-venue">
              {venue.name}
            </h3>
            <div className="space-y-1 mt-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-white text-shadow-venue">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <MapPin className="h-3 w-3" />
                  {getPrefectureName(venue.location.prefecture)}
                </span>
                <span className="whitespace-nowrap">
                  {dateInfo.month}/{dateInfo.day}({dateInfo.dayOfWeek})
                </span>
                <span className="whitespace-nowrap">
                  {t('venueList.capacity')} {venue.capacity ? venue.capacity.toLocaleString() : t('venueList.unknown')}{t('venueList.people')}
                </span>
                {venueAttendanceCount !== undefined && (
                  <span className="text-yellow-200 font-medium whitespace-nowrap">
                    👥 {venueAttendanceCount}{t('venueList.people')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-white text-shadow-venue">
                <Clock className="h-3 w-3" />
                {t('venueList.doorsOpen')}{venue.times.open} / {t('venueList.showStart')}{venue.times.start}
              </div>
              {checklistProgress !== undefined && (
                <div className="flex items-center gap-2 text-sm text-white font-medium">
                  <span>📋</span>
                  {t('mainPage.checklistProgress')} {checklistProgress}%
                </div>
              )}
            </div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-300" />
      </div>
    </Link>
  )
}

export default VenueListItem
