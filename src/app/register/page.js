'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentWhatsapp, setParentWhatsapp] = useState('');
  const [password, setPassword] = useState('');

  const [kidName, setKidName] = useState('');
  const [kidAge, setKidAge] = useState('');
  const [kidMode, setKidMode] = useState('Online Kenya');
  const [kidEmail, setKidEmail] = useState('');
  const [kidPassword, setKidPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const ageNum = parseInt(kidAge);
    if (ageNum < 8 || ageNum > 12) {
      setError('Age must be between 8 and 12 years old.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create Parent Auth
      const { data: parentAuth, error: parentAuthError } = await supabase.auth.signUp({ email: parentEmail, password: password });
      
      if (parentAuthError) {
        if (parentAuthError.message.includes('already registered')) {
          throw new Error('This parent email is already registered. Please log in instead.');
        }
        throw new Error('Parent Auth failed: ' + parentAuthError.message);
      }

      // 2. Create Parent Profile
      const { error: parentError } = await supabase.from('parents').upsert([{ 
        id: parentAuth.user.id, name: parentName, email: parentEmail, whatsapp: parentWhatsapp, role: 'parent'
      }]);
      if (parentError) throw new Error('Parent profile failed: ' + parentError.message);

      // 3. Create Kid Auth
      const { data: kidAuth, error: kidAuthError } = await supabase.auth.signUp({ email: kidEmail, password: kidPassword });
      if (kidAuthError) {
        if (kidAuthError.message.includes('already registered')) {
          throw new Error('This Kid email is already registered. Please use a different email.');
        }
        throw new Error('Kid Auth failed: ' + kidAuthError.message);
      }

      // 4. Create Kid Profile
      const { error: kidError } = await supabase.from('students').insert([{
        parent_id: parentAuth.user.id, auth_user_id: kidAuth.user.id, name: kidName, age: ageNum, mode: kidMode, status: 'PENDING'
      }]);
      
      if (kidError) throw new Error('Kid registration failed: ' + kidError.message);

      // 🔥 CRITICAL FIX: Sign out the kid so the parent can log in cleanly
      await supabase.auth.signOut();

      alert('Registration successful! Please log in with your parent details.');
      router.push('/outcomes');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#000000', color: 'white', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', color: '#000000', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Join Nova earlyElimu</h1>
        
        <div style={{ background: '#1E3A8A', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>Strictly limited to 20 students per teacher.</p>
          <p style={{ color: '#10B981', fontWeight: 'bold' }}>The teacher who starts with your child stays with them to the very end.</p>
        </div>

        {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', borderBottom: '2px solid #10B981', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Parent Details</h2>
          <input type='text' placeholder='Your Full Name' required value={parentName} onChange={e => setParentName(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
          <input type='email' placeholder='Your Email Address' required value={parentEmail} onChange={e => setParentEmail(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
          <input type='password' placeholder='Your Password' required minLength='6' value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
          <input type='text' placeholder='WhatsApp Number' required value={parentWhatsapp} onChange={e => setParentWhatsapp(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />

          <h2 style={{ fontSize: '1.1rem', borderBottom: '2px solid #10B981', paddingBottom: '0.5rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Kid Details</h2>
          <input type='text' placeholder='Kid Full Name' required value={kidName} onChange={e => setKidName(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
          <input type='number' placeholder='Age (8 - 12 only)' required min='8' max='12' value={kidAge} onChange={e => setKidAge(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
          <select value={kidMode} onChange={e => setKidMode(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }}>
            <option value='Online Kenya'>Online (Kenya)</option>
            <option value='Physical Elburgon'>Physical (Elburgon)</option>
          </select>
          <input type='email' placeholder='Kid Login Email (e.g. kid@gmail.com)' required value={kidEmail} onChange={e => setKidEmail(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
          <input type='password' placeholder='Kid Login Password' required minLength='6' value={kidPassword} onChange={e => setKidPassword(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />

          <button type='submit' disabled={loading} style={{ background: '#10B981', color: '#FFFFFF', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', marginTop: '1rem', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Registering...' : 'Register Now'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#6B7280' }}>
          Already have an account? <Link href='/login' style={{ color: '#1E3A8A', fontWeight: 'bold' }}>Log In</Link>
        </p>
      </div>
    </main>
  );
}
