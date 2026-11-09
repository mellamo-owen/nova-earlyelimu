'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const { data: parentProfile } = await supabase.from('parents').select('role').eq('id', authData.user.id).single();

    if (parentProfile) {
      if (parentProfile.role === 'admin') router.push('/admin');
      else router.push('/parent');
      return;
    }

    const { data: studentProfile } = await supabase.from('students').select('id').eq('auth_user_id', authData.user.id).single();

    if (studentProfile) {
      router.push('/student');
    } else {
      setError('Account not found. Please contact support.');
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/login', // When deployed, change this to your Vercel URL
    });

    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#000000', color: 'white', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', color: '#000000', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Welcome Back</h1>
        <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Log in to your Nova earlyElimu account.</p>

        {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        {resetSent && <div style={{ background: '#D1FAE5', color: '#065F46', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>Password reset link sent! Check your email.</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type='email' placeholder='Email Address' required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
          <input type='password' placeholder='Password' required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem' }}>
            <button type='button' onClick={handleForgotPassword} style={{ background: 'transparent', color: '#1E3A8A', fontSize: '0.85rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              Forgot Password?
            </button>
          </div>

          <button type='submit' disabled={loading} style={{ background: '#10B981', color: '#FFFFFF', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Processing...' : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#6B7280' }}>
          Don't have an account? <Link href='/register' style={{ color: '#1E3A8A', fontWeight: 'bold' }}>Register</Link>
        </p>
      </div>
    </main>
  );
}
