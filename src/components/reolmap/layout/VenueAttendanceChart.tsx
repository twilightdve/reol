import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import type { VenueAttendanceCountMap } from '../../../types/bijigaku'
import type { Venue } from '../../../data/venues/types'
import { COLORS } from '../../../constants/bijigaku'
import { getVenueGradient } from '../../../utils/venueGradient'

interface VenueAttendanceChartProps {
  venues: Venue[]
  venueAttendanceCounts: VenueAttendanceCountMap
  getPrefectureName: (prefecture: string) => string
}

type SortOption = 'date' | 'count-desc' | 'count-asc' | 'name'

const VenueAttendanceChart: React.FC<VenueAttendanceChartProps> = ({
  venues,
  venueAttendanceCounts,
  getPrefectureName,
}) => {
  const { t } = useTranslation('common')
  const [sortBy, setSortBy] = useState<SortOption>('date')

  // 都道府県名から「県」「都」「府」を削除（北海道は「道」を残す）
  const formatPrefectureName = (prefecture: string, city?: string): string => {
    const prefName = getPrefectureName(prefecture)
    // 北海道の場合は市名を表示
    if (prefName === '北海道' || prefName === 'Hokkaido') {
      if (city) {
        // 「旭川市」→「旭川」、「札幌市」→「札幌」
        return city.replace(/[市区町村]$/, '')
      }
      return prefName
    }
    // 「〜県」「〜都」「〜府」を削除
    return prefName.replace(/[県都府]$/, '')
  }

  // グラフ用のデータを準備
  const chartData = useMemo(() => {
    let data = venues.map((venue, index) => {
      const count = venueAttendanceCounts[venue.id] || 0
      const prefecture = venue.location?.prefecture || ''
      const city = venue.location?.city || ''
      const prefectureName = formatPrefectureName(prefecture, city)
      const gradient = getVenueGradient(venue)
      
      return {
        id: venue.id,
        name: venue.name,
        displayName: prefectureName,
        count,
        capacity: venue.capacity || 0,
        prefecture: prefecture,
        gradient: gradient,
        originalIndex: index,
      }
    })

    // ソート処理
    switch (sortBy) {
      case 'count-desc':
        data.sort((a, b) => b.count - a.count)
        break
      case 'count-asc':
        data.sort((a, b) => a.count - b.count)
        break
      case 'name':
        data.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
        break
      case 'date':
      default:
        // 元の日付順を維持
        data.sort((a, b) => a.originalIndex - b.originalIndex)
        break
    }

    return data
  }, [venues, venueAttendanceCounts, sortBy, getPrefectureName])

  // グラデーションから単色を抽出（中間色を使用）
  const getBarColorFromGradient = (gradient: string): string => {
    // linear-gradient(135deg, #color1, #color2) から色を抽出
    const match = gradient.match(/#[0-9a-fA-F]{6}/g)
    if (match && match.length >= 1) {
      // 最初の色を使用
      return match[0]
    }
    // フォールバック
    return '#977c30'
  }

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const prefecture = data.prefecture || ''
      return (
        <div
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          style={{
            padding: '12px',
          }}
        >
          <p style={{ fontWeight: 'bold', marginBottom: '4px' }} className="text-gray-900 dark:text-white">
            {data.name}
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '4px' }} className="text-gray-600 dark:text-gray-400">
            {getPrefectureName(prefecture)}
          </p>
          <p style={{ fontWeight: 'bold' }} className="text-[#977c30]">
            {t('venueList.attendees')}: {data.count}{t('venueList.people')}
            {data.capacity > 0 && (
              <span className="text-gray-500 font-normal"> / {data.capacity.toLocaleString()}{t('venueList.people')}</span>
            )}
          </p>
          {data.capacity > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('venueChart.attendanceRate', '参加率')}: {Math.round((data.count / data.capacity) * 100)}%
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const maxCount = Math.max(...chartData.map(d => d.count), 1)

  return (
    <div id="venue-chart-section" className="space-y-5">
      <div className="px-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t('venueChart.title', '会場別参加者数')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('venueChart.description', '各会場の参加表明者数を確認できます')}
        </p>
      </div>

      <div
        className="rounded-lg shadow-sm hover:shadow-md transition-shadow mx-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >

      {/* コントロール */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm font-semibold text-gray-700">
            {t('venueChart.sortBy', 'ソート順')}:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#977c30] bg-white"
          >
            <option value="date">{t('venueChart.sortByDate', '日付順')}</option>
            <option value="count-desc">{t('venueChart.sortByCountDesc', '参加者数（多い順）')}</option>
            <option value="count-asc">{t('venueChart.sortByCountAsc', '参加者数（少ない順）')}</option>
            <option value="name">{t('venueChart.sortByName', '会場名順')}</option>
          </select>
        </div>
      </div>

      {/* グラフ */}
      <div className="p-4 sm:p-6" style={{ minHeight: '400px' }}>
        <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 30)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis 
              type="number" 
              domain={[0, maxCount + 5]}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              type="category" 
              dataKey="displayName"
              width={65}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              name={t('venueList.attendees', '参加者数')}
              radius={[0, 8, 8, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColorFromGradient(entry.gradient)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 統計情報 */}
      <div className="p-4 sm:p-6 border-t-2 border-gray-300">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-600">{t('venueChart.totalVenues', '総会場数')}</div>
            <div className="text-lg font-bold text-[#977c30]">{chartData.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">{t('venueChart.maxAttendees', '最多参加')}</div>
            <div className="text-lg font-bold text-[#977c30]">{maxCount}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">{t('venueChart.avgAttendees', '平均参加')}</div>
            <div className="text-lg font-bold text-[#977c30]">
              {Math.round(chartData.reduce((sum, d) => sum + d.count, 0) / chartData.length)}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default VenueAttendanceChart
