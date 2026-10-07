'use client';

import { useEffect, useState } from 'react';

export function VerifyEmail() {
  const [status, setStatus] = useState('Verifying your email...');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash');
    const email = params.get('email');
    const token = params.get('token');

    const verify = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token_hash: tokenHash, email, token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed.');
        }

        setStatus(data.message || 'Email verified successfully.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed.');
        setStatus('Unable to verify email.');
      }
    };

    void verify();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-soft">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-black text-ink">Email Verification</h1>
        <p className="mt-4 text-gray-600">{status}</p>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
