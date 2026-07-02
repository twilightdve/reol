/**
 * StatsOverview - 統計カード + カウントダウン + セットリスト予想リンク
 * 
 * ReolMapLayoutのOverviewTabから抽出。
 * カウントダウンタイマー、総参加者数、参加公演数を表示。
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Countdown } from '../../common/Countdown'

interface StatsOverviewProps {
  totalAttendees: number
  userDisplayName: string | null
  selectedVenuesCount: number
  currentUserId?: string
  onOpenVenueSelector: () => void
}

const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalAttendees,
  userDisplayName,
  selectedVenuesCount,
  currentUserId,
  onOpenVenueSelector,
}) => {
  const { t } = useTranslation('common')

  return (
    <div className="text-center space-y-4">
      <p className="text-lg text-gray-600 dark:text-gray-300">
        {t('mainPage.checkVenueInfo')}
      </p>

      {/* カウントダウン */}
      <div className="w-full px-4 mb-8">
        <Countdown currentUserId={currentUserId} />
      </div>

      {/* 統計カード - 横一列レイアウト */}
      <div className="flex justify-center gap-6 w-full px-4">
        {/* 総参加表明者カード */}
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center w-64 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200"
          onClick={() => {
            document.getElementById('attendees-section')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            })
            history.replaceState(null, '', '#attendees-section')
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-4xl">👥</span>
            <div className="text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">
              {t('venueList.totalAttendees')}
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
              {totalAttendees}{t('venueList.people')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {t('venueList.tapToView')}
            </div>
          </div>
        </div>

        {/* あなたの参加カード */}
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center w-64 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200"
          onClick={onOpenVenueSelector}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">🏠</span>
            <div className="text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">
              {userDisplayName
                ? t('venueList.userAttendance', { name: userDisplayName })
                : t('venueList.yourAttendance')}
            </div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
              {selectedVenuesCount}{t('mainPage.venuesCount')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {t('venueList.tapToEdit')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsOverview
