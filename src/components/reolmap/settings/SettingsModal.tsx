import React from 'react'
import { X, Settings, Coffee, UserCheck, UserX } from 'lucide-react'
import VenueSelector from '../venues/VenueSelector'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../contexts/AuthContext'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('common')
  const { user, profile, updateProfile } = useAuth()
  
  if (!isOpen) return null

  const handleEncounterPolicyChange = async (policy: 'ok' | 'ng') => {
    await updateProfile({ encounter_policy: policy })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('settings.venueSettings')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="space-y-6">
            {/* エンカ基本方針セクション */}
            {user && profile && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  {t('encounter.policyTitle', { defaultValue: 'エンカウント基本方針' })}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('encounter.policyDescription', { defaultValue: '他の参加者との交流（エンカ）に対する基本方針を設定します。会場ごとに個別設定も可能です。' })}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEncounterPolicyChange('ok')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                      profile.encounter_policy === 'ok'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-400 dark:text-emerald-300 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-emerald-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-emerald-500'
                    }`}
                  >
                    <UserCheck className="w-5 h-5" />
                    <span>{t('encounter.okLabel', { defaultValue: 'エンカOK' })}</span>
                  </button>
                  <button
                    onClick={() => handleEncounterPolicyChange('ng')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                      profile.encounter_policy === 'ng'
                        ? 'bg-gray-100 border-gray-500 text-gray-700 dark:bg-gray-600 dark:border-gray-400 dark:text-gray-300 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-400'
                    }`}
                  >
                    <UserX className="w-5 h-5" />
                    <span>{t('encounter.ngLabel', { defaultValue: '表示しない' })}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 区切り線 */}
            {user && profile && (
              <hr className="border-gray-200 dark:border-gray-700" />
            )}

            {/* 会場選択セクション */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('settings.selectVenues')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('settings.selectVenuesDescription')}
              </p>
              <VenueSelector />
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('settings.done')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal