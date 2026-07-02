import { Venue } from '../types'

export const niigata_lots: Venue = {
  id: 'niigata_lots',
  name: '新潟LOTS',
  date: '2026-05-24T17:00:00+09:00',
  times: { open: '16:00', start: '17:00' },
  location: { 
    prefecture: '新潟県', 
    city: '新潟市',
    address: '新潟県新潟市中央区古町通6-953-1',
    nearestStation: 'JR新潟駅 バス15分'
  },
  capacity: 450,
  access: '【電車・徒歩】JR新潟駅から徒歩15分。【バス】JR新潟駅バスターミナル10番線より上所線ユニゾンプラザ・女池愛宕行「新潟LOTSバス停」（所要時分：7分）下車。路線バス・高速バスの場合は万代シティバスセンター下車、徒歩8分。【車】新潟西インター～新潟バイパス～新潟市街地方面～新潟バイパス桜木インター下車。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12590.125659419535!2d139.046599!3d37.918014!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff4c996145e5881%3A0xdd0292b911355ae7!2z5paw5r2f77ys77yv77y077yz!5e0!3m2!1sja!2sus!4v1764574654178!5m2!1sja!2sus',
  venueWebsite: 'https://www.fmniigata.com/lots/access',
  parkingInfo: '専用駐車場なし。近隣の有料駐車場をご利用ください。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '新潟空港',
        method: '空港バス',
        time: '約25分',
        description: '新潟空港からJR新潟駅行きバス→新潟駅から古町行きバスまたはタクシー',
        cost: '片道420円（空港→新潟駅）',
        notes: '空港バスは20〜30分間隔で運行'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '上越新幹線',
        time: '約2時間',
        description: '東京駅から上越新幹線とき・Maxときで新潟駅',
        cost: '片道10,500円前後',
        notes: '最速列車で約1時間40分'
      },
      {
        from: '大阪',
        method: '特急・新幹線',
        time: '約5時間',
        description: '大阪から特急サンダーバードで金沢→北陸新幹線で長野→上越新幹線で新潟',
        cost: '片道15,000円前後',
        notes: '複数回乗り換え必要'
      },
      {
        from: '名古屋',
        method: '特急・新幹線',
        time: '約4時間30分',
        description: '名古屋から特急しなので長野→上越新幹線で新潟',
        cost: '片道12,000円前後',
        notes: '長野での乗り換え'
      }
    ],
    fromExpressBus: [
      {
        from: '東京',
        method: '夜行高速バス',
        time: '約6時間',
        description: '東京駅から新潟駅行き夜行バス',
        cost: '片道5,000円前後',
        notes: '前日夜発・当日朝着。経済的な選択肢'
      },
      {
        from: '長野',
        method: '高速バス',
        time: '約3時間',
        description: '長野駅から新潟駅行き高速バス',
        cost: '片道3,500円前後',
        notes: '信越両県間の移動に便利'
      }
    ],
    fromCar: [
      {
        from: '東京方面',
        method: '関越自動車道',
        time: '約4時間',
        description: '関越自動車道を北上し、新潟西ICまたは新潟中央ICで降りて新潟市内へ。会場周辺に複数の有料駐車場あり。',
        cost: '高速料金 約6,500円（東京〜新潟西IC）',
        notes: '冬季は路面凍結・降雪に注意。スタッドレスタイヤ必須'
      },
      {
        from: '長野方面',
        method: '上信越自動車道',
        time: '約2時間30分',
        description: '上信越自動車道を経由し、新潟市内へ。',
        cost: '高速料金 約4,000円（長野〜新潟）',
        notes: '信越圏からのアクセスに便利'
      }
    ],
    recommendations: '東京から上越新幹線が最も便利。新潟空港も市内からアクセス良好。'
  },
  parkingOptions: [
    {
      name: 'パーキング古町',
      description: '古町通り近くの駐車場',
      price: '料金要確認',
      distance: '徒歩3分',
      mapsUrl: 'https://www.google.com/maps/search/駐車場+古町+新潟',
    },
    {
      name: 'タイムズ新潟古町',
      description: 'タイムズの駐車場',
      price: '料金要確認',
      distance: '徒歩5分',
      website: 'https://times-info.net/P15-niigata/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+新潟古町',
    },
  ],
  coinLockers: [
    {
      location: 'JR新潟駅構内',
      description: 'JR新潟駅構内のコインロッカー',
      price: '300円〜600円',
      distance: 'バス15分',
      website: 'https://www.jreast.co.jp/estation/stations/1345.html',
      mapsUrl: 'https://www.google.com/maps/search/JR新潟駅',
    },
    {
      location: '古町商店街',
      description: '古町商店街のコインロッカー',
      price: '料金要確認',
      distance: '徒歩2分',
      mapsUrl: 'https://www.google.com/maps/search/古町商店街+コインロッカー',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 新潟古町店',
      description: '古町通りのスターバックス',
      distance: '徒歩3分',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+新潟古町',
    },
    {
      name: 'タリーズコーヒー 新潟古町店',
      description: '古町エリアのタリーズ',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/タリーズコーヒー+新潟古町',
    },
  ],
  nearbyAttractions: [
    {
      name: '古町通商店街',
      description: '新潟の繁華街。老舗から新しい店まで充実',
      distance: '徒歩1分',
      website: 'https://www.furumachi-ichiba.com/'
    },
    {
      name: 'Befcoばかうけ展望室',
      description: '朱鷺メッセ31階の展望室。日本海と新潟市街を一望',
      distance: 'バスで20分',
      website: 'https://www.hotelnikkoniigata.jp/observatory/'
    },
    {
      name: '新潟市歴史博物館 みなとぴあ',
      description: '新潟の歴史と文化を学べる博物館',
      distance: 'バスで15分',
      website: 'https://www.nchm.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: '鮮寿司 丸伊',
      cuisine: '寿司',
      description: '新潟駅前の人気寿司店。日本海の新鮮な魚介が自慢',
      distance: '徒歩5分',
      openTime: '11:00-22:00',
      price: '2,000円～4,000円',
      mapsUrl: 'https://www.google.com/maps/search/丸伊+新潟駅',
      recommended: true,
      recommendComment: '日本海の鮮魚が絶品！のどぐろや南蛮エビは必食'
    },
    {
      name: 'バスセンターのカレー（万代そば）',
      cuisine: 'カレー',
      description: '新潟の伝説的カレー。Reolやyamaなども食べたことのある有名店',
      distance: '徒歩15分（新潟駅万代口バスターミナル内）',
      openTime: '8:00-19:00',
      price: '500円～650円',
      website: 'https://www.nvcb.or.jp/topics/bandaisoba',
      mapsUrl: 'https://www.google.com/maps/search/万代そば+新潟駅',
      recommended: true,
      recommendComment: 'Reolやyamaも食べたことがある新潟の超有名カレー！懐かしい味わいのバスセンターカレーは新潟のソウルフード'
    },
    {
      name: '越後長岡 小嶋屋 CoCoLo新潟店',
      cuisine: 'へぎそば',
      description: '新潟名物へぎそばの名店。海藻つなぎのつるつる食感が特徴',
      distance: '徒歩5分（新潟駅ビル内）',
      openTime: '11:00-21:00',
      price: '1,000円～1,800円',
      website: 'https://www.nagaokakojimaya.com/',
      mapsUrl: 'https://www.google.com/maps/search/小嶋屋+CoCoLo新潟',
      recommended: true,
      recommendComment: '新潟に来たらへぎそば！つなぎに海藻を使った独特の食感'
    },
    {
      name: 'イタリアン みかづき',
      cuisine: 'B級グルメ',
      description: '新潟のソウルフード「イタリアン」発祥の店',
      distance: '徒歩10分',
      openTime: '10:00-20:00',
      price: '500円～800円',
      mapsUrl: 'https://www.google.com/maps/search/みかづき+新潟',
    },
    {
      name: 'とんかつ 太郎',
      cuisine: 'タレカツ',
      description: '新潟名物タレカツ丼の名店',
      distance: '徒歩6分',
      openTime: '11:00-20:00',
      price: '900円～1,500円',
      mapsUrl: 'https://www.google.com/maps/search/タレカツ+新潟古町',
      recommended: true,
      recommendComment: '新潟のソウルフード！甘辛ダレがカツによく合う'
    }
  ],
  accommodations: [
    {
      name: '東横INN 新潟駅前',
      type: 'ビジネスホテル',
      description: '新潟駅徒歩3分の好立地。清潔で快適な客室、無料朝食付き',
      distance: '新潟駅から徒歩3分',
      priceRange: '5,000円～7,000円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00017/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+新潟駅前',
      recommended: true,
      recommendComment: '駅近で清潔、朝食無料！新潟遠征の定番ホテル'
    },
    {
      name: '快活CLUB 新潟駅前店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '新潟駅から徒歩5分',
      priceRange: '2,200円～3,200円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業'],
      website: 'https://www.kaikatsu.jp/shop/niigata-ekimae/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+新潟駅前',
      recommended: true,
      recommendComment: '予算重視なら最適！駅近で便利'
    },
    {
      name: 'カプセルホテル新潟',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル',
      distance: '新潟駅から徒歩8分',
      priceRange: '3,000円～4,000円/泊',
      features: ['大浴場', 'サウナ', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+新潟駅'
    },
    {
      name: 'ホテルルートイン新潟駅前',
      type: 'ビジネスホテル',
      description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
      distance: '新潟駅から徒歩6分',
      priceRange: '5,500円～8,000円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=45',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+新潟駅前'
    }
  ]
}

export default niigata_lots
