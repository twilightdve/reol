/**
 * ArticleDetail - 記事詳細コンポーネント
 * 
 * 記事の本文を表示する。セクションごとに適切なUI要素をレンダリング。
 */
import React from 'react'
import { Link } from 'gatsby'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Article, ArticleSection as ArticleSectionType, CATEGORY_LABELS } from '../../../data/articles'
import LanguageSwitch from '../layout/LanguageSwitch'

interface ArticleDetailProps {
  article: Article
}

/**
 * インラインMarkdown記法をReact要素に変換する
 * 対応: **太字**, *斜体*, `コード`
 */
const renderInlineMarkdown = (text: string): React.ReactNode => {
  // **太字**, *斜体*, `コード` をパースする
  const parts: React.ReactNode[] = []
  // 正規表現: **太字** | *斜体* | `コード`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    // マッチ前のプレーンテキスト
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[2] !== undefined) {
      // **太字**
      parts.push(<strong key={match.index} className="font-bold">{match[2]}</strong>)
    } else if (match[3] !== undefined) {
      // *斜体*
      parts.push(<em key={match.index}>{match[3]}</em>)
    } else if (match[4] !== undefined) {
      // `コード`
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
          {match[4]}
        </code>
      )
    }

    lastIndex = match.index + match[0].length
  }

  // 残りのプレーンテキスト
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

const SectionRenderer: React.FC<{ section: ArticleSectionType }> = ({ section }) => {
  switch (section.type) {
    case 'heading':
      if (section.level === 4) {
        return (
          <h4 className="text-base font-bold text-gray-800 dark:text-gray-100 mt-5 mb-1">
            {renderInlineMarkdown(section.content || '')}
          </h4>
        )
      }
      if (section.level === 3) {
        return (
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-2">
            {renderInlineMarkdown(section.content || '')}
          </h3>
        )
      }
      return (
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          {renderInlineMarkdown(section.content || '')}
        </h2>
      )

    case 'text':
      return (
        <p className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
          {renderInlineMarkdown(section.content || '')}
        </p>
      )

    case 'quote':
      return (
        <blockquote className="border-l-4 border-purple-400 dark:border-purple-600 pl-4 py-2 my-4 bg-purple-50 dark:bg-purple-900/20 rounded-r-lg">
          <p className="text-sm italic text-purple-800 dark:text-purple-200">
            {renderInlineMarkdown(section.content || '')}
          </p>
        </blockquote>
      )

    case 'list':
      return (
        <ul className="space-y-2 my-4">
          {section.items?.map((item, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
              <div className="flex gap-2">
                <span className="flex-shrink-0 mt-0.5">
                  {item.text.match(/^[^\s\w]/) ? '' : '•'}
                </span>
                <span className="leading-relaxed">{renderInlineMarkdown(item.text)}</span>
              </div>
              {item.subItems && item.subItems.length > 0 && (
                <ul className="ml-6 mt-1 space-y-1">
                  {item.subItems.map((sub, j) => (
                    <li key={j} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex-shrink-0 mt-0.5">–</span>
                      <span className="leading-relaxed">{renderInlineMarkdown(sub)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )

    case 'map':
      return (
        <figure className="my-6">
          <div className="relative w-full rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={section.mapUrl}
              title={section.mapTitle || 'Google Map'}
              className="absolute inset-0 w-full h-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          {section.mapTitle && (
            <figcaption className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
              🗺️ {section.mapTitle}
            </figcaption>
          )}
        </figure>
      )

    case 'divider':
      return (
        <hr className="my-8 border-gray-200 dark:border-gray-700" />
      )

    case 'image':
      return (
        <figure className="my-6">
          <img
            src={section.src}
            alt={section.alt || ''}
            className="w-full rounded-lg shadow-md"
          />
          {section.caption && (
            <figcaption className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
              {section.caption}
            </figcaption>
          )}
        </figure>
      )

    default:
      return null
  }
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article }) => {
  const { t, i18n } = useTranslation('common')
  const categoryInfo = CATEGORY_LABELS[article.category]
  const hasEnglish = article.sectionsEn && article.sectionsEn.length > 0

  const isEn = i18n.language === 'en' && hasEnglish
  const title = isEn && article.titleEn ? article.titleEn : article.title
  const subtitle = isEn && article.subtitleEn ? article.subtitleEn : article.subtitle
  const sections = isEn && hasEnglish ? article.sectionsEn! : article.sections
  const tags = isEn && article.tagsEn ? article.tagsEn : article.tags

  // カテゴリカラーマッピング
  const colorMap: Record<string, { bg: string; text: string }> = {
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  }
  const colors = colorMap[categoryInfo.color] || colorMap.purple

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isEn) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    }
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${require('../../../images/washi-background.png').default})`,
        backgroundRepeat: 'repeat',
        backgroundColor: '#f9fafb',
      }}
    >
      {/* ヘッダー */}
      <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            to="/bijigaku-navi/"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {isEn ? 'Back to Bijigaku Navi' : t('articles.backToNavi', '美辞学ナビに戻る')}
          </Link>
          <LanguageSwitch variant="light" />
        </div>
      </header>

      {/* 記事本体 */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* ヒーロー */}
        <div className="mb-8">
          {/* カテゴリ */}
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} mb-4`}>
            {categoryInfo.emoji} {isEn ? categoryInfo.en : categoryInfo.ja}
          </span>

          {/* タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-gray-500 dark:text-gray-400 mb-4">
              {subtitle}
            </p>
          )}

          {/* メタ情報 */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            {tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <Tag className="h-3.5 w-3.5" />
                {tags.map(tag => (
                  <span key={tag} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 本文 */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          {sections.map((section, i) => (
            <SectionRenderer key={i} section={section} />
          ))}
        </div>

        {/* フッター */}
        <div className="mt-8 text-center">
          <Link
            to="/bijigaku-navi/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            {isEn ? 'Back to Bijigaku Navi' : t('articles.backToNavi', '美辞学ナビに戻る')}
          </Link>
        </div>
      </article>
    </div>
  )
}

export default ArticleDetail
