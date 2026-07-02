// 住所/会場名から都道府県名を抽出するユーティリティ
// 例: "〒150-0041 東京都渋谷区..." -> "東京都"
//     "福岡市中央区大名 1-3-36"       -> "福岡県"

const PREFECTURES = [
  '北海道',
  '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県',
  '沖縄県',
] as const

export type PrefectureName = (typeof PREFECTURES)[number]

export const PREFECTURE_LIST: readonly PrefectureName[] = PREFECTURES

// 政令市・主要市名 → 都道府県名のフォールバック
// （住所に都道府県名が含まれない場合の救済）
const CITY_TO_PREFECTURE: Record<string, PrefectureName> = {
  札幌市: '北海道', 旭川市: '北海道', 函館市: '北海道',
  仙台市: '宮城県',
  さいたま市: '埼玉県',
  千葉市: '千葉県',
  横浜市: '神奈川県', 川崎市: '神奈川県', 相模原市: '神奈川県',
  新潟市: '新潟県',
  静岡市: '静岡県', 浜松市: '静岡県',
  名古屋市: '愛知県',
  京都市: '京都府',
  大阪市: '大阪府', 堺市: '大阪府',
  神戸市: '兵庫県',
  岡山市: '岡山県',
  広島市: '広島県',
  福岡市: '福岡県', 北九州市: '福岡県',
  熊本市: '熊本県',
}

const OVERSEAS_PATTERNS: { pattern: RegExp; region: string }[] = [
  { pattern: /台湾|台北|新北|台中|高雄|桃園|宜蘭|基隆|嘉義|新竹|彰化|苗栗|南投|雲林|屏東|台東|花蓮|澎湖|金門|連江|台南|Taiwan|Taipei/i, region: '台湾' },
  { pattern: /韓国|ソウル|Seoul|Korea|Busan|Gyeonggi|Goyang|Incheon|Daegu|Daejeon|Gwangju|Ulsan|Jeju/i, region: '韓国' },
  { pattern: /中華人民共和国|上海|北京|杭州|昆明|中国|Shanghai|Beijing|Hangzhou|Kunming|China(?!town)/i, region: '中国' },
  { pattern: /アメリカ|USA|U\.S\.A|United States|Boston|Seattle|MA |WA |Massachusetts|Washington/i, region: 'アメリカ' },
  { pattern: /インドネシア|Indonesia|Jakarta|Bali|ジャカルタ|バリ/i, region: 'インドネシア' },
  { pattern: /香港|Hong Kong/i, region: '香港' },
]

// 海外のサブ地域 (日本の都道府県に相当するレベル) を住所から検出するためのパターン集。
// キーは admin1 データと揃える。
// - 台湾: g0v twCounty2010 の COUNTYNAME (例: 「新北市」「台北市」「桃園縣」)
//   ※ twCounty2010 は「桃園」を「桃園縣」としている (現在は「桃園市」に昇格) 点に注意。
const OVERSEAS_SUBREGION_PATTERNS: Record<
  string,
  { pattern: RegExp; sub: string }[]
> = {
  台湾: [
    { pattern: /新北市|New Taipei/i, sub: '新北市' },
    { pattern: /台北市|Taipei City|(?:^|[^新])Taipei/i, sub: '台北市' },
    { pattern: /桃園(?:市|縣)?|Taoyuan/i, sub: '桃園縣' },
    { pattern: /台中市|Taichung/i, sub: '台中市' },
    { pattern: /台南市|Tainan/i, sub: '台南市' },
    { pattern: /高雄市|Kaohsiung/i, sub: '高雄市' },
    { pattern: /基隆市|Keelung/i, sub: '基隆市' },
    { pattern: /新竹市|Hsinchu City/i, sub: '新竹市' },
    { pattern: /新竹縣|Hsinchu County/i, sub: '新竹縣' },
    { pattern: /嘉義市|Chiayi City/i, sub: '嘉義市' },
    { pattern: /嘉義縣|Chiayi County/i, sub: '嘉義縣' },
    { pattern: /宜蘭|Yilan/i, sub: '宜蘭縣' },
    { pattern: /苗栗|Miaoli/i, sub: '苗栗縣' },
    { pattern: /彰化|Changhua/i, sub: '彰化縣' },
    { pattern: /南投|Nantou/i, sub: '南投縣' },
    { pattern: /雲林|Yunlin/i, sub: '雲林縣' },
    { pattern: /屏東|Pingtung/i, sub: '屏東縣' },
    { pattern: /台東|Taitung/i, sub: '台東縣' },
    { pattern: /花蓮|Hualien/i, sub: '花蓮縣' },
    { pattern: /澎湖|Penghu/i, sub: '澎湖縣' },
    { pattern: /金門|Kinmen/i, sub: '金門縣' },
    { pattern: /連江|Lienchiang/i, sub: '連江縣' },
  ],
  韓国: [
    // sub の値は korea-provinces.topojson の name_eng と一致させる
    { pattern: /Gyeonggi|京畿|Goyang|Suwon|Seongnam|Bucheon|Ilsan|KINTEX/i, sub: 'Gyeonggi-do' },
    { pattern: /Incheon|仁川/i, sub: 'Incheon' },
    { pattern: /Busan|釜山/i, sub: 'Busan' },
    { pattern: /Daegu|大邱/i, sub: 'Daegu' },
    { pattern: /Daejeon|大田/i, sub: 'Daejeon' },
    { pattern: /Gwangju|光州/i, sub: 'Gwangju' },
    { pattern: /Ulsan|蔚山/i, sub: 'Ulsan' },
    { pattern: /Jeju|済州/i, sub: 'Jeju-do' },
    { pattern: /ソウル|Seoul/i, sub: 'Seoul' },
  ],
  中国: [
    // sub の値は china-provinces.topojson の name (中文) と一致させる
    { pattern: /上海|Shanghai/i, sub: '上海市' },
    { pattern: /北京|Beijing/i, sub: '北京市' },
    { pattern: /天津|Tianjin/i, sub: '天津市' },
    { pattern: /重慶|重庆|Chongqing/i, sub: '重庆市' },
    { pattern: /杭州|浙江|Hangzhou|Zhejiang/i, sub: '浙江省' },
    { pattern: /昆明|雲南|云南|Kunming|Yunnan/i, sub: '云南省' },
    { pattern: /広州|広東|广东|Guangzhou|Guangdong/i, sub: '广东省' },
    { pattern: /蘇州|南京|江蘇|江苏|Suzhou|Nanjing|Jiangsu/i, sub: '江苏省' },
    { pattern: /福建|Fujian|Xiamen|厦門|厦门/i, sub: '福建省' },
    { pattern: /四川|Sichuan|Chengdu|成都/i, sub: '四川省' },
  ],
  アメリカ: [
    // sub の値は us-states.topojson の name と一致させる
    { pattern: /Boston|Massachusetts|, MA |MA \d/i, sub: 'Massachusetts' },
    { pattern: /Seattle|Washington|, WA |WA \d/i, sub: 'Washington' },
    { pattern: /New York|, NY |NY \d/i, sub: 'New York' },
    { pattern: /Los Angeles|San Francisco|California|, CA |CA \d/i, sub: 'California' },
    { pattern: /Texas|, TX |TX \d|Houston|Dallas|Austin/i, sub: 'Texas' },
    { pattern: /Hawaii|Honolulu|, HI |HI \d/i, sub: 'Hawaii' },
  ],
  インドネシア: [
    // sub の値は indonesia-provinces.topojson の Propinsi と一致させる
    { pattern: /Jakarta|ジャカルタ/i, sub: 'DKI JAKARTA' },
    { pattern: /Bali|バリ|Denpasar/i, sub: 'BALI' },
    { pattern: /Yogyakarta|ジョグジャカルタ/i, sub: 'DAERAH ISTIMEWA YOGYAKARTA' },
  ],
  香港: [{ pattern: /.*/i, sub: '香港' }],
}

/**
 * 住所文字列から都道府県名を抽出する。
 * 海外の場合は overseasRegion (国単位) と overseasSubRegion (県/市/州単位) を返す。
 */
export function extractPrefecture(
  ...sources: (string | null | undefined)[]
): {
  prefecture: PrefectureName | null
  overseasRegion: string | null
  overseasSubRegion: string | null
} {
  const text = sources.filter(Boolean).join(' ')
  if (!text)
    return { prefecture: null, overseasRegion: null, overseasSubRegion: null }

  for (const p of PREFECTURES) {
    if (text.includes(p))
      return { prefecture: p, overseasRegion: null, overseasSubRegion: null }
  }
  for (const [city, pref] of Object.entries(CITY_TO_PREFECTURE)) {
    if (text.includes(city))
      return { prefecture: pref, overseasRegion: null, overseasSubRegion: null }
  }
  for (const { pattern, region } of OVERSEAS_PATTERNS) {
    if (pattern.test(text)) {
      const subPatterns = OVERSEAS_SUBREGION_PATTERNS[region] ?? []
      let sub: string | null = null
      for (const sp of subPatterns) {
        if (sp.pattern.test(text)) {
          sub = sp.sub
          break
        }
      }
      return {
        prefecture: null,
        overseasRegion: region,
        overseasSubRegion: sub,
      }
    }
  }
  return { prefecture: null, overseasRegion: null, overseasSubRegion: null }
}
