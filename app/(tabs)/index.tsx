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
import { auth } from '../../firebaseConfig';
import { setLoginInfo, getLoginInfo, clearLoginInfo } from '../../storage';

type CurrentUser = {
  uid: string;
  email: string | null;
};

export default function HomeTab() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // restore dari MMKV kalau ada
    const local = getLoginInfo();
    if (local) {
      setCurrentUser({ uid: local.uid, email: local.email });
    }

    // listen perubahan auth firebase
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({ email: user.email, uid: user.uid });
      } else {
        setCurrentUser(null);
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

      console.log('🔐 LOGIN ATTEMPT:', {
        uid: cred.user.uid,
        email: cred.user.email,
      });
      
      // CRITICAL: Clear old data before saving new login
      // This ensures app doesn't read data from previous user
      setLoginInfo({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
      });
      
      console.log('✅ LOGIN SUCCESS - User data saved to MMKV');
      
      Alert.alert('Success', `Login sebagai ${cred.user.email}`);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Terjadi kesalahan');
    }
  };

  const handleLogout = () => {
    signOut(auth);
    clearLoginInfo();
    setCurrentUser(null);
    setEmail('');
    setPassword('');
  };

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
          <Text style={styles.text}>
            UID: {currentUser.uid}
          </Text>
          <Button title="Logout" onPress={handleLogout} />

          <Text style={styles.sectionTitle}>💡 Info</Text>
          <Text style={styles.text}>
            Lihat data mahasiswa Anda di tab "Explore"
          </Text>
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
