import { Venue } from '../types'

export const nagoya_kokaido_en: Venue = {
  id: 'nagoya_kokaido',
  name: 'Okaya Steel Nagoya Civic Assembly Hall',
  date: '2026-07-04T17:00:00+09:00',
  times: { open: '4:00 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Aichi', 
    city: 'Nagoya',
    address: '1-1-3 Tsurumai, Showa-ku, Nagoya, Aichi',
    nearestStation: '3 min walk from JR Tsurumai Station'
  },
  capacity: 2000,
  access: '3 minutes walk from JR Tsurumai Station (Chuo Line). Right next to Exit 4 of Tsurumai Station (Subway Tsurumai Line).',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13047.990657531383!2d136.919118!3d35.156679!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x600370bc26485bb1%3A0xaa773c547ea00cdf!2z5bKh6LC36Yu85qmf5ZCN5Y-k5bGL5YWs5Lya5aCC!5e0!3m2!1sja!2sus!4v1764574826802!5m2!1sja!2sus',
  venueWebsite: 'https://nagoyashi-kokaido.hall-info.jp/access/',
  parkingInfo: 'No dedicated parking. Please use paid parking lots around Tsurumai Park. Public transportation is recommended.',
  nearbyAttractions: [
    {
      name: 'Tsurumai Park',
      description: 'Vast park famous as cherry blossom viewing spot',
      distance: '1 min walk (in front of venue)'
    },
    {
      name: 'Nagoya Castle',
      description: 'Symbol of Nagoya famous for golden shachihoko (dolphin-like fish)',
      distance: '10 min by subway'
    }
  ],
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Chubu Centrair International Airport',
        method: 'Meitetsu Limited Express',
        time: 'Approx. 50 minutes',
        description: 'Meitetsu Limited Express μ-SKY from Chubu Centrair to Kanayama Station → JR Chuo Line to Tsurumai Station',
        cost: 'One-way ¥1,400',
        notes: 'Meitetsu Limited Express runs every 30 minutes'
      },
      {
        from: 'Nagoya Airfield (Komaki Airport)',
        method: 'Bus + Subway',
        time: 'Approx. 1 hour',
        description: 'Bus from Nagoya Airfield to Nagoya Station → JR Chuo Line to Tsurumai Station (5 min)',
        cost: 'One-way ¥700',
        notes: 'Domestic flights including FDA'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Shinkansen Nozomi',
        time: 'Approx. 1 hour 40 minutes',
        description: 'Shinkansen Nozomi from Tokyo to Nagoya Station → JR Chuo Line to Tsurumai Station (5 min)',
        cost: 'One-way approx. ¥11,000',
        notes: 'Only 5 min by JR from Nagoya Station'
      },
      {
        from: 'Osaka',
        method: 'Shinkansen Nozomi',
        time: 'Approx. 50 minutes',
        description: 'Shinkansen Nozomi from Shin-Osaka to Nagoya Station → JR Chuo Line to Tsurumai Station',
        cost: 'One-way approx. ¥6,500',
        notes: '5 min by JR from Nagoya Station'
      },
      {
        from: 'Fukuoka',
        method: 'Shinkansen Nozomi',
        time: 'Approx. 3 hours 15 minutes',
        description: 'Shinkansen Nozomi from Hakata to Nagoya Station → JR Chuo Line to Tsurumai Station',
        cost: 'One-way approx. ¥18,000',
        notes: '5 min by JR from Nagoya Station'
      },
      {
        from: 'Sendai',
        method: 'Shinkansen Transfer',
        time: 'Approx. 3 hours 30 minutes',
        description: 'Tohoku Shinkansen from Sendai to Tokyo → Tokaido Shinkansen to Nagoya',
        cost: 'One-way approx. ¥19,000',
        notes: 'Transfer at Tokyo Station'
      }
    ],
    fromExpressBus: [
      {
        from: 'Tokyo/Osaka',
        method: 'Overnight Express Bus',
        time: 'Approx. 6-8 hours',
        description: 'Many overnight buses operate from Tokyo/Osaka to Nagoya. After arriving at Nagoya Station, take JR to Tsurumai.',
        cost: 'One-way ¥3,000-¥6,000',
        notes: 'Departs previous night, arrives next morning. Economical but time-consuming'
      }
    ],
    fromCar: [
      {
        from: 'Tokyo Area',
        method: 'Tomei Expressway',
        time: 'Approx. 4 hours',
        description: 'Via Tomei Expressway, exit at Nagoya IC toward Nagoya city. Multiple paid parking lots near venue.',
        cost: 'Highway toll approx. ¥7,500 (Tokyo~Nagoya IC)',
        notes: 'Tomei Expressway may be congested on weekends'
      },
      {
        from: 'Osaka Area',
        method: 'Meishin Expressway',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Via Meishin Expressway, exit at Nagoya IC toward Nagoya city.',
        cost: 'Highway toll approx. ¥4,500 (Osaka~Nagoya IC)',
        notes: 'Convenient access from Chubu region'
      }
    ],
    recommendations: 'Shinkansen is most convenient. Only 5 min by JR from Nagoya Station. Good access from Chubu Airport in approx. 50 min. Nagoya is a Shinkansen hub with excellent transportation.'
  },
  parkingOptions: [
    {
      name: 'Tsurumai Park South Parking',
      description: 'Parking lot information for Tsurumai Park South',
      price: 'Check for rates',
      distance: 'Check for distance',
      website: 'https://ssparking.co.jp/detail/%E9%B6%B4%E8%88%9E%E5%85%AC%E5%9C%92%E5%8D%97%E9%A7%90%E8%BB%8A%E5%A0%B4/',
      mapsUrl: 'https://www.google.com/maps/search/Tsurumai+Park+Underground+Parking',
    },
    {
      name: 'Meitetsu Kyoso Parking Tsurumai',
      description: 'Meitetsu Kyoso Parking Tsurumai information',
      price: 'Check for rates',
      distance: 'Check for distance',
      website: 'https://mkp.jp/search/detail/004575-0/?utm_source=gbp&utm_medium=profile&utm_campaign=4575',
      mapsUrl: 'https://www.google.com/maps/search/Meitetsu+Kyoso+Parking+Tsurumai',
    },
  ],
  coinLockers: [
    {
      location: 'Inside JR Tsurumai Station',
      description: 'Coin lockers inside JR Tsurumai Station',
      price: 'Check for rates',
      distance: 'Check for distance',
      website: 'https://railway.jr-central.co.jp/station-guide/tokai/tsurumai/map.html',
      mapsUrl: 'https://www.google.com/maps/search/JR+Tsurumai+Station',
    },
    {
      location: 'Inside Subway Tsurumai Station',
      description: 'Coin lockers inside Subway Tsurumai Station',
      price: 'Check for rates',
      distance: 'Check for distance',
      website: 'https://www.kotsu.city.nagoya.jp/jp/pc/subway/station_top.html?name=%E9%B6%B4%E8%88%9E',
      mapsUrl: 'https://www.google.com/maps/search/Subway+Tsurumai+Station',
    },
  ],
  cafes: [
    {
      name: 'Starbucks AEON Town Chikusa',
      description: 'Starbucks AEON Town Chikusa, ideal for pre/post-show relaxation',
      distance: '10 min walk',
      website: 'https://store.starbucks.co.jp/detail-615/',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+AEON+Town+Chikusa',
    },
    {
      name: 'Komeda Coffee Tsurumai',
      description: 'Komeda Coffee originating from Nagoya. Famous for morning set',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Komeda+Coffee+Tsurumai',
    },
  ],
  nearbyRestaurants: [
    {
      name: 'Yabaton Yabacho Honten',
      cuisine: 'Miso Katsu',
      description: 'Super famous shop for Nagoya specialty miso katsu',
      distance: '10 min by subway',
      openTime: '11:00-22:00',
      price: '¥1,200-¥1,800',
      website: 'https://www.yabaton.com/',
      mapsUrl: 'https://www.google.com/maps/search/Yabaton+Yabacho',
      recommended: true,
      recommendComment: 'Must-try miso katsu in Nagoya! Yabaton is absolutely essential'
    },
    {
      name: 'Hitsumabushi Bincho',
      cuisine: 'Hitsumabushi',
      description: 'Famous shop for Nagoya specialty hitsumabushi',
      distance: '15 min by subway',
      openTime: '11:30-14:30, 5:00 PM-9:00 PM',
      price: '¥3,000-¥4,500',
      mapsUrl: 'https://www.google.com/maps/search/Hitsumabushi+Bincho+Nagoya',
      recommended: true,
      recommendComment: 'Eel hitsumabushi is a Nagoya gourmet representative! Enjoy 3 ways of eating'
    },
    {
      name: 'Furaibo Honten',
      cuisine: 'Chicken Wings',
      description: 'Birthplace of Nagoya specialty fried chicken wings. Spicy and fragrant',
      distance: '15 min by subway',
      openTime: '5:00 PM-11:00 PM',
      price: '¥2,000-¥3,500',
      website: 'https://www.furaibou.com/',
      mapsUrl: 'https://www.google.com/maps/search/Furaibo+Nagoya',
      recommended: true,
      recommendComment: 'Birthplace of chicken wings! Crispy texture and spicy seasoning are the best'
    },
    {
      name: 'Yamamotoya Sohonke',
      cuisine: 'Miso Nikomi Udon',
      description: 'Long-established shop for Nagoya specialty miso nikomi udon. Firm noodles are characteristic',
      distance: '20 min walk',
      openTime: '11:00-21:00',
      price: '¥1,200-¥1,800',
      website: 'https://www.yamamotoyasyoten.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Yamamotoya+Sohonke+Nagoya',
      recommended: true,
      recommendComment: 'Nagoya-meshi classic! Rich Hatcho miso flavor is addictive'
    },
    {
      name: 'Atsuta Horaiken Honten',
      cuisine: 'Hitsumabushi',
      description: 'Birthplace of hitsumabushi. Long-established shop with over 140 years of history',
      distance: '25 min by subway',
      openTime: '11:30-14:30, 4:30 PM-8:30 PM',
      price: '¥3,800-¥4,500',
      website: 'https://www.houraiken.com/',
      mapsUrl: 'https://www.google.com/maps/search/Atsuta+Horaiken+Nagoya',
      recommended: true,
      recommendComment: 'Famous birthplace of hitsumabushi! Worth the long wait'
    },
    {
      name: 'Komeda Coffee',
      cuisine: 'Cafe',
      description: 'Nagoya-born cafe chain. Famous for morning set and Shiro Noir',
      distance: '5 min walk',
      openTime: '7:00-23:00',
      price: '¥800-¥1,500',
      mapsUrl: 'https://www.google.com/maps/search/Komeda+Coffee+Tsurumai',
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Nagoya Sakae',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Sakae Station. Clean rooms and free breakfast',
      distance: '10 min by subway from Tsurumai',
      priceRange: '¥6,000-¥8,500 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near entertainment district'],
      website: 'https://www.toyoko-inn.com/search/detail/00020/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Nagoya+Sakae',
      recommended: true,
      recommendComment: 'Near Sakae entertainment district! Standard for Nagoya trips'
    },
    {
      name: 'Kaikatsu CLUB Nagoya Sakae',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '12 min by subway from Tsurumai',
      priceRange: '¥2,500-¥3,500 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours'],
      website: 'https://www.kaikatsu.jp/shop/nagoya-sakae/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Nagoya+Sakae',
      recommended: true,
      recommendComment: 'Best for budget! Close to Sakae entertainment district too'
    },
    {
      name: 'Capsule Hotel Nagoya',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna. Women-only floor available',
      distance: '5 min walk from Nagoya Station',
      priceRange: '¥3,500-¥5,000 per night',
      features: ['Large public bath', 'Sauna', 'Women-only floor', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Nagoya+Station'
    },
    {
      name: 'Hotel Route Inn Nagoya Sakae',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Breakfast buffet well-received',
      distance: '10 min by subway from Tsurumai',
      priceRange: '¥6,500-¥9,000 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=366',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Nagoya+Sakae'
    }
  ]
}

export default nagoya_kokaido_en
