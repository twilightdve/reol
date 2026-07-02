import { Venue } from '../types'

export const nagasaki_drum_be7_en: Venue = {
  id: 'nagasaki_drum_be7',
  name: 'Nagasaki DRUM Be-7',
  date: '2026-04-18T17:00:00+09:00',
  times: { open: '4:30 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Nagasaki', 
    city: 'Nagasaki',
    address: '14-5 Dozamachi, Nagasaki City, Nagasaki',
    nearestStation: '3 min walk from Kankodori Streetcar Stop'
  },
  capacity: 400,
  access: '3 min walk from Kankodori Streetcar Stop. 15 min by streetcar from JR Nagasaki Station.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13422.82679668779!2d129.878667!3d32.746978!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35155340abd5d027%3A0x78d285234fecad4a!2sDRUM%20Be-7!5e0!3m2!1sja!2sus!4v1764561252866!5m2!1sja!2sus',
  venueWebsite: 'http://www.live-drum.com/',
  parkingInfo: 'No dedicated parking. Please use nearby paid parking lots. Streetcar transportation recommended.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Nagasaki Airport',
        method: 'Airport Bus',
        time: 'Approx. 45 minutes',
        description: 'Airport bus from Nagasaki Airport to JR Nagasaki Station → Streetcar to Kankodori Stop',
        cost: 'One-way ¥1,000',
        notes: 'Airport bus runs every 20 minutes'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Shinkansen + Limited Express',
        time: 'Approx. 7 hours',
        description: 'Shinkansen from Tokyo to Hakata → Limited Express Kamome to Nagasaki',
        cost: 'One-way approx. ¥25,000',
        notes: 'Transfer at Hakata. Flight more efficient'
      },
      {
        from: 'Osaka',
        method: 'Shinkansen + Limited Express',
        time: 'Approx. 4 hours 30 minutes',
        description: 'Shinkansen from Shin-Osaka to Hakata → Limited Express Kamome to Nagasaki',
        cost: 'One-way approx. ¥17,000',
        notes: 'Transfer at Hakata'
      },
      {
        from: 'Fukuoka (Hakata)',
        method: 'Limited Express Kamome',
        time: 'Approx. 2 hours',
        description: 'Limited Express Kamome from Hakata Station to Nagasaki Station',
        cost: 'One-way approx. ¥5,000',
        notes: 'Convenient via Kyushu Shinkansen West Kyushu Route'
      }
    ],
    fromExpressBus: [
      {
        from: 'Fukuoka',
        method: 'Express Bus',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Express bus from Fukuoka (Tenjin/Hakata) to Nagasaki',
        cost: 'One-way approx. ¥2,500',
        notes: 'Approximately once per hour. Cheaper than limited express'
      }
    ],
    fromCar: [
      {
        from: 'Fukuoka Area',
        method: 'Kyushu Expressway/Nagasaki Expressway',
        time: 'Approx. 2 hours',
        description: 'Via Kyushu Expressway → Nagasaki Expressway, exit at Nagasaki IC toward Nagasaki city. Paid parking available near venue.',
        cost: 'Highway toll approx. ¥3,000 (Fukuoka~Nagasaki IC)',
        notes: 'Nagasaki has many hills - drive carefully'
      },
      {
        from: 'Kumamoto Area',
        method: 'Kyushu Expressway/Nagasaki Expressway',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Via Kyushu Expressway → Nagasaki Expressway, exit at Nagasaki IC toward Nagasaki city.',
        cost: 'Highway toll approx. ¥3,500 (Kumamoto~Nagasaki IC)',
        notes: 'Convenient access from within Kyushu'
      }
    ],
    recommendations: 'Good access from Nagasaki Airport to city. Convenient Limited Express Kamome from Fukuoka. Further improved with West Kyushu Shinkansen.'
  },
  parkingOptions: [
    {
      name: 'Times Nagasaki Doza',
      description: 'Parking lot in Doza area',
      price: 'Check for rates',
      distance: '5 min walk',
      website: 'https://times-info.net/P42-nagasaki/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Nagasaki+Doza',
    },
    {
      name: 'Nagasaki Municipal Central Parking',
      description: 'Municipal parking lot',
      price: 'Check for rates',
      distance: '7 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Nagasaki+Municipal+Central+Parking',
    },
  ],
  coinLockers: [
    {
      location: 'JR Nagasaki Station',
      description: 'Coin lockers inside JR Nagasaki Station',
      price: '¥300-¥600',
      distance: '15 min by streetcar',
      website: 'https://www.jr-odekake.net/eki/premises?id=0891401',
      mapsUrl: 'https://www.google.com/maps/search/JR+Nagasaki+Station',
    },
    {
      location: 'Hamamachi Arcade',
      description: 'Coin lockers in Hamamachi Arcade',
      price: 'Check for rates',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Hamamachi+Arcade+coin+lockers',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Nagasaki Hamamachi',
      description: 'Starbucks near Hamamachi Arcade',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Nagasaki+Hamamachi',
    },
    {
      name: 'Doutor Coffee Nagasaki',
      description: 'Doutor Coffee for pre/post-live rest',
      distance: '7 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Doutor+Coffee+Nagasaki',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Meganebashi (Spectacles Bridge)',
      description: 'One of Japan\'s three famous bridges. Arch reflects in water like spectacles',
      distance: '10 min walk',
      website: 'https://www.city.nagasaki.lg.jp/'
    },
    {
      name: 'Hamamachi Arcade',
      description: 'Nagasaki\'s largest shopping district. Full of shopping and dining',
      distance: '5 min walk',
      website: 'https://www.hamamachi.jp/'
    },
    {
      name: 'Glover Garden',
      description: 'World Heritage western-style houses. Panoramic view of Nagasaki Port',
      distance: '15 min by streetcar',
      website: 'https://www.glover-garden.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Yossou',
      cuisine: 'Nagasaki Cuisine',
      description: 'Founded in 1872. Famous for chawanmushi (steamed egg custard) and mushi-zushi set',
      distance: '8 min walk',
      openTime: '11:00-21:00',
      price: '¥2,000-¥3,500',
      website: 'https://www.yossou.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Yossou+Nagasaki',
      recommended: true,
      recommendComment: 'Nagasaki specialty chawanmushi and steamed sushi are exquisite! Savor the long-established taste'
    },
    {
      name: 'Shikairou',
      cuisine: 'Champon',
      description: 'Birthplace of Champon noodles. Spectacular views too',
      distance: '20 min by streetcar',
      openTime: '11:30-21:00',
      price: '¥1,500-¥2,500',
      website: 'https://www.shikairou.com/',
      mapsUrl: 'https://www.google.com/maps/search/Shikairou+Nagasaki',
      recommended: true,
      recommendComment: 'Birthplace of Champon! Authentic taste is exceptional'
    },
    {
      name: 'Kozanrou',
      cuisine: 'Chinese',
      description: 'Famous restaurant in Nagasaki Chinatown. Champon and sara-udon popular',
      distance: '10 min by streetcar',
      openTime: '11:00-21:00',
      price: '¥1,200-¥2,000',
      website: 'https://www.kouzanrou.com/',
      mapsUrl: 'https://www.google.com/maps/search/Kozanrou+Nagasaki',
    },
    {
      name: 'Shiseki Ryotei Kagetsu',
      cuisine: 'Shippoku Cuisine',
      description: 'National historic site restaurant founded in 1642. Enjoy elegant Nagasaki specialty shippoku cuisine',
      distance: '15 min by streetcar',
      openTime: '12:00-15:00, 18:00-22:00',
      price: '¥5,000-¥15,000',
      website: 'https://www.ryoutei-kagetsu.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Kagetsu+Nagasaki',
      recommended: true,
      recommendComment: 'Authentic shippoku cuisine at a national historic site! Experience Nagasaki culture in a historic setting'
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Nagasaki Ekimae',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Nagasaki Station. Clean rooms and free breakfast',
      distance: '3 min walk from Nagasaki Station',
      priceRange: '¥5,000-¥7,000 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.toyoko-inn.com/search/detail/00089/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Nagasaki+Ekimae',
      recommended: true,
      recommendComment: 'Near station, clean, free breakfast! Standard for Nagasaki trips'
    },
    {
      name: 'Kaikatsu CLUB Nagasaki Hamamachi',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '5 min walk from Kankodori Stop',
      priceRange: '¥2,200-¥3,200 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours'],
      website: 'https://www.kaikatsu.jp/shop/nagasaki-hamano/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Nagasaki+Hamamachi',
      recommended: true,
      recommendComment: 'Best option for budget! Close to Chinatown too'
    },
    {
      name: 'Capsule Hotel Nagasaki',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna',
      distance: '7 min walk from Nagasaki Station',
      priceRange: '¥3,000-¥4,000 per night',
      features: ['Large public bath', 'Sauna', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Nagasaki+Station'
    },
    {
      name: 'Hotel Route Inn Nagasaki Ekimae',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Breakfast buffet well-received',
      distance: '5 min walk from Nagasaki Station',
      priceRange: '¥5,500-¥8,000 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=112',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Nagasaki+Ekimae'
    }
  ]
}

export default nagasaki_drum_be7_en
