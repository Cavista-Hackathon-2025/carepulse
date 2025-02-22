// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7JA78q7DVNqLzWERzsLIM06Zx3QF2WMg",
  authDomain: "carepulse-f10c4.firebaseapp.com",
  projectId: "carepulse-f10c4",
  storageBucket: "carepulse-f10c4.firebasestorage.app",
  messagingSenderId: "578150240928",
  appId: "1:578150240928:web:a756d839b84bf4e4a92fc5",
  measurementId: "G-GGSNHPQGBZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);