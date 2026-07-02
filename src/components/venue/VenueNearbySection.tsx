/**
 * VenueNearbySection - 近隣施設セクション
 * 
 * VenueDetailから抽出。コインロッカー、カフェ、グルメ、観光スポット、聖地を表示。
 * 各サブセクションは独立した表示条件を持つ。
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  MapPin,
  Globe,
  ExternalLink,
  Star,
  Coffee,
  Camera,
  Clock,
  Wifi,
  Package,
} from 'lucide-react'
import { type Venue, type NearbyAttraction, type HolyPlace } from '../../data/venues'
import { FacilityItem } from './FacilityItem'
import { SECTION_THEMES } from '../../constants/bijigaku'

interface VenueNearbySectionProps {
  venue: Venue
}

/** 推薦順ソート */
const sortByRecommended = <T extends { recommended?: boolean }>(items: T[]): T[] =>
  [...items].sort((a, b) => {
    if (a.recommended && !b.recommended) return -1
    if (!a.recommended && b.recommended) return 1
    return 0
  })

const VenueNearbySection: React.FC<VenueNearbySectionProps> = ({ venue }) => {
  const { t } = useTranslation('venue')
  const gourmetTheme = SECTION_THEMES.gourmet

  return (
    <>
      {/* コインロッカー情報 */}
      <div id="lockers" className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <div className="section-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('lockerInfo.title')}
          </h3>
        </div>
        <div className="p-6">
          {venue.coinLockers && venue.coinLockers.length > 0 ? (
            <ul className="space-y-3">
              {sortByRecommended(venue.coinLockers).map((locker, index) => (
                <FacilityItem
                  key={index}
                  name={locker.location ?? locker.name ?? ''}
                  description={locker.description}
                  recommended={locker.recommended}
                  recommendComment={locker.recommendComment}
                  icon={<MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                >
                  <div className="space-y-1 mt-1">
                    {locker.price && (
                      <p className="text-sm text-green-600 dark:text-green-400">{t('badges.price')}: {locker.price}</p>
                    )}
                    {locker.distance && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">{t('badges.distance')}: {locker.distance}</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {locker.website && (
                      <a href={locker.website} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <Globe className="h-3 w-3" />{t('buttons.details')}<ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {locker.mapsUrl && (
                      <a href={locker.mapsUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <MapPin className="h-3 w-3" />{t('buttons.map')}<ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </FacilityItem>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('messages.noDataRegistered')}</p>
          )}
        </div>
      </div>

      {/* 開場前の時間潰しスポット（カフェ） */}
      {venue.cafes && venue.cafes.length > 0 && (
        <div id="cafes" className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <div className="section-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              {t('cafeInfo.title')}
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {sortByRecommended(venue.cafes).map((cafe, index) => (
                <FacilityItem
                  key={index}
                  name={cafe.name}
                  description={cafe.description}
                  recommended={cafe.recommended}
                  recommendComment={cafe.recommendComment}
                  icon={<Coffee className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                >
                  <div className="flex flex-wrap gap-2 mt-2">
                    {cafe.openTime && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                        <Clock className="h-3 w-3" />{cafe.openTime}
                      </span>
                    )}
                    {cafe.distance && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded">
                        <MapPin className="h-3 w-3" />{cafe.distance}
                      </span>
                    )}
                    {cafe.wifi && (
                      <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 rounded">
                        <Wifi className="h-3 w-3" />Wi-Fi
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {cafe.website && (
                      <a href={cafe.website} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <Globe className="h-3 w-3" />{t('buttons.website')}<ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {cafe.mapsUrl && (
                      <a href={cafe.mapsUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <MapPin className="h-3 w-3" />{t('buttons.map')}<ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </FacilityItem>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* グルメ情報 */}
      <div
        id="restaurants"
        className="rounded-lg shadow-sm border backdrop-blur-sm"
        style={{ borderColor: gourmetTheme.borderColor }}
      >
        <div className="section-header" style={{ background: gourmetTheme.gradient }}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            {t('restaurantInfo.title')}
          </h3>
        </div>
        <div className="p-6">
          {venue.nearbyRestaurants && venue.nearbyRestaurants.length > 0 ? (
            <ul className="space-y-3">
              {sortByRecommended(venue.nearbyRestaurants).map((restaurant, index) => (
                <FacilityItem
                  key={index}
                  name={restaurant.name}
                  description={restaurant.description}
                  recommended={restaurant.recommended}
                  recommendComment={restaurant.recommendComment}
                  icon={<Coffee className="h-4 w-4 text-orange-500" />}
                >
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 px-2 py-1 rounded">
                      {restaurant.cuisine}
                    </span>
                    {restaurant.distance && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded">
                        <MapPin className="h-3 w-3" />{restaurant.distance}
                      </span>
                    )}
                    {restaurant.openTime && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                        <Clock className="h-3 w-3" />{restaurant.openTime}
                      </span>
                    )}
                    {restaurant.price && (
                      <span className="inline-flex items-center text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 rounded">
                        {restaurant.price}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {restaurant.website && (
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <Globe className="h-3 w-3" />{t('buttons.website')}<ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {restaurant.mapsUrl && (
                      <a href={restaurant.mapsUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <MapPin className="h-3 w-3" />{t('buttons.map')}<ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </FacilityItem>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('messages.noDataRegistered')}</p>
          )}
        </div>
      </div>

      {/* 観光スポット */}
      <div id="spots" className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <div className="section-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {t('attractionInfo.title')}
          </h3>
        </div>
        <div className="p-6">
          {venue.nearbyAttractions && venue.nearbyAttractions.length > 0 ? (
            <ul className="space-y-3">
              {venue.nearbyAttractions.map((attraction: NearbyAttraction, index: number) => (
                <li key={index} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0 pb-3 last:pb-0">
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{attraction.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{attraction.description}</p>
                      {attraction.distance && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          {t('labels.fromVenue')} {attraction.distance}
                        </p>
                      )}
                      {attraction.website && (
                        <a href={attraction.website} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-2">
                          <Globe className="h-3 w-3" />{t('buttons.details')}<ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('messages.noDataRegistered')}</p>
          )}
        </div>
      </div>

      {/* 聖地情報 */}
      {venue.holyPlaces && venue.holyPlaces.length > 0 && (
        <div id="holy" className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <div className="section-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="h-5 w-5" />
              {t('holyPlaceInfo.title')}
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {venue.holyPlaces.map((holyPlace: HolyPlace, index: number) => (
                <li key={index} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0 pb-3 last:pb-0">
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{holyPlace.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{holyPlace.description}</p>
                      {holyPlace.distance && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          {t('labels.fromVenue')} {holyPlace.distance}
                        </p>
                      )}
                      {holyPlace.website && (
                        <a href={holyPlace.website} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-2">
                          <Globe className="h-3 w-3" />{t('buttons.details')}<ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}

export default VenueNearbySection
