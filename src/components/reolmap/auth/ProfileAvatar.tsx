import React, { useState, useEffect } from 'react'
import { User } from 'lucide-react'
import { getInitialFromName, getAvatarColorFromUsername } from '../../../utils/profileUtils'

interface ProfileAvatarProps {
  username: string
  fullName?: string | null
  avatarUrl?: string | null
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  username,
  fullName,
  avatarUrl,
  size = 'medium',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false)

  // サイズクラスの定義
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12', 
    large: 'h-16 w-16'
  }

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-lg'
  }

  const iconSizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  }

  // 画像読み込みエラーのリセット
  useEffect(() => {
    setImageError(false)
  }, [avatarUrl])

  const displayName = fullName || username
  const initial = getInitialFromName(displayName)
  const bgColor = getAvatarColorFromUsername(username)

  // 画像の優先順位: avatar_url > イニシャル
  const shouldShowAvatarUrl = avatarUrl && !imageError

  // 背景色のマッピング
  const bgColorMap: { [key: string]: string } = {
    'bg-emerald-500': '#10b981',
    'bg-orange-500': '#f97316',
    'bg-green-500': '#10b981',
    'bg-yellow-500': '#f59e0b',
    'bg-red-500': '#ef4444',
    'bg-indigo-500': '#6366f1',
    'bg-pink-500': '#ec4899',
    'bg-teal-500': '#14b8a6'
  }

  const inlineBgColor = bgColorMap[bgColor] || '#8b5cf6'

  if (shouldShowAvatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white/50 shadow-sm ${className}`}
        onError={() => setImageError(true)}
      />
    )
  }

  // イニシャル表示（フォールバック）
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center border-2 border-white/30 shadow-sm ${className}`}
      style={{ backgroundColor: inlineBgColor }}
    >
      {initial && initial !== '?' ? (
        <span 
          className={`${textSizeClasses[size]} font-semibold select-none`}
          style={{ 
            color: '#ffffff',
            lineHeight: '1', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: '700',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            zIndex: 10
          }}
        >
          {initial}
        </span>
      ) : (
        <User className={`${iconSizeClasses[size]} text-white`} />
      )}
    </div>
  )
}

export default ProfileAvatar