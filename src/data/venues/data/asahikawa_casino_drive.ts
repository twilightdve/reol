import { Venue } from '../types'

export const asahikawa_casino_drive: Venue = {
  id: 'asahikawa_casino_drive',
  name: '旭川CASINO DRIVE',
  date: '2026-05-09T17:00:00+09:00',
  times: { open: '16:30', start: '17:00' },
  location: { 
    prefecture: '北海道', 
    city: '旭川市',
    address: '北海道旭川市3条通8丁目',
    nearestStation: 'JR旭川駅 徒歩15分'
  },
  capacity: 400,
  gradient: {
    from: '#4682B4',
    to: '#B0E0E6'
  },
  access: '【電車】JR旭川駅から徒歩15分。【バス】道北バス市役所前停留所から徒歩2分。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d11524.749527076094!2d142.36144!3d43.768969!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5f0ce6733730f9df%3A0xc6b3654c2342b63b!2sCASINO%20DRIVE!5e0!3m2!1sja!2sus!4v1764573939232!5m2!1sja!2sus',
  venueWebsite: 'https://www.casinodrive.info/',
  parkingInfo: '専用駐車場なし。近隣の有料駐車場をご利用ください。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '旭川空港',
        method: '空港バス',
        time: '約35分',
        description: '旭川空港からJR旭川駅行きバス→旭川駅から徒歩10分',
        cost: '片道650円',
        notes: '空港バスは便に合わせて運行'
      },
      {
        from: '新千歳空港',
        method: 'JR特急',
        time: '約1時間30分',
        description: '新千歳空港駅から特急カムイで旭川駅',
        cost: '片道6,000円前後',
        notes: '札幌経由より空港から直接が便利'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '飛行機推奨',
        time: '約8時間（新幹線+特急）',
        description: '東京から新幹線で新函館北斗→特急で札幌→特急で旭川。飛行機が現実的',
        cost: '片道30,000円以上',
        notes: '羽田から旭川空港直行便利用が効率的'
      },
      {
        from: '札幌',
        method: 'JR特急',
        time: '約1時間30分',
        description: '札幌駅から特急カムイ・ライラックで旭川駅',
        cost: '片道4,500円前後',
        notes: '1時間に1本程度運行'
      }
    ],
    fromExpressBus: [
      {
        from: '札幌',
        method: '高速バス',
        time: '約2時間',
        description: '札幌から旭川行き高速バス',
        cost: '片道2,000円前後',
        notes: '特急より安価'
      }
    ],
    fromCar: [
      {
        from: '札幌方面',
        method: '道央自動車道',
        time: '約2時間',
        description: '道央自動車道を北上し、旭川北ICで降りて旭川市内へ。会場周辺に有料駐車場あり。',
        cost: '高速料金 約3,000円（札幌〜旭川北IC）',
        notes: '冬季は路面凍結・吹雪に注意。スタッドレスタイヤ必須'
      },
      {
        from: '帯広方面',
        method: '道東自動車道',
        time: '約3時間',
        description: '道東自動車道を経由し、旭川市内へ。',
        cost: '高速料金 約4,500円（帯広〜旭川）',
        notes: '道東圏からのアクセスに便利。冬季は天候に注意'
      }
    ],
    recommendations: '旭川空港からバス35分。札幌から特急で1時間30分。道北の中心都市。'
  },
  parkingOptions: [
    {
      name: 'タイムズ旭川3条通',
      description: '会場近くの駐車場',
      price: '料金要確認',
      distance: '徒歩5分',
      website: 'https://times-info.net/P01-hokkaido/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+旭川3条通',
    },
    {
      name: '旭川駅前駐車場',
      description: 'JR旭川駅前の駐車場',
      price: '料金要確認',
      distance: '徒歩10分',
      mapsUrl: 'https://www.google.com/maps/search/旭川駅前+駐車場',
    },
  ],
  coinLockers: [
    {
      location: 'JR旭川駅構内',
      description: 'JR旭川駅構内のコインロッカー',
      price: '300円〜600円',
      distance: '徒歩10分',
      website: 'https://www.jrhokkaido.co.jp/network/station/station.html#4211',
      mapsUrl: 'https://www.google.com/maps/search/JR旭川駅',
    },
    {
      location: '3条通商店街',
      description: '繁華街のコインロッカー',
      price: '料金要確認',
      distance: '徒歩3分',
      mapsUrl: 'https://www.google.com/maps/search/旭川3条通+コインロッカー',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 旭川駅前店',
      description: '旭川駅前のスターバックス',
      distance: '徒歩10分',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+旭川駅前',
    },
    {
      name: 'ドトールコーヒー 旭川店',
      description: 'ドトールコーヒーでライブ前後の休憩',
      distance: '徒歩8分',
      mapsUrl: 'https://www.google.com/maps/search/ドトールコーヒー+旭川',
    },
  ],
  nearbyAttractions: [
    {
      name: '旭山動物園',
      description: '行動展示で有名な動物園。ペンギンの散歩が人気',
      distance: 'バスで40分',
      website: 'https://www.city.asahikawa.hokkaido.jp/asahiyamazoo/'
    },
    {
      name: '旭川ラーメン村',
      description: '旭川ラーメンの有名店が集まる',
      distance: '車で15分',
      website: 'https://www.ramenmura.com/'
    },
    {
      name: '上野ファーム',
      description: '北海道ガーデン街道の一つ。美しい庭園',
      distance: '車で30分',
      website: 'https://www.uenofarm.net/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'ラーメン山頭火',
      cuisine: '旭川ラーメン',
      description: '旭川ラーメンの名店。塩ラーメンが人気',
      distance: '徒歩7分',
      openTime: '11:00-21:00',
      price: '800円～1,200円',
      website: 'https://www.santouka.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/山頭火+旭川',
      recommended: true,
      recommendComment: '旭川ラーメンの代表格！しょうゆと塩、両方試したい'
    },
    {
      name: '梅光軒',
      cuisine: '旭川ラーメン',
      description: '旭川ラーメンの老舗。醤油ラーメンが絶品',
      distance: '徒歩10分',
      openTime: '11:00-20:00',
      price: '800円～1,000円',
      mapsUrl: 'https://www.google.com/maps/search/梅光軒+旭川',
      recommended: true,
      recommendComment: '旭川ラーメンの元祖！コクのある醤油スープが特徴'
    },
    {
      name: '成吉思汗 大黒屋',
      cuisine: 'ジンギスカン',
      description: '北海道名物のジンギスカン。炭火焼きが美味',
      distance: '徒歩12分',
      openTime: '17:00-23:00',
      price: '3,000円～5,000円',
      mapsUrl: 'https://www.google.com/maps/search/成吉思汗大黒屋+旭川',
    },
    {
      name: '青葉',
      cuisine: '旭川ラーメン',
      description: '旭川ラーメンの名店。醤油ラーメンが人気',
      distance: '徒歩9分',
      openTime: '11:00-20:00',
      price: '750円～1,000円',
      mapsUrl: 'https://www.google.com/maps/search/青葉+旭川ラーメン',
      recommended: true,
      recommendComment: '地元民が通う名店！麻婦豆腐トッピングが絶品'
    }
  ],
  accommodations: [
    {
      name: '東横INN 旭川駅前',
      type: 'ビジネスホテル',
      description: '旭川駅徒歩3分の好立地。清潔で快適な客室、無料朝食付き',
      distance: '旭川駅から徒歩3分',
      priceRange: '5,000円～7,000円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00012/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+旭川駅前',
      recommended: true,
      recommendComment: '駅近で清潔、朝食無料！旭川遠征の定番ホテル'
    },
    {
      name: '快活CLUB 旭川店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '旭川駅から車で10分',
      priceRange: '2,000円～3,000円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業', '無料駐車場'],
      website: 'https://www.kaikatsu.jp/shop/asahikawa/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+旭川',
      recommended: true,
      recommendComment: '車での遠征なら最適！駐車場無料で予算も抑えられる'
    },
    {
      name: 'カプセルホテル旭川',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル',
      distance: '旭川駅から徒歩6分',
      priceRange: '3,000円～4,000円/泊',
      features: ['大浴場', 'サウナ', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+旭川駅'
    },
    {
      name: 'ホテルルートイン旭川駅前',
      type: 'ビジネスホテル',
      description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
      distance: '旭川駅から徒歩5分',
      priceRange: '5,500円～8,000円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=20',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+旭川駅前'
    }
  ]
}

export default asahikawa_casino_drive
