import { Venue } from '../types'

export const nagano_junk_box: Venue = {
  id: 'nagano_junk_box',
  name: '長野CLUB JUNK BOX',
  date: '2026-05-23T17:00:00+09:00',
  times: { open: '16:30', start: '17:00' },
  location: { 
    prefecture: '長野県', 
    city: '長野市',
    address: '長野県長野市南石堂町1423',
    nearestStation: 'JR長野駅 徒歩10分'
  },
  capacity: 500,
  access: '【電車】JR長野駅善光寺口から徒歩10分。長野大通り右側を進み「南千歳町南」交差点（三菱UFJ銀行）を右折、直進しJR自転車駐輪場向かいの白いビル4F。【車】上信越道「須坂長野東IC」から20分、「七瀬郵便局前」交差点を右折、JR高架下をくぐり左折、「南千歳町南」交差点を左折。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12804.977539789488!2d138.189812!3d36.644571!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601d86ecf9e91009%3A0x5ad5e487adde8e7a!2sNAGANO%20CLUB%20JUNK%20BOX!5e0!3m2!1sja!2sus!4v1764574251248!5m2!1sja!2sus',
  venueWebsite: 'http://www.junkbox.co.jp/nagano/sp/info.html',
  parkingInfo: '専用駐車場なし。近隣の有料駐車場をご利用ください。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '成田空港・羽田空港',
        method: '電車',
        time: '約3〜4時間',
        description: '空港から東京駅経由で北陸新幹線',
        cost: '片道12,000円前後',
        notes: '空港から長野へは新幹線利用'
      }
    ],
    fromShinkansen: [
      {
        from: '東京',
        method: '北陸新幹線',
        time: '約1時間30分',
        description: '東京駅から北陸新幹線かがやきで長野駅',
        cost: '片道8,200円前後',
        notes: '最速列車で約80分'
      },
      {
        from: '大阪',
        method: '新幹線乗り継ぎ',
        time: '約4時間',
        description: '新大阪から東海道新幹線で東京→北陸新幹線で長野',
        cost: '片道18,000円前後',
        notes: '東京駅で乗り換え'
      },
      {
        from: '名古屋',
        method: '特急しなの',
        time: '約3時間',
        description: '名古屋駅から特急しなので長野駅',
        cost: '片道6,900円',
        notes: '中央本線経由。景色が良い'
      },
      {
        from: '金沢',
        method: '北陸新幹線',
        time: '約1時間',
        description: '金沢駅から北陸新幹線はくたかで長野駅',
        cost: '片道6,380円',
        notes: '北陸方面からもアクセス良好'
      }
    ],
    fromExpressBus: [
      {
        from: '東京・新宿',
        method: '高速バス',
        time: '約3時間30分',
        description: '新宿・東京から長野駅行き高速バス',
        cost: '片道3,000円前後',
        notes: '新幹線より安価'
      }
    ],
    fromCar: [
      {
        from: '東京方面',
        method: '中央自動車道・長野自動車道',
        time: '約3時間',
        description: '中央自動車道→長野自動車道を経由し、長野ICで降りて長野市内へ。会場周辺に有料駐車場あり。',
        cost: '高速料金 約5,500円（東京〜長野IC）',
        notes: '冬季は路面凍結の可能性あり。スタッドレスタイヤ推奨'
      },
      {
        from: '名古屋方面',
        method: '中央自動車道',
        time: '約3時間30分',
        description: '中央自動車道を経由し、長野ICで降りて長野市内へ。',
        cost: '高速料金 約6,000円（名古屋〜長野IC）',
        notes: '中部圏からのアクセスに便利'
      }
    ],
    recommendations: '東京から北陸新幹線で1時間30分。名古屋から特急しなのも便利。善光寺観光と合わせて。'
  },
  parkingOptions: [
    {
      name: 'タイムズ長野権堂',
      description: '権堂エリアの駐車場',
      price: '料金要確認',
      distance: '徒歩5分',
      website: 'https://times-info.net/P20-nagano/',
      mapsUrl: 'https://www.google.com/maps/search/タイムズ+長野権堂',
    },
    {
      name: '長野駅周辺駐車場',
      description: '長野駅近くの駐車場',
      price: '料金要確認',
      distance: '徒歩10分',
      mapsUrl: 'https://www.google.com/maps/search/長野駅+駐車場',
    },
  ],
  coinLockers: [
    {
      location: 'JR長野駅構内',
      description: 'JR長野駅構内のコインロッカー',
      price: '300円〜600円',
      distance: '徒歩10分',
      website: 'https://www.jreast.co.jp/estation/stations/474.html',
      mapsUrl: 'https://www.google.com/maps/search/JR長野駅',
    },
    {
      location: '権堂アーケード',
      description: '権堂アーケード内のコインロッカー',
      price: '料金要確認',
      distance: '徒歩2分',
      mapsUrl: 'https://www.google.com/maps/search/権堂アーケード+コインロッカー',
    },
  ],
  cafes: [
    {
      name: 'スターバックス 長野駅前店',
      description: '長野駅前のスターバックス',
      distance: '徒歩10分',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+長野駅前',
    },
    {
      name: 'ドトールコーヒー 長野店',
      description: 'ドトールコーヒーでライブ前後の休憩',
      distance: '徒歩8分',
      mapsUrl: 'https://www.google.com/maps/search/ドトールコーヒー+長野',
    },
  ],
  nearbyAttractions: [
    {
      name: '善光寺',
      description: '国宝の本堂を持つ古刹。「一生に一度は善光寺参り」',
      distance: '徒歩20分',
      website: 'https://www.zenkoji.jp/'
    },
    {
      name: '権堂アーケード',
      description: '長野の繁華街。飲食店や商店が立ち並ぶ',
      distance: '徒歩すぐ',
      website: 'https://gondo-shotengai.com/'
    },
    {
      name: '長野オリンピックスタジアム',
      description: '1998年長野オリンピックの開会式会場',
      distance: 'バスで20分',
      website: 'https://www.nagano-olympicstadium.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: '藤木庵',
      cuisine: 'そば',
      description: '信州そばの名店。十割そばが絶品',
      distance: '徒歩12分',
      openTime: '11:00-15:00、17:00-20:00',
      price: '1,000円～1,800円',
      mapsUrl: 'https://www.google.com/maps/search/藤木庵+長野',
      recommended: true,
      recommendComment: '長野に来たら信州そば！香り高い十割そばが最高'
    },
    {
      name: 'THE FUJIYA GOHONJIN',
      cuisine: '洋食',
      description: '善光寺門前の歴史的建造物を改装したレストラン。信州食材のイタリアン',
      distance: '徒歩15分',
      openTime: '11:30-14:00、17:30-22:00',
      price: '3,000円～8,000円',
      website: 'https://www.thefujiyagohonjin.com/',
      mapsUrl: 'https://www.google.com/maps/search/THE+FUJIYA+GOHONJIN+長野',
      recommended: true,
      recommendComment: '歴史的建造物で味わう信州食材のイタリアン！雰囲気も最高'
    },
    {
      name: '明治亭 長野駅前店',
      cuisine: 'ソースカツ丼',
      description: '信州名物ソースカツ丼の人気店。分厚いロースカツが特徴',
      distance: '徒歩10分',
      openTime: '11:00-20:30',
      price: '1,200円～1,800円',
      website: 'https://www.meijitei.com/',
      mapsUrl: 'https://www.google.com/maps/search/明治亭+長野駅',
      recommended: true,
      recommendComment: '信州名物のソースカツ丼！分厚くサクサクのカツが最高'
    },
    {
      name: '竹風堂 善光寺大門店',
      cuisine: '栗おこわ',
      description: '小布施名物の栗おこわが名物の老舗。栗菓子も人気',
      distance: '徒歩12分',
      openTime: '10:00-18:00',
      price: '800円～1,500円',
      website: 'https://chikufudo.com/',
      mapsUrl: 'https://www.google.com/maps/search/竹風堂+善光寺+長野',
      recommended: true,
      recommendComment: '長野土産の定番！栗おこわはほくほくの美味しさ'
    }
  ],
  accommodations: [
    {
      name: '東横INN 長野駅前',
      type: 'ビジネスホテル',
      description: '長野駅徒歩3分の好立地。清潔で快適な客室、無料朝食付き',
      distance: '長野駅から徒歩3分',
      priceRange: '5,000円～7,000円/泊',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー', '駅近'],
      website: 'https://www.toyoko-inn.com/search/detail/00034/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+長野駅前',
      recommended: true,
      recommendComment: '駅近で清潔、朝食無料！長野遠征の定番ホテル'
    },
    {
      name: '快活CLUB 長野店',
      type: 'ネットカフェ',
      description: '完全個室のネットカフェ。シャワー、ドリンクバー完備',
      distance: '長野駅から車で10分',
      priceRange: '2,000円～3,000円/泊',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題', '24時間営業', '無料駐車場'],
      website: 'https://www.kaikatsu.jp/shop/nagano/',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+長野',
      recommended: true,
      recommendComment: '車での遠征なら最適！駐車場無料で予算も抑えられる'
    },
    {
      name: 'カプセルホテル長野',
      type: 'カプセルホテル',
      description: '大浴場・サウナ完備のカプセルホテル',
      distance: '長野駅から徒歩6分',
      priceRange: '3,000円～4,000円/泊',
      features: ['大浴場', 'サウナ', '無料Wi-Fi', 'コインランドリー'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+長野駅'
    },
    {
      name: 'ホテルルートイン長野',
      type: 'ビジネスホテル',
      description: '大浴場完備のビジネスホテル。朝食バイキングも好評',
      distance: '長野駅から徒歩6分',
      priceRange: '5,500円～8,000円/泊',
      features: ['大浴場', '無料朝食', '無料Wi-Fi', 'コインランドリー'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=91',
      mapsUrl: 'https://www.google.com/maps/search/ホテルルートイン+長野'
    }
  ]
}

export default nagano_junk_box
