import { Venue } from '../types'

export const sendai_talknet_hall: Venue = {
  id: 'sendai_talknet_hall',
  name: 'トークネットホール仙台',
  date: '2026-06-12T18:30:00+09:00',
  times: { open: '17:30', start: '18:30' },
  location: { 
    prefecture: '宮城県', 
    city: '仙台市',
    address: '宮城県仙台市青葉区桜ケ岡公園4-1',
    nearestStation: '地下鉄東西線 大町西公園駅 徒歩3分'
  },
  capacity: 1310,
  access: '【電車】地下鉄東西線「大町西公園」駅より徒歩約3分。JR仙台駅から地下鉄東西線で約3分。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3132.5!2d140.8587!3d38.2576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5f8a282e8b2c2b1d%3A0x1234567890abcdef!2z44OI44O844Kv44ON44OD44OI44Ob44O844Or5LuZ5Y-w!5e0!3m2!1sja!2sjp',
  venueWebsite: 'https://www.shimin-hall.com/',
  parkingInfo: '駐車場は収容台数に限りがあります。公共交通機関のご利用をお勧めします。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '仙台空港',
        method: '仙台空港鉄道',
        time: '約25分',
        description: '仙台空港から仙台空港アクセス線で仙台駅',
        cost: '片道660円',
        notes: '15〜20分間隔で運行'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '東北新幹線はやぶさ',
        time: '約1時間30分',
        description: '東京駅から東北新幹線はやぶさで仙台駅',
        cost: '片道11,000円前後',
        notes: '最速列車で約90分'
      },
      {
        from: '大阪',
        method: '新幹線乗り継ぎ',
        time: '約5時間',
        description: '新大阪から東海道新幹線で東京→東北新幹線で仙台',
        cost: '片道23,000円前後',
        notes: '東京駅で乗り換え。飛行機も検討を'
      },
      {
        from: '名古屋',
        method: '新幹線乗り継ぎ',
        time: '約4時間',
        description: '名古屋から東海道新幹線で東京→東北新幹線で仙台',
        cost: '片道19,000円前後',
        notes: '東京駅で乗り換え'
      },
      {
        from: '盛岡',
        method: '東北新幹線',
        time: '約40分',
        description: '盛岡駅から東北新幹線はやぶさで仙台駅',
        cost: '片道4,500円前後',
        notes: '東北エリアの拠点'
      }
    ],
    fromCar: [
      {
        from: '東京方面',
        method: '東北自動車道',
        time: '約4時間30分',
        description: '東北自動車道を北上し、仙台宮城ICで降りて仙台市内へ。会場周辺に複数の有料駐車場あり。',
        cost: '高速料金 約6,500円（東京〜仙台宮城IC）',
        notes: '長距離運転のため休憩を適宜取ること。冬季は路面凍結に注意'
      },
      {
        from: '青森方面',
        method: '東北自動車道',
        time: '約4時間',
        description: '東北自動車道を南下し、仙台宮城ICで降りて仙台市内へ。',
        cost: '高速料金 約5,500円（青森〜仙台宮城IC）',
        notes: '東北圏内からのアクセスに便利'
      }
    ],
    recommendations: '仙台空港から電車で25分。東京から新幹線で1時間30分。東北の中心都市。'
  },
  parkingOptions: [
    {
      name: 'タイムズ仙台駅前',
      description: '仙台駅前の駐車場',
      price: '30分300円',
      distance: '徒歩5分',
      website: 'https://times-info.net/P04-miyagi/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+仙台駅前',
    },
    {
      name: '仙台駅西口駐車場',
      description: '仙台駅西口の駐車場',
      price: '料金要確認',
      distance: '徒歩3分',
      mapsUrl: 'https://www.google.com/maps/search/仙台駅西口+駐車場',
    },
  ],
  coinLockers: [
    {
      location: 'JR仙台駅構内',
      description: 'JR仙台駅構内のコインロッカー',
      price: '300円〜600円',
      distance: '徒歩5分',
      website: 'https://www.jreast.co.jp/estation/stations/1326.html',
      mapsUrl: 'https://www.google.com/maps/search/JR仙台駅',
    },
    {
      name: '仙台駅前商店街',
      description: '駅前のコインロッカー',
      price: '料金要確認',
      distance: '徒歩3分',
      mapsUrl: 'https://www.google.com/maps/search/仙台駅前+コインロッカー',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 仙台駅前店',
      description: '仙台駅前のスターバックス',
      distance: '徒歩3分',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+仙台駅前',
    },
    {
      name: 'タリーズコーヒー 仙台店',
      description: 'タリーズコーヒーでライブ前後の休憩',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/タリーズコーヒー+仙台',
    },
  ],
  nearbyAttractions: [
    {
      name: '仙台城跡（青葉城址）',
      description: '伊達政宗の城跡。仙台市街を一望',
      distance: 'バスで15分',
      website: 'https://www.sentabi.jp/guidebook/attractions/view/78'
    },
    {
      name: 'アーケード商店街',
      description: '仙台駅前の大規模アーケード街',
      distance: '徒歩5分',
      website: 'https://www.clis-sendai.jp/'
    },
    {
      name: '仙台朝市',
      description: '新鮮な海産物や野菜が揃う市場',
      distance: '徒歩10分',
      website: 'https://www.sendaiasaichi.com/'
    }
  ],
  nearbyRestaurants: [
    {
      name: '牛たん炭焼 利久',
      cuisine: '牛タン',
      description: '仙台名物牛タンの名店。厚切りが絶品',
      distance: '徒歩5分',
      openTime: '11:00-22:00',
      price: '1,500円～2,500円',
      website: 'https://www.rikyu-gyutan.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/利久+仙台駅',
      recommended: true,
      recommendComment: '仙台といえば牛タン！厚切りジューシーで最高'
    },
    {
      name: 'ずんだ茶寮',
      cuisine: 'ずんだ',
      description: '仙台名物ずんだのスイーツ専門店',
      distance: '徒歩3分',
      openTime: '9:00-21:00',
      price: '500円～1,000円',
      website: 'https://zundasaryo.com/',
      mapsUrl: 'https://www.google.com/maps/search/ずんだ茶寮+仙台',
      recommended: true,
      recommendComment: 'ずんだシェイクが絶品！仙台の定番スイーツ'
    },
    {
      name: '末廃ラーメン本舗 仙台駅前分店',
      cuisine: 'ラーメン',
      description: '行列必至の人気ラーメン店。独特の甘辛醤油スープが特徴',
      distance: '地下鉄で10分',
      openTime: '11:00-翌2:00',
      price: '800円～1,200円',
      mapsUrl: 'https://www.google.com/maps/search/末廃ラーメン本舗+仙台駅前',
    },
    {
      name: '阿部蒲鉾店 本店',
      cuisine: '笹かまぼこ',
      description: '仙台名物笹かまぼこの老舗。創業昭和初期の伝統の味',
      distance: '徒歩15分',
      openTime: '9:30-18:30',
      price: '1,500円～3,000円',
      website: 'https://www.abekama.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/阿部蒲鉾店+仙台',
      recommended: true,
      recommendComment: '仙台名物笹かまぼこの老舗！もちもち食感と香ばしい毛豆の風味が絶品'
    }
  ],
  accommodations: [
    {
      name: '東横INN 仙台駅西口中央',
      type: 'ビジネスホテル',
      description: '仙台駅徒歩3分の好立地。清潔で快適な客室、無料朝食付き',
      distance: '仙台駅から徒歩3分',
      priceRange: '5,500円～7,500円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00027/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+仙台駅西口',
      recommended: true,
      recommendComment: '駅近で清潔、朝食無料！仙台遠征の定番ホテル'
    },
    {
      name: '快活CLUB 仙台一番町店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '仙台駅から徒歩7分',
      priceRange: '2,200円～3,200円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業'],
      website: 'https://www.kaikatsu.jp/shop/sendai-ichibancho/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+仙台一番町',
      recommended: true,
      recommendComment: '予算を抑えたい時の最適解！繁華街も近い'
    },
    {
      name: 'ナインアワーズ仙台',
      type: 'カプセルホテル',
      description: 'デザイン性の高いカプセルホテル。快適な睡眠空間とシャワーブース完備',
      distance: '仙台駅から徒歩5分',
      priceRange: '4,000円～5,500円/泊',
      features: ['シャワーブース', '無料Wi-Fi', 'ロッカー', '洗練されたデザイン', '女性専用フロア'],
      website: 'https://ninehours.co.jp/sendai/',
      mapsUrl: 'https://www.google.com/maps/search/ナインアワーズ+仙台',
      recommended: true,
      recommendComment: 'デザイン性と機能性を両立した快適なカプセルホテル！清潔感抜群'
    },
    {
      name: 'カプセルホテル仙台',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル',
      distance: '仙台駅から徒歩6分',
      priceRange: '3,000円～4,500円/泊',
      features: ['大浴場', 'サウナ', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+仙台駅'
    },
    {
      name: 'ホテルルートイン仙台駅前',
      type: 'ビジネスホテル',
      description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
      distance: '仙台駅から徒歩5分',
      priceRange: '6,000円～8,500円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=61',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+仙台駅前'
    }
  ]
}

export default sendai_talknet_hall
