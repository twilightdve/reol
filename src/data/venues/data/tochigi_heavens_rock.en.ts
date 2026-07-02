import { Venue } from '../types'

export const tochigi_heavens_rock_en: Venue = {
  id: 'tochigi_heavens_rock',
  name: "HEAVEN'S ROCK UTSUNOMIYA VJ-2",
  date: '2026-03-14T18:00:00+09:00',
  times: { open: '5:00 PM', start: '6:00 PM' },
  location: { 
    prefecture: 'Tochigi', 
    city: 'Utsunomiya',
    address: '5-33 Miyazonocho, Utsunomiya, Tochigi (Tobu Utsunomiya West Exit Building B1F)',
    nearestStation: '1 min walk from Tobu-Utsunomiya Station'
  },
  capacity: 400,
  access: 'Take JR from Tokyo area. Get off at JR Utsunomiya Station West Exit, take a bus from bus terminal platforms 1/6/7/11/12/13/14 to "Tobu Ekimae". Walk straight in the direction of travel, turn left at "Ikegamicho Intersection", and head toward the green pedestrian bridge ahead. The building with a green "VJ-2" sign is on the left, almost directly under the pedestrian bridge.',
  venueWebsite: 'https://www.heavensrock.com/utsunomiya/access/',
  parkingInfo: 'No dedicated parking. Multiple paid parking lots available nearby.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Haneda Airport',
        method: 'Limousine Bus',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Limousine bus service operates from Haneda Airport to Utsunomiya Station West Exit. About 4-5 buses per day. After arriving at JR Utsunomiya Station, transfer to Tobu Utsunomiya Line to Miyazonocho Station (approx. 5 min), or walk 28 min.',
        cost: 'One-way approx. ¥3,000 + Tobu Line ¥160',
        notes: 'Advance reservation recommended. Use train route if bus is full'
      },
      {
        from: 'Haneda Airport',
        method: 'Train (via Tokyo Station)',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Haneda Airport → (Keikyu/Yamanote Line) → Tokyo Station → (Tohoku Shinkansen) → Utsunomiya Station. Comfortable and reliable via Shinkansen.',
        cost: 'One-way approx. ¥5,500 (unreserved seat)',
        notes: 'Yamabiko and Nasuno Shinkansen stop here. 2-3 trains per hour'
      },
      {
        from: 'Narita Airport',
        method: 'Train (via Tokyo Station)',
        time: 'Approx. 3 hours',
        description: 'Narita Airport → (Narita Express) → Tokyo Station → (Tohoku Shinkansen) → Utsunomiya Station',
        cost: 'One-way approx. ¥6,500',
        notes: 'Pay attention to transfer time between Narita Express and Shinkansen'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo Station',
        method: 'Tohoku Shinkansen',
        time: 'Approx. 50 minutes',
        description: 'Take Tohoku Shinkansen "Nasuno" or "Yamabiko" from Tokyo Station to Utsunomiya Station. 28 min walk from Utsunomiya Station West Exit.',
        cost: 'One-way approx. ¥4,000 (unreserved seat)',
        notes: '2-3 trains per hour. Reserved seat +¥530'
      },
      {
        from: 'Omiya Station',
        method: 'Tohoku Shinkansen',
        time: 'Approx. 30 minutes',
        description: 'Take Tohoku Shinkansen from Omiya Station to Utsunomiya Station. Convenient access from Saitama area.',
        cost: 'One-way approx. ¥2,500 (unreserved seat)',
        notes: 'All Shinkansen from Tokyo stop at Omiya Station'
      }
    ],
    fromExpressBus: [
      {
        from: 'Shinjuku/Ikebukuro',
        method: 'Express Bus',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Frequent express bus service from Shinjuku/Ikebukuro to Utsunomiya Station. Operated by JR Bus Kanto and Tono Kotsu.',
        cost: 'One-way approx. ¥2,000',
        notes: 'May be affected by traffic. Allow extra time'
      }
    ],
    fromCar: [
      {
        from: 'Tokyo Area',
        method: 'Tohoku Expressway',
        time: 'Approx. 1 hour 30 minutes',
        description: 'Take Tohoku Expressway north, exit at Kanuma IC or Utsunomiya IC toward JR Utsunomiya Station area. Multiple paid parking lots available around the station.',
        cost: 'Highway toll approx. ¥2,500 (Tokyo~Utsunomiya IC)',
        notes: 'Possible traffic on weekends/holidays. Check parking availability in advance'
      },
      {
        from: 'Sendai Area',
        method: 'Tohoku Expressway',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Take Tohoku Expressway south, exit at Utsunomiya IC toward JR Utsunomiya Station area.',
        cost: 'Highway toll approx. ¥4,500 (Sendai~Utsunomiya IC)',
        notes: 'Long-distance driving - take breaks as needed'
      }
    ],
    recommendations: 'Shinkansen is fastest and most reliable from Kanto region. Haneda Airport route recommended for long-distance travelers. Bus is economical but carries traffic risk.'
  },
  parkingOptions: [
    {
      name: 'TOBU PARK Tobu Utsunomiya Station No.2 Parking Lot',
      description: 'Closest parking to the venue. Located in front of Tobu Utsunomiya Station with excellent access.',
      price: '¥100/30min (8:00-21:00), ¥100/60min (21:00-8:00). Daytime max (Weekdays) ¥1,000 (Weekends/Holidays) ¥1,200, Nighttime max ¥600',
      distance: '2 min walk to venue',
      address: '21 parking spaces',
      recommended: true,
      recommendComment: 'Closest to venue with reasonable rates',
    },
    {
      name: 'TOBU PARK Utsunomiya No.7 Parking Lot',
      description: 'Parking lot near Tobu Utsunomiya Station. Good access from the station.',
      price: '¥100/30min (7:00-19:00), ¥200/60min (19:00-7:00). 12 hours max (Weekdays) ¥1,000 (Weekends/Holidays) ¥1,200, Nighttime max ¥800',
      distance: '3 min walk to venue',
      address: '19 parking spaces',
    },
    {
      name: 'Times Tobu Utsunomiya Station Front',
      description: '24-hour parking lot. Better rates during nighttime.',
      price: '¥200/40min. 24 hours max ¥800 (17:00-9:00 max ¥500)',
      distance: '2 min walk to venue',
      address: '14 parking spaces',
    },
  ],
  coinLockers: [
    {
      location: 'JR Utsunomiya Station (Inside Ticket Gate)',
      description: 'Coin lockers inside JR Utsunomiya Station ticket gate',
      price: 'Check for rates',
      distance: 'Check for distance',
      website: 'https://www.jreast.co.jp/estation/stations/248.html',
    },
    {
      location: 'JR Utsunomiya Station (Outside Ticket Gate)',
      description: 'Coin lockers outside JR Utsunomiya Station ticket gate',
      price: 'Check for rates',
      distance: 'Check for distance',
      website: 'https://www.jreast.co.jp/estation/stations/248.html',
      mapsUrl: 'https://www.google.com/maps/search/JR+Utsunomiya+Station+coin+locker',
    },
    {
      location: 'Utsunomiya PASEO',
      description: 'Coin lockers inside Utsunomiya PASEO shopping mall',
      price: 'Check for rates',
      distance: 'Check for distance',
      website: 'https://www.utsunomiya-sk.com/paseo/floor/',
    },
    {
      location: 'tonarié Utsunomiya',
      description: 'Coin lockers at tonarié Utsunomiya shopping complex',
      price: 'Check for rates',
      distance: 'Check for distance',
      website: 'https://tonarie.jp/utsunomiya/',
      mapsUrl: 'https://www.google.com/maps/search/tonarié+Utsunomiya',
    },
    {
      location: 'Tobu Utsunomiya Station',
      description: 'Coin lockers inside Tobu Utsunomiya Station',
      price: 'Check for rates',
      distance: 'Check for distance',
      website: 'https://www.tobu.co.jp/railway/guide/station/insidemap/4112/',
      mapsUrl: 'https://www.google.com/maps/search/Tobu+Utsunomiya+Station',
    },
  ],
  cafes: [
    {
      name: 'Starbucks PASEO Utsunomiya',
      description: 'Perfect for relaxing before/after the concert at Starbucks PASEO Utsunomiya',
      distance: 'Check for distance',
      website: 'https://store.starbucks.co.jp/detail-522/',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Utsunomiya+PASEO',
    },
    {
      name: 'Komeda Coffee Utsunomiya Ekihigashi',
      description: 'Perfect for relaxing before/after the concert at Komeda Coffee Utsunomiya Ekihigashi',
      distance: 'Check for distance',
      website: 'https://www.komeda.co.jp/shop/detail.html?id=1053',
      mapsUrl: 'https://www.google.com/maps/search/Komeda+Coffee+Utsunomiya+Ekihigashi',
    },
    {
      name: "TULLY'S COFFEE Utsunomiya",
      description: "Perfect for relaxing before/after the concert at TULLY'S COFFEE Utsunomiya",
      distance: 'Check for distance',
      website: 'https://shop.tullys.co.jp/detail/1920773',
      mapsUrl: 'https://www.google.com/maps/search/Tullys+Coffee+Utsunomiya',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Utsunomiya Gyoza Street',
      description: 'A street lined with famous Utsunomiya gyoza restaurants. A mecca for local gourmet food',
      distance: '5 min walk'
    },
    {
      name: 'Utsunomiya Castle Ruins Park',
      description: 'Historical park built on the ruins of Utsunomiya Castle. Also famous for cherry blossoms',
      distance: '15 min walk',
      website: 'https://www.city.utsunomiya.tochigi.jp/shisetsu/kouen/1007909.html'
    },
    {
      name: 'Utsunomiya Museum of Art',
      description: 'Wide collection from contemporary to classical art. A place for quiet contemplation',
      distance: '20 min by bus'
    },
    {
      name: 'Oya History Museum',
      description: 'Mystical underground space utilizing old Oya stone quarry site',
      distance: '30 min by bus',
      website: 'https://www.oya909.co.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Gyoza no Masashi Miyajima Main Store',
      cuisine: 'Gyoza',
      description: 'Long-established Utsunomiya gyoza restaurant. Simple menu of grilled and boiled gyoza only is popular',
      distance: '8 min walk',
      openTime: '11:30-19:30',
      price: 'Gyoza from ¥240 per plate',
      website: 'https://tabelog.com/tochigi/A0901/A090101/9000046/',
      mapsUrl: 'https://www.google.com/maps/search/Gyoza+no+Masashi+Miyajima+Utsunomiya',
      recommended: true,
      recommendComment: 'A must-try when in Utsunomiya! Simple and delicious classic gyoza'
    },
    {
      name: 'Minmin Main Store',
      cuisine: 'Gyoza',
      description: 'Representative of Utsunomiya gyoza. Chewy skin is the signature feature',
      distance: '10 min walk',
      openTime: '11:30-20:00',
      price: 'Gyoza from ¥250 per plate',
      website: 'https://tabelog.com/tochigi/A0901/A090101/9000045/',
      mapsUrl: 'https://www.google.com/maps/search/Minmin+Main+Store+Utsunomiya',
      recommended: true,
      recommendComment: 'Always crowded! The chewy skin is addictive'
    },
    {
      name: 'Kirasse Main Store',
      cuisine: 'Gyoza',
      description: 'Permanent Utsunomiya gyoza hall. A gyoza theme park where famous local restaurants gather',
      distance: '12 min walk',
      openTime: '11:00-20:00',
      price: '3 types gyoza set from ¥900',
      website: 'https://www.gyozakai.com/kirasse/',
      mapsUrl: 'https://www.google.com/maps/search/Kirasse+Utsunomiya',
      recommended: true,
      recommendComment: 'Compare gyoza from multiple restaurants at once! Perfect introduction to Utsunomiya gyoza'
    },
    {
      name: 'Miya Cafe',
      cuisine: 'Tochigi Wagyu',
      description: 'Local cafe popular for luxurious hamburgers and steaks using Tochigi Wagyu beef',
      distance: '8 min walk',
      openTime: '11:30-22:00',
      price: '¥1,500 - ¥3,000',
      mapsUrl: 'https://www.google.com/maps/search/Miya+Cafe+Utsunomiya',
      recommended: true,
      recommendComment: 'Savor the flavor of Tochigi Wagyu! Exquisite dishes using local ingredients'
    },
    {
      name: 'Uobei Utsunomiya Ekihigashi',
      cuisine: 'Conveyor Belt Sushi',
      description: 'Conveyor belt sushi where you can enjoy Tochigi local fish. Pride in fresh ingredients',
      distance: '7 min walk',
      openTime: '11:00-22:00',
      price: '¥1,000 - ¥2,500',
      website: 'https://www.akindo-sushiro.co.jp/uobei/',
      mapsUrl: 'https://www.google.com/maps/search/Uobei+Utsunomiya+Ekihigashi'
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Utsunomiya Ekimae',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from station. Good value with free breakfast',
      distance: '3 min walk',
      priceRange: '¥5,000 - ¥7,000',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.toyoko-inn.com/search/detail/00050/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Utsunomiya+Ekimae',
      recommended: true,
      recommendComment: 'Near station, clean, free breakfast is a plus! A go-to hotel for fandom activities'
    },
    {
      name: 'APA Hotel Utsunomiya Ekimae',
      type: 'ビジネスホテル',
      description: 'Large public bath to relax. Within walking distance to venue',
      distance: '5 min walk',
      priceRange: '¥5,500 - ¥8,000',
      features: ['Large public bath', 'Free Wi-Fi', 'Convenience store on-site'],
      website: 'https://www.apahotel.com/hotel/shutoken/utsunomiya-ekimae/',
      mapsUrl: 'https://www.google.com/maps/search/APA+Hotel+Utsunomiya+Ekimae'
    },
    {
      name: 'Kaikatsu CLUB Utsunomiya',
      type: 'ネットカフェ',
      description: 'Shower and unlimited manga. Budget-friendly with night pack rates',
      distance: '10 min by car',
      priceRange: '¥2,500 - ¥3,500 (Night Pack)',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga'],
      website: 'https://www.kaikatsu.jp/shop/detail/20185',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Utsunomiya',
      recommended: true,
      recommendComment: 'Perfect for budget travelers! Relax in a private room'
    },
    {
      name: 'Capsule Inn Utsunomiya',
      type: 'カプセルホテル',
      description: 'Budget-friendly near station. Large public bath and sauna for recovery',
      distance: '8 min walk',
      priceRange: '¥3,000 - ¥4,000',
      features: ['Large public bath', 'Sauna', 'Lockers available'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Utsunomiya+Station'
    }
  ]
}

export default tochigi_heavens_rock_en
