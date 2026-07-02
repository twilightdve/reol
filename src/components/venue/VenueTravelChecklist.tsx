import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { 
  getVenueChecklist, 
  upsertVenueChecklist,
  type VenueChecklist 
} from '../../services/checklistService'
import { CheckCircle2, Circle, FileText, Save, AlertCircle, HelpCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Venue } from '../../data/venues'
import { getPrefectureGradient } from '../../data/prefectureColors'
import { DEFAULT_GRADIENT } from '../../data/venues/gradients'
import LoginButton from '../reolmap/auth/LoginButton'

interface VenueTravelChecklistProps {
  venueId: string
  venue: Venue
}

const MAX_NOTES_LENGTH = 140

export const VenueTravelChecklist: React.FC<VenueTravelChecklistProps> = ({ venueId, venue }) => {
  const { t } = useTranslation('checklist')
  // 会場のグラデーション色を取得
  const getGradientColors = () => {
    if (venue.gradient) {
      return { from: venue.gradient.from, to: venue.gradient.to }
    }
    const prefectureGradient = getPrefectureGradient(venue.location.prefecture)
    if (prefectureGradient !== 'rgba(216, 217, 195, 0.9)') {
      // 都道府県カラーから色を抽出（先頭の色を使用）
      const match = prefectureGradient.match(/linear-gradient\([^,]+,\s*([^,]+)/)
      if (match) {
        return { from: match[1].trim(), to: match[1].trim() }
      }
    }
    return { from: DEFAULT_GRADIENT.from, to: DEFAULT_GRADIENT.from }
  }
  const gradientColors = getGradientColors()
  const { user, profile } = useAuth()
  const [checklist, setChecklist] = useState<VenueChecklist | null>(null)
  const [localChecklist, setLocalChecklist] = useState<VenueChecklist | null>(null)
  const [notes, setNotes] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showBelongingsHelp, setShowBelongingsHelp] = useState(false)
  const [showDayBeforeHelp, setShowDayBeforeHelp] = useState(false)

  // チェックリストを読み込み
  useEffect(() => {
    const loadChecklist = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      const data = await getVenueChecklist(user.id, venueId)
      const defaultChecklist = {
        user_id: user.id,
        venue_id: venueId,
        ticket_checked: false,
        transportation_checked: false,
        accommodation_checked: false,
        schedule_checked: false,
        companion_checked: false,
        goods_checked: false,
        belongings_checked: false,
        day_before_checked: false,
        budget_checked: false,
        sightseeing_checked: false,
        weather_checked: false,
        notes: '',
      }
      
      const checklistData = data || defaultChecklist
      setChecklist(checklistData)
      setLocalChecklist(checklistData)
      setNotes(checklistData.notes || '')
      setLoading(false)
    }

    loadChecklist()
  }, [user, venueId])

  // チェック項目をローカルで更新
  const handleCheckItem = (
    field: keyof Pick<VenueChecklist, 'ticket_checked' | 'transportation_checked' | 'accommodation_checked' | 'schedule_checked' | 'companion_checked' | 'goods_checked' | 'belongings_checked' | 'day_before_checked' | 'budget_checked' | 'sightseeing_checked' | 'weather_checked'>,
    checked: boolean
  ) => {
    if (!user?.id) return

    setLocalChecklist(prev => prev ? { ...prev, [field]: checked } : null)
    setHasChanges(true)
    setSaved(false)
  }

  // メモの変更を監視
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value.slice(0, MAX_NOTES_LENGTH)
    setNotes(newValue)
    setHasChanges(true)
    setSaved(false)
  }

  // チェックリストとメモを一括保存
  const handleSave = async () => {
    if (!user?.id || !localChecklist) return

    setSaving(true)
    
    const checklistToSave = {
      ...localChecklist,
      notes,
    }
    
    const result = await upsertVenueChecklist(checklistToSave)
    
    if (result) {
      setChecklist(result)
      setLocalChecklist(result)
      setHasChanges(false)
      setSaved(true)
      toast.success(t('memo.saved'))
      
      // 3秒後に「保存済み」表示をリセット
      setTimeout(() => setSaved(false), 3000)
    } else {
      toast.error('保存に失敗しました')
    }
    setSaving(false)
  }

  // 未ログイン時
  if (!user) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              旅行計画チェックリスト
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              ログインすると、交通手段やホテル、チケットの確保状況などをチェックできます
            </p>
            <LoginButton compact />
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const checkItems = [
    { 
      field: 'ticket_checked' as const, 
      label: t('items.ticket'),
      description: t('items.ticket')
    },
    { 
      field: 'transportation_checked' as const, 
      label: t('items.transportation'),
      description: t('items.transportation')
    },
    { 
      field: 'accommodation_checked' as const, 
      label: t('items.accommodation'),
      description: t('items.accommodation')
    },
    { 
      field: 'schedule_checked' as const, 
      label: t('items.schedule'),
      description: t('items.schedule')
    },
    { 
      field: 'companion_checked' as const, 
      label: t('items.companion'),
      description: t('items.companion')
    },
    { 
      field: 'goods_checked' as const, 
      label: t('items.merchandise'),
      description: t('items.merchandise')
    },
    { 
      field: 'belongings_checked' as const, 
      label: t('items.luggage'),
      description: t('items.luggage'),
      hasHelp: true
    },
    { 
      field: 'day_before_checked' as const, 
      label: t('items.dayBefore'),
      description: t('items.dayBefore'),
      hasHelp: true
    },
    { 
      field: 'budget_checked' as const, 
      label: t('items.budget'),
      description: t('items.budget')
    },
    { 
      field: 'sightseeing_checked' as const, 
      label: t('items.sightseeing'),
      description: t('items.sightseeing')
    },
    { 
      field: 'weather_checked' as const, 
      label: t('items.weather'),
      description: t('items.weather')
    },
  ]

  // 持ち物リスト（翻訳JSONから取得）
  const belongingsItems = [
    t('luggageList.ticket'),
    t('luggageList.id'),
    t('luggageList.phone'),
    t('luggageList.wallet'),
    t('luggageList.towel'),
    t('luggageList.drink'),
    t('luggageList.mask'),
    t('luggageList.medicine'),
    t('luggageList.rainwear'),
    t('luggageList.baggage'),
    t('luggageList.camera'),
  ]

  // 前日確認リスト（翻訳JSONから取得）
  const dayBeforeItems = [
    t('dayBeforeList.ticketCheck'),
    t('dayBeforeList.transportCheck'),
    t('dayBeforeList.weatherCheck'),
    t('dayBeforeList.venueCheck'),
    t('dayBeforeList.luggageCheck'),
    t('dayBeforeList.phoneCharge'),
    t('dayBeforeList.cashCheck'),
    t('dayBeforeList.clothingCheck'),
    t('dayBeforeList.accommodationCheck'),
    t('dayBeforeList.alarmSet'),
    t('dayBeforeList.sleepEarly'),
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {t('title')}
        </h3>
      </div>

      {/* チェック項目 */}
      <div className="space-y-0.5">
        {checkItems.map(item => (
          <div key={item.field} className="relative">
            <button
              onClick={() => handleCheckItem(item.field, !localChecklist?.[item.field])}
              disabled={saving}
              className="w-full flex items-start gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {localChecklist?.[item.field] ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className={`text-sm font-medium flex items-center gap-1.5 ${
                  localChecklist?.[item.field] 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {item.label}
                  {item.hasHelp && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        if (item.field === 'belongings_checked') {
                          setShowBelongingsHelp(!showBelongingsHelp)
                        } else if (item.field === 'day_before_checked') {
                          setShowDayBeforeHelp(!showDayBeforeHelp)
                        }
                      }}
                      className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.description}
                </div>
              </div>
            </button>

            {/* 持ち物リストヘルプ */}
            {item.field === 'belongings_checked' && showBelongingsHelp && (
              <div className="mt-2 ml-6 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start justify-between mb-1.5">
                  <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                    遠征持ち物リスト
                  </h4>
                  <div
                    onClick={() => setShowBelongingsHelp(false)}
                    className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800 rounded cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <ul className="text-[11px] text-blue-800 dark:text-blue-200 space-y-0.5">
                  {belongingsItems.map((belongingItem, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      <span>{belongingItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 前日確認リストヘルプ */}
            {item.field === 'day_before_checked' && showDayBeforeHelp && (
              <div className="mt-2 ml-6 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start justify-between mb-1.5">
                  <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                    前日確認リスト
                  </h4>
                  <div
                    onClick={() => setShowDayBeforeHelp(false)}
                    className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800 rounded cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <ul className="text-[11px] text-blue-800 dark:text-blue-200 space-y-0.5">
                  {dayBeforeItems.map((dayBeforeItem, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      <span>{dayBeforeItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* メモ欄 */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('memo.title')} ({notes.length}/{MAX_NOTES_LENGTH} {t('memo.characters')})
        </label>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder={t('memo.placeholder')}
          disabled={saving}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          rows={3}
          maxLength={MAX_NOTES_LENGTH}
        />
        
        {/* 注意書き */}
        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs flex items-start gap-2">
          <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <span className="text-amber-800 dark:text-amber-200">
            {t('memo.warning')}
          </span>
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {saving ? t('memo.saving') : saved ? t('memo.saved') : t('memo.save')}
        </button>
      </div>

      {/* 進捗表示 */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{t('progress')}</span>
          <span className="font-semibold" style={{ color: gradientColors.from }}>
            {checkItems.filter(item => localChecklist?.[item.field]).length} / {checkItems.length}
          </span>
        </div>
        <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${(checkItems.filter(item => localChecklist?.[item.field]).length / checkItems.length) * 100}%`,
              background: `linear-gradient(to right, ${gradientColors.from}, ${gradientColors.to})`
            }}
          />
        </div>
      </div>
    </div>
  )
}
