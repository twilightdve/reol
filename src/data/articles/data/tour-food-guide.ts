import { Article } from '../types'
import markdownFile from './tour-food-guide.md'

const tourFoodGuide: Article = {
  slug: 'tour-food-guide',
  title: '遠征グルメマップ — 各地のご当地グルメを制覇せよ',
  subtitle: 'ライヴ前後に楽しめる各公演地のおすすめグルメ',
  category: 'column',
  tags: ['遠征', 'グルメ', 'ご当地'],
  author: '美辞学ナビ編集部',
  publishedAt: '2026-02-19T00:00:00+09:00',
  emoji: '🍜',
  readingTime: 7,
  sections: [],
  markdownFile,
}

export default tourFoodGuide
