import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { getMahasiswaByUID, Mahasiswa } from '@/lib/firestore';
import { storage } from '../../storage';

export default function ExploreTab() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⭐ CRITICAL FIX: Use useFocusEffect instead of useEffect
  // This ensures data is fetched EVERY TIME the Explore tab is focused
  // Solves the bug where Explore was stuck on first user's data
  useFocusEffect(
    useCallback(() => {
      async function loadUserData() {
        try {
          setLoading(true);
          setError(null);

          // Get UID from MMKV storage (updated on every login)
          let uid = storage.getString('uid');
          console.log('📱 Explore Read UID from MMKV:', uid);

          // Fallback: Try auth.currentUser
          if (!uid && auth.currentUser) {
            uid = auth.currentUser.uid;
            console.log('📱 Fallback: Got UID from auth.currentUser:', uid);
          }

          if (!uid) {
            console.warn('⚠️ No UID found - user not logged in');
            setError('Silakan login terlebih dahulu');
            setMahasiswa(null);
            setLoading(false);
            return;
          }

          // Query Firestore by UID
          console.log('🔍 Querying Firestore for mahasiswa/{uid}:', uid);
          const ref = doc(db, 'mahasiswa', uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            const data = snap.data() as Mahasiswa;
            console.log('✅ Explore Data fetched:', data);
            setMahasiswa(data);
            setError(null);
          } else {
            console.warn('⚠️ No mahasiswa document found for UID:', uid);
            setError('Data mahasiswa tidak ditemukan. Hubungi admin.');
            setMahasiswa(null);
          }

          setLoading(false);
        } catch (err) {
          console.error('❌ Error loading mahasiswa:', err);
          setError('Gagal mengambil data mahasiswa');
          setMahasiswa(null);
          setLoading(false);
        }
      }

      loadUserData();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="white" size="large" />
        <Text style={styles.text}>Loading data mahasiswa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: '#ff6b6b' }]}>{error}</Text>
      </View>
    );
  }

  if (!mahasiswa) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Data tidak tersedia</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{mahasiswa.nama}</Text>
        <Text style={styles.text}>NIM: {mahasiswa.nim}</Text>
        <Text style={styles.text}>Jurusan: {mahasiswa.jurusan}</Text>
        {mahasiswa.angkatan && (
          <Text style={styles.text}>Angkatan: {mahasiswa.angkatan}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: 'white',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#00A2FF',
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  name: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
