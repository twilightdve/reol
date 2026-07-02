import { Venue } from '../types'

export const aomori_quarter_en: Venue = {
  id: 'aomori_quarter',
  name: 'Aomori Quarter',
  date: '2026-04-11T17:00:00+09:00',
  times: { open: '4:30 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Aomori', 
    city: 'Aomori',
    address: '2-11-3 Yasukata, Aomori City, Aomori',
    nearestStation: '10 min walk from JR Aomori Station'
  },
  capacity: 300,
  access: '10 min walk from JR Aomori Station. Located along a one-way side street.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12075.880840115598!2d140.742654!3d40.828618!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5f9b9ee18a2dd15f%3A0x368eeea3b964138f!2z6Z2S5qOuUXVhcnRlcg!5e0!3m2!1sja!2sus!4v1764561155762!5m2!1sja!2sus',
  venueWebsite: 'https://aomoriquarter.com/access',
  parkingInfo: 'Please use nearby paid parking lots.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Aomori Airport',
        method: 'Airport Bus',
        time: 'Approx. 35 minutes',
        description: 'Airport bus from Aomori Airport to JR Aomori Station → 7 min walk to venue',
        cost: 'One-way ¥710',
        notes: 'Airport bus runs approximately once per hour'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Hayabusa Shinkansen',
        time: 'Approx. 3 hours 30 minutes',
        description: 'Tohoku Shinkansen Hayabusa from Tokyo Station to Shin-Aomori Station → JR Ou Line to Aomori Station (5 min)',
        cost: 'One-way approx. ¥17,000',
        notes: 'Transfer to local line at Shin-Aomori Station to reach Aomori Station'
      },
      {
        from: 'Sendai',
        method: 'Hayabusa Shinkansen',
        time: 'Approx. 1 hour 30 minutes',
        description: 'Tohoku Shinkansen Hayabusa from Sendai Station to Shin-Aomori Station → JR Ou Line to Aomori Station',
        cost: 'One-way approx. ¥9,000',
        notes: 'Use local line from Shin-Aomori Station'
      },
      {
        from: 'Nagoya/Osaka',
        method: 'Flight Recommended',
        time: 'Approx. 4-5 hours (via Shinkansen transfer)',
        description: 'Flights to Aomori Airport more convenient than Shinkansen transfer via Tokyo',
        cost: '',
        notes: 'Aomori Airport most efficient from western Japan'
      }
    ],
    fromExpressBus: [
      {
        from: 'Morioka/Hachinohe',
        method: 'Express Bus',
        time: 'Approx. 2-3 hours',
        description: 'Express buses operate from various Tohoku cities to Aomori. Walk to venue from Aomori Station arrival',
        cost: 'One-way ¥2,500-¥4,000',
        notes: 'Convenient for travel within northern Tohoku'
      }
    ],
    fromCar: [
      {
        from: 'Tokyo Area',
        method: 'Tohoku Expressway',
        time: 'Approx. 8 hours',
        description: 'North on Tohoku Expressway, exit at Aomori IC toward Aomori city. Paid parking available near venue.',
        cost: 'Highway toll approx. ¥9,500 (Tokyo~Aomori IC)',
        notes: 'Long-distance drive requires rest breaks. Beware of icy roads in winter'
      },
      {
        from: 'Sendai Area',
        method: 'Tohoku Expressway',
        time: 'Approx. 4 hours',
        description: 'North on Tohoku Expressway, exit at Aomori IC toward Aomori city.',
        cost: 'Highway toll approx. ¥5,500 (Sendai~Aomori IC)',
        notes: 'Convenient access from within Tohoku region'
      }
    ],
    recommendations: 'Good access - 35 min bus from Aomori Airport. Shinkansen connects via Shin-Aomori to JR. Central city of northern Tohoku.'
  },
  parkingOptions: [
    {
      name: 'Aomori Station Parking',
      description: 'Parking lot in front of Aomori Station',
      price: 'Check for rates',
      distance: '7 min walk',
      website: 'https://times-info.net/P02-aomori/C201/park-detail-BUK0078339/',
      mapsUrl: 'https://www.google.com/maps/search/Aomori+Station+parking',
    },
    {
      name: 'Times Aomori Station',
      description: 'Times parking lot',
      price: 'Check for rates',
      distance: '8 min walk',
      website: 'https://times-info.net/P02-aomori/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Aomori+Station',
    },
  ],
  coinLockers: [
    {
      location: 'JR Aomori Station',
      description: 'Coin lockers inside JR Aomori Station',
      price: '¥300-¥600',
      distance: '7 min walk',
      website: 'https://www.jreast.co.jp/estation/stations/25.html',
      mapsUrl: 'https://www.google.com/maps/search/JR+Aomori+Station',
    },
    {
      location: 'Nebuta Museum WA RASSE',
      description: 'Coin lockers inside WA RASSE',
      price: 'Check for rates',
      distance: '10 min walk',
      mapsUrl: 'https://www.google.com/maps/search/WA+RASSE+Aomori',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Aomori Ekimae',
      description: 'Starbucks in front of Aomori Station',
      distance: '5 min walk',
      website: 'https://store.starbucks.co.jp/detail-4395/',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Aomori+Station',
    },
    {
      name: 'Doutor Coffee Aomori',
      description: 'Doutor Coffee for pre/post-live rest',
      distance: '6 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Doutor+Coffee+Aomori+Station',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Nebuta Museum WA RASSE',
      description: 'Museum for Aomori Nebuta Festival. Full-size Nebuta floats on display',
      distance: '10 min walk',
      website: 'https://www.nebuta.jp/warasse/'
    },
    {
      name: 'Aomori Bay Bridge',
      description: 'Landmark of Aomori Port. Beautifully lit up at night',
      distance: '15 min walk',
      website: 'https://www.city.aomori.aomori.jp/'
    },
    {
      name: 'A-FACTORY',
      description: 'Complex featuring Aomori specialties. Includes Aomori Cider Workshop',
      distance: '12 min walk',
      website: 'https://www.jre-abc.com/wp/afactory/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Aomori Gyosai Center (Nokke-don)',
      cuisine: 'Seafood Bowl',
      description: '"Nokke-don" specialty - build your own seafood bowl by selecting fresh sashimi',
      distance: '8 min walk',
      openTime: '7:00-16:00 (Sun from 9:00)',
      price: '¥1,500-¥2,500',
      website: 'https://nokkedon.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Aomori+Gyosai+Center',
      recommended: true,
      recommendComment: 'Must-try in Aomori! Fun to customize your own seafood bowl'
    },
    {
      name: 'Aji no Sapporo Onishi',
      cuisine: 'Ramen',
      description: "Birthplace of Aomori's miso curry milk ramen",
      distance: '10 min walk',
      openTime: '11:00-20:00',
      price: '¥800-¥1,200',
      mapsUrl: 'https://www.google.com/maps/search/Aji+no+Sapporo+Onishi+Aomori',
      recommended: true,
      recommendComment: 'B-grade gourmet masterpiece! Unexpected combination tastes amazing'
    },
    {
      name: 'Hotate Goya',
      cuisine: 'Seafood',
      description: 'Enjoy Aomori specialty scallops grilled over charcoal',
      distance: '12 min walk',
      openTime: '11:00-21:00',
      price: '¥2,000-¥3,500',
      mapsUrl: 'https://www.google.com/maps/search/Hotate+Goya+Aomori',
    },
    {
      name: 'Osanai Shokudo',
      cuisine: 'Local Cuisine',
      description: 'Long-established diner near Aomori Station. Famous for scallop miso shell-grilling and keno-jiru',
      distance: '3 min walk',
      openTime: '7:00-21:00',
      price: '¥800-¥1,500',
      mapsUrl: 'https://www.google.com/maps/search/Osanai+Shokudo+Aomori+Station',
      recommended: true,
      recommendComment: 'Famous diner near Aomori Station! Scallop miso shell-grilling is an exquisite local dish'
    }
  ],
  accommodations: [
    {
      name: 'Hotel Route Inn Aomori Ekimae',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Aomori Station. Large public bath and free breakfast',
      distance: '3 min walk from Aomori Station',
      priceRange: '¥5,500-¥7,500 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=31',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Aomori+Ekimae',
      recommended: true,
      recommendComment: 'Near station with large bath! Standard hotel for Aomori trips'
    },
    {
      name: 'Kaikatsu CLUB Aomori',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '10 min by car from Aomori Station',
      priceRange: '¥2,000-¥3,000 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours', 'Free parking'],
      website: 'https://www.kaikatsu.jp/shop/aomori/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Aomori',
      recommended: true,
      recommendComment: 'Perfect for car trips! Free parking and budget-friendly'
    },
    {
      name: 'Capsule Hotel Aomori',
      type: 'カプセルホテル',
      description: 'Capsule hotel with sauna and large public bath',
      distance: '7 min walk from Aomori Station',
      priceRange: '¥3,000-¥4,000 per night',
      features: ['Large public bath', 'Sauna', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Aomori+Station'
    },
    {
      name: 'Toyoko Inn Aomori Station Main Exit',
      type: 'ビジネスホテル',
      description: 'Great location right by Aomori Station. Clean and comfortable rooms',
      distance: '2 min walk from Aomori Station',
      priceRange: '¥5,000-¥7,000 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.toyoko-inn.com/search/detail/00052/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Aomori+Station'
    }
  ]
}

export default aomori_quarter_en
