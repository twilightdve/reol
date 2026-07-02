/**
 * VenueOtherVenues - 他の開催予定会場セクション
 * 
 * VenueDetailから抽出。前後の公演会場を表示。
 */
import React from 'react'
import { Link } from 'gatsby'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'
import { VENUES_2026, VENUES_2026_EN } from '../../data/venues'

interface VenueOtherVenuesProps {
  venueId: string
}

const VenueOtherVenues: React.FC<VenueOtherVenuesProps> = ({ venueId }) => {
  const { t } = useTranslation('venue')
  const { language } = useLanguage()

  const venuesList = language === 'en' ? VENUES_2026_EN : VENUES_2026
  const currentIndex = venuesList.findIndex(v => v.id === venueId)
  const prevVenue = currentIndex > 0 ? [venuesList[currentIndex - 1]] : []
  const nextVenues = venuesList.slice(currentIndex + 1, currentIndex + 3)
  const displayVenues = [...prevVenue, ...nextVenues]

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('otherVenues.title')}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {displayVenues.map(otherVenue => (
          <Link
            key={otherVenue.id}
            to={`/bijigaku-navi/venue/${otherVenue.id}/`}
            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors group"
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {otherVenue.name}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {otherVenue.location.prefecture} • {new Date(otherVenue.date).toLocaleDateString(language === 'en' ? 'en-US' : 'ja-JP', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
            <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
          </Link>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link
          to="/bijigaku-navi/"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          {t('navigation.viewAllVenues')}
          <ArrowLeft className="h-4 w-4 rotate-180" />
        </Link>
      </div>
    </div>
  )
}

export default VenueOtherVenues
