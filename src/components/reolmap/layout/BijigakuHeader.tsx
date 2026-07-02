/**
 * BijigakuHeader - 美辞学ナビ ヘッダーコンポーネント
 * 
 * ReolMapLayoutから抽出。ロゴ、言語切替、ログイン/プロフィールボタンを表示。
 */
import React from 'react'
import { Link } from 'gatsby'
import { useTranslation } from 'react-i18next'
import { HelpCircle } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import LoginButton from '../auth/LoginButton'
import UserProfile from '../auth/UserProfile'
import LanguageSwitch from './LanguageSwitch'

interface BijigakuHeaderProps {
  onOpenProfileMenu: () => void
  onOpenHelpGuide: () => void
}

const BijigakuHeader: React.FC<BijigakuHeaderProps> = ({ onOpenProfileMenu, onOpenHelpGuide }) => {
  const { user } = useAuth()
  const { t } = useTranslation('common')

  return (
    <header
      className="bijigaku-header-bg shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div>
              <h1>
                <Link
                  to="/bijigaku-navi"
                  className="text-3xl font-bold block bijigaku-title"
                >
                  {t('mainPage.title')}
                </Link>
              </h1>
              <p
                className="text-xs mt-0.5 bijigaku-subtitle"
              >
                {t('mainPage.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitch />
            <button
              onClick={onOpenHelpGuide}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-white/30 hover:bg-white/10 transition-colors text-white"
              aria-label={t('helpGuide.buttonLabel', { defaultValue: '使い方ガイド' })}
              title={t('helpGuide.buttonLabel', { defaultValue: '使い方ガイド' })}
            >
              <HelpCircle size={18} />
            </button>
            {user ? (
              <UserProfile compact onProfileClick={() => onOpenProfileMenu()} />
            ) : (
              <div className="flex items-center space-x-3 flex-shrink-0">
                <LoginButton compact />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default BijigakuHeader
