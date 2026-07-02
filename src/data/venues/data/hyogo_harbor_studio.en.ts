import { Venue } from '../types'

export const hyogo_harbor_studio_en: Venue = {
  id: 'hyogo_harbor_studio',
  name: 'Kobe Harbor Studio',
  date: '2026-03-28T17:00:00+09:00',
  times: { open: '4:00 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Hyogo', 
    city: 'Kobe',
    address: '6-3 Hatoba-cho, Chuo-ku, Kobe City, Hyogo (HS Building)',
    nearestStation: '5 min walk from Minato-Motomachi Station (Subway Kaigan Line, East Exit)'
  },
  capacity: 700,
  access: 'Train: Approx. 5 min walk south from East Exit of Minato-Motomachi Station on Kobe Municipal Subway Kaigan Line. JR/Hanshin/Sanyo Railway Motomachi Station also convenient.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13123.24261458181!2d135.185031!3d34.684728!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60008f0228655555%3A0xfc96682fa0f83aeb!2z56We5oi4SGFyYm9yIFN0dWRpbw!5e0!3m2!1sja!2sus!4v1764560731648!5m2!1sja!2sus',
  venueWebsite: 'https://harbor-studio.net/about/?anchor=section03',
  parkingInfo: 'No parking at venue. Public transportation recommended.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Kobe Airport',
        method: 'Port Liner + Subway',
        time: 'Approx. 30 minutes',
        description: 'Port Liner from Kobe Airport to Sannomiya Station (18 min) → Subway Kaigan Line to Minato-Motomachi Station (5 min)',
        cost: 'One-way ¥660',
        notes: 'Port Liner operates every 10 minutes'
      },
      {
        from: 'Kansai International Airport',
        method: 'Express Bus',
        time: 'Approx. 1 hour',
        description: 'Limousine bus from KIX to Kobe Sannomiya → Subway to Minato-Motomachi Station (5 min)',
        cost: 'One-way approx. ¥2,000',
        notes: '1-2 buses per hour'
      },
      {
        from: 'Osaka International Airport (Itami)',
        method: 'Airport Bus',
        time: 'Approx. 40 minutes',
        description: 'Bus from Itami Airport to Kobe Sannomiya → Subway to Minato-Motomachi Station',
        cost: 'One-way ¥1,050',
        notes: 'Operates every 20-30 minutes'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Nozomi Shinkansen',
        time: 'Approx. 2 hours 50 minutes',
        description: 'Nozomi Shinkansen from Tokyo Station to Shin-Kobe Station → Subway to Sannomiya → Kaigan Line to Minato-Motomachi',
        cost: 'One-way approx. ¥15,000',
        notes: 'Subway from Shin-Kobe via Sannomiya'
      },
      {
        from: 'Osaka',
        method: 'JR',
        time: 'Approx. 30 minutes',
        description: 'JR Kobe Line from Osaka Station to Kobe Station → 15 min walk or subway',
        cost: 'One-way ¥420',
        notes: 'Approx. 20 min using rapid service'
      },
      {
        from: 'Nagoya',
        method: 'Nozomi Shinkansen',
        time: 'Approx. 1 hour 10 minutes',
        description: 'Nozomi Shinkansen from Nagoya Station to Shin-Kobe Station → Subway',
        cost: 'One-way approx. ¥6,500',
        notes: 'Use subway from Shin-Kobe'
      }
    ],
    fromCar: [
      {
        from: 'Osaka Area',
        method: 'Hanshin Expressway/Meishin Expressway',
        time: 'Approx. 40 minutes',
        description: 'Via Hanshin Expressway or Meishin Expressway toward Kobe. Multiple paid parking lots near venue.',
        cost: 'Highway toll approx. ¥1,500 (Osaka~Kobe)',
        notes: 'Kobe Harbor area can be crowded on weekends'
      },
      {
        from: 'Himeji Area',
        method: 'Daini Shinmei Road',
        time: 'Approx. 50 minutes',
        description: 'Via Daini Shinmei Road to Kobe city.',
        cost: 'Highway toll approx. ¥1,200 (Himeji~Kobe)',
        notes: 'Convenient access from within Hyogo Prefecture'
      }
    ],
    recommendations: 'Kobe Airport is most convenient. Good access from KIX and Itami. Shinkansen users take subway from Shin-Kobe.'
  },
  parkingOptions: [
    {
      name: 'umie Parking',
      description: 'Harborland umie parking. Discount available with shopping',
      price: '¥300/30min (discount with shopping)',
      distance: '5 min walk',
      website: 'https://harborland.co.jp/parking/',
      mapsUrl: 'https://www.google.com/maps/search/umie+parking',
    },
    {
      name: 'Meriken Park Parking',
      description: 'Parking adjacent to Meriken Park',
      price: '¥200/30min',
      distance: '3 min walk',
      website: 'https://times-info.net/P28-hyogo/C110/park-detail-BUK0017660/',
      mapsUrl: 'https://www.google.com/maps/search/Meriken+Park+parking',
    },
  ],
  coinLockers: [
    {
      location: 'JR Kobe Station',
      description: 'Coin lockers inside JR Kobe Station',
      price: '¥300 - ¥600',
      distance: '15 min walk',
      website: 'https://eki.jr-odekake.net/premises?id=0610145',
      mapsUrl: 'https://www.google.com/maps/search/JR+Kobe+Station',
    },
    {
      location: 'Minato-Motomachi Station (Subway)',
      description: 'Coin lockers inside Minato-Motomachi subway station',
      price: '¥300 - ¥500',
      distance: '8 min walk',
      website: 'https://coinlocker.click/minatomotomachi-kobe-subway-station.php',
      mapsUrl: 'https://www.google.com/maps/search/Minato-Motomachi+Station',
    },
  ],
  cafes: [
    {
      name: 'Starbucks umie',
      description: 'Starbucks in Harborland. Relax while viewing the sea',
      distance: '5 min walk',
      website: 'https://store.starbucks.co.jp/detail-1146/',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+umie',
    },
    {
      name: "TULLY'S COFFEE Meriken Park",
      description: "TULLY'S in Meriken Park. Enjoy harbor views",
      distance: '3 min walk',
      website: 'https://shop.tullys.co.jp/detail/1680287',
      mapsUrl: 'https://www.google.com/maps/search/Tullys+Coffee+Meriken+Park',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Meriken Park',
      description: 'Waterfront park overlooking Kobe Port. Kobe Port Tower and Maritime Museum also here',
      distance: '5 min walk',
      website: 'https://www.city.kobe.lg.jp/kanko/spot/merikenpark/'
    },
    {
      name: 'Kobe Port Tower',
      description: "Kobe's symbol tower. Panoramic view of Kobe city and sea from observatory",
      distance: '7 min walk',
      website: 'https://www.kobe-port-tower.com/'
    },
    {
      name: 'umie (Harborland)',
      description: 'Large shopping mall. Abundant dining options',
      distance: '5 min walk',
      website: 'https://umie.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Kobe Beef Steak Teppanyaki Sakura',
      cuisine: 'Kobe Beef',
      description: 'Authentic Kobe beef teppanyaki. Recommended for special occasions',
      distance: '10 min walk',
      openTime: '11:30-14:30, 17:00-22:00',
      price: '¥5,000 - ¥15,000',
      website: 'https://www.saidining.com/sakura/',
      mapsUrl: 'https://www.google.com/maps/search/Kobe+Beef+Teppanyaki+Kobe+Harborland',
      recommended: true,
      recommendComment: 'Try Kobe beef in Kobe! Tender and juicy premium beef'
    },
    {
      name: 'Mosaic (Dining Area)',
      cuisine: 'Various',
      description: 'Dining area in Harborland. Various Japanese, Western, and Chinese restaurants',
      distance: '7 min walk',
      openTime: '11:00-23:00 (varies by shop)',
      price: '¥1,500 - ¥3,000',
      website: 'https://umie.jp/mosaic/',
      mapsUrl: 'https://www.google.com/maps/search/Mosaic+Kobe+Harborland',
    },
    {
      name: 'Nankinmachi (Chinatown)',
      cuisine: 'Chinese',
      description: 'One of Japan\'s three major Chinatowns. Authentic Chinese cuisine and street food',
      distance: '15 min walk',
      openTime: '10:00-20:00 (varies by shop)',
      price: '¥1,000 - ¥2,500',
      website: 'https://www.nankinmachi.or.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Nankinmachi+Kobe',
      recommended: true,
      recommendComment: 'Kobe tourist staple. Street food like pork buns and xiaolongbao is fun'
    },
    {
      name: 'Saizeriya umie',
      cuisine: 'Family Restaurant',
      description: 'Affordable Italian. Convenient for meals before/after concert',
      distance: '5 min walk',
      openTime: '10:00-22:00',
      price: '¥1,000 - ¥1,500',
      mapsUrl: 'https://www.google.com/maps/search/Saizeriya+umie',
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Kobe Sannomiya',
      type: 'ビジネスホテル',
      description: '5 min walk from Sannomiya Station. Clean and comfortable rooms with free breakfast',
      distance: '5 min walk from Sannomiya Station',
      priceRange: '¥5,500 - ¥7,500 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.toyoko-inn.com/search/detail/00044/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Kobe+Sannomiya',
      recommended: true,
      recommendComment: 'Near Sannomiya Station! Standard hotel for Kobe trips'
    },
    {
      name: 'Kaikatsu CLUB Kobe Sannomiya',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '8 min walk from Sannomiya Station',
      priceRange: '¥2,500 - ¥3,500 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours'],
      website: 'https://www.kaikatsu.jp/shop/kobe-sannomiya/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Kobe+Sannomiya',
      recommended: true,
      recommendComment: 'Perfect for budget focus! Close to Sannomiya downtown'
    },
    {
      name: 'Capsule Hotel Kobe Sannomiya',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna. Women-only floor available',
      distance: '7 min walk from Sannomiya Station',
      priceRange: '¥3,200 - ¥4,500 per night',
      features: ['Large public bath', 'Sauna', 'Women-only floor', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Kobe+Sannomiya'
    },
    {
      name: 'Super Hotel Kobe',
      type: 'ビジネスホテル',
      description: 'Business hotel with natural hot spring bath. Breakfast buffet also popular',
      distance: '10 min walk from Sannomiya Station',
      priceRange: '¥5,800 - ¥8,500 per night',
      features: ['Natural hot spring', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.superhotel.co.jp/s_hotels/kobe/',
      mapsUrl: 'https://www.google.com/maps/search/Super+Hotel+Kobe'
    }
  ]
}

export default hyogo_harbor_studio_en
