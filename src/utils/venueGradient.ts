/**
 * 会場グラデーション取得ユーティリティ
 * 
 * ReolMapLayoutとVenueDetailの両方で使われていた
 * getVenueGradient関数を共通化。
 */
import { type Venue } from '../data/venues'
import { getPrefectureGradient } from '../data/prefectureColors'
import { DEFAULT_GRADIENT } from '../data/venues/gradients'
import { PREFECTURE_EN_TO_JA } from '../types/bijigaku'

/**
 * 会場の都道府県ベースのグラデーション背景CSSを取得
 * 
 * 優先順位:
 * 1. 会場個別のgradient設定
 * 2. 都道府県カラー
 * 3. デフォルト単色
 */
export const getVenueGradient = (venue: Venue): string => {
  // 1. 会場個別のグラデーション設定があればそれを優先
  if (venue.gradient) {
    return `linear-gradient(135deg, ${venue.gradient.from}, ${venue.gradient.to})`
  }
  // 2. 都道府県カラーを適用（英語の場合は日本語に変換）
  const prefectureName = PREFECTURE_EN_TO_JA[venue.location.prefecture] || venue.location.prefecture
  const prefectureGradient = getPrefectureGradient(prefectureName)
  if (prefectureGradient !== 'rgba(216, 217, 195, 0.9)') {
    return prefectureGradient
  }
  // 3. デフォルトは単色
  return DEFAULT_GRADIENT.from
}

/**
 * 日本語版の会場データからグラデーションを計算（VenueDetail用）
 * 言語切替でグラデーションが変わらないようにするためjaVenueを使う
 */
export const getVenueGradientByJaVenue = (jaVenue: Venue | undefined): string => {
  if (!jaVenue) return DEFAULT_GRADIENT.from
  return getVenueGradient(jaVenue)
}
