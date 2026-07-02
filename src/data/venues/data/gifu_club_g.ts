import { Venue } from '../types'

export const gifu_club_g: Venue = {
  id: 'gifu_club_g',
  name: '岐阜CLUB-G',
  date: '2026-05-31T17:00:00+09:00',
  times: { open: '16:30', start: '17:00' },
  location: { 
    prefecture: '岐阜県', 
    city: '岐阜市',
    address: '岐阜県岐阜市玉宮町2-5',
    nearestStation: 'JR岐阜駅 徒歩10分'
  },
  capacity: 350,
  access: 'JR岐阜駅または名鉄岐阜駅から徒歩10分。柳ヶ瀬商店街近く。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13005.849577495761!2d136.759685!3d35.418574!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6003a945d1f532df%3A0x9ad8619e32446afc!2z5bKQ6ZicY2x1Yi1H!5e0!3m2!1sja!2sus!4v1764574717404!5m2!1sja!2sus',
  venueWebsite: 'https://club-g.jp/access.html',
  parkingInfo: '専用駐車場なし。近隣の有料駐車場をご利用ください。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '中部国際空港（セントレア）',
        method: '電車',
        time: '約1時間30分',
        description: 'セントレアから名鉄で名古屋駅→JR東海道本線で岐阜駅',
        cost: '片道2,000円前後',
        notes: '名古屋駅で乗り換え'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '新幹線 + JR',
        time: '約2時間30分',
        description: '東京から新幹線のぞみで名古屋→JR東海道本線で岐阜（20分）',
        cost: '片道11,500円前後',
        notes: '名古屋駅でJRに乗り換え'
      },
      {
        from: '大阪',
        method: '新幹線 + JR',
        time: '約1時間15分',
        description: '新大阪から新幹線のぞみで名古屋→JR東海道本線で岐阜',
        cost: '片道6,500円前後',
        notes: '名古屋駅でJRに乗り換え'
      },
      {
        from: '名古屋',
        method: 'JR',
        time: '約20分',
        description: '名古屋駅からJR東海道本線快速で岐阜駅',
        cost: '片道470円',
        notes: '快速利用で約20分'
      }
    ],
    fromExpressBus: [
      {
        from: '東京',
        method: '夜行高速バス',
        time: '約7時間',
        description: '東京駅から岐阜駅行き夜行バス',
        cost: '片道5,000円前後',
        notes: '前日夜発・当日朝着。経済的な選択肢'
      },
      {
        from: '大阪',
        method: '高速バス',
        time: '約3時間',
        description: '大阪駅前から岐阜駅行き高速バス',
        cost: '片道3,500円前後',
        notes: '関西方面からのアクセスに便利'
      }
    ],
    fromCar: [
      {
        from: '名古屋方面',
        method: '東海北陸自動車道',
        time: '約40分',
        description: '東海北陸自動車道を北上し、岐阜各務原ICで降りて岐阜市内へ。会場周辺に有料駐車場あり。',
        cost: '高速料金 約1,200円（名古屋〜岐阜各務原IC）',
        notes: '岐阜市街地の駐車場は事前確認推奨'
      },
      {
        from: '大阪方面',
        method: '名神高速・東海北陸自動車道',
        time: '約2時間30分',
        description: '名神高速→東海北陸自動車道を経由し、岐阜市内へ。',
        cost: '高速料金 約5,000円（大阪〜岐阜）',
        notes: '関西圏からのアクセスに便利'
      }
    ],
    recommendations: '名古屋から20分と近い。新幹線は名古屋駅経由でJR利用。'
  },
  parkingOptions: [
    {
      name: 'タイムズ岐阜駅前',
      description: '岐阜駅前の駐車場',
      price: '料金要確認',
      distance: '徒歩10分',
      website: 'https://times-info.net/P21-gifu/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+岐阜駅前',
    },
    {
      name: '岐阜市営駐車場',
      description: '市営の駐車場',
      price: '料金要確認',
      distance: '徒歩8分',
      mapsUrl: 'https://www.google.com/maps/search/岐阜市営+駐車場',
    },
  ],
  coinLockers: [
    {
      location: 'JR岐阜駅構内',
      description: 'JR岐阜駅構内のコインロッカー',
      price: '300円〜600円',
      distance: '徒歩10分',
      website: 'https://railway.jr-central.co.jp/station-guide/tokai/gifu/',
      mapsUrl: 'https://www.google.com/maps/search/JR岐阜駅',
    },
    {
      location: '名鉄岐阜駅',
      description: '名鉄岐阜駅のコインロッカー',
      price: '料金要確認',
      distance: '徒歩10分',
      mapsUrl: 'https://www.google.com/maps/search/名鉄岐阜駅',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 岐阜駅前店',
      description: '岐阜駅前のスターバックス',
      distance: '徒歩10分',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+岐阜駅前',
    },
    {
      name: 'コメダ珈琲 岐阜店',
      description: 'コメダ珈琲でライブ前後の休憩',
      distance: '徒歩8分',
      website: 'https://www.komeda.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/コメダ珈琲+岐阜',
    },
  ],
  nearbyAttractions: [
    {
      name: '岐阜城',
      description: '金華山山頂にそびえる城。ロープウェイで登れる',
      distance: 'バスで20分',
      website: 'https://www.city.gifu.lg.jp/kankoubunka/kankou/1013051.html'
    },
    {
      name: '長良川鵜飼',
      description: '1300年の歴史を持つ伝統漁法。夏季限定',
      distance: 'バスで20分',
      website: 'https://www.ukai-gifucity.jp/'
    },
    {
      name: '柳ヶ瀬商店街',
      description: '岐阜の繁華街。レトロな雰囲気',
      distance: '徒歩5分',
      website: 'https://yanagase.or.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'すし辰',
      cuisine: '寿司',
      description: '岐阜で人気の回転寿司。新鮮なネタが評判',
      distance: '徒歩8分',
      openTime: '11:00-22:00',
      price: '2,000円～3,000円',
      mapsUrl: 'https://www.google.com/maps/search/すし辰+岐阜',
      recommended: true,
      recommendComment: '岐阜で寿司ならここ！新鮮で美味しい'
    },
    {
      name: '馬喰一代 岐阜神田店',
      cuisine: '飛騨牛',
      description: '飛騨牛一頭買いの焼肉・すき焼き専門店。希少部位も味わえる',
      distance: '徒歩10分',
      openTime: '11:30-14:30、17:00-22:00',
      price: '4,000円～8,000円',
      website: 'https://www.bakuroichidai.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/馬喰一代+岐阜',
      recommended: true,
      recommendComment: '岐阜といえば飛騨牛！一頭買いだから味わえる希少部位も'
    },
    {
      name: '更科',
      cuisine: 'そば',
      description: '岐阜の老舗そば店',
      distance: '徒歩7分',
      openTime: '11:00-20:00',
      price: '800円～1,500円',
      mapsUrl: 'https://www.google.com/maps/search/更科+岐阜',
    },
    {
      name: '丸デブ 総本店',
      cuisine: '中華そば',
      description: '1938年創業。岐阜のソウルフード中華そばの名店',
      distance: '徒歩5分',
      openTime: '11:00-14:30',
      price: '500円～800円',
      mapsUrl: 'https://www.google.com/maps/search/丸デブ総本店+岐阜',
      recommended: true,
      recommendComment: '岐阜のソウルフード！昔ながらのシンプルな中華そばが絶品'
    }
  ],
  accommodations: [
    {
      name: '東横INN 岐阜駅前',
      type: 'ビジネスホテル',
      description: '岐阜駅徒歩3分の好立地。清潔で快適な客室、無料朝食付き',
      distance: '岐阜駅から徒歩3分',
      priceRange: '5,000円～7,000円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00092/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+岐阜駅前',
      recommended: true,
      recommendComment: '駅近で清潔、朝食無料！岐阜遠征の定番ホテル'
    },
    {
      name: '快活CLUB 岐阜店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '岐阜駅から車で10分',
      priceRange: '2,000円～3,000円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業', '無料駐車場'],
      website: 'https://www.kaikatsu.jp/shop/gifu/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+岐阜',
      recommended: true,
      recommendComment: '車での遠征なら最適！駐車場無料で予算も抑えられる'
    },
    {
      name: 'カプセルホテル岐阜',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル',
      distance: '岐阜駅から徒歩6分',
      priceRange: '3,000円～4,000円/泊',
      features: ['大浴場', 'サウナ', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+岐阜駅'
    },
    {
      name: 'ホテルルートイン岐阜加納',
      type: 'ビジネスホテル',
      description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
      distance: '岐阜駅から車で15分',
      priceRange: '5,500円～8,000円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー', '無料駐車場'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=123',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+岐阜加納'
    }
  ]
}

export default gifu_club_g
