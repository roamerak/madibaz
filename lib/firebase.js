import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA8whx3piPehaeY2uXMlTFB7mLnJ8BEvTg",
  authDomain: "madibaz-rugby-2.firebaseapp.com",
  projectId: "madibaz-rugby-2",
  storageBucket: "madibaz-rugby-2.firebasestorage.app",
  messagingSenderId: "658373504194",
  appId: "1:658373504194:web:ac21b5f1175a2165835f5b",
  measurementId: "G-0M0P0MHG7M"};

  // Prevent duplicate app initialization
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

// ✅ THESE EXPORTS WERE MISSING
export const db = getFirestore(app);
export const storage = getStorage(app);