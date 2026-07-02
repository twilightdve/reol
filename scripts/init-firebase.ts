import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore'
import { VENUES_2026 } from '../src/data/venues'

// Firebase設定（環境変数から取得）
const firebaseConfig = {
  apiKey: process.env.GATSBY_FIREBASE_API_KEY,
  authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.GATSBY_FIREBASE_PROJECT_ID,
  storageBucket: process.env.GATSBY_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.GATSBY_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.GATSBY_FIREBASE_APP_ID,
}

async function initializeFirebaseData() {
  try {
    // Firebase初期化
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)

    console.log('🔥 Firebase初期化完了')
    console.log('📊 会場データを登録中...')

    // 会場データの登録
    for (const venue of VENUES_2026) {
      const venueData = {
        ...venue,
        attendees: [], // 初期は空配列
      }

      await setDoc(doc(db, 'venues', venue.id), venueData)
      console.log(`✅ ${venue.name} を登録しました`)
    }

    console.log('🎉 すべての会場データの登録が完了しました！')
    console.log(`📍 登録された会場数: ${VENUES_2026.length}会場`)

    // 初期化完了
    console.log('\n🚀 ReolMapの準備が整いました！')
    console.log('💡 次のステップ:')
    console.log('1. Firebase AuthenticationでTwitter認証を有効化')
    console.log('2. Firestoreのセキュリティルールを設定')
    console.log('3. Realtime Databaseでチャット機能を設定')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  }
}

// 実行
if (require.main === module) {
  initializeFirebaseData()
}

export default initializeFirebaseData