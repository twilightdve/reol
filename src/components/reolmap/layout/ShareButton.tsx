/**
 * ShareButton - SNSシェアカード
 * 
 * 参加予定会場をタイムライン風にプレビューし、Canvas APIで画像を直接描画して書き出す。
 * html2canvasはCSS解釈の差異でドット位置がずれるため、Canvas 2D APIで
 * ピクセル単位の正確な描画を行う。
 */
import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Share2, Download } from 'lucide-react'
import { type Venue } from '../../../data/venues'
import { getVenueGradient } from '../../../utils/venueGradient'

interface ShareButtonProps {
  venues: Venue[]
  selectedVenues: string[]
  getPrefectureName: (prefecture: string) => string
  encounterPolicy?: 'ok' | 'ng' | null
}

// ====== Canvas描画定数 ======
const SCALE = 2 // Retina対応
const CARD_PADDING = 24
const ROW_HEIGHT = 26
const DOT_RADIUS = 5
const DOT_X = 10 // ドット中心X
const DATE_X = 15 // 日付テキスト開始X（ドット右端と同じ）
const DATE_WIDTH = 62
const NAME_X = DATE_X + DATE_WIDTH + 4 // 会場名開始X
const LINE_X = DOT_X // 縦線X = ドット中心

const ShareButton: React.FC<ShareButtonProps> = ({
  venues,
  selectedVenues,
  getPrefectureName,
  encounterPolicy,
}) => {
  const { t } = useTranslation('common')
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const selectedVenueData = useMemo(() => {
    return venues
      .filter(v => selectedVenues.includes(v.id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [venues, selectedVenues])

  const shareText = useMemo(() => {
    const venueLines = selectedVenueData.map(v => {
      const date = new Date(v.date)
      return `📍${date.getMonth() + 1}/${date.getDate()} ${v.name}`
    })
    const encounterLine = encounterPolicy === 'ok' ? `☕ ${t('encounter.okBadge', { defaultValue: 'エンカOK' })}` : ''
    return [
      `🎤 Reol Oneman Live 2026 「美辞学」`,
      t('share.showsAttending', '{{count}}公演 参加予定！', { count: selectedVenueData.length }),
      ...(encounterLine ? [encounterLine] : []),
      '',
      ...venueLines,
      '',
      t('share.hashtags', '#Reol #美辞学 #美辞学ナビ'),
    ].join('\n')
  }, [selectedVenueData, t, encounterPolicy])

  const shareUrl = 'https://reol.twilightea.com/bijigaku-navi/'

  // グラデーションから色を抽出
  const getColor = (venue: Venue): string => {
    const gradient = getVenueGradient(venue)
    const match = gradient.match(/#[0-9a-fA-F]{6}/g)
    return match ? match[0] : '#977c30'
  }

  // Canvas に描画する関数
  const drawCard = useCallback((canvas: HTMLCanvasElement, scale: number) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isEn = t('share.appName') === 'Bijigaku Navi'
    const daysOfWeek = isEn
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['日', '月', '火', '水', '木', '金', '土']

    const dateWidth = isEn ? 78 : DATE_WIDTH
    const nameX = DATE_X + dateWidth + 4

    // カードサイズ計算
    const headerHeight = 60
    const timelineTopMargin = 8
    const timelineHeight = selectedVenueData.length * ROW_HEIGHT
    const footerHeight = 40
    const cardWidth = 380
    const cardHeight = CARD_PADDING + headerHeight + timelineTopMargin + timelineHeight + footerHeight + CARD_PADDING

    canvas.width = cardWidth * scale
    canvas.height = cardHeight * scale
    ctx.scale(scale, scale)

    // 背景（美辞学メインビジュアル風 — 色と白の波状レイヤー交互）
    // ベースクリーム
    ctx.globalAlpha = 1.0
    ctx.fillStyle = '#d8d0b8'
    ctx.fillRect(0, 0, cardWidth, cardHeight)

    // 波状バンドの色定義（色→白→色→白…の交互）
    const bandDefs = [
      { color: '#c4a060', alpha: 0.55 },  // アンバー
      { color: '#f0ece0', alpha: 0.70 },  // 白（暖）
      { color: '#8cbcae', alpha: 0.60 },  // ティール
      { color: '#f5f2eb', alpha: 0.75 },  // 白
      { color: '#b5c4a8', alpha: 0.55 },  // セージ
      { color: '#f0ece0', alpha: 0.70 },  // 白（暖）
      { color: '#98a88c', alpha: 0.55 },  // モス
      { color: '#f5f2eb', alpha: 0.75 },  // 白
      { color: '#c8a870', alpha: 0.50 },  // ウォーム
      { color: '#f0ece0', alpha: 0.70 },  // 白（暖）
      { color: '#8cbcae', alpha: 0.55 },  // ティール
      { color: '#f5f2eb', alpha: 0.75 },  // 白
      { color: '#b89868', alpha: 0.50 },  // アンバー（濃）
      { color: '#f0ece0', alpha: 0.65 },  // 白（暖）
      { color: '#96bfac', alpha: 0.55 },  // ミント
      { color: '#f5f2eb', alpha: 0.72 },  // 白
      { color: '#c0a878', alpha: 0.48 },  // ウォーム（淡）
      { color: '#f0ece0', alpha: 0.68 },  // 白（暖）
      { color: '#a8c4b0', alpha: 0.52 },  // セージ（淡）
      { color: '#f5f2eb', alpha: 0.72 },  // 白
      { color: '#b0a070', alpha: 0.50 },  // サンド
      { color: '#f0ece0', alpha: 0.68 },  // 白（暖）
      { color: '#90b8a4', alpha: 0.54 },  // ティール（淡）
      { color: '#f5f2eb', alpha: 0.70 },  // 白
      { color: '#c4a868', alpha: 0.48 },  // ゴールド
      { color: '#f0ece0', alpha: 0.70 },  // 白（暖）
      { color: '#a0b498', alpha: 0.52 },  // オリーブ
      { color: '#f5f2eb', alpha: 0.72 },  // 白
      { color: '#bca468', alpha: 0.50 },  // ハニー
      { color: '#f0ece0', alpha: 0.68 },  // 白（暖）
      { color: '#88b0a0', alpha: 0.54 },  // ジェイド
      { color: '#f5f2eb', alpha: 0.72 },  // 白
      { color: '#c8b078', alpha: 0.48 },  // キャメル
      { color: '#f0ece0', alpha: 0.68 },  // 白（暖）
      { color: '#9cb89c', alpha: 0.52 },  // ピスタチオ
      { color: '#f5f2eb', alpha: 0.70 },  // 白
      { color: '#b8a060', alpha: 0.50 },  // マスタード
      { color: '#f0ece0', alpha: 0.68 },  // 白（暖）
      { color: '#94c0ac', alpha: 0.54 },  // アクア
      { color: '#f5f2eb', alpha: 0.70 },  // 白
    ]

    // 波の境界線を事前計算（全バンド同周期、位相はランダム）
    const numBands = bandDefs.length
    const bandWidth = cardWidth / (numBands - 2)
    const waveFreq = 0.009
    const waveAmp = 16

    const boundaries: number[][] = []
    for (let i = 0; i <= numBands; i++) {
      const baseX = (i - 1) * bandWidth
      const phase = Math.random() * Math.PI * 2
      const ampVar = waveAmp * (0.85 + Math.random() * 0.3)
      const freqVar = waveFreq * (0.92 + Math.random() * 0.16)
      const points: number[] = []
      for (let y = 0; y <= cardHeight; y++) {
        points.push(baseX + Math.sin(y * freqVar + phase) * ampVar)
      }
      boundaries.push(points)
    }

    // 各バンドを隣接する波境界の間に描画
    for (let i = 0; i < numBands; i++) {
      const left = boundaries[i]
      const right = boundaries[i + 1]
      const { color, alpha } = bandDefs[i]

      ctx.globalAlpha = alpha
      ctx.fillStyle = color
      ctx.beginPath()

      // 左境界（上→下）
      for (let y = 0; y <= cardHeight; y++) {
        if (y === 0) ctx.moveTo(left[y], y)
        else ctx.lineTo(left[y], y)
      }
      // 右境界（下→上）
      for (let y = cardHeight; y >= 0; y--) {
        ctx.lineTo(right[y], y)
      }
      ctx.closePath()
      ctx.fill()
    }

    // 全体を薄い白ヴェールで包む（ヴィンテージ感）
    ctx.globalAlpha = 0.06
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, cardWidth, cardHeight)

    // alphaをリセット
    ctx.globalAlpha = 1.0

    // ====== ヘッダー ======
    const headerY = CARD_PADDING
    // テキストシャドウ設定
    ctx.shadowColor = 'rgba(255,255,255,0.8)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 1
    // タイトル
    ctx.fillStyle = '#2a2418'
    ctx.font = `bold 17px -apple-system, "Hiragino Sans", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🎤 Reol Oneman Live 2026 「美辞学」', cardWidth / 2, headerY + 18)

    // サブタイトル + エンカバッジ（インライン）
    const subtitleText = t('share.showsAttending', '{{count}}公演 参加予定！', { count: selectedVenueData.length })
    ctx.fillStyle = 'rgba(42,36,24,0.65)'
    ctx.font = `500 13px -apple-system, "Hiragino Sans", sans-serif`

    if (encounterPolicy === 'ok') {
      const isOk = true
      const badgeLabel = isEn ? '☕ Encounter OK' : '☕ エンカOK'

      // サブタイトル幅を測定
      const subtitleWidth = ctx.measureText(subtitleText).width
      ctx.font = `bold 11px -apple-system, "Hiragino Sans", sans-serif`
      const badgeTextWidth = ctx.measureText(badgeLabel).width
      const badgePadX = 7
      const badgeH = 16
      const badgeW = badgeTextWidth + badgePadX * 2
      const gap = 6
      const totalWidth = subtitleWidth + gap + badgeW
      const startX = (cardWidth - totalWidth) / 2
      const subCenterY = headerY + 44

      // サブタイトル描画
      ctx.fillStyle = 'rgba(42,36,24,0.65)'
      ctx.font = `500 13px -apple-system, "Hiragino Sans", sans-serif`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(subtitleText, startX, subCenterY)

      // バッジ背景（角丸）
      const badgeX = startX + subtitleWidth + gap
      const badgeY = subCenterY - badgeH / 2
      const radius = badgeH / 2
      ctx.beginPath()
      ctx.moveTo(badgeX + radius, badgeY)
      ctx.lineTo(badgeX + badgeW - radius, badgeY)
      ctx.arc(badgeX + badgeW - radius, badgeY + radius, radius, -Math.PI / 2, Math.PI / 2)
      ctx.lineTo(badgeX + radius, badgeY + badgeH)
      ctx.arc(badgeX + radius, badgeY + radius, radius, Math.PI / 2, -Math.PI / 2)
      ctx.closePath()
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'
      ctx.fill()

      // バッジテキスト
      ctx.fillStyle = '#047857'
      ctx.font = `bold 11px -apple-system, "Hiragino Sans", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(badgeLabel, badgeX + badgeW / 2, subCenterY)
    } else {
      ctx.textAlign = 'center'
      ctx.fillText(subtitleText, cardWidth / 2, headerY + 44)
    }

    // ====== タイムライン ======
    const timelineStartY = headerY + headerHeight + timelineTopMargin

    // 縦線（最初のドット中心 〜 最後のドット中心）
    const firstDotCenterY = timelineStartY + ROW_HEIGHT / 2
    const lastDotCenterY = timelineStartY + (selectedVenueData.length - 1) * ROW_HEIGHT + ROW_HEIGHT / 2
    ctx.strokeStyle = 'rgba(42,36,24,0.18)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(CARD_PADDING + LINE_X, firstDotCenterY)
    ctx.lineTo(CARD_PADDING + LINE_X, lastDotCenterY)
    ctx.stroke()

    // 各行
    selectedVenueData.forEach((venue, index) => {
      const rowY = timelineStartY + index * ROW_HEIGHT
      const centerY = rowY + ROW_HEIGHT / 2
      const date = new Date(venue.date)
      const color = getColor(venue)

      // ドット
      ctx.beginPath()
      ctx.arc(CARD_PADDING + DOT_X, centerY, DOT_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // 日付テキスト
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}(${daysOfWeek[date.getDay()]})`
      ctx.fillStyle = 'rgba(42,36,24,0.72)'
      ctx.font = `600 12px -apple-system, "Hiragino Sans", sans-serif`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(dateStr, CARD_PADDING + DATE_X + dateWidth, centerY)

      // 会場名
      ctx.fillStyle = '#2a2418'
      ctx.font = `500 13px -apple-system, "Hiragino Sans", sans-serif`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(venue.name, CARD_PADDING + nameX, centerY)
    })

    // ====== フッター ======
    const footerY = timelineStartY + timelineHeight + 12
    // 区切り線
    ctx.strokeStyle = 'rgba(42,36,24,0.15)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(CARD_PADDING, footerY)
    ctx.lineTo(cardWidth - CARD_PADDING, footerY)
    ctx.stroke()

    // ハッシュタグ
    ctx.fillStyle = 'rgba(42,36,24,0.5)'
    ctx.font = `400 11px -apple-system, "Hiragino Sans", sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(t('share.hashtags', '#Reol #美辞学 #美辞学ナビ'), CARD_PADDING, footerY + 18)

    ctx.textAlign = 'right'
    ctx.fillText(t('share.appName', '美辞学ナビ'), cardWidth - CARD_PADDING, footerY + 18)

    // シャドウをリセット
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }, [selectedVenueData, getColor, t, encounterPolicy])

  // プレビュー描画
  useEffect(() => {
    if (previewCanvasRef.current && selectedVenueData.length > 0) {
      drawCard(previewCanvasRef.current, SCALE)
    }
  }, [drawCard, selectedVenueData])

  // 画像をダウンロード
  const handleDownloadImage = useCallback(async () => {
    setIsGenerating(true)
    try {
      const canvas = document.createElement('canvas')
      drawCard(canvas, SCALE)
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'bijigaku-navi-share.png'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 'image/png', 1.0)
    } finally {
      setIsGenerating(false)
    }
  }, [drawCard])

  // テキストコピー
  const handleCopyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (e) {
      // フォールバック
    }
  }, [shareText])

  if (selectedVenues.length === 0) return null

  return (
    <div id="share-section" className="space-y-5">
      <div className="px-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('share.sectionTitle', 'シェアカード')}
        </h3>
      </div>

      <div className="mx-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Canvas プレビュー */}
        <canvas
          ref={previewCanvasRef}
          className="w-full h-auto block"
        />

        {/* シェアボタン */}
        <div className="p-4 flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {t('share.saveImage', '画像を保存')}
          </button>

          <button
            onClick={handleCopyText}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              isCopied
                ? 'bg-emerald-500 text-white scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {isCopied ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t('share.copied', 'コピーしました')}
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                {t('share.copyText', 'テキストをコピー')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShareButton
