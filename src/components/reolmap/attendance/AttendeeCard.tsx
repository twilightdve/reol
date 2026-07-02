import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Coffee, Music, X, Heart } from 'lucide-react'
import { Link } from 'gatsby'
import ProfileAvatar from '../auth/ProfileAvatar'
import { CommentForm } from '../../common/CommentForm'
import { getVenueByIdAndLocale } from '../../../data/venues'
import { getPrefectureGradient } from '../../../data/prefectureColors'
import { META_TAGS } from '../../../types/bijigaku'

interface SongData {
  songName: string
  spotifyTrackId: string | null
  discographyTitle: string
}

// 楽曲データキャッシュ
let cachedSongs: SongData[] | null = null
const loadSongs = async (): Promise<SongData[]> => {
  if (cachedSongs) return cachedSongs
  try {
    const res = await fetch('/static/data/discography.json')
    const data = await res.json()
    const songs: SongData[] = []
    for (const disc of data) {
      for (const song of disc.songs || []) {
        if (song.songName && song.spotifyTrackId) {
          songs.push({
            songName: song.songName,
            spotifyTrackId: song.spotifyTrackId,
            discographyTitle: disc.title,
          })
        }
      }
    }
    cachedSongs = songs
    return songs
  } catch {
    return []
  }
}

interface AttendeeCardProps {
  userId: string
  username: string
  fullName: string | null
  avatarUrl: string | null
  venueIds: string[]
  comment?: string
  commentDate?: string
  sharedVenueCount?: number
  isCurrentUser?: boolean
  encounterOk?: boolean
  encounterPolicy?: 'ok' | 'ng' | null
  reolType?: string | null
  metaTags?: string[]
  favoriteSong?: string | null
  encounterWanted?: boolean
  encounterMutual?: boolean
  encounterWantCount?: number
  onEncounterPolicyToggle?: () => void
  onMetaTagsChange?: (tags: string[]) => void
  onFavoriteSongChange?: (song: string | null) => void
  onEncounterWantToggle?: (targetUserId: string) => void
  onCommentPosted?: () => void
}

export const AttendeeCard: React.FC<AttendeeCardProps> = ({
  userId,
  username,
  fullName,
  avatarUrl,
  venueIds,
  comment,
  sharedVenueCount = 0,
  isCurrentUser = false,
  encounterOk = false,
  encounterPolicy,
  reolType,
  metaTags = [],
  favoriteSong,
  encounterWanted = false,
  encounterMutual = false,
  encounterWantCount = 0,
  onEncounterPolicyToggle,
  onMetaTagsChange,
  onFavoriteSongChange,
  onEncounterWantToggle,
  onCommentPosted,
}) => {
  const { t, i18n } = useTranslation('common')
  const locale = i18n.language as 'ja' | 'en'
  const [allSongs, setAllSongs] = useState<SongData[]>([])
  const [songSearch, setSongSearch] = useState('')
  const [showSongPicker, setShowSongPicker] = useState(false)

  // 楽曲データをロード
  useEffect(() => {
    loadSongs().then(setAllSongs)
  }, [])

  // 親し曲のSpotifyトラックIDを解決
  const favoriteSongData = favoriteSong
    ? allSongs.find(s => s.songName === favoriteSong)
    : null

  const displayName = fullName || username || userId
  const xUrl = `https://x.com/${userId.trim()}`

  // 英語の都道府県名を日本語にマッピング（グラデーション取得用）
  const prefectureEnToJa: Record<string, string> = {
    'Tokyo': '東京都',
    'Osaka': '大阪府',
    'Aichi': '愛知県',
    'Fukuoka': '福岡県',
    'Hokkaido': '北海道',
    'Miyagi': '宮城県',
    'Tochigi': '栃木県',
    'Kanagawa': '神奈川県',
    'Niigata': '新潟県',
    'Ishikawa': '石川県',
    'Shizuoka': '静岡県',
    'Kyoto': '京都府',
    'Hyogo': '兵庫県',
    'Hiroshima': '広島県',
    'Ehime': '愛媛県',
    'Nagasaki': '長崎県',
    'Kumamoto': '熊本県',
    'Kagoshima': '鹿児島県',
    'Okinawa': '沖縄県',
    'Tokushima': '徳島県',
    'Yamaguchi': '山口県',
    'Mie': '三重県',
    'Aomori': '青森県',
    'Nagano': '長野県',
    'Gifu': '岐阜県',
    'TAIPEI': 'TAIPEI'
  }

  // カードのクラス名を組み立て
  const cardClassName = [
    'rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow',
    isCurrentUser
      ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
      : 'bg-white dark:bg-gray-800',
    !isCurrentUser && sharedVenueCount > 0
      ? 'border-amber-300 dark:border-amber-600 ring-1 ring-amber-200 dark:ring-amber-700'
      : !isCurrentUser ? 'border-gray-200 dark:border-gray-700' : '',
  ].filter(Boolean).join(' ')

  // Reolタイプ情報を取得
  let typeInfo: { name: string; emoji: string; color: string } | null = null
  if (reolType) {
    try {
      const { reolTypes } = require('../../../data/reol-type/types')
      typeInfo = reolTypes[reolType] || null
    } catch { /* ignore */ }
  }

  // メタタグ トグルハンドラ
  const handleMetaTagToggle = (tagKey: string) => {
    if (!onMetaTagsChange) return
    const newTags = metaTags.includes(tagKey)
      ? metaTags.filter(t => t !== tagKey)
      : [...metaTags, tagKey]
    onMetaTagsChange(newTags)
  }

  // 会場バッジのレンダリング
  const renderVenueBadges = () => {
    if (venueIds.length === 0) return null
    return (
      <div className="flex flex-wrap gap-1.5">
        {venueIds
          .map(venueId => {
            const venue = getVenueByIdAndLocale(venueId, locale)
            return venue ? { venueId, venue } : null
          })
          .filter((item): item is { venueId: string; venue: any } => item !== null)
          .sort((a, b) => new Date(a.venue.date).getTime() - new Date(b.venue.date).getTime())
          .map(({ venueId, venue }) => {
            const cityName = (venue.location.city || venue.location.prefecture).replace(/[市区町村郡]$/, '')

            const prefectureForGradient = locale === 'en' 
              ? (prefectureEnToJa[venue.location.prefecture] || venue.location.prefecture)
              : venue.location.prefecture
            const gradient = venue.gradient
              ? `linear-gradient(135deg, ${venue.gradient.from}, ${venue.gradient.to})`
              : getPrefectureGradient(prefectureForGradient)

            return (
              <Link
                key={venueId}
                to={`/bijigaku-navi/venue/${venueId}/`}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white shadow-sm hover:opacity-80 transition-opacity"
                style={{ background: gradient }}
                title={`${cityName} - ${venue.name}`}
              >
                {cityName}
              </Link>
            )
          })}
      </div>
    )
  }

  // エンカ + メタタグバッジ行（横一列）
  const renderBadgeRow = () => {
    if (isCurrentUser) {
      // 自分のカード: エンカトグル + メタタグトグルを横一列
      const hasEncounter = (encounterPolicy === 'ok' || encounterPolicy === 'ng') && onEncounterPolicyToggle
      const hasMetaToggle = !!onMetaTagsChange
      if (!hasEncounter && !hasMetaToggle) return null

      return (
        <div className="flex flex-wrap gap-1.5">
          {hasEncounter && (
            <button
              onClick={onEncounterPolicyToggle}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                encounterPolicy === 'ok'
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-800/60'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-400 dark:hover:bg-gray-500'
              }`}
              title={t('encounter.togglePolicy', { defaultValue: 'エンカ方針を切り替え' })}
            >
              <Coffee className="w-3.5 h-3.5" />
              {encounterPolicy === 'ok'
                ? t('encounter.okBadge', { defaultValue: 'エンカOK' })
                : t('encounter.offLabel', { defaultValue: 'エンカOFF' })}
            </button>
          )}
          {hasMetaToggle && META_TAGS.map(tag => {
            const active = metaTags.includes(tag.key)
            return (
              <button
                key={tag.key}
                onClick={() => handleMetaTagToggle(tag.key)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                  active
                    ? `${tag.color} ${tag.darkColor} ${tag.textColor} ${tag.darkTextColor}`
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-500 dark:hover:bg-gray-500'
                }`}
              >
                {tag.emoji} {tag.label}
              </button>
            )
          })}
        </div>
      )
    } else {
      // 他人のカード: メタタグバッジを横一列
      const hasMetaTags = metaTags.length > 0
      if (!hasMetaTags) return null

      return (
        <div className="flex flex-wrap gap-1.5">
          {META_TAGS.filter(tag => metaTags.includes(tag.key)).map(tag => (
            <span
              key={tag.key}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${tag.color} ${tag.darkColor} ${tag.textColor} ${tag.darkTextColor}`}
            >
              {tag.emoji} {tag.label}
            </span>
          ))}
        </div>
      )
    }
  }

  return (
    <div className={`${cardClassName} relative`}>
      {/* ユーザー情報（常に表示） — アイコン・名前・IDがXへリンク */}
      <div className="flex items-start gap-3">
        <a href={xUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
          <ProfileAvatar
            username={username}
            fullName={fullName}
            avatarUrl={avatarUrl}
            size="medium"
          />
        </a>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {displayName}
            </a>
            {isCurrentUser ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300 whitespace-nowrap">
                {t('attendees.you', 'あなた')}
              </span>
            ) : sharedVenueCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 whitespace-nowrap">
                {t('attendees.sharedVenues', '🤝 {{count}}会場一緒', { count: sharedVenueCount })}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <a
              href={xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              @{userId}
            </a>
            {typeInfo && (
              <a
                href={`/quiz/reol-type/types/${reolType!.toLowerCase()}/`}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap border transition-colors"
                style={{
                  backgroundColor: `${typeInfo.color}18`,
                  borderColor: `${typeInfo.color}40`,
                  color: typeInfo.color,
                }}
              >
                <span>{typeInfo.emoji}</span> {typeInfo.name}
              </a>
            )}
            {encounterOk && !isCurrentUser && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 whitespace-nowrap">
                ☕ {t('encounter.okBadge', { defaultValue: 'エンカOK' })}
              </span>
            )}
            {!isCurrentUser && encounterWantCount > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-300 whitespace-nowrap">
                <Heart className="w-2.5 h-2.5 fill-current" />
                {encounterWantCount}
              </span>
            )}
            {encounterMutual && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300 whitespace-nowrap animate-pulse">
                💕
              </span>
            )}
          </div>
        </div>
      </div>

      {/* コメント（常に表示） */}
      {isCurrentUser ? (
        <div className="mt-3">
          <CommentForm onCommentPosted={onCommentPosted} />
        </div>
      ) : comment ? (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-700 dark:text-gray-300">
          {comment}
        </div>
      ) : null}

      {/* エンカしたいボタン（他人のカードのみ、ログイン済み） — 右上 */}
      {!isCurrentUser && onEncounterWantToggle && (
        <button
          onClick={() => onEncounterWantToggle(userId)}
          className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-colors ${
            encounterWanted
              ? 'bg-pink-100 text-pink-600 hover:bg-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:hover:bg-pink-800/60'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-500 dark:hover:bg-gray-500'
          }`}
          title={encounterWanted ? 'エンカしたいを解除' : 'エンカしたい'}
        >
          <Heart className={`w-3 h-3 ${encounterWanted ? 'fill-current' : ''}`} />
          {encounterWanted ? 'エンカしたい！' : 'エンカしたい'}
        </button>
      )}

      {/* 詳細エリア（常時表示） */}
      {(
        <div className={`${isCurrentUser ? 'mt-3' : 'mt-2 pt-2 border-t border-gray-200 dark:border-gray-600'} space-y-2.5`}>
          {/* エンカOK + メタタグを横一列 */}
          {renderBadgeRow()}

          {/* 参加会場バッジ */}
          {renderVenueBadges()}

          {/* 推し曲セレクター（自分のカードのみ） */}
          {isCurrentUser && onFavoriteSongChange && (
            <div className="space-y-1.5">
              {favoriteSong ? (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    <Music className="w-3 h-3" />
                    {favoriteSong}
                  </span>
                  <button
                    onClick={() => onFavoriteSongChange(null)}
                    className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="推し曲を解除"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setShowSongPicker(!showSongPicker)}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    変更
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSongPicker(!showSongPicker)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-500 dark:hover:bg-gray-500 transition-colors"
                >
                  <Music className="w-3 h-3" />
                  推し曲を設定
                </button>
              )}
              {showSongPicker && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 space-y-1.5">
                  <input
                    type="text"
                    value={songSearch}
                    onChange={e => setSongSearch(e.target.value)}
                    placeholder="曲名で検索..."
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-0.5">
                    {allSongs
                      .filter(s => s.songName.toLowerCase().includes(songSearch.toLowerCase()))
                      .slice(0, 50)
                      .map((song, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onFavoriteSongChange(song.songName)
                            setShowSongPicker(false)
                            setSongSearch('')
                          }}
                          className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors ${
                            favoriteSong === song.songName
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span className="font-medium">{song.songName}</span>
                          <span className="ml-1.5 text-gray-400 dark:text-gray-500 text-[10px]">{song.discographyTitle}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 推し曲Spotifyプレイヤー（全員のカード） */}
          {favoriteSongData?.spotifyTrackId && (
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-bold">
                <Music className="w-3 h-3" />
                <span>推し曲: {favoriteSong}</span>
              </div>
              <iframe
                src={`https://open.spotify.com/embed/track/${favoriteSongData.spotifyTrackId}?utm_source=generator&theme=0`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-lg"
                title={`${favoriteSong} - Spotify`}
              />
            </div>
          )}

          {/* 推し曲バッジ（他人のカード、Spotifyなし） */}
          {!isCurrentUser && favoriteSong && !favoriteSongData?.spotifyTrackId && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 whitespace-nowrap">
              <Music className="w-3 h-3" />
              {favoriteSong}
            </span>
          )}
        </div>
      )}

    </div>
  )
}
