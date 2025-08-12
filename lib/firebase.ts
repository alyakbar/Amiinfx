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
import type { FirebaseApp } from "firebase/app";
let firebaseApp: FirebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

// Initialize services
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export default firebaseApp;




