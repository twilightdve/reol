import { Venue } from '../types'

export const hyogo_harbor_studio: Venue = {
  id: 'hyogo_harbor_studio',
  name: '神戸ハーバースタジオ',
  date: '2026-03-28T17:00:00+09:00',
  times: { open: '16:00', start: '17:00' },
  location: { 
    prefecture: '兵庫県', 
    city: '神戸市',
    address: '兵庫県神戸市中央区波止場町6-3 HSビル',
    nearestStation: '地下鉄海岸線みなと元町駅 東出口より徒歩5分'
  },
  capacity: 700,
  access: '【電車】神戸市営地下鉄・海岸線「みなと元町駅」より東出口から南へ徒歩約5分。JR/阪神電車＆山陽電車「元町駅」のご利用も便利です。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13123.24261458181!2d135.185031!3d34.684728!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60008f0228655555%3A0xfc96682fa0f83aeb!2z56We5oi4SGFyYm9yIFN0dWRpbw!5e0!3m2!1sja!2sus!4v1764560731648!5m2!1sja!2sus',
  venueWebsite: 'https://harbor-studio.net/about/?anchor=section03',
  parkingInfo: '当店には駐車場はございません。電車等の公共機関でのご来店をお勧め致します。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '神戸空港',
        method: 'ポートライナー + 地下鉄',
        time: '約30分',
        description: '神戸空港からポートライナーで三宮駅（18分）→地下鉄海岸線でみなと元町駅（5分）',
        cost: '片道660円',
        notes: 'ポートライナーは10分間隔で運行'
      },
      {
        from: '関西国際空港',
        method: '高速バス',
        time: '約1時間',
        description: '関空から神戸三宮行きリムジンバス→三宮から地下鉄でみなと元町駅（5分）',
        cost: '片道2,000円前後',
        notes: '1時間に1〜2本運行'
      },
      {
        from: '大阪国際空港（伊丹）',
        method: '空港バス',
        time: '約40分',
        description: '伊丹空港から神戸三宮行きバス→三宮から地下鉄でみなと元町駅',
        cost: '片道1,050円',
        notes: '20〜30分間隔で運行'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '新幹線のぞみ',
        time: '約2時間50分',
        description: '東京駅から新幹線のぞみで新神戸駅→地下鉄で三宮駅→海岸線でみなと元町駅',
        cost: '片道15,000円前後',
        notes: '新神戸駅から地下鉄で三宮経由'
      },
      {
        from: '大阪',
        method: 'JR',
        time: '約30分',
        description: '大阪駅からJR神戸線で神戸駅→徒歩15分または地下鉄経由',
        cost: '片道420円',
        notes: '快速利用で約20分'
      },
      {
        from: '名古屋',
        method: '新幹線のぞみ',
        time: '約1時間10分',
        description: '名古屋駅から新幹線のぞみで新神戸駅→地下鉄経由',
        cost: '片道6,500円前後',
        notes: '新神戸駅から地下鉄利用'
      }
    ],
    fromCar: [
      {
        from: '大阪方面',
        method: '阪神高速・名神高速',
        time: '約40分',
        description: '阪神高速または名神高速を経由し、神戸方面へ。会場周辺に複数の有料駐車場あり。',
        cost: '高速料金 約1,500円（大阪〜神戸）',
        notes: '神戸港周辺は週末混雑することがあります'
      },
      {
        from: '姫路方面',
        method: '第二神明道路',
        time: '約50分',
        description: '第二神明道路を経由し、神戸市内へ。',
        cost: '高速料金 約1,200円（姫路〜神戸）',
        notes: '兵庫県内からのアクセスに便利'
      }
    ],
    recommendations: '神戸空港が最も便利。関空・伊丹からもアクセス良好。新幹線は新神戸駅から地下鉄利用。'
  },
  parkingOptions: [
    {
      name: 'umie駐車場',
      description: 'ハーバーランドumieの駐車場。買い物で割引あり',
      price: '30分300円（買い物で割引）',
      distance: '徒歩5分',
      website: 'https://harborland.co.jp/parking/',
      mapsUrl: 'https://www.google.com/maps/search/umie+駐車場',
    },
    {
      name: 'メリケンパーク駐車場',
      description: 'メリケンパーク隣接の駐車場',
      price: '30分200円',
      distance: '徒歩3分',
      website: 'https://times-info.net/P28-hyogo/C110/park-detail-BUK0017660/',
      mapsUrl: 'https://www.google.com/maps/search/メリケンパーク+駐車場',
    },
  ],
  coinLockers: [
    {
      location: 'JR神戸駅構内',
      description: 'JR神戸駅構内のコインロッカー',
      price: '300円〜600円',
      distance: '徒歩15分',
      website: 'https://eki.jr-odekake.net/premises?id=0610145',
      mapsUrl: 'https://www.google.com/maps/search/JR神戸駅',
    },
    {
      location: '地下鉄みなと元町駅構内',
      description: '地下鉄みなと元町駅構内のコインロッカー',
      price: '300円〜500円',
      distance: '徒歩8分',
      website: 'https://coinlocker.click/minatomotomachi-kobe-subway-station.php',
      mapsUrl: 'https://www.google.com/maps/search/みなと元町駅',
    },
  ],
  cafes: [
    {
      name: 'スターバックス umie店',
      description: 'ハーバーランド内のスターバックス。海を眺めながら休憩',
      distance: '徒歩5分',
      website: 'https://store.starbucks.co.jp/detail-1146/',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+umie',
    },
    {
      name: 'タリーズコーヒー メリケンパーク店',
      description: 'メリケンパーク内のタリーズ。港の景色を楽しめる',
      distance: '徒歩3分',
      website: 'https://shop.tullys.co.jp/detail/1680287',
      mapsUrl: 'https://www.google.com/maps/search/タリーズコーヒー+メリケンパーク',
    },
  ],
  nearbyAttractions: [
    {
      name: 'メリケンパーク',
      description: '神戸港を一望できる海辺の公園。神戸ポートタワーや海洋博物館も',
      distance: '徒歩5分',
      website: 'https://www.city.kobe.lg.jp/kanko/spot/merikenpark/'
    },
    {
      name: '神戸ポートタワー',
      description: '神戸のシンボルタワー。展望台から神戸の街と海を一望',
      distance: '徒歩7分',
      website: 'https://www.kobe-port-tower.com/'
    },
    {
      name: 'umie（ハーバーランド）',
      description: '大型ショッピングモール。飲食店も充実',
      distance: '徒歩5分',
      website: 'https://umie.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: '神戸牛ステーキ 鉄板焼 桜',
      cuisine: '神戸牛',
      description: '本場の神戸牛を鉄板焼きで。特別な日におすすめ',
      distance: '徒歩10分',
      openTime: '11:30-14:30、17:00-22:00',
      price: '5,000円～15,000円',
      website: 'https://www.saidining.com/sakura/',
      mapsUrl: 'https://www.google.com/maps/search/神戸牛鉄板焼+神戸ハーバーランド',
      recommended: true,
      recommendComment: '神戸に来たら神戸牛！柔らかくてジューシーな最高級牛肉'
    },
    {
      name: 'モザイク（飲食街）',
      cuisine: '各種',
      description: 'ハーバーランド内の飲食街。和洋中様々なレストランが揃う',
      distance: '徒歩7分',
      openTime: '11:00-23:00（店舗により異なる）',
      price: '1,500円～3,000円',
      website: 'https://umie.jp/mosaic/',
      mapsUrl: 'https://www.google.com/maps/search/モザイク+神戸ハーバーランド',
    },
    {
      name: '南京町（中華街）',
      cuisine: '中華',
      description: '日本三大中華街の一つ。本格中華料理と食べ歩きグルメ',
      distance: '徒歩15分',
      openTime: '10:00-20:00（店舗により異なる）',
      price: '1,000円～2,500円',
      website: 'https://www.nankinmachi.or.jp/',
      mapsUrl: 'https://www.google.com/maps/search/南京町+神戸',
      recommended: true,
      recommendComment: '神戸観光の定番。豚まんや小籠包の食べ歩きも楽しい'
    },
    {
      name: 'サイゼリヤ umie店',
      cuisine: 'ファミレス',
      description: 'リーズナブルなイタリアン。ライブ前後の食事に便利',
      distance: '徒歩5分',
      openTime: '10:00-22:00',
      price: '1,000円～1,500円',
      mapsUrl: 'https://www.google.com/maps/search/サイゼリヤ+umie',
    }
  ],
  accommodations: [
    {
      name: '東横INN 神戸三ノ宮',
      type: 'ビジネスホテル',
      description: '三ノ宮駅徒歩5分。清潔で快適な客室、無料朝食サービス付き',
      distance: '三ノ宮駅から徒歩5分',
      priceRange: '5,500円～7,500円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00044/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+神戸三ノ宮',
      recommended: true,
      recommendComment: '三ノ宮駅近で便利！神戸遠征の定番ホテル'
    },
    {
      name: '快活CLUB 神戸三宮店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '三ノ宮駅から徒歩8分',
      priceRange: '2,500円～3,500円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業'],
      website: 'https://www.kaikatsu.jp/shop/kobe-sannomiya/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+神戸三宮',
      recommended: true,
      recommendComment: '予算重視なら最適！三宮の繁華街も近くて便利'
    },
    {
      name: 'カプセルホテル神戸三宮',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル。女性専用フロアもあり',
      distance: '三ノ宮駅から徒歩7分',
      priceRange: '3,200円～4,500円/泊',
      features: ['大浴場', 'サウナ', '女性専用フロア', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+神戸三宮'
    },
    {
      name: 'スーパーホテル神戸',
      type: 'ビジネスホテル',
      description: '天然温泉大浴場付きビジネスホテル。朝食バイキングも好評',
      distance: '三ノ宮駅から徒歩10分',
      priceRange: '5,800円～8,500円/泊',
      features: ['天然温泉', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
      website: 'https://www.superhotel.co.jp/s_hotels/kobe/',
      mapsUrl: 'https://www.google.com/maps/search/スーパーホテル+神戸'
    }
  ]
}

export default hyogo_harbor_studio
