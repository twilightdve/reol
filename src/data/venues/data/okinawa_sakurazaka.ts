import { Venue } from '../types'

export const okinawa_sakurazaka: Venue = {
  id: 'okinawa_sakurazaka',
  name: '那覇桜坂セントラル',
  date: '2026-04-29T18:00:00+09:00',
  times: { open: '17:00', start: '18:00' },
  location: { 
    prefecture: '沖縄県', 
    city: '那覇市',
    address: '沖縄県那覇市牧志3-9-26',
    nearestStation: 'ゆいレール 牧志駅 徒歩7分'
  },
  capacity: 600,
  access: 'ゆいレール牧志駅から徒歩7分。国際通りから徒歩圏内。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14317.692227503761!2d127.690374!3d26.21544!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x34e5697a95ca8867%3A0xc70c1715755075b6!2z44Op44Kk44OW44OP44Km44K55qGc5Z2C44K744Oz44OI44Op44Or!5e0!3m2!1sja!2sus!4v1764561687483!5m2!1sja!2sus',
  venueWebsite: 'http://www.nahacentral.com/about.html',
  parkingInfo: '専用駐車場なし。周辺の有料駐車場をご利用ください。ゆいレールの利用を推奨します。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '那覇空港',
        method: 'ゆいレール',
        time: '約15分',
        description: '那覇空港からゆいレールで牧志駅→徒歩7分',
        cost: '片道300円',
        notes: 'ゆいレールは10分間隔で運行'
      }
    ],
    fromMainland: [
      {
        from: '東京',
        description: '羽田・成田から那覇空港へ直行便多数。飛行時間約2時間30分',
        notes: '本土からは飛行機が必須'
      },
      {
        from: '大阪',
        description: '関西国際空港・伊丹空港から那覇空港へ直行便。飛行時間約2時間',
        notes: '関空からのLCCも充実'
      },
      {
        from: '名古屋',
        description: '中部国際空港から那覇空港へ直行便。飛行時間約2時間15分',
        notes: '直行便で便利'
      }
    ],
    fromExpressBus: [
      {
        from: '名護・浦添',
        method: '高速バス',
        time: '約2〜3時間',
        description: '沖縄北部から那覇バスターミナル行き高速バス。琉球バス交通運行',
        cost: '片道2,000円前後',
        notes: '沖縄島内移動に便利。那覇バスターミナルからモノレール利用'
      },
      {
        from: '石垣島',
        method: '飛行機',
        time: '約1時間',
        description: '石垣空港から那覇空港へ飛行機（約1時間）→ゆいレールで牧志駅',
        cost: '片道8,000円〜15,000円',
        notes: '石垣島-那覇間のフェリーは廃止済み。飛行機のみ'
      }
    ],
    fromCar: [
      {
        from: '那覇空港',
        method: '国道331号線・県道29号線',
        time: '約20分',
        description: '那覇空港から国道331号線→県道29号線を経由し、那覇市内中心部へ。会場周辺に複数の有料駐車場あり。',
        cost: '高速料金なし',
        notes: 'レンタカー利用が一般的。那覇市内は渋滞が多いため時間に余裕を持って'
      },
      {
        from: '北部方面',
        method: '沖縄自動車道',
        time: '約1時間30分',
        description: '沖縄自動車道を南下し、那覇ICで降りて那覇市内へ。',
        cost: '高速料金 約1,000円（名護〜那覇IC）',
        notes: '沖縄北部からのアクセスに便利'
      }
    ],
    recommendations: '那覇空港からゆいレールで市内へ15分と近い。本土からは飛行機必須。国際通り至近で観光に便利。'
  },
  parkingOptions: [
    {
      name: 'タイムズ那覇牧志',
      description: '牧志エリアの駐車場',
      price: '料金要確認',
      distance: '徒歩5分',
      website: 'https://times-info.net/P47-okinawa/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+那覇牧志',
    },
    {
      name: '国際通り周辺駐車場',
      description: '国際通り近くの駐車場',
      price: '料金要確認',
      distance: '徒歩10分',
      mapsUrl: 'https://www.google.com/maps/search/国際通り+駐車場',
    },
  ],
  coinLockers: [
    {
      location: 'ゆいレール牧志駅',
      description: 'ゆいレール牧志駅のコインロッカー',
      price: '300円〜500円',
      distance: '徒歩7分',
      mapsUrl: 'https://www.google.com/maps/search/ゆいレール牧志駅',
    },
    {
      location: '国際通り商店街',
      description: '国際通り内のコインロッカー',
      price: '料金要確認',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/国際通り+コインロッカー',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 那覇国際通り店',
      description: '国際通りのスターバックス',
      distance: '徒歩5分',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+那覇国際通り',
    },
    {
      name: 'タリーズコーヒー 那覇店',
      description: 'タリーズコーヒーでライブ前後の休憩',
      distance: '徒歩7分',
      mapsUrl: 'https://www.google.com/maps/search/タリーズコーヒー+那覇',
    },
  ],
  nearbyAttractions: [
    {
      name: '国際通り',
      description: '沖縄最大の繁華街。土産物店や飲食店が立ち並ぶ',
      distance: '徒歩5分',
      website: 'https://naha-kokusaidori.okinawa/'
    },
    {
      name: '第一牧志公設市場',
      description: '沖縄の食材が揃う市場。2階で調理してもらえる',
      distance: '徒歩10分',
      website: 'https://kosetsu-ichiba.com/'
    },
    {
      name: '首里城',
      description: '世界遺産の琉球王国の城。復元工事中だが見学可能',
      distance: 'ゆいレールで15分',
      website: 'https://oki-park.jp/shurijo/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'ジャッキーステーキハウス',
      cuisine: 'ステーキ',
      description: '沖縄のステーキ文化の象徴。ボリューム満点',
      distance: '徒歩8分',
      openTime: '11:00-翌1:30',
      price: '2,000円～3,500円',
      mapsUrl: 'https://www.google.com/maps/search/ジャッキーステーキハウス+那覇',
      recommended: true,
      recommendComment: '沖縄のソウルフード！分厚いステーキとガーリックライスが最高'
    },
    {
      name: '国際通り屋台村',
      cuisine: '沖縄料理',
      description: '国際通りにある屋台村。多彩な沖縄料理の店が集まる',
      distance: '徒歩10分',
      openTime: '11:00-24:00（店舗により異なる）',
      price: '1,000円～2,500円',
      website: 'https://www.okinawa-yatai.jp/',
      mapsUrl: 'https://www.google.com/maps/search/国際通り屋台村+那覇',
      recommended: true,
      recommendComment: 'いろんな沖縄料理を食べ比べできる！雰囲気も楽しい'
    },
    {
      name: '第一牧志公設市場 2階食堂',
      cuisine: '海鮮',
      description: '1階で買った食材を2階で調理してもらえる',
      distance: '徒歩10分',
      openTime: '10:00-19:00',
      price: '2,000円～4,000円',
      website: 'https://kosetsu-ichiba.com/',
      mapsUrl: 'https://www.google.com/maps/search/第一牧志公設市場',
    },
    {
      name: 'ジョイフル 那覇店',
      cuisine: 'ファミレス',
      description: 'リーズナブルな食事。ライブ前後に便利',
      distance: '徒歩5分',
      openTime: '24時間営業',
      price: '1,000円～1,500円',
      mapsUrl: 'https://www.google.com/maps/search/ジョイフル+那覇',
    }
  ],
  accommodations: [
    {
      name: '東横INN 那覇旭橋駅前',
      type: 'ビジネスホテル',
      description: '旭橋駅徒歩3分の好立地。清潔で快適な客室、無料朝食付き',
      distance: '旭橋駅から徒歩3分',
      priceRange: '5,500円～7,500円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', 'モノレール駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00141/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+那覇旭橋',
      recommended: true,
      recommendComment: 'モノレール駅近で移動便利！沖縄遠征の定番ホテル'
    },
    {
      name: '快活CLUB 那覇国際通り店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '県庁前駅から徒歩5分',
      priceRange: '2,500円～3,500円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業'],
      website: 'https://www.kaikatsu.jp/shop/naha-kokusaidori/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+那覇国際通り',
      recommended: true,
      recommendComment: '国際通り近くで便利！予算を抑えたい時に最適'
    },
    {
      name: 'カプセルホテル那覇',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル',
      distance: '旭橋駅から徒歩7分',
      priceRange: '3,200円～4,500円/泊',
      features: ['大浴場', 'サウナ', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+那覇'
    },
    {
      name: 'ホテルルートイン那覇泉崎',
      type: 'ビジネスホテル',
      description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
      distance: '県庁前駅から徒歩8分',
      priceRange: '6,000円～8,500円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=596',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+那覇泉崎'
    }
  ]
}

export default okinawa_sakurazaka
