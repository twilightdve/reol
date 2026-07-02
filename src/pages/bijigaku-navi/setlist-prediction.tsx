import React from 'react'
import { graphql, HeadFC } from 'gatsby'
import { AuthProvider } from '../../contexts/AuthContext'
import { LanguageProvider } from '../../i18n/LanguageContext'
import { useTranslation } from 'react-i18next'
import { Toaster } from 'react-hot-toast'
import { SetlistPrediction } from '../../components/setlist/SetlistPrediction'
import { Link } from 'gatsby'
import { ArrowLeft } from 'lucide-react'
import LanguageSwitch from '../../components/reolmap/layout/LanguageSwitch'
import SEO from '../../components/SEO'

const SetlistPredictionContent = ({ discographyGroups }: any) => {
  const { t } = useTranslation('common')

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${require('../../images/washi-background.png').default})`,
        backgroundRepeat: 'repeat',
        backgroundColor: '#f9fafb',
      }}
    >
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            to="/bijigaku-navi/"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            {t('setlist.backToNavi')}
          </Link>
          <LanguageSwitch variant="light" />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <SetlistPrediction discographyGroups={discographyGroups} />
      </main>
    </div>
  )
}

const SetlistPredictionPage = ({ data }: any) => {
  const discographies = data.discography.discographyWithSongs

  // アルバムごとにグループ化したデータを作成（重複許容）
  const getDiscographiesWithSongs = () => {
    interface DiscographyGroup {
      discographyUuid: string
      title: string
      format?: string | null
      songs: { songUuid: string; songName: string }[]
      themeColorPrimary?: string | null
      themeColorSecondary?: string | null
      releaseDate?: string | null
      songMeta?: { songUuid: string; songName: string; songNo: number }[]
    }

    const groups: DiscographyGroup[] = []

    // リリース日の降順でソート（新しい順）
    const sortedDiscographies = [...discographies].sort((a: any, b: any) => {
      const dateA = new Date(a.releaseDate || '1970-01-01')
      const dateB = new Date(b.releaseDate || '1970-01-01')
      return dateB.getTime() - dateA.getTime()
    })

    sortedDiscographies.forEach((disc: any) => {
      // DVD/BD、LP、MVを除外
      if (disc.format === 'DVD/BD' || disc.format === 'LP' || disc.format === 'MV') {
        return
      }

      const albumSongs: { songUuid: string; songName: string }[] = []
      const songMeta: { songUuid: string; songName: string; songNo: number }[] = []

      if (disc.songs && disc.songs.length > 0) {
        const sortedSongs = [...disc.songs].sort((a: any, b: any) => {
          return (a.songNo || 0) - (b.songNo || 0)
        })

        sortedSongs.forEach((song: any) => {
          if (
            song.songName &&
            !song.songName.toLowerCase().includes('instrumental')
          ) {
            albumSongs.push({ songUuid: song.songUuid, songName: song.songName })
            songMeta.push({ songUuid: song.songUuid, songName: song.songName, songNo: song.songNo || 0 })
          }
        })
      }

      // 楽曲がない場合でも「歌ってみた」は表示（アルバム UUID をダミーの songUuid として使用）
      if (albumSongs.length === 0 && disc.format === '歌ってみた') {
        albumSongs.push({
          songUuid: disc.discographyUuid,
          songName: `${disc.title}（楽曲データなし）`,
        })
      }

      if (albumSongs.length > 0) {
        groups.push({
          discographyUuid: disc.discographyUuid,
          title: disc.title,
          format: disc.format,
          songs: albumSongs,
          themeColorPrimary: disc.themeColorPrimary,
          themeColorSecondary: disc.themeColorSecondary,
          releaseDate: disc.releaseDate,
          songMeta: songMeta.length > 0 ? songMeta : undefined
        })
      }
    })

    return groups
  }

  const discographyGroups = getDiscographiesWithSongs()

  return (
    <LanguageProvider>
      <AuthProvider>
        <Toaster position="top-center" />
        <SetlistPredictionContent discographyGroups={discographyGroups} />
      </AuthProvider>
    </LanguageProvider>
  )
}

export const query = graphql`
  query SetlistQuery {
    discography {
      discographyWithSongs {
        discographyUuid
        title
        releaseDate
        format
        themeColorPrimary
        themeColorSecondary
        songs {
          songUuid
          songNo
          songName
        }
      }
    }
  }
`

export default SetlistPredictionPage

export const Head: HeadFC = () => (
  <SEO
    title="セットリスト予想(美辞学ナビ)"
    description="Reol美辞学ツアーのセットリストをみんなで予想しよう"
    path="/bijigaku-navi/setlist-prediction/"
  />
)
