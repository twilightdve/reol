import { Venue } from '../types'

export const okinawa_sakurazaka_en: Venue = {
  id: 'okinawa_sakurazaka',
  name: 'Naha Sakurazaka Central',
  date: '2026-04-29T18:00:00+09:00',
  times: { open: '5:00 PM', start: '6:00 PM' },
  location: { 
    prefecture: 'Okinawa', 
    city: 'Naha',
    address: '3-9-26 Makishi, Naha City, Okinawa',
    nearestStation: '7 min walk from Yui Rail Makishi Station'
  },
  capacity: 600,
  access: '7 min walk from Yui Rail Makishi Station. Walking distance from Kokusai Street.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14317.692227503761!2d127.690374!3d26.21544!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x34e5697a95ca8867%3A0xc70c1715755075b6!2z44Op44Kk44OW44OP44Km44K55qGc5Z2C44K744Oz44OI44Op44Or!5e0!3m2!1sja!2sus!4v1764561687483!5m2!1sja!2sus',
  venueWebsite: 'http://www.nahacentral.com/about.html',
  parkingInfo: 'No dedicated parking. Please use nearby paid parking lots. Yui Rail transportation recommended.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Naha Airport',
        method: 'Yui Rail (Monorail)',
        time: 'Approx. 15 minutes',
        description: 'Yui Rail from Naha Airport to Makishi Station → 7 min walk',
        cost: 'One-way ¥300',
        notes: 'Yui Rail runs every 10 minutes'
      }
    ],
    fromMainland: [
      {
        from: 'Tokyo',
        description: 'Many direct flights from Haneda/Narita to Naha Airport. Flight time approx. 2 hours 30 minutes',
        notes: 'Flight required from mainland Japan'
      },
      {
        from: 'Osaka',
        description: 'Direct flights from Kansai Int\'l/Itami to Naha Airport. Flight time approx. 2 hours',
        notes: 'Abundant LCC options from Kansai'
      },
      {
        from: 'Nagoya',
        description: 'Direct flights from Chubu Int\'l to Naha Airport. Flight time approx. 2 hours 15 minutes',
        notes: 'Convenient direct flights'
      }
    ],
    fromExpressBus: [
      {
        from: 'Nago/Urasoe',
        method: 'Express Bus',
        time: 'Approx. 2-3 hours',
        description: 'Express bus from northern Okinawa to Naha Bus Terminal. Operated by Ryukyu Bus',
        cost: 'One-way approx. ¥2,000',
        notes: 'Convenient for travel within Okinawa Island. Use monorail from Naha Bus Terminal'
      },
      {
        from: 'Ishigaki Island',
        method: 'Flight + Monorail',
        time: 'Approx. 1 hour 30 minutes',
        description: 'Flight from Ishigaki Airport to Naha Airport (approx. 1 hour) → Yui Rail to Makishi Station',
        cost: 'One-way approx. ¥10,000-¥20,000',
        notes: 'Access from remote islands. Multiple flights per day'
      }
    ],
    fromCar: [
      {
        from: 'Naha Airport',
        method: 'Route 331/Prefectural Route 29',
        time: 'Approx. 20 minutes',
        description: 'From Naha Airport via Route 331 → Prefectural Route 29 to downtown Naha. Multiple paid parking lots near venue.',
        cost: 'No highway toll',
        notes: 'Rental cars commonly used. Allow extra time as Naha downtown often congested'
      },
      {
        from: 'Northern Area',
        method: 'Okinawa Expressway',
        time: 'Approx. 1 hour 30 minutes',
        description: 'South on Okinawa Expressway, exit at Naha IC toward Naha city.',
        cost: 'Highway toll approx. ¥1,000 (Nago~Naha IC)',
        notes: 'Convenient access from northern Okinawa'
      }
    ],
    recommendations: 'Close - 15 min by Yui Rail from Naha Airport. Flights required from mainland. Convenient for sightseeing near Kokusai Street.'
  },
  parkingOptions: [
    {
      name: 'Times Naha Makishi',
      description: 'Parking lot in Makishi area',
      price: 'Check for rates',
      distance: '5 min walk',
      website: 'https://times-info.net/P47-okinawa/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Naha+Makishi',
    },
    {
      name: 'Kokusai Street Area Parking',
      description: 'Parking lots near Kokusai Street',
      price: 'Check for rates',
      distance: '10 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Kokusai+Street+parking',
    },
  ],
  coinLockers: [
    {
      location: 'Yui Rail Makishi Station',
      description: 'Coin lockers at Yui Rail Makishi Station',
      price: '¥300-¥500',
      distance: '7 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Yui+Rail+Makishi+Station',
    },
    {
      location: 'Kokusai Street Shopping Area',
      description: 'Coin lockers on Kokusai Street',
      price: 'Check for rates',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Kokusai+Street+coin+lockers',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Naha Kokusai Street',
      description: 'Starbucks on Kokusai Street',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Naha+Kokusai+Street',
    },
    {
      name: 'Tully\'s Coffee Naha',
      description: 'Tully\'s Coffee for pre/post-live rest',
      distance: '7 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Tullys+Coffee+Naha',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Kokusai Street',
      description: 'Okinawa\'s largest entertainment district. Lined with souvenir shops and restaurants',
      distance: '5 min walk',
      website: 'https://naha-kokusaidori.okinawa/'
    },
    {
      name: 'Makishi Public Market',
      description: 'Market with Okinawan ingredients. 2nd floor offers cooking service',
      distance: '10 min walk',
      website: 'https://kosetsu-ichiba.com/'
    },
    {
      name: 'Shuri Castle',
      description: 'World Heritage Ryukyu Kingdom castle. Viewable during restoration',
      distance: '15 min by Yui Rail',
      website: 'https://oki-park.jp/shurijo/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Jackie Steak House',
      cuisine: 'Steak',
      description: 'Symbol of Okinawa steak culture. Huge portions',
      distance: '8 min walk',
      openTime: '11:00-1:30 AM',
      price: '¥2,000-¥3,500',
      mapsUrl: 'https://www.google.com/maps/search/Jackie+Steak+House+Naha',
      recommended: true,
      recommendComment: 'Okinawa soul food! Thick steak and garlic rice are the best'
    },
    {
      name: 'Kokusai Street Yataimura',
      cuisine: 'Okinawan Cuisine',
      description: 'Food stall village on Kokusai Street. Diverse Okinawan cuisine shops gathered',
      distance: '10 min walk',
      openTime: '11:00-24:00 (varies by shop)',
      price: '¥1,000-¥2,500',
      website: 'https://www.okinawa-yatai.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Kokusai+Street+Yataimura+Naha',
      recommended: true,
      recommendComment: 'Sample various Okinawan dishes! Fun atmosphere too'
    },
    {
      name: 'Makishi Public Market 2F Dining',
      cuisine: 'Seafood',
      description: 'Ingredients bought on 1F can be cooked on 2F',
      distance: '10 min walk',
      openTime: '10:00-19:00',
      price: '¥2,000-¥4,000',
      website: 'https://kosetsu-ichiba.com/',
      mapsUrl: 'https://www.google.com/maps/search/Makishi+Public+Market',
    },
    {
      name: 'Joyful Naha',
      cuisine: 'Family Restaurant',
      description: 'Affordable meals. Convenient before/after live',
      distance: '5 min walk',
      openTime: '24 hours',
      price: '¥1,000-¥1,500',
      mapsUrl: 'https://www.google.com/maps/search/Joyful+Naha',
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Naha Asahibashi Ekimae',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Asahibashi Station. Clean rooms and free breakfast',
      distance: '3 min walk from Asahibashi Station',
      priceRange: '¥5,500-¥7,500 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near monorail station'],
      website: 'https://www.toyoko-inn.com/search/detail/00141/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Naha+Asahibashi',
      recommended: true,
      recommendComment: 'Near monorail for easy travel! Standard for Okinawa trips'
    },
    {
      name: 'Kaikatsu CLUB Naha Kokusai Street',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '5 min walk from Kenchomae Station',
      priceRange: '¥2,500-¥3,500 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours'],
      website: 'https://www.kaikatsu.jp/shop/naha-kokusaidori/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Naha+Kokusai+Street',
      recommended: true,
      recommendComment: 'Close to Kokusai Street! Perfect for budget stays'
    },
    {
      name: 'Capsule Hotel Naha',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna',
      distance: '7 min walk from Asahibashi Station',
      priceRange: '¥3,200-¥4,500 per night',
      features: ['Large public bath', 'Sauna', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Naha'
    },
    {
      name: 'Hotel Route Inn Naha Izumizaki',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Breakfast buffet well-received',
      distance: '8 min walk from Kenchomae Station',
      priceRange: '¥6,000-¥8,500 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=596',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Naha+Izumizaki'
    }
  ]
}

export default okinawa_sakurazaka_en
