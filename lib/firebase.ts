// Firebase configuration file for Promography platform
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Firebase configuration - loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error("Firebase configuration incomplete. Please check your .env.local file.")
  console.warn("Missing:", {
    apiKey: !firebaseConfig.apiKey ? "NEXT_PUBLIC_FIREBASE_API_KEY" : "",
    authDomain: !firebaseConfig.authDomain ? "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" : "",
    projectId: !firebaseConfig.projectId ? "NEXT_PUBLIC_FIREBASE_PROJECT_ID" : "",
  })
}

// Initialize Firebase
let app
try {
  app = initializeApp(firebaseConfig)
  console.log("Firebase initialized successfully for project:", firebaseConfig.projectId)
} catch (error) {
  console.error("Failed to initialize Firebase:", error)
  throw error
}

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
