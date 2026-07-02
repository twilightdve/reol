import { Venue } from '../types'

export const tokushima_grindhouse: Venue = {
  id: 'tokushima_grindhouse',
  name: '徳島club GRINDHOUSE',
  date: '2026-03-20T17:00:00+09:00',
  times: { open: '16:30', start: '17:00' },
  location: { 
    prefecture: '徳島県', 
    city: '徳島市',
    address: '徳島県徳島市秋田町2-23 ジョイフルビル3F',
    nearestStation: 'JR阿波富田駅 徒歩8分'
  },
  capacity: 230,
  access: '【電車】JR阿波富田駅から徒歩8分。駅を西へ、コインパーキングとサントリープラザビルがある交差点を左折し2〜3分。ジョイフルビル3階。【車】徳島道「徳島IC」下車、国道11号を南（県庁・阿南方面）へ、県庁前交差点を右折、3つ目の信号を左折、2つ目の信号手前右側。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6610.42566365473!2d134.549314!3d34.064058!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x355372a7e88ea9f3%3A0xd18469e3d702bada!2sclub%20GRINDHOUSE!5e0!3m2!1sja!2sjp!4v1765044076787!5m2!1sja!2sjp',
  venueWebsite: 'https://c-gh.jp/',
  parkingInfo: '専用駐車場なし。周辺のコインパーキングをご利用ください。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '徳島阿波おどり空港',
        method: '空港バス',
        time: '約30分',
        description: '徳島空港からJR徳島駅行きのバスが運行。JR徳島駅下車後、徒歩5分で会場到着。',
        cost: '片道440円',
        notes: '1時間に1〜2本程度。時刻表要確認'
      },
      {
        from: '関西国際空港',
        method: '高速バス',
        time: '約2時間30分',
        description: '関西空港から徳島駅行きの高速バスが運行。直通で便利。',
        cost: '片道3,200円前後',
        notes: '1日数本運行。事前予約推奨'
      }
    ],
    fromExpressBus: [
      {
        from: '大阪',
        method: '高速バス',
        time: '約2時間30分',
        description: '大阪（梅田・なんば）から徳島駅行きの高速バスが頻発。JR高速バス・徳島バスが運行。',
        cost: '片道3,200円前後',
        notes: '1時間に1本程度。渋滞の影響を受ける可能性あり'
      },
      {
        from: '神戸',
        method: '高速バス',
        time: '約2時間',
        description: '神戸（三宮）から徳島駅行きの高速バスが運行。',
        cost: '片道2,700円前後',
        notes: '関西方面からのアクセスに便利'
      }
    ],
    fromCar: [
      {
        from: '大阪・神戸方面',
        method: '神戸淡路鳴門自動車道・徳島自動車道',
        time: '約2時間30分',
        description: '神戸淡路鳴門自動車道→徳島自動車道を経由し、徳島ICで降りて市街地へ。会場周辺に有料駐車場あり。',
        cost: '高速料金 約4,500円（神戸〜徳島IC）',
        notes: '明石海峡大橋・大鳴門橋を渡るルート。風が強い日は通行規制に注意'
      },
      {
        from: '高松方面',
        method: '徳島自動車道',
        time: '約1時間',
        description: '徳島自動車道を経由し、徳島ICで降りて市街地へ。',
        cost: '高速料金 約1,500円（高松〜徳島IC）',
        notes: '四国内からのアクセスに便利'
      }
    ],
    recommendations: '関西方面からは高速バスが便利で経済的。徳島空港利用の場合は空港バスで直接駅へ。'
  },
  parkingOptions: [
    {
      name: 'タイムズ徳島駅前',
      description: 'タイムズ徳島駅前の駐車場情報',
      price: '料金要確認',
      distance: '距離要確認',
      website: 'https://times-info.net/P36-tokushima/line/L40900/S7218/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+徳島駅前',
    },
    {
      name: 'JR徳島駅前駐車場',
      description: 'JR徳島駅前駐車場の駐車場情報',
      price: '料金要確認',
      distance: '距離要確認',
      mapsUrl: 'https://www.google.com/maps/search/JR徳島駅前+駐車場',
    },
  ],
  coinLockers: [
    {
      location: 'JR徳島駅構内',
      description: 'JR徳島駅構内のコインロッカー',
      price: '料金要確認',
      distance: '距離要確認',
      website: 'https://www.jr-shikoku.co.jp/01_trainbus/kakueki/tokushima/kounai_map.html',
      mapsUrl: 'https://www.google.com/maps/search/JR徳島駅',
    },
    {
      location: '徳島駅クレメントプラザ',
      description: '徳島駅クレメントプラザのコインロッカー',
      price: '料金要確認',
      distance: '距離要確認',
      mapsUrl: 'https://www.google.com/maps/search/徳島駅クレメントプラザ',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 徳島駅前店',
      description: 'スターバックス 徳島駅前店でライブ前後の休憩に最適',
      distance: '徒歩3分',
      website: 'https://store.starbucks.co.jp/detail-976/',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+徳島駅前',
    },
    {
      name: 'ドトールコーヒー 徳島駅前店',
      description: 'ドトールコーヒー 徳島駅前店でライブ前後の休憩に最適',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/ドトールコーヒー+徳島駅前',
    },
  ],
  nearbyAttractions: [
    {
      name: '阿波おどり会館',
      description: '阿波踊りの歴史と魅力を体験できる施設。実演も鑑賞可能',
      distance: '徒歩8分',
      website: 'https://awaodori-kaikan.jp/'
    },
    {
      name: '眉山ロープウェイ',
      description: '徳島市街を一望できる眉山の山頂へ。夜景も美しい',
      distance: '徒歩10分',
      website: 'https://www.bizan.or.jp/'
    },
    {
      name: '徳島中央公園',
      description: '徳島城跡を中心とした広大な公園。散策に最適',
      distance: '徒歩15分'
    }
  ],
  nearbyRestaurants: [
    {
      name: '徳島ラーメン ふく利',
      cuisine: '徳島ラーメン',
      description: '徳島ラーメンの名店。濃厚な豚骨醤油スープと生卵が特徴',
      distance: '徒歩7分',
      openTime: '11:00-21:00',
      price: '700円～1,000円',
      website: 'https://tabelog.com/tokushima/A3601/A360102/36000024/',
      mapsUrl: 'https://www.google.com/maps/search/徳島ラーメンふく利+徳島市',
      recommended: true,
      recommendComment: '徳島に来たら必食！濃厚スープと生卵の組み合わせが絶品'
    },
    {
      name: '徳島ラーメン 麺王',
      cuisine: '徳島ラーメン',
      description: '地元で人気の徳島ラーメン店。あっさり系もあり',
      distance: '徒歩8分',
      openTime: '11:00-22:00',
      price: '650円～900円',
      mapsUrl: 'https://www.google.com/maps/search/徳島ラーメン麺王+徳島駅前'
    },
    {
      name: '一鴻 徳島本店',
      cuisine: '阿波尾鶏',
      description: '阿波尾鶏の骨付き鶏が名物の人気店',
      distance: '徒歩8分',
      openTime: '17:00-23:00',
      price: '2,000円～3,500円',
      website: 'http://www.ikkou-tokushima.com/',
      mapsUrl: 'https://www.google.com/maps/search/一鴻+徳島',
      recommended: true,
      recommendComment: '徳島名物の阿波尾鶏！骨付き鶏はジューシーで絶品'
    },
    {
      name: '中華そば いのたに 本店',
      cuisine: '徳島ラーメン',
      description: '徳島ラーメンの元祖とも言える超有名店。豚バラ入り甘辛醤油スープが特徴',
      distance: '徒歩5分',
      openTime: '10:30-17:00',
      price: '600円～900円',
      mapsUrl: 'https://www.google.com/maps/search/いのたに+徳島',
      recommended: true,
      recommendComment: '徳島ラーメンの代名詞！濃厚な茶系スープと生卵のトッピングは必須'
    }
  ],
  accommodations: [
    {
      name: '東横INN 徳島駅眉山口',
      type: 'ビジネスホテル',
      description: '徳島駅徒歩3分の好立地。清潔で快適な客室、無料朝食サービス付き',
      distance: '徳島駅から徒歩3分',
      priceRange: '5,000円～7,000円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00136/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+徳島駅眉山口',
      recommended: true,
      recommendComment: '駅近で清潔、朝食無料！徳島遠征の定番ホテル'
    },
    {
      name: '快活CLUB 徳島駅前店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備で長時間滞在可能',
      distance: '徳島駅から徒歩5分',
      priceRange: '2,000円～3,000円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業'],
      website: 'https://www.kaikatsu.jp/shop/tokushima/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+徳島駅前',
      recommended: true,
      recommendComment: '予算を抑えたい時の最適解！個室でゆっくり休める'
    },
    {
      name: 'カプセルホテル徳島',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル。女性専用フロアもあり安心',
      distance: '徳島駅から徒歩7分',
      priceRange: '3,000円～4,000円/泊',
      features: ['大浴場', 'サウナ', '女性専用フロア', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+徳島駅',
    },
    {
      name: 'アパホテル 徳島駅前',
      type: 'ビジネスホテル',
      description: '大浴場付きビジネスホテル。駅から近く、コンサート後も安心',
      distance: '徳島駅から徒歩4分',
      priceRange: '5,500円～8,000円/泊',
      features: ['大浴場', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.apahotel.com/hotel/shikoku/tokushima-ekimae/',
      mapsUrl: 'https://www.google.com/maps/search/アパホテル+徳島駅前'
    }
  ]
}

export default tokushima_grindhouse
