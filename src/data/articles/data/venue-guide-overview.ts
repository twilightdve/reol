import { Article } from '../types'
import markdownFile from './venue-guide-overview.md'
import markdownFileEn from './venue-guide-overview.en.md'

const venueGuideOverview: Article = {
  slug: 'venue-guide-overview',
  title: '連日参戦のすゝめ',
  titleEn: 'Tips for Attending Multiple Shows',
  subtitle: '連日公演の攻略法、エリア別おすすめプラン、移動手段・予算の目安まで',
  subtitleEn: 'Back-to-back show strategies, area-based plans, transport options & budget estimates',
  category: 'venue-guide',
  tags: ['遠征', 'プランニング', '連日公演', '予算'],
  tagsEn: ['travel', 'planning', 'back-to-back', 'budget'],
  author: '美辞学ナビ編集部',
  authorEn: 'Bijigaku Navi Editorial',
  publishedAt: '2026-02-19T00:00:00+09:00',
  emoji: '🧳',
  readingTime: 8,
  sections: [],
  markdownFile,
  markdownFileEn,
}

export default venueGuideOverview
