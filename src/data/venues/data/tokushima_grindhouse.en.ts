import { Venue } from '../types'

export const tokushima_grindhouse_en: Venue = {
  id: 'tokushima_grindhouse',
  name: 'Tokushima club GRINDHOUSE',
  date: '2026-03-20T17:00:00+09:00',
  times: { open: '4:30 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Tokushima', 
    city: 'Tokushima',
    address: '2-23 Akitamachi, Tokushima City, Tokushima (Joyful Building 3F)',
    nearestStation: '8 min walk from JR Awa-Tomida Station'
  },
  capacity: 230,
  access: 'Train: 8 min walk from JR Awa-Tomida Station. Head west from the station, turn left at the intersection with coin parking and Suntory Plaza Building, walk 2-3 min. Joyful Building 3rd floor. Car: Exit Tokushima Expressway at Tokushima IC, head south on Route 11 (toward Prefectural Office/Anan), turn right at Prefectural Office intersection, turn left at 3rd traffic light, right side before 2nd traffic light.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6610.42566365473!2d134.549314!3d34.064058!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x355372a7e88ea9f3%3A0xd18469e3d702bada!2sclub%20GRINDHOUSE!5e0!3m2!1sja!2sjp!4v1765044076787!5m2!1sja!2sjp',
  venueWebsite: 'https://c-gh.jp/',
  parkingInfo: 'No dedicated parking. Please use nearby coin parking.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Tokushima Awaodori Airport',
        method: 'Airport Bus',
        time: 'Approx. 30 minutes',
        description: 'Airport bus operates from Tokushima Airport to JR Tokushima Station. 5 min walk to venue after getting off at JR Tokushima Station.',
        cost: 'One-way ¥440',
        notes: '1-2 buses per hour. Check timetable'
      },
      {
        from: 'Kansai International Airport',
        method: 'Express Bus',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Express bus operates from Kansai Airport to Tokushima Station. Direct and convenient.',
        cost: 'One-way approx. ¥3,200',
        notes: 'Several buses per day. Advance reservation recommended'
      }
    ],
    fromExpressBus: [
      {
        from: 'Osaka',
        method: 'Express Bus',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Frequent express buses from Osaka (Umeda/Namba) to Tokushima Station. Operated by JR Highway Bus and Tokushima Bus.',
        cost: 'One-way approx. ¥3,200',
        notes: 'About 1 bus per hour. May be affected by traffic'
      },
      {
        from: 'Kobe',
        method: 'Express Bus',
        time: 'Approx. 2 hours',
        description: 'Express bus operates from Kobe (Sannomiya) to Tokushima Station.',
        cost: 'One-way approx. ¥2,700',
        notes: 'Convenient access from Kansai area'
      }
    ],
    fromCar: [
      {
        from: 'Osaka/Kobe Area',
        method: 'Kobe-Awaji-Naruto Expressway/Tokushima Expressway',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Via Kobe-Awaji-Naruto Expressway → Tokushima Expressway, exit at Tokushima IC toward city center. Paid parking lots available near venue.',
        cost: 'Highway toll approx. ¥4,500 (Kobe~Tokushima IC)',
        notes: 'Route crosses Akashi Kaikyo Bridge and Onaruto Bridge. Watch for traffic restrictions on windy days'
      },
      {
        from: 'Takamatsu Area',
        method: 'Tokushima Expressway',
        time: 'Approx. 1 hour',
        description: 'Via Tokushima Expressway, exit at Tokushima IC toward city center.',
        cost: 'Highway toll approx. ¥1,500 (Takamatsu~Tokushima IC)',
        notes: 'Convenient access from within Shikoku'
      }
    ],
    recommendations: 'Express bus from Kansai area is convenient and economical. If using Tokushima Airport, take airport bus directly to the station.'
  },
  parkingOptions: [
    {
      name: 'Times Tokushima Station',
      description: 'Parking information for Times Tokushima Station',
      price: 'Check for rates',
      distance: 'Check for distance',
      website: 'https://times-info.net/P36-tokushima/line/L40900/S7218/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Tokushima+Station',
    },
    {
      name: 'JR Tokushima Station Parking',
      description: 'Parking information for JR Tokushima Station area',
      price: 'Check for rates',
      distance: 'Check for distance',
      mapsUrl: 'https://www.google.com/maps/search/JR+Tokushima+Station+parking',
    },
  ],
  coinLockers: [
    {
      location: 'JR Tokushima Station',
      description: 'Coin lockers inside JR Tokushima Station',
      price: 'Check for rates',
      distance: 'Check for distance',
      website: 'https://www.jr-shikoku.co.jp/01_trainbus/kakueki/tokushima/kounai_map.html',
      mapsUrl: 'https://www.google.com/maps/search/JR+Tokushima+Station',
    },
    {
      location: 'Tokushima Station Clement Plaza',
      description: 'Coin lockers at Tokushima Station Clement Plaza',
      price: 'Check for rates',
      distance: 'Check for distance',
      mapsUrl: 'https://www.google.com/maps/search/Tokushima+Station+Clement+Plaza',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Tokushima Ekimae',
      description: 'Perfect for relaxing before/after the concert at Starbucks Tokushima Ekimae',
      distance: '3 min walk',
      website: 'https://store.starbucks.co.jp/detail-976/',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Tokushima+Ekimae',
    },
    {
      name: 'Doutor Coffee Tokushima Ekimae',
      description: 'Perfect for relaxing before/after the concert at Doutor Coffee Tokushima Ekimae',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Doutor+Coffee+Tokushima+Ekimae',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Awa Odori Kaikan',
      description: 'Facility to experience the history and charm of Awa Odori dance. Live performances available',
      distance: '8 min walk',
      website: 'https://awaodori-kaikan.jp/'
    },
    {
      name: 'Mt. Bizan Ropeway',
      description: 'To the summit of Mt. Bizan overlooking Tokushima city. Beautiful night view',
      distance: '10 min walk',
      website: 'https://www.bizan.or.jp/'
    },
    {
      name: 'Tokushima Central Park',
      description: 'Spacious park centered on Tokushima Castle ruins. Perfect for strolling',
      distance: '15 min walk'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Tokushima Ramen Fukuri',
      cuisine: 'Tokushima Ramen',
      description: 'Famous Tokushima ramen restaurant. Rich pork bone soy sauce soup with raw egg is signature',
      distance: '7 min walk',
      openTime: '11:00-21:00',
      price: '¥700 - ¥1,000',
      website: 'https://tabelog.com/tokushima/A3601/A360102/36000024/',
      mapsUrl: 'https://www.google.com/maps/search/Tokushima+Ramen+Fukuri+Tokushima',
      recommended: true,
      recommendComment: 'A must-try in Tokushima! Rich soup with raw egg combination is exquisite'
    },
    {
      name: 'Tokushima Ramen Menoh',
      cuisine: 'Tokushima Ramen',
      description: 'Popular local Tokushima ramen restaurant. Light style also available',
      distance: '8 min walk',
      openTime: '11:00-22:00',
      price: '¥650 - ¥900',
      mapsUrl: 'https://www.google.com/maps/search/Tokushima+Ramen+Menoh+Tokushima+Station'
    },
    {
      name: 'Ikkou Tokushima Honten',
      cuisine: 'Awa Odori Chicken',
      description: 'Popular restaurant famous for bone-in Awa Odori chicken',
      distance: '8 min walk',
      openTime: '17:00-23:00',
      price: '¥2,000-¥3,500',
      website: 'http://www.ikkou-tokushima.com/',
      mapsUrl: 'https://www.google.com/maps/search/Ikkou+Tokushima',
      recommended: true,
      recommendComment: 'Tokushima specialty Awa Odori chicken! Bone-in chicken is juicy and exquisite'
    },
    {
      name: 'Chuka Soba Inotani Honten',
      cuisine: 'Tokushima Ramen',
      description: 'The original iconic Tokushima ramen shop. Sweet-savory soy sauce soup with pork belly is signature',
      distance: '5 min walk',
      openTime: '10:30-17:00',
      price: '¥600-¥900',
      mapsUrl: 'https://www.google.com/maps/search/Inotani+Tokushima',
      recommended: true,
      recommendComment: 'The definitive Tokushima ramen! Rich brown soup with raw egg topping is a must'
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Tokushima Eki Bizan-guchi',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Tokushima Station. Clean and comfortable rooms with free breakfast service',
      distance: '3 min walk from Tokushima Station',
      priceRange: '¥5,000 - ¥7,000 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.toyoko-inn.com/search/detail/00136/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Tokushima+Station',
      recommended: true,
      recommendComment: 'Near station, clean, free breakfast! Standard hotel for Tokushima trips'
    },
    {
      name: 'Kaikatsu CLUB Tokushima Ekimae',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available for long stays',
      distance: '5 min walk from Tokushima Station',
      priceRange: '¥2,000 - ¥3,000 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours'],
      website: 'https://www.kaikatsu.jp/shop/tokushima/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Tokushima+Ekimae',
      recommended: true,
      recommendComment: 'Perfect for budget travelers! Relax in a private room'
    },
    {
      name: 'Capsule Hotel Tokushima',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna. Women-only floor available for safety',
      distance: '7 min walk from Tokushima Station',
      priceRange: '¥3,000 - ¥4,000 per night',
      features: ['Large public bath', 'Sauna', 'Women-only floor', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Tokushima+Station',
    },
    {
      name: 'APA Hotel Tokushima Ekimae',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Close to station, safe after concert',
      distance: '4 min walk from Tokushima Station',
      priceRange: '¥5,500 - ¥8,000 per night',
      features: ['Large public bath', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.apahotel.com/hotel/shikoku/tokushima-ekimae/',
      mapsUrl: 'https://www.google.com/maps/search/APA+Hotel+Tokushima+Ekimae'
    }
  ]
}

export default tokushima_grindhouse_en
