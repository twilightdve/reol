/**
 * ArticleCard - 記事カードコンポーネント
 * 
 * 記事一覧で使用するカード型UI。サムネイル、タイトル、カテゴリ、読了時間を表示。
 */
import React from 'react'
import { Link } from 'gatsby'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Article, CATEGORY_LABELS } from '../../../data/articles'

interface ArticleCardProps {
  article: Article
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const { i18n } = useTranslation()
  const categoryInfo = CATEGORY_LABELS[article.category]
  const isEn = i18n.language === 'en'

  const title = isEn && article.titleEn ? article.titleEn : article.title
  const subtitle = isEn && article.subtitleEn ? article.subtitleEn : article.subtitle

  // カテゴリカラーのTailwindクラスマッピング
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
  }
  const colors = colorMap[categoryInfo.color] || colorMap.purple

  return (
    <Link
      to={`/bijigaku-navi/articles/${article.slug}`}
      className="group block"
    >
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* サムネイルエリア */}
        <div className={`h-32 flex items-center justify-center ${colors.bg} relative overflow-hidden`}>
          <span className="text-5xl">{article.emoji || '📄'}</span>
          {/* カテゴリバッジ */}
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
            {categoryInfo.emoji} {isEn ? categoryInfo.en : categoryInfo.ja}
          </span>
        </div>

        {/* コンテンツ */}
        <div className="p-4 space-y-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {subtitle}
            </p>
          )}
          <div className="flex items-center justify-end pt-1">
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ArticleCard
