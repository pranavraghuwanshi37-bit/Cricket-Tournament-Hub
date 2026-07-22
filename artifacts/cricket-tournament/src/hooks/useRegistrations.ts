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

export const submitRegistration = async (
  formData: RegistrationForm,
  file: File,
  transactionId: string
): Promise<string> => {
  const generatedId = `MPCL-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // Upload file
  const fileExt = file.name.split('.').pop();
  const storageRef = ref(storage, `payment-proofs/${generatedId}_${Date.now()}.${fileExt}`);
  await uploadBytes(storageRef, file);
  const paymentProofUrl = await getDownloadURL(storageRef);

  // Save document
  const docRef = doc(db, 'registrations', generatedId);
  await setDoc(docRef, {
    ...formData,
    id: generatedId,
    state: "Madhya Pradesh",
    paymentProofUrl,
    transactionId,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return generatedId;
};
