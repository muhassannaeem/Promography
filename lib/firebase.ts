// Firebase configuration file for Promography platform
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyD18-JXUR7tpHjR5lVM3WIA8lfGUPhnmFc",
  authDomain: "promohragpy.firebaseapp.com",
  projectId: "promohragpy",
  storageBucket: "promohragpy.firebasestorage.app",
  messagingSenderId: "800291298057",
  appId: "1:800291298057:web:346c647cec3b541da111d8",
  measurementId: "G-GYY45W0F1H"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
