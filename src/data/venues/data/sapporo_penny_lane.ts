import { Venue } from '../types'

export const sapporo_penny_lane: Venue = {
  id: 'sapporo_penny_lane',
  name: '札幌 PENNY LANE 24',
  date: '2026-05-10T17:00:00+09:00',
  times: { open: '16:00', start: '17:00' },
  location: { 
    prefecture: '北海道', 
    city: '札幌市',
    address: '北海道札幌市中央区南4条西5丁目',
    nearestStation: '地下鉄すすきの駅 徒歩3分'
  },
  capacity: 400,
  gradient: {
    from: '#9370DB',
    to: '#E6E6FA'
  },
  access: '地下鉄南北線すすきの駅3番出口から徒歩3分。すすきの繁華街の中心部。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d11657.818425874671!2d141.30646!3d43.073937!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5f0b284b7075fa89%3A0xc8c9623237f84ba4!2z44Oa44OL44O844Os44O844OzMjQ!5e0!3m2!1sja!2sus!4v1764573983875!5m2!1sja!2sus',
  venueWebsite: 'https://www.pl24.jp/info.html',
  parkingInfo: '専用駐車場なし。すすきの周辺の有料駐車場をご利用ください。公共交通機関の利用を推奨します。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '新千歳空港',
        method: 'JR快速エアポート',
        time: '約40分',
        description: '新千歳空港駅からJR快速エアポートで札幌駅→地下鉄でさっぽろ駅からすすきの駅（1駅）',
        cost: '片道1,150円',
        notes: '快速エアポートは15分間隔で運行'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '新幹線 + 特急',
        time: '約8時間',
        description: '東京から新幹線はやぶさで新函館北斗→特急北斗で札幌。飛行機が現実的',
        cost: '片道28,000円前後',
        notes: '羽田から新千歳空港の飛行機が効率的'
      },
      {
        from: '大阪・名古屋',
        method: '飛行機推奨',
        time: '飛行機で約2時間',
        description: '関空・伊丹・中部から新千歳空港へ直行便多数',
        cost: '片道15,000円〜30,000円',
        notes: '新幹線より飛行機が圧倒的に便利'
      }
    ],
    fromExpressBus: [
      {
        from: '旭川・釧路・函館',
        method: '高速バス',
        time: '約2〜5時間',
        description: '北海道内各地から札幌行きの高速バスが多数運行。札幌駅またはすすきの付近で下車',
        cost: '片道2,000円〜5,000円',
        notes: '冬季は雪の影響で遅延する可能性あり'
      }
    ],
    fromCar: [
      {
        from: '新千歳空港',
        method: '道央自動車道',
        time: '約1時間',
        description: '道央自動車道を北上し、札幌ICで降りて札幌市内へ。会場周辺に複数の有料駐車場あり。',
        cost: '高速料金 約1,500円（新千歳空港〜札幌IC）',
        notes: '冬季は路面凍結に注意。スタッドレスタイヤ必須'
      },
      {
        from: '函館方面',
        method: '道央自動車道',
        time: '約4時間',
        description: '道央自動車道を経由し、札幌ICで降りて札幌市内へ。',
        cost: '高速料金 約5,500円（函館〜札幌IC）',
        notes: '道南圏からのアクセスに便利。冬季は天候に注意'
      }
    ],
    recommendations: '札幌へのアクセスは空路が基本。新千歳空港からJRエアポートが速くて確実。北海道内からは高速バスも便利。'
  },
  parkingOptions: [
    {
      name: 'タイムズ すすきの',
      description: 'すすきの繁華街の駐車場',
      price: '30分300円',
      distance: '徒歩5分',
      website: 'https://times-info.net/P01-hokkaido/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+すすきの',
    },
    {
      name: 'ノルベサ駐車場',
      description: 'ノルベサビル内の駐車場',
      price: '30分200円',
      distance: '徒歩3分',
      website: 'https://www.norbesa.jp/access/',
      mapsUrl: 'https://www.google.com/maps/search/ノルベサ+駐車場',
    },
  ],
  coinLockers: [
    {
      location: '地下鉄すすきの駅構内',
      description: '地下鉄すすきの駅構内のコインロッカー',
      price: '300円〜500円',
      distance: '徒歩3分',
      website: 'https://www.city.sapporo.jp/st/subway/',
      mapsUrl: 'https://www.google.com/maps/search/地下鉄すすきの駅',
    },
    {
      location: 'ノルベサ',
      description: 'ノルベサビル内のコインロッカー',
      price: '料金要確認',
      distance: '徒歩3分',
      website: 'https://www.norbesa.jp/',
      mapsUrl: 'https://www.google.com/maps/search/ノルベサ+すすきの',
    },
  ],
  cafes: [
    {
      name: 'スターバックス すすきの店',
      description: 'すすきの繁華街のスターバックス',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+すすきの',
    },
    {
      name: 'コメダ珈琲店 大通ビッセ店',
      description: '大通エリアのコメダ珈琲',
      distance: '徒歩10分',
      website: 'https://www.komeda.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/コメダ珈琲店+大通ビッセ',
    },
  ],
  nearbyAttractions: [
    {
      name: '大通公園',
      description: '札幌の中心部を貫く大規模な公園。さっぽろ雪まつりの会場',
      distance: '徒歩8分',
      website: 'https://odori-park.jp/'
    },
    {
      name: 'さっぽろテレビ塔',
      description: '札幌のランドマークタワー。展望台から市街を一望',
      distance: '徒歩10分',
      website: 'https://www.tv-tower.co.jp/'
    },
    {
      name: 'すすきの',
      description: '北海道最大の繁華街。飲食店が充実',
      distance: '徒歩すぐ',
      website: 'https://susukino-ta.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'すすきのラーメン横丁',
      cuisine: '札幌ラーメン',
      description: '札幌ラーメンの名店が集まる横丁。味噌ラーメン発祥の地',
      distance: '徒歩5分',
      openTime: '11:00-翌3:00（店舗により異なる）',
      price: '800円～1,200円',
      website: 'https://www.ganso-yokocho.com/',
      mapsUrl: 'https://www.google.com/maps/search/すすきのラーメン横丁',
      recommended: true,
      recommendComment: '札幌味噌ラーメンの聖地！濃厚な味噌スープが絶品'
    },
    {
      name: 'ジンギスカン だるま 本店',
      cuisine: 'ジンギスカン',
      description: '札幌で大人気のジンギスカン専門店。行列必至',
      distance: '徒歩5分',
      openTime: '17:00-翌3:00',
      price: '3,000円～5,000円',
      website: 'https://www.sapporo-jingisukan.info/',
      mapsUrl: 'https://www.google.com/maps/search/ジンギスカンだるま+すすきの',
      recommended: true,
      recommendComment: '札幌で最も人気のジンギスカン！柔らかい生ラムが最高'
    },
    {
      name: 'スープカレー GARAKU',
      cuisine: 'スープカレー',
      description: '札幌スープカレーの人気店',
      distance: '徒歩7分',
      openTime: '11:30-22:00',
      price: '1,200円～1,800円',
      mapsUrl: 'https://www.google.com/maps/search/スープカレーGARAKU+札幌',
    },
    {
      name: '海味 はちきょう 本店',
      cuisine: '海鮮料理',
      description: '名物「つっこ飯」（いくら丼）で有名な海鮮居酒屋',
      distance: '徒歩5分',
      openTime: '18:00-翌0:00',
      price: '3,000円～5,000円',
      website: 'https://www.hachikyou.com/',
      mapsUrl: 'https://www.google.com/maps/search/海味はちきょう+すすきの',
      recommended: true,
      recommendComment: '名物つっこ飯は圧巻！新鮮ないくらが溢れんばかりに盛られる'
    }
  ],
  accommodations: [
    {
      name: '東横INN 札幌すすきの',
      type: 'ビジネスホテル',
      description: 'すすきの徒歩3分の好立地。清潔で快適な客室、無料朝食付き',
      distance: 'すすきの駅から徒歩3分',
      priceRange: '5,500円～7,500円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '繁華街近'],
      website: 'https://www.toyoko-inn.com/search/detail/00007/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+札幌すすきの',
      recommended: true,
      recommendComment: 'すすきの繁華街近くで便利！札幌遠征の定番ホテル'
    },
    {
      name: '快活CLUB 札幌すすきの店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: 'すすきの駅から徒歩5分',
      priceRange: '2,500円～3,500円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業'],
      website: 'https://www.kaikatsu.jp/shop/sapporo-susukino/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+札幌すすきの',
      recommended: true,
      recommendComment: '予算を抑えたい時の最適解！繁華街も近い'
    },
    {
      name: 'カプセルホテル札幌',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル。女性専用フロアあり',
      distance: 'すすきの駅から徒歩5分',
      priceRange: '3,000円～4,500円/泊',
      features: ['大浴場', 'サウナ', '女性専用フロア', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+札幌すすきの'
    },
    {
      name: 'ホテルルートイン札幌駅前',
      type: 'ビジネスホテル',
      description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
      distance: '札幌駅から徒歩5分',
      priceRange: '6,000円～8,500円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=4',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+札幌駅前'
    }
  ]
}

export default sapporo_penny_lane
