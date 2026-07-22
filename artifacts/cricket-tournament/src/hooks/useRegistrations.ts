import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, onSnapshot, query, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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

/** Compress an image File to JPEG, max 1200px wide, 70% quality */
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX) {
        height = Math.round((height * MAX) / width);
        width = MAX;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Canvas compression failed')),
        'image/jpeg',
        0.70
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
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

  // Step 1: Compress image
  onProgress?.('Compressing image…');
  let uploadBlob: Blob;
  try {
    uploadBlob = await compressImage(file);
  } catch {
    // If compression fails for any reason, use original
    uploadBlob = file;
  }

  // Step 2: Upload to Firebase Storage
  onProgress?.('Uploading payment proof…');
  let paymentProofUrl = '';
  try {
    const storageRef = ref(storage, `payment-proofs/${generatedId}_${Date.now()}.jpg`);
    await uploadBytes(storageRef, uploadBlob, { contentType: 'image/jpeg' });
    paymentProofUrl = await getDownloadURL(storageRef);
  } catch (err: unknown) {
    const firebaseErr = err as { code?: string; message?: string };
    if (firebaseErr?.code === 'storage/unauthorized') {
      throw new Error('Storage permission denied. Please update Firebase Storage rules to allow uploads.');
    }
    if (firebaseErr?.code === 'storage/unknown' || firebaseErr?.code?.startsWith('storage/')) {
      throw new Error(`Storage upload failed: ${firebaseErr.message ?? firebaseErr.code}`);
    }
    throw err;
  }

  // Step 3: Save to Firestore
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
      throw new Error('Firestore permission denied. Please update Firestore Security Rules to allow writes.');
    }
    throw err;
  }

  return generatedId;
};
