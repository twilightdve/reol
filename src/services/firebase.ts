import { initializeApp } from 'firebase/app'
import { getAuth, TwitterAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.GATSBY_FIREBASE_API_KEY,
  authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.GATSBY_FIREBASE_PROJECT_ID,
  storageBucket: process.env.GATSBY_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.GATSBY_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.GATSBY_FIREBASE_APP_ID,
  databaseURL: process.env.GATSBY_FIREBASE_DATABASE_URL,
}

// Firebase設定の検証
const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey && 
    firebaseConfig.authDomain && 
    firebaseConfig.projectId
  )
}

// 開発モードかどうかの判定
const isDevMode = () => process.env.GATSBY_REOLMAP_DEV_MODE === 'true'

// Firebase初期化（設定がある場合のみ）
let app: any = null
let auth: any = null
let firestore: any = null
let realtimeDb: any = null
let twitterProvider: any = null

if (typeof window !== 'undefined' && !isDevMode() && isFirebaseConfigured()) {
  try {
    // Firebase初期化中
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    firestore = getFirestore(app)
    twitterProvider = new TwitterAuthProvider()
    // Firebase初期化完了
  } catch (error) {
    console.error('❌ Firebase初期化エラー:', error)
  }
} else if (isDevMode()) {
  // ReolMap開発モード（Firebase無効）
}

export { auth, firestore, realtimeDb, twitterProvider }
export default app