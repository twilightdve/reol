/**
 * 美辞学ナビ レイアウト定数・デザイントークン
 * 
 * マジックナンバーを排除し、一箇所で管理するための定数群
 */

// ==============================
// レイアウト
// ==============================

export const LAYOUT = {
  /** 統計カードの幅 (px) */
  STAT_CARD_WIDTH: 256,
  /** 統計カード間のギャップ */
  STAT_CARD_GAP: '1.5rem',
  /** 統計カード2枚分の幅 (style属性用、ボーダー込み) */
  get STAT_CARDS_WIDTH() {
    return `calc(${this.STAT_CARD_WIDTH}px * 2 + ${this.STAT_CARD_GAP} + 4px)`
  },
  /** 統計カード2枚分の幅 (ボーダーなし) */
  get STAT_CARDS_WIDTH_NO_BORDER() {
    return `calc(${this.STAT_CARD_WIDTH}px * 2 + ${this.STAT_CARD_GAP})`
  },
  /** モーダルの最大高さ */
  MODAL_MAX_HEIGHT: '90vh',
  /** モーダルヘッダーの高さ (px) */
  MODAL_HEADER_HEIGHT: 80,
  /** モーダル本体の最大高さ */
  get MODAL_BODY_MAX_HEIGHT() {
    return `calc(${this.MODAL_MAX_HEIGHT} - ${this.MODAL_HEADER_HEIGHT}px)`
  },
} as const

// ==============================
// カラー
// ==============================

export const COLORS = {
  /** 美辞学ナビ ヘッダー背景色 */
  HEADER_BG: '#977c30',
  /** カード・セクション背景色（和紙風） */
  CARD_BG: 'rgba(216, 217, 195, 0.9)',
  /** テキスト影（白文字の可読性向上） */
  TEXT_SHADOW: '1px 1px 2px rgba(0, 0, 0, 0.5)',
  /** テキスト影（見出し用、強め） */
  TEXT_SHADOW_STRONG: '2px 2px 4px rgba(0, 0, 0, 0.6)',
  /** テキスト影（アイコン用） */
  ICON_SHADOW: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5))',
  /** Toaster 背景色 */
  TOAST_BG: '#363636',
  /** Toaster テキスト色 */
  TOAST_TEXT: '#fff',
} as const

// ==============================
// セクションテーマ（VenueDetail用）
// ==============================

export const SECTION_THEMES = {
  access: {
    gradient: 'linear-gradient(to bottom, #0284c7 0%, #7dd3fc 100%)',
    borderColor: '#0284c7',
    textColor: '#ffffff',
  },
  parking: {
    gradient: 'linear-gradient(to bottom, #52525b 0%, #18181b 100%)',
    borderColor: '#3f3f46',
    textColor: '#ffffff',
    bodyTextColor: '#e5e7eb',
  },
  gourmet: {
    gradient: 'linear-gradient(to bottom, #fdba74 0%, #fb923c 100%)',
    borderColor: '#fb923c',
    textColor: '#111827',
  },
  hotel: {
    gradient: 'linear-gradient(to bottom, #1e3a5f 0%, #0a0e1a 100%)',
    borderColor: '#334155',
    innerBorderColor: '#2d3748',
    titleColor: '#fbbf24',
    textColor: '#ffffff',
  },
} as const

export type SectionThemeKey = keyof typeof SECTION_THEMES

// ==============================
// 会場タイプ判定
// ==============================

/** 会場タイプを判定する */
export const getVenueType = (venueName: string, capacity: number): 'hall' | 'livehouse' => {
  // 横浜ベイホールは例外的にライブハウス扱い
  if (venueName.includes('BAYHALL') || venueName.includes('BayHall') || venueName.includes('ベイホール')) {
    return 'livehouse'
  }
  if (capacity >= 800 || venueName.includes('ホール') || venueName.includes('劇場') || 
      venueName.includes('公会堂') || venueName.includes('会館') || venueName.includes('会議場') ||
      venueName.includes('CUBE') || venueName.includes('アリーナ')) {
    return 'hall'
  }
  return 'livehouse'
}
