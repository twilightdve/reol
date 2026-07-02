import { Article } from '../types'
import markdownFile from './live-tips-first-timer.md'
import markdownFileEn from './live-tips-first-timer.en.md'

const liveTipsFirstTimer: Article = {
  slug: 'live-tips-first-timer',
  title: 'Reolライヴ はじめてガイド',
  titleEn: 'Your First Reol Concert — Starter Guide',
  subtitle: '持ち物・服装・マナーまでまるごと紹介',
  subtitleEn: 'What to bring, what to wear, and concert etiquette',
  category: 'tips',
  tags: ['ライヴ', '初心者', '持ち物', 'マナー'],
  tagsEn: ['Live', 'Beginner', 'Essentials', 'Etiquette'],
  author: '美辞学ナビ編集部',
  authorEn: 'Bijigaku Navi Editorial',
  publishedAt: '2026-02-19T00:00:00+09:00',
  emoji: '🎤',
  readingTime: 8,
  sections: [],
  markdownFile,
  markdownFileEn,
}

export default liveTipsFirstTimer
