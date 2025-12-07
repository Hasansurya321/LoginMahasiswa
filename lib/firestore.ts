/**
 * Firestore utility functions
 * All queries MUST use getDoc(doc(...)) pattern, NOT getDocs
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export interface Mahasiswa {
  nama: string;
  nim: string;
  jurusan: string;
  angkatan?: number;
}

/**
 * Fetch mahasiswa data by UID (document ID must match Firebase Auth UID)
 * CRITICAL: This replaces getDocs(collection(...)) which fetches ALL documents
 * 
 * @param uid - Firebase Auth UID (also the document ID in Firestore)
 * @returns Mahasiswa data or null if not found
 */
export async function getMahasiswaByUID(uid: string): Promise<Mahasiswa | null> {
  try {
    console.log('🔍 Fetching mahasiswa data for UID:', uid);

    // Query single document by UID
    const ref = doc(db, 'mahasiswa', uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn('⚠ No mahasiswa document found for UID:', uid);
      return null;
    }

    const data = snap.data() as Mahasiswa;
    console.log('✓ Data Firestore fetched:', data);

    // Ensure angkatan is number
    if (data.angkatan && typeof data.angkatan === 'string') {
      data.angkatan = parseInt(data.angkatan, 10);
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching mahasiswa:', error instanceof Error ? error.message : error);
    return null;
  }
}
