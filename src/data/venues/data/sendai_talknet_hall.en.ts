import { Venue } from '../types'

export const sendai_talknet_hall_en: Venue = {
  id: 'sendai_talknet_hall',
  name: 'TalkNet Hall Sendai',
  date: '2026-06-12T18:30:00+09:00',
  times: { open: '5:30 PM', start: '6:30 PM' },
  location: { 
    prefecture: 'Miyagi', 
    city: 'Sendai',
    address: '4-1 Sakuragaoka Park, Aoba-ku, Sendai, Miyagi',
    nearestStation: '3 min walk from Omachi-Nishi-Koen Station (Subway Tozai Line)'
  },
  capacity: 1310,
  access: '【Train】3 min walk from Omachi-Nishi-Koen Station (Subway Tozai Line). 3 min from JR Sendai Station via Subway Tozai Line.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3132.5!2d140.8587!3d38.2576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5f8a282e8b2c2b1d%3A0x1234567890abcdef!2z44OI44O844Kv44ON44OD44OI44Ob44O844Or5LuZ5Y-w!5e0!3m2!1sja!2sjp',
  venueWebsite: 'https://www.shimin-hall.com/',
  parkingInfo: 'Limited parking available. Public transportation recommended.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Sendai Airport',
        method: 'Sendai Airport Railway',
        time: 'Approx. 25 minutes',
        description: 'Sendai Airport Access Line from Sendai Airport to Sendai Station',
        cost: 'One-way ¥660',
        notes: 'Trains run every 15-20 minutes'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Tohoku Shinkansen Hayabusa',
        time: 'Approx. 1 hour 30 minutes',
        description: 'Tohoku Shinkansen Hayabusa from Tokyo Station to Sendai Station',
        cost: 'One-way approx. ¥11,000',
        notes: 'Fastest train approx. 90 minutes'
      },
      {
        from: 'Osaka',
        method: 'Shinkansen Transfer',
        time: 'Approx. 5 hours',
        description: 'Tokaido Shinkansen from Shin-Osaka to Tokyo → Tohoku Shinkansen to Sendai',
        cost: 'One-way approx. ¥23,000',
        notes: 'Transfer at Tokyo Station. Consider flying'
      },
      {
        from: 'Nagoya',
        method: 'Shinkansen Transfer',
        time: 'Approx. 4 hours',
        description: 'Tokaido Shinkansen from Nagoya to Tokyo → Tohoku Shinkansen to Sendai',
        cost: 'One-way approx. ¥19,000',
        notes: 'Transfer at Tokyo Station'
      },
      {
        from: 'Morioka',
        method: 'Tohoku Shinkansen',
        time: 'Approx. 40 minutes',
        description: 'Tohoku Shinkansen Hayabusa from Morioka Station to Sendai Station',
        cost: 'One-way approx. ¥4,500',
        notes: 'Hub of Tohoku region'
      }
    ],
    fromCar: [
      {
        from: 'Tokyo Area',
        method: 'Tohoku Expressway',
        time: 'Approx. 4 hours 30 minutes',
        description: 'North on Tohoku Expressway, exit at Sendai-Miyagi IC toward Sendai city. Multiple paid parking lots near venue.',
        cost: 'Highway toll approx. ¥6,500 (Tokyo~Sendai-Miyagi IC)',
        notes: 'Long distance drive - take breaks as needed. Winter: beware of icy roads'
      },
      {
        from: 'Aomori Area',
        method: 'Tohoku Expressway',
        time: 'Approx. 4 hours',
        description: 'South on Tohoku Expressway, exit at Sendai-Miyagi IC toward Sendai city.',
        cost: 'Highway toll approx. ¥5,500 (Aomori~Sendai-Miyagi IC)',
        notes: 'Convenient access from within Tohoku region'
      }
    ],
    recommendations: '25 minutes by train from Sendai Airport. 1.5 hours from Tokyo by Shinkansen. Central city of Tohoku region.'
  },
  parkingOptions: [
    {
      name: 'Times Sendai Ekimae',
      description: 'Parking lot in front of Sendai Station',
      price: '¥300 per 30 minutes',
      distance: '5 min walk',
      website: 'https://times-info.net/P04-miyagi/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Sendai+Ekimae',
    },
    {
      name: 'Sendai Station West Exit Parking',
      description: 'Parking lot at Sendai Station West Exit',
      price: 'Check for rates',
      distance: '3 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Sendai+Station+West+Exit+Parking',
    },
  ],
  coinLockers: [
    {
      location: 'Inside JR Sendai Station',
      description: 'Coin lockers inside JR Sendai Station',
      price: '¥300-¥600',
      distance: '5 min walk',
      website: 'https://www.jreast.co.jp/estation/stations/1326.html',
      mapsUrl: 'https://www.google.com/maps/search/JR+Sendai+Station',
    },
    {
      name: 'Sendai Station Shopping District',
      description: 'Coin lockers in front of station',
      price: 'Check for rates',
      distance: '3 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Sendai+Station+coin+lockers',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Sendai Ekimae',
      description: 'Starbucks in front of Sendai Station',
      distance: '3 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Sendai+Ekimae',
    },
    {
      name: 'Tully\'s Coffee Sendai',
      description: 'Tully\'s Coffee for pre/post-show relaxation',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Tullys+Coffee+Sendai',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Sendai Castle Ruins (Aoba Castle)',
      description: 'Ruins of Date Masamune\'s castle. Panoramic view of Sendai city',
      distance: '15 min by bus',
      website: 'https://www.sentabi.jp/guidebook/attractions/view/78'
    },
    {
      name: 'Arcade Shopping Street',
      description: 'Large arcade shopping district in front of Sendai Station',
      distance: '5 min walk',
      website: 'https://www.clis-sendai.jp/'
    },
    {
      name: 'Sendai Morning Market',
      description: 'Market with fresh seafood and vegetables',
      distance: '10 min walk',
      website: 'https://www.sendaiasaichi.com/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Gyutan Sumiyaki Rikyu',
      cuisine: 'Gyutan (Beef Tongue)',
      description: 'Famous shop for Sendai specialty gyutan. Thick-cut is exquisite',
      distance: '5 min walk',
      openTime: '11:00-22:00',
      price: '¥1,500-¥2,500',
      website: 'https://www.rikyu-gyutan.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Rikyu+Sendai+Station',
      recommended: true,
      recommendComment: 'Sendai means gyutan! Thick-cut, juicy, and the best'
    },
    {
      name: 'Zunda Saryo',
      cuisine: 'Zunda',
      description: 'Sweets specialty shop for Sendai specialty zunda',
      distance: '3 min walk',
      openTime: '9:00-21:00',
      price: '¥500-¥1,000',
      website: 'https://zundasaryo.com/',
      mapsUrl: 'https://www.google.com/maps/search/Zunda+Saryo+Sendai',
      recommended: true,
      recommendComment: 'Zunda shake is exquisite! Standard Sendai sweet'
    },
    {
      name: 'Suehiro Ramen Honpo Sendai Ekimae',
      cuisine: 'Ramen',
      description: 'Popular ramen shop with long lines. Unique sweet-savory soy sauce soup is signature',
      distance: '10 min by subway',
      openTime: '11:00-2:00 AM',
      price: '¥800-¥1,200',
      mapsUrl: 'https://www.google.com/maps/search/Suehiro+Ramen+Sendai+Ekimae',
    },
    {
      name: 'Abe Kamaboko Honten',
      cuisine: 'Sasa Kamaboko',
      description: 'Long-established shop for Sendai specialty sasa kamaboko. Traditional taste from early Showa era',
      distance: '15 min walk',
      openTime: '9:30-18:30',
      price: '¥1,500-¥3,000',
      website: 'https://www.abekama.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Abe+Kamaboko+Sendai',
      recommended: true,
      recommendComment: 'Long-established Sendai specialty sasa kamaboko! Chewy texture and fragrant edamame flavor are exquisite'
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Sendai Ekimae West Exit',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Sendai Station. Clean rooms and free breakfast',
      distance: '3 min walk from Sendai Station',
      priceRange: '¥5,500-¥7,500 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.toyoko-inn.com/search/detail/00027/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Sendai+Ekimae+West+Exit',
      recommended: true,
      recommendComment: 'Near station, clean, free breakfast! Standard for Sendai trips'
    },
    {
      name: 'Kaikatsu CLUB Sendai Ichibancho',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '7 min walk from Sendai Station',
      priceRange: '¥2,200-¥3,200 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours'],
      website: 'https://www.kaikatsu.jp/shop/sendai-ichibancho/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Sendai+Ichibancho',
      recommended: true,
      recommendComment: 'Best for budget! Close to entertainment district too'
    },
    {
      name: 'Nine Hours Sendai',
      type: 'カプセルホテル',
      description: 'Design-focused capsule hotel. Comfortable sleeping space with shower booths',
      distance: '5 min walk from Sendai Station',
      priceRange: '¥4,000-¥5,500 per night',
      features: ['Shower booths', 'Free Wi-Fi', 'Lockers', 'Sophisticated design', 'Women-only floor'],
      website: 'https://ninehours.co.jp/sendai/',
      mapsUrl: 'https://www.google.com/maps/search/Nine+Hours+Sendai',
      recommended: true,
      recommendComment: 'Comfortable capsule hotel balancing design and functionality! Exceptionally clean'
    },
    {
      name: 'Capsule Hotel Sendai',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna',
      distance: '6 min walk from Sendai Station',
      priceRange: '¥3,000-¥4,500 per night',
      features: ['Large public bath', 'Sauna', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Sendai+Station'
    },
    {
      name: 'Hotel Route Inn Sendai Ekimae',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Breakfast buffet well-received',
      distance: '5 min walk from Sendai Station',
      priceRange: '¥6,000-¥8,500 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=61',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Sendai+Ekimae'
    }
  ]
}

export default sendai_talknet_hall_en
