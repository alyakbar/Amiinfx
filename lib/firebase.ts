import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBQv1lnjRzvWWMjBVyWYY9vHoESd-JiOGE",
  authDomain: "amiinfx.firebaseapp.com",
  projectId: "amiinfx",
  storageBucket: "amiinfx.firebasestorage.app",
  messagingSenderId: "146263318862",
  appId: "1:146263318862:web:69be915e7a101bee2bbe1f",
  measurementId: "G-KWDT67LN0W",
}

// Initialize Firebase app
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
