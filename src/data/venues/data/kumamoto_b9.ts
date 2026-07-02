import { Venue } from '../types'

export const kumamoto_b9: Venue = {
  id: 'kumamoto_b9',
  name: '熊本B.9 V1',
  date: '2026-04-19T17:00:00+09:00',
  times: { open: '16:30', start: '17:00' },
  location: { 
    prefecture: '熊本県', 
    city: '熊本市',
    address: '熊本県熊本市中央区城東町5-13',
    nearestStation: '熊本市電 通町筋電停 徒歩3分'
  },
  capacity: 500,
  access: '熊本市電通町筋電停から徒歩3分。下通アーケード内でアクセス良好。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13413.921450383226!2d130.710823!3d32.806035!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3540f40f2b20db95%3A0x912e1c5e2053a1be!2z54aK5pysIEIuOQ!5e0!3m2!1sja!2sus!4v1764561645529!5m2!1sja!2sus',
  venueWebsite: 'http://www.live-drum.com/be9/index1.shtml',
  parkingInfo: '専用駐車場なし。周辺の有料駐車場をご利用ください。市電の利用を推奨します。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '熊本空港',
        method: '空港バス',
        time: '約50分',
        description: '熊本空港からJR熊本駅行きバス→熊本駅から市電で通町筋電停',
        cost: '片道800円',
        notes: '空港バスは15〜20分間隔で運行'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '新幹線さくら・みずほ',
        time: '約5時間30分',
        description: '東京駅から九州新幹線でJR熊本駅→市電で通町筋電停',
        cost: '片道22,000円前後',
        notes: '熊本駅から市電利用'
      },
      {
        from: '大阪',
        method: '新幹線さくら・みずほ',
        time: '約3時間',
        description: '新大阪駅から九州新幹線でJR熊本駅→市電で通町筋電停',
        cost: '片道16,000円前後',
        notes: '新幹線で直接アクセス可能'
      },
      {
        from: '福岡（博多）',
        method: '新幹線さくら・みずほ',
        time: '約35分',
        description: '博多駅から九州新幹線でJR熊本駅',
        cost: '片道5,000円前後',
        notes: '最速30分台で到着'
      }
    ],
    fromExpressBus: [
      {
        from: '福岡',
        method: '高速バス',
        time: '約2時間',
        description: '福岡（天神・博多）から熊本行き高速バス',
        cost: '片道2,000円前後',
        notes: '新幹線より安価'
      }
    ],
    fromCar: [
      {
        from: '福岡方面',
        method: '九州自動車道',
        time: '約1時間30分',
        description: '九州自動車道を南下し、熊本ICで降りて熊本市内へ。会場周辺に複数の有料駐車場あり。',
        cost: '高速料金 約2,500円（福岡〜熊本IC）',
        notes: '熊本市街地の駐車場は事前確認推奨'
      },
      {
        from: '鹿児島方面',
        method: '九州自動車道',
        time: '約2時間',
        description: '九州自動車道を北上し、熊本ICで降りて熊本市内へ。',
        cost: '高速料金 約3,000円（鹿児島〜熊本IC）',
        notes: '南九州からのアクセスに便利'
      }
    ],
    recommendations: '九州新幹線で熊本駅に直接アクセス可能。市内は路面電車が便利。'
  },
  parkingOptions: [
    {
      name: 'タイムズ熊本下通',
      description: '下通アーケード近くの駐車場',
      price: '料金要確認',
      distance: '徒歩3分',
      website: 'https://times-info.net/P43-kumamoto/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+熊本下通',
    },
    {
      name: '下通パーキング',
      description: '会場近くの駐車場',
      price: '料金要確認',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/下通+駐車場+熊本',
    },
  ],
  coinLockers: [
    {
      location: 'JR熊本駅構内',
      description: 'JR熊本駅構内のコインロッカー',
      price: '300円〜600円',
      distance: '市電15分',
      website: 'https://www.jrkyushu.co.jp/railway/station/1191220_1601.html',
      mapsUrl: 'https://www.google.com/maps/search/JR熊本駅',
    },
    {
      location: '下通アーケード',
      description: '下通アーケード内のコインロッカー',
      price: '料金要確認',
      distance: '徒歩2分',
      mapsUrl: 'https://www.google.com/maps/search/下通アーケード+コインロッカー',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 熊本下通店',
      description: '下通アーケード内のスターバックス',
      distance: '徒歩3分',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+熊本下通',
    },
    {
      name: 'ドトールコーヒー 熊本店',
      description: 'ドトールコーヒーでライブ前後の休憩',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/ドトールコーヒー+熊本',
    },
  ],
  nearbyAttractions: [
    {
      name: '熊本城',
      description: '日本三名城の一つ。復興中だが見学可能',
      distance: '徒歩15分',
      website: 'https://castle.kumamoto-guide.jp/'
    },
    {
      name: '水前寺成趣園',
      description: '桃山式回遊庭園。美しい日本庭園',
      distance: '市電で20分',
      website: 'https://www.suizenji.or.jp/'
    },
    {
      name: '上通・下通アーケード',
      description: '熊本最大の繁華街。ショッピングや飲食店が充実',
      distance: '徒歩すぐ',
      website: 'https://kumamoto-guide.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: '桂花ラーメン',
      cuisine: '熊本ラーメン',
      description: '熊本ラーメンの名店。濃厚な豚骨スープと焦がしニンニク',
      distance: '徒歩5分',
      openTime: '11:00-22:00',
      price: '800円～1,200円',
      website: 'https://www.keika-raumen.com/',
      mapsUrl: 'https://www.google.com/maps/search/桂花ラーメン+熊本',
      recommended: true,
      recommendComment: '熊本ラーメンの代表格！焦がしニンニクの香りが食欲をそそる'
    },
    {
      name: '天外天',
      cuisine: '熊本ラーメン',
      description: '熊本ラーメンの老舗。あっさり系も選べる',
      distance: '徒歩7分',
      openTime: '11:30-21:00',
      price: '700円～1,000円',
      mapsUrl: 'https://www.google.com/maps/search/天外天+熊本',
    },
    {
      name: '馬肉料理 菅乃屋',
      cuisine: '馬肉',
      description: '熊本名物の馬刺しや馬肉料理専門店',
      distance: '徒歩10分',
      openTime: '17:00-23:00',
      price: '3,000円～5,000円',
      website: 'https://www.suganoya.com/',
      mapsUrl: 'https://www.google.com/maps/search/菅乃屋+熊本',
      recommended: true,
      recommendComment: '熊本といえば馬刺し！新鮮で柔らかい馬肉を堪能'
    },
    {
      name: '黒亭',
      cuisine: '熊本ラーメン',
      description: '熊本ラーメンの名店。黒麻油とニンニクチップが特徴',
      distance: '徒歩6分',
      openTime: '11:00-21:00',
      price: '750円～1,000円',
      mapsUrl: 'https://www.google.com/maps/search/黒亭+熊本',
      recommended: true,
      recommendComment: '熊本ラーメンの別格！パンチのある黒麻油がクセになる'
    }
  ],
  accommodations: [
    {
      name: '東横INN 熊本駅前',
      type: 'ビジネスホテル',
      description: '熊本駅徒歩3分の好立地。清潔で快適な客室、無料朝食付き',
      distance: '熊本駅から徒歩3分',
      priceRange: '5,000円～7,000円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00099/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+熊本駅前',
      recommended: true,
      recommendComment: '駅近で清潔、朝食無料！熊本遠征の定番ホテル'
    },
    {
      name: '快活CLUB 熊本下通店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '通町筋電停から徒歩3分',
      priceRange: '2,200円～3,200円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業'],
      website: 'https://www.kaikatsu.jp/shop/kumamoto-shimotori/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+熊本下通',
      recommended: true,
      recommendComment: '繁華街に近くて便利！予算も抑えられる'
    },
    {
      name: 'カプセルホテル熊本',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル',
      distance: '熊本駅から徒歩6分',
      priceRange: '3,000円～4,000円/泊',
      features: ['大浴場', 'サウナ', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+熊本駅'
    },
    {
      name: 'ホテルルートイン熊本駅前',
      type: 'ビジネスホテル',
      description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
      distance: '熊本駅から徒歩5分',
      priceRange: '5,500円～8,000円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=144',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+熊本駅前'
    }
  ]
}

export default kumamoto_b9
