import { Venue } from '../types'

export const tochigi_heavens_rock: Venue = {
  id: 'tochigi_heavens_rock',
  name: "HEAVEN'S ROCK UTSUNOMIYA VJ-2",
  date: '2026-03-14T18:00:00+09:00',
  times: { open: '17:00', start: '18:00' },
  location: { 
    prefecture: '栃木県', 
    city: '宇都宮市',
    address: '栃木県宇都宮市宮園町5-33 東武宇都宮西口ビルB1F',
    nearestStation: '東武宇都宮駅 徒歩1分'
  },
  capacity: 400,
  access: '【電車・バス】東京方面からＪＲを利用。ＪＲ宇都宮駅西口下車、駅前バスターミナルの1/6/7/11/12/13/14番からのバスにて「東武駅前」下車、進行方向に直進、「池上町交差点」を左折、正面の緑色の横断歩道橋を目指す。横断歩道橋のほぼ真下左側に「VJ-2」という緑色看板のあるビル。',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3204.7923519298633!2d139.87766411744383!3d36.55911940000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601f67b953b5b7c3%3A0x8242cb57adeed091!2zSEVBVkVOJ1MgUk9DSyDlrofpg73lrq4gVkotMg!5e0!3m2!1sja!2sjp!4v1763452827581!5m2!1sja!2sjp',
  venueWebsite: 'https://www.heavensrock.com/utsunomiya/access/',
  parkingInfo: '専用駐車場なし。近隣に複数の有料駐車場あり。',
  longDistanceAccess: {
    fromAirport: [
      {
        from: '羽田空港',
        method: 'リムジンバス',
        time: '約2時間30分',
        description: '羽田空港から宇都宮駅西口行きのリムジンバスが運行。1日4〜5本程度。JR宇都宮駅下車後、東武宇都宮線に乗り換えて宮園町駅へ（約5分）、または徒歩28分。',
        cost: '片道3,000円前後 + 東武線160円',
        notes: '事前予約推奨。満席の場合は電車ルートへ'
      },
      {
        from: '羽田空港',
        method: '電車（東京駅経由）',
        time: '約2時間30分',
        description: '羽田空港→（京急・山手線）→東京駅→（東北新幹線）→宇都宮駅。新幹線利用で快適・確実。',
        cost: '片道5,500円前後（新幹線自由席）',
        notes: '新幹線はやまびこ・なすのが停車。1時間に2〜3本'
      },
      {
        from: '成田空港',
        method: '電車（東京駅経由）',
        time: '約3時間',
        description: '成田空港→（成田エクスプレス）→東京駅→（東北新幹線）→宇都宮駅',
        cost: '片道6,500円前後',
        notes: '成田エクスプレスと新幹線の乗り継ぎ時間に注意'
      }
    ],
    fromShinkansen: [
      {
        from: '東京駅',
        method: '東北新幹線',
        time: '約50分',
        description: '東京駅から東北新幹線「なすの」または「やまびこ」で宇都宮駅へ。宇都宮駅西口から徒歩28分。',
        cost: '片道4,000円前後（自由席）',
        notes: '1時間に2〜3本運行。指定席の場合+530円'
      },
      {
        from: '大宮駅',
        method: '東北新幹線',
        time: '約30分',
        description: '大宮駅から東北新幹線で宇都宮駅へ。埼玉方面からのアクセスに便利。',
        cost: '片道2,500円前後（自由席）',
        notes: '東京発の新幹線はすべて大宮駅に停車'
      }
    ],
    fromExpressBus: [
      {
        from: '新宿・池袋',
        method: '高速バス',
        time: '約2時間30分',
        description: '新宿・池袋から宇都宮駅行きの高速バスが頻発。JRバス関東・東野交通が運行。',
        cost: '片道2,000円前後',
        notes: '渋滞の影響を受ける可能性あり。時間に余裕を持って'
      }
    ],
    fromCar: [
      {
        from: '東京方面',
        method: '東北自動車道',
        time: '約1時間30分',
        description: '東北自動車道を北上し、鹿沼ICまたは宇都宮ICで降りてJR宇都宮駅方面へ。駅周辺に複数の有料駐車場あり。',
        cost: '高速料金 約2,500円（東京～宇都宮IC）',
        notes: '土日祝日は渋滞の可能性あり。駐車場は事前確認推奨'
      },
      {
        from: '仙台方面',
        method: '東北自動車道',
        time: '約2時間30分',
        description: '東北自動車道を南下し、宇都宮ICで降りてJR宇都宮駅方面へ。',
        cost: '高速料金 約4,500円（仙台～宇都宮IC）',
        notes: '長距離運転のため休憩を適宜取ること'
      }
    ],
    recommendations: '関東圏からは新幹線が最速で確実。遠方からは羽田空港経由がおすすめ。バスは経済的だが渋滞リスクあり。'
  },
  parkingOptions: [
    {
      name: 'TOBU PARK 東武宇都宮駅第2駐車場',
      description: '会場に最も近い駐車場。東武宇都宮駅前にあり、アクセス抜群。',
      price: '¥100/30分（8:00-21:00）、¥100/60分（21:00-8:00）。昼間最大（平日）¥1,000（土日祝）¥1,200、夜間最大 ¥600',
      distance: '会場まで徒歩2分',
      address: '駐車台数 21台',
      recommended: true,
      recommendComment: '会場に最も近く、料金も手頃',
    },
    {
      name: 'TOBU PARK 宇都宮第7駐車場',
      description: '東武宇都宮駅近くの駐車場。駅からのアクセス良好。',
      price: '¥100/30分（7:00-19:00）、¥200/60分（19:00-7:00）。駐車後12時間最大（平日）¥1,000（土日祝）¥1,200、夜間最大 ¥800',
      distance: '会場まで徒歩3分',
      address: '駐車台数 19台',
    },
    {
      name: 'タイムズ 東武宇都宮駅前',
      description: '24時間営業の駐車場。夜間料金がお得。',
      price: '¥200/40分。駐車後24時間最大 ¥800（17:00-9:00最大 ¥500）',
      distance: '会場まで徒歩2分',
      address: '駐車台数 14台',
    },
    {
      name: 'タイムズ宇都宮駅前',
      description: 'タイムズ宇都宮駅前の駐車場情報',
      price: '料金要確認',
      distance: '距離要確認',
      website: 'https://www.city.utsunomiya.lg.jp/kurashi/kotsu/chushajo/1006138.html',
      mapsUrl: 'https://www.google.com/maps/search/宇都宮市営中央駐車場',
    },
  ],
  coinLockers: [
    {
      location: 'JR宇都宮駅構内（改札内）',
      description: 'JR宇都宮駅構内（改札内）のコインロッカー',
      price: '料金要確認',
      distance: '距離要確認',
      website: 'https://www.jreast.co.jp/estation/stations/248.html',
    },
    {
      location: 'JR宇都宮駅構内（改札外）',
      description: 'JR宇都宮駅構内（改札外）のコインロッカー',
      price: '料金要確認',
      distance: '距離要確認',
      website: 'https://www.jreast.co.jp/estation/stations/248.html',
      mapsUrl: 'https://www.google.com/maps/search/JR宇都宮駅+コインロッカー',
    },
    {
      location: '宇都宮パセオ館内',
      description: '宇都宮パセオ館内のコインロッカー',
      price: '料金要確認',
      distance: '距離要確認',
      website: 'https://www.utsunomiya-sk.com/paseo/floor/',
    },
    {
      location: 'トナリエ宇都宮',
      description: 'トナリエ宇都宮のコインロッカー',
      price: '料金要確認',
      distance: '距離要確認',
      website: 'https://tonarie.jp/utsunomiya/',
      mapsUrl: 'https://www.google.com/maps/search/ララスクエア宇都宮',
    },
    {
      location: '東武宇都宮駅構内',
      description: '東武宇都宮駅構内のコインロッカー',
      price: '料金要確認',
      distance: '距離要確認',
      website: 'https://www.tobu.co.jp/railway/guide/station/insidemap/4112/',
      mapsUrl: 'https://www.google.com/maps/search/東武宇都宮駅',
    },
  ],
  cafes: [
    {
      name: 'スターバックス パセオ宇都宮店',
      description: 'スターバックス パセオ宇都宮店でライブ前後の休憩に最適',
      distance: '距離要確認',
      website: 'https://store.starbucks.co.jp/detail-522/',
      mapsUrl: 'https://www.google.com/maps/search/スターバックス+宇都宮パセオ',
    },
    {
      name: 'コメダ珈琲店 宇都宮駅東店',
      description: 'コメダ珈琲店 宇都宮駅東店でライブ前後の休憩に最適',
      distance: '距離要確認',
      website: 'https://www.komeda.co.jp/shop/detail.html?id=1053',
      mapsUrl: 'https://www.google.com/maps/search/コメダ珈琲店+宇都宮駅東',
    },
    {
      name: 'タリーズコーヒー 宇都宮店',
      description: 'タリーズコーヒー 宇都宮店でライブ前後の休憩に最適',
      distance: '距離要確認',
      website: 'https://shop.tullys.co.jp/detail/1920773',
      mapsUrl: 'https://www.google.com/maps/search/タリーズコーヒー+宇都宮',
    },
  ],
  nearbyAttractions: [
    {
      name: '宇都宮餃子通り',
      description: '全国的に有名な宇都宮餃子の名店が集まる通り。地元グルメの聖地',
      distance: '徒歩5分'
    },
    {
      name: '宇都宮城址公園',
      description: '宇都宮城の本丸跡地に整備された歴史公園。桜の名所としても有名',
      distance: '徒歩15分',
      website: 'https://www.city.utsunomiya.tochigi.jp/shisetsu/kouen/1007909.html'
    },
    {
      name: '宇都宮美術館',
      description: '現代アートから古典まで幅広いコレクション。静かな時間を過ごせる',
      distance: 'バス20分'
    },
    {
      name: '大谷資料館',
      description: '大谷石の採掘跡地を利用した神秘的な地下空間',
      distance: 'バス30分',
      website: 'https://www.oya909.co.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: '餃子の正嗣 宮島本店',
      cuisine: '餃子',
      description: '宇都宮餃子の老舗。焼餃子と水餃子のみというシンプルなメニューが人気',
      distance: '徒歩8分',
      openTime: '11:30-19:30',
      price: '餃子1皿240円～',
      website: 'https://tabelog.com/tochigi/A0901/A090101/9000046/',
      mapsUrl: 'https://www.google.com/maps/search/餃子の正嗣+宮島本店+宇都宮',
      recommended: true,
      recommendComment: '宇都宮に来たら絶対食べたい！シンプルで美味しい老舗餃子'
    },
    {
      name: 'みんみん 本店',
      cuisine: '餃子',
      description: '宇都宮餃子の代表格。もっちりとした皮が特徴',
      distance: '徒歩10分',
      openTime: '11:30-20:00',
      price: '餃子1皿250円～',
      website: 'https://tabelog.com/tochigi/A0901/A090101/9000045/',
      mapsUrl: 'https://www.google.com/maps/search/みんみん+本店+宇都宮',
      recommended: true,
      recommendComment: '行列必至の人気店！もちもち皮がやみつきになる'
    },
    {
      name: '来らっせ 本店',
      cuisine: '餃子',
      description: '宇都宮餃子の常設館。市内の有名店が集結した餃子のテーマパーク',
      distance: '徒歩12分',
      openTime: '11:00-20:00',
      price: '餃子3種セット900円～',
      website: 'https://www.gyozakai.com/kirasse/',
      mapsUrl: 'https://www.google.com/maps/search/来らっせ+宇都宮',
      recommended: true,
      recommendComment: '一度に複数店の餃子を食べ比べできる！宇都宮餃子の入門に最適'
    },
    {
      name: '宮カフェ',
      cuisine: 'とちぎ和牛',
      description: '栃木県産和牛を使った贅沢なハンバーグとステーキが人気の地元カフェ',
      distance: '徒歩8分',
      openTime: '11:30-22:00',
      price: '1,500円～3,000円',
      mapsUrl: 'https://www.google.com/maps/search/宮カフェ+宇都宮',
      recommended: true,
      recommendComment: '栃木和牛の旨みを堪能！地元食材にこだわった逸品'
    },
    {
      name: '魚べい 宇都宮駅東口店',
      cuisine: '回転寿司',
      description: '栃木の地魚も楽しめる回転寿司。新鮮なネタが自慢',
      distance: '徒歩7分',
      openTime: '17:00-24:00',
      price: '2,000円～4,000円',
      website: 'https://www.uobei.info/',
      mapsUrl: 'https://www.google.com/maps/search/魚べい+宇都宮駅東口'
    }
  ],
  accommodations: [
    {
      name: '東横INN 宇都宮駅前',
      type: 'ビジネスホテル',
      description: '駅徒歩3分の好立地。無料朝食付きでコスパ良好',
      distance: '徒歩3分',
      priceRange: '5,000円～7,000円',
      features: ['無料朝食', '無料Wi-Fi', 'コインランドリー'],
      website: 'https://www.toyoko-inn.com/search/detail/00050/',
      mapsUrl: 'https://www.google.com/maps/search/東横INN+宇都宮駅前',
      recommended: true,
      recommendComment: '駅近で清潔、朝食無料が嬉しい！推し活の定番ホテル'
    },
    {
      name: 'アパホテル 宇都宮駅前',
      type: 'ビジネスホテル',
      description: '大浴場完備で疲れを癒せる。会場まで徒歩圏内',
      distance: '徒歩5分',
      priceRange: '5,500円～8,000円',
      features: ['大浴場', '無料Wi-Fi', 'コンビニ併設'],
      website: 'https://www.apahotel.com/hotel/shutoken/utsunomiya-ekimae/',
      mapsUrl: 'https://www.google.com/maps/search/アパホテル+宇都宮駅前'
    },
    {
      name: '快活CLUB 宇都宮店',
      type: 'ネットカフェ',
      description: 'シャワー・漫画読み放題。深夜料金でお得に宿泊',
      distance: '車で10分',
      priceRange: '2,500円～3,500円（ナイトパック）',
      features: ['完全個室', 'シャワー無料', 'ドリンクバー', '漫画読み放題'],
      website: 'https://www.kaikatsu.jp/shop/detail/20185',
      mapsUrl: 'https://www.google.com/maps/search/快活CLUB+宇都宮',
      recommended: true,
      recommendComment: '予算抑えたい時の最適解！個室でゆっくり休める'
    },
    {
      name: 'カプセルイン宇都宮',
      type: 'カプセルホテル',
      description: '駅近で格安。大浴場とサウナで疲労回復',
      distance: '徒歩8分',
      priceRange: '3,000円～4,000円',
      features: ['大浴場', 'サウナ', 'ロッカー完備'],
      mapsUrl: 'https://www.google.com/maps/search/カプセルホテル+宇都宮駅'
    }
  ]
}

export default tochigi_heavens_rock
