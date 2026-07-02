/**
 * EncounterOnboardingModal - エンカウント基本方針 初回確認モーダル
 * 
 * ログインユーザーの encounter_policy が null のときに表示される。
 * エンカOK / エンカNG を選択すると profile に保存される。
 */
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserCheck, UserX, Coffee } from 'lucide-react'
import { LAYOUT } from '../../../constants/bijigaku'

interface EncounterOnboardingModalProps {
  isOpen: boolean
  onSelect: (policy: 'ok' | 'ng') => void
}

const EncounterOnboardingModal: React.FC<EncounterOnboardingModalProps> = ({ isOpen, onSelect }) => {
  const { i18n } = useTranslation()
  const isEn = i18n.language === 'en'
  const [selected, setSelected] = useState<'ok' | 'ng' | null>(null)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="p-6 pb-3 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
            <Coffee className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {isEn ? 'Encounter Settings' : 'エンカウント設定'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {isEn
              ? 'Would you like other fans at the same venue to know you\'re open to meeting up? This setting can be changed anytime, and you can also customize it per venue.'
              : '同じ会場に行くファンに「エンカOK」であることを表示しますか？この設定はいつでも変更でき、会場ごとに個別設定もできます。'}
          </p>
        </div>

        {/* 選択肢 */}
        <div className="px-6 py-4 space-y-3">
          {/* エンカOK */}
          <button
            onClick={() => setSelected('ok')}
            className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
              selected === 'ok'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              selected === 'ok' ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                {isEn ? '☕ Open to Meeting (Encounter OK)' : '☕ エンカOK（基本方針）'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isEn
                  ? 'Show other fans that you\'re happy to meet up at venues'
                  : '会場で会うことに前向きであることを他のファンに表示します'}
              </p>
            </div>
          </button>

          {/* エンカ非表示 */}
          <button
            onClick={() => setSelected('ng')}
            className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
              selected === 'ng'
                ? 'border-gray-500 bg-gray-50 dark:bg-gray-700/50'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              selected === 'ng' ? 'bg-gray-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              <UserX className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                {isEn ? 'Not Now' : '今は表示しない'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isEn
                  ? 'Enjoy the show at your own pace — no encounter badge will be shown'
                  : 'マイペースにライヴを楽しみたい方向け（バッジ非表示）'}
              </p>
            </div>
          </button>
        </div>

        {/* 注意書き + 確定ボタン */}
        <div className="px-6 pb-6 pt-2">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-4">
            {isEn
              ? '※ You can override this per venue in Venue Settings'
              : '※ 会場設定で会場ごとに個別にOK/NGを変更できます'}
          </p>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
              selected
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isEn ? 'Confirm' : '決定する'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EncounterOnboardingModal
