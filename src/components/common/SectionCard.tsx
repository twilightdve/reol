/**
 * SectionCard - VenueDetail セクション共通ラッパー
 * 
 * VenueDetailの各セクション（アクセス、駐車場、カフェ等）を
 * 統一されたデザインで表示するためのコンポーネント。
 * 
 * テーマ付きセクション（グラデーション背景）と
 * 通常セクション（白背景）の両方に対応。
 */
import React from 'react'
import { SECTION_THEMES, type SectionThemeKey } from '../../constants/bijigaku'

interface SectionCardProps {
  id?: string
  icon: React.ReactNode
  title: string
  theme?: SectionThemeKey
  children: React.ReactNode
  className?: string
}

/**
 * テーマ付きセクションカード（グラデーション背景）
 * access, parking, gourmet, hotel テーマに対応
 */
export const ThemedSectionCard: React.FC<SectionCardProps> = ({
  id,
  icon,
  title,
  theme = 'access',
  children,
  className = '',
}) => {
  const themeConfig = SECTION_THEMES[theme]
  
  return (
    <div
      id={id}
      className={`rounded-lg shadow-lg border ${className}`}
      style={{
        background: themeConfig.gradient,
        borderColor: themeConfig.borderColor,
      }}
    >
      <div
        className="section-header"
        style={{ borderColor: themeConfig.borderColor }}
      >
        <h3
          className="text-lg font-semibold flex items-center gap-2"
          style={{ color: themeConfig.textColor }}
        >
          {icon}
          {title}
        </h3>
      </div>
      <div className="section-body">
        {children}
      </div>
    </div>
  )
}

/**
 * 通常セクションカード（白/半透明背景）
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  id,
  icon,
  title,
  children,
  className = '',
}) => {
  return (
    <div
      id={id}
      className={`bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm ${className}`}
    >
      <div className="section-header">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          {icon}
          {title}
        </h3>
      </div>
      <div className="section-body">
        {children}
      </div>
    </div>
  )
}

/**
 * 会場一覧用セクションカード（和紙風背景）
 */
export const VenueListCard: React.FC<{
  id?: string
  title: string
  children: React.ReactNode
}> = ({ id, title, children }) => {
  return (
    <div
      id={id}
      className="venue-list-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="section-header">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div className="section-body">
        {children}
      </div>
    </div>
  )
}
