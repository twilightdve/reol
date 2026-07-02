import React, { useState } from 'react'
import { X, Settings, LogOut, User, Edit2, Check, X as XIcon, Lock, QrCode, UserCog, Trash2, HelpCircle } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { FaXTwitter } from 'react-icons/fa6'
import ProfileAvatar from './ProfileAvatar'

interface ProfileSideMenuProps {
  isOpen: boolean
  onClose: () => void
  onOpenSettings: () => void
  onOpenQRCode: () => void
  onOpenPasswordSetup: () => void
  onOpenChangeId: () => void
  onOpenDeleteAccount: () => void
  onOpenHelpGuide: () => void
}

const ProfileSideMenu: React.FC<ProfileSideMenuProps> = ({ isOpen, onClose, onOpenSettings, onOpenQRCode, onOpenPasswordSetup, onOpenChangeId, onOpenDeleteAccount, onOpenHelpGuide }) => {
  const { profile, signOut, updateProfile } = useAuth()
  const { t } = useTranslation('common')
  const [isEditingFullName, setIsEditingFullName] = useState(false)
  const [editedFullName, setEditedFullName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen || !profile) return null

  const displayName = profile.username || profile.full_name

  const handleFullNameEdit = () => {
    setEditedFullName(profile.username || '')
    setIsEditingFullName(true)
  }

  const handleFullNameSave = async () => {
    if (editedFullName.trim() === (profile.username || '')) {
      setIsEditingFullName(false)
      return
    }

    setIsSaving(true)
    try {
      await updateProfile({ username: editedFullName.trim() })
      setIsEditingFullName(false)
    } catch (error) {
      console.error('表示名の更新に失敗しました:', error)
      alert(t('auth.displayNameUpdateFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleFullNameCancel = () => {
    setEditedFullName('')
    setIsEditingFullName(false)
  }

  const handleSettingsClick = () => {
    onOpenSettings()
    onClose()
  }

  const handleLogout = () => {
    signOut()
    onClose()
  }

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* サイドメニュー */}
      <div className="fixed right-0 top-0 h-screen w-80 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('auth.profile')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* プロフィール情報 */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-4">
            <ProfileAvatar
              username={profile.username}
              fullName={profile.full_name}
              avatarUrl={profile.avatar_url}
              size="large"
            />
            <div className="flex-1 space-y-3">
              {/* 表示名編集 */}
              <div>
                {isEditingFullName ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedFullName}
                      onChange={(e) => setEditedFullName(e.target.value)}
                      placeholder={t('auth.displayName')}
                      className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={isSaving}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFullNameSave()
                        if (e.key === 'Escape') handleFullNameCancel()
                      }}
                    />
                    <button
                      onClick={handleFullNameSave}
                      disabled={isSaving}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleFullNameCancel}
                      disabled={isSaving}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {displayName}
                    </h3>
                    <button
                      onClick={handleFullNameEdit}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* ユーザーID（変更不可） */}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {profile.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* メニューアイテム */}
        <div className="p-6 space-y-4">
          <button
            onClick={() => { onOpenPasswordSetup(); onClose() }}
            className="w-full flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Lock className="h-5 w-5" />
            <span>{t('auth.passwordSetup', { defaultValue: 'パスワード設定' })}</span>
          </button>

          <button
            onClick={() => { onOpenChangeId(); onClose() }}
            className="w-full flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <UserCog className="h-5 w-5" />
            <span>{t('changeId.menuButton', { defaultValue: 'ID変更' })}</span>
          </button>

          <button
            onClick={() => { onOpenQRCode(); onClose() }}
            className="w-full flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <QrCode className="h-5 w-5" />
            <span className="inline-flex items-center gap-1.5">
              {t('qrcode.menuButton', { defaultValue: 'QRコード' })}
              <FaXTwitter className="h-4 w-4" />
            </span>
          </button>

          <button
            onClick={handleSettingsClick}
            className="w-full flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>{t('mainPage.venueSettings')}</span>
          </button>

          <button
            onClick={() => { onOpenHelpGuide(); onClose() }}
            className="w-full flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span>{t('helpGuide.menuButton', { defaultValue: '当サイトの使い方' })}</span>
          </button>

          <hr className="border-gray-200 dark:border-gray-700" />

          <button
            onClick={() => { onOpenDeleteAccount(); onClose() }}
            className="w-full flex items-center space-x-3 p-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            <span>{t('deleteAccount.menuButton', { defaultValue: 'アカウント削除' })}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('auth.logout')}</span>
          </button>
        </div>

      </div>
    </>
  )
}

export default ProfileSideMenu