import { Venue } from '../types'

export const osaka_orix_theater: Venue = {
  id: 'osaka_orix_theater',
  name: 'オリックス劇場',
  date: '2026-06-19T17:00:00+09:00',
  times: { open: '16:00', start: '17:00' },
  location: { 
    prefecture: '大阪府', 
    city: '大阪市',
    address: '大阪府大阪市西区新町1-14-15',
    nearestStation: '大阪メトロ四ツ橋駅 徒歩1分'
  },
  capacity: 2400,
  access: '大阪メトロ四ツ橋線 四ツ橋駅 3番出口から徒歩1分。心斎橋から徒歩8分。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13124.221636888064!2d135.495387!3d34.678551!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e7b24b87684b%3A0xc8ccca24d40d8902!2z44Kq44Oq44OD44Kv44K55YqH5aC0!5e0!3m2!1sja!2sus!4v1764574776410!5m2!1sja!2sus',
  venueWebsite: 'https://www.orixtheater.jp/access/',
  parkingInfo: '専用駐車場なし。近隣の有料駐車場をご利用ください。公共交通機関の利用を推奨します。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '関西国際空港',
        method: 'JR関空快速 + 地下鉄',
        time: '約1時間',
        description: '関空から関空快速で難波→大阪メトロ四ツ橋線で四ツ橋駅',
        cost: '片道1,400円前後',
        notes: 'なんば駅で地下鉄に乗り換え'
      },
      {
        from: '大阪国際空港（伊丹空港）',
        method: 'リムジンバス + 地下鉄',
        time: '約40分',
        description: '伊丹空港からリムジンバスで難波→地下鉄で四ツ橋駅',
        cost: '片道650円前後',
        notes: 'なんば駅で地下鉄に乗り換え'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '新幹線のぞみ + 地下鉄',
        time: '約3時間',
        description: '東京から新幹線のぞみで新大阪→御堂筋線で心斎橋→四ツ橋線で四ツ橋',
        cost: '片道14,000円前後',
        notes: '新大阪から地下鉄で約15分'
      },
      {
        from: '名古屋',
        method: '新幹線のぞみ + 地下鉄',
        time: '約1時間15分',
        description: '名古屋から新幹線のぞみで新大阪→地下鉄で四ツ橋駅',
        cost: '片道6,500円前後',
        notes: '新大阪から地下鉄で約15分'
      },
      {
        from: '広島',
        method: '新幹線のぞみ + 地下鉄',
        time: '約1時間45分',
        description: '広島から新幹線のぞみで新大阪→地下鉄で四ツ橋駅',
        cost: '片道10,500円前後',
        notes: '新大阪から地下鉄で約15分'
      },
      {
        from: '福岡',
        method: '新幹線のぞみ + 地下鉄',
        time: '約2時間45分',
        description: '博多から新幹線のぞみで新大阪→地下鉄で四ツ橋駅',
        cost: '片道15,500円前後',
        notes: '新大阪から地下鉄で約15分'
      }
    ],
    fromCar: [
      {
        from: '東京方面',
        method: '東名・名神高速道路',
        time: '約5時間30分',
        description: '東名・名神高速を経由し、吹田ICまたは豊中ICで降りて大阪市内へ。会場近くに複数の有料駐車場あり。',
        cost: '高速料金 約11,000円（東京〜吹田IC）',
        notes: '長距離運転のため休憩を適宜取ること。週末は渋滞に注意'
      },
      {
        from: '名古屋方面',
        method: '名神高速道路',
        time: '約2時間30分',
        description: '名神高速を経由し、吹田ICまたは豊中ICで降りて大阪市内へ。',
        cost: '高速料金 約4,500円（名古屋〜吹田IC）',
        notes: '週末は名神高速が混雑することがあります'
      }
    ],
    recommendations: '関空から1時間、伊丹から40分。新幹線は新大阪から地下鉄15分。'
  },
  parkingOptions: [
    {
      name: 'タイムズ新町',
      description: '会場近くの駐車場',
      price: '30分300円',
      distance: '徒歩3分',
      website: 'https://times-info.net/P27-osaka/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+新町+大阪',
    },
    {
      name: '心斎橋パーキング',
      description: '心斎橋の駐車場',
      price: '料金要確認',
      distance: '徒歩8分',
      mapsUrl: 'https://www.google.com/maps/search/心斎橋+駐車場',
    },
  ],
  coinLockers: [
    {
      location: '四ツ橋駅構内',
      description: '大阪メトロ四ツ橋駅のコインロッカー',
      price: '300円〜600円',
      distance: '徒歩1分',
      mapsUrl: 'https://www.google.com/maps/search/四ツ橋駅',
    },
    {
      location: '心斎橋駅',
      description: '心斎橋駅のコインロッカー',
      price: '300円〜600円',
      distance: '徒歩8分',
      website: 'https://subway.osakametro.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/心斎橋駅',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 心斎橋店',
      description: '心斎橋のスターバックス',
      distance: '徒歩7分',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+心斎橋',
    },
    {
      name: 'コメダ珈琲 心斎橋店',
      description: 'コメダ珈琲でライブ前後の休憩',
      distance: '徒歩10分',
      website: 'https://www.komeda.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/コメダ珈琲+心斎橋',
    },
  ],
  nearbyAttractions: [
    {
      name: '心斎橋筋商店街',
      description: '大阪を代表する商店街。ショッピングとグルメ',
      distance: '徒歩8分',
      website: 'https://www.shinsaibashi.or.jp/'
    },
    {
      name: '道頓堀',
      description: '大阪の観光名所。グリコの看板が有名',
      distance: '徒歩12分',
      website: 'https://www.dotonbori.or.jp/'
    },
    {
      name: 'アメリカ村',
      description: '若者文化の発信地。古着屋やカフェが多い',
      distance: '徒歩5分',
      website: 'https://www.amerikamura.jp/'
    }
  ],
  holyPlaces: [
    {
      name: '鉄板野郎 裏参道店',
      description: 'Reolサイン入りのヘラが飾られている',
      type: 'Reol関連',
      distance: '心斎橋駅から徒歩5分',
      address: '大阪府大阪市中央区',
      mapsUrl: 'https://www.google.com/maps/search/鉄板野郎+裏参道店+大阪',
    },
    {
      name: '梅田珈琲館ＹＣ',
      description: 'Reol来店歴あり',
      type: 'Reol関連',
      distance: '梅田駅から徒歩5分',
      address: '大阪府大阪市北区',
      mapsUrl: 'https://www.google.com/maps/search/梅田珈琲館YC',
    },
  ],
  nearbyRestaurants: [
    {
      name: 'くくる 本店',
      cuisine: 'たこ焼き',
      description: '大阪名物たこ焼きの名店。外はカリッと中はトロッと',
      distance: '徒歩10分',
      openTime: '10:00-22:30',
      price: '500円～1,000円',
      website: 'https://www.shirohato.com/kukuru/',
      mapsUrl: 'https://www.google.com/maps/search/くくる+道頓堀',
      recommended: true,
      recommendComment: '大阪といえばたこ焼き！くくるは外せない名店'
    },
    {
      name: '千房 本店',
      cuisine: 'お好み焼き',
      description: '大阪を代表するお好み焼きの老舗',
      distance: '徒歩12分',
      openTime: '11:00-23:00',
      price: '1,000円～2,000円',
      website: 'https://www.chibo.com/',
      mapsUrl: 'https://www.google.com/maps/search/千房+道頓堀',
      recommended: true,
      recommendComment: '本場のお好み焼きはここ！ふわふわで絶品'
    },
    {
      name: '自由軒 本店',
      cuisine: '洋食',
      description: '大阪名物・名物カレーの老舗。混ぜて食べる独特のスタイル',
      distance: '徒歩10分',
      openTime: '11:30-20:30',
      price: '800円～1,200円',
      website: 'https://www.jiyuken.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/自由軒+難波本店',
      recommended: true,
      recommendComment: '大阪の老舗洋食店！名物カレーは創業時から変わらぬ味'
    },
    {
      name: '北極星 心斎橋本店',
      cuisine: 'オムライス',
      description: 'オムライス発祥の店。ふわとろ卵が絶品',
      distance: '徒歩8分',
      openTime: '11:30-21:30',
      price: '1,200円～1,800円',
      website: 'https://hokkyokusei.jp/',
      mapsUrl: 'https://www.google.com/maps/search/北極星+心斎橋',
      recommended: true,
      recommendComment: 'オムライスの元祖！ここでしか味わえない伝統の味'
    }
  ],
  accommodations: [
    {
      name: '東横INN 大阪心斎橋',
      type: 'ビジネスホテル',
      description: '心斎橋駅徒歩3分の好立地。清潔で快適な客室、無料朝食付き',
      distance: '心斎橋駅から徒歩3分',
      priceRange: '6,000円～8,500円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00035/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+大阪心斎橋',
      recommended: true,
      recommendComment: '心斎橋繁華街近くで便利！大阪遠征の定番ホテル'
    },
    {
      name: '快活CLUB 大阪心斎橋店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '心斎橋駅から徒歩5分',
      priceRange: '2,800円～3,800円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業'],
      website: 'https://www.kaikatsu.jp/shop/osaka-shinsaibashi/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+大阪心斎橋',
      recommended: true,
      recommendComment: '繁華街に近くて便利！予算を抑えたい時に最適'
    },
    {
      name: 'ナインアワーズなんば駅',
      type: 'カプセルホテル',
      description: 'デザイン性の高いカプセルホテル。快適な睡眠空間とシャワーブース完備',
      distance: 'なんば駅から徒歩3分',
      priceRange: '4,500円～6,000円/泊',
      features: ['シャワーブース', '無料Wi-Fi', 'ロッカー', '洗練されたデザイン', '女性専用フロア'],
      website: 'https://ninehours.co.jp/namba/',
      mapsUrl: 'https://www.google.com/maps/search/ナインアワーズ+なんば駅',
      recommended: true,
      recommendComment: 'デザイン性と機能性を両立した快適なカプセルホテル！なんば駅直結で便利'
    },
    {
      name: 'カプセルホテル大阪',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル。女性専用フロアあり',
      distance: '心斎橋駅から徒歩6分',
      priceRange: '3,500円～5,000円/泊',
      features: ['大浴場', 'サウナ', '女性専用フロア', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+大阪心斎橋'
    },
    {
      name: 'ホテルルートイン大阪本町',
      type: 'ビジネスホテル',
      description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
      distance: '本町駅から徒歩5分',
      priceRange: '6,500円～9,000円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=368',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+大阪本町'
    }
  ]
}

export default osaka_orix_theater
