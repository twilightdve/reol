import { Venue } from '../types'

export const kyoto_fanj: Venue = {
  id: 'kyoto_fanj',
  name: '京都FANJ',
  date: '2026-05-30T17:00:00+09:00',
  times: { open: '16:00', start: '17:00' },
  location: { 
    prefecture: '京都府', 
    city: '京都市',
    address: '京都府京都市下京区四条通寺町東入2丁目御旅町48',
    nearestStation: '阪急河原町駅 徒歩3分'
  },
  capacity: 400,
  access: '阪急京都線河原町駅から徒歩3分。四条河原町の繁華街中心部。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13062.906161046772!2d135.77329198715822!3d35.06357539999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x600109d4f6424eed%3A0xb863587cf6e7534d!2z5Lqs6YO9RkFOSg!5e0!3m2!1sja!2sus!4v1764574692325!5m2!1sja!2sus',
  venueWebsite: 'http://www.kyoto-fanj.com/information.html',
  parkingInfo: '専用駐車場なし。四条河原町周辺の有料駐車場をご利用ください。京都市内は公共交通機関の利用を強く推奨します。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '関西国際空港',
        method: 'JR特急はるか',
        time: '約1時間15分',
        description: '関空からJR特急はるかで京都駅→阪急で河原町駅',
        cost: '片道3,600円',
        notes: '特急はるかは30分間隔で運行'
      },
      {
        from: '大阪国際空港（伊丹）',
        method: '空港バス',
        time: '約55分',
        description: '伊丹空港から京都駅行きリムジンバス',
        cost: '片道1,370円',
        notes: '20分間隔で運行'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '新幹線のぞみ',
        time: '約2時間15分',
        description: '東京駅から新幹線のぞみで京都駅→地下鉄・阪急で河原町駅',
        cost: '片道13,500円前後',
        notes: '京都駅から阪急・地下鉄利用'
      },
      {
        from: '大阪',
        method: '阪急',
        time: '約45分',
        description: '大阪梅田駅から阪急京都線特急で河原町駅',
        cost: '片道400円',
        notes: '10分間隔で運行'
      },
      {
        from: '名古屋',
        method: '新幹線のぞみ',
        time: '約35分',
        description: '名古屋駅から新幹線のぞみで京都駅',
        cost: '片道5,600円前後',
        notes: '京都駅から阪急利用'
      }
    ],
    fromCar: [
      {
        from: '大阪方面',
        method: '名神高速道路',
        time: '約50分',
        description: '名神高速を経由し、京都南ICで降りて京都市内へ。会場周辺に複数の有料駐車場あり。',
        cost: '高速料金 約1,200円（大阪〜京都南IC）',
        notes: '京都市内は観光シーズン混雑するため公共交通機関推奨'
      },
      {
        from: '名古屋方面',
        method: '名神高速道路',
        time: '約2時間',
        description: '名神高速を経由し、京都南ICで降りて京都市内へ。',
        cost: '高速料金 約3,500円（名古屋〜京都南IC）',
        notes: '関西・中部圏からのアクセスに便利'
      }
    ],
    recommendations: '関空から特急はるかが便利。大阪から阪急で45分。新幹線は京都駅から阪急・地下鉄利用。'
  },
  parkingOptions: [
    {
      name: 'タイムズ四条河原町',
      description: '四条河原町エリアの駐車場',
      price: '30分400円',
      distance: '徒歩5分',
      website: 'https://times-info.net/P26-kyoto/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+四条河原町',
    },
    {
      name: '京都市営四条駐車場',
      description: '市営の駐車場',
      price: '30分250円',
      distance: '徒歩7分',
      mapsUrl: 'https://www.google.com/maps/search/京都市営+四条駐車場',
    },
  ],
  coinLockers: [
    {
      location: '阪急河原町駅構内',
      description: '阪急河原町駅構内のコインロッカー',
      price: '300円〜500円',
      distance: '徒歩3分',
      website: 'https://www.hankyu.co.jp/station/kawaramachi.html',
      mapsUrl: 'https://www.google.com/maps/search/阪急河原町駅',
    },
    {
      location: '四条河原町商店街',
      description: '繁華街のコインロッカー',
      price: '料金要確認',
      distance: '徒歩2分',
      mapsUrl: 'https://www.google.com/maps/search/四条河原町+コインロッカー',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 京都四条大宮店',
      description: '四条エリアのスターバックス',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+京都四条',
    },
    {
      name: '%Arabica Kyoto',
      description: '京都発の人気コーヒーショップ',
      distance: '徒歩10分',
      website: 'https://arabica.coffee/',
      mapsUrl: 'https://www.google.com/maps/search/%Arabica+京都',
    },
  ],
  nearbyAttractions: [
    {
      name: '清水寺',
      description: '京都を代表する寺院。清水の舞台で有名',
      distance: 'バスで15分',
      website: 'https://www.kiyomizudera.or.jp/'
    },
    {
      name: '八坂神社',
      description: '祇園祭で有名な神社',
      distance: '徒歩15分',
      website: 'https://www.yasaka-jinja.or.jp/'
    },
    {
      name: '錦市場',
      description: '京の台所。京都の食材が揃う市場',
      distance: '徒歩5分',
      website: 'https://www.kyoto-nishiki.or.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: '出町ふたば',
      cuisine: '和菓子',
      description: '行列必至の名代豆餅が名物。創業1899年の老舗和菓子店',
      distance: '徒歩3分',
      openTime: '8:30-17:30',
      price: '200円～500円',
      mapsUrl: 'https://www.google.com/maps/search/出町ふたば+京都',
      recommended: true,
      recommendComment: '出町柳の超有名店！名代豆餅は行列必至の絶品'
    },
    {
      name: '先斗町 ろっこん',
      cuisine: '京料理',
      description: '先斗町の京料理店。旬の食材を使った懐石',
      distance: '徒歩8分',
      openTime: '17:00-23:00',
      price: '5,000円～10,000円',
      mapsUrl: 'https://www.google.com/maps/search/ろっこん+先斗町',
      recommended: true,
      recommendComment: '京都の風情を感じる先斗町で本格京料理'
    },
    {
      name: '中華のサカイ 本店',
      cuisine: '中華',
      description: '京都で愛される冷麺が名物の老舗町中華',
      distance: '徒歩15分',
      openTime: '11:30-21:00',
      price: '800円～1,200円',
      mapsUrl: 'https://www.google.com/maps/search/中華のサカイ+京都+北大路',
    },
    {
      name: '名代おめん 銀閣寺本店',
      cuisine: 'うどん',
      description: '京都の人気手打ちうどん店。つけ麺スタイルが特徴',
      distance: 'バス15分',
      openTime: '11:00-21:00',
      price: '1,200円～1,800円',
      website: 'https://www.omen.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/名代おめん+銀閣寺+京都',
      recommended: true,
      recommendComment: '京都の人気うどん店！もちもちの手打ちうどんが絶品'
    }
  ],
  accommodations: [
    {
      name: '東横INN 京都四条烏丸',
      type: 'ビジネスホテル',
      description: '四条駅徒歩3分の好立地。清潔で快適な客室、無料朝食付き',
      distance: '四条駅から徒歩3分',
      priceRange: '6,000円～8,500円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00025/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+京都四条烏丸',
      recommended: true,
      recommendComment: '四条駅近くで便利！京都遠征の定番ホテル'
    },
    {
      name: '快活CLUB 京都河原町店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '河原町駅から徒歩5分',
      priceRange: '2,500円～3,500円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業'],
      website: 'https://www.kaikatsu.jp/shop/kyoto-kawaramachi/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+京都河原町',
      recommended: true,
      recommendComment: '繁華街に近くて便利！予算を抑えたい時に最適'
    },
    {
      name: 'ナインアワーズ京都',
      type: 'カプセルホテル',
      description: 'デザイン性の高いカプセルホテル。快適な睡眠空間とシャワーブース完備',
      distance: '四条駅から徒歩5分',
      priceRange: '4,500円～6,000円/泊',
      features: ['シャワーブース', '無料Wi-Fi', 'ロッカー', '洗練されたデザイン', '女性専用フロア'],
      website: 'https://ninehours.co.jp/kyoto/',
      mapsUrl: 'https://www.google.com/maps/search/ナインアワーズ+京都',
      recommended: true,
      recommendComment: 'デザイン性と機能性を両立した快適なカプセルホテル！清潔感抜群'
    },
    {
      name: 'カプセルホテル京都',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル。女性専用フロアあり',
      distance: '四条駅から徒歩6分',
      priceRange: '3,500円～5,000円/泊',
      features: ['大浴場', 'サウナ', '女性専用フロア', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+京都四条'
    },
    {
      name: 'ホテルルートイン京都四条烏丸',
      type: 'ビジネスホテル',
      description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
      distance: '四条駅から徒歩7分',
      priceRange: '6,500円～9,000円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=440',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+京都四条烏丸'
    }
  ]
}

export default kyoto_fanj
