import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { addVote, removeVote, getVoteCounts, getUserVotes, getVotersBySong, VoteCount, Voter } from '../../services/setlistService'
import LoginButton from '../reolmap/auth/LoginButton'
import { Music, ThumbsUp, Users, ChevronDown, ChevronUp, Disc, X } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSkeleton from '../common/LoadingSkeleton'
import ErrorRetry from '../common/ErrorRetry'
import { trackEvent } from '../../utils/analytics'

// ライト/ダーク両対応のスケルトン行スタイル（和紙上のカードに合わせる）
const SKELETON_ROW_CLASS =
  'border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/50'

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

interface SetlistPredictionProps {
  discographyGroups: DiscographyGroup[]
}

export const SetlistPrediction: React.FC<SetlistPredictionProps> = ({ discographyGroups }) => {
  const { user, profile } = useAuth()
  const { t } = useTranslation('common')
  const [voteCounts, setVoteCounts] = useState<VoteCount[]>([])
  const [userVotes, setUserVotes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [votingInProgress, setVotingInProgress] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set())
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [showAllRanking, setShowAllRanking] = useState(false)
  const [showAllUserVotes, setShowAllUserVotes] = useState(false)
  const [votersModalSong, setVotersModalSong] = useState<{ songUuid: string; songName: string } | null>(null)
  const [voters, setVoters] = useState<Voter[]>([])
  const [loadingVoters, setLoadingVoters] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [votersError, setVotersError] = useState(false)

  // 投票データを読み込み
  useEffect(() => {
    loadVoteData()
  }, [user])

  const loadVoteData = async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const counts = await getVoteCounts()
      setVoteCounts(counts)

      if (user) {
        const votes = await getUserVotes(user.id)
        setUserVotes(votes)
      }
    } catch (error) {
      console.error('Error loading vote data:', error)
      setLoadError(true)
      trackEvent('data_load_error', { category: 'data', label: 'setlist_votes' })
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (songUuid: string, songName: string, event?: React.MouseEvent | React.FormEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    if (!user || !profile) {
      toast.error(t('setlist.loginRequired'))
      return
    }

    setVotingInProgress(songUuid)

    try {
      const isVoted = userVotes.includes(songUuid)

      if (isVoted) {
        // 投票を取り消し
        const success = await removeVote(user.id, songUuid)
        if (success) {
          setUserVotes(prev => prev.filter(s => s !== songUuid))
          // 投票数を直接更新
          setVoteCounts(prev => prev.map(v => 
            v.song_uuid === songUuid 
              ? { ...v, vote_count: Math.max(0, v.vote_count - 1) }
              : v
          ))
          toast.success(t('setlist.voteRemoved'))
        } else {
          toast.error(t('setlist.voteRemoveFailed'))
        }
      } else {
        // 投票上限チェック
        if (userVotes.length >= 20) {
          toast.error(t('setlist.maxVotesReached'))
          setVotingInProgress(null)
          return
        }

        // 投票
        const success = await addVote(user.id, songUuid)
        if (success) {
          setUserVotes(prev => [...prev, songUuid])
          // 投票数を直接更新
          setVoteCounts(prev => {
            const existing = prev.find(v => v.song_uuid === songUuid)
            if (existing) {
              return prev.map(v => 
                v.song_uuid === songUuid 
                  ? { ...v, vote_count: v.vote_count + 1 }
                  : v
              )
            } else {
              return [...prev, { song_uuid: songUuid, vote_count: 1 }]
            }
          })
          toast.success(t('setlist.voted'))
        } else {
          toast.error(t('setlist.voteFailed'))
        }
      }
    } catch (error) {
      console.error('Error voting:', error)
      toast.error(t('venueSelector.generalError'))
    } finally {
      setVotingInProgress(null)
    }
  }

  const getVoteCount = (songUuid: string): number => {
    const vote = voteCounts.find(v => v.song_uuid === songUuid)
    return vote ? vote.vote_count : 0
  }

  const isVoted = (songUuid: string): boolean => {
    return userVotes.includes(songUuid)
  }

  const toggleGroup = (discographyUuid: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(discographyUuid)) {
        newSet.delete(discographyUuid)
      } else {
        newSet.add(discographyUuid)
      }
      return newSet
    })
  }

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev => {
      const newSet = new Set(prev)
      if (newSet.has(format)) {
        newSet.delete(format)
      } else {
        newSet.add(format)
      }
      return newSet
    })
  }

  // 利用可能なformatリストを取得
  const availableFormats = Array.from(new Set(
    discographyGroups.map(g => g.format).filter((f): f is string => !!f)
  )).sort()

  // 表示用フォーマットラベル（'歌ってみた' を '歌みた' に短縮）
  const formatLabel = (f?: string | null) => {
    if (!f) return f
    if (f === '歌ってみた') return '歌みた'
    return f
  }

  // 投票者モーダルを開く
  const openVotersModal = async (songUuid: string, songName: string) => {
    setVotersModalSong({ songUuid, songName })
    setLoadingVoters(true)
    setVotersError(false)
    try {
      const votersData = await getVotersBySong(songUuid)
      setVoters(votersData)
    } catch (error) {
      console.error('Error loading voters:', error)
      // モーダル内に再試行つきエラーを表示するため、トーストは出さない
      setVotersError(true)
      trackEvent('data_load_error', { category: 'data', label: 'setlist_voters' })
    } finally {
      setLoadingVoters(false)
    }
  }

  // 投票者モーダルを閉じる
  const closeVotersModal = () => {
    setVotersModalSong(null)
    setVoters([])
  }

  // 検索フィルター適用後のグループ
  const filteredGroups = discographyGroups
    .filter(group => {
      // formatフィルタ: 選択されている場合はそのformatのみ表示
      if (selectedFormats.size > 0 && group.format) {
        return selectedFormats.has(group.format)
      }
      return true
    })
    .map(group => ({
      ...group,
      songs: group.songs.filter(song =>
        song.songName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(group => group.songs.length > 0)

  if (loading) {
    return (
      <div className="py-6">
        <LoadingSkeleton
          rows={4}
          rowHeightClassName="h-20"
          gapClassName="space-y-3"
          rowClassName={SKELETON_ROW_CLASS}
          label={t('setlist.loading')}
        />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="py-6">
        <ErrorRetry
          title={t('venueSelector.generalError')}
          actionLabel={t('ui.retry')}
          onRetry={loadVoteData}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー - 和紙上のテキスト表示に変更 */}
      <div className="bg-transparent p-0">
        <div className="flex items-center gap-3 mb-4">
          <Music className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('setlist.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('setlist.description')}
            </p>
          </div>
        </div>

        {!user && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                {t('setlist.loginRequired')}
              </p>
              <LoginButton compact />
            </div>
          </div>
        )}
      </div>

      {/* 投票数ランキング */}
      {voteCounts.length > 0 && (
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-md p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ThumbsUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('setlist.voteRanking')}
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  TOP {showAllRanking ? '30' : '10'}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            {voteCounts
              .sort((a, b) => {
                // 票数で比較
                if (b.vote_count !== a.vote_count) {
                  return b.vote_count - a.vote_count
                }
                
                // 票数が同じ場合、楽曲メタデータを取得
                const aMeta = discographyGroups
                  .flatMap(g => (g.songMeta || []).map(s => ({ ...s, releaseDate: g.releaseDate })))
                  .find(m => m.songUuid === a.song_uuid)
                const bMeta = discographyGroups
                  .flatMap(g => (g.songMeta || []).map(s => ({ ...s, releaseDate: g.releaseDate })))
                  .find(m => m.songUuid === b.song_uuid)
                
                // リリース日で比較（降順）
                if (aMeta?.releaseDate && bMeta?.releaseDate && aMeta.releaseDate !== bMeta.releaseDate) {
                  return new Date(bMeta.releaseDate).getTime() - new Date(aMeta.releaseDate).getTime()
                }
                
                // リリース日が同じ場合、曲番号で比較（昇順）
                if (aMeta?.songNo !== undefined && bMeta?.songNo !== undefined) {
                  return aMeta.songNo - bMeta.songNo
                }
                
                return 0
              })
              .slice(0, showAllRanking ? 30 : 10)
              .map((vote, index) => {
                const voted = isVoted(vote.song_uuid)
                const meta = discographyGroups
                  .flatMap(g => g.songMeta || [])
                  .find(m => m.songUuid === vote.song_uuid)
                const displayName = meta?.songName ?? vote.song_uuid
                return (
                  <button
                    key={vote.song_uuid}
                    type="button"
                    onClick={() => openVotersModal(vote.song_uuid, displayName)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors hover:opacity-80 ${
                      voted
                        ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700'
                        : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </div>
                    <span className={`text-sm font-medium truncate flex-1 text-left ${voted ? 'text-purple-900 dark:text-purple-100' : 'text-gray-900 dark:text-white'}`}>
                      {displayName}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-900 dark:text-white">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{vote.vote_count}</span>
                    </div>
                  </button>
                )
              })}
          </div>
          {voteCounts.length > 10 && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowAllRanking(!showAllRanking)}
                className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              >
                {showAllRanking ? t('setlist.showLess') : t('setlist.showMoreTop30')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* あなたの投票した楽曲 */}
      {user && userVotes.length > 0 && (
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <ThumbsUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('setlist.yourVotes')}
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({userVotes.length}{t('setlist.songs')})
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {t('setlist.maxVotesNote')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {userVotes.slice(0, showAllUserVotes ? 20 : 10).map(songUuid => {
              const voteCount = getVoteCount(songUuid)
              const isDeleting = votingInProgress === songUuid
              const meta = discographyGroups
                .flatMap(g => g.songMeta || [])
                .find(m => m.songUuid === songUuid)
              const displayName = meta?.songName ?? songUuid
              return (
                <div
                  key={songUuid}
                  className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {displayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {voteCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{voteCount}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleVote(songUuid, displayName, e)}
                      disabled={isDeleting}
                      className="flex-shrink-0 p-1.5 rounded-lg text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t('setlist.removeVote')}
                    >
                      {isDeleting ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          {userVotes.length > 10 && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowAllUserVotes(!showAllUserVotes)}
                className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              >
                {showAllUserVotes ? t('setlist.showLess') : t('setlist.showMoreMax20')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 楽曲リストカード */}
      <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-md p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('setlist.songList')}
              </h3>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {t('setlist.rhetoricNote')}
          </p>
        </div>

        {/* 検索バー */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={t('setlist.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Formatフィルタ */}
        {availableFormats.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {availableFormats.map(format => (
                <button
                  key={format}
                  onClick={() => toggleFormat(format)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    selectedFormats.has(format)
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {formatLabel(format)}
                </button>
              ))}
              {selectedFormats.size > 0 && (
                <button
                  onClick={() => setSelectedFormats(new Set())}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                >
                  {t('setlist.clear')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* アルバム別アコーディオン */}
        <div className="space-y-3">
          {filteredGroups.map(group => {
          const isExpanded = expandedGroups.has(group.discographyUuid)
          const groupVoteCount = group.songs.reduce((sum, song) => sum + getVoteCount(song.songUuid), 0)
          const groupUserVotes = group.songs.filter(song => isVoted(song.songUuid)).length
          
          // 楽曲データがない、または1曲しかない場合は展開不可で直接投票
          const hasNoSongs = group.songs.length === 1 && group.songs[0].songName.includes('（楽曲データなし）')
          const hasSingleSong = group.songs.length === 1 && !hasNoSongs
          const isDirectVote = hasNoSongs || hasSingleSong
          
          // 直接投票の場合の対象
          const voteTarget = isDirectVote ? group.songs[0] : null
          const voted = voteTarget ? isVoted(voteTarget.songUuid) : false
          const isVoting = voteTarget ? votingInProgress === voteTarget.songUuid : false
          const voteCount = voteTarget ? getVoteCount(voteTarget.songUuid) : 0
          
          // 美辞学(Rhetoric)の場合は投票不可 (タイトルマッチ)
          const isRhetoricAlbum = group.title === '美辞学'

          const hasThemeColors = group.themeColorPrimary && group.themeColorSecondary
          const headerGradientStyle = hasThemeColors
            ? {
                background: `linear-gradient(135deg, ${group.themeColorPrimary} 0%, ${group.themeColorSecondary} 100%)`,
              }
            : { backgroundColor: 'rgba(249, 250, 251, 0.8)' }
          
          const cardGradientStyle = hasThemeColors
            ? {
                background: `linear-gradient(135deg, ${group.themeColorPrimary} 0%, ${group.themeColorSecondary} 100%)`,
                border: `2px solid ${group.themeColorPrimary}`,
              }
            : {
                border: '1px solid #e5e7eb',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }

          // 楽曲データがない、または1曲しかない場合は直接投票カードとして表示
          if (isDirectVote && voteTarget) {
            return (
              <div
                key={group.discographyUuid}
                className="rounded-lg overflow-hidden shadow-md transition-all duration-300"
                style={cardGradientStyle}
              >
                <div className="p-4" style={headerGradientStyle}>
                  {/* 上段: タイトル + formatタグ */}
                  <div className="flex items-center gap-2 mb-3">
                    <Disc className={`h-5 w-5 flex-shrink-0 ${hasThemeColors ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                    <h3 className={`font-bold text-sm ${hasThemeColors ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {group.title}
                    </h3>
                    {/* 直接投票カードではフォーマットタグは下段に表示するためここでは非表示 */}
                  </div>
                  
                  {/* 下段: 投票数 + 投票ボタン */}
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 text-sm ${hasThemeColors ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                      {group.format && (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${hasThemeColors ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}`}>
                          {formatLabel(group.format)}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="font-medium">{voteCount > 0 ? voteCount : 0}{t('setlist.voteUnit')}</span>
                      </div>
                    </div>

                    {!isRhetoricAlbum && (
                      <button
                        type="button"
                        onClick={(e) => handleVote(voteTarget.songUuid, voteTarget.songName, e)}
                        disabled={!user || isVoting}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          voted
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-white text-purple-600 hover:bg-white/90 border border-white/50'
                        }`}
                      >
                        {isVoting ? (
                          '...'
                        ) : voted ? (
                          <>
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>{t('setlist.voted')}</span>
                          </>
                        ) : (
                          <>
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>{t('setlist.vote')}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div
              key={group.discographyUuid}
              className="rounded-lg overflow-hidden shadow-md transition-all duration-300"
              style={cardGradientStyle}
            >
              {/* アコーディオンヘッダー */}
              <button
                type="button"
                onClick={() => toggleGroup(group.discographyUuid)}
                className="w-full px-6 py-4 flex items-center justify-between transition-all hover:brightness-95"
                style={headerGradientStyle}
              >
                <div className="flex items-center gap-3">
                  <Disc className={`h-6 w-6 ${hasThemeColors ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold ${hasThemeColors ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {group.title}
                      </h3>
                      {group.format && (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${hasThemeColors ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}`}>
                          {formatLabel(group.format)}
                        </span>
                      )}
                    </div>
                    <div className={`flex items-center gap-3 mt-1 text-sm ${hasThemeColors ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                      <span>{group.songs.length}{t('setlist.songUnit')}</span>
                      {groupVoteCount > 0 && (
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {groupVoteCount}{t('setlist.voteUnit')}
                        </span>
                      )}
                      {groupUserVotes > 0 && (
                        <span className={`flex items-center gap-1 ${hasThemeColors ? 'text-white font-semibold' : 'text-purple-600 dark:text-purple-400'}`}>
                          <ThumbsUp className="h-3 w-3" />
                          {t('setlist.votedSongsCount', { count: groupUserVotes })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className={`h-5 w-5 ${hasThemeColors ? 'text-white' : 'text-gray-400'}`} />
                ) : (
                  <ChevronDown className={`h-5 w-5 ${hasThemeColors ? 'text-white' : 'text-gray-400'}`} />
                )}
              </button>

              {/* アコーディオンコンテンツ */}
              {isExpanded && (
                <div className="p-4 space-y-2 bg-transparent">
                    {group.songs.map((song, songIndex) => {
                      const voteCount = getVoteCount(song.songUuid)
                      const voted = isVoted(song.songUuid)
                      const isVoting = votingInProgress === song.songUuid

                      return (
                        <div
                          key={song.songUuid}
                          className={`p-3 rounded-lg transition-colors ${
                            voted
                              ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500'
                              : 'bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          {/* 上段: No. + 楽曲名 */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-600 text-xs font-bold text-gray-700 dark:text-gray-300">
                              {songIndex + 1}
                            </span>
                            <span className={`font-medium text-sm ${voted ? 'text-purple-900 dark:text-purple-100' : 'text-gray-900 dark:text-white'}`}>
                              {song.songName}
                            </span>
                          </div>

                          {/* 下段: 投票数 + 投票ボタン */}
                          <div className="flex items-center justify-between">
                            {!isRhetoricAlbum && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                <ThumbsUp className="h-4 w-4" />
                                <span className="font-medium">{voteCount > 0 ? voteCount : 0}{t('setlist.voteUnit')}</span>
                              </div>
                            )}

                            {!isRhetoricAlbum && (
                              <button
                                type="button"
                                onClick={(e) => handleVote(song.songUuid, song.songName, e)}
                                disabled={!user || isVoting}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                  voted
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-white text-purple-600 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-500'
                                }`}
                              >
                                {isVoting ? (
                                  '...'
                                ) : voted ? (
                                  <>
                                    <ThumbsUp className="h-3.5 w-3.5" />
                                    <span>{t('setlist.voted')}</span>
                                  </>
                                ) : (
                                  <>
                                    <ThumbsUp className="h-3.5 w-3.5" />
                                    <span>{t('setlist.vote')}</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )
        })}
        </div>
      </div>

      {/* 投票者モーダル */}
      {votersModalSong && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeVotersModal}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="flex flex-col gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-8">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {votersModalSong.songName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('setlist.votersList')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeVotersModal}
                  className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="閉じる"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              {/* 投票ボタン */}
              {user && votersModalSong && (
                <button
                  type="button"
                  onClick={(e) => {
                    handleVote(votersModalSong.songUuid, votersModalSong.songName, e)
                    closeVotersModal()
                  }}
                  disabled={!user || votingInProgress === votersModalSong.songUuid}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isVoted(votersModalSong.songUuid)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-white text-purple-600 hover:bg-gray-50 border border-purple-300 dark:bg-gray-700 dark:text-purple-400 dark:hover:bg-gray-600 dark:border-purple-600'
                  }`}
                >
                  {votingInProgress === votersModalSong.songUuid ? (
                    '...'
                  ) : isVoted(votersModalSong.songUuid) ? (
                    <>
                      <ThumbsUp className="h-4 w-4" />
                      <span>{t('setlist.voted')}</span>
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="h-4 w-4" />
                      <span>{t('setlist.vote')}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* モーダルボディ */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              {loadingVoters ? (
                <div className="py-2">
                  <LoadingSkeleton
                    rows={3}
                    rowHeightClassName="h-16"
                    rowClassName={SKELETON_ROW_CLASS}
                    label={t('setlist.loadingVoters')}
                  />
                </div>
              ) : votersError ? (
                <ErrorRetry
                  title={t('setlist.votersLoadFailed')}
                  actionLabel={t('ui.retry')}
                  onRetry={() =>
                    votersModalSong &&
                    openVotersModal(votersModalSong.songUuid, votersModalSong.songName)
                  }
                />
              ) : voters.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  {t('setlist.noVoters')}
                </div>
              ) : (
                <div className="space-y-2">
                  {voters.map((voter) => (
                    <div
                      key={voter.user_id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      {voter.avatar_url ? (
                        <img
                          src={voter.avatar_url}
                          alt={voter.username}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-700 flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {voter.username}
                        </p>
                      </div>
                      {voter.x_user_id && (
                        <a
                          href={`https://x.com/${voter.x_user_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* モーダルフッター */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('setlist.totalVoters', { count: voters.length })}
              </span>
              <button
                type="button"
                onClick={closeVotersModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t('setlist.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
