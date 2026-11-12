'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminTutors() {
  const [tutors, setTutors] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTutors(); }, []);

  const fetchTutors = async () => {
    const { data } = await supabase.from('tutors').select('*').order('created_at', { ascending: false });
    if (data) setTutors(data);
    setLoading(false);
  };

  const handleCreateTutor = async (e) => {
    e.preventDefault();
    setSaving(true);

    // 1. Create Auth for Tutor
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    
    if (authError) {
      alert('Error creating tutor auth: ' + authError.message);
      setSaving(false);
      return;
    }

    // 2. Create Tutor Profile
    const { error: profileError } = await supabase.from('tutors').insert([{
      id: authData.user.id, name, email, phone
    }]);

    if (profileError) {
      alert('Error saving tutor profile: ' + profileError.message);
    } else {
      alert('Tutor created successfully! They can now log in.');
      setName(''); setEmail(''); setPhone(''); setPassword('');
      fetchTutors();
    }
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      {/* CREATE TUTOR FORM */}
      <div style={{ flex: 1, minWidth: '300px', background: '#1F2937', padding: '2rem', borderRadius: '12px', border: '1px solid #374151' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Add New Tutor</h2>
        <form onSubmit={handleCreateTutor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="text" placeholder="Tutor Name" required value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: 'white' }} />
          <input type="email" placeholder="Login Email" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: 'white' }} />
          <input type="text" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: 'white' }} />
          <input type="password" placeholder="Login Password" required minLength="6" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: 'white' }} />
          <button type="submit" disabled={saving} style={{ background: '#10B981', color: '#000', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            {saving ? 'Creating...' : 'Create Tutor Account'}
          </button>
        </form>
      </div>

      {/* TUTORS LIST */}
      <div style={{ flex: 2, minWidth: '300px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Your Tutors</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tutors.map(tutor => (
            <div key={tutor.id} style={{ background: '#1F2937', padding: '1.5rem', borderRadius: '12px', border: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>{tutor.name}</p>
                <p style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>{tutor.email} | {tutor.phone}</p>
              </div>
            </div>
          ))}
          {tutors.length === 0 && <p style={{ color: '#9CA3AF' }}>No tutors added yet.</p>}
        </div>
      </div>
    </div>
  );
}
