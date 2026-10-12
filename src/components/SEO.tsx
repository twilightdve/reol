/**
 * SEO - 共通OGタグ / metaタグコンポーネント
 *
 * Gatsby の Head API で使用する。各ページで <SEO ... /> を呼ぶだけで
 * og:title / og:description / og:image / og:url / twitter:card 等が揃う。
 */
import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { DEFAULT_LANG, HTML_LANG, OG_LOCALE, SiteLang } from '../i18n/site/langs'
import { getDict } from '../i18n/site/dict'
import { availableLangsFor, localizePath } from '../utils/i18nRoutes'

const SITE_URL = 'https://reol.twilightea.com'
const SITE_NAME = '!Legit｜Reol Unofficial Fansite'
// 活動年数はハードコードすると腐るため、起点年(れをる時代=2012)からビルド時に計算する
const ACTIVITY_YEARS = new Date().getFullYear() - 2012
// タイトルのサフィックス・トップのタイトル・既定の description は言語ごとに辞書から引く(plan/28)
const OG_IMAGE = `${SITE_URL}/ogimage.png`
const THEME_COLOR = '#27489b'

/**
 * OGP 画像の URL にビルド時刻(Unix 秒)を ?t= で付ける。SNS(X・LINE など)は画像を URL 単位で長くキャッシュするので、
 * デプロイのたびに URL を変えて、作り直した画像を読み直させる(2026-10-12)。
 * 時刻はビルド時に決まる値(siteBuildMetadata)を使い、静的 HTML とブラウザでの描画で同じ URL にする
 */
const withBuildTimestamp = (imageUrl: string, buildTime: string | null | undefined): string => {
  const seconds = buildTime ? Math.floor(Date.parse(buildTime) / 1000) : NaN
  if (!Number.isFinite(seconds)) return imageUrl
  return `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${seconds}`
}

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
  /** JSON-LD 構造化データ。オブジェクト単体でも配列でも可(配列は script タグを複数出力) */
  jsonLd?: object | object[]
  /** ページの言語(多言語ページ: plan/28)。path は日本語側のパスを渡す */
  lang?: SiteLang
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  path = '',
  type = 'website',
  image,
  twitterCard = 'summary_large_image',
  section,
  jsonLd,
  lang = DEFAULT_LANG,
}) => {
  const dict = getDict(lang)
  const sectionMeta = section ? SECTION_META[section.toLowerCase()] : undefined
  const pageTitle = sectionMeta?.title ?? title
  const resolvedTitle = pageTitle ? `${pageTitle} | ${dict.site.titleSuffix}` : dict.site.topTitle
  const resolvedDescription =
    sectionMeta?.description ?? description ?? dict.site.defaultDescription(ACTIVITY_YEARS)
  // path は日本語側のパス。言語ページでは /en/... 等の自分自身のURLにする
  const localizedPath = path ? localizePath(path, lang) : ''
  const url = `${SITE_URL}${localizedPath}${section ? `?section=${section}` : ''}`
  // 正規URLはクエリ(?section= 等)を含めないページ本体のURL。path 未指定では出さない
  const canonicalUrl = path ? `${SITE_URL}${localizedPath}` : null
  // 翻訳版があるページだけ hreflang を出す(実在する言語 + x-default=日本語)
  const alternateLangs = path ? availableLangsFor(path) : []
  const { siteBuildMetadata } = useStaticQuery<{ siteBuildMetadata: { buildTime: string | null } | null }>(graphql`
    query SeoBuildTime {
      siteBuildMetadata {
        buildTime
      }
    }
  `)
  const ogImage = withBuildTimestamp(image || OG_IMAGE, siteBuildMetadata?.buildTime)
  // jsonLd は単体/配列どちらでも受け取れるようにし、script タグを1つずつ出力する
  const jsonLdList = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <>
      {/* クライアント側のページ遷移でも <html lang> を言語に合わせて更新する(plan/28) */}
      <html lang={HTML_LANG[lang]} />
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="theme-color" content={THEME_COLOR} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {alternateLangs.length > 1 &&
        alternateLangs.map((l) => (
          <link
            key={`alt-${l}`}
            rel="alternate"
            hrefLang={HTML_LANG[l]}
            href={`${SITE_URL}${localizePath(path, l)}`}
          />
        ))}
      {alternateLangs.length > 1 && (
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${localizePath(path, DEFAULT_LANG)}`} />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={OG_LOCALE[lang]} />

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

      {/* JSON-LD 構造化データ */}
      {jsonLdList.map((schema, i) => (
        <script
          key={`jsonld-${i}`}
          type="application/ld+json"
          // 「</script>」などで script 要素を抜け出せないよう、< を JSON の \u003c に置き換える(JSON としては同じ値)
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  )
}

export default SEO
