# LoginMahasiswa - Expo + Firebase + MMKV

## 📱 Deskripsi Aplikasi

**LoginMahasiswa** adalah aplikasi mobile React Native berbasis **Expo** yang menampilkan halaman login dan dashboard profil mahasiswa. Aplikasi ini mengintegrasikan **Firebase Authentication**, **Firestore**, dan **MMKV** untuk manajemen data real-time dan penyimpanan lokal yang persisten.

**Repository:** https://github.com/Hasansurya321/LoginMahasiswa

---

## 🎯 Fitur Utama

### 🔐 **Firebase Authentication**
- Login dengan Email & Password
- Session persistence menggunakan AsyncStorage
- Logout dengan clear data lokal

### 📊 **Firestore Integration**
- Menyimpan profil mahasiswa per user (`mahasiswa/{UID}`)
- Field: `nama`, `nim`, `jurusan`, `angkatan`
- Query pattern: `getDoc(doc(db, 'mahasiswa', uid))` untuk single-user data

### 💾 **MMKV Persistent Storage**
- Menyimpan `uid`, `email`, `displayName` secara lokal
- Fallback ke memory storage jika native module tidak tersedia
- Automatic `clearAll()` sebelum save user baru (clean state per user)

### 🎨 **Responsive UI**
- Tab navigation: Home (Login) + Explore (Profile)
- Loading states dan error handling
- Dark theme dengan blue accent color

---

## 🐛 **Bug Fix: Explore Tab Data Caching**

### ❌ Problem (FIXED)
Sebelumnya, tab **Explore** selalu menampilkan data user pertama yang login, bahkan setelah logout dan login dengan user lain. Ini terjadi karena menggunakan `useEffect(() => {...}, [])` yang hanya jalan saat komponen mount.

### ✅ Solution (IMPLEMENTED)
Mengganti `useEffect` dengan **`useFocusEffect`** dari expo-router:
```typescript
useFocusEffect(
  useCallback(() => {
    // Data refetch setiap kali tab Explore difokus
    const uid = storage.getString('uid');
    const data = await getDoc(doc(db, 'mahasiswa', uid));
  }, [])
)
```

**Keuntungan:**
- ✅ Data di-refetch setiap kali user navigasi ke Explore tab
- ✅ MMKV UID selalu terbaca yang terbaru
- ✅ Setiap user melihat hanya data mereka sendiri

---

## 🛠️ Setup & Instalasi

### Prerequisites
- Node.js >= 16
- Expo CLI: `npm install -g expo-cli`
- Firebase project dengan Authentication & Firestore enabled
- Android emulator atau Expo Go di smartphone

### 1. Clone Repository
```bash
git clone https://github.com/Hasansurya321/LoginMahasiswa.git
cd LoginMahasiswa
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Firebase Config
Edit `firebaseConfig.ts` dengan kredensial Firebase Anda:
```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 4. Setup Firestore Data Structure
Di Firebase Console, buat collection **`mahasiswa`** dengan format dokumen:
```
mahasiswa/{UID}
├── nama: "string"
├── nim: "string"
├── jurusan: "string"
└── angkatan: "number"
```

**Penting:** Setiap dokumen ID harus sesuai dengan Firebase Auth UID user.

### 5. Jalankan Aplikasi
```bash
npx expo start
```

Scan QR code dengan Expo Go atau enter ke emulator Android.

---

## 📋 Project Structure

```
LoginMahasiswa/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab navigator
│   │   ├── index.tsx           # Home (Login screen)
│   │   └── explore.tsx         # Explore (Profile display) ⭐ useFocusEffect
│   ├── _layout.tsx             # Root Stack navigator
│   └── index.tsx               # Entry point (Redirect to tabs)
├── lib/
│   └── firestore.ts            # Firestore query utilities
├── components/
│   └── parallax-scroll-view.tsx
├── constants/
├── hooks/
├── assets/
├── storage.ts                  # MMKV wrapper ⭐ clearAll() on login
├── firebaseConfig.ts           # Firebase setup ⭐ No Analytics
├── firebaseConfig.js           # ❌ DELETED (old config)
├── tsconfig.json               # ✅ moduleResolution: bundler
├── babel.config.js             # ✅ module-resolver plugin
├── app.json
└── package.json
```

---

## 🧪 Testing Login Flow (3 User Scenario)

Untuk verifikasi bug sudah fixed, ikuti langkah berikut:

### Test 1: Login Affan
1. Start app: `npx expo start`
2. Login dengan email Affan
3. Tab ke Explore → Verifikasi menampilkan **HANYA data Affan**
4. Buka console → Cari log `📱 Explore Read UID from MMKV: [affan-uid]`

### Test 2: Logout & Login Gherald
1. Logout dari Affan
2. Login dengan email Gherald
3. Tab ke Explore → Verifikasi menampilkan **HANYA data Gherald** (bukan Affan!)
4. Console log harus menunjukkan UID berubah ke Gherald

### Test 3: Logout & Login Hasan
1. Logout dari Gherald
2. Login dengan email Hasan
3. Tab ke Explore → Verifikasi menampilkan **HANYA data Hasan**
4. Console log harus menunjukkan UID berubah ke Hasan

**✅ Success Criteria:** Setiap user melihat data mereka sendiri, bukan stuck di user pertama.

---

## 📝 Key Changes (Latest Commit)

Commit: `af3b64d` - "Fix Explore fetch bug, update MMKV login flow, improve Firebase UID mapping, and refresh full project code"

### Modified Files:
| File | Change |
|------|--------|
| `app/(tabs)/explore.tsx` | ✅ `useEffect` → `useFocusEffect` |
| `app/(tabs)/index.tsx` | ✅ Added login logging (🔐) |
| `storage.ts` | ✅ `setLoginInfo()` calls `clearAll()` |
| `firebaseConfig.ts` | ✅ Removed Firebase Analytics |
| `lib/firestore.ts` | ✅ New: `getMahasiswaByUID(uid)` |
| `tsconfig.json` | ✅ `moduleResolution: bundler` |

### Deleted Files:
- ❌ `firebaseConfig.js` (superseded by TS version)

---

## 🔧 Troubleshooting

### "Explore menampilkan data user lain"
- ✅ Jika masih terjadi, berarti `useFocusEffect` tidak fire
- Check: `npm install expo-router` version >= 6.0.14
- Restart: `npx expo start --clear`

### "MMKV initialization failed"
- Normal di development → fallback ke memory storage
- Di production build, MMKV native module akan ter-link

### "Firebase document not found"
- Pastikan collection path: `mahasiswa/{UID}`
- UID di Firestore harus cocok dengan Firebase Auth UID
- Check di Firebase Console > Firestore > mahasiswa collection

### TypeScript errors
- Run: `npx tsc --noEmit` untuk verify
- Update: `npm install` untuk latest packages

---

## 📚 Dokumentasi Referensi

- **Expo Router:** https://docs.expo.dev/routing/introduction/
- **Firebase JS SDK:** https://firebase.google.com/docs/web/setup
- **React Native MMKV:** https://github.com/mrousavy/react-native-mmkv
- **Firestore Queries:** https://firebase.google.com/docs/firestore/query-data/get-data

---

## 👥 Author
**Hasan Surya** - https://github.com/Hasansurya321

---

## 📄 License
Private project - Gunakan hanya untuk keperluan pribadi/akademik.

---

## 🚀 Next Steps
- [ ] Deploy ke Google Play / Apple App Store
- [ ] Tambah real-time sync dengan `onSnapshot`
- [ ] Tambah edit profile feature
- [ ] Implementasi role-based access control (RBAC)
