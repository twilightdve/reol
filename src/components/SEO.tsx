/**
 * SEO - 共通OGタグ / metaタグコンポーネント
 *
 * Gatsby の Head API で使用する。各ページで <SEO ... /> を呼ぶだけで
 * og:title / og:description / og:image / og:url / twitter:card 等が揃う。
 */
import React from 'react'

const SITE_URL = 'https://reol.twilightea.com'
const SITE_NAME = '!Legit｜Reol Unofficial Fansite'
/** 下層ページの <title> に自動付与するサフィックス */
const TITLE_SUFFIX = '!Legit - Reol非公式ファンサイト'
/** title 未指定(=トップページ)時のタイトル */
const TOP_TITLE = '!Legit｜Reolの楽曲・ライブ・セトリを網羅する非公式ファンサイト'
const DEFAULT_DESCRIPTION =
  'Reol(れをる)の非公式ファンサイト。全楽曲のライブ演奏統計、歴代ライブのセットリスト、MVロケ地(聖地)マップ、ファンタイプ診断まで。10年分の活動を横断検索できます。'
const OG_IMAGE = `${SITE_URL}/ogimage.png`
const THEME_COLOR = '#27489b'

/** ?section=xxx 用のセクション別メタ */
const SECTION_META: Record<
  string,
  { title?: string; description?: string }
> = {
  home: { title: 'HOME', description: 'Reolの最新Pick Up Postとおすすめコンテンツをチェック。' },
  discography: {
    title: 'DISCOGRAPHY',
    description: 'Reolのディスコグラフィをアルバム/楽曲別に閲覧できます。',
  },
  live: {
    title: 'LIVE',
    description: '過去・現在・未来のライヴ情報とセットリスト。',
  },
  place: {
    title: 'PLACE(聖地)',
    description: 'MV/CM/TV ロケ地などの「聖地」を地図・都道府県・タイプ別で探索。',
  },
  photos: {
    title: 'PHOTOS',
    description: 'ファンが撮影/共有した写真を眺められます。',
  },
  timeline: {
    title: 'TIMELINE',
    description: 'Reolのできごとを時系列で振り返ります。',
  },
}

interface SEOProps {
  /**
   * ページ名のみを渡す(例: 'LIVE' '検索')。` | !Legit - Reol非公式ファンサイト` は自動付与。
   * 省略時はトップページ用タイトル(サフィックスなし)になる。
   */
  title?: string
  description?: string
  path?: string            // 例: '/bijigaku-navi/' '/bijigaku-navi/articles/xxx'
  type?: 'website' | 'article'
  image?: string           // 絶対URLで上書きしたい場合
  twitterCard?: 'summary' | 'summary_large_image'
  /** ?section=xxx を渡すと title/description にセクション名を反映 */
  section?: string
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  type = 'website',
  image,
  twitterCard = 'summary_large_image',
  section,
}) => {
  const sectionMeta = section ? SECTION_META[section.toLowerCase()] : undefined
  const pageTitle = sectionMeta?.title ?? title
  const resolvedTitle = pageTitle ? `${pageTitle} | ${TITLE_SUFFIX}` : TOP_TITLE
  const resolvedDescription = sectionMeta?.description ?? description
  const url = `${SITE_URL}${path}${section ? `?section=${section}` : ''}`
  const ogImage = image || OG_IMAGE

  return (
    <>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="theme-color" content={THEME_COLOR} />

      {/* Open Graph */}
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ja_JP" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@twilightplc" />

      {/* PWA / iOS Safari */}
      <link rel="manifest" href="/manifest.webmanifest" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    </>
  )
}

export default SEO
