import { Venue } from '../types'

export const yokohama_bayhall: Venue = {
  id: 'yokohama_bayhall',
  name: '横浜BAYHALL',
  date: '2026-05-16T17:00:00+09:00',
  times: { open: '16:00', start: '17:00' },
  location: { 
    prefecture: '神奈川県', 
    city: '横浜市',
    address: '神奈川県横浜市中区新山下3-4-17',
    nearestStation: 'みなとみらい線 元町・中華街駅 徒歩15分'
  },
  capacity: 1500,
  access: '【電車】みなとみらい線（東急東横線相互直通）元町・中華街駅元町方面5番出口下車徒歩15分、京浜東北線石川町駅下車徒歩25分。【バス】横浜市営バス「貯木場前」徒歩5分。※道路状況により遅れが出る場合がありますので時間に余裕をもってお越しください。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13002.122287602611!2d139.661112!3d35.441657!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60185d3d57ece991%3A0xcde3f954aef28bb0!2z5qiq5rWc44OZ44Kk44Ob44O844Or!5e0!3m2!1sja!2sus!4v1764574041596!5m2!1sja!2sus',
  venueWebsite: 'https://bayhall.jp/access/',
  parkingInfo: '専用駐車場なし。近隣の有料駐車場をご利用ください。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '羽田空港',
        method: '京急線',
        time: '約30分',
        description: '羽田空港から京急線で横浜駅',
        cost: '片道470円',
        notes: '15分間隔で運行'
      },
      {
        from: '成田空港',
        method: '成田エクスプレス',
        time: '約90分',
        description: '成田空港から成田エクスプレスで横浜駅',
        cost: '片道4,700円',
        notes: '1時間に1本程度'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: 'JR東海道線',
        time: '約30分',
        description: '東京駅からJR東海道線・横須賀線で横浜駅',
        cost: '片道470円',
        notes: '頻繁に運行'
      },
      {
        from: '大阪',
        method: '新幹線のぞみ',
        time: '約2時間20分',
        description: '新大阪から新幹線のぞみで新横浜駅→JR横浜線で横浜駅（10分）',
        cost: '片道14,000円前後',
        notes: '新横浜駅から横浜線利用'
      },
      {
        from: '名古屋',
        method: '新幹線のぞみ',
        time: '約1時間40分',
        description: '名古屋から新幹線のぞみで新横浜駅→JR横浜線で横浜駅',
        cost: '片道11,000円前後',
        notes: '新横浜駅から横浜線利用'
      }
    ],
    fromCar: [
      {
        from: '東京方面',
        method: '首都高速湾岸線',
        time: '約30分',
        description: '首都高速湾岸線を経由し、みなとみらい方面へ。会場周辺に複数の有料駐車場あり。',
        cost: '高速料金 約1,300円',
        notes: 'みなとみらい地区の駐車場は週末混雑するため事前予約推奨'
      },
      {
        from: '静岡方面',
        method: '東名高速・第三京浜',
        time: '約2時間',
        description: '東名高速→第三京浜を経由し、横浜市内へ。',
        cost: '高速料金 約4,000円（静岡〜横浜）',
        notes: '週末は東名高速が渋滞することがあります'
      }
    ],
    recommendations: '羽田空港から京急線で30分と好アクセス。東京から30分、新幹線は新横浜駅経由。'
  },
  parkingOptions: [
    {
      name: '横浜ベイクォーター駐車場',
      description: '会場直結の駐車場',
      price: '30分280円',
      distance: '徒歩すぐ',
      website: 'https://www.yokohama-bayquarter.com/access/',
      mapsUrl: 'https://www.google.com/maps/search/横浜ベイクォーター+駐車場',
    },
    {
      name: 'タイムズ横浜駅東口',
      description: '横浜駅東口の駐車場',
      price: '料金要確認',
      distance: '徒歩7分',
      website: 'https://times-info.net/P14-kanagawa/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+横浜駅東口',
    },
  ],
  coinLockers: [
    {
      location: 'JR横浜駅構内',
      description: 'JR横浜駅構内のコインロッカー',
      price: '300円〜600円',
      distance: '徒歩5分',
      website: 'https://www.jreast.co.jp/estation/stations/1638.html',
      mapsUrl: 'https://www.google.com/maps/search/JR横浜駅',
    },
    {
      location: '横浜ベイクォーター',
      description: 'ベイクォーター内のコインロッカー',
      price: '料金要確認',
      distance: '徒歩すぐ',
      mapsUrl: 'https://www.google.com/maps/search/横浜ベイクォーター',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 横浜ベイクォーター店',
      description: 'ベイクォーター内のスターバックス',
      distance: '徒歩すぐ',
      website: 'https://store.starbucks.co.jp/detail-477/',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+横浜ベイクォーター',
    },
    {
      name: 'タリーズコーヒー 横浜駅店',
      description: '横浜駅近くのタリーズ',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/タリーズコーヒー+横浜駅',
    },
  ],
  nearbyAttractions: [
    {
      name: '横浜中華街',
      description: '日本最大の中華街。飲食店や雑貨店が充実',
      distance: '電車で10分',
      website: 'https://www.chinatown.or.jp/'
    },
    {
      name: 'みなとみらい21',
      description: '横浜のウォーターフロント。ランドマークタワーや赤レンガ倉庫',
      distance: '徒歩15分',
      website: 'https://www.minatomirai21.com/'
    },
    {
      name: '横浜ベイクォーター',
      description: '会場があるショッピングモール。海沿いで景色が良い',
      distance: '徒歩すぐ',
      website: 'https://www.yokohama-bayquarter.com/'
    }
  ],
  nearbyRestaurants: [
    {
      name: '崎陽軒 本店',
      cuisine: 'シウマイ',
      description: '横浜名物シウマイの本店。中華料理も充実',
      distance: '徒歩10分',
      openTime: '11:00-22:00',
      price: '2,000円～4,000円',
      website: 'https://kiyoken.com/shop/honten/',
      mapsUrl: 'https://www.google.com/maps/search/崎陽軒本店+横浜',
      recommended: true,
      recommendComment: '横浜といえばシウマイ！できたての味は格別'
    },
    {
      name: '家系ラーメン 吉村家',
      cuisine: 'ラーメン',
      description: '家系ラーメンの総本山。濃厚豚骨醤油',
      distance: '電車で15分',
      openTime: '10:00-翌1:00',
      price: '800円～1,000円',
      mapsUrl: 'https://www.google.com/maps/search/吉村家+横浜',
      recommended: true,
      recommendComment: '家系ラーメン発祥の店！濃厚スープとほうれん草が特徴'
    },
    {
      name: '横浜ベイクォーター レストラン街',
      cuisine: '各種',
      description: 'ベイクォーター内の多彩な飲食店',
      distance: '徒歩すぐ',
      openTime: '11:00-23:00（店舗により異なる）',
      price: '1,500円～3,000円',
      website: 'https://www.yokohama-bayquarter.com/shop/',
      mapsUrl: 'https://www.google.com/maps/search/横浜ベイクォーター+レストラン',
    },
    {
      name: '横浜中華街 重慶飯店',
      cuisine: '中華',
      description: '横浜中華街の老舗。本格広東料理が味わえる',
      distance: '電車で20分',
      openTime: '11:00-21:30',
      price: '2,000円～4,000円',
      website: 'https://jukeihanten.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/重慶飯店+横浜中華街',
      recommended: true,
      recommendComment: '横浜中華街発祥の名店！シュウマイやフカヒレ炒めが絶品'
    }
  ],
  accommodations: [
    {
      name: '東横INN 横浜駅東口',
      type: 'ビジネスホテル',
      description: '横浜駅徒歩5分の好立地。清潔で快適な客室、無料朝食付き',
      distance: '横浜駅から徒歩5分',
      priceRange: '6,000円～8,000円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00003/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+横浜駅東口',
      recommended: true,
      recommendComment: '横浜駅近くで便利！横浜遠征の定番ホテル'
    },
    {
      name: '快活CLUB 横浜駅西口店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '横浜駅から徒歩7分',
      priceRange: '2,800円～3,800円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業'],
      website: 'https://www.kaikatsu.jp/shop/yokohama-nishiguchi/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+横浜駅西口',
      recommended: true,
      recommendComment: '予算を抑えたい時の最適解！駅近で便利'
    },
    {
      name: 'カプセルホテル横浜',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル。女性専用フロアあり',
      distance: '横浜駅から徒歩8分',
      priceRange: '3,500円～5,000円/泊',
      features: ['大浴場', 'サウナ', '女性専用フロア', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+横浜駅'
    },
    {
      name: 'ホテルルートイン横浜駅西口',
      type: 'ビジネスホテル',
      description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
      distance: '横浜駅から徒歩7分',
      priceRange: '6,500円～9,000円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=370',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+横浜駅西口'
    }
  ]
}

export default yokohama_bayhall
