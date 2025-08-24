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




// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyCblqqMH-B0N_T4km95baLn75jpgccdkmU",
//   authDomain: "test-726ff.firebaseapp.com",
//   projectId: "test-726ff",
//   storageBucket: "test-726ff.firebasestorage.app",
//   messagingSenderId: "421228481769",
//   appId: "1:421228481769:web:c6edb83bed4c7fc1fe3478",
//   measurementId: "G-EBT5RLKC56"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);