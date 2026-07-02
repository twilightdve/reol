import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from '../../../contexts/AuthContext'
import { LanguageProvider, useLanguage } from '../../../i18n/LanguageContext'
import { useTranslation } from 'react-i18next'
import { Toaster } from 'react-hot-toast'
import ProfileSideMenu from '../auth/ProfileSideMenu'
import XAccountQRCode from '../auth/XAccountQRCode'
import PasswordSetup from '../auth/PasswordSetup'
import ChangeUserId from '../auth/ChangeUserId'
import DeleteAccount from '../auth/DeleteAccount'
import SettingsModal from '../settings/SettingsModal'
import { getAllVenuesSortedByLocale } from '../../../data/venues'
import { getTotalAttendeesCount, getAllAttendees, getAllVenueAttendanceCounts, getUserAttendedVenues, getUserEncounterVenues } from '../../../services/venueService'
import { getMyEncounterWants, getEncounterWantCounts, getWhoWantsMe, toggleEncounterWant } from '../../../services/encounterWantService'

import { getGlobalComments, getUserLatestComment, type Comment } from '../../../services/commentService'
import { CommentForm } from '../../common/CommentForm'
import { COLORS } from '../../../constants/bijigaku'
import type { Attendee, CommentMap, AttendeeVenuesMap, VenueAttendanceCountMap, FormattedDate, AttendeeEncounterMap } from '../../../types/bijigaku'
import { getAttendeeUserId } from '../../../types/bijigaku'

// 分割済みコンポーネント
import BijigakuHeader from './BijigakuHeader'
import StatsOverview from './StatsOverview'
import AttendeeSection from './AttendeeSection'
import VenueSelectorModal from './VenueSelectorModal'
import VenueAttendanceChart from './VenueAttendanceChart'
import TourTimeline from './TourTimeline'
import ShareButton from './ShareButton'
import ArticleSection from '../articles/ArticleSection'
import HelpGuideModal from './HelpGuideModal'
import EncounterOnboardingModal from '../encounter/EncounterOnboardingModal'

const ReolMapContent: React.FC = () => {
  const { user, profile, loading, createProfileInSupabase, updateProfile } = useAuth()
  const { language } = useLanguage()
  const { t, i18n } = useTranslation('common')
  const [activeTab, setActiveTab] = useState<'venues' | 'overview'>('overview')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false)
  const [isPasswordSetupOpen, setIsPasswordSetupOpen] = useState(false)
  const [isChangeIdOpen, setIsChangeIdOpen] = useState(false)
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
  const [isHelpGuideOpen, setIsHelpGuideOpen] = useState(false)
  const [totalAttendees, setTotalAttendees] = useState<number>(0)
  const [selectedVenuesFromDB, setSelectedVenuesFromDB] = useState<string[]>([])
  const [isLoadingVenues, setIsLoadingVenues] = useState(false)
  const [allAttendees, setAllAttendees] = useState<Attendee[]>([])
  const [attendeeVenues, setAttendeeVenues] = useState<AttendeeVenuesMap>({})
  const [venueAttendanceCounts, setVenueAttendanceCounts] = useState<VenueAttendanceCountMap>({})
  const [showVenueSelector, setShowVenueSelector] = useState(false)
  const [globalComments, setGlobalComments] = useState<CommentMap>({})
  const [attendeeEncounters, setAttendeeEncounters] = useState<AttendeeEncounterMap>({})
  const [encounterWants, setEncounterWants] = useState<string[]>([])
  const [encounterWantedBy, setEncounterWantedBy] = useState<string[]>([])
  const [encounterWantCounts, setEncounterWantCounts] = useState<Record<string, number>>({})
  const [showEncounterOnboarding, setShowEncounterOnboarding] = useState(false)
  
  const venues = getAllVenuesSortedByLocale(i18n.language === 'en' ? 'en' : 'ja')
  const upcomingVenues = venues.slice(0, 5) // 直近5会場

  // 都道府県名を翻訳
  const getPrefectureName = (prefecture: string) => {
    if (i18n.language === 'en') {
      return t(`prefectures.${prefecture}`, prefecture)
    }
    return prefecture
  }

  // モーダル表示中は背後のスクロールを無効化
  useEffect(() => {
    if (showVenueSelector || isSettingsOpen || isProfileMenuOpen || isHelpGuideOpen || showEncounterOnboarding) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // クリーンアップ: コンポーネントがアンマウントされるときにリセット
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showVenueSelector, isSettingsOpen, isProfileMenuOpen, isHelpGuideOpen, showEncounterOnboarding])

  // ログインユーザーの会場選択をSupabaseから取得
  useEffect(() => {
    const loadUserVenues = async () => {
      if (user) {
        setIsLoadingVenues(true)
        try {
          const { supabase } = await import('../../../lib/supabase')
          if (!supabase) {
            return
          }
          const { data, error } = await supabase
            .from('venue_attendances')
            .select('venue_id')
            .eq('user_id', user.id)

          if (error) {
            console.error('Error loading user venues:', error)
          } else if (data) {
            const venueIds = data.map(item => item.venue_id)
            setSelectedVenuesFromDB(venueIds)
            // ローカルストレージも更新
            if (typeof window !== 'undefined') {
              localStorage.setItem('reolmap_selected_venues', JSON.stringify(venueIds))
            }
          }
        } catch (error) {
          console.error('Error in loadUserVenues:', error)
        } finally {
          setIsLoadingVenues(false)
        }
      } else {
        // 未ログイン時はデータをクリア
        setSelectedVenuesFromDB([])
        setIsLoadingVenues(false)
        // ローカルストレージもクリア
        if (typeof window !== 'undefined') {
          localStorage.removeItem('reolmap_selected_venues')
        }
      }
    }
    loadUserVenues()
  }, [user])

  // 全体の参加表明者数を取得
  useEffect(() => {
    const fetchTotalAttendees = async () => {
      const count = await getTotalAttendeesCount()
      setTotalAttendees(count)
    }
    fetchTotalAttendees()
  }, [])

  // 全参加者データと参加会場データを取得
  useEffect(() => {
    const fetchAllAttendeesData = async () => {
      const attendees = await getAllAttendees()
      setAllAttendees(attendees)
      
      // 各参加者の参加会場リストを取得
      const venuesMap: AttendeeVenuesMap = {}
      await Promise.all(
        attendees.map(async (attendee: Attendee) => {
          const userId = getAttendeeUserId(attendee)
          const venues = await getUserAttendedVenues(userId)
          venuesMap[userId] = venues
        })
      )
      setAttendeeVenues(venuesMap)

      // 各参加者のエンカウント会場設定を取得
      const encountersMap: AttendeeEncounterMap = {}
      await Promise.all(
        attendees.map(async (attendee: Attendee) => {
          const userId = getAttendeeUserId(attendee)
          const encounterVenues = await getUserEncounterVenues(userId)
          encountersMap[userId] = encounterVenues
        })
      )
      setAttendeeEncounters(encountersMap)

      // エンカしたいカウントを取得
      const counts = await getEncounterWantCounts()
      setEncounterWantCounts(counts)
    }
    fetchAllAttendeesData()
  }, [])

  // 自分のエンカしたいリストを取得
  useEffect(() => {
    const loadEncounterWants = async () => {
      if (user?.id) {
        const [wants, wantedBy] = await Promise.all([
          getMyEncounterWants(user.id),
          getWhoWantsMe(user.id),
        ])
        setEncounterWants(wants)
        setEncounterWantedBy(wantedBy)
      } else {
        setEncounterWants([])
        setEncounterWantedBy([])
      }
    }
    loadEncounterWants()
  }, [user])

  // エンカウントオンボーディング: encounter_policy が未設定のときモーダル表示
  useEffect(() => {
    if (user && profile && (profile.encounter_policy == null) && !loading) {
      setShowEncounterOnboarding(true)
    }
  }, [user, profile, loading])

  // エンカウントオンボーディングの選択処理
  const handleEncounterOnboardingSelect = async (policy: 'ok' | 'ng') => {
    await updateProfile({ encounter_policy: policy })
    setShowEncounterOnboarding(false)
  }

  // エンカ方針トグル（ok ↔ ng）
  const handleEncounterPolicyToggle = async () => {
    if (!profile) return
    const newPolicy = profile.encounter_policy === 'ok' ? 'ng' : 'ok'
    await updateProfile({ encounter_policy: newPolicy })
  }

  // メタタグ変更ハンドラ
  const handleMetaTagsChange = async (tags: string[]) => {
    await updateProfile({ meta_tags: tags } as any)
  }

  // 推し曲変更ハンドラ
  const handleFavoriteSongChange = async (song: string | null) => {
    await updateProfile({ favorite_song: song } as any)
  }

  // エンカしたいトグルハンドラ
  const handleEncounterWantToggle = async (targetUserId: string) => {
    if (!user?.id) return
    const success = await toggleEncounterWant(user.id, targetUserId)
    if (success) {
      // ローカルステートを楽観的に更新
      setEncounterWants(prev =>
        prev.includes(targetUserId)
          ? prev.filter(id => id !== targetUserId)
          : [...prev, targetUserId]
      )
      setEncounterWantCounts(prev => {
        const current = prev[targetUserId] || 0
        const wasWanted = encounterWants.includes(targetUserId)
        return {
          ...prev,
          [targetUserId]: wasWanted ? Math.max(0, current - 1) : current + 1,
        }
      })
    }
  }

  // 全会場の参加人数を取得
  useEffect(() => {
    const loadVenueAttendanceCounts = async () => {
      const venueIds = venues.map(v => v.id)
      const counts = await getAllVenueAttendanceCounts(venueIds)
      setVenueAttendanceCounts(counts)
    }
    loadVenueAttendanceCounts()
  }, [])

  // 全体コメントを取得
  useEffect(() => {
    const loadGlobalComments = async () => {
      const comments = await getGlobalComments()
      // ユーザーごとの最新コメントをマップに格納
      const commentsMap: CommentMap = {}
      comments.forEach(comment => {
        if (!commentsMap[comment.user_id]) {
          commentsMap[comment.user_id] = comment
        }
      })
      setGlobalComments(commentsMap)
    }
    loadGlobalComments()
  }, [])

  // コメント投稿後に再取得
  const handleCommentPosted = async () => {
    const comments = await getGlobalComments()
    const commentsMap: CommentMap = {}
    comments.forEach(comment => {
      if (!commentsMap[comment.user_id]) {
        commentsMap[comment.user_id] = comment
      }
    })
    setGlobalComments(commentsMap)
  }

  // 選択した会場数を取得（ログイン時はSupabaseから、未ログイン時はローカルストレージから）
  const getSelectedVenuesCount = () => {
    if (user) {
      // ログイン時はSupabaseから取得したデータを使用
      return selectedVenuesFromDB.length
    }
    // 未ログイン時はローカルストレージから取得
    if (typeof window === 'undefined') return 0
    const saved = localStorage.getItem('reolmap_selected_venues')
    if (saved) {
      try {
        return JSON.parse(saved).length
      } catch (error) {
        return 0
      }
    }
    return 0
  }

  // 選択した会場IDリストを取得（ログイン時はSupabaseから、未ログイン時はローカルストレージから）
  const getSelectedVenues = (): string[] => {
    if (user) {
      // ログイン時はSupabaseから取得したデータを使用
      return selectedVenuesFromDB
    }
    // 未ログイン時はローカルストレージから取得
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('reolmap_selected_venues')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        return []
      }
    }
    return []
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // コンテンツは常に表示し、ヘッダーでログイン状態を管理

  const formatDate = (dateString: string): FormattedDate => {
    const date = new Date(dateString)
    const daysOfWeek = t('dateTime.daysOfWeek', { returnObjects: true }) as string[]
    return {
      month: date.getMonth() + 1,
      day: date.getDate(),
      dayOfWeek: daysOfWeek[date.getDay()],
    }
  }

  // ユーザー表示名の取得
  const getUserDisplayName = (): string | null => {
    if (profile?.full_name) return profile.full_name
    if (profile?.display_name) return profile.display_name
    if (profile?.username) return profile.username
    if (user?.email) return user.email.split('@')[0]
    return null
  }

  return (
    <div className="min-h-screen bg-transparent m-0 p-0">
      <BijigakuHeader
        onOpenProfileMenu={() => setIsProfileMenuOpen(true)}
        onOpenHelpGuide={() => setIsHelpGuideOpen(true)}
      />

      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-6">
        {/* 統計カード・カウントダウン */}
        <StatsOverview
          totalAttendees={totalAttendees}
          userDisplayName={getUserDisplayName()}
          selectedVenuesCount={getSelectedVenuesCount()}
          currentUserId={user?.id}
          onOpenVenueSelector={() => setShowVenueSelector(true)}
        />

        {/* Reolファンタイプ診断バナー */}
        <a
          href="/quiz/reol-type/"
          className="block group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="relative bg-gradient-to-r from-[#1a1040] via-[#2d1b69] to-[#1a1040] p-6 sm:p-8">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl sm:text-3xl">🎭</span>
                  <span className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300">
                    Reolファンタイプ診断
                  </span>
                </div>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                  全20問の質問であなたのReolファンタイプを診断！
                </p>
              </div>
              <div className="flex-shrink-0 ml-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="relative mt-3 pt-3 border-t border-white/10">
              <span className="text-xs text-white/40">所要時間約2分 ・ 16タイプ診断</span>
            </div>
          </div>
        </a>

        {/* ツアー日程 */}
        <TourTimeline
          venues={venues}
          venueAttendanceCounts={venueAttendanceCounts}
          getPrefectureName={getPrefectureName}
          selectedVenues={getSelectedVenues()}
          userDisplayName={getUserDisplayName()}
        />

        {/* SNSシェア */}
        <ShareButton
          venues={venues}
          selectedVenues={getSelectedVenues()}
          getPrefectureName={getPrefectureName}
          encounterPolicy={profile?.encounter_policy ?? null}
        />

        {/* 参加者一覧 */}
        <AttendeeSection
          allAttendees={allAttendees}
          attendeeVenues={attendeeVenues}
          attendeeEncounters={attendeeEncounters}
          globalComments={globalComments}
          currentUserVenues={getSelectedVenues()}
          currentUserId={user?.id}
          currentUserEncounterPolicy={profile?.encounter_policy ?? null}
          currentUserMetaTags={(profile as any)?.meta_tags ?? []}
          currentUserFavoriteSong={(profile as any)?.favorite_song ?? null}
          onEncounterPolicyToggle={handleEncounterPolicyToggle}
          onMetaTagsChange={handleMetaTagsChange}
          onFavoriteSongChange={handleFavoriteSongChange}
          encounterWants={encounterWants}
          encounterWantedBy={encounterWantedBy}
          encounterWantCounts={encounterWantCounts}
          onEncounterWantToggle={handleEncounterWantToggle}
          onCommentPosted={handleCommentPosted}
        />

        {/* コラム */}
        <ArticleSection />

        {/* 会場別参加者数グラフ */}
        <VenueAttendanceChart
          venues={venues}
          venueAttendanceCounts={venueAttendanceCounts}
          getPrefectureName={getPrefectureName}
        />

        {/* !Legit バナーリンク */}
        <a
          href="/"
          className="block group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="relative bg-gradient-to-r from-[#27489b] via-[#1a3a7a] to-[#27489b] p-6 sm:p-8">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-icon text-2xl sm:text-3xl text-[#D2AF57] tracking-wide drop-shadow-md">
                    !Legit
                  </span>
                  <span className="text-xs sm:text-sm text-white/60">
                    Reol Unofficial Fansite
                  </span>
                </div>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                  Discography・ライヴ情報・聖地巡礼ガイドなどの情報を集約
                </p>
              </div>
              <div className="flex-shrink-0 ml-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#D2AF57]/20 flex items-center justify-center group-hover:bg-[#D2AF57]/30 transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#D2AF57] group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="relative mt-3 pt-3 border-t border-white/10">
              <span className="text-xs text-white/40">reol.twilightea.com</span>
            </div>
          </div>
        </a>
      </div>

      {/* プロフィールサイドメニュー */}
      <ProfileSideMenu
        isOpen={isProfileMenuOpen}
        onClose={() => setIsProfileMenuOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQRCode={() => setIsQRCodeOpen(true)}
        onOpenPasswordSetup={() => setIsPasswordSetupOpen(true)}
        onOpenChangeId={() => setIsChangeIdOpen(true)}
        onOpenDeleteAccount={() => setIsDeleteAccountOpen(true)}
        onOpenHelpGuide={() => setIsHelpGuideOpen(true)}
      />

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* パスワード設定モーダル */}
      {isPasswordSetupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <PasswordSetup onClose={() => setIsPasswordSetupOpen(false)} />
          </div>
        </div>
      )}

      {/* X QRコードモーダル */}
      {isQRCodeOpen && user && (
        <XAccountQRCode
          userId={user.id}
          onClose={() => setIsQRCodeOpen(false)}
        />
      )}

      {/* ID変更モーダル */}
      {isChangeIdOpen && (
        <ChangeUserId
          onClose={() => setIsChangeIdOpen(false)}
        />
      )}

      {/* アカウント削除モーダル */}
      {isDeleteAccountOpen && (
        <DeleteAccount
          onClose={() => setIsDeleteAccountOpen(false)}
        />
      )}

      {/* 会場設定モーダル */}
      <VenueSelectorModal
        isOpen={showVenueSelector}
        onClose={() => setShowVenueSelector(false)}
      />

      {/* 使い方ガイドモーダル */}
      <HelpGuideModal
        isOpen={isHelpGuideOpen}
        onClose={() => setIsHelpGuideOpen(false)}
      />

      {/* エンカウントオンボーディングモーダル */}
      <EncounterOnboardingModal
        isOpen={showEncounterOnboarding}
        onSelect={handleEncounterOnboardingSelect}
      />
    </div>
  )
}

// メインコンポーネント：AuthProviderとLanguageProviderでラップ
const ReolMapLayout: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ReolMapContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: COLORS.TOAST_BG,
              color: COLORS.TOAST_TEXT,
            },
          }}
        />
      </AuthProvider>
    </LanguageProvider>
  )
}

export default ReolMapLayout