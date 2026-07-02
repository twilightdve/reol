import { Venue } from '../types'

export const aomori_quarter: Venue = {
  id: 'aomori_quarter',
  name: '青森Quarter',
  date: '2026-04-11T17:00:00+09:00',
  times: { open: '16:30', start: '17:00' },
  location: { 
    prefecture: '青森県', 
    city: '青森市',
    address: '青森県青森市安方2-11-3',
    nearestStation: 'JR青森駅 徒歩10分'
  },
  capacity: 300,
  access: 'JR青森駅から徒歩10分。一方通行側道沿いです。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12075.880840115598!2d140.742654!3d40.828618!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5f9b9ee18a2dd15f%3A0x368eeea3b964138f!2z6Z2S5qOuUXVhcnRlcg!5e0!3m2!1sja!2sus!4v1764561155762!5m2!1sja!2sus',
  venueWebsite: 'https://aomoriquarter.com/access',
  parkingInfo: 'お車の方は付近の有料駐車場をご利用ください。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '青森空港',
        method: '空港バス',
        time: '約35分',
        description: '青森空港からJR青森駅行きバス→青森駅から徒歩7分',
        cost: '片道710円',
        notes: '空港バスは1時間に1本程度'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '新幹線はやぶさ',
        time: '約3時間30分',
        description: '東京駅から東北新幹線はやぶさで新青森駅→JR奥羽本線で青森駅（5分）',
        cost: '片道17,000円前後',
        notes: '新青森駅から在来線で青森駅へ'
      },
      {
        from: '仙台',
        method: '新幹線はやぶさ',
        time: '約1時間30分',
        description: '仙台駅から東北新幹線はやぶさで新青森駅→JR奥羽本線で青森駅',
        cost: '片道9,000円前後',
        notes: '新青森駅から在来線利用'
      },
      {
        from: '名古屋・大阪',
        method: '飛行機推奨',
        time: '約4〜5時間（新幹線乗り継ぎ）',
        description: '東京経由で新幹線乗り継ぎより、飛行機が便利',
        cost: '',
        notes: '西日本からは青森空港利用が効率的'
      }
    ],
    fromExpressBus: [
      {
        from: '盛岡・八戸',
        method: '高速バス',
        time: '約2〜3時間',
        description: '東北各地から青森行きの高速バスが運行。青森駅到着後、徒歩で会場へ',
        cost: '片道2,500円〜4,000円',
        notes: '東北北部の移動に便利'
      }
    ],
    fromCar: [
      {
        from: '東京方面',
        method: '東北自動車道',
        time: '約8時間',
        description: '東北自動車道を北上し、青森ICで降りて青森市内へ。会場周辺に有料駐車場あり。',
        cost: '高速料金 約9,500円（東京〜青森IC）',
        notes: '長距離運転のため休憩を適宜取ること。冬季は路面凍結に注意'
      },
      {
        from: '仙台方面',
        method: '東北自動車道',
        time: '約4時間',
        description: '東北自動車道を北上し、青森ICで降りて青森市内へ。',
        cost: '高速料金 約5,500円（仙台〜青森IC）',
        notes: '東北圏内からのアクセスに便利'
      }
    ],
    recommendations: '青森空港からバス35分とアクセス良好。新幹線は新青森駅からJRで接続。東北北部の中心都市。'
  },
  parkingOptions: [
    {
      name: '青森駅前駐車場',
      description: '青森駅前の駐車場',
      price: '料金要確認',
      distance: '徒歩7分',
      website: 'https://times-info.net/P02-aomori/C201/park-detail-BUK0078339/',
      mapsUrl: 'https://www.google.com/maps/search/青森駅前駐車場',
    },
    {
      name: 'タイムズ青森駅前',
      description: 'タイムズの駐車場',
      price: '料金要確認',
      distance: '徒歩8分',
      website: 'https://times-info.net/P02-aomori/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+青森駅前',
    },
  ],
  coinLockers: [
    {
      location: 'JR青森駅構内',
      description: 'JR青森駅構内のコインロッカー',
      price: '300円〜600円',
      distance: '徒歩7分',
      website: 'https://www.jreast.co.jp/estation/stations/25.html',
      mapsUrl: 'https://www.google.com/maps/search/JR青森駅',
    },
    {
      location: 'ねぶたの家 ワ・ラッセ',
      description: 'ワ・ラッセ内のコインロッカー',
      price: '料金要確認',
      distance: '徒歩10分',
      mapsUrl: 'https://www.google.com/maps/search/ワラッセ+青森',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 青森駅前店',
      description: '青森駅前のスターバックス',
      distance: '徒歩5分',
      website: 'https://store.starbucks.co.jp/detail-4395/',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+青森駅前',
    },
    {
      name: 'ドトールコーヒー 青森店',
      description: 'ドトールコーヒーでライブ前後の休憩',
      distance: '徒歩6分',
      mapsUrl: 'https://www.google.com/maps/search/ドトールコーヒー+青森駅前',
    },
  ],
  nearbyAttractions: [
    {
      name: 'ねぶたの家 ワ・ラッセ',
      description: '青森ねぶた祭の博物館。実物大のねぶたを展示',
      distance: '徒歩10分',
      website: 'https://www.nebuta.jp/warasse/'
    },
    {
      name: '青森ベイブリッジ',
      description: '青森港のランドマーク。夜はライトアップされて美しい',
      distance: '徒歩15分',
      website: 'https://www.city.aomori.aomori.jp/'
    },
    {
      name: 'A-FACTORY',
      description: '青森の特産品が揃う複合施設。青森シードル工房も',
      distance: '徒歩12分',
      website: 'https://www.jre-abc.com/wp/afactory/'
    }
  ],
  nearbyRestaurants: [
    {
      name: '青森魚菜センター（のっけ丼）',
      cuisine: '海鮮丼',
      description: '自分で好きな刺身をのせる「のっけ丼」が名物。新鮮な海の幸を自由に選べる',
      distance: '徒歩8分',
      openTime: '7:00-16:00（日曜は9:00-）',
      price: '1,500円～2,500円',
      website: 'https://nokkedon.jp/',
      mapsUrl: 'https://www.google.com/maps/search/青森魚菜センター',
      recommended: true,
      recommendComment: '青森に来たら絶対食べたい！自分で選ぶ海鮮丼が楽しい'
    },
    {
      name: '味の札幌 大西',
      cuisine: 'ラーメン',
      description: '青森の味噌カレー牛乳ラーメン発祥の店',
      distance: '徒歩10分',
      openTime: '11:00-20:00',
      price: '800円～1,200円',
      mapsUrl: 'https://www.google.com/maps/search/味の札幌大西+青森',
      recommended: true,
      recommendComment: 'B級グルメの代表格！意外な組み合わせが絶品'
    },
    {
      name: '帆立小屋',
      cuisine: '海鮮',
      description: '青森名物のホタテを炭火焼きで楽しめる',
      distance: '徒歩12分',
      openTime: '11:00-21:00',
      price: '2,000円～3,500円',
      mapsUrl: 'https://www.google.com/maps/search/帆立小屋+青森',
    },
    {
      name: 'おさない食堂',
      cuisine: '郷土料理',
      description: '青森駅前の老舗食堂。帆立の味噌貝焼きやけの汁など青森の郷土料理が人気',
      distance: '徒歩3分',
      openTime: '7:00-21:00',
      price: '800円～1,500円',
      mapsUrl: 'https://www.google.com/maps/search/おさない食堂+青森駅',
      recommended: true,
      recommendComment: '青森駅前の名店！帆立の味噌貝焼きは絶品の郷土料理'
    }
  ],
  accommodations: [
    {
      name: 'ホテルルートイン青森駅前',
      type: 'ビジネスホテル',
      description: '青森駅徒歩3分の好立地。大浴場・無料朝食付き',
      distance: '青森駅から徒歩3分',
      priceRange: '5,500円～7,500円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=31',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+青森駅前',
      recommended: true,
      recommendComment: '駅近で大浴場付き！青森遠征の鉄板ホテル'
    },
    {
      name: '快活CLUB 青森店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '青森駅から車で10分',
      priceRange: '2,000円～3,000円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業', '無料駐車場'],
      website: 'https://www.kaikatsu.jp/shop/aomori/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+青森',
      recommended: true,
      recommendComment: '車での遠征なら最適！駐車場無料で予算も抑えられる'
    },
    {
      name: 'カプセルホテル青森',
      type: 'カプセルホテル',
      description: 'サウナ・大浴場完備のカプセルホテル',
      distance: '青森駅から徒歩7分',
      priceRange: '3,000円～4,000円/泊',
      features: ['大浴場', 'サウナ', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+青森駅'
    },
    {
      name: '東横INN 青森駅正面口',
      type: 'ビジネスホテル',
      description: '青森駅すぐの好立地。清潔で快適な客室',
      distance: '青森駅から徒歩2分',
      priceRange: '5,000円～7,000円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00052/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+青森駅正面口'
    }
  ]
}

export default aomori_quarter
