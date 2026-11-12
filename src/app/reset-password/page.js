'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#000000', color: 'white', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', color: '#000000', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Set New Password</h1>
        <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Enter your new password below.</p>

        {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        {message && <div style={{ background: '#D1FAE5', color: '#065F46', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{message}</div>}

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type='password' placeholder='New Password' required minLength='6' value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
          <button type='submit' disabled={loading} style={{ background: '#10B981', color: '#FFFFFF', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </main>
  );
}

