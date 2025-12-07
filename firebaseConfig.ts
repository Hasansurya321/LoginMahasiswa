// Firebase configuration for React Native and Web
import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase Configuration
 * For Firebase JS SDK v7.20.0 and later, measurementId is optional
 */
const firebaseConfig = {
  apiKey: 'AIzaSyCXq0SlIFSH6t4Tdl88NjAmnoh6gb7Ujh4',
  authDomain: 'fir-mmkv-mahasiswa.firebaseapp.com',
  projectId: 'fir-mmkv-mahasiswa',
  storageBucket: 'fir-mmkv-mahasiswa.firebasestorage.app',
  messagingSenderId: '722362244090',
  appId: '1:722362244090:web:2af6192e41135bcca56243',
  measurementId: 'G-JKWPXG42SG',
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

/**
 * Initialize Auth with React Native persistence
 * Uses AsyncStorage for token persistence on mobile platforms
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getReactNativePersistence = require('firebase/auth').getReactNativePersistence as any;

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

/**
 * Initialize Firestore
 */
export const db = getFirestore(app);