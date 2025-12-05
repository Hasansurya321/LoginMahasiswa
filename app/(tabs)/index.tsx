import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { setLoginInfo, getLoginInfo, clearLoginInfo } from '../../storage';

type CurrentUser = {
  uid: string;
  email: string | null;
};

type Mahasiswa = {
  id: string;
  nama: string;
  nim: string;
  jurusan: string;
};

export default function HomeTab() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [students, setStudents] = useState<Mahasiswa[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  async function loadStudents() {
    try {
      setLoadingStudents(true);

      const snap = await getDocs(collection(db, 'mahasiswa'));

      const data: Mahasiswa[] = snap.docs.map((doc) => {
        const raw = doc.data();
        console.log('Dokumen mahasiswa:', doc.id, raw);
        return {
          id: doc.id,
          nama: String(raw.nama ?? ''),
          nim: String(raw.nim ?? ''),
          jurusan: String(raw.jurusan ?? ''),
        };
      });

      setStudents(data);
    } catch (err) {
      console.log('Gagal load mahasiswa:', err);
      Alert.alert('Error', 'Gagal mengambil data mahasiswa');
    } finally {
      setLoadingStudents(false);
    }
  }

  useEffect(() => {
    // restore dari MMKV kalau ada
    const local = getLoginInfo();
    if (local) {
      setCurrentUser({ uid: local.uid, email: local.email });
      loadStudents();
    }

    // listen perubahan auth firebase
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({ email: user.email, uid: user.uid });
        loadStudents();
      } else {
        setCurrentUser(null);
        setStudents([]);
      }
    });

    return unsub;
  }, []);

  const handleLogin = async () => {
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      setLoginInfo(cred.user); // simpan ke MMKV
      Alert.alert('Success', 'Login berhasil!');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Terjadi kesalahan');
    }
  };

  const handleLogout = () => {
    signOut(auth);
    clearLoginInfo();
    setCurrentUser(null);
    setStudents([]);
    setEmail('');
    setPassword('');
  };

  const firstStudent = students.length > 0 ? students[0] : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Firebase Auth + Firestore + MMKV</Text>

      {!currentUser ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#888"
            onChangeText={setPassword}
          />
          <Button title="Login" onPress={handleLogin} />
        </>
      ) : (
        <>
          <Text style={styles.text}>
            Login sebagai: {currentUser.email ?? '(tanpa email)'}
          </Text>
          <Button title="Logout" onPress={handleLogout} />

          {/* CARD UTAMA – 1 DATA MAHASISWA */}
          <Text style={styles.sectionTitle}>Data Mahasiswa di Firestore:</Text>

          {loadingStudents ? (
            <Text style={styles.text}>Memuat data...</Text>
          ) : !firstStudent ? (
            <Text style={styles.text}>Belum ada data mahasiswa.</Text>
          ) : (
            <View style={styles.highlightCard}>
              <Text style={styles.cardName}>{firstStudent.nama}</Text>
              <Text style={styles.cardText}>NIM: {firstStudent.nim}</Text>
              <Text style={styles.cardText}>
                Jurusan: {firstStudent.jurusan}
              </Text>
            </View>
          )}

          {/* LIST LENGKAP MAHASISWA */}
          <Text style={styles.sectionTitle}>Data Mahasiswa</Text>

          {loadingStudents ? (
            <Text style={styles.text}>Memuat data...</Text>
          ) : students.length === 0 ? (
            <Text style={styles.text}>Belum ada data mahasiswa.</Text>
          ) : (
            students.map((mhs) => (
              <View key={mhs.id} style={styles.card}>
                <Text style={styles.cardName}>{mhs.nama}</Text>
                <Text style={styles.cardText}>NIM: {mhs.nim}</Text>
                <Text style={styles.cardText}>Jurusan: {mhs.jurusan}</Text>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000',
    padding: 20,
    alignItems: 'stretch',
  },
  title: {
    color: 'white',
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    color: 'white',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#555',
    padding: 10,
    borderRadius: 8,
    color: 'white',
    marginBottom: 10,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  highlightCard: {
    borderWidth: 1,
    borderColor: '#00A2FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#111',
  },
  card: {
    borderWidth: 1,
    borderColor: '#555',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#111',
  },
  cardName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  cardText: {
    color: 'white',
  },
});
