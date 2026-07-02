import { Venue } from '../types'

export const yamaguchi_rising_hall_en: Venue = {
  id: 'yamaguchi_rising_hall',
  name: 'Shunan RISING HALL',
  date: '2026-03-22T17:00:00+09:00',
  times: { open: '4:15 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Yamaguchi', 
    city: 'Shunan',
    address: '49-4F Ginnankai, Shunan City, Yamaguchi',
    nearestStation: '5 min walk from JR Tokuyama Station (Miyuki Exit)'
  },
  capacity: 544,
  access: 'Train: Approx. 5 min walk from JR Tokuyama Station Miyuki Exit. 4th floor on Ginnankai Street. Car: Approx. 15 min from Sanyo Expressway Tokuyama East IC, approx. 25 min from Tokuyama West IC.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13222.940123617624!2d131.7879645554199!3d34.05066740000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3544e6fde5f00001%3A0xd4d0c5e21e84a6d9!2sRISING%20HALL!5e0!3m2!1sja!2sus!4v1764560579834!5m2!1sja!2sus',
  venueWebsite: 'https://risinghallshunan.wixsite.com/rising-hall/access',
  parkingInfo: 'No dedicated parking. Use nearby parking (Shunan City Tokuyama Station Parking, etc.). Public transportation recommended.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Yamaguchi Ube Airport',
        method: 'Airport Bus + JR',
        time: 'Approx. 1 hour 30 minutes',
        description: 'Airport bus from Yamaguchi Ube Airport to JR Shin-Yamaguchi Station (35 min) → Sanyo Line to JR Tokuyama Station (25 min)',
        cost: 'One-way approx. ¥1,500',
        notes: 'About 1 bus per hour from airport'
      },
      {
        from: 'Hiroshima Airport',
        method: 'Airport Bus + JR',
        time: 'Approx. 2 hours',
        description: 'Bus from Hiroshima Airport to Hiroshima Station (50 min) → Sanyo Line to JR Tokuyama Station (60 min)',
        cost: 'One-way approx. ¥2,500',
        notes: 'Convenient access from Hiroshima Airport'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Nozomi Shinkansen',
        time: 'Approx. 4 hours 30 minutes',
        description: 'Nozomi Shinkansen from Tokyo Station to Shin-Yamaguchi Station → Sanyo Line to JR Tokuyama Station (25 min)',
        cost: 'One-way approx. ¥20,000',
        notes: 'Transfer at Shin-Yamaguchi Station'
      },
      {
        from: 'Osaka',
        method: 'Nozomi Shinkansen',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Nozomi Shinkansen from Shin-Osaka Station to Shin-Yamaguchi Station → Sanyo Line to JR Tokuyama Station (25 min)',
        cost: 'One-way approx. ¥12,000',
        notes: 'Transfer at Shin-Yamaguchi Station'
      },
      {
        from: 'Hiroshima',
        method: 'Sanyo Line',
        time: 'Approx. 1 hour',
        description: 'Direct on Sanyo Line from Hiroshima Station to JR Tokuyama Station',
        cost: 'One-way approx. ¥2,000',
        notes: 'Can shorten to 30 min using Shinkansen'
      }
    ],
    fromExpressBus: [
      {
        from: 'Hiroshima',
        method: 'Express Bus',
        time: 'Approx. 2 hours',
        description: 'Express bus from Hiroshima Bus Center to Tokuyama. Get off at JR Tokuyama Station',
        cost: 'One-way approx. ¥2,500',
        notes: 'Several buses per day. May be affected by traffic'
      },
      {
        from: 'Fukuoka',
        method: 'Express Bus',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Express bus from Hakata Bus Terminal to Tokuyama',
        cost: 'One-way approx. ¥3,000',
        notes: 'Convenient access from Kyushu area'
      }
    ],
    fromCar: [
      {
        from: 'Hiroshima Area',
        method: 'Sanyo Expressway',
        time: 'Approx. 1 hour 30 minutes',
        description: 'Take Sanyo Expressway west, exit at Tokuyama East IC toward JR Tokuyama Station. Paid parking available near station.',
        cost: 'Highway toll approx. ¥2,500 (Hiroshima~Tokuyama East IC)',
        notes: 'Check parking availability in Yamaguchi city center in advance'
      },
      {
        from: 'Fukuoka Area',
        method: 'Chugoku Expressway',
        time: 'Approx. 1 hour 30 minutes',
        description: 'Take Chugoku Expressway east, exit at Ogori IC toward JR Tokuyama Station.',
        cost: 'Highway toll approx. ¥2,000 (Fukuoka~Ogori IC)',
        notes: 'Convenient access from Kyushu area'
      }
    ],
    recommendations: 'Nearest station is Shin-Yamaguchi on Sanyo Shinkansen. Good access from Hiroshima area via local line.'
  },
  parkingOptions: [
    {
      name: 'Times Tokuyama Station',
      description: 'Parking lot in front of JR Tokuyama Station',
      price: 'Check for rates',
      distance: '10 min walk',
      website: 'https://times-info.net/P35-yamaguchi/line/L39700/S7208/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Tokuyama+Station',
    },
    {
      name: 'Shunan City Center Parking',
      description: 'City parking near venue',
      price: 'Check for rates',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Shunan+City+parking+Honmachi',
    },
  ],
  coinLockers: [
    {
      location: 'JR Tokuyama Station',
      description: 'Coin lockers inside JR Tokuyama Station',
      price: 'Check for rates',
      distance: '10 min walk',
      website: 'https://www.jr-odekake.net/eki/premises?id=0800661',
      mapsUrl: 'https://www.google.com/maps/search/JR+Tokuyama+Station',
    },
    {
      location: 'Tokuyama Station Shopping Street',
      description: 'Coin lockers in station shopping street',
      price: 'Check for rates',
      distance: '8 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Tokuyama+Station+shopping+street+coin+locker',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Tokuyama Ekimae',
      description: 'Starbucks in front of JR Tokuyama Station',
      distance: '10 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Tokuyama+Ekimae',
    },
    {
      name: 'Doutor Coffee Tokuyama',
      description: 'Relax before/after the concert at Doutor Coffee',
      distance: '8 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Doutor+Coffee+Tokuyama',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Shunan City Museum of Art and History',
      description: 'Exhibits Shunan City history and art. Industrial complex photo exhibitions',
      distance: '15 min walk',
      website: 'https://s-bunka.jp/bihaku/'
    },
    {
      name: 'Tokuyama Zoo',
      description: 'Zoo with diverse animals including penguins and elephants',
      distance: '10 min by car',
      website: 'https://www.tokuyama-zoo.jp/'
    },
    {
      name: 'Shunan Factory Night View',
      description: 'Night view spot of one of Japan\'s leading petrochemical complexes',
      distance: '15 min by car (Harumi Waterfront Park Observatory)',
      website: 'https://www.city.shunan.lg.jp/site/kanko/3091.html'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Alaska (Western cuisine)',
      cuisine: 'Western',
      description: 'Long-established Western-style restaurant loved in Tokuyama. Famous for hamburger steak and fried shrimp',
      distance: '5 min walk',
      openTime: '11:30-15:00, 17:00-21:00',
      price: '¥1,000 - ¥2,000',
      mapsUrl: 'https://www.google.com/maps/search/洋食の店+アラスカ+周南市',
      recommended: true,
      recommendComment: 'Local favorite! The hamburger steak is a must-try'
    },
    {
      name: 'Torisoba Kaoru',
      cuisine: 'Ramen',
      description: 'Popular ramen shop known for rich chicken broth. Salt ramen is the specialty',
      distance: '10 min walk',
      openTime: '11:00-14:30, 17:30-21:00',
      price: '¥1,000 - ¥1,500',
      mapsUrl: 'https://www.google.com/maps/search/鶏そば+カヲル+周南市',
      recommended: true,
      recommendComment: 'Top-rated on Tabelog! Rich chicken salt ramen is a must'
    },
    {
      name: 'Robata Uotake',
      cuisine: 'Seafood & Izakaya',
      description: 'Popular izakaya with fresh seafood and charcoal grilling. Great local sake selection',
      distance: '10 min walk (3 min from Tokuyama Sta.)',
      openTime: '17:00-23:00',
      price: '¥3,000 - ¥5,000',
      mapsUrl: 'https://www.google.com/maps/search/炉ばた+魚竹+周南市',
    },
    {
      name: 'Shunan Dining Zen (Tokuyama Ekimae)',
      cuisine: 'Izakaya & Seafood',
      description: 'Izakaya featuring Yamaguchi specialties and seasonal seafood with local sake. Private rooms available',
      distance: '10 min walk (2 min from Tokuyama Sta.)',
      openTime: '17:00-24:00',
      price: '¥3,000 - ¥4,000',
      mapsUrl: 'https://www.google.com/maps/search/周南Diningぜん+徳山駅前店',
    }
  ],
  accommodations: [
    {
      name: 'Hotel Sunroute Tokuyama',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Tokuyama Station. Clean and functional rooms with free breakfast',
      distance: '3 min walk from Tokuyama Station',
      priceRange: '¥5,000 - ¥7,500 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.sunroute.jp/tokuyama/',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Sunroute+Tokuyama',
      recommended: true,
      recommendComment: 'Near station with breakfast! Standard hotel for Tokuyama trips'
    },
    {
      name: 'Kaikatsu CLUB Shunan',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '10 min by car from Tokuyama Station',
      priceRange: '¥2,200 - ¥3,200 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours', 'Free parking'],
      website: 'https://www.kaikatsu.jp/shop/shunan/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Shunan',
      recommended: true,
      recommendComment: 'Perfect for car trips! Free parking and budget-friendly'
    },
    {
      name: 'Hotel Route Inn Tokuyama Ekimae',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Walking distance from Tokuyama Station',
      distance: '5 min walk from Tokuyama Station',
      priceRange: '¥5,500 - ¥8,000 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=393',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Tokuyama+Ekimae'
    },
    {
      name: 'Capsule Hotel Tokuyama',
      type: 'カプセルホテル',
      description: 'Capsule hotel with sauna. Late night check-in available',
      distance: '8 min walk from Tokuyama Station',
      priceRange: '¥3,000 - ¥4,000 per night',
      features: ['Sauna', 'Large public bath', 'Free Wi-Fi', 'Late check-in OK'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Tokuyama+Station'
    }
  ]
}

export default yamaguchi_rising_hall_en
