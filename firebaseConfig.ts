// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXq0SlIFSH6t4Tdl88NjAmnoh6gb7Ujh4",
  authDomain: "fir-mmkv-mahasiswa.firebaseapp.com",
  projectId: "fir-mmkv-mahasiswa",
  storageBucket: "fir-mmkv-mahasiswa.firebasestorage.app",
  messagingSenderId: "722362244090",
  appId: "1:722362244090:web:2af6192e41135bcca56243",
  measurementId: "G-JKWPXG42SG"
};

// Initialize Firebase
// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Auth (React Native needs initializeAuth + AsyncStorage persistence)
// Use dynamic import for `getReactNativePersistence` because some firebase
// package versions expose it in different modules and TypeScript types may
// not be available. Using require avoids a compile-time type error while
// still working at runtime.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getReactNativePersistence = require('firebase/auth').getReactNativePersistence as any;

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore
export const db = getFirestore(app);

// Analytics (only available in web builds)
export const analytics = getAnalytics(app);