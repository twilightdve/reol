/**
 * VenueHotelSection - 宿泊施設情報セクション
 * 
 * VenueDetailから抽出。宿泊施設をグリッド表示。
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Globe, ExternalLink } from 'lucide-react'
import { type Venue } from '../../data/venues'
import { SECTION_THEMES } from '../../constants/bijigaku'

interface VenueHotelSectionProps {
  venue: Venue
}

const VenueHotelSection: React.FC<VenueHotelSectionProps> = ({ venue }) => {
  const { t } = useTranslation('venue')
  const theme = SECTION_THEMES.hotel

  if (!venue.accommodations || venue.accommodations.length === 0) return null

  return (
    <div
      id="hotels"
      className="rounded-lg shadow-lg border"
      style={{
        background: theme.gradient,
        borderColor: theme.borderColor,
      }}
    >
      <div
        className="section-header"
        style={{ borderColor: theme.innerBorderColor }}
      >
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: theme.titleColor }}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {t('accommodationInfo.title')}
        </h3>
      </div>
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[...venue.accommodations].sort((a, b) => {
            if (a.recommended && !b.recommended) return -1
            if (!a.recommended && b.recommended) return 1
            return 0
          }).map((accommodation, index) => (
            <div key={index} className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">{accommodation.name}</span>
                {accommodation.recommended && (
                  <span className="inline-flex items-center text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded">
                    {t('badges.recommended')}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{accommodation.description}</div>
              <div className="flex gap-2 text-sm">
                {accommodation.website && (
                  <a
                    href={accommodation.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Globe className="h-3 w-3" />
                    {t('buttons.website')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {accommodation.mapsUrl && (
                  <a
                    href={accommodation.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <MapPin className="h-3 w-3" />
                    {t('buttons.map')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VenueHotelSection
