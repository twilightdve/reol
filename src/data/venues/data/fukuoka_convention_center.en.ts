import { Venue } from '../types'

export const fukuoka_convention_center_en: Venue = {
  id: 'fukuoka_convention_center',
  name: 'Fukuoka Convention Center Main Hall',
  date: '2026-06-27T17:00:00+09:00',
  times: { open: '4:00 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Fukuoka', 
    city: 'Fukuoka',
    address: '2-1 Sekijomachi, Hakata-ku, Fukuoka',
    nearestStation: '10 min walk from Gofukumachi Station (Subway Hakozaki Line)'
  },
  capacity: 1000,
  access: '【Train/Walk】10 min walk from Gofukumachi Station (Subway Hakozaki Line). 【Bus】From JR Hakata Station or Tenjin Bus Center, take Nishitetsu Bus to "Kokusai Kaigijo / Sunpalace-mae".',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.3!2d130.4119!3d33.6033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x354191e6a6c2c2c7%3A0x1234567890abcdef!2z56aP5bKh5Zu96Zqb5Lya6K2w5aC0!5e0!3m2!1sja!2sjp',
  venueWebsite: 'https://www.marinemesse.or.jp/congress/',
  parkingInfo: 'Paid parking (Lot 1) available. Please check official website for details. Public transportation recommended.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Fukuoka Airport',
        method: 'Subway',
        time: 'Approx. 10 minutes',
        description: 'Subway from Fukuoka Airport to Hakata Station → Bus to Fukuoka Convention Center',
        cost: 'One-way ¥260 + Bus ¥200',
        notes: 'Approx. 15 min by Nishitetsu Bus from Hakata Station'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Shinkansen Nozomi + Bus',
        time: 'Approx. 5 hours 30 minutes',
        description: 'Shinkansen Nozomi from Tokyo to Hakata Station → Bus to Fukuoka Convention Center',
        cost: 'One-way approx. ¥23,000',
        notes: 'Approx. 15 min by bus from Hakata Station. Consider flying'
      },
      {
        from: 'Osaka',
        method: 'Shinkansen Nozomi + Bus',
        time: 'Approx. 2 hours 45 minutes',
        description: 'Shinkansen Nozomi from Shin-Osaka to Hakata Station → Bus to Fukuoka Convention Center',
        cost: 'One-way approx. ¥15,500',
        notes: 'Approx. 15 min by bus from Hakata Station'
      },
      {
        from: 'Nagoya',
        method: 'Shinkansen Nozomi + Bus',
        time: 'Approx. 3 hours 30 minutes',
        description: 'Shinkansen Nozomi from Nagoya to Hakata Station → Bus to Fukuoka Convention Center',
        cost: 'One-way approx. ¥18,000',
        notes: 'Approx. 15 min by bus from Hakata Station'
      },
      {
        from: 'Hiroshima',
        method: 'Shinkansen Nozomi + Bus',
        time: 'Approx. 1 hour 15 minutes',
        description: 'Shinkansen Nozomi from Hiroshima to Hakata Station → Bus to Fukuoka Convention Center',
        cost: 'One-way approx. ¥9,000',
        notes: 'Approx. 15 min by bus from Hakata Station'
      }
    ],
    fromExpressBus: [
      {
        from: 'Nagasaki',
        method: 'Express Bus',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Kyushu-go from Nagasaki to Hakata Bus Terminal → Bus to Fukuoka Convention Center',
        cost: 'One-way approx. ¥2,600',
        notes: '1-2 buses per hour'
      },
      {
        from: 'Kumamoto',
        method: 'Express Bus',
        time: 'Approx. 2 hours',
        description: 'Kyushu Odan Bus from Kumamoto to Hakata Bus Terminal → Bus to Fukuoka Convention Center',
        cost: 'One-way approx. ¥2,100',
        notes: '2-3 buses per hour'
      }
    ],
    fromCar: [
      {
        from: 'Kitakyushu Area',
        method: 'Kyushu Expressway',
        time: 'Approx. 1 hour',
        description: 'South on Kyushu Expressway, exit at Fukuoka IC or Dazaifu IC toward Fukuoka city. Multiple paid parking lots near venue.',
        cost: 'Highway toll approx. ¥1,500 (Kitakyushu~Fukuoka IC)',
        notes: 'Fukuoka Convention Center Lot 1 parking is convenient'
      },
      {
        from: 'Kumamoto Area',
        method: 'Kyushu Expressway',
        time: 'Approx. 1 hour 30 minutes',
        description: 'North on Kyushu Expressway, exit at Fukuoka IC or Dazaifu IC toward Fukuoka city.',
        cost: 'Highway toll approx. ¥2,500 (Kumamoto~Fukuoka IC)',
        notes: 'Convenient access from within Kyushu region'
      }
    ],
    recommendations: '10 minutes by subway from Fukuoka Airport to Hakata Station. Approx. 15 min by bus from Hakata Station. Express buses from various parts of Kyushu.'
  },
  parkingOptions: [
    {
      name: 'Fukuoka Convention Center Lot 1',
      description: 'Parking lot attached to venue',
      price: '¥1,000 per day',
      distance: '0 min walk (directly connected to venue)',
      website: 'https://www.marinemesse.or.jp/congress/',
      mapsUrl: 'https://www.google.com/maps/search/Fukuoka+Convention+Center+Parking',
    },
    {
      name: 'Times Hakata Wharf',
      description: 'Parking lot near venue',
      price: '¥200 per 30 minutes',
      distance: '5 min walk',
      website: 'https://times-info.net/P40-fukuoka/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Hakata+Wharf',
    },
  ],
  coinLockers: [
    {
      location: 'Inside Fukuoka Convention Center',
      description: 'Coin lockers inside Fukuoka Convention Center',
      price: '¥300-¥600',
      distance: 'Inside venue',
      website: 'https://www.marinemesse.or.jp/congress/',
      mapsUrl: 'https://www.google.com/maps/search/Fukuoka+Convention+Center',
    },
    {
      location: 'Inside Hakata Station',
      description: 'Coin lockers inside JR Hakata Station',
      price: '¥300-¥600',
      distance: '10 min by bus',
      website: 'https://www.jrkyushu.co.jp/railway/station/1191306_1601.html',
      mapsUrl: 'https://www.google.com/maps/search/JR+Hakata+Station',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Hakata Ekimae',
      description: 'Starbucks in front of Hakata Station',
      distance: '10 min by bus',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Hakata+Ekimae',
    },
    {
      name: 'Doutor Coffee Hakata',
      description: 'Doutor Coffee for pre/post-show relaxation',
      distance: '10 min by bus',
      mapsUrl: 'https://www.google.com/maps/search/Doutor+Coffee+Hakata',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Canal City Hakata',
      description: 'Large shopping mall. Famous for fountain shows',
      distance: '15 min by bus',
      website: 'https://canalcity.co.jp/'
    },
    {
      name: 'Fukuoka Tower',
      description: '234m seaside tower. Beautiful night view',
      distance: '15 min by car',
      website: 'https://www.fukuokatower.co.jp/'
    },
    {
      name: 'Tenjin Underground Shopping Center',
      description: 'Central Fukuoka. Shopping and gourmet',
      distance: '20 min by bus',
      website: 'https://www.tenchika.com/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Ganso Hakata Daruma',
      cuisine: 'Ramen',
      description: 'Long-established Hakata ramen shop for over 60 years. Rich tonkotsu soup is exquisite',
      distance: '15 min by bus',
      openTime: '11:00-2:00 AM',
      price: '¥700-¥1,000',
      website: 'https://www.hakata-daruma.com/',
      mapsUrl: 'https://www.google.com/maps/search/Hakata+Daruma+Fukuoka',
      recommended: true,
      recommendComment: 'Loved by locals! Authentic tonkotsu is rich and exquisite'
    },
    {
      name: 'Motsunabe Rakutenti',
      cuisine: 'Motsunabe',
      description: 'Long-established shop for Hakata specialty motsunabe. Soy sauce flavor is exquisite',
      distance: '15 min by bus',
      openTime: '5:00 PM-11:00 PM',
      price: '¥3,000-¥4,000',
      website: 'https://www.rakutenti.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Motsunabe+Rakutenti+Fukuoka',
      recommended: true,
      recommendComment: 'Hakata means motsunabe! Plump offal is exquisite'
    },
    {
      name: 'Chikae',
      cuisine: 'Seafood',
      description: 'Hakata seafood restaurant. Fresh seafood available',
      distance: '20 min by bus',
      openTime: '11:30-14:00, 5:00 PM-10:00 PM',
      price: '¥3,000-¥5,000',
      mapsUrl: 'https://www.google.com/maps/search/Chikae+Fukuoka',
    },
    {
      name: 'Hakata Hanamidori Hakata Ekimae',
      cuisine: 'Mizutaki',
      description: 'Famous shop for Hakata specialty mizutaki. Uses chicken from own farm',
      distance: '20 min by bus',
      openTime: '5:00 PM-11:00 PM',
      price: '¥3,500-¥5,000',
      website: 'https://www.hanamidori.net/',
      mapsUrl: 'https://www.google.com/maps/search/Hakata+Hanamidori+Fukuoka',
      recommended: true,
      recommendComment: 'Hakata mizutaki famous shop! Rich white soup and Hanamidori chicken are exquisite'
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Hakata Ekimae',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Hakata Station. Clean rooms and free breakfast',
      distance: '3 min walk from Hakata Station',
      priceRange: '¥5,500-¥7,500 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.toyoko-inn.com/search/detail/00056/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Hakata+Ekimae',
      recommended: true,
      recommendComment: 'Near Hakata Station and convenient! Standard for Fukuoka trips'
    },
    {
      name: 'Kaikatsu CLUB Hakata Tenjin',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '5 min walk from Tenjin Station',
      priceRange: '¥2,500-¥3,500 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours'],
      website: 'https://www.kaikatsu.jp/shop/hakata-tenjin/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Hakata+Tenjin',
      recommended: true,
      recommendComment: 'Best for budget! Close to entertainment district too'
    },
    {
      name: 'Nine Hours Hakata',
      type: 'カプセルホテル',
      description: 'Design-focused capsule hotel. Comfortable sleeping space with shower booths',
      distance: '5 min walk from Hakata Station',
      priceRange: '¥4,500-¥6,000 per night',
      features: ['Shower booths', 'Free Wi-Fi', 'Lockers', 'Sophisticated design', 'Women-only floor'],
      website: 'https://ninehours.co.jp/hakata/',
      mapsUrl: 'https://www.google.com/maps/search/Nine+Hours+Hakata',
      recommended: true,
      recommendComment: 'Comfortable capsule hotel balancing design and functionality! Near Hakata Station'
    },
    {
      name: 'Capsule Hotel Hakata',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna',
      distance: '6 min walk from Hakata Station',
      priceRange: '¥3,500-¥5,000 per night',
      features: ['Large public bath', 'Sauna', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Hakata+Station'
    },
    {
      name: 'Hotel Route Inn Hakata Ekimae',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Breakfast buffet well-received',
      distance: '5 min walk from Hakata Station',
      priceRange: '¥6,000-¥8,500 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=163',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Hakata+Ekimae'
    }
  ]
}

export default fukuoka_convention_center_en
