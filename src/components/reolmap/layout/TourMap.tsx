/**
 * TourMap - ツアー会場 地域別マップ
 * 
 * 地域ごとに会場をグループ化して表示。
 * 参加者数・参加予定バッジ付き。
 * クリックで会場詳細ページへ。
 */
import React, { useMemo } from 'react'
import { Link } from 'gatsby'
import { useTranslation } from 'react-i18next'
import { MapPin, Users } from 'lucide-react'
import { type Venue } from '../../../data/venues'
import { getVenueGradient } from '../../../utils/venueGradient'
import type { VenueAttendanceCountMap } from '../../../types/bijigaku'

interface TourMapProps {
  venues: Venue[]
  venueAttendanceCounts: VenueAttendanceCountMap
  getPrefectureName: (prefecture: string) => string
  selectedVenues?: string[]
}

// 地域定義
const REGIONS: { key: string; label: string; labelEn: string; prefectures: string[] }[] = [
  { key: 'hokkaido', label: '北海道', labelEn: 'Hokkaido', prefectures: ['北海道'] },
  { key: 'tohoku', label: '東北', labelEn: 'Tohoku', prefectures: ['青森', '岩手', '宮城', '秋田', '山形', '福島'] },
  { key: 'kanto', label: '関東', labelEn: 'Kanto', prefectures: ['茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川'] },
  { key: 'chubu', label: '中部', labelEn: 'Chubu', prefectures: ['新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知'] },
  { key: 'kinki', label: '近畿', labelEn: 'Kinki', prefectures: ['三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山'] },
  { key: 'chugoku', label: '中国', labelEn: 'Chugoku', prefectures: ['鳥取', '島根', '岡山', '広島', '山口'] },
  { key: 'shikoku', label: '四国', labelEn: 'Shikoku', prefectures: ['徳島', '香川', '愛媛', '高知'] },
  { key: 'kyushu', label: '九州・沖縄', labelEn: 'Kyushu/Okinawa', prefectures: ['福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'] },
]

const TourMap: React.FC<TourMapProps> = ({
  venues,
  venueAttendanceCounts,
  getPrefectureName,
  selectedVenues = [],
}) => {
  const { t, i18n } = useTranslation('common')
  const isEn = i18n.language === 'en'

  // 地域ごとに会場をグループ化
  const regionData = useMemo(() => {
    return REGIONS.map(region => {
      const regionVenues = venues.filter(v =>
        region.prefectures.includes(v.location?.prefecture || '')
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      const totalAttendees = regionVenues.reduce(
        (sum, v) => sum + (venueAttendanceCounts[v.id] || 0), 0
      )

      return {
        ...region,
        venues: regionVenues,
        totalAttendees,
      }
    }).filter(r => r.venues.length > 0)
  }, [venues, venueAttendanceCounts])

  const getBarColor = (venue: Venue): string => {
    const gradient = getVenueGradient(venue)
    const match = gradient.match(/#[0-9a-fA-F]{6}/g)
    return match ? match[0] : '#977c30'
  }

  return (
    <div id="tour-map-section" className="space-y-5">
      <div className="px-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t('tourMap.title', 'ツアーマップ')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('tourMap.description', '全国のツアー会場を地図で確認できます')}
        </p>
      </div>

      <div className="mx-4 space-y-4">
        {regionData.map(region => (
          <div
            key={region.key}
            className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
          >
            {/* 地域ヘッダー */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#977c30]" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {isEn ? region.labelEn : region.label}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {region.venues.length}{t('tourMap.venueCount', '会場')}
                </span>
              </div>
              {region.totalAttendees > 0 && (
                <div className="flex items-center gap-1 text-xs text-[#977c30] font-medium">
                  <Users className="h-3 w-3" />
                  {region.totalAttendees}{t('venueList.people')}
                </div>
              )}
            </div>

            {/* 会場リスト */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {region.venues.map(venue => {
                const count = venueAttendanceCounts[venue.id] || 0
                const isAttending = selectedVenues.includes(venue.id)
                const color = getBarColor(venue)
                const date = new Date(venue.date)
                const daysOfWeek = t('dateTime.daysOfWeek', { returnObjects: true }) as string[]

                return (
                  <Link
                    key={venue.id}
                    to={`/bijigaku-navi/venue/${venue.id}/`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group"
                  >
                    {/* カラーバー */}
                    <div
                      className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />

                    {/* 情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {venue.name}
                        </span>
                        {isAttending && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                            ✓ {t('timeline.attending', '参加予定')}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <span>
                          {date.getMonth() + 1}/{date.getDate()}({daysOfWeek[date.getDay()]})
                        </span>
                        <span>
                          {getPrefectureName(venue.location?.prefecture || '')}
                        </span>
                        <span>
                          {t('venueList.capacity')} {venue.capacity?.toLocaleString() || '?'}{t('venueList.people')}
                        </span>
                      </div>
                    </div>

                    {/* 参加者数 */}
                    {count > 0 && (
                      <div className="flex items-center gap-1 text-sm font-bold text-[#977c30] flex-shrink-0">
                        <Users className="h-3.5 w-3.5" />
                        {count}
                      </div>
                    )}

                    {/* 矢印 */}
                    <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TourMap
