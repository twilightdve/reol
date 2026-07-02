import React from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { User } from 'lucide-react'
import ProfileAvatar from './ProfileAvatar'

interface UserProfileProps {
  compact?: boolean
  onProfileClick?: () => void
}

const UserProfile: React.FC<UserProfileProps> = ({ compact = false, onProfileClick }) => {
  const { profile, loading } = useAuth()

  if (loading || !profile) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  const displayName = profile.full_name || profile.username

  // ヘッダー用のコンパクト表示
  if (compact) {
    return (
      <button
        onClick={onProfileClick}
        className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
      >
        <ProfileAvatar
          username={profile.username}
          fullName={profile.full_name}
          avatarUrl={profile.avatar_url}
          size="medium"
        />
        <div className="hidden md:block">
          <p className="text-sm font-medium text-white text-left">
            {displayName}
          </p>
        </div>
      </button>
    )
  }

  // フルサイズ表示
  return (
    <button
      onClick={onProfileClick}
      className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <ProfileAvatar
          username={profile.username}
          fullName={profile.full_name}
          avatarUrl={profile.avatar_url}
          size="small"
        />
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            @{profile.username}
          </p>
        </div>
      </div>
    </button>
  )
}

export default UserProfile