import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Halo, ini halaman Home 🚀</Text>
      <Text>Expo Router-nya sudah ketemu route "/".</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000', // biar nyatu sama tema gelap
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    color: 'white',
  },
});
