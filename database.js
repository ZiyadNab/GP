// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXoNU-5YnliaFpyO6AfnG1BOhkwABcBLs",
  authDomain: "gp-2-8f055.firebaseapp.com",
  projectId: "gp-2-8f055",
  storageBucket: "gp-2-8f055.appspot.com",
  messagingSenderId: "671605215291",
  appId: "1:671605215291:web:641bc12c2f6fa490044c1e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const storage = getStorage(app)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
})

export { app, auth, db, storage }