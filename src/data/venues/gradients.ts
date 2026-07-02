// 会場のデフォルトグラデーションカラー定義
// DISCOGRAPHYのようなグラデーションカラーシステム

export const DEFAULT_GRADIENT = {
  from: 'rgba(216, 217, 195, 0.9)',  // 現在のデフォルトカラー
  to: 'rgba(216, 217, 195, 0.9)'
}

// 会場ごとのプリセットグラデーション（例）
export const VENUE_GRADIENT_PRESETS = {
  // 暖色系
  sunset: { from: '#ff6b6b', to: '#feca57' },
  fire: { from: '#ee5a6f', to: '#f29263' },
  orange: { from: '#f79d00', to: '#64f38c' },
  
  // 寒色系
  ocean: { from: '#667eea', to: '#764ba2' },
  sky: { from: '#38b6ff', to: '#7dd3fc' },
  purple: { from: '#8b5cf6', to: '#ec4899' },
  
  // 自然系
  forest: { from: '#56ab2f', to: '#a8e063' },
  emerald: { from: '#10b981', to: '#34d399' },
  mint: { from: '#00b4d8', to: '#90e0ef' },
  
  // その他
  gold: { from: '#f9d423', to: '#ff4e50' },
  rose: { from: '#eb3349', to: '#f45c43' },
  lavender: { from: '#c471f5', to: '#fa71cd' },
}
