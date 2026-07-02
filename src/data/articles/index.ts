// 美辞学ナビ 記事データ エクスポート

import { Article } from './types'
import { parseMarkdown } from './parseMarkdown'
import bijigakuAlbumAnalysis from './data/bijigaku-album-analysis'
import liveTipsFirstTimer from './data/live-tips-first-timer'
import venueGuideOverview from './data/venue-guide-overview'
import tourFoodGuide from './data/tour-food-guide'

/**
 * markdownFile フィールドがある場合、Markdownをパースして sections に自動変換する
 */
function resolveArticle(article: Article): Article {
  const resolved = { ...article }
  if (resolved.markdownFile) {
    resolved.sections = parseMarkdown(resolved.markdownFile)
  }
  if (resolved.markdownFileEn) {
    resolved.sectionsEn = parseMarkdown(resolved.markdownFileEn)
  }
  return resolved
}

export const ALL_ARTICLES: Article[] = [
  // bijigakuAlbumAnalysis, // アルバム全曲考察（内容精査中・後日公開）
  liveTipsFirstTimer,
  venueGuideOverview,
  // tourFoodGuide, // 遠征グルメマップ（一旦非公開）
].map(resolveArticle)

export const getArticleBySlug = (slug: string): Article | undefined => {
  return ALL_ARTICLES.find(a => a.slug === slug)
}

export const getArticlesByCategory = (category: string): Article[] => {
  return ALL_ARTICLES.filter(a => a.category === category)
}

export { type Article, type ArticleCategory, type ArticleSection, type ListItem, CATEGORY_LABELS } from './types'
export { parseMarkdown } from './parseMarkdown'
