import { Venue } from '../types'

export const nagasaki_drum_be7: Venue = {
  id: 'nagasaki_drum_be7',
  name: '長崎DRUM Be-7',
  date: '2026-04-18T17:00:00+09:00',
  times: { open: '16:30', start: '17:00' },
  location: { 
    prefecture: '長崎県', 
    city: '長崎市',
    address: '長崎県長崎市銅座町14-5',
    nearestStation: '路面電車 観光通り電停 徒歩3分'
  },
  capacity: 400,
  access: '路面電車観光通り電停から徒歩3分。JR長崎駅からは路面電車で約15分。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13422.82679668779!2d129.878667!3d32.746978!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35155340abd5d027%3A0x78d285234fecad4a!2sDRUM%20Be-7!5e0!3m2!1sja!2sus!4v1764561252866!5m2!1sja!2sus',
  venueWebsite: 'http://www.live-drum.com/',
  parkingInfo: '専用駐車場なし。周辺の有料駐車場をご利用ください。路面電車の利用を推奨します。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '長崎空港',
        method: '空港バス',
        time: '約45分',
        description: '長崎空港からJR長崎駅行きバス→長崎駅から路面電車で観光通り電停',
        cost: '片道1,000円',
        notes: '空港バスは20分間隔で運行'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '新幹線 + 特急',
        time: '約7時間',
        description: '東京から新幹線で博多→特急かもめで長崎',
        cost: '片道25,000円前後',
        notes: '博多で乗り換え。飛行機が効率的'
      },
      {
        from: '大阪',
        method: '新幹線 + 特急',
        time: '約4時間30分',
        description: '新大阪から新幹線で博多→特急かもめで長崎',
        cost: '片道17,000円前後',
        notes: '博多で乗り換え'
      },
      {
        from: '福岡（博多）',
        method: '特急かもめ',
        time: '約2時間',
        description: '博多駅から特急かもめで長崎駅',
        cost: '片道5,000円前後',
        notes: '九州新幹線西九州ルートで便利に'
      }
    ],
    fromExpressBus: [
      {
        from: '福岡',
        method: '高速バス',
        time: '約2時間30分',
        description: '福岡（天神・博多）から長崎行き高速バス',
        cost: '片道2,500円前後',
        notes: '1時間に1本程度。特急より安い'
      }
    ],
    fromCar: [
      {
        from: '福岡方面',
        method: '九州自動車道・長崎自動車道',
        time: '約2時間',
        description: '九州自動車道→長崎自動車道を経由し、長崎ICで降りて長崎市内へ。会場周辺に有料駐車場あり。',
        cost: '高速料金 約3,000円（福岡〜長崎IC）',
        notes: '長崎市内は坂道が多いため運転に注意'
      },
      {
        from: '熊本方面',
        method: '九州自動車道・長崎自動車道',
        time: '約2時間30分',
        description: '九州自動車道→長崎自動車道を経由し、長崎ICで降りて長崎市内へ。',
        cost: '高速料金 約3,500円（熊本〜長崎IC）',
        notes: '九州内からのアクセスに便利'
      }
    ],
    recommendations: '長崎空港から市内へのアクセス良好。福岡から特急かもめが便利。西日本新幹線開通で更にアクセス向上。'
  },
  parkingOptions: [
    {
      name: 'タイムズ長崎銅座',
      description: '銅座エリアの駐車場',
      price: '料金要確認',
      distance: '徒歩5分',
      website: 'https://times-info.net/P42-nagasaki/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+長崎銅座',
    },
    {
      name: '長崎市営中央駐車場',
      description: '市営の駐車場',
      price: '料金要確認',
      distance: '徒歩7分',
      mapsUrl: 'https://www.google.com/maps/search/長崎市営+中央駐車場',
    },
  ],
  coinLockers: [
    {
      location: 'JR長崎駅構内',
      description: 'JR長崎駅構内のコインロッカー',
      price: '300円〜600円',
      distance: '路面電車15分',
      website: 'https://www.jr-odekake.net/eki/premises?id=0891401',
      mapsUrl: 'https://www.google.com/maps/search/JR長崎駅',
    },
    {
      location: '浜町アーケード',
      description: '浜町アーケード内のコインロッカー',
      price: '料金要確認',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/浜町アーケード+コインロッカー',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 長崎浜町店',
      description: '浜町アーケード近くのスターバックス',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+長崎浜町',
    },
    {
      name: 'ドトールコーヒー 長崎店',
      description: 'ドトールコーヒーでライブ前後の休憩',
      distance: '徒歩7分',
      mapsUrl: 'https://www.google.com/maps/search/ドトールコーヒー+長崎',
    },
  ],
  nearbyAttractions: [
    {
      name: '眼鏡橋',
      description: '日本三名橋の一つ。アーチが水面に映ると眼鏡のように見える',
      distance: '徒歩10分',
      website: 'https://www.city.nagasaki.lg.jp/'
    },
    {
      name: '浜町アーケード',
      description: '長崎最大の繁華街。ショッピングやグルメが充実',
      distance: '徒歩5分',
      website: 'https://www.hamamachi.jp/'
    },
    {
      name: 'グラバー園',
      description: '世界遺産の洋館群。長崎港を一望できる',
      distance: '路面電車で15分',
      website: 'https://www.glover-garden.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: '吉宗（よっそう）',
      cuisine: '長崎料理',
      description: '創業明治5年。茶碗蒸しと蒸し寿司のセットが名物',
      distance: '徒歩8分',
      openTime: '11:00-21:00',
      price: '2,000円～3,500円',
      website: 'https://www.yossou.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/吉宗+長崎',
      recommended: true,
      recommendComment: '長崎名物の茶碗蒸しと蒸し寿司は絶品！老舗の味を堪能'
    },
    {
      name: '四海楼',
      cuisine: 'ちゃんぽん',
      description: 'ちゃんぽん発祥の店。眺望も素晴らしい',
      distance: '路面電車で20分',
      openTime: '11:30-21:00',
      price: '1,500円～2,500円',
      website: 'https://www.shikairou.com/',
      mapsUrl: 'https://www.google.com/maps/search/四海楼+長崎',
      recommended: true,
      recommendComment: 'ちゃんぽん発祥の地！本場の味は格別'
    },
    {
      name: '江山楼',
      cuisine: '中華',
      description: '長崎中華街の名店。ちゃんぽん、皿うどんが人気',
      distance: '路面電車で10分',
      openTime: '11:00-21:00',
      price: '1,200円～2,000円',
      website: 'https://www.kouzanrou.com/',
      mapsUrl: 'https://www.google.com/maps/search/江山楼+長崎',
    },
    {
      name: '史跡料亭 花月',
      cuisine: '卓袱料理',
      description: '1642年創業の国指定史跡の料亭。長崎名物の卓袱料理を優雅に楽しめる',
      distance: '路面電車で15分',
      openTime: '12:00-15:00、18:00-22:00',
      price: '5,000円～15,000円',
      website: 'https://www.ryoutei-kagetsu.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/史跡料亭花月+長崎',
      recommended: true,
      recommendComment: '国指定史跡の料亭で味わう本場の卓袱料理は格別！歴史ある空間で長崎文化を堪能'
    }
  ],
  accommodations: [
    {
      name: '東横INN 長崎駅前',
      type: 'ビジネスホテル',
      description: '長崎駅徒歩3分の好立地。清潔で快適な客室、無料朝食付き',
      distance: '長崎駅から徒歩3分',
      priceRange: '5,000円～7,000円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00089/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+長崎駅前',
      recommended: true,
      recommendComment: '駅近で清潔、朝食無料！長崎遠征の定番ホテル'
    },
    {
      name: '快活CLUB 長崎浜町店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '観光通電停から徒歩5分',
      priceRange: '2,200円～3,200円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業'],
      website: 'https://www.kaikatsu.jp/shop/nagasaki-hamano/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+長崎浜町',
      recommended: true,
      recommendComment: '予算を抑えたい時の最適解！中華街も近い'
    },
    {
      name: 'カプセルホテル長崎',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル',
      distance: '長崎駅から徒歩7分',
      priceRange: '3,000円～4,000円/泊',
      features: ['大浴場', 'サウナ', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+長崎駅'
    },
    {
      name: 'ホテルルートイン長崎駅前',
      type: 'ビジネスホテル',
      description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
      distance: '長崎駅から徒歩5分',
      priceRange: '5,500円～8,000円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=112',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+長崎駅前'
    }
  ]
}

export default nagasaki_drum_be7
