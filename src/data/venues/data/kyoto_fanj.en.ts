import { Venue } from '../types'

export const kyoto_fanj_en: Venue = {
  id: 'kyoto_fanj',
  name: 'Kyoto FANJ',
  date: '2026-05-30T17:00:00+09:00',
  times: { open: '4:00 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Kyoto', 
    city: 'Kyoto',
    address: '48 Otabicho, 2-chome, Teramachidori Shijo-agaru, Shimogyo-ku, Kyoto',
    nearestStation: '3 min walk from Hankyu Kawaramachi Station'
  },
  capacity: 400,
  access: '3 minutes walk from Hankyu Kawaramachi Station on the Hankyu Kyoto Line. Located in the heart of the bustling Shijo-Kawaramachi district.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13062.906161046772!2d135.77329198715822!3d35.06357539999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x600109d4f6424eed%3A0xb863587cf6e7534d!2z5Lqs6YO9RkFOSg!5e0!3m2!1sja!2sus!4v1764574692325!5m2!1sja!2sus',
  venueWebsite: 'http://www.kyoto-fanj.com/information.html',
  parkingInfo: 'No dedicated parking. Please use paid parking lots around Shijo-Kawaramachi area. Public transportation is strongly recommended in Kyoto city.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Kansai International Airport',
        method: 'JR Limited Express Haruka',
        time: 'Approx. 1 hour 15 minutes',
        description: 'JR Limited Express Haruka from Kansai Airport to Kyoto Station → Transfer to Hankyu Line to Kawaramachi Station',
        cost: 'One-way ¥3,600',
        notes: 'Haruka trains run every 30 minutes'
      },
      {
        from: 'Osaka International Airport (Itami)',
        method: 'Airport Bus',
        time: 'Approx. 55 minutes',
        description: 'Limousine bus from Itami Airport to Kyoto Station',
        cost: 'One-way ¥1,370',
        notes: 'Buses run every 20 minutes'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Shinkansen Nozomi',
        time: 'Approx. 2 hours 15 minutes',
        description: 'Shinkansen Nozomi from Tokyo Station to Kyoto Station → Transfer to Subway/Hankyu Line to Kawaramachi Station',
        cost: 'One-way approx. ¥13,500',
        notes: 'Use Hankyu or Subway from Kyoto Station'
      },
      {
        from: 'Osaka',
        method: 'Hankyu Railway',
        time: 'Approx. 45 minutes',
        description: 'Hankyu Kyoto Line Limited Express from Osaka-Umeda Station to Kawaramachi Station',
        cost: 'One-way ¥400',
        notes: 'Trains run every 10 minutes'
      },
      {
        from: 'Nagoya',
        method: 'Shinkansen Nozomi',
        time: 'Approx. 35 minutes',
        description: 'Shinkansen Nozomi from Nagoya Station to Kyoto Station',
        cost: 'One-way approx. ¥5,600',
        notes: 'Transfer to Hankyu from Kyoto Station'
      }
    ],
    fromCar: [
      {
        from: 'Osaka Area',
        method: 'Meishin Expressway',
        time: 'Approx. 50 minutes',
        description: 'Via Meishin Expressway, exit at Kyoto-Minami IC toward Kyoto city. Multiple paid parking lots near venue.',
        cost: 'Highway toll approx. ¥1,200 (Osaka~Kyoto-Minami IC)',
        notes: 'Public transportation recommended due to congestion during tourist season in Kyoto city'
      },
      {
        from: 'Nagoya Area',
        method: 'Meishin Expressway',
        time: 'Approx. 2 hours',
        description: 'Via Meishin Expressway, exit at Kyoto-Minami IC toward Kyoto city.',
        cost: 'Highway toll approx. ¥3,500 (Nagoya~Kyoto-Minami IC)',
        notes: 'Convenient access from Kansai and Chubu regions'
      }
    ],
    recommendations: 'Limited Express Haruka from Kansai Airport is convenient. From Osaka, Hankyu Line takes 45 minutes. Shinkansen users transfer to Hankyu/Subway from Kyoto Station.'
  },
  parkingOptions: [
    {
      name: 'Times Shijo-Kawaramachi',
      description: 'Parking lot in Shijo-Kawaramachi area',
      price: '¥400 per 30 minutes',
      distance: '5 min walk',
      website: 'https://times-info.net/P26-kyoto/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Shijo+Kawaramachi',
    },
    {
      name: 'Kyoto City Shijo Parking',
      description: 'Municipal parking lot',
      price: '¥250 per 30 minutes',
      distance: '7 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Kyoto+City+Shijo+Parking',
    },
  ],
  coinLockers: [
    {
      location: 'Inside Hankyu Kawaramachi Station',
      description: 'Coin lockers inside Hankyu Kawaramachi Station',
      price: '¥300-¥500',
      distance: '3 min walk',
      website: 'https://www.hankyu.co.jp/station/kawaramachi.html',
      mapsUrl: 'https://www.google.com/maps/search/Hankyu+Kawaramachi+Station',
    },
    {
      location: 'Shijo-Kawaramachi Shopping District',
      description: 'Coin lockers in the shopping district',
      price: 'Check for rates',
      distance: '2 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Shijo+Kawaramachi+coin+lockers',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Kyoto Shijo-Omiya',
      description: 'Starbucks in Shijo area',
      distance: '5 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Kyoto+Shijo',
    },
    {
      name: '%Arabica Kyoto',
      description: 'Popular coffee shop originating from Kyoto',
      distance: '10 min walk',
      website: 'https://arabica.coffee/',
      mapsUrl: 'https://www.google.com/maps/search/%Arabica+Kyoto',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Kiyomizu-dera Temple',
      description: 'Iconic Kyoto temple famous for its wooden stage that juts out from the main hall',
      distance: '15 min by bus',
      website: 'https://www.kiyomizudera.or.jp/'
    },
    {
      name: 'Yasaka Shrine',
      description: 'Famous shrine known for the Gion Festival',
      distance: '15 min walk',
      website: 'https://www.yasaka-jinja.or.jp/'
    },
    {
      name: 'Nishiki Market',
      description: '"Kyoto\'s Kitchen" - a market with Kyoto\'s finest ingredients',
      distance: '5 min walk',
      website: 'https://www.kyoto-nishiki.or.jp/'
    }
  ],
  nearbyRestaurants: [
    {
      name: 'Demachi Futaba',
      cuisine: 'Japanese Sweets',
      description: 'Long lines expected for famous mame-mochi. Long-established wagashi shop since 1899',
      distance: '3 min walk',
      openTime: '8:30-17:30',
      price: '¥200-¥500',
      mapsUrl: 'https://www.google.com/maps/search/Demachi+Futaba+Kyoto',
      recommended: true,
      recommendComment: 'Super famous shop near Demachiyanagi! Mame-mochi is a must-try with long lines'
    },
    {
      name: 'Pontocho Rokkon',
      cuisine: 'Kyoto Cuisine',
      description: 'Kyoto cuisine restaurant in Pontocho. Kaiseki using seasonal ingredients',
      distance: '8 min walk',
      openTime: '5:00 PM-11:00 PM',
      price: '¥5,000-¥10,000',
      mapsUrl: 'https://www.google.com/maps/search/Rokkon+Pontocho',
      recommended: true,
      recommendComment: 'Authentic Kyoto cuisine in the atmospheric Pontocho district'
    },
    {
      name: 'Chuka no Sakai Honten',
      cuisine: 'Chinese',
      description: 'Beloved Kyoto local Chinese restaurant. Famous for cold noodles',
      distance: '15 min walk',
      openTime: '11:30-21:00',
      price: '¥800-¥1,200',
      mapsUrl: 'https://www.google.com/maps/search/Chuka+no+Sakai+Kyoto+Kitaoji',
    },
    {
      name: 'Nadai Omen Ginkakuji Honten',
      cuisine: 'Udon',
      description: 'Popular hand-made udon restaurant in Kyoto. Dipping noodle style is signature',
      distance: '15 min by bus',
      openTime: '11:00-21:00',
      price: '¥1,200-¥1,800',
      website: 'https://www.omen.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Omen+Ginkakuji+Kyoto',
      recommended: true,
      recommendComment: 'Popular Kyoto udon shop! Chewy hand-made udon is exquisite'
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Kyoto Shijo-Karasuma',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Shijo Station. Clean rooms and free breakfast',
      distance: '3 min walk from Shijo Station',
      priceRange: '¥6,000-¥8,500 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.toyoko-inn.com/search/detail/00025/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Kyoto+Shijo+Karasuma',
      recommended: true,
      recommendComment: 'Near Shijo Station and convenient! Standard choice for Kyoto trips'
    },
    {
      name: 'Kaikatsu CLUB Kyoto Kawaramachi',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '5 min walk from Kawaramachi Station',
      priceRange: '¥2,500-¥3,500 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours'],
      website: 'https://www.kaikatsu.jp/shop/kyoto-kawaramachi/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Kyoto+Kawaramachi',
      recommended: true,
      recommendComment: 'Close to entertainment district! Best for budget travelers'
    },
    {
      name: 'Nine Hours Kyoto',
      type: 'カプセルホテル',
      description: 'Design-focused capsule hotel. Comfortable sleeping space with shower booths',
      distance: '5 min walk from Shijo Station',
      priceRange: '¥4,500-¥6,000 per night',
      features: ['Shower booths', 'Free Wi-Fi', 'Lockers', 'Sophisticated design', 'Women-only floor'],
      website: 'https://ninehours.co.jp/kyoto/',
      mapsUrl: 'https://www.google.com/maps/search/Nine+Hours+Kyoto',
      recommended: true,
      recommendComment: 'Comfortable capsule hotel balancing design and functionality! Exceptionally clean'
    },
    {
      name: 'Capsule Hotel Kyoto',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna. Women-only floor available',
      distance: '6 min walk from Shijo Station',
      priceRange: '¥3,500-¥5,000 per night',
      features: ['Large public bath', 'Sauna', 'Women-only floor', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Kyoto+Shijo'
    },
    {
      name: 'Hotel Route Inn Kyoto Shijo-Karasuma',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Breakfast buffet well-received',
      distance: '7 min walk from Shijo Station',
      priceRange: '¥6,500-¥9,000 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=440',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Kyoto+Shijo+Karasuma'
    }
  ]
}

export default kyoto_fanj_en
