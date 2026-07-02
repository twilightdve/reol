import React from 'react'
import { HeadFC, PageProps } from 'gatsby'
import { LanguageProvider } from '../i18n/LanguageContext'
import ArticleDetail from '../components/reolmap/articles/ArticleDetail'
import { getArticleBySlug } from '../data/articles'
import SEO from '../components/SEO'

interface ArticlePageContext {
  slug: string
}

const ArticlePage: React.FC<PageProps<{}, ArticlePageContext>> = ({ pageContext }) => {
  const { slug } = pageContext
  const article = getArticleBySlug(slug)

  if (!article) {
    return (
      <LanguageProvider>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">📭</p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              記事が見つかりません
            </h1>
            <a
              href="/bijigaku-navi/"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              ← 美辞学ナビに戻る
            </a>
          </div>
        </div>
      </LanguageProvider>
    )
  }

  return (
    <LanguageProvider>
      <ArticleDetail article={article} />
    </LanguageProvider>
  )
}

export const Head: HeadFC<{}, ArticlePageContext> = ({ pageContext }) => {
  const { slug } = pageContext
  const article = getArticleBySlug(slug)

  const title = article ? `${article.title} - 美辞学ナビ` : '美辞学ナビ'
  const description = article?.subtitle || 'Reol美辞学ツアーの読み物コンテンツ'

  return (
    <SEO
      title={title}
      description={description}
      path={`/bijigaku-navi/articles/${slug}/`}
      type="article"
    />
  )
}

export default ArticlePage
