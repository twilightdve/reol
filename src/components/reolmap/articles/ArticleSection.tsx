/**
 * ArticleSection - コラムセクション
 * 
 * メインレイアウトに埋め込む記事カード一覧。
 * 縦並びグリッド表示。初期3件、4件以上で「もっと見る」ボタン。
 */
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Newspaper, ChevronDown } from 'lucide-react'
import ArticleCard from './ArticleCard'
import { ALL_ARTICLES } from '../../../data/articles'

const INITIAL_COUNT = 3

const ArticleSection: React.FC = () => {
  const { t } = useTranslation('common')
  const [showAll, setShowAll] = useState(false)

  if (ALL_ARTICLES.length === 0) return null

  const displayedArticles = showAll ? ALL_ARTICLES : ALL_ARTICLES.slice(0, INITIAL_COUNT)
  const hasMore = ALL_ARTICLES.length > INITIAL_COUNT

  return (
    <section>
      {/* セクションヘッダー */}
      <div className="flex items-center gap-2 mb-4 px-4">
        <Newspaper className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {t('articles.sectionTitle', 'コラム')}
        </h2>
      </div>

      {/* カード一覧 — 縦並びグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {displayedArticles.map(article => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      {/* もっと見るボタン */}
      {hasMore && !showAll && (
        <div className="mt-4 text-center px-4">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
            {t('articles.showMore', 'もっと見る')}
            <span className="text-xs text-purple-400 dark:text-purple-500">
              ({ALL_ARTICLES.length - INITIAL_COUNT})
            </span>
          </button>
        </div>
      )}
    </section>
  )
}

export default ArticleSection
