import { Venue } from '../types'

export const taipei_zepp_new_taipei: Venue = {
    id: 'taipei_zepp_new_taipei',
    name: 'Zepp New Taipei',
    date: '2026-07-26T00:00:00+08:00',
    times: { open: 'TBA', start: 'TBA' },
    location: { 
      prefecture: 'TAIPEI', 
      city: '台北',
      address: '新北市新莊區新北大道四段3號8樓【宏匯廣場】',
      nearestStation: 'MRT環状線 新北產業園區駅 徒歩約5分'
    },
    capacity: 2245,
    access: '【MRT】環状線「新北產業園區駅」1番出口から徒歩約5分。宏匯廣場（Honhui Plaza）の8階。【バス】新北大道沿いに複数のバス路線あり。「宏匯廣場」バス停下車。',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.7!2d121.4388!3d25.0427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a7d3a8d8c5e7%3A0x9d1d3e5c5b5a5b5c!2sZepp+New+Taipei!5e0!3m2!1sja!2stw!4v1',
    venueWebsite: 'https://www.zepp.co.jp/hall/newtaipei/',
    parkingInfo: '宏匯廣場の地下駐車場を利用可能。MRTの利用を推奨。',
    longDistanceAccess: {
      fromAirport: [
        {
          from: '台湾桃園国際空港（TPE）',
          method: '桃園MRT',
          time: '約50分',
          description: '桃園国際空港から桃園MRT空港線で「三重駅」→環状線に乗り換え「新北產業園區駅」下車→徒歩約5分',
          cost: '片道約160TWD（約750円）',
          notes: '日本からの直行便が多数。空港からMRTが便利'
        },
        {
          from: '台北松山空港（TSA）',
          method: 'MRT',
          time: '約40分',
          description: '松山空港からMRT文湖線で「大安駅」→板南線で「板橋駅」→環状線で「新北產業園區駅」下車→徒歩約5分',
          cost: '片道約50TWD（約230円）',
          notes: '羽田からの直行便あり。都心に近く便利'
        }
      ],
      fromExpressBus: [
        {
          from: '台北駅',
          method: 'MRT',
          time: '約30分',
          description: '台北駅からMRT板南線で「板橋駅」→環状線に乗り換え「新北產業園區駅」下車→徒歩約5分',
          cost: '片道約40TWD（約190円）',
          notes: '台北市内からのアクセスが便利'
        },
        {
          from: '台北車站（高鐵/台鉄）',
          method: '高鐵（台湾新幹線）+ MRT',
          time: '台中から約1時間 + MRT約30分',
          description: '台湾各地から高鐵で台北車站→MRTで新北產業園區駅へ',
          cost: '高鐵 台中-台北 片道約700TWD（約3,300円）',
          notes: '台湾南部からの移動に便利'
        }
      ],
      recommendations: '日本からは台湾桃園国際空港（TPE）への直行便が便利（成田・羽田・関空・中部・福岡等から多数運航、飛行時間約3〜4時間）。空港からは桃園MRTで会場最寄り駅まで乗り換え1回で到着可能。台北松山空港は羽田から直行便があり都心に近い。パスポート必須、90日以内の観光はビザ不要。'
    },
    coinLockers: [
      {
        location: 'Zepp New Taipei 会場内ロッカー（小）',
        description: '会場8F-9Fに設置。765台。スマートフォンや財布などの小物向け',
        price: '50TWD（約230円）',
        distance: '会場内',
        recommended: true,
        recommendComment: '数が多いので比較的確保しやすい'
      },
      {
        location: 'Zepp New Taipei 会場内ロッカー（中）',
        description: '会場8F-9Fに設置。14台。リュックサック等の中型荷物向け',
        price: '100TWD（約470円）',
        distance: '会場内',
        recommendComment: '台数が少ないため早めの確保推奨'
      },
      {
        location: 'Zepp New Taipei 会場内ロッカー（大）',
        description: '会場8F-9Fに設置。14台。キャリーバッグ等の大型荷物向け',
        price: '100TWD（約470円）',
        distance: '会場内',
        recommendComment: '台数が少ないため早めの確保推奨'
      },
    ],
    nearbyAttractions: [
      {
        name: '宏匯廣場（Honhui Plaza）',
        description: 'Zepp New Taipeiが入居する大型ショッピングモール。レストラン、映画館、ショップが充実',
        distance: '同施設内'
      },
      {
        name: '新莊廟街夜市',
        description: '地元で人気の夜市。台湾グルメを手軽に楽しめる',
        distance: '車で約10分'
      },
      {
        name: '台北101',
        description: '台北のランドマーク。展望台から台北市街を一望',
        distance: 'MRTで約40分'
      },
      {
        name: '九份',
        description: '千と千尋の神隠しの雰囲気で有名なレトロな街並み',
        distance: '車で約1時間'
      },
      {
        name: '士林夜市',
        description: '台北最大の夜市。多彩な屋台料理やショッピングが楽しめる',
        distance: 'MRTで約40分'
      },
    ],
    nearbyRestaurants: [
      {
        name: '宏匯廣場 フードコート',
        cuisine: '各種台湾料理',
        description: '同施設内のフードコート。台湾料理から日本食まで多彩なラインナップ',
        distance: '同施設内',
        price: '100〜300TWD（約470〜1,400円）',
        recommended: true,
        recommendComment: '会場と同じビル内で最も便利！ライブ前後の食事に最適'
      },
      {
        name: '鼎泰豊（ディンタイフォン）板橋店',
        cuisine: '小籠包',
        description: '世界的に有名な小籠包の名店。会場最寄りは大遠百板橋店B1。環状線で板橋駅まで数駅',
        distance: 'MRTで約10分（板橋駅直結）',
        openTime: '月〜木 11:00〜20:30 / 金 11:00〜21:00 / 土 10:50〜21:00 / 日 10:50〜20:30',
        price: '300〜600TWD（約1,400〜2,800円）',
        website: 'https://www.dintaifung.com.tw/',
        mapsUrl: 'https://www.google.com/maps/search/鼎泰豊+板橋+大遠百',
        recommended: true,
        recommendComment: '台湾に行ったらぜひ！会場から最寄りの店舗。モチモチの小籠包は絶品'
      },
      {
        name: '阜杭豆漿',
        cuisine: '台湾式朝食',
        description: '行列必至の人気朝食店。豆漿（豆乳）や焼餅が絶品',
        distance: 'MRT善導寺駅すぐ',
        openTime: '05:30〜12:30',
        price: '50〜150TWD（約230〜700円）',
        mapsUrl: 'https://www.google.com/maps/search/阜杭豆漿',
        recommendComment: '翌朝の朝食におすすめ！早朝から行列ができる人気店'
      },
    ],
    accommodations: [
      {
        name: 'シーザーメトロ台北（凱達大飯店）',
        type: 'シティホテル',
        description: 'MRT万華駅直結の大型ホテル。台北駅からも近く便利',
        distance: 'MRTで約25分',
        priceRange: '3,000〜6,000TWD（約14,000〜28,000円）/泊',
        features: ['駅直結', 'レストラン', 'フィットネス', '無料Wi-Fi'],
        website: 'https://www.caesarmetro.com/',
        mapsUrl: 'https://www.google.com/maps/search/凱達大飯店+台北',
      },
      {
        name: '三井ガーデンホテル台北忠孝（MGH Mitsui Garden Hotel 台北忠孝）',
        type: 'ビジネスホテル',
        description: '三井不動産グループの日系ホテル。MRT忠孝新生駅3番出口から徒歩約30秒。大浴場完備で旅の疲れを癒せる',
        distance: 'MRTで約35分（忠孝新生駅→板橋駅→新北產業園區駅）',
        priceRange: '4,000〜8,000TWD（約18,800〜37,600円）/泊',
        features: ['日系ホテル', '大浴場あり', '駅徒歩30秒', 'レストラン', '無料Wi-Fi'],
        website: 'https://www.gardenhotels.co.jp/taipei-zhongxiao/',
        mapsUrl: 'https://www.google.com/maps/search/三井ガーデンホテル台北忠孝',
        recommended: true,
        recommendComment: '日系ホテルで安心！大浴場でライブ後の疲れを癒せる。日本語対応スタッフ在籍'
      },
      {
        name: '西門町エリアのホステル',
        type: 'ゲストハウス',
        description: '若者に人気の西門町エリア。リーズナブルなゲストハウスやホステルが多い',
        distance: 'MRTで約25分',
        priceRange: '500〜1,500TWD（約2,300〜7,000円）/泊',
        features: ['リーズナブル', '繁華街', 'ショッピング便利', '無料Wi-Fi'],
        mapsUrl: 'https://www.google.com/maps/search/ホステル+西門町',
        recommendComment: '予算を抑えたい方におすすめ！夜市も近い'
      },
    ],
}

export default taipei_zepp_new_taipei
