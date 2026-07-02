/**
 * VenueSelectorModal - 会場選択モーダル
 * 
 * ReolMapLayoutから抽出。会場設定画面をモーダル表示する。
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import VenueSelector from '../venues/VenueSelector'
import { LAYOUT } from '../../../constants/bijigaku'

interface VenueSelectorModalProps {
  isOpen: boolean
  onClose: () => void
}

const VenueSelectorModal: React.FC<VenueSelectorModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('common')

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full overflow-hidden"
        style={{ maxHeight: LAYOUT.MODAL_MAX_HEIGHT }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('mainPage.venueSettings')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* 会場セレクター */}
        <div
          className="overflow-y-auto p-6"
          style={{ maxHeight: LAYOUT.MODAL_BODY_MAX_HEIGHT }}
        >
          <VenueSelector />
        </div>
      </div>
    </div>
  )
}

export default VenueSelectorModal
