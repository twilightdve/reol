import { Venue } from '../types'

export const osaka_orix_theater_en: Venue = {
  id: 'osaka_orix_theater',
  name: 'ORIX Theater',
  date: '2026-06-19T17:00:00+09:00',
  times: { open: '4:00 PM', start: '5:00 PM' },
  location: { 
    prefecture: 'Osaka', 
    city: 'Osaka',
    address: '1-14-15 Shinmachi, Nishi-ku, Osaka',
    nearestStation: '1 min walk from Yotsubashi Station (Osaka Metro)'
  },
  capacity: 2400,
  access: '1 minute walk from Exit 3 of Yotsubashi Station (Osaka Metro Yotsubashi Line). 8 minutes walk from Shinsaibashi.',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13124.221636888064!2d135.495387!3d34.678551!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e7b24b87684b%3A0xc8ccca24d40d8902!2z44Kq44Oq44OD44Kv44K55YqH5aC0!5e0!3m2!1sja!2sus!4v1764574776410!5m2!1sja!2sus',
  venueWebsite: 'https://www.orixtheater.jp/access/',
  parkingInfo: 'No dedicated parking. Please use nearby paid parking lots. Public transportation is recommended.',
  longDistanceAccess: {
    fromAirport: [
      {
        from: 'Kansai International Airport',
        method: 'JR Kansai Airport Rapid + Subway',
        time: 'Approx. 1 hour',
        description: 'JR Kansai Airport Rapid from Kansai Airport to Namba → Osaka Metro Yotsubashi Line to Yotsubashi Station',
        cost: 'One-way approx. ¥1,400',
        notes: 'Transfer to subway at Namba Station'
      },
      {
        from: 'Osaka International Airport (Itami)',
        method: 'Limousine Bus + Subway',
        time: 'Approx. 40 minutes',
        description: 'Limousine bus from Itami Airport to Namba → Subway to Yotsubashi Station',
        cost: 'One-way approx. ¥650',
        notes: 'Transfer to subway at Namba Station'
      }
    ],
    fromShinkansen: [
      {
        from: 'Tokyo',
        method: 'Shinkansen Nozomi + Subway',
        time: 'Approx. 3 hours',
        description: 'Shinkansen Nozomi from Tokyo to Shin-Osaka → Midosuji Line to Shinsaibashi → Yotsubashi Line to Yotsubashi',
        cost: 'One-way approx. ¥14,000',
        notes: 'Approx. 15 min by subway from Shin-Osaka'
      },
      {
        from: 'Nagoya',
        method: 'Shinkansen Nozomi + Subway',
        time: 'Approx. 1 hour 15 minutes',
        description: 'Shinkansen Nozomi from Nagoya to Shin-Osaka → Subway to Yotsubashi Station',
        cost: 'One-way approx. ¥6,500',
        notes: 'Approx. 15 min by subway from Shin-Osaka'
      },
      {
        from: 'Hiroshima',
        method: 'Shinkansen Nozomi + Subway',
        time: 'Approx. 1 hour 45 minutes',
        description: 'Shinkansen Nozomi from Hiroshima to Shin-Osaka → Subway to Yotsubashi Station',
        cost: 'One-way approx. ¥10,500',
        notes: 'Approx. 15 min by subway from Shin-Osaka'
      },
      {
        from: 'Fukuoka',
        method: 'Shinkansen Nozomi + Subway',
        time: 'Approx. 2 hours 45 minutes',
        description: 'Shinkansen Nozomi from Hakata to Shin-Osaka → Subway to Yotsubashi Station',
        cost: 'One-way approx. ¥15,500',
        notes: 'Approx. 15 min by subway from Shin-Osaka'
      }
    ],
    fromCar: [
      {
        from: 'Tokyo Area',
        method: 'Tomei/Meishin Expressway',
        time: 'Approx. 5 hours 30 minutes',
        description: 'Via Tomei/Meishin Expressway, exit at Suita IC or Toyonaka IC toward Osaka city. Multiple paid parking lots near venue.',
        cost: 'Highway toll approx. ¥11,000 (Tokyo~Suita IC)',
        notes: 'Long distance drive - take breaks as needed. Weekend traffic congestion likely'
      },
      {
        from: 'Nagoya Area',
        method: 'Meishin Expressway',
        time: 'Approx. 2 hours 30 minutes',
        description: 'Via Meishin Expressway, exit at Suita IC or Toyonaka IC toward Osaka city.',
        cost: 'Highway toll approx. ¥4,500 (Nagoya~Suita IC)',
        notes: 'Meishin Expressway may be congested on weekends'
      }
    ],
    recommendations: '1 hour from Kansai Airport, 40 min from Itami. Shinkansen users: 15 min by subway from Shin-Osaka.'
  },
  parkingOptions: [
    {
      name: 'Times Shinmachi',
      description: 'Parking lot near venue',
      price: '¥300 per 30 minutes',
      distance: '3 min walk',
      website: 'https://times-info.net/P27-osaka/',
      mapsUrl: 'https://www.google.com/maps/search/Times+Shinmachi+Osaka',
    },
    {
      name: 'Shinsaibashi Parking',
      description: 'Parking lot in Shinsaibashi',
      price: 'Check for rates',
      distance: '8 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Shinsaibashi+Parking',
    },
  ],
  coinLockers: [
    {
      location: 'Inside Yotsubashi Station',
      description: 'Coin lockers at Osaka Metro Yotsubashi Station',
      price: '¥300-¥600',
      distance: '1 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Yotsubashi+Station',
    },
    {
      location: 'Shinsaibashi Station',
      description: 'Coin lockers at Shinsaibashi Station',
      price: '¥300-¥600',
      distance: '8 min walk',
      website: 'https://subway.osakametro.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Shinsaibashi+Station',
    },
  ],
  cafes: [
    {
      name: 'Starbucks Shinsaibashi',
      description: 'Starbucks in Shinsaibashi',
      distance: '7 min walk',
      mapsUrl: 'https://www.google.com/maps/search/Starbucks+Shinsaibashi',
    },
    {
      name: 'Komeda Coffee Shinsaibashi',
      description: 'Komeda Coffee for pre/post-show relaxation',
      distance: '10 min walk',
      website: 'https://www.komeda.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Komeda+Coffee+Shinsaibashi',
    },
  ],
  nearbyAttractions: [
    {
      name: 'Shinsaibashi-suji Shopping Street',
      description: 'Osaka\'s iconic shopping street. Shopping and gourmet',
      distance: '8 min walk',
      website: 'https://www.shinsaibashi.or.jp/'
    },
    {
      name: 'Dotonbori',
      description: 'Famous Osaka tourist spot. Known for Glico sign',
      distance: '12 min walk',
      website: 'https://www.dotonbori.or.jp/'
    },
    {
      name: 'Amerikamura',
      description: 'Youth culture hub. Many vintage clothing stores and cafes',
      distance: '5 min walk',
      website: 'https://www.amerikamura.jp/'
    }
  ],
  holyPlaces: [
    {
      name: 'Teppanyaro Urasando',
      description: 'Displays spatula signed by Reol',
      type: 'Reol-related',
      distance: '5 min walk from Shinsaibashi Station',
      address: 'Chuo-ku, Osaka',
      mapsUrl: 'https://www.google.com/maps/search/Teppanyaro+Urasando+Osaka',
    },
    {
      name: 'Umeda Coffee-kan YC',
      description: 'Reol has visited',
      type: 'Reol-related',
      distance: '5 min walk from Umeda Station',
      address: 'Kita-ku, Osaka',
      mapsUrl: 'https://www.google.com/maps/search/Umeda+Coffee-kan+YC',
    },
  ],
  nearbyRestaurants: [
    {
      name: 'Kukuru Honten',
      cuisine: 'Takoyaki',
      description: 'Famous shop for Osaka specialty takoyaki. Crispy outside, gooey inside',
      distance: '10 min walk',
      openTime: '10:00-22:30',
      price: '¥500-¥1,000',
      website: 'https://www.shirohato.com/kukuru/',
      mapsUrl: 'https://www.google.com/maps/search/Kukuru+Dotonbori',
      recommended: true,
      recommendComment: 'Osaka means takoyaki! Kukuru is an essential famous shop'
    },
    {
      name: 'Chibo Honten',
      cuisine: 'Okonomiyaki',
      description: 'Long-established okonomiyaki restaurant representing Osaka',
      distance: '12 min walk',
      openTime: '11:00-23:00',
      price: '¥1,000-¥2,000',
      website: 'https://www.chibo.com/',
      mapsUrl: 'https://www.google.com/maps/search/Chibo+Dotonbori',
      recommended: true,
      recommendComment: 'Authentic okonomiyaki here! Fluffy and exquisite'
    },
    {
      name: 'Jiyuken Honten',
      cuisine: 'Western Food',
      description: 'Long-established shop for Osaka specialty curry. Unique style of mixing before eating',
      distance: '10 min walk',
      openTime: '11:30-20:30',
      price: '¥800-¥1,200',
      website: 'https://www.jiyuken.co.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Jiyuken+Namba+Honten',
      recommended: true,
      recommendComment: 'Osaka\'s long-established Western restaurant! Specialty curry has unchanged taste since founding'
    },
    {
      name: 'Hokkyokusei Shinsaibashi Honten',
      cuisine: 'Omurice',
      description: 'Birthplace of omurice. Fluffy eggs are exquisite',
      distance: '8 min walk',
      openTime: '11:30-21:30',
      price: '¥1,200-¥1,800',
      website: 'https://hokkyokusei.jp/',
      mapsUrl: 'https://www.google.com/maps/search/Hokkyokusei+Shinsaibashi',
      recommended: true,
      recommendComment: 'Original omurice! Traditional taste only available here'
    }
  ],
  accommodations: [
    {
      name: 'Toyoko Inn Osaka Shinsaibashi',
      type: 'ビジネスホテル',
      description: 'Great location 3 min walk from Shinsaibashi Station. Clean rooms and free breakfast',
      distance: '3 min walk from Shinsaibashi Station',
      priceRange: '¥6,000-¥8,500 per night',
      features: ['Free breakfast', 'Free Wi-Fi', 'Coin laundry', 'Near station'],
      website: 'https://www.toyoko-inn.com/search/detail/00035/',
      mapsUrl: 'https://www.google.com/maps/search/Toyoko+Inn+Osaka+Shinsaibashi',
      recommended: true,
      recommendComment: 'Near Shinsaibashi entertainment district! Standard for Osaka trips'
    },
    {
      name: 'Kaikatsu CLUB Osaka Shinsaibashi',
      type: 'ネットカフェ',
      description: 'Internet cafe with private rooms. Shower and drink bar available',
      distance: '5 min walk from Shinsaibashi Station',
      priceRange: '¥2,800-¥3,800 per night',
      features: ['Private rooms', 'Free shower', 'Drink bar', 'Unlimited manga', '24 hours'],
      website: 'https://www.kaikatsu.jp/shop/osaka-shinsaibashi/',
      mapsUrl: 'https://www.google.com/maps/search/Kaikatsu+CLUB+Osaka+Shinsaibashi',
      recommended: true,
      recommendComment: 'Close to entertainment district! Best for budget travelers'
    },
    {
      name: 'Nine Hours Namba Station',
      type: 'カプセルホテル',
      description: 'Design-focused capsule hotel. Comfortable sleeping space with shower booths',
      distance: '3 min walk from Namba Station',
      priceRange: '¥4,500-¥6,000 per night',
      features: ['Shower booths', 'Free Wi-Fi', 'Lockers', 'Sophisticated design', 'Women-only floor'],
      website: 'https://ninehours.co.jp/namba/',
      mapsUrl: 'https://www.google.com/maps/search/Nine+Hours+Namba+Station',
      recommended: true,
      recommendComment: 'Comfortable capsule hotel balancing design and functionality! Directly connected to Namba Station'
    },
    {
      name: 'Capsule Hotel Osaka',
      type: 'カプセルホテル',
      description: 'Capsule hotel with large public bath and sauna. Women-only floor available',
      distance: '6 min walk from Shinsaibashi Station',
      priceRange: '¥3,500-¥5,000 per night',
      features: ['Large public bath', 'Sauna', 'Women-only floor', 'Free Wi-Fi', 'Coin laundry'],
      mapsUrl: 'https://www.google.com/maps/search/Capsule+Hotel+Osaka+Shinsaibashi'
    },
    {
      name: 'Hotel Route Inn Osaka Honmachi',
      type: 'ビジネスホテル',
      description: 'Business hotel with large public bath. Breakfast buffet well-received',
      distance: '5 min walk from Honmachi Station',
      priceRange: '¥6,500-¥9,000 per night',
      features: ['Large public bath', 'Free breakfast', 'Free Wi-Fi', 'Coin laundry'],
      website: 'https://www.route-inn.co.jp/search/hotel/index.php?hotel_id=368',
      mapsUrl: 'https://www.google.com/maps/search/Hotel+Route+Inn+Osaka+Honmachi'
    }
  ]
}

export default osaka_orix_theater_en
