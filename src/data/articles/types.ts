// 美辞学ナビ 読み物コンテンツ（Articles）型定義

export type ArticleCategory = 'analysis' | 'venue-guide' | 'column' | 'tips'

export interface ListItem {
  text: string
  subItems?: string[]
}

export interface ArticleSection {
  type: 'text' | 'heading' | 'quote' | 'list' | 'image' | 'divider' | 'map'
  content?: string        // text, heading, quote用
  items?: ListItem[]      // list用（サブ項目対応）
  level?: 2 | 3 | 4      // heading のレベル (h2, h3, h4)
  src?: string            // image用
  alt?: string            // image用
  caption?: string        // image用
  mapUrl?: string         // map用（Google Maps Embed URL）
  mapTitle?: string       // map用（マップのタイトル）
}

export interface Article {
  slug: string
  title: string
  titleEn?: string        // 英語版タイトル
  subtitle?: string
  subtitleEn?: string     // 英語版サブタイトル
  category: ArticleCategory
  tags: string[]
  tagsEn?: string[]       // 英語版タグ
  author: string
  authorEn?: string       // 英語版著者名
  publishedAt: string     // ISO 8601
  updatedAt?: string
  thumbnail?: string      // サムネイル画像パス
  emoji?: string          // サムネイル代替の絵文字
  readingTime: number     // 分
  sections: ArticleSection[]
  sectionsEn?: ArticleSection[]  // 英語版セクション
  markdownFile?: string   // .mdファイルからインポートした文字列
  markdownFileEn?: string // 英語版.mdファイルからインポートした文字列
}

// カテゴリ表示名
export const CATEGORY_LABELS: Record<ArticleCategory, { ja: string; en: string; emoji: string; color: string }> = {
  'analysis': { ja: '考察・分析', en: 'Analysis', emoji: '🔍', color: 'purple' },
  'venue-guide': { ja: '会場ガイド', en: 'Venue Guide', emoji: '🏟️', color: 'blue' },
  'column': { ja: 'コラム', en: 'Column', emoji: '✍️', color: 'amber' },
  'tips': { ja: 'ライヴTips', en: 'Live Tips', emoji: '💡', color: 'green' },
}
