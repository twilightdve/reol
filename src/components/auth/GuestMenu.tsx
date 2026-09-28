import React, { useState } from 'react'
import { X, LogIn, HelpCircle } from 'lucide-react'
import { SimpleAuth } from './SimpleAuth'
import AboutDialog from '../modules/AboutDialog'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

interface GuestMenuProps {
  onClose: () => void
}

type SubModal = 'login' | 'about' | null

export const GuestMenu: React.FC<GuestMenuProps> = ({ onClose }) => {
  const [subModal, setSubModal] = useState<SubModal>(null)
  useBodyScrollLock()

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-screen w-80 max-w-full bg-bx-bg border-l border-bx-line shadow-2xl z-50 overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-bx-line">
          <h2 className="text-xl font-bold text-bx-ink">メニュー</h2>
          <button aria-label="閉じる" onClick={onClose} className="text-bx-ink2 hover:text-bx-ink">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-2">
          <button
            onClick={() => setSubModal('login')}
            className="w-full flex items-center gap-3 p-3 text-bx-ink2 hover:bg-bx-surface/5 hover:text-bx-ink rounded-lg transition-colors"
          >
            <LogIn className="h-5 w-5" />
            <span>ログイン / 新規登録</span>
          </button>

          <hr className="border-bx-line my-2" />

          <button
            onClick={() => setSubModal('about')}
            className="w-full flex items-center gap-3 p-3 text-bx-ink2 hover:bg-bx-surface/5 hover:text-bx-ink rounded-lg transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span>ABOUT（当サイトについて）</span>
          </button>
        </div>
      </div>

      {subModal === 'login' && <SimpleAuth onClose={() => setSubModal(null)} />}
      {subModal === 'about' && <AboutDialog onClose={() => setSubModal(null)} />}
    </>
  )
}
