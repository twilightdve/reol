/**
 * VenueListSection - 参加表明会場 + 全会場一覧
 * 
 * ReolMapLayoutのOverviewTabから抽出。
 * ログイン時は参加表明会場とその他の会場、ゲスト時は全会場を表示。
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../contexts/AuthContext'
import { type Venue } from '../../../data/venues'
import { getVenueGradient } from '../../../utils/venueGradient'
import VenueListItem from './VenueListItem'
import type { FormattedDate, VenueAttendanceCountMap, ChecklistProgressMap } from '../../../types/bijigaku'

const FINISHED_GRADIENT = 'linear-gradient(135deg, #4b5563, #6b7280)'

const isVenueFinished = (dateString: string): boolean => {
  const now = new Date()
  const venueDate = new Date(dateString)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const venueDateOnly = new Date(venueDate.getFullYear(), venueDate.getMonth(), venueDate.getDate())
  return venueDateOnly < today
}

interface VenueListSectionProps {
  venues: Venue[]
  selectedVenues: string[]
  venueAttendanceCounts: VenueAttendanceCountMap
  checklistProgress: ChecklistProgressMap
  formatDate: (dateString: string) => FormattedDate
  getPrefectureName: (prefecture: string) => string
}

const VenueListSection: React.FC<VenueListSectionProps> = ({
  venues,
  selectedVenues,
  venueAttendanceCounts,
  checklistProgress,
  formatDate,
  getPrefectureName,
}) => {
  const { t } = useTranslation('common')
  const { user, profile } = useAuth()

  return (
    <>
      {/* 参加表明会場 */}
      {user && selectedVenues.length > 0 && (
        <div className="venue-list-card rounded-lg bg-transparent">
          <div className="section-header">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t('mainPage.yourVenues', {
                name: profile?.full_name || profile?.username || t('mainPage.you', { defaultValue: 'あなた' })
              })}
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {selectedVenues
              .map((venueId: string) => venues.find((v) => v.id === venueId))
              .filter((venue): venue is Venue => venue != null)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((venue) => {
                const dateInfo = formatDate(venue.date)
                const finished = isVenueFinished(venue.date)
                return (
                  <VenueListItem
                    key={venue.id}
                    venue={venue}
                    dateInfo={dateInfo}
                    venueGradient={finished ? FINISHED_GRADIENT : getVenueGradient(venue)}
                    venueAttendanceCount={venueAttendanceCounts[venue.id]}
                    checklistProgress={checklistProgress[venue.id]}
                    getPrefectureName={getPrefectureName}
                  />
                )
              })}
          </div>
        </div>
      )}

      {/* 全会場一覧 / その他の会場一覧 */}
      {(() => {
        const otherVenues = venues.filter((venue) => {
          if (user) {
            return !selectedVenues.includes(venue.id)
          }
          return true
        })

        if (otherVenues.length === 0) return null

        return (
          <div className="venue-list-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="section-header">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {user ? t('venueList.otherVenues') : t('venueList.allVenues')}
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {otherVenues.map((venue) => {
                const dateInfo = formatDate(venue.date)
                const finished = isVenueFinished(venue.date)
                return (
                  <VenueListItem
                    key={venue.id}
                    venue={venue}
                    dateInfo={dateInfo}
                    venueGradient={finished ? FINISHED_GRADIENT : getVenueGradient(venue)}
                    venueAttendanceCount={venueAttendanceCounts[venue.id]}
                    getPrefectureName={getPrefectureName}
                    showTypeIcon
                  />
                )
              })}
            </div>
          </div>
        )
      })()}
    </>
  )
}

export default VenueListSection
