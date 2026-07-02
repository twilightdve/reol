import React, { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../i18n/LanguageContext'
import './VenueDetail.css'
import { Link } from 'gatsby'
import { 
  MapPin, 
  Users, 
  Calendar,
  ArrowLeft,
  ExternalLink,
  Globe,
  Info
} from 'lucide-react'
import { getVenueByIdAndLocale, type Venue } from '../../data/venues'
import { VenueAttendeesList } from '../attendance/VenueAttendeesList'
import { AttendanceButton } from '../attendance/AttendanceButton'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { getPrefectureGradient } from '../../data/prefectureColors'
import { DEFAULT_GRADIENT } from '../../data/venues/gradients'
import { VenueTravelChecklist } from './VenueTravelChecklist'
import { CommentForm } from '../common/CommentForm'
import { getVenueComments, type Comment } from '../../services/commentService'
import LanguageSwitch from '../reolmap/layout/LanguageSwitch'
import VenueAccessSection from './VenueAccessSection'
import VenueParkingSection from './VenueParkingSection'
import VenueHotelSection from './VenueHotelSection'
import VenueNearbySection from './VenueNearbySection'
import VenueOtherVenues from './VenueOtherVenues'

interface VenueDetailProps {
  venueId: string
}

const VenueDetail: React.FC<VenueDetailProps> = ({ venueId }) => {
  const { t } = useTranslation('venue')
  const { language } = useLanguage()
  const { user } = useAuth()
  
  // useMemoでvenueをメモ化し、言語が変更されたときのみ再計算する
  const venue = useMemo(() => getVenueByIdAndLocale(venueId, language), [venueId, language])
  
  const [mapLoaded, setMapLoaded] = useState(false)
  const [showAllVenues, setShowAllVenues] = useState(false)
  const [isAttending, setIsAttending] = useState(false)
  const [loadingAttendance, setLoadingAttendance] = useState(true)
  const [isNavFixed, setIsNavFixed] = useState(false)
  const [venueComments, setVenueComments] = useState<{ [userId: string]: Comment }>({})
  
  // 会場のグラデーション背景をメモ化（venueIdのみに依存し、言語切り替えで変わらないようにする）
  const venueGradient = useMemo(() => {
    // 常に日本語版のvenueデータからグラデーションを計算する
    const jaVenue = getVenueByIdAndLocale(venueId, 'ja')
    if (!jaVenue) return DEFAULT_GRADIENT.from
    
    // 1. 会場個別のグラデーション設定があればそれを優先
    if (jaVenue.gradient) {
      return `linear-gradient(135deg, ${jaVenue.gradient.from}, ${jaVenue.gradient.to})`
    }
    // 2. 都道府県カラーを適用
    const prefectureGradient = getPrefectureGradient(jaVenue.location.prefecture)
    if (prefectureGradient !== 'rgba(216, 217, 195, 0.9)') {
      return prefectureGradient
    }
    // 3. デフォルトは単色
    return DEFAULT_GRADIENT.from
  }, [venueId])
  // ページ内ナビゲーション用のセクション定義（存在するセクションのみ表示）
  const sections = venue ? [
    { id: 'info', label: t('sections.basicInfo'), condition: true },
    { id: 'attendees', label: t('sections.attendees'), condition: true },
    { id: 'access', label: t('sections.access'), condition: !!(venue.access || venue.longDistanceAccess) },
    { id: 'lockers', label: t('sections.lockers'), condition: true },
    { id: 'parking', label: t('sections.parking'), condition: true },
    { id: 'cafes', label: t('sections.cafes'), condition: !!(venue.cafes && venue.cafes.length > 0) },
    { id: 'restaurants', label: t('sections.restaurants'), condition: true },
    { id: 'spots', label: t('sections.attractions'), condition: true },
    { id: 'holy', label: t('sections.holyPlaces'), condition: !!(venue.holyPlaces && venue.holyPlaces.length > 0) },
    { id: 'hotels', label: t('sections.accommodations'), condition: !!(venue.accommodations && venue.accommodations.length > 0) },
  ].filter(section => section.condition) : []

  // スクロール位置を監視してナビゲーションを固定
  useEffect(() => {
    const handleScroll = () => {
      const infoSection = document.getElementById('info')
      if (infoSection) {
        const infoBottom = infoSection.offsetTop + infoSection.offsetHeight
        setIsNavFixed(window.scrollY > infoBottom)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // スムーズスクロール関数
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // 固定ナビの高さ分のオフセット
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
  }

  // 参加状態を確認
  useEffect(() => {
    const checkAttendance = async () => {
      if (!user || !supabase) {
        setLoadingAttendance(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('venue_attendances')
          .select('*')
          .eq('user_id', user.id)
          .eq('venue_id', venueId)
          .single()

        if (data && !error) {
          setIsAttending(true)
        }
      } catch (error) {
        console.error('参加状態の確認エラー:', error)
      } finally {
        setLoadingAttendance(false)
      }
    }

    checkAttendance()
  }, [user, venueId])

  // 会場コメントを取得
  useEffect(() => {
    const loadVenueComments = async () => {
      if (venue) {
        const comments = await getVenueComments(venue.id)
        // ユーザーごとの最新コメントをマップに格納
        const commentsMap: { [userId: string]: Comment } = {}
        comments.forEach(comment => {
          if (!commentsMap[comment.user_id]) {
            commentsMap[comment.user_id] = comment
          }
        })
        setVenueComments(commentsMap)
      }
    }
    loadVenueComments()
  }, [venue])

  // コメント投稿後に再取得
  const handleCommentPosted = async () => {
    if (venue) {
      const comments = await getVenueComments(venue.id)
      const commentsMap: { [userId: string]: Comment } = {}
      comments.forEach(comment => {
        if (!commentsMap[comment.user_id]) {
          commentsMap[comment.user_id] = comment
        }
      })
      setVenueComments(commentsMap)
    }
  }

  // 会場が見つからない場合
  if (!venue) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('messages.venueNotFound')}
            </h1>
            <Link 
              to="/bijigaku-navi/"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← {t('navigation.backToTop')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    }
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'ja-JP', options)
  }

  // Google Maps埋め込みURL生成（標準iframe、APIキー不要）
  const getGoogleMapsEmbedUrl = () => {
    // 専用の埋め込みURLがある場合はそれを使用
    if (venue.mapEmbedUrl) return venue.mapEmbedUrl
    // それ以外は従来の方法で生成
    if (!venue.location.address) return null
    const query = encodeURIComponent(`${venue.name} ${venue.location.address}`)
    return `https://maps.google.com/maps?q=${query}&output=embed&z=15`
  }

  // Google Maps検索URL
  const getGoogleMapsSearchUrl = () => {
    if (!venue.location.address) return null
    const query = encodeURIComponent(`${venue.name} ${venue.location.address}`)
    return `https://www.google.com/maps/search/${query}`
  }

  // venueが存在しない場合は何も表示しない
  if (!venue) {
    return null
  }

  return (
    <>
      {/* 会場基本情報（横幅いっぱい） */}
      <div
        id="info"
        className="relative"
        style={{
          background: venueGradient,
          margin: 0,
          padding: 0,
          borderRadius: 0,
          boxShadow: 'none',
        }}
      >
        <div className="w-full px-4 md:px-12 lg:px-32 pt-2 pb-4 md:py-12 lg:py-16">
              {/* トップに戻るボタンと言語切り替え */}
              <div className="mb-1 flex justify-between items-center">
                <Link
                  to="/bijigaku-navi/"
                  className="inline-flex items-center gap-0 text-white text-xs hover:opacity-80 transition-opacity text-shadow-venue"
                >
                  <ArrowLeft className="h-2.5 w-2.5" />
                  {t('navigation.backToTop')}
                </Link>
                <LanguageSwitch />
              </div>

              <div className="flex items-start gap-4 mb-4">
                <h1 className="text-2xl font-bold text-white text-shadow-venue-strong">
                  {venue.name}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white mb-3 text-shadow-venue">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-white" />
                  <span>{formatDate(venue.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-white" />
                  <span>{venue.location.prefecture}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-white" />
                  <span>{venue.capacity ? `${venue.capacity}${language === 'ja' ? '人' : ' people'}` : (language === 'ja' ? '未定' : 'TBD')}</span>
                </div>
              </div>

              {/* Google Maps埋め込み */}
              {getGoogleMapsEmbedUrl() && (
                <div className="mt-4 mb-4">
                  <div className="relative h-64 overflow-hidden rounded-lg">
                    <iframe
                      src={getGoogleMapsEmbedUrl() || ''}
                      width="100%"
                      height="100%"
                      className="absolute inset-0 border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      onLoad={() => setMapLoaded(true)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-white" />
                  <span className="text-white text-shadow-venue">{venue.location.address || t('messages.noDataRegistered')}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  {venue.venueWebsite && (
                    <a 
                      href={venue.venueWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-white hover:text-white/80 text-shadow-venue"
                    >
                      <Globe className="h-4 w-4 icon-shadow" />
                      <span>{t('buttons.officialSite')}</span>
                      <ExternalLink className="h-3 w-3 icon-shadow" />
                    </a>
                  )}
                  {/* 参加予定ボタン */}
                  <div className="flex-shrink-0">
                    <AttendanceButton
                      venueId={venueId}
                      venueName={venue.name}
                      isAttending={isAttending}
                      onAttendanceChange={setIsAttending}
                    />
                  </div>
                </div>
              </div>

              {/* ページ内ナビゲーション */}
              <div className="mt-4 border-t border-white/30 pt-4">
                <div className="flex flex-wrap items-center gap-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="px-2 py-1 text-xs rounded bg-white/20 text-white hover:bg-white/40 transition-colors flex items-center gap-1 text-shadow-venue"
                    >
                      <span className="text-[10px]">▼</span>
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>
        </div>
      </div>

      {/* スクロール追随ナビゲーション */}
      {isNavFixed && (
        <nav className="fixed top-0 left-0 right-0 z-40 shadow-lg backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
          style={{
            background: venueGradient
          }}
        >
          <div className="max-w-6xl mx-auto px-3">
            <div className="flex flex-wrap items-center gap-1 py-1.5">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="px-2 py-1 text-xs rounded bg-white/20 text-white hover:bg-white/40 transition-colors flex items-center gap-1 text-shadow-venue"
                >
                  <span className="text-[10px]">▼</span>
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="space-y-6 py-6">
            {/* コメント入力フォーム */}
            <div className="max-w-4xl mx-auto">
              <CommentForm 
                venueId={venue.id} 
                onCommentPosted={handleCommentPosted}
                placeholder={t('common:comments.venuePlaceholder', { 
                  prefecture: venue.location.prefecture === '北海道' 
                    ? '北海道' 
                    : venue.location.prefecture.replace(/[都府県]/g, '')
                })}
              />
            </div>

            {/* 参加者情報 */}
            <div id="attendees" className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
              <VenueAttendeesList 
                venueId={venueId}
                comments={venueComments}
              />
            </div>

            {/* 旅行計画チェックリスト */}
            <VenueTravelChecklist venueId={venueId} venue={venue} />

          {/* AI生成情報に関する注意書き */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                  {t('messages.accuracyDisclaimer')}
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  {t('messages.accuracyNote')}
                </p>
              </div>
            </div>
          </div>

          <VenueAccessSection venue={venue} />

          <VenueNearbySection venue={venue} />

          <VenueParkingSection venue={venue} />

          <VenueHotelSection venue={venue} />

          <VenueOtherVenues venueId={venueId} />
        </div>
      </div>
    </>
  )
}

export default VenueDetail;