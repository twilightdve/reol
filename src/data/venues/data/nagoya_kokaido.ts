import { Venue } from '../types'

export const nagoya_kokaido: Venue = {
    id: 'nagoya_kokaido',
    name: '岡谷鋼機名古屋公会堂',
    date: '2026-07-04T17:00:00+09:00',
    times: { open: '16:00', start: '17:00' },
    location: { 
      prefecture: '愛知県', 
      city: '名古屋市',
      address: '愛知県名古屋市昭和区鶴舞1-1-3',
      nearestStation: 'JR鶴舞駅 徒歩3分'
    },
    capacity: 2000,
    access: 'JR中央線鶴舞駅から徒歩3分。地下鉄鶴舞線鶴舞駅4番出口すぐ。',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13047.990657531383!2d136.919118!3d35.156679!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x600370bc26485bb1%3A0xaa773c547ea00cdf!2z5bKh6LC36Yu85qmf5ZCN5Y-k5bGL5YWs5Lya5aCC!5e0!3m2!1sja!2sus!4v1764574826802!5m2!1sja!2sus',
    venueWebsite: 'https://nagoyashi-kokaido.hall-info.jp/access/',
    parkingInfo: '専用駐車場なし。鶴舞公園周辺の有料駐車場をご利用ください。公共交通機関の利用を推奨します。',
    nearbyAttractions: [
      {
        name: '鶴舞公園',
        description: '桜の名所として有名な広大な公園',
        distance: '徒歩1分（会場前）'
      },
      {
        name: '名古屋城',
        description: '金のシャチホコで有名な名古屋のシンボル',
        distance: '地下鉄で10分'
      }
    ],
    longDistanceAccess: {
      fromAirport: [
        {
          from: '中部国際空港（セントレア）',
          method: '名鉄特急',
          time: '約50分',
          description: '中部国際空港から名鉄特急ミュースカイで金山駅→JR中央線で鶴舞駅',
          cost: '片道1,400円',
          notes: '名鉄特急は30分間隔で運行'
        },
        {
          from: '県営名古屋空港（小牧空港）',
          method: 'バス + 地下鉄',
          time: '約1時間',
          description: '県営名古屋空港からバスで名古屋駅→JR中央線で鶴舞駅（5分）',
          cost: '片道700円',
          notes: 'FDAなど国内線が発着'
        }
      ],
      fromShinkansen: [
        {
          from: '東京',
          method: '新幹線のぞみ',
          time: '約1時間40分',
          description: '東京から新幹線のぞみで名古屋駅→JR中央線で鶴舞駅（5分）',
          cost: '片道11,000円前後',
          notes: '名古屋駅からJRでわずか5分'
        },
        {
          from: '大阪',
          method: '新幹線のぞみ',
          time: '約50分',
          description: '新大阪から新幹線のぞみで名古屋駅→JR中央線で鶴舞駅',
          cost: '片道6,500円前後',
          notes: '名古屋駅からJRで5分'
        },
        {
          from: '福岡',
          method: '新幹線のぞみ',
          time: '約3時間15分',
          description: '博多から新幹線のぞみで名古屋駅→JR中央線で鶴舞駅',
          cost: '片道18,000円前後',
          notes: '名古屋駅からJRで5分'
        },
        {
          from: '仙台',
          method: '新幹線乗り継ぎ',
          time: '約3時間30分',
          description: '仙台から東北新幹線で東京→東海道新幹線で名古屋',
          cost: '片道19,000円前後',
          notes: '東京駅で乗り換え'
        }
      ],
      fromExpressBus: [
        {
          from: '東京・大阪',
          method: '夜行高速バス',
          time: '約6〜8時間',
          description: '東京・大阪から名古屋行きの夜行バスが多数運行。名古屋駅到着後、JRで鶴舞へ。',
          cost: '片道3,000円〜6,000円',
          notes: '前日夜発・当日朝着。経済的だが時間はかかる'
        }
      ],
      fromCar: [
        {
          from: '東京方面',
          method: '東名高速道路',
          time: '約4時間',
          description: '東名高速を経由し、名古屋ICで降りて名古屋市内へ。会場周辺に複数の有料駐車場あり。',
          cost: '高速料金 約7,500円（東京〜名古屋IC）',
          notes: '週末は東名高速が渋滞することがあります'
        },
        {
          from: '大阪方面',
          method: '名神高速道路',
          time: '約2時間30分',
          description: '名神高速を経由し、名古屋ICで降りて名古屋市内へ。',
          cost: '高速料金 約4,500円（大阪〜名古屋IC）',
          notes: '中部圏からのアクセスに便利'
        }
      ],
      recommendations: '新幹線が最も便利。名古屋駅からJRでわずか5分。中部空港からも約50分でアクセス良好。名古屋は新幹線のハブであり交通の便が非常に良い。'
    },
    parkingOptions: [
      {
        name: '鶴舞公園南駐車場',
        description: '鶴舞公園南駐車場の駐車場情報',
        price: '料金要確認',
        distance: '距離要確認',
        website: 'https://ssparking.co.jp/detail/%E9%B6%B4%E8%88%9E%E5%85%AC%E5%9C%92%E5%8D%97%E9%A7%90%E8%BB%8A%E5%A0%B4/',
        mapsUrl: 'https://www.google.com/maps/search/鶴舞公園地下駐車場',
      },
      {
        name: '名鉄協商パーキング 鶴舞',
        description: '名鉄協商パーキング 鶴舞の駐車場情報',
        price: '料金要確認',
        distance: '距離要確認',
        website: 'https://mkp.jp/search/detail/004575-0/?utm_source=gbp&utm_medium=profile&utm_campaign=4575',
        mapsUrl: 'https://www.google.com/maps/search/名鉄協商パーキング+鶴舞',
      },
    ],
    coinLockers: [
      {
        location: 'JR鶴舞駅構内',
        description: 'JR鶴舞駅構内のコインロッカー',
        price: '料金要確認',
        distance: '距離要確認',
        website: 'https://railway.jr-central.co.jp/station-guide/tokai/tsurumai/map.html',
        mapsUrl: 'https://www.google.com/maps/search/JR鶴舞駅',
      },
      {
        location: '地下鉄鶴舞駅構内',
        description: '地下鉄鶴舞駅構内のコインロッカー',
        price: '料金要確認',
        distance: '距離要確認',
        website: 'https://www.kotsu.city.nagoya.jp/jp/pc/subway/station_top.html?name=%E9%B6%B4%E8%88%9E',
        mapsUrl: 'https://www.google.com/maps/search/地下鉄鶴舞駅',
      },
    ],
    cafes: [
      {
        name: 'スターバックス イオンタウン千種店',
        description: 'スターバックス イオンタウン千種店でライブ前後の休憩に最適',
        distance: '徒歩10分',
        address: '愛知県名古屋市千種区千種2-16',
        website: 'https://store.starbucks.co.jp/detail-615/',
        mapsUrl: 'https://www.google.com/maps/search/スターバックス+イオンタウン千種',
      },
      {
        name: 'コメダ珈琲店 鶴舞店',
        description: '名古屋発祥のコメダ珈琲。モーニングセットが有名',
        distance: '徒歩5分',
        address: '愛知県名古屋市昭和区鶴舞',
        mapsUrl: 'https://www.google.com/maps/search/コメダ珈琲+鶴舞',
      },
    ],
    nearbyRestaurants: [
      {
        name: '矢場とん 矢場町本店',
        cuisine: '味噌カツ',
        description: '名古屋名物味噌カツの超有名店',
        distance: '地下鉄で10分',
        openTime: '11:00-22:00',
        price: '1,200円～1,800円',
        website: 'https://www.yabaton.com/',
        mapsUrl: 'https://www.google.com/maps/search/矢場とん+矢場町',
        recommended: true,
        recommendComment: '名古屋に来たら味噌カツ！矢場とんは絶対外せない'
      },
      {
        name: 'ひつまぶし備長',
        cuisine: 'ひつまぶし',
        description: '名古屋名物ひつまぶしの名店',
        distance: '地下鉄で15分',
        openTime: '11:30-14:30、17:00-21:00',
        price: '3,000円～4,500円',
        mapsUrl: 'https://www.google.com/maps/search/ひつまぶし備長+名古屋',
        recommended: true,
        recommendComment: 'うなぎのひつまぶしは名古屋グルメの代表！3通りの食べ方を楽しめる'
      },
      {
        name: '風来坊 本店',
        cuisine: '手羽先',
        description: '名古屋名物手羽先唐揚げ発祥の店。スパイシーで香ばしい',
        distance: '地下鉄で15分',
        openTime: '17:00-23:00',
        price: '2,000円～3,500円',
        website: 'https://www.furaibou.com/',
        mapsUrl: 'https://www.google.com/maps/search/風来坊+名古屋',
        recommended: true,
        recommendComment: '手羽先発祥の店！パリパリの食感とスパイシーな味付けが最高'
      },
      {
        name: '山本屋総本家',
        cuisine: '味噌煮込みうどん',
        description: '名古屋名物味噌煮込みうどんの老舗。コシの強い麺が特徴',
        distance: '徒歩20分',
        openTime: '11:00-21:00',
        price: '1,200円～1,800円',
        website: 'https://www.yamamotoyasyoten.co.jp/',
        mapsUrl: 'https://www.google.com/maps/search/山本屋総本家+名古屋',
        recommended: true,
        recommendComment: '名古屋めしの定番！八丁味噌の濃厚な味わいがクセになる'
      },
      {
        name: 'あつた蓬莱軒 本店',
        cuisine: 'ひつまぶし',
        description: 'ひつまぶし発祥の店。140年以上の歴史を誇る老舗',
        distance: '地下鉄で25分',
        openTime: '11:30-14:30、16:30-20:30',
        price: '3,800円～4,500円',
        website: 'https://www.houraiken.com/',
        mapsUrl: 'https://www.google.com/maps/search/あつた蓬莱軒+名古屋',
        recommended: true,
        recommendComment: 'ひつまぶし発祥の名店！行列覚悟でも食べる価値あり'
      },
      {
        name: 'コメダ珈琲店',
        cuisine: 'ファミレス',
        description: 'リーズナブルな食事。ライブ前後に便利',
        distance: '徒歩5分',
        openTime: '24時間営業',
        price: '1,000円～1,500円',
        mapsUrl: 'https://www.google.com/maps/search/コメダ珈琲店+鶴舞',
      }
    ],
    accommodations: [
      {
        name: '東横INN 名古屋栄',
        type: 'ビジネスホテル',
        description: '栄駅徒歩3分の好立地。清潔で快適な客室、無料朝食付き',
        distance: '地下鉄で鶴舞から10分',
        priceRange: '6,000円～8,500円/泊',
        features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '繁華街近'],
        website: 'https://www.toyoko-inn.com/search/detail/00020/',
        mapsUrl: 'https://www.google.com/maps/search/東横INN+名古屋栄',
        recommended: true,
        recommendComment: '栄繁華街近くで便利！名古屋遠征の定番ホテル'
      },
      {
        name: '快活CLUB 名古屋栄店',
        type: 'ネットカフェ',
        description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
        distance: '地下鉄で鶴舞から12分',
        priceRange: '2,500円～3,500円/泊',
        features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業'],
        website: 'https://www.kaikatsu.jp/shop/nagoya-sakae/',
        mapsUrl: 'https://www.google.com/maps/search/快活CLUB+名古屋栄',
        recommended: true,
        recommendComment: '予算を抑えたい時の最適解！栄の繁華街も近い'
      },
      {
        name: 'カプセルホテル名古屋',
        type: 'カプセルホテル',
        description: '大浴場・サウナ完備のカプセルホテル。女性専用フロアあり',
        distance: '名古屋駅から徒歩5分',
        priceRange: '3,500円～5,000円/泊',
        features: ['大浴場', 'サウナ', '女性専用フロア', '無料Wi-Fi', 'コインランドリー'],
        mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+名古屋駅'
      },
      {
        name: 'ホテルルートイン名古屋栄',
        type: 'ビジネスホテル',
        description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
        distance: '地下鉄で鶴舞から10分',
        priceRange: '6,500円～9,000円/泊',
        features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
        website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=366',
        mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+名古屋栄'
      }
    ]
}

export default nagoya_kokaido
