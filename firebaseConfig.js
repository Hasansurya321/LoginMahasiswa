// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCXq0SlIFSH6t4Tdl88NjAmnoh6gb7Ujh4',
  authDomain: 'fir-mmkv-mahasiswa.firebaseapp.com',
  projectId: 'fir-mmkv-mahasiswa',
  storageBucket: 'fir-mmkv-mahasiswa.firebasestorage.app',
  messagingSenderId: '722362244090',
  appId: '1:722362244090:web:2af6192e41135bcca56243',
  measurementId: 'G-JKWPXG42SG',
};

const app = initializeApp(firebaseConfig);

// Auth dengan AsyncStorage (bukan analytics)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore
const db = getFirestore(app);

export { app, auth, db };
