import { Venue } from '../types'

export const yokohama_bayhall_en: Venue = {
  id: 'yokohama_bayhall',
  name: 'Yokohama BAYHALL',
  date: '2026-05-16T17:00:00+09:00',
  times: { open: '4:00 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Kanagawa', 
    city: 'Yokohama',
    address: '3-4-17 Shin-Yamashita, Naka-ku, Yokohama City, Kanagawa',
    nearestStation: '15 min walk from Motomachi-Chukagai Station'
  },
  capacity: 1500,
  access: '【Train】Minatomirai Line (direct to Tokyu Toyoko Line) - 15 min walk from Motomachi-Chukagai Station Motomachi Exit 5. 25 min walk from Keihin-Tohoku Line Ishikawacho Station. 【Bus】5 min walk from Yokohama Municipal Bus "Chobokumae" stop. *Please allow extra time as traffic may cause delays.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13002.122287602611!2d139.661112!3d35.441657!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60185d3d57ece991%3A0xcde3f954aef28bb0!2z5qiq5rWc44OZ44Kk44Ob44O844Or!5e0!3m2!1sja!2sus!4v1764574041596!5m2!1sja!2sus',
  venueWebsite: 'https://bayhall.jp/access/',
  parkingInfo: 'No dedicated parking. Please use nearby paid parking lots.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Haneda Airport',
        method: 'Keikyu Line',
        time: 'Approx. 30 minutes',
        description: 'Keikyu Line from Haneda Airport to Yokohama Station',
        cost: 'One-way ¥470',
        notes: 'Runs every 15 minutes'
      },
      {
        from: 'Narita Airport',
        method: 'Narita Express',
        time: 'Approx. 90 minutes',
        description: 'Narita Express from Narita Airport to Yokohama Station',
        cost: 'One-way ¥4,700',
        notes: 'Approximately once per hour'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'JR Tokaido Line',
        time: 'Approx. 30 minutes',
        description: 'JR Tokaido/Yokosuka Line from Tokyo Station to Yokohama Station',
        cost: 'One-way ¥470',
        notes: 'Frequent service'
      },
      {
        from: 'Osaka',
        method: 'Nozomi Shinkansen',
        time: 'Approx. 2 hours 20 minutes',
        description: 'Nozomi Shinkansen from Shin-Osaka to Shin-Yokohama Station → JR Yokohama Line to Yokohama Station (10 min)',
        cost: 'One-way approx. ¥14,000',
        notes: 'Use Yokohama Line from Shin-Yokohama Station'
      },
      {
        from: 'Nagoya',
        method: 'Nozomi Shinkansen',
        time: 'Approx. 1 hour 40 minutes',
        description: 'Nozomi Shinkansen from Nagoya to Shin-Yokohama Station → JR Yokohama Line to Yokohama Station',
        cost: 'One-way approx. ¥11,000',
        notes: 'Use Yokohama Line from Shin-Yokohama Station'
      }
    ],
    fromCar: [
      {
        from: 'Tokyo Area',
        method: 'Shuto Expressway Bayshore Route',
        time: 'Approx. 30 minutes',
        description: 'Via Shuto Expressway Bayshore Route toward Minato Mirai. Multiple paid parking lots near venue.',
        cost: 'Highway toll approx. ¥1,300',
        notes: 'Minato Mirai parking lots crowded on weekends - advance reservation recommended'
      },
      {
        from: 'Shizuoka Area',
        method: 'Tomei Expressway/Dai-san Keihin',
        time: 'Approx. 2 hours',
        description: 'Via Tomei Expressway → Dai-san Keihin to Yokohama city.',
        cost: 'Highway toll approx. ¥4,000 (Shizuoka~Yokohama)',
        notes: 'Tomei Expressway may be congested on weekends'
      }
    ],
    recommendations: 'Great access - 30 min from Haneda Airport via Keikyu Line. 30 min from Tokyo, Shinkansen via Shin-Yokohama Station.'
  },
  parkingOptions: [
    {
      name: 'Yokohama Bay Quarter Parking',
      description: 'Parking directly connected to venue',
      price: '¥280/30 min',
      distance: 'Immediate area',
      website: 'https://www.yokohama-bayquarter.com/access/',
      mapsUrl: 'https://www.google.com/maps/search/Yokohama+Bay+Quarter+parking',
    },
    {
      name: 'Times Yokohama Station East Exit',
      description: 'Parking at Yokohama Station East Exit',
      price: 'Check for rates',
      distance: '7 min walk',
      website: 'https://times-info.net/P14-kanagawa/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Yokohama+Station+East+Exit',
    },
  ],
  coinLockers: [
    {
      location: 'JR Yokohama Station',
      description: 'Coin lockers inside JR Yokohama Station',
      price: '¥300-¥600',
      distance: '5 min walk',
      website: 'https://www.jreast.co.jp/estation/stations/1638.html',
      mapsUrl: 'https://www.google.com/maps/search/JR+Yokohama+Station',
    },
    {
      location: 'Yokohama Bay Quarter',
      description: 'Coin lockers inside Bay Quarter',
      price: 'Check for rates',
      distance: 'Immediate area',
      mapsUrl: 'https://www.google.com/maps/search/Yokohama+Bay+Quarter',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Yokohama Bay Quarter',
      description: 'Starbucks inside Bay Quarter',
      distance: 'Immediate area',
      website: 'https://store.starbucks.co.jp/detail-477/',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Yokohama+Bay+Quarter',
    },
    {
      name: 'Tully\'s Coffee Yokohama Station',
      description: 'Tully\'s near Yokohama Station',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Tullys+Coffee+Yokohama+Station',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Yokohama Chinatown',
      description: 'Japan\'s largest Chinatown. Full of restaurants and shops',
      distance: '10 min by train',
      website: 'https://www.chinatown.or.jp/'
    },
    {
      name: 'Minato Mirai 21',
      description: 'Yokohama waterfront. Landmark Tower and Red Brick Warehouse',
      distance: '15 min walk',
      website: 'https://www.minatomirai21.com/'
    },
    {
      name: 'Yokohama Bay Quarter',
      description: 'Shopping mall where venue is located. Beautiful seaside views',
      distance: 'Immediate area',
      website: 'https://www.yokohama-bayquarter.com/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Kiyoken Honten',
      cuisine: 'Shumai',
      description: 'Main shop of famous Yokohama shumai. Full Chinese menu too',
      distance: '10 min walk',
      openTime: '11:00-22:00',
      price: '¥2,000-¥4,000',
      website: 'https://kiyoken.com/shop/honten/',
      mapsUrl: 'https://www.google.com/maps/search/Kiyoken+Honten+Yokohama',
      recommended: true,
      recommendComment: 'Yokohama means shumai! Fresh-made taste is exceptional'
    },
    {
      name: 'Iekei Ramen Yoshimuraya',
      cuisine: 'Ramen',
      description: 'Birthplace of Iekei ramen. Rich pork bone soy sauce',
      distance: '15 min by train',
      openTime: '10:00-1:00 AM',
      price: '¥800-¥1,000',
      mapsUrl: 'https://www.google.com/maps/search/Yoshimuraya+Yokohama',
      recommended: true,
      recommendComment: 'Origin of Iekei ramen! Rich soup and spinach are signature'
    },
    {
      name: 'Yokohama Bay Quarter Restaurant Floor',
      cuisine: 'Various',
      description: 'Diverse dining options inside Bay Quarter',
      distance: 'Immediate area',
      openTime: '11:00-23:00 (varies by shop)',
      price: '¥1,500-¥3,000',
      website: 'https://www.yokohama-bayquarter.com/shop/',
      mapsUrl: 'https://www.google.com/maps/search/Yokohama+Bay+Quarter+restaurants',
    },
    {
      name: 'Jukeihanten Chinatown',
      cuisine: 'Chinese',
      description: 'Long-established Yokohama Chinatown restaurant. Authentic Cantonese cuisine',
      distance: '20 min by train',
      openTime: '11:00-21:30',
      price: '¥2,000-¥4,000',
      website: 'https://jukeihanten.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Jukeihanten+Yokohama+Chinatown',
      recommended: true,
      recommendComment: 'Famous Yokohama Chinatown origin! Shumai and shark fin stir-fry are exquisite'
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Yokohama Station East Exit',
      type: 'ビジネスホテル',
      description: 'Great location 5 min walk from Yokohama Station. Clean rooms and free breakfast',
      distance: '5 min walk from Yokohama Station',
      priceRange: '¥6,000-¥8,000 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.toyoko-inn.com/search/detail/00003/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Yokohama+Station+East+Exit',
      recommended: true,
      recommendComment: 'Close to Yokohama Station! Standard for Yokohama trips'
    },
    {
      name: 'Kaikatsu CLUB Yokohama Station West Exit',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '7 min walk from Yokohama Station',
      priceRange: '¥2,800-¥3,800 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours'],
      website: 'https://www.kaikatsu.jp/shop/yokohama-nishiguchi/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Yokohama+Station+West+Exit',
      recommended: true,
      recommendComment: 'Best option for budget! Close to station'
    },
    {
      name: 'Capsule Hotel Yokohama',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna. Women-only floor available',
      distance: '8 min walk from Yokohama Station',
      priceRange: '¥3,500-¥5,000 per night',
      features: ['Large public bath', 'Sauna', 'Women-only floor', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Yokohama+Station'
    },
    {
      name: 'Hotel Route Inn Yokohama Station West Exit',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Breakfast buffet well-received',
      distance: '7 min walk from Yokohama Station',
      priceRange: '¥6,500-¥9,000 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=370',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Yokohama+Station+West+Exit'
    }
  ]
}

export default yokohama_bayhall_en
