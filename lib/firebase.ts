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


// import { initializeApp, getApps } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };

// const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
// export const db = getFirestore(app);
