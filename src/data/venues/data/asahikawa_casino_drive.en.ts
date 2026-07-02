import { Venue } from '../types'

export const asahikawa_casino_drive_en: Venue = {
  id: 'asahikawa_casino_drive',
  name: 'Asahikawa CASINO DRIVE',
  date: '2026-05-09T17:00:00+09:00',
  times: { open: '4:30 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Hokkaido', 
    city: 'Asahikawa',
    address: '8-chome, 3-jo-dori, Asahikawa City, Hokkaido',
    nearestStation: '15 min walk from JR Asahikawa Station'
  },
  capacity: 400,
  gradient: {
    from: '#4682B4',
    to: '#B0E0E6'
  },
  access: '【Train】15 min walk from JR Asahikawa Station. 【Bus】2 min walk from Dohoku Bus City Hall stop.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d11524.749527076094!2d142.36144!3d43.768969!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5f0ce6733730f9df%3A0xc6b3654c2342b63b!2sCASINO%20DRIVE!5e0!3m2!1sja!2sus!4v1764573939232!5m2!1sja!2sus',
  venueWebsite: 'https://www.casinodrive.info/',
  parkingInfo: 'No dedicated parking. Please use nearby paid parking lots.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Asahikawa Airport',
        method: 'Airport Bus',
        time: 'Approx. 35 minutes',
        description: 'Airport bus from Asahikawa Airport to JR Asahikawa Station → 10 min walk',
        cost: 'One-way ¥650',
        notes: 'Airport bus operates according to flight schedule'
      },
      {
        from: 'New Chitose Airport',
        method: 'JR Limited Express',
        time: 'Approx. 1 hour 30 minutes',
        description: 'Limited Express Kamui from New Chitose Airport Station to Asahikawa Station',
        cost: 'One-way approx. ¥6,000',
        notes: 'More convenient direct from airport than via Sapporo'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Flight Recommended',
        time: 'Approx. 8 hours (Shinkansen + Limited Express)',
        description: 'Shinkansen from Tokyo to Shin-Hakodate-Hokuto → Limited Express to Sapporo → Limited Express to Asahikawa. Flight more practical',
        cost: 'One-way ¥30,000+',
        notes: 'Direct flight from Haneda to Asahikawa Airport most efficient'
      },
      {
        from: 'Sapporo',
        method: 'JR Limited Express',
        time: 'Approx. 1 hour 30 minutes',
        description: 'Limited Express Kamui/Lilac from Sapporo Station to Asahikawa Station',
        cost: 'One-way approx. ¥4,500',
        notes: 'Operates approximately once per hour'
      }
    ],
    fromExpressBus: [
      {
        from: 'Sapporo',
        method: 'Express Bus',
        time: 'Approx. 2 hours',
        description: 'Express bus from Sapporo to Asahikawa',
        cost: 'One-way approx. ¥2,000',
        notes: 'Cheaper than limited express'
      }
    ],
    fromCar: [
      {
        from: 'Sapporo Area',
        method: 'Doo Expressway',
        time: 'Approx. 2 hours',
        description: 'North on Doo Expressway, exit at Asahikawa-Kita IC toward Asahikawa city. Paid parking available near venue.',
        cost: 'Highway toll approx. ¥3,000 (Sapporo~Asahikawa-Kita IC)',
        notes: 'Winter: beware of icy roads and snowstorms. Studded tires required'
      },
      {
        from: 'Obihiro Area',
        method: 'Doto Expressway',
        time: 'Approx. 3 hours',
        description: 'Via Doto Expressway to Asahikawa city.',
        cost: 'Highway toll approx. ¥4,500 (Obihiro~Asahikawa)',
        notes: 'Convenient from eastern Hokkaido. Beware of winter weather'
      }
    ],
    recommendations: '35 min bus from Asahikawa Airport. 1.5 hours by limited express from Sapporo. Central city of northern Hokkaido.'
  },
  parkingOptions: [
    {
      name: 'Times Asahikawa 3-jo-dori',
      description: 'Parking lot near venue',
      price: 'Check for rates',
      distance: '5 min walk',
      website: 'https://times-info.net/P01-hokkaido/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Asahikawa+3-jo-dori',
    },
    {
      name: 'Asahikawa Station Parking',
      description: 'Parking lot in front of JR Asahikawa Station',
      price: 'Check for rates',
      distance: '10 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Asahikawa+Station+parking',
    },
  ],
  coinLockers: [
    {
      location: 'JR Asahikawa Station',
      description: 'Coin lockers inside JR Asahikawa Station',
      price: '¥300-¥600',
      distance: '10 min walk',
      website: 'https://www.jrhokkaido.co.jp/network/station/station.html#4211',
      mapsUrl: 'https://www.google.com/maps/search/JR+Asahikawa+Station',
    },
    {
      location: '3-jo-dori Shopping District',
      description: 'Coin lockers in downtown area',
      price: 'Check for rates',
      distance: '3 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Asahikawa+3-jo-dori+coin+lockers',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Asahikawa Ekimae',
      description: 'Starbucks in front of Asahikawa Station',
      distance: '10 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Asahikawa+Station',
    },
    {
      name: 'Doutor Coffee Asahikawa',
      description: 'Doutor Coffee for pre/post-live rest',
      distance: '8 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Doutor+Coffee+Asahikawa',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Asahiyama Zoo',
      description: 'Zoo famous for behavioral exhibits. Penguin walks popular',
      distance: '40 min by bus',
      website: 'https://www.city.asahikawa.hokkaido.jp/asahiyamazoo/'
    },
    {
      name: 'Asahikawa Ramen Village',
      description: 'Collection of famous Asahikawa ramen shops',
      distance: '15 min by car',
      website: 'https://www.ramenmura.com/'
    },
    {
      name: 'Ueno Farm',
      description: 'One of Hokkaido Garden Highway attractions. Beautiful gardens',
      distance: '30 min by car',
      website: 'https://www.uenofarm.net/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Ramen Santoka',
      cuisine: 'Asahikawa Ramen',
      description: 'Famous Asahikawa ramen shop. Salt ramen popular',
      distance: '7 min walk',
      openTime: '11:00-21:00',
      price: '¥800-¥1,200',
      website: 'https://www.santouka.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Santoka+Asahikawa',
      recommended: true,
      recommendComment: 'Asahikawa ramen icon! Try both soy sauce and salt'
    },
    {
      name: 'Baikoken',
      cuisine: 'Asahikawa Ramen',
      description: 'Long-established Asahikawa ramen. Exquisite soy sauce ramen',
      distance: '10 min walk',
      openTime: '11:00-20:00',
      price: '¥800-¥1,000',
      mapsUrl: 'https://www.google.com/maps/search/Baikoken+Asahikawa',
      recommended: true,
      recommendComment: 'Original Asahikawa ramen! Rich soy sauce soup is signature'
    },
    {
      name: 'Genghis Khan Daikokuya',
      cuisine: 'Genghis Khan (Lamb BBQ)',
      description: 'Hokkaido specialty Genghis Khan. Charcoal grilled delicious',
      distance: '12 min walk',
      openTime: '17:00-23:00',
      price: '¥3,000-¥5,000',
      mapsUrl: 'https://www.google.com/maps/search/Genghis+Khan+Daikokuya+Asahikawa',
    },
    {
      name: 'Aoba',
      cuisine: 'Asahikawa Ramen',
      description: 'Famous Asahikawa ramen shop. Soy sauce ramen popular',
      distance: '9 min walk',
      openTime: '11:00-20:00',
      price: '¥750-¥1,000',
      mapsUrl: 'https://www.google.com/maps/search/Aoba+Asahikawa+ramen',
      recommended: true,
      recommendComment: 'Local favorite! Mapo tofu topping is exquisite'
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Asahikawa Ekimae',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Asahikawa Station. Clean rooms and free breakfast',
      distance: '3 min walk from Asahikawa Station',
      priceRange: '¥5,000-¥7,000 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.toyoko-inn.com/search/detail/00012/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Asahikawa+Ekimae',
      recommended: true,
      recommendComment: 'Near station, clean, free breakfast! Standard for Asahikawa trips'
    },
    {
      name: 'Kaikatsu CLUB Asahikawa',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '10 min by car from Asahikawa Station',
      priceRange: '¥2,000-¥3,000 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours', 'Free parking'],
      website: 'https://www.kaikatsu.jp/shop/asahikawa/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Asahikawa',
      recommended: true,
      recommendComment: 'Perfect for car trips! Free parking and budget-friendly'
    },
    {
      name: 'Capsule Hotel Asahikawa',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna',
      distance: '6 min walk from Asahikawa Station',
      priceRange: '¥3,000-¥4,000 per night',
      features: ['Large public bath', 'Sauna', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Asahikawa+Station'
    },
    {
      name: 'Hotel Route Inn Asahikawa Ekimae',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Breakfast buffet well-received',
      distance: '5 min walk from Asahikawa Station',
      priceRange: '¥5,500-¥8,000 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=20',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Asahikawa+Ekimae'
    }
  ]
}

export default asahikawa_casino_drive_en
