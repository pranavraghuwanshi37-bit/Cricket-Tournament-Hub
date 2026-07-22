import { useState, useEffect, useCallback } from 'react';
import { RegistrationForm } from '@/types';

const API_BASE = '/api';

export interface Registration {
  id: string;
  teamName: string;
  captainName: string;
  captainPhone: string;
  captainEmail: string;
  city: string;
  state: string;
  category: string;
  transactionId: string;
  paymentProofUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Track page hook ──────────────────────────────────────────────────────────
export function useRegistration(id: string | null) {
  const [data, setData] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    fetch(`${API_BASE}/registrations/${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (res.status === 404) { setData(null); return; }
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        setData(await res.json() as Registration);
      })
      .catch((err) => setError(err as Error))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}

// ── Admin hook ───────────────────────────────────────────────────────────────
export function useAdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/registrations`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        setRegistrations(await res.json() as Registration[]);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const approveRegistration = async (id: string) => {
    await fetch(`${API_BASE}/registrations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    fetchAll();
  };

  const rejectRegistration = async (id: string, reason: string) => {
    await fetch(`${API_BASE}/registrations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', rejectionReason: reason }),
    });
    fetchAll();
  };

  return { registrations, loading, error, approveRegistration, rejectRegistration };
}

// ── Submit ───────────────────────────────────────────────────────────────────
async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 900;
      let { width, height } = img;
      if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
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
  // Step 1: Compress image in browser
  onProgress?.('Compressing image…');
  let paymentProofUrl = '';
  try {
    paymentProofUrl = await imageToBase64(file);
  } catch {
    paymentProofUrl = '';
  }

  // Step 2: POST to API server (no Firebase, no CORS issues)
  onProgress?.('Saving registration…');
  const res = await fetch(`${API_BASE}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...formData, transactionId, paymentProofUrl }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `Server error ${res.status}`);
  }

  const result = await res.json() as { id: string };
  return result.id;
};
