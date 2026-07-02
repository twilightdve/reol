import { Venue } from '../types'

export const nagano_junk_box_en: Venue = {
  id: 'nagano_junk_box',
  name: 'Nagano CLUB JUNK BOX',
  date: '2026-05-23T17:00:00+09:00',
  times: { open: '4:30 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Nagano', 
    city: 'Nagano',
    address: '1423 Minami Ishido-cho, Nagano City, Nagano',
    nearestStation: '10 min walk from JR Nagano Station'
  },
  capacity: 500,
  access: '【Train】10 min walk from JR Nagano Station Zenkoji Exit. Walk down Nagano Odori on right side, turn right at Minami-Chitosemachi-Minami intersection (MUFG Bank), go straight to white building 4F opposite JR bicycle parking. 【Car】20 min from Joshinetsu Expressway Suzaka-Nagano-Higashi IC, turn right at Nanase Post Office intersection, go under JR overpass and turn left, turn left at Minami-Chitosemachi-Minami intersection.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12804.977539789488!2d138.189812!3d36.644571!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601d86ecf9e91009%3A0x5ad5e487adde8e7a!2sNAGANO%20CLUB%20JUNK%20BOX!5e0!3m2!1sja!2sus!4v1764574251248!5m2!1sja!2sus',
  venueWebsite: 'http://www.junkbox.co.jp/nagano/sp/info.html',
  parkingInfo: 'No dedicated parking. Please use nearby paid parking lots.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Narita/Haneda Airport',
        method: 'Train',
        time: 'Approx. 3-4 hours',
        description: 'Hokuriku Shinkansen from airport via Tokyo Station',
        cost: 'One-way approx. ¥12,000',
        notes: 'Use Shinkansen from airport to Nagano'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Hokuriku Shinkansen',
        time: 'Approx. 1 hour 30 minutes',
        description: 'Hokuriku Shinkansen Kagayaki from Tokyo Station to Nagano Station',
        cost: 'One-way approx. ¥8,200',
        notes: 'Fastest train approx. 80 minutes'
      },
      {
        from: 'Osaka',
        method: 'Shinkansen Transfer',
        time: 'Approx. 4 hours',
        description: 'Tokaido Shinkansen from Shin-Osaka to Tokyo → Hokuriku Shinkansen to Nagano',
        cost: 'One-way approx. ¥18,000',
        notes: 'Transfer at Tokyo Station'
      },
      {
        from: 'Nagoya',
        method: 'Limited Express Shinano',
        time: 'Approx. 3 hours',
        description: 'Limited Express Shinano from Nagoya Station to Nagano Station',
        cost: 'One-way ¥6,900',
        notes: 'Via Chuo Line. Beautiful scenery'
      },
      {
        from: 'Kanazawa',
        method: 'Hokuriku Shinkansen',
        time: 'Approx. 1 hour',
        description: 'Hokuriku Shinkansen Hakutaka from Kanazawa Station to Nagano Station',
        cost: 'One-way ¥6,380',
        notes: 'Good access from Hokuriku area too'
      }
    ],
    fromExpressBus: [
      {
        from: 'Tokyo/Shinjuku',
        method: 'Express Bus',
        time: 'Approx. 3 hours 30 minutes',
        description: 'Express bus from Shinjuku/Tokyo to Nagano Station',
        cost: 'One-way approx. ¥3,000',
        notes: 'Cheaper than Shinkansen'
      }
    ],
    fromCar: [
      {
        from: 'Tokyo Area',
        method: 'Chuo/Nagano Expressway',
        time: 'Approx. 3 hours',
        description: 'Via Chuo Expressway → Nagano Expressway, exit at Nagano IC toward Nagano city. Paid parking available near venue.',
        cost: 'Highway toll approx. ¥5,500 (Tokyo~Nagano IC)',
        notes: 'Winter: possible icy roads. Studded tires recommended'
      },
      {
        from: 'Nagoya Area',
        method: 'Chuo Expressway',
        time: 'Approx. 3 hours 30 minutes',
        description: 'Via Chuo Expressway, exit at Nagano IC toward Nagano city.',
        cost: 'Highway toll approx. ¥6,000 (Nagoya~Nagano IC)',
        notes: 'Convenient access from Chubu region'
      }
    ],
    recommendations: '1.5 hours from Tokyo by Hokuriku Shinkansen. Limited Express Shinano also convenient from Nagoya. Combine with Zenkoji Temple visit.'
  },
  parkingOptions: [
    {
      name: 'Times Nagano Gondo',
      description: 'Parking lot in Gondo area',
      price: 'Check for rates',
      distance: '5 min walk',
      website: 'https://times-info.net/P20-nagano/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Nagano+Gondo',
    },
    {
      name: 'Nagano Station Area Parking',
      description: 'Parking near Nagano Station',
      price: 'Check for rates',
      distance: '10 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Nagano+Station+parking',
    },
  ],
  coinLockers: [
    {
      location: 'JR Nagano Station',
      description: 'Coin lockers inside JR Nagano Station',
      price: '¥300-¥600',
      distance: '10 min walk',
      website: 'https://www.jreast.co.jp/estation/stations/474.html',
      mapsUrl: 'https://www.google.com/maps/search/JR+Nagano+Station',
    },
    {
      location: 'Gondo Arcade',
      description: 'Coin lockers in Gondo Arcade',
      price: 'Check for rates',
      distance: '2 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Gondo+Arcade+coin+lockers',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Nagano Ekimae',
      description: 'Starbucks in front of Nagano Station',
      distance: '10 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Nagano+Station',
    },
    {
      name: 'Doutor Coffee Nagano',
      description: 'Doutor Coffee for pre/post-live rest',
      distance: '8 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Doutor+Coffee+Nagano',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Zenkoji Temple',
      description: 'Ancient temple with National Treasure main hall. "Visit Zenkoji once in a lifetime"',
      distance: '20 min walk',
      website: 'https://www.zenkoji.jp/'
    },
    {
      name: 'Gondo Arcade',
      description: 'Nagano\'s entertainment district. Lined with restaurants and shops',
      distance: 'Immediate area',
      website: 'https://gondo-shotengai.com/'
    },
    {
      name: 'Nagano Olympic Stadium',
      description: '1998 Nagano Olympics opening ceremony venue',
      distance: '20 min by bus',
      website: 'https://www.nagano-olympicstadium.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Fujikian',
      cuisine: 'Soba',
      description: 'Famous Shinshu soba shop. Exquisite 100% buckwheat soba',
      distance: '12 min walk',
      openTime: '11:00-15:00, 17:00-20:00',
      price: '¥1,000-¥1,800',
      mapsUrl: 'https://www.google.com/maps/search/Fujikian+Nagano',
      recommended: true,
      recommendComment: 'Must-try Shinshu soba in Nagano! Fragrant 100% buckwheat soba is the best'
    },
    {
      name: 'THE FUJIYA GOHONJIN',
      cuisine: 'Western/Italian',
      description: 'Restaurant in renovated historical building near Zenkoji temple. Italian using Shinshu ingredients',
      distance: '15 min walk',
      openTime: '11:30-14:00, 17:30-22:00',
      price: '¥3,000-¥8,000',
      website: 'https://www.thefujiyagohonjin.com/',
      mapsUrl: 'https://www.google.com/maps/search/THE+FUJIYA+GOHONJIN+Nagano',
      recommended: true,
      recommendComment: 'Italian using Shinshu ingredients in a historic building! Amazing atmosphere'
    },
    {
      name: 'Meijitei Nagano Ekimae',
      cuisine: 'Sauce Katsu-don',
      description: 'Popular Shinshu specialty sauce katsu-don restaurant. Thick-cut pork cutlet is signature',
      distance: '10 min walk',
      openTime: '11:00-20:30',
      price: '¥1,200-¥1,800',
      website: 'https://www.meijitei.com/',
      mapsUrl: 'https://www.google.com/maps/search/Meijitei+Nagano+Station',
      recommended: true,
      recommendComment: 'Shinshu specialty sauce katsu-don! Thick, crispy cutlet is the best'
    },
    {
      name: 'Chikufudo Zenkoji Daimon',
      cuisine: 'Chestnut Okowa',
      description: 'Long-established Obuse specialty shop. Famous for chestnut okowa (chestnut rice) and chestnut sweets',
      distance: '12 min walk',
      openTime: '10:00-18:00',
      price: '¥800-¥1,500',
      website: 'https://chikufudo.com/',
      mapsUrl: 'https://www.google.com/maps/search/Chikufudo+Zenkoji+Nagano',
      recommended: true,
      recommendComment: 'Nagano souvenir staple! Warm chestnut okowa is delicious'
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Nagano Ekimae',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Nagano Station. Clean rooms and free breakfast',
      distance: '3 min walk from Nagano Station',
      priceRange: '¥5,000-¥7,000 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.toyoko-inn.com/search/detail/00034/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Nagano+Ekimae',
      recommended: true,
      recommendComment: 'Near station, clean, free breakfast! Standard for Nagano trips'
    },
    {
      name: 'Kaikatsu CLUB Nagano',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '10 min by car from Nagano Station',
      priceRange: '¥2,000-¥3,000 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours', 'Free parking'],
      website: 'https://www.kaikatsu.jp/shop/nagano/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Nagano',
      recommended: true,
      recommendComment: 'Perfect for car trips! Free parking and budget-friendly'
    },
    {
      name: 'Capsule Hotel Nagano',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna',
      distance: '6 min walk from Nagano Station',
      priceRange: '¥3,000-¥4,000 per night',
      features: ['Large public bath', 'Sauna', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Nagano+Station'
    },
    {
      name: 'Hotel Route Inn Nagano',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Breakfast buffet well-received',
      distance: '6 min walk from Nagano Station',
      priceRange: '¥5,500-¥8,000 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=91',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Nagano'
    }
  ]
}

export default nagano_junk_box_en
