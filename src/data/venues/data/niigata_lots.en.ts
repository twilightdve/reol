import { Venue } from '../types'

export const niigata_lots_en: Venue = {
  id: 'niigata_lots',
  name: 'Niigata LOTS',
  date: '2026-05-24T17:00:00+09:00',
  times: { open: '4:00 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Niigata', 
    city: 'Niigata',
    address: '6-953-1 Furumachidori, Chuo-ku, Niigata City, Niigata',
    nearestStation: '15 min by bus from JR Niigata Station'
  },
  capacity: 450,
  access: '【Train/Walk】15 min walk from JR Niigata Station. 【Bus】From JR Niigata Station Bus Terminal Platform 10, take Uesho Line to Unison Plaza/Meike Atago, get off at "Niigata LOTS Bus Stop" (7 min). For highway buses, get off at Bandai City Bus Center, 8 min walk. 【Car】From Niigata-Nishi IC ~ Niigata Bypass ~ toward Niigata city ~ exit at Niigata Bypass Sakuragi IC.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12590.125659419535!2d139.046599!3d37.918014!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff4c996145e5881%3A0xdd0292b911355ae7!2z5paw5r2f77ys77yv77y077yz!5e0!3m2!1sja!2sus!4v1764574654178!5m2!1sja!2sus',
  venueWebsite: 'https://www.fmniigata.com/lots/access',
  parkingInfo: 'No dedicated parking. Please use nearby paid parking lots.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Niigata Airport',
        method: 'Airport Bus',
        time: 'Approx. 25 minutes',
        description: 'Airport bus from Niigata Airport to JR Niigata Station → Bus or taxi to Furumachi from Niigata Station',
        cost: 'One-way ¥420 (Airport→Niigata Station)',
        notes: 'Airport bus runs every 20-30 minutes'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Joetsu Shinkansen',
        time: 'Approx. 2 hours',
        description: 'Joetsu Shinkansen Toki/Max Toki from Tokyo Station to Niigata Station',
        cost: 'One-way approx. ¥10,500',
        notes: 'Fastest train approx. 1 hour 40 minutes'
      },
      {
        from: 'Osaka',
        method: 'Limited Express/Shinkansen',
        time: 'Approx. 5 hours',
        description: 'Limited Express Thunderbird from Osaka to Kanazawa → Hokuriku Shinkansen to Nagano → Joetsu Shinkansen to Niigata',
        cost: 'One-way approx. ¥15,000',
        notes: 'Multiple transfers required'
      },
      {
        from: 'Nagoya',
        method: 'Limited Express/Shinkansen',
        time: 'Approx. 4 hours 30 minutes',
        description: 'Limited Express Shinano from Nagoya to Nagano → Joetsu Shinkansen to Niigata',
        cost: 'One-way approx. ¥12,000',
        notes: 'Transfer at Nagano'
      }
    ],
    fromExpressBus: [
      {
        from: 'Tokyo',
        method: 'Overnight Express Bus',
        time: 'Approx. 6 hours',
        description: 'Overnight bus from Tokyo Station to Niigata Station',
        cost: 'One-way approx. ¥5,000',
        notes: 'Departs previous night, arrives next morning. Economical option'
      },
      {
        from: 'Nagano',
        method: 'Express Bus',
        time: 'Approx. 3 hours',
        description: 'Express bus from Nagano Station to Niigata Station',
        cost: 'One-way approx. ¥3,500',
        notes: 'Convenient for travel between Shinetsu regions'
      }
    ],
    fromCar: [
      {
        from: 'Tokyo Area',
        method: 'Kan-etsu Expressway',
        time: 'Approx. 4 hours',
        description: 'North on Kan-etsu Expressway, exit at Niigata-Nishi IC or Niigata-Chuo IC toward Niigata city. Multiple paid parking lots near venue.',
        cost: 'Highway toll approx. ¥6,500 (Tokyo~Niigata-Nishi IC)',
        notes: 'Winter: beware of icy roads and snow. Studded tires required'
      },
      {
        from: 'Nagano Area',
        method: 'Joshinetsu Expressway',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Via Joshinetsu Expressway to Niigata city.',
        cost: 'Highway toll approx. ¥4,000 (Nagano~Niigata)',
        notes: 'Convenient access from Shinetsu region'
      }
    ],
    recommendations: 'Most convenient via Joetsu Shinkansen from Tokyo. Niigata Airport also has good access to city.'
  },
  parkingOptions: [
    {
      name: 'Parking Furumachi',
      description: 'Parking near Furumachidori',
      price: 'Check for rates',
      distance: '3 min walk',
      mapsUrl: 'https://www.google.com/maps/search/parking+Furumachi+Niigata',
    },
    {
      name: 'Times Niigata Furumachi',
      description: 'Times parking lot',
      price: 'Check for rates',
      distance: '5 min walk',
      website: 'https://times-info.net/P15-niigata/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Niigata+Furumachi',
    },
  ],
  coinLockers: [
    {
      location: 'JR Niigata Station',
      description: 'Coin lockers inside JR Niigata Station',
      price: '¥300-¥600',
      distance: '15 min by bus',
      website: 'https://www.jreast.co.jp/estation/stations/1345.html',
      mapsUrl: 'https://www.google.com/maps/search/JR+Niigata+Station',
    },
    {
      location: 'Furumachi Shopping Street',
      description: 'Coin lockers in Furumachi Shopping Street',
      price: 'Check for rates',
      distance: '2 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Furumachi+Shopping+Street+coin+lockers',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Niigata Furumachi',
      description: 'Starbucks on Furumachidori',
      distance: '3 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Niigata+Furumachi',
    },
    {
      name: 'Tully\'s Coffee Niigata Furumachi',
      description: 'Tully\'s in Furumachi area',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Tullys+Coffee+Niigata+Furumachi',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Furumachidori Shopping Street',
      description: 'Niigata\'s entertainment district. Long-established to new shops',
      distance: '1 min walk',
      website: 'https://www.furumachi-ichiba.com/'
    },
    {
      name: 'Befco Bakauke Observatory',
      description: 'Observatory on 31st floor of Toki Messe. Panoramic view of Sea of Japan and Niigata city',
      distance: '20 min by bus',
      website: 'https://www.hotelnikkoniigata.jp/observatory/'
    },
    {
      name: 'Niigata City History Museum Minatopia',
      description: 'Museum to learn about Niigata history and culture',
      distance: '15 min by bus',
      website: 'https://www.nchm.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Senzushi Marui',
      cuisine: 'Sushi',
      description: 'Popular sushi restaurant near Niigata Station. Proud of fresh Sea of Japan seafood',
      distance: '5 min walk',
      openTime: '11:00-22:00',
      price: '¥2,000-¥4,000',
      mapsUrl: 'https://www.google.com/maps/search/Marui+Sushi+Niigata+Station',
      recommended: true,
      recommendComment: 'Sea of Japan fresh fish is exquisite! Must-try nodoguro and sweet shrimp'
    },
    {
      name: 'Bus Center Curry (Bandai Soba)',
      cuisine: 'Curry',
      description: 'Legendary Niigata curry. Famous shop that Reol and yama have also eaten at',
      distance: '15 min walk (inside Niigata Station Bandai Exit Bus Terminal)',
      openTime: '8:00-19:00',
      price: '¥500-¥650',
      website: 'https://www.nvcb.or.jp/topics/bandaisoba',
      mapsUrl: 'https://www.google.com/maps/search/Bandai+Soba+Niigata+Station',
      recommended: true,
      recommendComment: 'Super famous Niigata curry that Reol and yama have eaten! Nostalgic Bus Center Curry is Niigata soul food'
    },
    {
      name: 'Echigo Nagaoka Kojimaya CoCoLo Niigata',
      cuisine: 'Hegisoba',
      description: 'Famous Niigata specialty hegisoba restaurant. Smooth texture from seaweed binder is signature',
      distance: '5 min walk (inside station building)',
      openTime: '11:00-21:00',
      price: '¥1,000-¥1,800',
      website: 'https://www.nagaokakojimaya.com/',
      mapsUrl: 'https://www.google.com/maps/search/Kojimaya+CoCoLo+Niigata',
      recommended: true,
      recommendComment: 'Must-try hegisoba in Niigata! Unique texture using seaweed as binder'
    },
    {
      name: 'Italian Mikazuki',
      cuisine: 'B-grade Gourmet',
      description: 'Birthplace of Niigata soul food "Italian"',
      distance: '10 min walk',
      openTime: '10:00-20:00',
      price: '¥500-¥800',
      mapsUrl: 'https://www.google.com/maps/search/Mikazuki+Niigata',
    },
    {
      name: 'Tonkatsu Taro',
      cuisine: 'Tare-katsu',
      description: 'Famous shop for Niigata specialty tare-katsu don',
      distance: '6 min walk',
      openTime: '11:00-20:00',
      price: '¥900-¥1,500',
      mapsUrl: 'https://www.google.com/maps/search/Tare-katsu+Niigata+Furumachi',
      recommended: true,
      recommendComment: 'Niigata soul food! Sweet-savory sauce pairs perfectly with cutlet'
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Niigata Ekimae',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Niigata Station. Clean rooms and free breakfast',
      distance: '3 min walk from Niigata Station',
      priceRange: '¥5,000-¥7,000 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.toyoko-inn.com/search/detail/00017/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Niigata+Ekimae',
      recommended: true,
      recommendComment: 'Near station, clean, free breakfast! Standard for Niigata trips'
    },
    {
      name: 'Kaikatsu CLUB Niigata Ekimae',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '5 min walk from Niigata Station',
      priceRange: '¥2,200-¥3,200 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours'],
      website: 'https://www.kaikatsu.jp/shop/niigata-ekimae/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Niigata+Ekimae',
      recommended: true,
      recommendComment: 'Best for budget! Close to station'
    },
    {
      name: 'Capsule Hotel Niigata',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna',
      distance: '8 min walk from Niigata Station',
      priceRange: '¥3,000-¥4,000 per night',
      features: ['Large public bath', 'Sauna', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Niigata+Station'
    },
    {
      name: 'Hotel Route Inn Niigata Ekimae',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Breakfast buffet well-received',
      distance: '6 min walk from Niigata Station',
      priceRange: '¥5,500-¥8,000 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=45',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Niigata+Ekimae'
    }
  ]
}

export default niigata_lots_en
