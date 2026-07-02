import { Venue } from '../types'

export const tokyo_line_cube_en: Venue = {
    id: 'tokyo_line_cube',
    name: 'LINE CUBE SHIBUYA',
    date: '2026-07-10T18:30:00+09:00',
    times: { open: '5:30 PM', start: '6:30 PM' },
    location: { 
      prefecture: 'Tokyo', 
      city: 'Shibuya',
      address: '1-1 Udagawacho, Shibuya-ku, Tokyo',
      nearestStation: '13 min walk from JR Shibuya Station'
    },
    capacity: 1956,
    access: '【Train】13 min walk from JR Shibuya Station (Yamanote Line, etc.), 13 min walk from JR Harajuku Station (Yamanote Line), 13 min walk from Meiji-jingumae Station (Chiyoda Line, Fukutoshin Line). 【Bus】From JR Shibuya Station, take Keio Bus "Shibu63 or 64 to Nakano Station" or "Shuku51 to Shinjuku Station West Exit" and get off at "Shibuya City Hall". From JR Harajuku Station, take Toei Bus "Haya81 to Waseda Main Gate" and get off at "Shibuya City Hall-mae". From Meiji-jingumae Station, take Hachiko Bus "Jingu-no-Mori Route" and get off at "Shibuya City Hall".',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12966.0787086158!2d139.698555!3d35.664204!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188cb803a8804f%3A0x99c035bb4f34ccfe!2zTElORSBDVUJFIFNISUJVWUHvvIjmuIvosLflhazkvJrloILvvIk!5e0!3m2!1sja!2sus!4v1764574861167!5m2!1sja!2sus',
    venueWebsite: 'https://linecubeshibuya.com/#access',
    parkingInfo: 'No parking available at the venue. Please use public transportation.',
    nearbyAttractions: [
      {
        name: 'Shibuya Scramble Crossing',
        description: 'One of the world\'s most famous intersections',
        distance: '3 min walk'
      },
      {
        name: 'Shibuya Sky',
        description: 'Observatory offering panoramic views of Shibuya',
        distance: '2 min walk'
      },
      {
        name: 'Hachiko Statue',
        description: 'Bronze statue of loyal dog Hachiko. Famous meeting spot',
        distance: '4 min walk'
      }
    ],
    longDistanceAccess: {
      fromAirport: [
        {
          from: 'Haneda Airport',
          method: 'Keikyu Line & Tokyu Line',
          time: 'Approx. 40 minutes',
          description: 'Keikyu Line from Haneda Airport to Shinagawa Station → JR Yamanote Line to Shibuya Station. Or Keikyu Line to Sengakuji, transfer to Tokyu Toyoko Line to Shibuya Station',
          cost: 'One-way ¥580',
          notes: 'Trains run every 15 minutes. 5 min walk from Shibuya Station'
        },
        {
          from: 'Narita Airport',
          method: 'Narita Express',
          time: 'Approx. 1 hour 10 minutes',
          description: 'Narita Express from Narita Airport to Shibuya Station',
          cost: 'One-way ¥3,300',
          notes: 'About 1 train per hour. Direct and convenient'
        }
      ],
      fromShinkansen: [
        {
          from: 'Osaka',
          method: 'Shinkansen Nozomi',
          time: 'Approx. 2 hours 40 minutes',
          description: 'Shinkansen Nozomi from Shin-Osaka to Shinagawa Station → JR Yamanote Line to Shibuya Station (10 min)',
          cost: 'One-way approx. ¥14,000',
          notes: 'Use Yamanote Line from Shinagawa Station'
        },
        {
          from: 'Nagoya',
          method: 'Shinkansen Nozomi',
          time: 'Approx. 1 hour 50 minutes',
          description: 'Shinkansen Nozomi from Nagoya to Shinagawa Station → JR Yamanote Line to Shibuya Station',
          cost: 'One-way approx. ¥11,000',
          notes: 'Use Yamanote Line from Shinagawa Station'
        },
        {
          from: 'Sendai',
          method: 'Tohoku Shinkansen Hayabusa',
          time: 'Approx. 1 hour 50 minutes',
          description: 'Tohoku Shinkansen Hayabusa from Sendai to Tokyo Station → JR Yamanote Line to Shibuya Station (20 min)',
          cost: 'One-way approx. ¥11,000',
          notes: 'Use Yamanote Line from Tokyo Station'
        },
        {
          from: 'Fukuoka',
          method: 'Shinkansen Nozomi',
          time: 'Approx. 5 hours 30 minutes',
          description: 'Shinkansen Nozomi from Hakata to Shinagawa Station → JR Yamanote Line to Shibuya Station',
          cost: 'One-way approx. ¥23,000',
          notes: 'Consider flying. Approx. 40 min from Haneda Airport'
        }
      ],
      fromExpressBus: [
        {
          from: 'Major Cities Nationwide',
          method: 'Overnight Express Bus',
          time: '6-12 hours',
          description: 'Many overnight buses operate from major cities nationwide to Tokyo (Shinjuku/Shibuya). After arriving at Shibuya or Shinjuku Station, go to venue.',
          cost: 'One-way ¥3,000-¥10,000',
          notes: 'Departs previous night, arrives next morning. Most economical option'
        }
      ],
      fromCar: [
        {
          from: 'Yokohama Area',
          method: 'Shuto Expressway',
          time: 'Approx. 40 minutes',
          description: 'Via Shuto Expressway Wangan/Daiba Lines, exit at Shibuya and head toward Shibuya. Multiple paid parking lots near venue.',
          cost: 'Highway toll approx. ¥1,300',
          notes: 'Heavy traffic in city center - public transportation recommended'
        },
        {
          from: 'Saitama Area',
          method: 'Shuto Expressway',
          time: 'Approx. 50 minutes',
          description: 'Via Shuto Expressway, exit at Shibuya and head toward Shibuya.',
          cost: 'Highway toll approx. ¥1,300',
          notes: 'Parking lots expected to be crowded - advance reservation recommended'
        }
      ],
      recommendations: 'Easy access from all over Japan to Tokyo, the capital. 40 min by train from Haneda Airport, direct Narita Express from Narita Airport. Shinkansen users: use Yamanote Line from Tokyo/Shinagawa Station.'
    },
    parkingOptions: [
      {
        name: 'Shibuya Mark City Parking',
        description: 'Shibuya Mark City parking lot information',
        price: 'Check for rates',
        distance: 'Check for distance',
        website: 'https://www.shibuya-mark-city.com/access/',
        mapsUrl: 'https://www.google.com/maps/search/Shibuya+Mark+City+Parking',
      },
      {
        name: 'Shibuya Hikarie Parking',
        description: 'Shibuya Hikarie parking lot information',
        price: 'Check for rates',
        distance: 'Check for distance',
        website: 'https://www.hikarie.jp/access/',
        mapsUrl: 'https://www.google.com/maps/search/Shibuya+Hikarie+Parking',
      },
    ],
    coinLockers: [
      {
        location: 'Inside JR Shibuya Station',
        description: 'Coin lockers inside JR Shibuya Station',
        price: 'Check for rates',
        distance: 'Check for distance',
        website: 'https://www.jreast.co.jp/estation/stations/866.html',
        mapsUrl: 'https://www.google.com/maps/search/JR+Shibuya+Station',
      },
      {
        location: 'Shibuya Mark City',
        description: 'Coin lockers at Shibuya Mark City',
        price: 'Check for rates',
        distance: 'Check for distance',
        website: 'https://www.shibuya-mark-city.com/',
        mapsUrl: 'https://www.google.com/maps/search/Shibuya+Mark+City',
      },
      {
        location: 'Shibuya Hikarie',
        description: 'Coin lockers at Shibuya Hikarie',
        price: 'Check for rates',
        distance: 'Check for distance',
        website: 'https://www.hikarie.jp/',
        mapsUrl: 'https://www.google.com/maps/search/Shibuya+Hikarie',
      },
    ],
    cafes: [
      {
        name: 'Starbucks Shibuya Mark City',
        description: 'Starbucks at Shibuya Mark City, ideal for pre/post-show relaxation',
        distance: 'Check for distance',
        website: 'https://www.starbucks.co.jp/',
        mapsUrl: 'https://www.google.com/maps/search/Starbucks+Shibuya+Mark+City',
      },
      {
        name: 'Tully\'s Coffee Dogenzaka',
        description: 'Tully\'s Coffee Dogenzaka, ideal for pre/post-show relaxation',
        distance: 'Check for distance',
        website: 'https://www.tullys.co.jp/',
        mapsUrl: 'https://www.google.com/maps/search/Tullys+Coffee+Dogenzaka',
      },
      {
        name: 'Doutor Coffee Shibuya Ekimae',
        description: 'Doutor Coffee Shibuya Ekimae, ideal for pre/post-show relaxation',
        distance: 'Check for distance',
        website: 'https://www.doutor.co.jp/',
        mapsUrl: 'https://www.google.com/maps/search/Doutor+Coffee+Shibuya+Ekimae',
      },
    ],
    holyPlaces: [
      {
        name: 'Rose Garden Shinjuku',
        description: 'Reol-related holy place: Rose Garden Shinjuku',
        type: 'MV/Work-related',
        distance: 'Check for distance',
        address: 'Check for address',
        mapsUrl: 'https://www.google.com/maps/',
      },
      {
        name: 'Jodo Shu Baisoin Temple',
        description: 'Reol-related holy place: Jodo Shu Baisoin Temple',
        type: 'MV/Work-related',
        distance: 'Check for distance',
        address: 'Check for address',
        website: 'https://www.baisouin.or.jp/',
        mapsUrl: 'https://www.google.com/maps/place/Jodo+Shu+Baisoin/',
      },
      {
        name: 'THE GARAGE (Little TAO)',
        description: 'Kissakigiri Video Edition: Reol TV said - if you have something you want to kintsugi',
        type: 'MV/Work-related',
        distance: 'Check for distance',
        address: 'Check for address',
        mapsUrl: 'https://www.google.com/maps/place/THE+GARAGE/',
      },
      {
        name: 'Hie Shrine',
        description: 'Shrine where Reol prayed for success at the end of the year after the Budokan announcement',
        type: 'Reol-related',
        distance: '3 min walk from Akasaka Station',
        address: '2-10-5 Nagatacho, Chiyoda-ku, Tokyo',
        website: 'https://www.hiejinja.net/',
        mapsUrl: 'https://www.google.com/maps/search/Hie+Shrine+Tokyo',
      },
      {
        name: 'Cafe Un Enseigne D\'Angle Jiyugaoka',
        description: 'Reol-related holy place cafe',
        type: 'Reol-related',
        distance: '5 min walk from Jiyugaoka Station',
        address: 'Jiyugaoka, Meguro-ku, Tokyo',
        mapsUrl: 'https://www.google.com/maps/search/Cafe+Un+Enseigne+D+Angle+Jiyugaoka',
      },
      {
        name: 'Kahei Yanaka Tunnel',
        description: 'MV filming location for BOY',
        type: 'MV/Work-related',
        title: 'BOY',
        distance: '10 min walk from Nishi-Nippori Station',
        address: 'Nishi-Nippori, Arakawa-ku, Tokyo',
        mapsUrl: 'https://www.google.com/maps/search/Kahei+Yanaka+Tunnel',
      },
      {
        name: 'Roppongi Tunnel Mural',
        description: 'MV filming location for BOY',
        type: 'MV/Work-related',
        title: 'BOY',
        distance: '5 min walk from Roppongi Station',
        address: 'Roppongi, Minato-ku, Tokyo',
        mapsUrl: 'https://www.google.com/maps/search/Roppongi+Tunnel+Mural',
      },
      {
        name: 'Utsuwa no Mise Daimonji',
        description: 'Shop where Reol bought pottery she was doing kintsugi on',
        type: 'Reol-related',
        distance: 'Check for distance',
        address: 'Tokyo',
        mapsUrl: 'https://www.google.com/maps/search/Utsuwa+no+Mise+Daimonji+Tokyo',
      },
      {
        name: 'Shibaura Minami Futo Park',
        description: 'Filming location for Kyokoshu XFD video',
        type: 'MV/Work-related',
        title: 'Kyokoshu',
        distance: '6 min walk from Shibaura Futo Station',
        address: '3-33-20 Kaigan, Minato-ku, Tokyo',
        mapsUrl: 'https://maps.app.goo.gl/1H48yUyayMFSA7Rq7',
      },
      {
        name: 'Torahebi Coffee',
        description: 'Drank iced coffee from here in Instagram story',
        type: 'Reol-related',
        distance: '5 min walk from Shibuya Station',
        address: '15-1 Udagawacho, Shibuya-ku, Tokyo, Shibuya PARCO 3F Outside',
        mapsUrl: 'https://maps.app.goo.gl/bsZJV2noLXs8D71s8',
      },
      {
        name: 'Ikebe Gakki Grandy & Jungle',
        description: 'Place where Reol bought her currently used guitar',
        type: 'Reol-related',
        distance: '3 min walk from Shibuya Station',
        address: '1-7-4 Dogenzaka, Shibuya-ku, Tokyo, Shibuya Square B 1F~2F',
        website: 'https://www.ikebe-gakki.com/',
        mapsUrl: 'https://maps.app.goo.gl/JjJDNr9UvfYBT69u5',
      },
      {
        name: 'Kawabe Onsen Ume no Yu',
        description: 'Reol-related holy place hot spring',
        type: 'Reol-related',
        distance: '5 min walk from Kawabe Station',
        address: '10-8-1 Kawabecho, Ome, Tokyo',
        mapsUrl: 'https://maps.app.goo.gl/2WgGzFqg6PmkAgJy8',
      },
    ],
    nearbyRestaurants: [
      {
        name: 'Shibuya PARCO Restaurant Floor',
        cuisine: 'Various',
        description: 'Diverse restaurants in Shibuya PARCO',
        distance: '10 min walk',
        openTime: '11:00-23:00 (varies by shop)',
        price: '¥1,500-¥3,000',
        website: 'https://shibuya.parco.jp/page2/restaurant/',
        mapsUrl: 'https://www.google.com/maps/search/Shibuya+PARCO+Restaurant',
        recommended: true,
        recommendComment: 'Choose from diverse shops! Convenient pre/post-show'
      },
      {
        name: 'Ichiran Shibuya',
        cuisine: 'Ramen',
        description: 'Popular Hakata tonkotsu ramen shop',
        distance: '12 min walk',
        openTime: '24 hours',
        price: '¥900-¥1,200',
        website: 'https://ichiran.com/',
        mapsUrl: 'https://www.google.com/maps/search/Ichiran+Shibuya',
      },
      {
        name: 'Isomaru Suisan Shibuya',
        cuisine: 'Seafood',
        description: 'Fresh seafood and sashimi izakaya',
        distance: '12 min walk',
        openTime: '11:30-23:00',
        price: '¥2,000-¥4,000',
        mapsUrl: 'https://www.google.com/maps/search/Isomaru+Suisan+Shibuya',
        recommended: true,
        recommendComment: 'Fresh seafood available! Good value'
      },
      {
        name: 'Saizeriya Shibuya',
        cuisine: 'Family Restaurant',
        description: 'Reasonable Italian. Convenient pre/post-show',
        distance: '8 min walk',
        openTime: '10:00-23:00',
        price: '¥1,000-¥1,500',
        mapsUrl: 'https://www.google.com/maps/search/Saizeriya+Shibuya',
      }
    ],
    accommodations: [
      {
        name: 'Toyoko Inn Shibuya Shin-Minamiguchi',
        type: 'ビジネスホテル',
        description: 'Great location 5 min walk from Shibuya Station. Clean rooms and free breakfast',
        distance: '5 min walk from Shibuya Station',
        priceRange: '¥7,000-¥10,000 per night',
        features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
        website: 'https://www.toyoko-inn.com/search/detail/00002/',
        mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Shibuya+Shin+Minamiguchi',
        recommended: true,
        recommendComment: 'Near Shibuya Station! Standard for Tokyo trips'
      },
      {
        name: 'Kaikatsu CLUB Shibuya',
        type: 'ネットカフェ',
        description: 'Internet cafe with private rooms. Shower and drink bar available',
        distance: '7 min walk from Shibuya Station',
        priceRange: '¥3,000-¥4,000 per night',
        features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours'],
        website: 'https://www.kaikatsu.jp/shop/shibuya/',
        mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Shibuya',
        recommended: true,
        recommendComment: 'Best for budget! Close to entertainment district too'
      },
      {
        name: 'Capsule Hotel Shibuya',
        type: 'カプセルホテル',
        description: 'Capsule hotel with large public bath and sauna. Women-only floor available',
        distance: '8 min walk from Shibuya Station',
        priceRange: '¥4,000-¥6,000 per night',
        features: ['Large public bath', 'Sauna', 'Women-only floor', 'Free Wi-Fi', 'Coin laundry'],
        mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Shibuya+Station'
      },
      {
        name: 'Hotel Route Inn Shibuya',
        type: 'ビジネスホテル',
        description: 'Business hotel with large public bath. Breakfast buffet well-received',
        distance: '8 min walk from Shibuya Station',
        priceRange: '¥7,500-¥10,000 per night',
        features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
        website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=392',
        mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Shibuya'
      }
    ]
}

export default tokyo_line_cube_en
