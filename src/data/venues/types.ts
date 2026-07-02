// Reol 美辞学ツアー 2026 会場データ型定義

export interface VenueLocation {
  prefecture: string
  city: string
  address?: string
  nearestStation?: string
}

export interface VenueTimes {
  open: string
  start: string
}

export interface NearbyAttraction {
  name: string
  description: string
  distance?: string
  website?: string
}

export interface NearbyRestaurant {
  name: string
  cuisine: string
  description: string
  distance?: string
  openTime?: string
  price?: string
  website?: string
  mapsUrl?: string
  recommended?: boolean
  recommendComment?: string
}

export interface CoinLocker {
  location?: string
  name?: string
  description: string
  price?: string
  distance?: string
  website?: string
  mapsUrl?: string
  recommended?: boolean
  recommendComment?: string
}

export interface Cafe {
  name: string
  description: string
  distance?: string
  openTime?: string
  wifi?: boolean
  website?: string
  mapsUrl?: string
  address?: string
  recommended?: boolean
  recommendComment?: string
}

export interface ParkingInfo {
  name: string
  description: string
  price?: string
  distance?: string
  website?: string
  address?: string
  mapsUrl?: string
  recommended?: boolean
  recommendComment?: string
}

export interface HolyPlace {
  name: string
  description: string
  address?: string
  distance?: string
  type?: string
  title?: string
  needsCost?: boolean
  needsPermission?: boolean
  website?: string
  mapsUrl?: string
}

export interface AccessRoute {
  from: string
  method?: string
  time?: string
  description: string
  cost?: string
  notes?: string
}

export interface LongDistanceAccess {
  fromAirport?: AccessRoute[]
  fromShinkansen?: AccessRoute[]
  fromExpressBus?: AccessRoute[]
  fromCar?: AccessRoute[]
  fromMainland?: AccessRoute[]
  recommendations?: string
}

export interface VenueImage {
  url: string
  thumbnail?: string
  source: 'unsplash' | 'pixabay' | 'find47' | 'other'
  photographer?: string
  photographerUrl?: string
  alt: string
  description?: string
}

export interface Accommodation {
  name: string
  type: 'ビジネスホテル' | 'シティホテル' | 'カプセルホテル' | 'ネットカフェ' | '温浴施設' | 'ゲストハウス'
  description: string
  distance?: string
  priceRange?: string
  features?: string[]
  website?: string
  mapsUrl?: string
  recommended?: boolean
  recommendComment?: string
}

export interface VenueGradient {
  from: string  // グラデーション開始色
  to: string    // グラデーション終了色
}

export interface Venue {
  id: string
  name: string
  date: string
  times: VenueTimes
  location: VenueLocation
  capacity: number
  access?: string
  mapEmbedUrl?: string
  venueImage?: VenueImage
  coinLockers?: CoinLocker[]
  cafes?: Cafe[]
  parkingOptions?: ParkingInfo[]
  nearbyAttractions?: NearbyAttraction[]
  holyPlaces?: HolyPlace[]
  nearbyRestaurants?: NearbyRestaurant[]
  accommodations?: Accommodation[]
  venueWebsite?: string
  parkingInfo?: string
  longDistanceAccess?: LongDistanceAccess
  gradient?: VenueGradient  // 会場ごとのグラデーションカラー
}
