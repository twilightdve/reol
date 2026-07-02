import { Venue } from '../types'

export const taipei_zepp_new_taipei_en: Venue = {
    id: 'taipei_zepp_new_taipei',
    name: 'Zepp New Taipei',
    date: '2026-07-26T00:00:00+08:00',
    times: { open: 'TBA', start: 'TBA' },
    location: { 
      prefecture: 'TAIPEI', 
      city: 'Taipei',
      address: '8F, No. 3, Sec. 4, Xinbei Blvd., Xinzhuang Dist., New Taipei City 24242, Taiwan (Honhui Plaza)',
      nearestStation: '5 min walk from MRT Xinbei Industrial Park Station (Circular Line)'
    },
    capacity: 2245,
    access: '【MRT】5 min walk from Exit 1 of MRT Circular Line "Xinbei Industrial Park Station". Located on the 8th floor of Honhui Plaza. 【Bus】Multiple bus routes along Xinbei Boulevard. Get off at "Honhui Plaza" stop.',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.7!2d121.4388!3d25.0427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a7d3a8d8c5e7%3A0x9d1d3e5c5b5a5b5c!2sZepp+New+Taipei!5e0!3m2!1sen!2stw!4v1',
    venueWebsite: 'https://www.zepp.co.jp/hall/newtaipei/',
    parkingInfo: 'Underground parking available at Honhui Plaza. MRT recommended.',
    longDistanceAccess: {
      fromAirport: [
        {
          from: 'Taiwan Taoyuan International Airport (TPE)',
          method: 'Taoyuan MRT',
          time: 'Approx. 50 min',
          description: 'Take Taoyuan MRT Airport Line to "Sanchong Station" → Transfer to Circular Line to "Xinbei Industrial Park Station" → 5 min walk',
          cost: 'Approx. 160 TWD one way',
          notes: 'Many direct flights from Japan. MRT is the most convenient option from the airport'
        },
        {
          from: 'Taipei Songshan Airport (TSA)',
          method: 'MRT',
          time: 'Approx. 40 min',
          description: 'Take MRT Wenhu Line from Songshan Airport to "Daan Station" → Transfer to Bannan Line to "Banqiao Station" → Transfer to Circular Line to "Xinbei Industrial Park Station" → 5 min walk',
          cost: 'Approx. 50 TWD one way',
          notes: 'Direct flights from Tokyo Haneda. Close to city center'
        }
      ],
      fromExpressBus: [
        {
          from: 'Taipei Main Station',
          method: 'MRT',
          time: 'Approx. 30 min',
          description: 'Take MRT Bannan Line from Taipei Main Station to "Banqiao Station" → Transfer to Circular Line to "Xinbei Industrial Park Station" → 5 min walk',
          cost: 'Approx. 40 TWD one way',
          notes: 'Convenient access from Taipei city center'
        },
        {
          from: 'Taipei Main Station (HSR/TRA)',
          method: 'HSR (Taiwan High Speed Rail) + MRT',
          time: 'Approx. 1 hour from Taichung + 30 min MRT',
          description: 'Take HSR from various cities to Taipei Main Station → Transfer to MRT to Xinbei Industrial Park Station',
          cost: 'HSR Taichung-Taipei approx. 700 TWD one way',
          notes: 'Convenient from southern Taiwan'
        }
      ],
      recommendations: 'Direct flights from Japan to Taiwan Taoyuan International Airport (TPE) are available from Narita, Haneda, Kansai, Chubu, Fukuoka, etc. (flight time approx. 3-4 hours). From the airport, you can reach the venue with just one transfer on the Taoyuan MRT. Taipei Songshan Airport has direct flights from Haneda and is closer to the city center. Passport required; visa-free for tourism stays under 90 days.'
    },
    coinLockers: [
      {
        location: 'Zepp New Taipei In-Venue Lockers (Small)',
        description: 'Located on 8F-9F. 765 units. For small items like smartphones and wallets',
        price: '50 TWD',
        distance: 'Inside venue',
        recommended: true,
        recommendComment: 'Large number available, relatively easy to secure'
      },
      {
        location: 'Zepp New Taipei In-Venue Lockers (Medium)',
        description: 'Located on 8F-9F. 14 units. For medium items like backpacks',
        price: '100 TWD',
        distance: 'Inside venue',
        recommendComment: 'Limited number available, secure early'
      },
      {
        location: 'Zepp New Taipei In-Venue Lockers (Large)',
        description: 'Located on 8F-9F. 14 units. For large items like carry-on suitcases',
        price: '100 TWD',
        distance: 'Inside venue',
        recommendComment: 'Limited number available, secure early'
      },
    ],
    nearbyAttractions: [
      {
        name: 'Honhui Plaza',
        description: 'Large shopping mall housing Zepp New Taipei. Features restaurants, cinema, and shops',
        distance: 'Same building'
      },
      {
        name: 'Xinzhuang Temple Street Night Market',
        description: 'Popular local night market with delicious Taiwanese street food',
        distance: 'Approx. 10 min by car'
      },
      {
        name: 'Taipei 101',
        description: 'Iconic Taipei landmark with observation deck offering panoramic city views',
        distance: 'Approx. 40 min by MRT'
      },
      {
        name: 'Jiufen',
        description: 'Charming retro town famous for its Spirited Away-like atmosphere',
        distance: 'Approx. 1 hour by car'
      },
      {
        name: 'Shilin Night Market',
        description: 'Taipei\'s largest night market with diverse food stalls and shopping',
        distance: 'Approx. 40 min by MRT'
      },
    ],
    nearbyRestaurants: [
      {
        name: 'Honhui Plaza Food Court',
        cuisine: 'Various Taiwanese cuisine',
        description: 'Food court in the same building. Wide variety from Taiwanese to Japanese food',
        distance: 'Same building',
        price: '100-300 TWD',
        recommended: true,
        recommendComment: 'Most convenient option in the same building! Perfect for pre/post-show meals'
      },
      {
        name: 'Din Tai Fung - Banqiao Branch',
        cuisine: 'Xiaolongbao (Soup Dumplings)',
        description: 'World-famous dumpling restaurant. Nearest branch is at Far Eastern Dept. Store Banqiao B1, just a few MRT stops away',
        distance: 'Approx. 10 min by MRT (directly connected to Banqiao Station)',
        openTime: 'Mon-Thu 11:00-20:30 / Fri 11:00-21:00 / Sat 10:50-21:00 / Sun 10:50-20:30',
        price: '300-600 TWD',
        website: 'https://www.dintaifung.com.tw/',
        mapsUrl: 'https://www.google.com/maps/search/Din+Tai+Fung+Banqiao+Far+Eastern',
        recommended: true,
        recommendComment: 'A must-try in Taiwan! The nearest branch to the venue. Juicy soup dumplings are incredible'
      },
      {
        name: 'Fu Hang Dou Jiang',
        cuisine: 'Taiwanese Breakfast',
        description: 'Famous breakfast shop known for soy milk and shaobing. Expect long queues',
        distance: 'Near MRT Shandao Temple Station',
        openTime: '05:30-12:30',
        price: '50-150 TWD',
        mapsUrl: 'https://www.google.com/maps/search/阜杭豆漿',
        recommendComment: 'Perfect for next-day breakfast! Lines form from early morning'
      },
    ],
    accommodations: [
      {
        name: 'Caesar Metro Taipei',
        type: 'シティホテル',
        description: 'Large hotel directly connected to MRT Wanhua Station. Close to Taipei Main Station',
        distance: 'Approx. 25 min by MRT',
        priceRange: '3,000-6,000 TWD/night',
        features: ['MRT direct access', 'Restaurant', 'Fitness center', 'Free Wi-Fi'],
        website: 'https://www.caesarmetro.com/',
        mapsUrl: 'https://www.google.com/maps/search/Caesar+Metro+Taipei',
      },
      {
        name: 'Mitsui Garden Hotel Taipei Zhongxiao',
        type: 'ビジネスホテル',
        description: 'Japanese hotel chain by Mitsui Fudosan Group. Just 30 seconds walk from MRT Zhongxiao Xinsheng Station Exit 3. Features a public bath (onsen-style)',
        distance: 'Approx. 35 min by MRT (Zhongxiao Xinsheng Sta. → Banqiao Sta. → Xinbei Industrial Park Sta.)',
        priceRange: '4,000-8,000 TWD/night',
        features: ['Japanese hotel chain', 'Public bath', '30 sec from station', 'Restaurant', 'Free Wi-Fi'],
        website: 'https://www.gardenhotels.co.jp/taipei-zhongxiao/',
        mapsUrl: 'https://www.google.com/maps/search/Mitsui+Garden+Hotel+Taipei+Zhongxiao',
        recommended: true,
        recommendComment: 'Japanese hotel chain with reliable service! Relax in the public bath after the concert. Japanese-speaking staff available'
      },
      {
        name: 'Hostels in Ximending Area',
        type: 'ゲストハウス',
        description: 'Popular area with young travelers. Many affordable guesthouses and hostels',
        distance: 'Approx. 25 min by MRT',
        priceRange: '500-1,500 TWD/night',
        features: ['Budget-friendly', 'Entertainment district', 'Shopping', 'Free Wi-Fi'],
        mapsUrl: 'https://www.google.com/maps/search/hostel+Ximending',
        recommendComment: 'Great for budget travelers! Night markets nearby'
      },
    ],
}

export default taipei_zepp_new_taipei_en
