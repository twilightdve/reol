// 都道府県カラー定義
// 公式カラーがある場合はそれを使用し、ない場合は県の特徴的なモチーフから抽出

export interface PrefectureColor {
  prefecture: string
  gradient: {
    from: string
    to: string
  }
  source: 'official' | 'motif'  // 公式カラーか、モチーフからの抽出か
  motif?: string  // モチーフから抽出した場合、そのモチーフを記載
  description?: string  // カラー選定の理由
}

export const PREFECTURE_COLORS: Record<string, PrefectureColor> = {
  '北海道': {
    prefecture: '北海道',
    gradient: { from: '#9370DB', to: '#E6E6FA' },
    source: 'motif',
    motif: '富良野のラベンダー畑',
    description: '富良野のラベンダー畑の紫のグラデーション'
  },
  '青森県': {
    prefecture: '青森県',
    gradient: { from: '#B22222', to: '#FF6B6B' },
    source: 'motif',
    motif: 'りんご',
    description: '特産品のりんごの鮮やかな赤'
  },
  '岩手県': {
    prefecture: '岩手県',
    gradient: { from: '#006400', to: '#90EE90' },
    source: 'motif',
    motif: '北上山地の森林',
    description: '豊かな森林資源を象徴する深緑'
  },
  '宮城県': {
    prefecture: '宮城県',
    gradient: { from: '#008B8B', to: '#87CEEB' },
    source: 'motif',
    motif: '松島の海',
    description: '日本三景・松島の美しい海の色'
  },
  '秋田県': {
    prefecture: '秋田県',
    gradient: { from: '#8B6914', to: '#FFEC8B' },
    source: 'motif',
    motif: '稲穂・あきたこまち',
    description: '黄金色に輝く稲穂、米どころの象徴'
  },
  '山形県': {
    prefecture: '山形県',
    gradient: { from: '#8B0000', to: '#DC143C' },
    source: 'motif',
    motif: 'さくらんぼ',
    description: '特産品のさくらんぼの深い赤'
  },
  '福島県': {
    prefecture: '福島県',
    gradient: { from: '#FF69B4', to: '#FFB6C1' },
    source: 'motif',
    motif: '桃の花',
    description: '桃の産地として有名な福島の桃の花のピンク'
  },
  '茨城県': {
    prefecture: '茨城県',
    gradient: { from: '#4B0082', to: '#E6E6FA' },
    source: 'motif',
    motif: '筑波山のつつじ',
    description: '筑波山に咲くつつじの紫'
  },
  '栃木県': {
    prefecture: '栃木県',
    gradient: { from: '#228B22', to: '#90EE90' },
    source: 'motif',
    motif: '那須高原の新緑',
    description: '那須高原の鮮やかな新緑'
  },
  '群馬県': {
    prefecture: '群馬県',
    gradient: { from: '#DC143C', to: '#FF6347' },
    source: 'motif',
    motif: '赤城山・榛名山の紅葉',
    description: '上毛三山の秋の紅葉'
  },
  '埼玉県': {
    prefecture: '埼玉県',
    gradient: { from: '#228B22', to: '#90EE90' },
    source: 'motif',
    motif: '武蔵野の雑木林',
    description: '武蔵野の緑豊かな雑木林'
  },
  '千葉県': {
    prefecture: '千葉県',
    gradient: { from: '#4682B4', to: '#87CEEB' },
    source: 'motif',
    motif: '九十九里浜の海',
    description: '太平洋に面した九十九里浜の海'
  },
  '東京都': {
    prefecture: '東京都',
    gradient: { from: '#DC143C', to: '#FECA57' },
    source: 'motif',
    motif: '都会の夕焼け',
    description: '高層ビル群に映える都会的な夕焼け'
  },
  '神奈川県': {
    prefecture: '神奈川県',
    gradient: { from: '#20B2AA', to: '#87CEEB' },
    source: 'motif',
    motif: '湘南の海・江ノ島',
    description: '湘南の海のターコイズブルー'
  },
  '新潟県': {
    prefecture: '新潟県',
    gradient: { from: '#CD853F', to: '#F5DEB3' },
    source: 'motif',
    motif: 'コシヒカリの稲穂と白米',
    description: '稲穂の色から白米へのグラデーション'
  },
  '富山県': {
    prefecture: '富山県',
    gradient: { from: '#4169E1', to: '#B0E0E6' },
    source: 'motif',
    motif: '立山連峰の雪と空',
    description: '立山連峰の雪景色と青空'
  },
  '石川県': {
    prefecture: '石川県',
    gradient: { from: '#B8860B', to: '#FFD700' },
    source: 'motif',
    motif: '金沢の金箔',
    description: '金箔の産地・金沢の金色'
  },
  '福井県': {
    prefecture: '福井県',
    gradient: { from: '#191970', to: '#87CEEB' },
    source: 'motif',
    motif: '越前海岸',
    description: '日本海の越前海岸の深い青'
  },
  '山梨県': {
    prefecture: '山梨県',
    gradient: { from: '#4B0082', to: '#E6E6FA' },
    source: 'motif',
    motif: 'ぶどう',
    description: '甲州ワインの原料となるぶどうの紫'
  },
  '長野県': {
    prefecture: '長野県',
    gradient: { from: '#228B22', to: '#90EE90' },
    source: 'motif',
    motif: 'アルプスの高原',
    description: '日本アルプスの高原の緑'
  },
  '岐阜県': {
    prefecture: '岐阜県',
    gradient: { from: '#8B0000', to: '#FFA07A' },
    source: 'motif',
    motif: '飛騨高山の紅葉',
    description: '飛騨高山の紅葉の深い赤から明るいオレンジへ'
  },
  '静岡県': {
    prefecture: '静岡県',
    gradient: { from: '#228B22', to: '#90EE90' },
    source: 'motif',
    motif: '茶畑',
    description: '富士山麓に広がる茶畑の緑'
  },
  '愛知県': {
    prefecture: '愛知県',
    gradient: { from: '#B8860B', to: '#FFA500' },
    source: 'motif',
    motif: '名古屋城の金鯱',
    description: '名古屋城のシンボル・金の鯱'
  },
  '三重県': {
    prefecture: '三重県',
    gradient: { from: '#0277BD', to: '#B3E5FC' },
    source: 'motif',
    motif: '伊勢湾',
    description: '伊勢湾の明るい青'
  },
  '滋賀県': {
    prefecture: '滋賀県',
    gradient: { from: '#191970', to: '#B0E0E6' },
    source: 'motif',
    motif: '琵琶湖',
    description: '日本最大の湖・琵琶湖の青'
  },
  '京都府': {
    prefecture: '京都府',
    gradient: { from: '#B8860B', to: '#F0E68C' },
    source: 'motif',
    motif: '金閣寺',
    description: '金閣寺の黄金色と古都の雅'
  },
  '大阪府': {
    prefecture: '大阪府',
    gradient: { from: '#8B4513', to: '#FFA500' },
    source: 'motif',
    motif: 'たこ焼きのソース',
    description: 'たこ焼きのソースの茶色からオレンジへのグラデーション'
  },
  '兵庫県': {
    prefecture: '兵庫県',
    gradient: { from: '#00695C', to: '#80CBC4' },
    source: 'motif',
    motif: '瀬戸内海',
    description: '瀬戸内海の穏やかな青緑'
  },
  '奈良県': {
    prefecture: '奈良県',
    gradient: { from: '#006400', to: '#98FB98' },
    source: 'motif',
    motif: '奈良公園の緑',
    description: '鹿と共生する奈良公園の緑'
  },
  '和歌山県': {
    prefecture: '和歌山県',
    gradient: { from: '#FF8C00', to: '#FFB347' },
    source: 'motif',
    motif: 'みかん',
    description: '特産品のみかんのオレンジ'
  },
  '鳥取県': {
    prefecture: '鳥取県',
    gradient: { from: '#CD853F', to: '#F5DEB3' },
    source: 'motif',
    motif: '鳥取砂丘',
    description: '日本最大級の砂丘のベージュ'
  },
  '島根県': {
    prefecture: '島根県',
    gradient: { from: '#696969', to: '#F0F0F0' },
    source: 'motif',
    motif: '出雲大社・石見銀山',
    description: '銀山の歴史と神聖な銀色'
  },
  '岡山県': {
    prefecture: '岡山県',
    gradient: { from: '#FF69B4', to: '#FFB6C1' },
    source: 'motif',
    motif: '桃',
    description: '桃太郎伝説と桃の産地のピンク'
  },
  '広島県': {
    prefecture: '広島県',
    gradient: { from: '#8B0000', to: '#DC143C' },
    source: 'motif',
    motif: 'もみじ饅頭・厳島神社の鳥居',
    description: 'もみじと朱色の鳥居'
  },
  '山口県': {
    prefecture: '山口県',
    gradient: { from: '#1A237E', to: '#7986CB' },
    source: 'motif',
    motif: '関門海峡',
    description: '関門海峡の深い青'
  },
  '徳島県': {
    prefecture: '徳島県',
    gradient: { from: '#006994', to: '#4DD0E1' },
    source: 'motif',
    motif: '鳴門の渦潮',
    description: '鳴門海峡の渦潮の青緑'
  },
  '香川県': {
    prefecture: '香川県',
    gradient: { from: '#B8860B', to: '#FFFFE0' },
    source: 'motif',
    motif: 'うどん',
    description: 'うどん県の麺の黄色'
  },
  '愛媛県': {
    prefecture: '愛媛県',
    gradient: { from: '#FF8C00', to: '#FFB347' },
    source: 'motif',
    motif: 'みかん',
    description: '柑橘王国のみかんのオレンジ'
  },
  '高知県': {
    prefecture: '高知県',
    gradient: { from: '#00008B', to: '#87CEEB' },
    source: 'motif',
    motif: '太平洋',
    description: '太平洋に面した雄大な海の青'
  },
  '福岡県': {
    prefecture: '福岡県',
    gradient: { from: '#8B0000', to: '#FF8C69' },
    source: 'motif',
    motif: '明太子・博多ラーメン',
    description: '明太子の深い赤から明るいオレンジへ'
  },
  '佐賀県': {
    prefecture: '佐賀県',
    gradient: { from: '#191970', to: '#87CEEB' },
    source: 'motif',
    motif: '有田焼の青磁',
    description: '有田焼の美しい青磁'
  },
  '長崎県': {
    prefecture: '長崎県',
    gradient: { from: '#004D40', to: '#80CBC4' },
    source: 'motif',
    motif: '長崎港・九十九島',
    description: '九十九島の碧い海'
  },
  '熊本県': {
    prefecture: '熊本県',
    gradient: { from: '#B22222', to: '#DC143C' },
    source: 'motif',
    motif: 'くまモン・トマト',
    description: 'くまモンの赤とトマトの赤'
  },
  '大分県': {
    prefecture: '大分県',
    gradient: { from: '#4682B4', to: '#F0FFFF' },
    source: 'motif',
    motif: '温泉の湯気',
    description: '日本一の温泉県の湯気の青白さ'
  },
  '宮崎県': {
    prefecture: '宮崎県',
    gradient: { from: '#FF8C00', to: '#FFD700' },
    source: 'motif',
    motif: '太陽・マンゴー',
    description: '南国の太陽とマンゴーの黄金色'
  },
  '鹿児島県': {
    prefecture: '鹿児島県',
    gradient: { from: '#2F4F4F', to: '#D3D3D3' },
    source: 'motif',
    motif: '桜島の火山灰',
    description: '活火山・桜島の火山灰のグレー'
  },
  '沖縄県': {
    prefecture: '沖縄県',
    gradient: { from: '#20B2AA', to: '#7FFFD4' },
    source: 'motif',
    motif: 'エメラルドグリーンの海',
    description: '沖縄の美しいエメラルドグリーンの海'
  },
  'TAIPEI': {
    prefecture: 'TAIPEI',
    gradient: { from: '#E60012', to: '#FF6B6B' },
    source: 'motif',
    motif: '台湾の国旗',
    description: '台湾の象徴的な赤'
  }
}

// 都道府県名からカラーを取得するヘルパー関数
export function getPrefectureColor(prefecture: string): PrefectureColor | undefined {
  return PREFECTURE_COLORS[prefecture]
}

// 都道府県名からグラデーションCSSを取得するヘルパー関数
export function getPrefectureGradient(prefecture: string): string {
  const color = PREFECTURE_COLORS[prefecture]
  if (color) {
    return `linear-gradient(135deg, ${color.gradient.from}, ${color.gradient.to})`
  }
  // デフォルト
  return 'rgba(216, 217, 195, 0.9)'
}
