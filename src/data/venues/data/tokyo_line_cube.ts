import { Venue } from '../types'

export const tokyo_line_cube: Venue = {
    id: 'tokyo_line_cube',
    name: 'LINE CUBE SHIBUYA',
    date: '2026-07-10T18:30:00+09:00',
    times: { open: '17:30', start: '18:30' },
    location: { 
      prefecture: '東京都', 
      city: '渋谷区',
      address: '東京都渋谷区宇田川町1-1',
      nearestStation: 'JR渋谷駅 徒歩13分'
    },
    capacity: 1956,
    access: '【電車】JR山手線他渋谷駅より徒歩13分、JR山手線原宿駅より徒歩13分、東京メトロ千代田線・副都心線明治神宮前駅より徒歩13分。【バス】JR渋谷駅から京王バス「渋63または64中野駅」「宿51新宿駅西口」にて「渋谷区役所」下車。JR原宿駅から都営バス「早81早大正門」にて「渋谷区役所前」下車。明治神宮前駅からハチ公バス「神宮の杜ルート」にて「渋谷区役所」下車。',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12966.0787086158!2d139.698555!3d35.664204!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188cb803a8804f%3A0x99c035bb4f34ccfe!2zTElORSBDVUJFIFNISUJVWUHvvIjmuIvosLflhazkvJrloILvvIk!5e0!3m2!1sja!2sus!4v1764574861167!5m2!1sja!2sus',
    venueWebsite: 'https://linecubeshibuya.com/#access',
    parkingInfo: '駐車場のご準備はございませんので公共の交通機関をご利用ください。',
    nearbyAttractions: [
      {
        name: '渋谷スクランブル交差点',
        description: '世界で最も有名な交差点のひとつ',
        distance: '徒歩3分'
      },
      {
        name: '渋谷スカイ',
        description: '渋谷の街を一望できる展望施設',
        distance: '徒歩2分'
      },
      {
        name: 'ハチ公像',
        description: '忠犬ハチ公の銅像。待ち合わせスポットとして有名',
        distance: '徒歩4分'
      }
    ],
    longDistanceAccess: {
      fromAirport: [
        {
          from: '羽田空港',
          method: '京急線・東急線',
          time: '約40分',
          description: '羽田空港から京急線で品川駅→山手線で渋谷駅。または京急線で泉岳寺乗り換え→東急東横線で渋谷駅',
          cost: '片道580円',
          notes: '15分間隔で運行。渋谷駅から徒歩5分'
        },
        {
          from: '成田空港',
          method: '成田エクスプレス',
          time: '約1時間10分',
          description: '成田空港から成田エクスプレスで渋谷駅',
          cost: '片道3,300円',
          notes: '1時間に1本程度。直通で便利'
        }
      ],
      fromShinkansen: [
        {
          from: '大阪',
          method: '新幹線のぞみ',
          time: '約2時間40分',
          description: '新大阪から新幹線のぞみで品川駅→山手線で渋谷駅（10分）',
          cost: '片道14,000円前後',
          notes: '品川駅から山手線利用'
        },
        {
          from: '名古屋',
          method: '新幹線のぞみ',
          time: '約1時間50分',
          description: '名古屋から新幹線のぞみで品川駅→山手線で渋谷駅',
          cost: '片道11,000円前後',
          notes: '品川駅から山手線利用'
        },
        {
          from: '仙台',
          method: '東北新幹線はやぶさ',
          time: '約1時間50分',
          description: '仙台から東北新幹線はやぶさで東京駅→山手線で渋谷駅（20分）',
          cost: '片道11,000円前後',
          notes: '東京駅から山手線利用'
        },
        {
          from: '福岡',
          method: '新幹線のぞみ',
          time: '約5時間30分',
          description: '博多から新幹線のぞみで品川駅→山手線で渋谷駅',
          cost: '片道23,000円前後',
          notes: '飛行機も検討を。羽田空港から約40分'
        }
      ],
      fromExpressBus: [
        {
          from: '全国主要都市',
          method: '夜行高速バス',
          time: '6〜12時間',
          description: '全国主要都市から東京（新宿・渋谷）行きの夜行バスが多数運行。渋谷駅・新宿駅到着後、会場へ。',
          cost: '片道3,000円〜10,000円',
          notes: '前日夜発・当日朝着。最も経済的な選択肢'
        }
      ],
      fromCar: [
        {
          from: '横浜方面',
          method: '首都高速',
          time: '約40分',
          description: '首都高速湾岸線・台場線を経由し、渋谷出口で降りて渋谷方面へ。会場周辺に複数の有料駐車場あり。',
          cost: '高速料金 約1,300円',
          notes: '都心部は渋滞が多いため、公共交通機関の利用を推奨'
        },
        {
          from: '埼玉方面',
          method: '首都高速',
          time: '約50分',
          description: '首都高速を経由し、渋谷出口で降りて渋谷方面へ。',
          cost: '高速料金 約1,300円',
          notes: '駐車場は混雑が予想されるため事前予約推奨'
        }
      ],
      recommendations: '首都東京へのアクセスは全国から容易。羽田空港からは電車40分、成田空港からも成田エクスプレスで直通。新幹線利用の場合は東京駅・品川駅から山手線で。'
    },
    parkingOptions: [
      {
        name: '渋谷マークシティ駐車場',
        description: '渋谷マークシティ駐車場の駐車場情報',
        price: '料金要確認',
        distance: '距離要確認',
        website: 'https://www.shibuya-mark-city.com/access/',
        mapsUrl: 'https://www.google.com/maps/search/渋谷マークシティ+駐車場',
      },
      {
        name: '渋谷ヒカリエ駐車場',
        description: '渋谷ヒカリエ駐車場の駐車場情報',
        price: '料金要確認',
        distance: '距離要確認',
        website: 'https://www.hikarie.jp/access/',
        mapsUrl: 'https://www.google.com/maps/search/渋谷ヒカリエ+駐車場',
      },
    ],
    coinLockers: [
      {
        location: 'JR渋谷駅構内',
        description: 'JR渋谷駅構内のコインロッカー',
        price: '料金要確認',
        distance: '距離要確認',
        website: 'https://www.jreast.co.jp/estation/stations/866.html',
        mapsUrl: 'https://www.google.com/maps/search/JR渋谷駅',
      },
      {
        location: '渋谷マークシティ',
        description: '渋谷マークシティのコインロッカー',
        price: '料金要確認',
        distance: '距離要確認',
        website: 'https://www.shibuya-mark-city.com/',
        mapsUrl: 'https://www.google.com/maps/search/渋谷マークシティ',
      },
      {
        location: '渋谷ヒカリエ',
        description: '渋谷ヒカリエのコインロッカー',
        price: '料金要確認',
        distance: '距離要確認',
        website: 'https://www.hikarie.jp/',
        mapsUrl: 'https://www.google.com/maps/search/渋谷ヒカリエ',
      },
    ],
    cafes: [
      {
        name: 'スターバックス 渋谷マークシティ店',
        description: 'スターバックス 渋谷マークシティ店でライブ前後の休憩に最適',
        distance: '距離要確認',
        address: '住所要確認',
        website: 'https://www.starbucks.co.jp/',
        mapsUrl: 'https://www.google.com/maps/search/スターバックス+渋谷マークシティ',
      },
      {
        name: 'タリーズコーヒー 道玄坂店',
        description: 'タリーズコーヒー 道玄坂店でライブ前後の休憩に最適',
        distance: '距離要確認',
        address: '住所要確認',
        website: 'https://www.tullys.co.jp/',
        mapsUrl: 'https://www.google.com/maps/search/タリーズコーヒー+道玄坂',
      },
      {
        name: 'ドトールコーヒー 渋谷駅前店',
        description: 'ドトールコーヒー 渋谷駅前店でライブ前後の休憩に最適',
        distance: '距離要確認',
        address: '住所要確認',
        website: 'https://www.doutor.co.jp/',
        mapsUrl: 'https://www.google.com/maps/search/ドトールコーヒー+渋谷駅前',
      },
    ],
    holyPlaces: [
      {
        name: 'ローズガーデン新宿',
        description: 'れをる関連の聖地: ローズガーデン新宿',
        type: 'MV/作品関連',
        distance: '距離要確認',
        address: '住所要確認',
        mapsUrl: 'https://www.google.com/maps/',
      },
      {
        name: '浄土宗 梅窓院',
        description: 'れをる関連の聖地: 浄土宗 梅窓院',
        type: 'MV/作品関連',
        distance: '距離要確認',
        address: '住所要確認',
        website: 'https://www.baisouin.or.jp/',
        mapsUrl: 'https://www.google.com/maps/place/%E6%B5%84%E5%9C%9F%E5%AE%97+%E6%A2%85%E7%AA%93%E9%99%A2/',
      },
      {
        name: 'THE GARAGE (Little TAO)',
        description: '切っ先 映像盤 れをるTVって言われました：金継ぎしたいものあれば',
        type: 'MV/作品関連',
        distance: '距離要確認',
        address: '住所要確認',
        mapsUrl: 'https://www.google.com/maps/place/THE+GARAGE/',
      },
      {
        name: '日枝神社',
        description: '武道館発表後の年末にReolが成功祈願に来ていた神社',
        type: 'Reol関連',
        distance: '赤坂駅から徒歩3分',
        address: '東京都千代田区永田町2-10-5',
        website: 'https://www.hiejinja.net/',
        mapsUrl: 'https://www.google.com/maps/search/日枝神社+東京',
      },
      {
        name: 'カフェ・アンセーニュ・ダングル 自由が丘店',
        description: 'Reol関連の聖地カフェ',
        type: 'Reol関連',
        distance: '自由が丘駅から徒歩5分',
        address: '東京都目黒区自由が丘',
        mapsUrl: 'https://www.google.com/maps/search/カフェ・アンセーニュ・ダングル+自由が丘',
      },
      {
        name: '加平谷中トンネル',
        description: 'BOYのMVロケ地',
        type: 'MV/作品関連',
        title: 'BOY',
        distance: '西日暮里駅から徒歩10分',
        address: '東京都荒川区西日暮里',
        mapsUrl: 'https://www.google.com/maps/search/加平谷中トンネル',
      },
      {
        name: '六本木トンネルの壁画',
        description: 'BOYのMVロケ地',
        type: 'MV/作品関連',
        title: 'BOY',
        distance: '六本木駅から徒歩5分',
        address: '東京都港区六本木',
        mapsUrl: 'https://www.google.com/maps/search/六本木トンネル+壁画',
      },
      {
        name: 'うつわのみせ大文字',
        description: 'Reolが金継ぎしていた器を買ったお店',
        type: 'Reol関連',
        distance: '距離要確認',
        address: '東京都',
        mapsUrl: 'https://www.google.com/maps/search/うつわのみせ大文字+東京',
      },
      {
        name: '芝浦南ふ頭公園',
        description: '虚構集のXFD映像のロケ地',
        type: 'MV/作品関連',
        title: '虚構集',
        distance: '芝浦ふ頭駅から徒歩6分',
        address: '東京都港区海岸3-33-20',
        mapsUrl: 'https://maps.app.goo.gl/1H48yUyayMFSA7Rq7',
      },
      {
        name: '虎へび珈琲',
        description: 'インスタのストーリーでここのアイスコーヒーを飲んでいた',
        type: 'Reol関連',
        distance: '渋谷駅から徒歩5分',
        address: '東京都渋谷区宇田川町１５−１ 渋谷PARCO 3F アウトサイド',
        mapsUrl: 'https://maps.app.goo.gl/bsZJV2noLXs8D71s8',
      },
      {
        name: '池部楽器店 グランディ＆ジャングル',
        description: '現在使用しているギターを買った場所',
        type: 'Reol関連',
        distance: '渋谷駅から徒歩3分',
        address: '東京都渋谷区道玄坂１丁目７−４ 渋谷スクエア B 1F~2F',
        website: 'https://www.ikebe-gakki.com/',
        mapsUrl: 'https://maps.app.goo.gl/JjJDNr9UvfYBT69u5',
      },
      {
        name: '河辺温泉 梅の湯',
        description: 'Reol関連の聖地温泉',
        type: 'Reol関連',
        distance: '河辺駅から徒歩5分',
        address: '東京都青梅市河辺町10-8-1',
        mapsUrl: 'https://maps.app.goo.gl/2WgGzFqg6PmkAgJy8',
      },
    ],
    nearbyRestaurants: [
      {
        name: '渋谷パルコ レストラン街',
        cuisine: '各種',
        description: '渋谷パルコ内の多彩な飲食店',
        distance: '徒歩10分',
        openTime: '11:00-23:00（店舗により異なる）',
        price: '1,500円～3,000円',
        website: 'https://shibuya.parco.jp/page2/restaurant/',
        mapsUrl: 'https://www.google.com/maps/search/渋谷パルコ+レストラン',
        recommended: true,
        recommendComment: '多彩な店舗から選べる！ライブ前後に便利'
      },
      {
        name: '一蘭 渋谷店',
        cuisine: 'ラーメン',
        description: '博多とんこつラーメンの人気店',
        distance: '徒歩12分',
        openTime: '24時間営業',
        price: '900円～1,200円',
        website: 'https://ichiran.com/',
        mapsUrl: 'https://www.google.com/maps/search/一蘭+渋谷',
      },
      {
        name: '磯丸水産 渋谷店',
        cuisine: '海鮮',
        description: '新鮮な海鮮丸と刺身の居酒屋',
        distance: '徒歩12分',
        openTime: '11:30-23:00',
        price: '2,000円～4,000円',
        mapsUrl: 'https://www.google.com/maps/search/磯丸水産+渋谷',
        recommended: true,
        recommendComment: '新鮮な海鮮が楽しめる！コスパも良い'
      },
      {
        name: 'サイゼリヤ 渋谷店',
        cuisine: 'ファミレス',
        description: 'リーズナブルなイタリアン。ライブ前後に便利',
        distance: '徒歩8分',
        openTime: '10:00-23:00',
        price: '1,000円～1,500円',
        mapsUrl: 'https://www.google.com/maps/search/サイゼリヤ+渋谷',
      }
    ],
    accommodations: [
      {
        name: '東横INN 渋谷新南口',
        type: 'ビジネスホテル',
        description: '渋谷駅徒歩5分の好立地。清潔で快適な客室、無料朝食付き',
        distance: '渋谷駅から徒歩5分',
        priceRange: '7,000円～10,000円/泊',
        features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
        website: 'https://www.toyoko-inn.com/search/detail/00002/',
        mapsUrl: 'https://www.google.com/maps/search/東横INN+渋谷新南口',
        recommended: true,
        recommendComment: '渋谷駅近くで便利！東京遠征の定番ホテル'
      },
      {
        name: '快活CLUB 渋谷店',
        type: 'ネットカフェ',
        description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
        distance: '渋谷駅から徒歩7分',
        priceRange: '3,000円～4,000円/泊',
        features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業'],
        website: 'https://www.kaikatsu.jp/shop/shibuya/',
        mapsUrl: 'https://www.google.com/maps/search/快活CLUB+渋谷',
        recommended: true,
        recommendComment: '予算を抑えたい時の最適解！繁華街も近い'
      },
      {
        name: 'カプセルホテル渋谷',
        type: 'カプセルホテル',
        description: '大浴場・サウナ完備のカプセルホテル。女性専用フロアあり',
        distance: '渋谷駅から徒歩8分',
        priceRange: '4,000円～6,000円/泊',
        features: ['大浴場', 'サウナ', '女性専用フロア', '無料Wi-Fi', 'コインランドリー'],
        mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+渋谷駅'
      },
      {
        name: 'ホテルルートイン渋谷',
        type: 'ビジネスホテル',
        description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
        distance: '渋谷駅から徒歩8分',
        priceRange: '7,500円～10,000円/泊',
        features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
        website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=392',
        mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+渋谷'
      }
    ]
}

export default tokyo_line_cube
