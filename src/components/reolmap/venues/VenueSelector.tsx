import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { getAllVenuesSortedByLocale } from '../../../data/venues'
import { MapPin, Check, Eye, EyeOff, Coffee } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../../lib/supabase'
import { invalidateVenueCache, getUserEncounterVenues, updateVenueEncounter } from '../../../services/venueService'
import LoginButton from '../auth/LoginButton'

const VenueSelector: React.FC = () => {
  const { user, loading, profile, updateProfile } = useAuth()
  const { t, i18n } = useTranslation('common')
  const [selectedVenues, setSelectedVenues] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(true)
  const [encounterVenues, setEncounterVenues] = useState<{ [venueId: string]: boolean | null }>({})

  const venues = getAllVenuesSortedByLocale(i18n.language === 'en' ? 'en' : 'ja')

  // 都道府県名を翻訳
  const getPrefectureName = (prefecture: string) => {
    if (i18n.language === 'en') {
      return t(`prefectures.${prefecture}`, prefecture)
    }
    return prefecture
  }

  useEffect(() => {
    // プライバシー設定を読み込み
    if (profile) {
      setIsPublic(profile.is_public !== false) // デフォルトはtrue
    }

    // ローカルストレージから選択した会場を読み込み
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reolmap_selected_venues')
      if (saved) {
        try {
          setSelectedVenues(JSON.parse(saved))
        } catch (error) {
          console.error('Failed to parse saved venues:', error)
        }
      }
    }

    // ログイン済みの場合はSupabaseからも取得
    const loadUserAttendances = async () => {
      if (user && supabase) {
        try {
          const { data, error } = await supabase
            .from('venue_attendances')
            .select('venue_id')
            .eq('user_id', user.id)

          if (error) {
            console.error('Error loading user attendances:', error)
          } else if (data) {
            const venueIds = data.map(item => item.venue_id)
            setSelectedVenues(venueIds)
            
            // ローカルストレージも更新
            if (typeof window !== 'undefined') {
              localStorage.setItem('reolmap_selected_venues', JSON.stringify(venueIds))
            }
          }

          // エンカ設定も読み込み
          const encounters = await getUserEncounterVenues(user.id)
          setEncounterVenues(encounters)
        } catch (error) {
          console.error('Error in loadUserAttendances:', error)
        }
      }
    }

    loadUserAttendances()
  }, [user, profile])

  const handlePrivacyToggle = async () => {
    const newIsPublic = !isPublic
    setIsPublic(newIsPublic)

    if (user && profile) {
      try {
        await updateProfile({ is_public: newIsPublic })
        toast.success(t('venueSelector.privacyUpdateSuccess', { status: newIsPublic ? t('venueSelector.public') : t('venueSelector.private') }))
      } catch (error) {
        console.error('Failed to update privacy setting:', error)
        toast.error(t('venueSelector.privacyUpdateError'))
        setIsPublic(!newIsPublic) // 元に戻す
      }
    }
  }

  const handleVenueToggle = async (venueId: string) => {
    const isCurrentlySelected = selectedVenues.includes(venueId)
    const newSelectedVenues = isCurrentlySelected
      ? selectedVenues.filter(id => id !== venueId)
      : [...selectedVenues, venueId]
    
    setSelectedVenues(newSelectedVenues)
    
    // ローカルストレージに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('reolmap_selected_venues', JSON.stringify(newSelectedVenues))
    }

    // Supabaseにも保存（ログイン済みの場合）
    if (user && supabase) {
      try {
        // まずプロフィールが存在するか確認・作成
        console.log('Upserting profile:', { userId: user.id, username: user.username })
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            username: user.username,
            full_name: user.username,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (profileError) {
          console.error('Error upserting profile:', profileError)
        } else {
          console.log('Profile upserted successfully:', profileData)
        }

        if (isCurrentlySelected) {
          // 参加表明を削除
          const { error } = await supabase
            .from('venue_attendances')
            .delete()
            .match({ user_id: user.id, venue_id: venueId })
          
          if (error) {
            console.error('Error removing attendance:', error)
            toast.error(t('venueSelector.removeError'))
          } else {
            // キャッシュを無効化
            invalidateVenueCache(venueId, user.id)
            toast.success(t('venueSelector.attendanceRemoved'))
          }
        } else {
          // 参加表明を追加
          console.log('Adding attendance:', { userId: user.id, venueId })
          const { data: attendanceData, error } = await supabase
            .from('venue_attendances')
            .upsert({
              user_id: user.id,
              venue_id: venueId,
              is_public: true
            })
          
          if (error) {
            console.error('Error adding attendance:', error)
            toast.error(t('venueSelector.attendanceError'))
          } else {
            console.log('Attendance added successfully:', attendanceData)
            // キャッシュを無効化
            invalidateVenueCache(venueId, user.id)
            toast.success(t('venueSelector.attendanceAdded'))
          }
        }
      } catch (error) {
        console.error('Error in handleVenueToggle:', error)
        toast.error(t('venueSelector.generalError'))
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 未ログイン警告 */}
      {!user && (
        <div className="mb-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
              {t('venueSelector.loginRequired')}
            </p>
            <LoginButton compact />
          </div>
        </div>
      )}

      {/* プライバシー設定 */}
      {user && (
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {isPublic ? (
              <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {isPublic ? t('venueSelector.publicStatus') : t('venueSelector.privateStatus')}
            </span>
          </div>
          <button
            onClick={handlePrivacyToggle}
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPublic ? t('venueSelector.makePrivate') : t('venueSelector.makePublic')}
          </button>
        </div>
      </div>
      )}

      {/* 会場リスト */}
      <div className="space-y-4">
        {venues.map((venue) => {
          const isSelected = selectedVenues.includes(venue.id)
          const venueDate = new Date(venue.date)
          const isUpcoming = venueDate > new Date()
          
          // デバッグ用: capacityの存在確認
          if (!venue.capacity) {
            console.warn(`Venue ${venue.id} (${venue.name}) has no capacity data`)
          }
          
          return (
            <div
              key={venue.id}
              className={`
                p-5 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
                ${!isUpcoming ? 'opacity-60' : ''}
              `}
              onClick={() => isUpcoming && handleVenueToggle(venue.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${isSelected 
                      ? 'border-emerald-500 bg-emerald-500' 
                      : 'border-gray-300 dark:border-gray-600'
                    }
                  `}>
                    {isSelected && <Check className="h-4 w-4 text-white" />}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {venue.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {getPrefectureName(venue.location.prefecture)} {venue.location.city}
                      </div>
                      <div>
                        {venueDate.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'ja-JP')} {venue.times.start}{t('venueSelector.showStart')}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {!isUpcoming && t('venueSelector.finished')}
                </div>
              </div>

              {/* エンカトグル（選択済みかつログイン済みかつ基本方針設定済み） */}
              {isSelected && user && profile?.encounter_policy && (
                <div
                  className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EncounterVenueToggle
                    defaultPolicy={profile.encounter_policy}
                    venueEncounter={encounterVenues[venue.id] ?? null}
                    onChange={async (value) => {
                      setEncounterVenues(prev => ({ ...prev, [venue.id]: value }))
                      const success = await updateVenueEncounter(user.id, venue.id, value)
                      if (success) {
                        toast.success(t('encounter.venueUpdated', { defaultValue: 'エンカ設定を更新しました' }))
                      } else {
                        // 失敗時は元に戻す
                        const reverted = await getUserEncounterVenues(user.id)
                        setEncounterVenues(reverted)
                        toast.error(t('encounter.venueUpdateError', { defaultValue: 'エンカ設定の更新に失敗しました' }))
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {t('venueSelector.selectedCount', { count: selectedVenues.length })}
      </div>
    </div>
  )
}

/** 会場ごとのエンカOK/NGトグル */
const EncounterVenueToggle: React.FC<{
  defaultPolicy: 'ok' | 'ng'
  venueEncounter: boolean | null
  onChange: (value: boolean | null) => void
}> = ({ defaultPolicy, venueEncounter, onChange }) => {
  const { i18n } = useTranslation()
  const isEn = i18n.language === 'en'

  // 実効値: venue_encounter が null なら defaultPolicy に従う
  const effectiveOk = venueEncounter !== null ? venueEncounter : defaultPolicy === 'ok'
  // venue固有の設定があるか
  const isOverridden = venueEncounter !== null

  const handleToggle = () => {
    if (venueEncounter === null) {
      // 未設定 → デフォルトの逆に設定
      onChange(defaultPolicy === 'ok' ? false : true)
    } else if (venueEncounter === true) {
      // 明示OK → 明示NG
      onChange(false)
    } else {
      // 明示NG → デフォルトに戻す（null）
      onChange(null)
    }
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <Coffee className={`w-4 h-4 flex-shrink-0 ${effectiveOk ? 'text-emerald-500' : 'text-gray-400'}`} />
        <span className={`text-xs font-medium truncate ${effectiveOk ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {effectiveOk
            ? (isEn ? 'Encounter OK' : 'エンカOK')
            : (isEn ? 'Not showing' : '表示しない')
          }
          {isOverridden && (
            <span className="ml-1 text-[10px] text-gray-400 dark:text-gray-500">
              ({isEn ? 'custom' : '個別設定'})
            </span>
          )}
        </span>
      </div>
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          effectiveOk ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
            effectiveOk ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export default VenueSelector