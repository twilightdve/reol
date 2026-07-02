import React from 'react'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface RecommendBadgeProps {
  comment?: string
  className?: string
}

/**
 * おすすめバッジコンポーネント
 * 施設情報でおすすめのものに表示される
 */
export const RecommendBadge: React.FC<RecommendBadgeProps> = ({ 
  comment, 
  className = '' 
}) => {
  const { t } = useTranslation('venue')
  
  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-sm">
        <Star className="h-3 w-3 fill-current" />
        {t('badges.recommended')}
      </div>
      {comment && (
        <div className="text-xs text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-700">
          💡 {comment}
        </div>
      )}
    </div>
  )
}

interface FacilityItemProps {
  name: string
  description?: string
  recommended?: boolean
  recommendComment?: string
  children?: React.ReactNode
  icon?: React.ReactNode
}

/**
 * 施設情報アイテムコンポーネント
 * おすすめフラグがある場合は強調表示
 */
export const FacilityItem: React.FC<FacilityItemProps> = ({
  name,
  description,
  recommended,
  recommendComment,
  children,
  icon
}) => {
  const { t } = useTranslation('venue')
  
  return (
    <li className={`
      border-b border-gray-200 dark:border-gray-600 last:border-b-0 pb-3 last:pb-0
      bg-white dark:bg-white -mx-2 px-2 py-2 rounded-lg border
      ${recommended ? 'border-yellow-200 dark:border-yellow-700/50' : 'border-gray-200 dark:border-gray-600'}
    `}>
      <div className="flex items-start gap-2">
        {icon && (
          <div className={`mt-1 flex-shrink-0 ${recommended ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium ${recommended ? 'text-yellow-900 dark:text-yellow-100' : 'text-gray-900 dark:text-white'}`}>
              {name}
            </h4>
            {recommended && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-sm">
                <Star className="h-3 w-3 fill-current" />
                {t('badges.recommended')}
              </div>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {description}
            </p>
          )}
          {children}
          {recommended && recommendComment && (
            <div className="text-xs text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1.5 rounded border border-yellow-200 dark:border-yellow-700 mt-2">
              💡 {recommendComment}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
