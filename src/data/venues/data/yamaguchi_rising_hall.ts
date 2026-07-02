import { Venue } from '../types'

export const yamaguchi_rising_hall: Venue = {
  id: 'yamaguchi_rising_hall',
  name: '周南RISING HALL',
  date: '2026-03-22T17:00:00+09:00',
  times: { open: '16:15', start: '17:00' },
  location: { 
    prefecture: '山口県', 
    city: '周南市',
    address: '山口県周南市銀南街49番地4F',
    nearestStation: 'JR徳山駅 みゆき口より徒歩5分'
  },
  capacity: 544,
  access: '【電車】JR徳山駅みゆき口から徒歩約5分。銀南街の4階。【車】山陽道「徳山東IC」から約15分、「徳山西IC」から約25分。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13222.940123617624!2d131.7879645554199!3d34.05066740000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3544e6fde5f00001%3A0xd4d0c5e21e84a6d9!2sRISING%20HALL!5e0!3m2!1sja!2sus!4v1764560579834!5m2!1sja!2sus',
  venueWebsite: 'https://risinghallshunan.wixsite.com/rising-hall/access',
  parkingInfo: '専用駐車場なし。近隣駐車場利用（周南市営徳山駅前駐車場など）。公共交通機関の利用を推奨。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '山口宇部空港',
        method: '空港バス + JR',
        time: '約1時間30分',
        description: '山口宇部空港からJR新山口駅行き空港バス（35分）→新山口駅から山陽本線でJR徳山駅（25分）',
        cost: '片道1,500円程度',
        notes: '空港バスは1時間に1本程度'
      },
      {
        from: '広島空港',
        method: '空港バス + JR',
        time: '約2時間',
        description: '広島空港から広島駅行きバス（50分）→広島駅から山陽本線でJR徳山駅（60分）',
        cost: '片道2,500円程度',
        notes: '広島空港からのアクセスも便利'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '新幹線のぞみ',
        time: '約4時間30分',
        description: '東京駅から新幹線のぞみで新山口駅→山陽本線でJR徳山駅（25分）',
        cost: '片道20,000円前後',
        notes: '新山口駅で乗り換え'
      },
      {
        from: '大阪',
        method: '新幹線のぞみ',
        time: '約2時間30分',
        description: '新大阪駅から新幹線のぞみで新山口駅→山陽本線でJR徳山駅（25分）',
        cost: '片道12,000円前後',
        notes: '新山口駅で乗り換え'
      },
      {
        from: '広島',
        method: '山陽本線',
        time: '約1時間',
        description: '広島駅から山陽本線でJR徳山駅へ直通',
        cost: '片道2,000円前後',
        notes: '新幹線利用で30分に短縮可能'
      }
    ],
    fromExpressBus: [
      {
        from: '広島',
        method: '高速バス',
        time: '約2時間',
        description: '広島バスセンターから徳山行き高速バス。JR徳山駅下車',
        cost: '片道2,500円前後',
        notes: '1日数本運行。渋滞の影響を受ける可能性あり'
      },
      {
        from: '福岡',
        method: '高速バス',
        time: '約2時間30分',
        description: '博多バスターミナルから徳山行き高速バス',
        cost: '片道3,000円前後',
        notes: '九州方面からのアクセスに便利'
      }
    ],
    fromCar: [
      {
        from: '広島方面',
        method: '山陽自動車道',
        time: '約1時間30分',
        description: '山陽自動車道を西進し、徳山東ICで降りてJR徳山駅方面へ。駅周辺に有料駐車場あり。',
        cost: '高速料金 約2,500円（広島〜徳山東IC）',
        notes: '山口市街地の駐車場は事前確認推奨'
      },
      {
        from: '福岡方面',
        method: '中国自動車道',
        time: '約1時間30分',
        description: '中国自動車道を東進し、小郡ICで降りてJR徳山駅方面へ。',
        cost: '高速料金 約2,000円（福岡〜小郡IC）',
        notes: '九州方面からのアクセスに便利'
      }
    ],
    recommendations: '山陽新幹線の新山口駅が最寄り。広島方面からは在来線でもアクセス良好。'
  },
  parkingOptions: [
    {
      name: 'タイムズ徳山駅前',
      description: 'JR徳山駅前の駐車場',
      price: '料金要確認',
      distance: '徒歩10分',
      website: 'https://times-info.net/P35-yamaguchi/line/L39700/S7208/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+徳山駅前',
    },
    {
      name: '周南市中心市街地駐車場',
      description: '会場近くの市営駐車場',
      price: '料金要確認',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/周南市+駐車場+本町',
    },
  ],
  coinLockers: [
    {
      location: 'JR徳山駅構内',
      description: 'JR徳山駅構内のコインロッカー',
      price: '料金要確認',
      distance: '徒歩10分',
      website: 'https://www.jr-odekake.net/eki/premises?id=0800661',
      mapsUrl: 'https://www.google.com/maps/search/JR徳山駅',
    },
    {
      location: '徳山駅前商店街',
      description: '駅前商店街のコインロッカー',
      price: '料金要確認',
      distance: '徒歩8分',
      mapsUrl: 'https://www.google.com/maps/search/徳山駅前商店街+コインロッカー',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 徳山駅前店',
      description: 'JR徳山駅前のスターバックス',
      distance: '徒歩10分',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+徳山駅前',
    },
    {
      name: 'ドトールコーヒー 徳山店',
      description: 'ドトールコーヒーでライブ前後の休憩に',
      distance: '徒歩8分',
      mapsUrl: 'https://www.google.com/maps/search/ドトールコーヒー+徳山',
    },
  ],
  nearbyAttractions: [
    {
      name: '周南市美術博物館',
      description: '周南市の歴史と美術品を展示。コンビナートの写真展示も',
      distance: '徒歩15分',
      website: 'https://s-bunka.jp/bihaku/'
    },
    {
      name: '徳山動物園',
      description: 'ペンギンやゾウなど多彩な動物が見られる動物園',
      distance: '車で約10分',
      website: 'https://www.tokuyama-zoo.jp/'
    },
    {
      name: '周南工場夜景',
      description: '日本有数の石油化学コンビナートの夜景スポット',
      distance: '車で約15分（晴海親水公園展望台）',
      website: 'https://www.city.shunan.lg.jp/site/kanko/3091.html'
    }
  ],
  nearbyRestaurants: [
    {
      name: '洋食の店 アラスカ',
      cuisine: '洋食',
      description: '徳山で長年愛される老舗洋食レストラン。ハンバーグやエビフライが人気',
      distance: '徒歩5分',
      openTime: '11:30-15:00、17:00-21:00',
      price: '1,000円～2,000円',
      mapsUrl: 'https://www.google.com/maps/search/洋食の店+アラスカ+周南市',
      recommended: true,
      recommendComment: '地元民イチオシの老舗洋食店！ハンバーグが絶品'
    },
    {
      name: '鶏そば カヲル',
      cuisine: 'ラーメン',
      description: '鶏白湯スープが評判のラーメン店。塩ラーメンが特に人気',
      distance: '徒歩10分',
      openTime: '11:00-14:30、17:30-21:00',
      price: '1,000円～1,500円',
      mapsUrl: 'https://www.google.com/maps/search/鶏そば+カヲル+周南市',
      recommended: true,
      recommendComment: '食べログ高評価！濃厚鶏白湯の塩ラーメンは必食'
    },
    {
      name: '炉ばた 魚竹',
      cuisine: '海鮮・居酒屋',
      description: '新鮮な魚介と炉端焼きが楽しめる人気の居酒屋。地酒も充実',
      distance: '徒歩10分（徳山駅から徒歩3分）',
      openTime: '17:00-23:00',
      price: '3,000円～5,000円',
      mapsUrl: 'https://www.google.com/maps/search/炉ばた+魚竹+周南市',
    },
    {
      name: '周南Diningぜん 徳山駅前店',
      cuisine: '居酒屋・海鮮',
      description: '山口県名物や旬の魚介を地酒とともに堪能できる居酒屋。個室あり',
      distance: '徒歩10分（徳山駅から徒歩2分）',
      openTime: '17:00-24:00',
      price: '3,000円～4,000円',
      mapsUrl: 'https://www.google.com/maps/search/周南Diningぜん+徳山駅前店',
    }
  ],
  accommodations: [
    {
      name: 'ホテルサンルート徳山',
      type: 'ビジネスホテル',
      description: '徳山駅徒歩3分の好立地。清潔で機能的な客室、無料朝食付き',
      distance: '徳山駅から徒歩3分',
      priceRange: '5,000円～7,500円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.sunroute.jp/tokuyama/',
      mapsUrl: 'https://www.google.com/maps/search/ホテルサンルート徳山',
      recommended: true,
      recommendComment: '駅近で朝食付き！徳山遠征の鉄板ホテル'
    },
    {
      name: '快活CLUB 周南店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '徳山駅から車で10分',
      priceRange: '2,200円～3,200円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業', '無料駐車場'],
      website: 'https://www.kaikatsu.jp/shop/shunan/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+周南',
      recommended: true,
      recommendComment: '車での遠征なら最適！駐車場無料で予算も抑えられる'
    },
    {
      name: 'ホテルルートイン徳山駅前',
      type: 'ビジネスホテル',
      description: '大浴場完備のビジネスホテル。徳山駅から徒歩圏内',
      distance: '徳山駅から徒歩5分',
      priceRange: '5,500円～8,000円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=393',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+徳山駅前'
    },
    {
      name: 'カプセルホテル徳山',
      type: 'カプセルホテル',
      description: 'サウナ付きカプセルホテル。深夜チェックイン可能',
      distance: '徳山駅から徒歩8分',
      priceRange: '3,000円～4,000円/泊',
      features: ['サウナ', '大浴場', '無料Wi-Fi', '深夜チェックインOK'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+徳山駅'
    }
  ]
}

export default yamaguchi_rising_hall
