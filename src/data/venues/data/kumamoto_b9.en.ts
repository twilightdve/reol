import { Venue } from '../types'

export const kumamoto_b9_en: Venue = {
  id: 'kumamoto_b9',
  name: 'Kumamoto B.9 V1',
  date: '2026-04-19T17:00:00+09:00',
  times: { open: '4:30 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Kumamoto', 
    city: 'Kumamoto',
    address: '5-13 Joto-cho, Chuo-ku, Kumamoto City, Kumamoto',
    nearestStation: '3 min walk from Toricho-suji Streetcar Stop'
  },
  capacity: 500,
  access: '3 min walk from Kumamoto Streetcar Toricho-suji Stop. Good access within Shimotori Arcade.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13413.921450383226!2d130.710823!3d32.806035!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3540f40f2b20db95%3A0x912e1c5e2053a1be!2z54aK5pysIEIuOQ!5e0!3m2!1sja!2sus!4v1764561645529!5m2!1sja!2sus',
  venueWebsite: 'http://www.live-drum.com/be9/index1.shtml',
  parkingInfo: 'No dedicated parking. Please use nearby paid parking lots. Streetcar transportation recommended.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Kumamoto Airport',
        method: 'Airport Bus',
        time: 'Approx. 50 minutes',
        description: 'Airport bus from Kumamoto Airport to JR Kumamoto Station → Streetcar to Toricho-suji Stop',
        cost: 'One-way ¥800',
        notes: 'Airport bus runs every 15-20 minutes'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Sakura/Mizuho Shinkansen',
        time: 'Approx. 5 hours 30 minutes',
        description: 'Kyushu Shinkansen from Tokyo Station to JR Kumamoto Station → Streetcar to Toricho-suji Stop',
        cost: 'One-way approx. ¥22,000',
        notes: 'Use streetcar from Kumamoto Station'
      },
      {
        from: 'Osaka',
        method: 'Sakura/Mizuho Shinkansen',
        time: 'Approx. 3 hours',
        description: 'Kyushu Shinkansen from Shin-Osaka Station to JR Kumamoto Station → Streetcar to Toricho-suji Stop',
        cost: 'One-way approx. ¥16,000',
        notes: 'Direct access via Shinkansen'
      },
      {
        from: 'Fukuoka (Hakata)',
        method: 'Sakura/Mizuho Shinkansen',
        time: 'Approx. 35 minutes',
        description: 'Kyushu Shinkansen from Hakata Station to JR Kumamoto Station',
        cost: 'One-way approx. ¥5,000',
        notes: 'Fastest route in 30s minutes'
      }
    ],
    fromExpressBus: [
      {
        from: 'Fukuoka',
        method: 'Express Bus',
        time: 'Approx. 2 hours',
        description: 'Express bus from Fukuoka (Tenjin/Hakata) to Kumamoto',
        cost: 'One-way approx. ¥2,000',
        notes: 'Cheaper than Shinkansen'
      }
    ],
    fromCar: [
      {
        from: 'Fukuoka Area',
        method: 'Kyushu Expressway',
        time: 'Approx. 1 hour 30 minutes',
        description: 'South on Kyushu Expressway, exit at Kumamoto IC toward Kumamoto city. Multiple paid parking lots near venue.',
        cost: 'Highway toll approx. ¥2,500 (Fukuoka~Kumamoto IC)',
        notes: 'Parking in Kumamoto downtown should be checked in advance'
      },
      {
        from: 'Kagoshima Area',
        method: 'Kyushu Expressway',
        time: 'Approx. 2 hours',
        description: 'North on Kyushu Expressway, exit at Kumamoto IC toward Kumamoto city.',
        cost: 'Highway toll approx. ¥3,000 (Kagoshima~Kumamoto IC)',
        notes: 'Convenient access from southern Kyushu'
      }
    ],
    recommendations: 'Direct access to Kumamoto Station via Kyushu Shinkansen. Streetcar convenient within city.'
  },
  parkingOptions: [
    {
      name: 'Times Kumamoto Shimotori',
      description: 'Parking lot near Shimotori Arcade',
      price: 'Check for rates',
      distance: '3 min walk',
      website: 'https://times-info.net/P43-kumamoto/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Kumamoto+Shimotori',
    },
    {
      name: 'Shimotori Parking',
      description: 'Parking lot near venue',
      price: 'Check for rates',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Shimotori+parking+Kumamoto',
    },
  ],
  coinLockers: [
    {
      location: 'JR Kumamoto Station',
      description: 'Coin lockers inside JR Kumamoto Station',
      price: '¥300-¥600',
      distance: '15 min by streetcar',
      website: 'https://www.jrkyushu.co.jp/railway/station/1191220_1601.html',
      mapsUrl: 'https://www.google.com/maps/search/JR+Kumamoto+Station',
    },
    {
      location: 'Shimotori Arcade',
      description: 'Coin lockers in Shimotori Arcade',
      price: 'Check for rates',
      distance: '2 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Shimotori+Arcade+coin+lockers',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Kumamoto Shimotori',
      description: 'Starbucks inside Shimotori Arcade',
      distance: '3 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Kumamoto+Shimotori',
    },
    {
      name: 'Doutor Coffee Kumamoto',
      description: 'Doutor Coffee for pre/post-live rest',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Doutor+Coffee+Kumamoto',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Kumamoto Castle',
      description: 'One of Japan\'s three premier castles. Under reconstruction but viewable',
      distance: '15 min walk',
      website: 'https://castle.kumamoto-guide.jp/'
    },
    {
      name: 'Suizenji Jojuen Garden',
      description: 'Momoyama-style strolling garden. Beautiful Japanese garden',
      distance: '20 min by streetcar',
      website: 'https://www.suizenji.or.jp/'
    },
    {
      name: 'Kamitori/Shimotori Arcade',
      description: 'Kumamoto\'s largest shopping district. Full of shopping and dining',
      distance: 'Immediate area',
      website: 'https://kumamoto-guide.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Keika Ramen',
      cuisine: 'Kumamoto Ramen',
      description: 'Famous Kumamoto ramen shop. Rich pork bone soup with burnt garlic',
      distance: '5 min walk',
      openTime: '11:00-22:00',
      price: '¥800-¥1,200',
      website: 'https://www.keika-raumen.com/',
      mapsUrl: 'https://www.google.com/maps/search/Keika+Ramen+Kumamoto',
      recommended: true,
      recommendComment: 'Kumamoto ramen icon! Burnt garlic aroma whets the appetite'
    },
    {
      name: 'Tengaiten',
      cuisine: 'Kumamoto Ramen',
      description: 'Long-established Kumamoto ramen. Light-style options available',
      distance: '7 min walk',
      openTime: '11:30-21:00',
      price: '¥700-¥1,000',
      mapsUrl: 'https://www.google.com/maps/search/Tengaiten+Kumamoto',
    },
    {
      name: 'Suganoya',
      cuisine: 'Horse Meat',
      description: 'Kumamoto specialty horse sashimi and horse meat restaurant',
      distance: '10 min walk',
      openTime: '17:00-23:00',
      price: '¥3,000-¥5,000',
      website: 'https://www.suganoya.com/',
      mapsUrl: 'https://www.google.com/maps/search/Suganoya+Kumamoto',
      recommended: true,
      recommendComment: 'Kumamoto means horse sashimi! Savor fresh, tender horse meat'
    },
    {
      name: 'Kokutei',
      cuisine: 'Kumamoto Ramen',
      description: 'Famous Kumamoto ramen shop. Features black sesame oil and garlic chips',
      distance: '6 min walk',
      openTime: '11:00-21:00',
      price: '¥750-¥1,000',
      mapsUrl: 'https://www.google.com/maps/search/Kokutei+Kumamoto',
      recommended: true,
      recommendComment: 'Kumamoto ramen\'s finest! Punchy black sesame oil is addictive'
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Kumamoto Ekimae',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Kumamoto Station. Clean rooms and free breakfast',
      distance: '3 min walk from Kumamoto Station',
      priceRange: '¥5,000-¥7,000 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.toyoko-inn.com/search/detail/00099/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Kumamoto+Ekimae',
      recommended: true,
      recommendComment: 'Near station, clean, free breakfast! Standard for Kumamoto trips'
    },
    {
      name: 'Kaikatsu CLUB Kumamoto Shimotori',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '3 min walk from Toricho-suji Stop',
      priceRange: '¥2,200-¥3,200 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours'],
      website: 'https://www.kaikatsu.jp/shop/kumamoto-shimotori/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Kumamoto+Shimotori',
      recommended: true,
      recommendComment: 'Close to downtown area! Budget-friendly too'
    },
    {
      name: 'Capsule Hotel Kumamoto',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna',
      distance: '6 min walk from Kumamoto Station',
      priceRange: '¥3,000-¥4,000 per night',
      features: ['Large public bath', 'Sauna', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Kumamoto+Station'
    },
    {
      name: 'Hotel Route Inn Kumamoto Ekimae',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Breakfast buffet well-received',
      distance: '5 min walk from Kumamoto Station',
      priceRange: '¥5,500-¥8,000 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=144',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Kumamoto+Ekimae'
    }
  ]
}

export default kumamoto_b9_en
