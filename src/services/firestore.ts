import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { firestore } from './firebase'
import { VENUES_2026 } from '../data/venues'

// 型定義
export interface User {
  id: string
  twitter: {
    username: string
    displayName: string
    profileImage: string
    isVerified: boolean
  }
  profile: {
    favoriteSongs?: string[]
    bio?: string
    joinDate: string
  }
  attendingVenues: string[]
  privacy: {
    showTwitter: boolean
    allowDirectMessage: boolean
  }
}

export interface Venue {
  id: string
  name: string
  date: string
  times: {
    open: string
    start: string
  }
  location: {
    prefecture: string
    city: string
  }
  capacity: number
  attendees: string[]
}

// 開発モードかどうかの判定
const isDevMode = () => process.env.GATSBY_REOLMAP_DEV_MODE === 'true'

// 開発用のモックユーザーデータ
const mockUsers: User[] = [
  {
    id: 'mock_user_123',
    twitter: {
      username: 'reol_dev_user',
      displayName: 'テストユーザー',
      profileImage: '',
      isVerified: false,
    },
    profile: {
      favoriteSongs: ['HYPE MODE', 'エンドロール'],
      bio: 'ReolMap開発用テストアカウント',
      joinDate: '2025-11-16',
    },
    attendingVenues: ['tokyo_line_cube', 'yokohama_kaat', 'osaka_namba_hatch'],
    privacy: {
      showTwitter: true,
      allowDirectMessage: true,
    },
  },
  {
    id: 'mock_user_456',
    twitter: {
      username: 'reol_fan_2',
      displayName: 'Reolファン2',
      profileImage: '',
      isVerified: false,
    },
    profile: {
      bio: 'Reol大好き！',
      joinDate: '2025-11-15',
    },
    attendingVenues: ['tokyo_line_cube', 'sendai_darwin', 'sapporo_kraps_hall'],
    privacy: {
      showTwitter: true,
      allowDirectMessage: true,
    },
  },
  {
    id: 'mock_user_789',
    twitter: {
      username: 'anonymous_user',
      displayName: '匿名ユーザー',
      profileImage: '',
      isVerified: false,
    },
    profile: {
      joinDate: '2025-11-14',
    },
    attendingVenues: ['osaka_namba_hatch', 'fukuoka_drum_logos'],
    privacy: {
      showTwitter: false,
      allowDirectMessage: false,
    },
  },
]

// ユーザー関連
export const createUser = async (userId: string, userData: Omit<User, 'id'>) => {
  if (isDevMode()) {
    console.log('🚀 開発モード: ユーザー作成', { userId, userData })
    return
  }
  
  if (!firestore) {
    throw new Error('Firebase is not initialized')
  }
  
  await setDoc(doc(firestore, 'users', userId), {
    ...userData,
    id: userId,
  })
}

export const getUser = async (userId: string): Promise<User | null> => {
  if (isDevMode()) {
    console.log('🚀 開発モード: ユーザー取得', { userId })
    return mockUsers.find(user => user.id === userId) || null
  }
  
  if (!firestore) {
    return null
  }
  
  const userDoc = await getDoc(doc(firestore, 'users', userId))
  return userDoc.exists() ? (userDoc.data() as User) : null
}

export const updateUserVenues = async (userId: string, venues: string[]) => {
  if (isDevMode()) {
    console.log('🚀 開発モード: 会場更新', { userId, venues })
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      user.attendingVenues = venues
    }
    return
  }
  
  if (!firestore) {
    throw new Error('Firebase is not initialized')
  }
  
  await updateDoc(doc(firestore, 'users', userId), {
    attendingVenues: venues,
  })
}

// 会場関連
export const getVenues = (): Promise<Venue[]> => {
  return new Promise((resolve) => {
    if (isDevMode()) {
      console.log('🚀 開発モード: 会場一覧取得')
      const venues = VENUES_2026.map(venue => ({
        ...venue,
        attendees: mockUsers
          .filter(user => user.attendingVenues.includes(venue.id))
          .map(user => user.id),
        chatroom: `chat_${venue.id}`,
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      resolve(venues)
      return
    }
    
    if (!firestore) {
      resolve([])
      return
    }
    
    const venuesRef = collection(firestore, 'venues')
    onSnapshot(venuesRef, (snapshot) => {
      const venues = snapshot.docs.map(doc => doc.data() as Venue)
      resolve(venues.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    })
  })
}

export const getVenueAttendees = (venueId: string, callback: (users: User[]) => void) => {
  if (isDevMode()) {
    console.log('🚀 開発モード: 会場参加者取得', { venueId })
    const attendees = mockUsers.filter(user => user.attendingVenues.includes(venueId))
    setTimeout(() => callback(attendees), 500)
    return () => {} // unsubscribe function
  }
  
  if (!firestore) {
    callback([])
    return () => {}
  }
  
  const q = query(
    collection(firestore, 'users'),
    where('attendingVenues', 'array-contains', venueId)
  )
  
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => doc.data() as User)
    callback(users)
  })
}