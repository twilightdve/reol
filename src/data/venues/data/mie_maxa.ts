import { Venue } from '../types'

export const mie_maxa: Venue = {
  id: 'mie_maxa',
  name: "松阪M'AXA",
  date: '2026-04-04T17:00:00+09:00',
  times: { open: '16:30', start: '17:00' },
  location: { 
    prefecture: '三重県', 
    city: '松阪市',
    address: '三重県松阪市市場庄町1148-2',
    nearestStation: '近鉄松ヶ崎駅 徒歩20分'
  },
  capacity: 350,
  access: '【電車】近鉄松ヶ崎駅から徒歩20分。※松ヶ崎駅は普通列車のみ停車。特急・急行利用の場合は伊勢中川駅で普通列車に乗り換え。【タクシー】カネ七タクシー0120-28-9333、三交タクシー0598-28-8835。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13135.544016810038!2d136.517587!3d34.607044!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60046caa964eda33%3A0xa63b565b0224e680!2z44Op44Kk44OW44Of44Ol44O844K444OD44Kv44Oe44Kv44K1!5e0!3m2!1sja!2sus!4v1764560986362!5m2!1sja!2sus',
  venueWebsite: 'https://www.maxa.jp/access/',
  parkingInfo: '第二駐車場あり（約50台/無料）。M\'AXAから津方面に100m、21時にアイスとNetzトヨタの間を左折、100m先右手。奥からバックで縦列駐車。※近隣店舗（ファミリーマート等）への駐車厳禁。違反時はライブ中止の場合あり。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '中部国際空港（セントレア）',
        method: '電車',
        time: '約2時間',
        description: 'セントレアから名鉄特急で名古屋駅（30分）→近鉄特急で松阪駅（80分）',
        cost: '片道3,500円前後',
        notes: '名古屋駅での乗り換え時間含む'
      },
      {
        from: '関西国際空港',
        method: '電車',
        time: '約2時間30分',
        description: '関空から南海+地下鉄で難波駅→近鉄特急で松阪駅（100分）',
        cost: '片道4,000円前後',
        notes: '難波駅での乗り換え'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '新幹線 + 近鉄',
        time: '約3時間',
        description: '東京駅から新幹線のぞみで名古屋駅→近鉄特急で松阪駅',
        cost: '片道13,000円前後',
        notes: '名古屋駅で近鉄に乗り換え'
      },
      {
        from: '大阪',
        method: '近鉄特急',
        time: '約1時間40分',
        description: '大阪難波駅から近鉄特急で松阪駅へ直通',
        cost: '片道3,000円前後',
        notes: '特急券必要'
      },
      {
        from: '名古屋',
        method: '近鉄特急',
        time: '約1時間20分',
        description: '名古屋駅から近鉄特急で松阪駅へ直通',
        cost: '片道2,500円前後',
        notes: '特急券必要'
      }
    ],
    fromExpressBus: [
      {
        from: '名古屋',
        method: '高速バス',
        time: '約2時間',
        description: '名鉄バスセンターから松阪駅行き高速バス',
        cost: '片道2,000円前後',
        notes: '1日数本運行。特急電車より安価'
      },
      {
        from: '大阪',
        method: '高速バス',
        time: '約2時間30分',
        description: '大阪駅前から松阪駅行き高速バス',
        cost: '片道2,500円前後',
        notes: '関西方面からのアクセスに便利'
      }
    ],
    fromCar: [
      {
        from: '名古屋方面',
        method: '東名阪自動車道',
        time: '約1時間',
        description: '伊勢自動車道を経由し、松阪ICで降りて松阪市内へ。第二駐車場あり（約50台/無料）。',
        cost: '高速料金 約2,500円（名古屋〜松阪IC）',
        notes: '第二駐車場はM\'AXAから津方面100m先'
      },
      {
        from: '大阪方面',
        method: '名阪国道・東名阪自動車道',
        time: '約2時間',
        description: '名阪国道→伊勢自動車道を経由し、松阪ICで降りて松阪市内へ。',
        cost: '高速料金 約3,500円（大阪〜松阪IC）',
        notes: '関西圏からのアクセスに便利'
      }
    ],
    recommendations: '名古屋・大阪から近鉄特急が便利。松阪牛の本場なので食事も楽しめる。'
  },
  parkingOptions: [
    {
      name: 'タイムズ松阪駅前',
      description: 'JR松阪駅前の駐車場',
      price: '料金要確認',
      distance: '徒歩5分',
      website: 'https://times-info.net/P24-mie/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+松阪駅前',
    },
    {
      name: '松阪駅前パーキング',
      description: '松阪駅前の市営駐車場',
      price: '料金要確認',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/松阪駅前+駐車場',
    },
  ],
  coinLockers: [
    {
      location: 'JR松阪駅構内',
      description: 'JR松阪駅構内のコインロッカー',
      price: '料金要確認',
      distance: '徒歩5分',
      website: 'https://www.jr-odekake.net/eki/premises?id=0622091',
      mapsUrl: 'https://www.google.com/maps/search/JR松阪駅',
    },
    {
      location: '近鉄松阪駅構内',
      description: '近鉄松阪駅構内のコインロッカー',
      price: '料金要確認',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/近鉄松阪駅',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 松阪駅前店',
      description: '松阪駅前のスターバックス',
      distance: '徒歩3分',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+松阪駅前',
    },
    {
      name: 'コメダ珈琲 松阪店',
      description: '名古屋発祥の喫茶店。モーニングも人気',
      distance: '徒歩10分',
      mapsUrl: 'https://www.google.com/maps/search/コメダ珈琲+松阪',
    },
  ],
  nearbyAttractions: [
    {
      name: '松阪城跡',
      description: '蒲生氏郷が築いた城跡。桜の名所で石垣が美しい',
      distance: '徒歩15分',
      website: 'https://www.city.matsusaka.mie.jp/site/kanko/matsuzakajyo.html'
    },
    {
      name: '御城番屋敷',
      description: '江戸時代の武家屋敷が残る町並み。重要伝統的建造物群保存地区',
      distance: '徒歩20分',
      website: 'https://www.city.matsusaka.mie.jp/site/kanko/gojyoubanyashiki.html'
    },
    {
      name: '本居宣長記念館',
      description: '国学者・本居宣長の記念館',
      distance: '徒歩15分',
      website: 'https://www.norinagakinenkan.com/'
    }
  ],
  nearbyRestaurants: [
    {
      name: '和田金',
      cuisine: '松阪牛',
      description: '創業明治11年。最高級松阪牛のすき焼きの名店',
      distance: '徒歩10分',
      openTime: '11:30-19:00（定休日あり）',
      price: '15,000円～30,000円',
      website: 'https://www.wadakin.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/和田金+松阪',
      recommended: true,
      recommendComment: '松阪牛の最高峰！特別な日にふさわしい老舗の味'
    },
    {
      name: '牛銀本店',
      cuisine: '松阪牛',
      description: '明治35年創業の松阪牛専門店。すき焼きが絶品',
      distance: '徒歩12分',
      openTime: '11:00-20:00',
      price: '8,000円～20,000円',
      website: 'https://www.gyugin-honten.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/牛銀本店+松阪',
      recommended: true,
      recommendComment: '松阪に来たら松阪牛！和田金より手頃で高品質'
    },
    {
      name: '松阪まるよし',
      cuisine: '松阪牛',
      description: '焼肉・ステーキで松阪牛を楽しめる',
      distance: '徒歩8分',
      openTime: '11:00-21:00',
      price: '5,000円～12,000円',
      website: 'https://www.matsusakaushi.com/',
      mapsUrl: 'https://www.google.com/maps/search/松阪まるよし',
    },
    {
      name: '一升屋食堂',
      cuisine: '定食',
      description: '松阪の地元食堂。ボリューム満点で地元の味を楽しめる',
      distance: '徒歩6分',
      openTime: '11:00-21:00',
      price: '800円～1,300円',
      mapsUrl: 'https://www.google.com/maps/search/食堂+松阪駅',
      recommended: true,
      recommendComment: '地元愛用の食堂！コスパ最高で地元の味を楽しめる'
    }
  ],
  accommodations: [
    {
      name: 'ホテルルートイン松阪駅前',
      type: 'ビジネスホテル',
      description: '松阪駅徒歩2分の好立地。大浴場・無料朝食付き',
      distance: '松阪駅から徒歩2分',
      priceRange: '5,500円～7,500円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=102',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+松阪駅前',
      recommended: true,
      recommendComment: '駅近で大浴場付き！松阪遠征の鉄板ホテル'
    },
    {
      name: '快活CLUB 松阪店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '松阪駅から車で10分',
      priceRange: '2,000円～3,000円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業', '無料駐車場'],
      website: 'https://www.kaikatsu.jp/shop/matsusaka/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+松阪',
      recommended: true,
      recommendComment: '車での遠征なら最適！駐車場無料で予算も抑えられる'
    },
    {
      name: 'カプセルホテル松阪',
      type: 'カプセルホテル',
      description: 'サウナ・大浴場完備のカプセルホテル',
      distance: '松阪駅から徒歩8分',
      priceRange: '3,000円～4,000円/泊',
      features: ['大浴場', 'サウナ', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+松阪駅'
    },
    {
      name: '松阪シティホテル',
      type: 'シティホテル',
      description: '松阪駅すぐのシティホテル。清潔で快適な客室',
      distance: '松阪駅から徒歩3分',
      priceRange: '5,000円～8,000円/泊',
      features: ['無料Wi-Fi', 'コインランドリー', '駅近', '24時間フロント'],
      website: 'https://matsusaka-city-hotel.com/',
      mapsUrl: 'https://www.google.com/maps/search/松阪シティホテル'
    }
  ]
}

export default mie_maxa
