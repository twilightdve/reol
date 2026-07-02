import { Venue } from '../types'

export const mie_maxa_en: Venue = {
  id: 'mie_maxa',
  name: "Matsusaka M'AXA",
  date: '2026-04-04T17:00:00+09:00',
  times: { open: '4:30 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Mie', 
    city: 'Matsusaka',
    address: '1148-2 Ichibashōchō, Matsusaka City, Mie',
    nearestStation: '20 min walk from Kintetsu Matsugasaki Station'
  },
  capacity: 350,
  access: 'Train: 20 min walk from Kintetsu Matsugasaki Station. *Only local trains stop at Matsugasaki. If using limited express, transfer to local train at Ise-Nakagawa Station. Taxi: Kane-7 Taxi 0120-28-9333, Sanko Taxi 0598-28-8835.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13135.544016810038!2d136.517587!3d34.607044!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60046caa964eda33%3A0xa63b565b0224e680!2z44Op44Kk44OW44Of44Ol44O844K444OD44Kv44Oe44Kv44K1!5e0!3m2!1sja!2sus!4v1764560986362!5m2!1sja!2sus',
  venueWebsite: 'https://www.maxa.jp/access/',
  parkingInfo: 'Second parking lot available (approx. 50 spaces/free). From M\'AXA, go 100m toward Tsu, turn left between Ice and Netz Toyota at 21, right side 100m ahead. Park vertically from back. *Parking at nearby stores (FamilyMart etc.) strictly prohibited. Concert may be canceled if violated.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Chubu Centrair International Airport',
        method: 'Train',
        time: 'Approx. 2 hours',
        description: 'Meitetsu Limited Express from Centrair to Nagoya Station (30 min) → Kintetsu Limited Express to Matsusaka Station (80 min)',
        cost: 'One-way approx. ¥3,500',
        notes: 'Transfer time at Nagoya Station included'
      },
      {
        from: 'Kansai International Airport',
        method: 'Train',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Nankai + Subway from KIX to Namba Station → Kintetsu Limited Express to Matsusaka Station (100 min)',
        cost: 'One-way approx. ¥4,000',
        notes: 'Transfer at Namba Station'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Shinkansen + Kintetsu',
        time: 'Approx. 3 hours',
        description: 'Nozomi Shinkansen from Tokyo Station to Nagoya Station → Kintetsu Limited Express to Matsusaka Station',
        cost: 'One-way approx. ¥13,000',
        notes: 'Transfer to Kintetsu at Nagoya Station'
      },
      {
        from: 'Osaka',
        method: 'Kintetsu Limited Express',
        time: 'Approx. 1 hour 40 minutes',
        description: 'Direct Kintetsu Limited Express from Osaka-Namba Station to Matsusaka Station',
        cost: 'One-way approx. ¥3,000',
        notes: 'Limited express ticket required'
      },
      {
        from: 'Nagoya',
        method: 'Kintetsu Limited Express',
        time: 'Approx. 1 hour 20 minutes',
        description: 'Direct Kintetsu Limited Express from Nagoya Station to Matsusaka Station',
        cost: 'One-way approx. ¥2,500',
        notes: 'Limited express ticket required'
      }
    ],
    fromExpressBus: [
      {
        from: 'Nagoya',
        method: 'Express Bus',
        time: 'Approx. 2 hours',
        description: 'Express bus from Meitetsu Bus Center to Matsusaka Station',
        cost: 'One-way approx. ¥2,000',
        notes: 'Several buses per day. Cheaper than limited express train'
      },
      {
        from: 'Osaka',
        method: 'Express Bus',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Express bus from Osaka Station to Matsusaka Station',
        cost: 'One-way approx. ¥2,500',
        notes: 'Convenient access from Kansai area'
      }
    ],
    fromCar: [
      {
        from: 'Nagoya Area',
        method: 'Higashi-Meihan Expressway',
        time: 'Approx. 1 hour',
        description: 'Via Ise Expressway, exit at Matsusaka IC toward Matsusaka city. Paid parking available near venue.',
        cost: 'Highway toll approx. ¥2,500 (Nagoya~Matsusaka IC)',
        notes: 'Check parking availability in Matsusaka city in advance'
      },
      {
        from: 'Osaka Area',
        method: 'Meihan National Highway/Higashi-Meihan Expressway',
        time: 'Approx. 2 hours',
        description: 'Via Meihan National Highway → Ise Expressway, exit at Matsusaka IC toward Matsusaka city.',
        cost: 'Highway toll approx. ¥4,000 (Osaka~Matsusaka IC)',
        notes: 'Convenient access from Kansai region'
      }
    ],
    recommendations: 'Convenient by Kintetsu Limited Express from Nagoya/Osaka. Home of Matsusaka beef - enjoy the local cuisine.'
  },
  parkingOptions: [
    {
      name: 'Times Matsusaka Station',
      description: 'Parking lot in front of JR Matsusaka Station',
      price: 'Check for rates',
      distance: '5 min walk',
      website: 'https://times-info.net/P24-mie/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Matsusaka+Station',
    },
    {
      name: 'Matsusaka Station Parking',
      description: 'Municipal parking in front of Matsusaka Station',
      price: 'Check for rates',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Matsusaka+Station+parking',
    },
  ],
  coinLockers: [
    {
      location: 'JR Matsusaka Station',
      description: 'Coin lockers inside JR Matsusaka Station',
      price: 'Check for rates',
      distance: '5 min walk',
      website: 'https://www.jr-odekake.net/eki/premises?id=0622091',
      mapsUrl: 'https://www.google.com/maps/search/JR+Matsusaka+Station',
    },
    {
      location: 'Kintetsu Matsusaka Station',
      description: 'Coin lockers inside Kintetsu Matsusaka Station',
      price: 'Check for rates',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Kintetsu+Matsusaka+Station',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Matsusaka Ekimae',
      description: 'Starbucks in front of Matsusaka Station',
      distance: '3 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Matsusaka+Ekimae',
    },
    {
      name: 'Komeda Coffee Matsusaka',
      description: 'Nagoya-origin cafe. Morning sets also popular',
      distance: '10 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Komeda+Coffee+Matsusaka',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Matsusaka Castle Ruins',
      description: 'Castle ruins built by Gamo Ujisato. Famous for cherry blossoms and beautiful stone walls',
      distance: '15 min walk',
      website: 'https://www.city.matsusaka.mie.jp/site/kanko/matsuzakajyo.html'
    },
    {
      name: 'Gojōban Yashiki',
      description: 'Remaining samurai residences from Edo period. Important Preservation District for Groups of Traditional Buildings',
      distance: '20 min walk',
      website: 'https://www.city.matsusaka.mie.jp/site/kanko/gojyoubanyashiki.html'
    },
    {
      name: 'Motoori Norinaga Memorial Museum',
      description: 'Memorial museum for kokugaku scholar Motoori Norinaga',
      distance: '15 min walk',
      website: 'https://www.norinagakinenkan.com/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Wadakin',
      cuisine: 'Matsusaka Beef',
      description: 'Founded in 1878. Famous restaurant for premium Matsusaka beef sukiyaki',
      distance: '10 min walk',
      openTime: '11:30-19:00 (Closed certain days)',
      price: '¥15,000 - ¥30,000',
      website: 'https://www.wadakin.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Wadakin+Matsusaka',
      recommended: true,
      recommendComment: 'The pinnacle of Matsusaka beef! Long-established taste worthy of special occasions'
    },
    {
      name: 'Gyugin Honten',
      cuisine: 'Matsusaka Beef',
      description: 'Matsusaka beef specialty shop founded in 1902. Exquisite sukiyaki',
      distance: '12 min walk',
      openTime: '11:00-20:00',
      price: '¥8,000 - ¥20,000',
      website: 'https://www.gyugin-honten.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Gyugin+Honten+Matsusaka',
      recommended: true,
      recommendComment: 'Try Matsusaka beef in Matsusaka! More affordable than Wadakin with high quality'
    },
    {
      name: 'Matsusaka Maruyoshi',
      cuisine: 'Matsusaka Beef',
      description: 'Enjoy Matsusaka beef as yakiniku or steak',
      distance: '8 min walk',
      openTime: '11:00-21:00',
      price: '¥5,000 - ¥12,000',
      website: 'https://www.matsusakaushi.com/',
      mapsUrl: 'https://www.google.com/maps/search/Matsusaka+Maruyoshi',
    },
    {
      name: 'Isshoya Shokudo',
      cuisine: 'Set Meals',
      description: 'Local Matsusaka diner. Hearty portions with local flavors',
      distance: '6 min walk',
      openTime: '11:00-21:00',
      price: '¥800 - ¥1,300',
      mapsUrl: 'https://www.google.com/maps/search/Shokudo+Matsusaka+Station',
      recommended: true,
      recommendComment: 'Local favorite! Best value for authentic local taste'
    }
  ],
  accommodations: [
    {
      name: 'Hotel Route Inn Matsusaka Ekimae',
      type: 'ビジネスホテル',
      description: 'Great location 2 min walk from Matsusaka Station. Large public bath and free breakfast',
      distance: '2 min walk from Matsusaka Station',
      priceRange: '¥5,500 - ¥7,500 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=102',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Matsusaka+Ekimae',
      recommended: true,
      recommendComment: 'Near station with large bath! Standard hotel for Matsusaka trips'
    },
    {
      name: 'Kaikatsu CLUB Matsusaka',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '10 min by car from Matsusaka Station',
      priceRange: '¥2,000 - ¥3,000 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours', 'Free parking'],
      website: 'https://www.kaikatsu.jp/shop/matsusaka/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Matsusaka',
      recommended: true,
      recommendComment: 'Perfect for car trips! Free parking and budget-friendly'
    },
    {
      name: 'Capsule Hotel Matsusaka',
      type: 'カプセルホテル',
      description: 'Capsule hotel with sauna and large public bath',
      distance: '8 min walk from Matsusaka Station',
      priceRange: '¥3,000 - ¥4,000 per night',
      features: ['Large public bath', 'Sauna', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Matsusaka+Station'
    },
    {
      name: 'Matsusaka City Hotel',
      type: 'シティホテル',
      description: 'City hotel right by Matsusaka Station. Clean and comfortable rooms',
      distance: '3 min walk from Matsusaka Station',
      priceRange: '¥5,000 - ¥8,000 per night',
      features: ['Free Wi-Fi', 'Coin laundry', 'Near station', '24-hour front desk'],
      website: 'https://matsusaka-city-hotel.com/',
      mapsUrl: 'https://www.google.com/maps/search/Matsusaka+City+Hotel'
    }
  ]
}

export default mie_maxa_en
