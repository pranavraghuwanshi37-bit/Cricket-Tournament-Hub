import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, onSnapshot, query, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Registration, RegistrationForm } from '@/types';

export function useRegistration(id: string | null) {
  const [data, setData] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchDoc = async () => {
      try {
        const docRef = doc(db, 'registrations', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data() as Registration);
        } else {
          setData(null);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  return { data, loading, error };
}

export function useAdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try ordered query first; fall back to unordered if index is missing
    const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Registration[] = [];
        snapshot.forEach((d) => data.push(d.data() as Registration));
        setRegistrations(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore error:', err);
        // If orderBy index missing, retry without ordering
        if (err.code === 'failed-precondition') {
          const fallback = query(collection(db, 'registrations'));
          onSnapshot(
            fallback,
            (snapshot) => {
              const data: Registration[] = [];
              snapshot.forEach((d) => data.push(d.data() as Registration));
              setRegistrations(data);
              setLoading(false);
              setError(null);
            },
            (err2) => {
              setError(err2.message);
              setLoading(false);
            }
          );
        } else {
          setError(err.message);
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const approveRegistration = async (id: string) => {
    await updateDoc(doc(db, 'registrations', id), {
      status: 'approved',
      updatedAt: serverTimestamp()
    });
  };

  const rejectRegistration = async (id: string, reason: string) => {
    await updateDoc(doc(db, 'registrations', id), {
      status: 'rejected',
      rejectionReason: reason,
      updatedAt: serverTimestamp()
    });
  };

  return { registrations, loading, error, approveRegistration, rejectRegistration };
}

/** Compress image to JPEG data URL (base64), max 900px wide, 65% quality */
async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 900;
      let { width, height } = img;
      if (width > MAX) {
        height = Math.round((height * MAX) / width);
        width = MAX;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.65));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

export const submitRegistration = async (
  formData: RegistrationForm,
  file: File,
  transactionId: string,
  onProgress?: (step: string) => void
): Promise<string> => {
  const generatedId = `MPCL-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // Step 1: Compress image → base64 (no Storage needed, no CORS issues)
  onProgress?.('Compressing image…');
  let paymentProofUrl = '';
  try {
    paymentProofUrl = await imageToBase64(file);
  } catch {
    // If canvas fails (unlikely), continue without image
    paymentProofUrl = '';
  }

  // Step 2: Save everything to Firestore
  onProgress?.('Saving registration…');
  try {
    const docRef = doc(db, 'registrations', generatedId);
    await setDoc(docRef, {
      ...formData,
      id: generatedId,
      state: 'Madhya Pradesh',
      paymentProofUrl,
      transactionId,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err: unknown) {
    const firebaseErr = err as { code?: string; message?: string };
    if (firebaseErr?.code === 'permission-denied') {
      throw new Error('Database permission denied — please update Firestore Security Rules to allow writes (set: allow read, write: if true)');
    }
    throw err;
  }

  return generatedId;
};
