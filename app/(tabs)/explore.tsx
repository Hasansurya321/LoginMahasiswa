import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

type Mahasiswa = {
  id: string;
  nama: string;
  nim: string;
  jurusan: string;
  angkatan: number;
};

export default function ExploreTab() {
  const [data, setData] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, 'mahasiswa'));

        const result: Mahasiswa[] = snap.docs.map((doc) => {
          const d = doc.data() as any;
          
          // Debug: log raw data dari Firestore
          console.log('Raw Firestore doc:', doc.id, d);
          
          // Konversi explicit: jika angkatan adalah string, parse ke number
          const angkatanValue = typeof d.angkatan === 'string' 
            ? parseInt(d.angkatan, 10) 
            : d.angkatan;
          
          console.log('Parsed angkatan:', angkatanValue);
          
          return {
            id: doc.id,
            nama: String(d.nama ?? ''),
            nim: String(d.nim ?? ''),
            jurusan: String(d.jurusan ?? ''),
            angkatan: angkatanValue,
          };
        });

        console.log('Final result:', result);
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching mahasiswa data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="white" />
        <Text style={styles.text}>Loading data mahasiswa...</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Belum ada data mahasiswa.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: '#000' }}
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 20 }}
      renderItem={({ item }: { item: Mahasiswa }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.nama}</Text>
          <Text style={styles.text}>NIM: {item.nim}</Text>
          <Text style={styles.text}>Jurusan: {item.jurusan}</Text>
          <Text style={styles.text}>Angkatan: {item.angkatan}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: { color: 'white' },
  card: {
    backgroundColor: '#111',
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
  },
  name: { color: 'white', fontSize: 18, marginBottom: 6 },
});
