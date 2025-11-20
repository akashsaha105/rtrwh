// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAftOL0C6PCSs8X3qQu3vnDfFrNbHK3A2c",
  authDomain: "rtrwh-70186.firebaseapp.com",
  projectId: "rtrwh-70186",
  storageBucket: "rtrwh-70186.firebasestorage.app",
  messagingSenderId: "201611531946",
  appId: "1:201611531946:web:6d3a9062ffe74c1bd3e2d3",
  measurementId: "G-GTS4B8L5YZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

const analytics = getAnalytics(app);