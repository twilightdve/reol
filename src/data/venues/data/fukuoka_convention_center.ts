import { Venue } from '../types'

export const fukuoka_convention_center: Venue = {
  id: 'fukuoka_convention_center',
  name: '福岡国際会議場メインホール',
  date: '2026-06-27T17:00:00+09:00',
  times: { open: '16:00', start: '17:00' },
  location: { 
    prefecture: '福岡県', 
    city: '福岡市',
    address: '福岡県福岡市博多区石城町2-1',
    nearestStation: '福岡市地下鉄箱崎線 呉服町駅 徒歩約10分'
  },
  capacity: 1000,
  access: '【電車・徒歩】地下鉄箱崎線呉服町駅から徒歩約10分。【バス】JR博多駅や天神バスセンターから西鉄バス「国際会議場・サンパレス前」下車すぐ。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.3!2d130.4119!3d33.6033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x354191e6a6c2c2c7%3A0x1234567890abcdef!2z56aP5bKh5Zu96Zqb5Lya6K2w5aC0!5e0!3m2!1sja!2sjp',
  venueWebsite: 'https://www.marinemesse.or.jp/congress/',
  parkingInfo: '第1駐車場（有料）あり。詳細は公式サイトをご確認ください。公共交通機関の利用を推奨します。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '福岡空港',
        method: '地下鉄',
        time: '約10分',
        description: '福岡空港から地下鉄で博多駅→バスで福岡国際会議場',
        cost: '片道260円 + バス200円',
        notes: '博多駅から西鉄バス約15分'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '新幹線のぞみ + バス',
        time: '約5時間30分',
        description: '東京から新幹線のぞみで博多駅→バスで福岡国際会議場',
        cost: '片道23,000円前後',
        notes: '博多駅からバス約15分。飛行機も検討を'
      },
      {
        from: '大阪',
        method: '新幹線のぞみ + バス',
        time: '約2時間45分',
        description: '新大阪から新幹線のぞみで博多駅→バスで福岡国際会議場',
        cost: '片道15,500円前後',
        notes: '博多駅からバス約15分'
      },
      {
        from: '名古屋',
        method: '新幹線のぞみ + バス',
        time: '約3時間30分',
        description: '名古屋から新幹線のぞみで博多駅→バスで福岡国際会議場',
        cost: '片道18,000円前後',
        notes: '博多駅からバス約15分'
      },
      {
        from: '広島',
        method: '新幹線のぞみ + バス',
        time: '約1時間15分',
        description: '広島から新幹線のぞみで博多駅→バスで福岡国際会議場',
        cost: '片道9,000円前後',
        notes: '博多駅からバス約15分'
      }
    ],
    fromExpressBus: [
      {
        from: '長崎',
        method: '高速バス',
        time: '約2時間30分',
        description: '長崎から九州号で博多バスターミナル→バスで福岡国際会議場',
        cost: '片道2,600円前後',
        notes: '1時間に1〜2本運行'
      },
      {
        from: '熊本',
        method: '高速バス',
        time: '約2時間',
        description: '熊本から九州横断バスで博多バスターミナル→バスで福岡国際会議場',
        cost: '片道2,100円前後',
        notes: '1時間に2〜3本運行'
      }
    ],
    fromCar: [
      {
        from: '北九州方面',
        method: '九州自動車道',
        time: '約1時間',
        description: '九州自動車道を南下し、福岡ICまたは太宰府ICで降りて福岡市内へ。会場周辺に複数の有料駐車場あり。',
        cost: '高速料金 約1,500円（北九州〜福岡IC）',
        notes: '福岡国際会議場第1駐車場の利用が便利'
      },
      {
        from: '熊本方面',
        method: '九州自動車道',
        time: '約1時間30分',
        description: '九州自動車道を北上し、福岡ICまたは太宰府ICで降りて福岡市内へ。',
        cost: '高速料金 約2,500円（熊本〜福岡IC）',
        notes: '九州圏内からのアクセスに便利'
      }
    ],
    recommendations: '福岡空港から地下鉄10分で博多駅。博多駅からバス約15分。九州各地から高速バスあり。'
  },
  parkingOptions: [
    {
      name: '福岡国際会議場 第1駐車場',
      description: '会場併設の有料駐車場',
      price: '1日1,000円',
      distance: '徒歩0分（会場直結）',
      website: 'https://www.marinemesse.or.jp/congress/',
      mapsUrl: 'https://www.google.com/maps/search/福岡国際会議場+駐車場',
    },
    {
      name: 'タイムズ博多ふ頭',
      description: '会場近くの駐車場',
      price: '30分200円',
      distance: '徒歩5分',
      website: 'https://times-info.net/P40-fukuoka/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+博多ふ頭',
    },
  ],
  coinLockers: [
    {
      location: '福岡国際会議場内',
      description: '福岡国際会議場内のコインロッカー',
      price: '300円～600円',
      distance: '会場内',
      website: 'https://www.marinemesse.or.jp/congress/',
      mapsUrl: 'https://www.google.com/maps/search/福岡国際会議場',
    },
    {
      location: '博多駅構内',
      description: 'JR博多駅構内のコインロッカー',
      price: '300円〜600円',
      distance: 'バス10分',
      website: 'https://www.jrkyushu.co.jp/railway/station/1191306_1601.html',
      mapsUrl: 'https://www.google.com/maps/search/JR博多駅',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 博多駅前店',
      description: '博多駅前のスターバックス',
      distance: 'バス10分',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+博多駅前',
    },
    {
      name: 'ドトールコーヒー 博多店',
      description: 'ドトールコーヒーでライブ前後の休憩',
      distance: 'バス10分',
      mapsUrl: 'https://www.google.com/maps/search/ドトールコーヒー+博多',
    },
  ],
  nearbyAttractions: [
    {
      name: 'キャナルシティ博多',
      description: '大型ショッピングモール。噴水ショーが有名',
      distance: 'バス15分',
      website: 'https://canalcity.co.jp/'
    },
    {
      name: '福岡タワー',
      description: '高さ234mの海浜タワー。夜景が美しい',
      distance: '車で15分',
      website: 'https://www.fukuokatower.co.jp/'
    },
    {
      name: '天神地下街',
      description: '福岡の中心街。ショッピングとグルメ',
      distance: 'バス20分',
      website: 'https://www.tenchika.com/'
    }
  ],
  nearbyRestaurants: [
    {
      name: '元祖博多だるま',
      cuisine: 'ラーメン',
      description: '創業60年以上の老舗博多ラーメン店。濃厚豚骨スープが絶品',
      distance: 'バス15分',
      openTime: '11:00-翌2:00',
      price: '700円～1,000円',
      website: 'https://www.hakata-daruma.com/',
      mapsUrl: 'https://www.google.com/maps/search/博多だるま+福岡',
      recommended: true,
      recommendComment: '地元民が愛する老舗！本場のとんこつは濃厚で絶品'
    },
    {
      name: 'もつ鍋 楽天地',
      cuisine: 'もつ鍋',
      description: '博多名物もつ鍋の老舗。醤油味が絶品',
      distance: 'バス15分',
      openTime: '17:00-23:00',
      price: '3,000円～4,000円',
      website: 'https://www.rakutenti.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/もつ鍋+楽天地+福岡',
      recommended: true,
      recommendComment: '博多といえばもつ鍋！プリプリのもつが絶品'
    },
    {
      name: '稚加栄',
      cuisine: '海鮮',
      description: '博多の海鮮料理店。新鮮な魚介が味わえる',
      distance: 'バス20分',
      openTime: '11:30-14:00、17:00-22:00',
      price: '3,000円～5,000円',
      mapsUrl: 'https://www.google.com/maps/search/稚加栄+福岡',
    },
    {
      name: '博多華味鳥 博多駅前店',
      cuisine: '水炊き',
      description: '博多名物水炊きの名店。自社養鶏場の華味鳥を使用',
      distance: 'バス20分',
      openTime: '17:00-23:00',
      price: '3,500円～5,000円',
      website: 'https://www.hanamidori.net/',
      mapsUrl: 'https://www.google.com/maps/search/博多華味鳥+福岡',
      recommended: true,
      recommendComment: '博多の水炊き名店！濃厚白濁スープと華味鳥が絶品'
    }
  ],
  accommodations: [
    {
      name: '東横INN 博多駅前',
      type: 'ビジネスホテル',
      description: '博多駅徒歩3分の好立地。清潔で快適な客室、無料朝食付き',
      distance: '博多駅から徒歩3分',
      priceRange: '5,500円～7,500円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00056/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+博多駅前',
      recommended: true,
      recommendComment: '博多駅近くで便利！福岡遠征の定番ホテル'
    },
    {
      name: '快活CLUB 博多天神店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '天神駅から徒歩5分',
      priceRange: '2,500円～3,500円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業'],
      website: 'https://www.kaikatsu.jp/shop/hakata-tenjin/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+博多天神',
      recommended: true,
      recommendComment: '予算を抑えたい時の最適解！繁華街も近い'
    },
    {
      name: 'ナインアワーズ博多',
      type: 'カプセルホテル',
      description: 'デザイン性の高いカプセルホテル。快適な睡眠空間とシャワーブース完備',
      distance: '博多駅から徒歩5分',
      priceRange: '4,500円～6,000円/泊',
      features: ['シャワーブース', '無料Wi-Fi', 'ロッカー', '洗練されたデザイン', '女性専用フロア'],
      website: 'https://ninehours.co.jp/hakata/',
      mapsUrl: 'https://www.google.com/maps/search/ナインアワーズ+博多',
      recommended: true,
      recommendComment: 'デザイン性と機能性を両立した快適なカプセルホテル！博多駅近くで便利'
    },
    {
      name: 'カプセルホテル博多',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル',
      distance: '博多駅から徒歩6分',
      priceRange: '3,500円～5,000円/泊',
      features: ['大浴場', 'サウナ', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+博多駅'
    },
    {
      name: 'ホテルルートイン博多駅前',
      type: 'ビジネスホテル',
      description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
      distance: '博多駅から徒歩5分',
      priceRange: '6,000円～8,500円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=163',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+博多駅前'
    }
  ]
}

export default fukuoka_convention_center
