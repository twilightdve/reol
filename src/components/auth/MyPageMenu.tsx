import React, { useState } from 'react'
import { X, Lock, UserCog, Trash2, LogOut, Edit2, Check, X as XIcon, QrCode, HelpCircle, Award } from 'lucide-react'
import { FaXTwitter } from 'react-icons/fa6'
import { useAuth } from '../../contexts/AuthContext'
import ProfileAvatar from '../reolmap/auth/ProfileAvatar'
import { ChangePasswordModal } from './ChangePasswordModal'
import { ChangeUserIdModal } from './ChangeUserIdModal'
import { DeleteAccountModal } from './DeleteAccountModal'
import { XAccountQRCodeModal } from './XAccountQRCodeModal'
import { CollectionDialog } from './CollectionDialog'
import AboutDialog from '../modules/AboutDialog'
import toast from 'react-hot-toast'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

interface MyPageMenuProps {
  onClose: () => void
}

type SubModal = 'password' | 'changeId' | 'delete' | 'qrcode' | 'about' | 'collection' | null

export const MyPageMenu: React.FC<MyPageMenuProps> = ({ onClose }) => {
  const { user, profile, signOut, updateProfile } = useAuth()
  const [subModal, setSubModal] = useState<SubModal>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  useBodyScrollLock()

  if (!user) return null

  const displayName = profile?.username || user.username

  const handleNameEdit = () => {
    setEditedName(displayName)
    setIsEditingName(true)
  }

  const handleNameSave = async () => {
    if (editedName.trim() === displayName) {
      setIsEditingName(false)
      return
    }
    if (editedName.trim() === '') {
      toast.error('ニックネームを入力してください')
      return
    }
    setIsSaving(true)
    try {
      await updateProfile({ username: editedName.trim() })
      setIsEditingName(false)
    } catch (error: any) {
      toast.error(error?.message || '表示名の更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('ログアウトしました')
    } catch (error) {
      toast.error('ログアウトに失敗しました')
    }
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-screen w-80 max-w-full bg-bx-bg border-l border-bx-line shadow-2xl z-50 overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-bx-line">
          <h2 className="text-xl font-bold text-bx-ink">マイページ</h2>
          <button aria-label="閉じる" onClick={onClose} className="text-bx-ink2 hover:text-bx-ink">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 border-b border-bx-line">
          <div className="flex items-start gap-4">
            <ProfileAvatar
              username={displayName}
              fullName={profile?.full_name}
              avatarUrl={profile?.avatar_url}
              size="large"
            />
            <div className="flex-1 space-y-2 min-w-0">
              <p className="text-xs text-bx-ink3">ニックネーム</p>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1 text-sm border border-bx-line rounded bg-bx-bg text-bx-ink focus:outline-none focus:ring-2 focus:ring-bx-blue"
                    disabled={isSaving}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSave()
                      if (e.key === 'Escape') setIsEditingName(false)
                    }}
                  />
                  <button aria-label="保存" onClick={handleNameSave} disabled={isSaving} className="text-green-500 hover:opacity-80">
                    <Check className="h-4 w-4" />
                  </button>
                  <button aria-label="キャンセル" onClick={() => setIsEditingName(false)} disabled={isSaving} className="text-red-500 hover:opacity-80">
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-lg font-semibold text-bx-ink truncate">{displayName}</h3>
                  <button aria-label="ニックネームを編集" onClick={handleNameEdit} className="text-bx-ink2 hover:text-bx-ink flex-shrink-0">
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
              <p className="text-xs text-bx-ink3 truncate">ID: {user.id}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-2">
          <button
            onClick={() => setSubModal('collection')}
            className="w-full flex items-center gap-3 p-3 text-bx-ink2 hover:bg-bx-surface/5 hover:text-bx-ink rounded-lg transition-colors"
          >
            <Award className="h-5 w-5" />
            <span>コレクション</span>
          </button>

          <hr className="border-bx-line my-2" />

          <button
            onClick={() => setSubModal('password')}
            className="w-full flex items-center gap-3 p-3 text-bx-ink2 hover:bg-bx-surface/5 hover:text-bx-ink rounded-lg transition-colors"
          >
            <Lock className="h-5 w-5" />
            <span>パスワード変更</span>
          </button>

          <button
            onClick={() => setSubModal('changeId')}
            className="w-full flex items-center gap-3 p-3 text-bx-ink2 hover:bg-bx-surface/5 hover:text-bx-ink rounded-lg transition-colors"
          >
            <UserCog className="h-5 w-5" />
            <span>ID変更</span>
          </button>

          <button
            onClick={() => setSubModal('qrcode')}
            className="w-full flex items-center gap-3 p-3 text-bx-ink2 hover:bg-bx-surface/5 hover:text-bx-ink rounded-lg transition-colors"
          >
            <QrCode className="h-5 w-5" />
            <span className="inline-flex items-center gap-1.5">
              QRコード
              <FaXTwitter className="h-4 w-4" />
            </span>
          </button>

          <hr className="border-bx-line my-2" />

          <button
            onClick={() => setSubModal('about')}
            className="w-full flex items-center gap-3 p-3 text-bx-ink2 hover:bg-bx-surface/5 hover:text-bx-ink rounded-lg transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span>ABOUT（当サイトについて）</span>
          </button>

          <hr className="border-bx-line my-2" />

          <button
            onClick={() => setSubModal('delete')}
            className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            <span>アカウント削除</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>

      {subModal === 'password' && <ChangePasswordModal onClose={() => setSubModal(null)} />}
      {subModal === 'changeId' && <ChangeUserIdModal onClose={() => setSubModal(null)} />}
      {subModal === 'delete' && <DeleteAccountModal onClose={() => setSubModal(null)} />}
      {subModal === 'qrcode' && <XAccountQRCodeModal userId={user.id} onClose={() => setSubModal(null)} />}
      {subModal === 'about' && <AboutDialog onClose={() => setSubModal(null)} />}
      {subModal === 'collection' && <CollectionDialog onClose={() => setSubModal(null)} />}
    </>
  )
}
