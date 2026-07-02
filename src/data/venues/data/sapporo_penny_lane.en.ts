import { Venue } from '../types'

export const sapporo_penny_lane_en: Venue = {
  id: 'sapporo_penny_lane',
  name: 'Sapporo PENNY LANE 24',
  date: '2026-05-10T17:00:00+09:00',
  times: { open: '4:00 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Hokkaido', 
    city: 'Sapporo',
    address: 'Minami 4-jo Nishi 5-chome, Chuo-ku, Sapporo, Hokkaido',
    nearestStation: '3 min walk from Susukino Subway Station'
  },
  capacity: 400,
  gradient: {
    from: '#9370DB',
    to: '#E6E6FA'
  },
  access: '3 min walk from Susukino Station Exit 3 (Namboku Line). Central Susukino entertainment district.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d11657.818425874671!2d141.30646!3d43.073937!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5f0b284b7075fa89%3A0xc8c9623237f84ba4!2z44Oa44OL44O844Os44O844OzMjQ!5e0!3m2!1sja!2sus!4v1764573983875!5m2!1sja!2sus',
  venueWebsite: 'https://www.pl24.jp/info.html',
  parkingInfo: 'No dedicated parking. Please use paid parking around Susukino. Public transportation recommended.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'New Chitose Airport',
        method: 'JR Rapid Airport',
        time: 'Approx. 40 minutes',
        description: 'JR Rapid Airport from New Chitose Airport Station to Sapporo Station → Subway to Susukino Station (1 stop)',
        cost: 'One-way ¥1,150',
        notes: 'Rapid Airport runs every 15 minutes'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Shinkansen + Limited Express',
        time: 'Approx. 8 hours',
        description: 'Hayabusa Shinkansen from Tokyo to Shin-Hakodate-Hokuto → Limited Express Hokuto to Sapporo. Flight more practical',
        cost: 'One-way approx. ¥28,000',
        notes: 'Flight from Haneda to New Chitose more efficient'
      },
      {
        from: 'Osaka/Nagoya',
        method: 'Flight Recommended',
        time: 'Approx. 2 hours by flight',
        description: 'Many direct flights from Kansai/Itami/Chubu to New Chitose Airport',
        cost: 'One-way ¥15,000-¥30,000',
        notes: 'Flight overwhelmingly more convenient than Shinkansen'
      }
    ],
    fromExpressBus: [
      {
        from: 'Asahikawa/Kushiro/Hakodate',
        method: 'Express Bus',
        time: 'Approx. 2-5 hours',
        description: 'Many express buses from around Hokkaido to Sapporo. Get off at Sapporo Station or near Susukino',
        cost: 'One-way ¥2,000-¥5,000',
        notes: 'May be delayed due to snow in winter'
      }
    ],
    fromCar: [
      {
        from: 'New Chitose Airport',
        method: 'Doo Expressway',
        time: 'Approx. 1 hour',
        description: 'North on Doo Expressway, exit at Sapporo IC toward Sapporo city. Multiple paid parking lots near venue.',
        cost: 'Highway toll approx. ¥1,500 (New Chitose Airport~Sapporo IC)',
        notes: 'Winter: beware of icy roads. Studded tires required'
      },
      {
        from: 'Hakodate Area',
        method: 'Doo Expressway',
        time: 'Approx. 4 hours',
        description: 'Via Doo Expressway, exit at Sapporo IC toward Sapporo city.',
        cost: 'Highway toll approx. ¥5,500 (Hakodate~Sapporo IC)',
        notes: 'Convenient from southern Hokkaido. Beware of winter weather'
      }
    ],
    recommendations: 'Access to Sapporo primarily by air. JR Airport fast and reliable from New Chitose. Express bus also convenient within Hokkaido.'
  },
  parkingOptions: [
    {
      name: 'Times Susukino',
      description: 'Parking lot in Susukino entertainment district',
      price: '¥300/30 min',
      distance: '5 min walk',
      website: 'https://times-info.net/P01-hokkaido/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Susukino',
    },
    {
      name: 'Norbesa Parking',
      description: 'Parking inside Norbesa building',
      price: '¥200/30 min',
      distance: '3 min walk',
      website: 'https://www.norbesa.jp/access/',
      mapsUrl: 'https://www.google.com/maps/search/Norbesa+parking',
    },
  ],
  coinLockers: [
    {
      location: 'Susukino Subway Station',
      description: 'Coin lockers inside Susukino Subway Station',
      price: '¥300-¥500',
      distance: '3 min walk',
      website: 'https://www.city.sapporo.jp/st/subway/',
      mapsUrl: 'https://www.google.com/maps/search/Susukino+Subway+Station',
    },
    {
      location: 'Norbesa',
      description: 'Coin lockers inside Norbesa building',
      price: 'Check for rates',
      distance: '3 min walk',
      website: 'https://www.norbesa.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Norbesa+Susukino',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Susukino',
      description: 'Starbucks in Susukino entertainment district',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Susukino',
    },
    {
      name: 'Komeda Coffee Odori Bisse',
      description: 'Komeda Coffee in Odori area',
      distance: '10 min walk',
      website: 'https://www.komeda.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Komeda+Coffee+Odori+Bisse',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Odori Park',
      description: 'Large park running through central Sapporo. Venue for Sapporo Snow Festival',
      distance: '8 min walk',
      website: 'https://odori-park.jp/'
    },
    {
      name: 'Sapporo TV Tower',
      description: 'Sapporo landmark tower. Panoramic city view from observation deck',
      distance: '10 min walk',
      website: 'https://www.tv-tower.co.jp/'
    },
    {
      name: 'Susukino',
      description: 'Hokkaido\'s largest entertainment district. Full of restaurants',
      distance: 'Immediate area',
      website: 'https://susukino-ta.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Susukino Ramen Yokocho',
      cuisine: 'Sapporo Ramen',
      description: 'Alley where famous Sapporo ramen shops gather. Birthplace of miso ramen',
      distance: '5 min walk',
      openTime: '11:00-3:00 AM (varies by shop)',
      price: '¥800-¥1,200',
      website: 'https://www.ganso-yokocho.com/',
      mapsUrl: 'https://www.google.com/maps/search/Susukino+Ramen+Yokocho',
      recommended: true,
      recommendComment: 'Holy land of Sapporo miso ramen! Rich miso soup is exquisite'
    },
    {
      name: 'Jingisukan Daruma Honten',
      cuisine: 'Genghis Khan (Lamb BBQ)',
      description: 'Extremely popular Genghis Khan specialty shop in Sapporo. Long lines expected',
      distance: '5 min walk',
      openTime: '17:00-3:00 AM',
      price: '¥3,000-¥5,000',
      website: 'https://www.sapporo-jingisukan.info/',
      mapsUrl: 'https://www.google.com/maps/search/Jingisukan+Daruma+Susukino',
      recommended: true,
      recommendComment: 'Most popular Genghis Khan in Sapporo! Tender raw lamb is the best'
    },
    {
      name: 'Soup Curry GARAKU',
      cuisine: 'Soup Curry',
      description: 'Popular Sapporo soup curry shop',
      distance: '7 min walk',
      openTime: '11:30-22:00',
      price: '¥1,200-¥1,800',
      mapsUrl: 'https://www.google.com/maps/search/Soup+Curry+GARAKU+Sapporo',
    },
    {
      name: 'Umi Hachikyou Honten',
      cuisine: 'Seafood',
      description: 'Famous for signature "tsukko-meshi" (overflowing ikura bowl) seafood izakaya',
      distance: '5 min walk',
      openTime: '18:00-midnight',
      price: '¥3,000-¥5,000',
      website: 'https://www.hachikyou.com/',
      mapsUrl: 'https://www.google.com/maps/search/Hachikyou+Susukino',
      recommended: true,
      recommendComment: 'Signature tsukko-meshi is spectacular! Fresh ikura overflows the bowl'
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Sapporo Susukino',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Susukino. Clean rooms and free breakfast',
      distance: '3 min walk from Susukino Station',
      priceRange: '¥5,500-¥7,500 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near entertainment district'],
      website: 'https://www.toyoko-inn.com/search/detail/00007/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Sapporo+Susukino',
      recommended: true,
      recommendComment: 'Close to Susukino entertainment district! Standard for Sapporo trips'
    },
    {
      name: 'Kaikatsu CLUB Sapporo Susukino',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '5 min walk from Susukino Station',
      priceRange: '¥2,500-¥3,500 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours'],
      website: 'https://www.kaikatsu.jp/shop/sapporo-susukino/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Sapporo+Susukino',
      recommended: true,
      recommendComment: 'Best option for budget! Close to entertainment district too'
    },
    {
      name: 'Capsule Hotel Sapporo',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna. Women-only floor available',
      distance: '5 min walk from Susukino Station',
      priceRange: '¥3,000-¥4,500 per night',
      features: ['Large public bath', 'Sauna', 'Women-only floor', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Sapporo+Susukino'
    },
    {
      name: 'Hotel Route Inn Sapporo Ekimae',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Breakfast buffet well-received',
      distance: '5 min walk from Sapporo Station',
      priceRange: '¥6,000-¥8,500 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=4',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Sapporo+Ekimae'
    }
  ]
}

export default sapporo_penny_lane_en
