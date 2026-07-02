/**
 * VenueAccessSection - 遠征アクセス情報セクション
 * 
 * VenueDetailから抽出。空港・新幹線・高速バス・車でのアクセスルートを表示。
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Train, Plane, Bus, Info } from 'lucide-react'
import { type Venue, type AccessRoute } from '../../data/venues'
import { SECTION_THEMES } from '../../constants/bijigaku'

interface VenueAccessSectionProps {
  venue: Venue
}

/** アクセスルートカード（空港・新幹線・バス・車 共通） */
const RouteCard: React.FC<{ route: AccessRoute; timeColorClass: string }> = ({ route, timeColorClass }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <h5 className="font-semibold text-gray-900 dark:text-white">{route.from}</h5>
        <p className="text-sm text-gray-600 dark:text-gray-400">{route.method}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${timeColorClass}`}>{route.time}</p>
        {route.cost && <p className="text-xs text-gray-500 dark:text-gray-400">{route.cost}</p>}
      </div>
    </div>
    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{route.description}</p>
    {route.notes && (
      <p className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
        ⚠️ {route.notes}
      </p>
    )}
  </div>
)

const VenueAccessSection: React.FC<VenueAccessSectionProps> = ({ venue }) => {
  const { t } = useTranslation('venue')
  const theme = SECTION_THEMES.access

  if (!venue.access && !venue.longDistanceAccess) return null

  return (
    <div
      id="access"
      className="rounded-lg shadow-lg border"
      style={{
        background: theme.gradient,
        borderColor: theme.borderColor,
      }}
    >
      <div
        className="section-header"
        style={{ borderColor: theme.borderColor }}
      >
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: theme.textColor }}>
          <Plane className="h-5 w-5" />
          {t('accessInfo.longDistanceTitle')}
        </h3>
        {venue.longDistanceAccess?.recommendations && (
          <p className="text-sm mt-2 flex items-start gap-2" style={{ color: theme.textColor }}>
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{venue.longDistanceAccess.recommendations}</span>
          </p>
        )}
      </div>
      <div className="p-4 space-y-2">
        {/* 会場周辺のアクセス情報 */}
        {venue.access && (
          <div>
            <h4 className="text-md font-semibold mb-1.5 flex items-center gap-2" style={{ color: theme.textColor }}>
              <Train className="h-4 w-4" />
              {t('accessInfo.subtitle')}
            </h4>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {venue.access}
              </p>
            </div>
          </div>
        )}

        {/* 空港からのアクセス */}
        {venue.longDistanceAccess?.fromAirport && venue.longDistanceAccess.fromAirport.length > 0 && (
          <div>
            <h4 className="text-md font-semibold mb-1.5 flex items-center gap-2" style={{ color: theme.textColor }}>
              <Plane className="h-4 w-4" />
              {t('accessInfo.fromAirport')}
            </h4>
            <div className="space-y-4">
              {venue.longDistanceAccess.fromAirport.map((route: AccessRoute, index: number) => (
                <RouteCard key={index} route={route} timeColorClass="text-blue-600 dark:text-blue-400" />
              ))}
            </div>
          </div>
        )}

        {/* 新幹線からのアクセス */}
        {venue.longDistanceAccess?.fromShinkansen && venue.longDistanceAccess.fromShinkansen.length > 0 && (
          <div>
            <h4 className="text-md font-semibold mb-1.5 flex items-center gap-2" style={{ color: theme.textColor }}>
              <Train className="h-4 w-4" />
              {t('accessInfo.byShinkansen')}
            </h4>
            <div className="space-y-4">
              {venue.longDistanceAccess.fromShinkansen.map((route: AccessRoute, index: number) => (
                <RouteCard key={index} route={route} timeColorClass="text-green-600 dark:text-green-400" />
              ))}
            </div>
          </div>
        )}

        {/* 高速バスでのアクセス */}
        {venue.longDistanceAccess?.fromExpressBus && venue.longDistanceAccess.fromExpressBus.length > 0 && (
          <div>
            <h4 className="text-md font-semibold mb-3 flex items-center gap-2" style={{ color: theme.textColor }}>
              <Bus className="h-4 w-4" />
              {t('accessInfo.byHighwayBus')}
            </h4>
            <div className="space-y-4">
              {venue.longDistanceAccess.fromExpressBus.map((route: AccessRoute, index: number) => (
                <RouteCard key={index} route={route} timeColorClass="text-purple-600 dark:text-purple-400" />
              ))}
            </div>
          </div>
        )}

        {/* 車でのアクセス */}
        {venue.longDistanceAccess?.fromCar && venue.longDistanceAccess.fromCar.length > 0 && (
          <div>
            <h4 className="text-md font-semibold mb-3 flex items-center gap-2" style={{ color: theme.textColor }}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {t('accessInfo.byCar')}
            </h4>
            <div className="space-y-4">
              {venue.longDistanceAccess.fromCar.map((route: AccessRoute, index: number) => (
                <RouteCard key={index} route={route} timeColorClass="text-orange-600 dark:text-orange-400" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VenueAccessSection
