// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { GoogleAuthProvider } from "firebase/auth";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4sPqK_Q3RPoaytsu_3MKaWtPB7Xbgtac",
  authDomain: "apriplus-f3223.firebaseapp.com",
  projectId: "apriplus-f3223",
  storageBucket: "apriplus-f3223.firebasestorage.app",
  messagingSenderId: "291086944096",
  appId: "1:291086944096:web:a63fd0f34452e341508005"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const provider = new GoogleAuthProvider();