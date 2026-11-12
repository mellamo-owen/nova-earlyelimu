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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await supabase.auth.signOut();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw new Error(authError.message);

      const userId = authData.user.id;

      // 1. Check Admin
      const { data: parentData } = await supabase.from('parents').select('role').eq('id', userId).maybeSingle();
      if (parentData) {
        window.location.href = parentData.role === 'admin' ? '/admin' : '/parent';
        return;
      }

      // 2. Check Tutor
      const { data: tutorData } = await supabase.from('tutors').select('id').eq('id', userId).maybeSingle();
      if (tutorData) {
        window.location.href = '/tutor';
        return;
      }

      // 3. Check Student
      const { data: studentData } = await supabase.from('students').select('id').eq('auth_user_id', userId).maybeSingle();
      if (studentData) {
        window.location.href = '/student';
        return;
      }

      throw new Error('Account not found.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#000000', color: 'white', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', color: '#000000', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Welcome Back</h1>
        <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Log in to your Nova earlyElimu account.</p>
        {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type='email' placeholder='Email Address' required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
          <input type='password' placeholder='Password' required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
          <button type='submit' disabled={loading} style={{ background: '#10B981', color: '#FFFFFF', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Processing...' : 'Log In'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#6B7280' }}>Don't have an account? <Link href='/register' style={{ color: '#1E3A8A', fontWeight: 'bold' }}>Register</Link></p>
      </div>
    </main>
  );
}
