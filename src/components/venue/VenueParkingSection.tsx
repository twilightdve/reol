/**
 * VenueParkingSection - 駐車場情報セクション
 * 
 * VenueDetailから抽出。公式駐車場情報と周辺駐車場リストを表示。
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ParkingCircle, MapPin, Globe, ExternalLink } from 'lucide-react'
import { type Venue } from '../../data/venues'
import { FacilityItem } from './FacilityItem'
import { SECTION_THEMES } from '../../constants/bijigaku'

interface VenueParkingSectionProps {
  venue: Venue
}

const VenueParkingSection: React.FC<VenueParkingSectionProps> = ({ venue }) => {
  const { t } = useTranslation('venue')
  const theme = SECTION_THEMES.parking

  return (
    <div
      id="parking"
      className="rounded-lg shadow-lg border overflow-hidden"
      style={{
        background: theme.gradient,
        borderColor: theme.borderColor,
      }}
    >
      <div
        className="section-header"
        style={{ borderColor: theme.borderColor }}
      >
        <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: theme.textColor }}>
          <ParkingCircle className="h-5 w-5" />
          {t('parkingInfo.title')}
        </h2>
      </div>
      <div className="p-6">
        {/* parkingInfo（公式サイトからの詳細情報） */}
        {venue.parkingInfo && (
          <div className="mb-6 pb-6 border-b border-gray-600 dark:border-gray-600">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: theme.textColor }}>
              <ParkingCircle className="h-4 w-4 text-purple-400" />
              {t('parkingInfo.official')}
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: theme.bodyTextColor }}>
              {venue.parkingInfo}
            </p>
          </div>
        )}

        {/* parkingOptions（周辺駐車場リスト） */}
        {venue.parkingOptions && venue.parkingOptions.length > 0 ? (
          <div>
            {venue.parkingInfo && (
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: theme.textColor }}>
                <ParkingCircle className="h-4 w-4" />
                {t('parkingInfo.nearby')}
              </h3>
            )}
            <ul className="space-y-4">
              {[...venue.parkingOptions].sort((a, b) => {
                if (a.recommended && !b.recommended) return -1
                if (!a.recommended && b.recommended) return 1
                return 0
              }).map((parking, index) => (
                <FacilityItem
                  key={index}
                  name={parking.name}
                  description={parking.description}
                  recommended={parking.recommended}
                  recommendComment={parking.recommendComment}
                  icon={<ParkingCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                >
                  <div className="flex flex-wrap gap-2 mb-2">
                    {parking.distance && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded">
                        <MapPin className="h-3 w-3" />
                        {parking.distance}
                      </span>
                    )}
                    {parking.price && (
                      <span className="inline-flex items-center text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                        {parking.price}
                      </span>
                    )}
                  </div>
                  {parking.address && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('labels.address')}: {parking.address}</p>
                  )}
                  <div className="flex gap-2">
                    {parking.website && (
                      <a
                        href={parking.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Globe className="h-3 w-3" />
                        {t('buttons.detailsReservation')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {parking.mapsUrl && (
                      <a
                        href={parking.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <MapPin className="h-3 w-3" />
                        {t('buttons.map')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </FacilityItem>
              ))}
            </ul>
          </div>
        ) : !venue.parkingInfo && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('messages.noDataRegistered')}
          </p>
        )}
      </div>
    </div>
  )
}

export default VenueParkingSection
