import { Venue } from '../types'

export const gifu_club_g_en: Venue = {
  id: 'gifu_club_g',
  name: 'Gifu CLUB-G',
  date: '2026-05-31T17:00:00+09:00',
  times: { open: '4:30 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Gifu', 
    city: 'Gifu',
    address: '2-5 Tamamiyacho, Gifu City, Gifu',
    nearestStation: '10 min walk from JR Gifu Station'
  },
  capacity: 350,
  access: '10 minutes walk from JR Gifu Station or Meitetsu Gifu Station. Near Yanagase Shopping Street.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13005.849577495761!2d136.759685!3d35.418574!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6003a945d1f532df%3A0x9ad8619e32446afc!2z5bKQ6ZicY2x1Yi1H!5e0!3m2!1sja!2sus!4v1764574717404!5m2!1sja!2sus',
  venueWebsite: 'https://club-g.jp/access.html',
  parkingInfo: 'No dedicated parking. Please use nearby paid parking lots.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Chubu Centrair International Airport',
        method: 'Train',
        time: 'Approx. 1 hour 30 minutes',
        description: 'Meitetsu from Centrair to Nagoya Station → JR Tokaido Line to Gifu Station',
        cost: 'One-way approx. ¥2,000',
        notes: 'Transfer at Nagoya Station'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Shinkansen + JR',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Shinkansen Nozomi from Tokyo to Nagoya → JR Tokaido Line Rapid to Gifu (20 min)',
        cost: 'One-way approx. ¥11,500',
        notes: 'Transfer to JR at Nagoya Station'
      },
      {
        from: 'Osaka',
        method: 'Shinkansen + JR',
        time: 'Approx. 1 hour 15 minutes',
        description: 'Shinkansen Nozomi from Shin-Osaka to Nagoya → JR Tokaido Line to Gifu',
        cost: 'One-way approx. ¥6,500',
        notes: 'Transfer to JR at Nagoya Station'
      },
      {
        from: 'Nagoya',
        method: 'JR',
        time: 'Approx. 20 minutes',
        description: 'JR Tokaido Line Rapid from Nagoya Station to Gifu Station',
        cost: 'One-way ¥470',
        notes: 'Approx. 20 min by Rapid train'
      }
    ],
    fromExpressBus: [
      {
        from: 'Tokyo',
        method: 'Overnight Express Bus',
        time: 'Approx. 7 hours',
        description: 'Overnight bus from Tokyo Station to Gifu Station',
        cost: 'One-way approx. ¥5,000',
        notes: 'Departs previous night, arrives next morning. Economical option'
      },
      {
        from: 'Osaka',
        method: 'Express Bus',
        time: 'Approx. 3 hours',
        description: 'Express bus from Osaka Station to Gifu Station',
        cost: 'One-way approx. ¥3,500',
        notes: 'Convenient access from Kansai region'
      }
    ],
    fromCar: [
      {
        from: 'Nagoya Area',
        method: 'Tokai-Hokuriku Expressway',
        time: 'Approx. 40 minutes',
        description: 'North on Tokai-Hokuriku Expressway, exit at Gifu-Kakamigahara IC toward Gifu city. Paid parking lots near venue.',
        cost: 'Highway toll approx. ¥1,200 (Nagoya~Gifu-Kakamigahara IC)',
        notes: 'Advance check of parking in Gifu city center recommended'
      },
      {
        from: 'Osaka Area',
        method: 'Meishin/Tokai-Hokuriku Expressway',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Via Meishin Expressway → Tokai-Hokuriku Expressway to Gifu city.',
        cost: 'Highway toll approx. ¥5,000 (Osaka~Gifu)',
        notes: 'Convenient access from Kansai region'
      }
    ],
    recommendations: 'Only 20 minutes from Nagoya. Shinkansen users transfer to JR at Nagoya Station.'
  },
  parkingOptions: [
    {
      name: 'Times Gifu Ekimae',
      description: 'Parking lot in front of Gifu Station',
      price: 'Check for rates',
      distance: '10 min walk',
      website: 'https://times-info.net/P21-gifu/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Gifu+Ekimae',
    },
    {
      name: 'Gifu City Parking',
      description: 'Municipal parking lot',
      price: 'Check for rates',
      distance: '8 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Gifu+City+Parking',
    },
  ],
  coinLockers: [
    {
      location: 'Inside JR Gifu Station',
      description: 'Coin lockers inside JR Gifu Station',
      price: '¥300-¥600',
      distance: '10 min walk',
      website: 'https://railway.jr-central.co.jp/station-guide/tokai/gifu/',
      mapsUrl: 'https://www.google.com/maps/search/JR+Gifu+Station',
    },
    {
      location: 'Meitetsu Gifu Station',
      description: 'Coin lockers at Meitetsu Gifu Station',
      price: 'Check for rates',
      distance: '10 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Meitetsu+Gifu+Station',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Gifu Ekimae',
      description: 'Starbucks in front of Gifu Station',
      distance: '10 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Gifu+Ekimae',
    },
    {
      name: 'Komeda Coffee Gifu',
      description: 'Komeda Coffee for pre/post-show relaxation',
      distance: '8 min walk',
      website: 'https://www.komeda.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Komeda+Coffee+Gifu',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Gifu Castle',
      description: 'Castle standing atop Mt. Kinka. Accessible by ropeway',
      distance: '20 min by bus',
      website: 'https://www.city.gifu.lg.jp/kankoubunka/kankou/1013051.html'
    },
    {
      name: 'Nagara River Cormorant Fishing',
      description: 'Traditional fishing method with 1,300 years of history. Summer only',
      distance: '20 min by bus',
      website: 'https://www.ukai-gifucity.jp/'
    },
    {
      name: 'Yanagase Shopping Street',
      description: 'Gifu\'s entertainment district with retro atmosphere',
      distance: '5 min walk',
      website: 'https://yanagase.or.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Sushitatsu',
      cuisine: 'Sushi',
      description: 'Popular conveyor belt sushi in Gifu. Fresh ingredients',
      distance: '8 min walk',
      openTime: '11:00-22:00',
      price: '¥2,000-¥3,000',
      mapsUrl: 'https://www.google.com/maps/search/Sushitatsu+Gifu',
      recommended: true,
      recommendComment: 'Best sushi in Gifu! Fresh and delicious'
    },
    {
      name: 'Bakuroichidai Gifu Kanda',
      cuisine: 'Hida Beef',
      description: 'Whole-head purchase Hida beef yakiniku and sukiyaki specialist. Rare cuts available',
      distance: '10 min walk',
      openTime: '11:30-14:30, 5:00 PM-10:00 PM',
      price: '¥4,000-¥8,000',
      website: 'https://www.bakuroichidai.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Bakuroichidai+Gifu',
      recommended: true,
      recommendComment: 'Must-try Hida beef in Gifu! Rare cuts available thanks to whole-head purchase'
    },
    {
      name: 'Sarashina',
      cuisine: 'Soba',
      description: 'Long-established soba restaurant in Gifu',
      distance: '7 min walk',
      openTime: '11:00-20:00',
      price: '¥800-¥1,500',
      mapsUrl: 'https://www.google.com/maps/search/Sarashina+Gifu',
    },
    {
      name: 'Marudebu Sohonten',
      cuisine: 'Chinese Noodles',
      description: 'Founded in 1938. Famous Gifu soul food Chinese noodle shop',
      distance: '5 min walk',
      openTime: '11:00-14:30',
      price: '¥500-¥800',
      mapsUrl: 'https://www.google.com/maps/search/Marudebu+Sohonten+Gifu',
      recommended: true,
      recommendComment: 'Gifu soul food! Simple, old-fashioned Chinese noodles are exquisite'
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Gifu Ekimae',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Gifu Station. Clean rooms and free breakfast',
      distance: '3 min walk from Gifu Station',
      priceRange: '¥5,000-¥7,000 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.toyoko-inn.com/search/detail/00092/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Gifu+Ekimae',
      recommended: true,
      recommendComment: 'Near station, clean, free breakfast! Standard for Gifu trips'
    },
    {
      name: 'Kaikatsu CLUB Gifu',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '10 min by car from Gifu Station',
      priceRange: '¥2,000-¥3,000 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours', 'Free parking'],
      website: 'https://www.kaikatsu.jp/shop/gifu/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Gifu',
      recommended: true,
      recommendComment: 'Best for car trips! Free parking and budget-friendly'
    },
    {
      name: 'Capsule Hotel Gifu',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna',
      distance: '6 min walk from Gifu Station',
      priceRange: '¥3,000-¥4,000 per night',
      features: ['Large public bath', 'Sauna', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Gifu+Station'
    },
    {
      name: 'Hotel Route Inn Gifu Kano',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Breakfast buffet well-received',
      distance: '15 min by car from Gifu Station',
      priceRange: '¥5,500-¥8,000 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Free parking'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=123',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Gifu+Kano'
    }
  ]
}

export default gifu_club_g_en
