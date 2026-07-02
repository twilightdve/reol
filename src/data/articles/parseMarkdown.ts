/**
 * Markdown → ArticleSection[] パーサー
 * 
 * 記事をMarkdownで書いて、ArticleSectionの配列に自動変換する。
 * 
 * 対応記法:
 *   ## 見出し        → { type: 'heading', level: 2 }
 *   ### 小見出し     → { type: 'heading', level: 3 }
 *   #### 小小見出し  → { type: 'heading', level: 4 }
 *   > 引用文         → { type: 'quote' }
 *   - リスト項目     → { type: 'list', items: [...] }
 *   * リスト項目     → （同上）
 *   ---              → { type: 'divider' }
 *   ![alt](src)      → { type: 'image', alt, src }
 *   テキスト行       → { type: 'text' }
 * 
 * 連続するテキスト行は1つの段落にまとめられる。
 * 空行で段落区切り。
 */

import { ArticleSection, ListItem } from './types'

export function parseMarkdown(markdown: string): ArticleSection[] {
  const lines = markdown.split('\n')
  const sections: ArticleSection[] = []
  let i = 0

  const flushTextBuffer = (buffer: string[]) => {
    if (buffer.length > 0) {
      const text = buffer.join('\n').trim()
      if (text) {
        sections.push({ type: 'text', content: text })
      }
      buffer.length = 0
    }
  }

  const textBuffer: string[] = []

  while (i < lines.length) {
    const line = lines[i]

    // 空行 → テキストバッファをフラッシュ
    if (line.trim() === '') {
      flushTextBuffer(textBuffer)
      i++
      continue
    }

    // --- 区切り線
    if (/^-{3,}$/.test(line.trim())) {
      flushTextBuffer(textBuffer)
      sections.push({ type: 'divider' })
      i++
      continue
    }

    // #### 見出し (h4) — ### や ## より先にチェック
    if (/^#### /.test(line)) {
      flushTextBuffer(textBuffer)
      sections.push({ type: 'heading', content: line.replace(/^#### /, '').trim(), level: 4 })
      i++
      continue
    }

    // ### 見出し (h3) — ## より先にチェック
    if (/^### /.test(line)) {
      flushTextBuffer(textBuffer)
      sections.push({ type: 'heading', content: line.replace(/^### /, '').trim(), level: 3 })
      i++
      continue
    }

    // ## 見出し (h2)
    if (/^## /.test(line)) {
      flushTextBuffer(textBuffer)
      sections.push({ type: 'heading', content: line.replace(/^## /, '').trim(), level: 2 })
      i++
      continue
    }

    // > 引用（複数行対応）
    if (/^> /.test(line)) {
      flushTextBuffer(textBuffer)
      const quoteLines: string[] = []
      while (i < lines.length && /^> /.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^> /, ''))
        i++
      }
      sections.push({ type: 'quote', content: quoteLines.join('\n').trim() })
      continue
    }

    // - / * リスト（連続する項目を収集、インデントされたサブ項目にも対応）
    if (/^[-*] /.test(line)) {
      flushTextBuffer(textBuffer)
      const items: ListItem[] = []
      while (i < lines.length && (/^[-*] /.test(lines[i]) || /^\s+[-*] /.test(lines[i]))) {
        if (/^[-*] /.test(lines[i])) {
          // トップレベルの項目
          items.push({ text: lines[i].replace(/^[-*] /, '').trim() })
        } else if (/^\s+[-*] /.test(lines[i]) && items.length > 0) {
          // インデントされたサブ項目 → 直前の項目に追加
          const lastItem = items[items.length - 1]
          if (!lastItem.subItems) lastItem.subItems = []
          lastItem.subItems.push(lines[i].replace(/^\s+[-*] /, '').trim())
        }
        i++
      }
      sections.push({ type: 'list', items })
      continue
    }

    // [map:タイトル](URL) Google Maps埋め込み
    const mapMatch = line.match(/^\[map:([^\]]+)\]\(([^)]+)\)$/)
    if (mapMatch) {
      flushTextBuffer(textBuffer)
      sections.push({
        type: 'map',
        mapTitle: mapMatch[1].trim(),
        mapUrl: mapMatch[2].trim(),
      })
      i++
      continue
    }

    // ![alt](src "caption") 画像
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)"]+)(?:\s+"([^"]*)")?\)$/)
    if (imgMatch) {
      flushTextBuffer(textBuffer)
      sections.push({
        type: 'image',
        alt: imgMatch[1] || undefined,
        src: imgMatch[2],
        caption: imgMatch[3] || undefined,
      })
      i++
      continue
    }

    // それ以外 → テキストバッファに追加
    textBuffer.push(line)
    i++
  }

  // 残りをフラッシュ
  flushTextBuffer(textBuffer)

  return sections
}
