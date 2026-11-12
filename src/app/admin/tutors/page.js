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
  const [createdTutor, setCreatedTutor] = useState(null);

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

    // 2. Create Tutor Profile in Database
    const { error: profileError } = await supabase.from('tutors').insert([{
      id: authData.user.id, name, email, phone
    }]);

    if (profileError) {
      alert('Error saving tutor profile: ' + profileError.message);
    } else {
      // Show the credentials and email template
      setCreatedTutor({ name, email, password });
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
          <input type="email" placeholder="Tutor Email (used for login)" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: 'white' }} />
          <input type="text" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: 'white' }} />
          <input type="password" placeholder="Temporary Password" required minLength="6" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: 'white' }} />
          <button type="submit" disabled={saving} style={{ background: '#10B981', color: '#000', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            {saving ? 'Creating...' : 'Create Tutor Account'}
          </button>
        </form>
      </div>

      {/* RIGHT SIDE: TUTORS LIST OR EMAIL TEMPLATE */}
      <div style={{ flex: 2, minWidth: '300px' }}>
        
        {/* EMAIL TEMPLATE DISPLAY (Shows after creation) */}
        {createdTutor && (
          <div style={{ background: '#065F46', padding: '1.5rem', borderRadius: '12px', border: '1px solid #10B981', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10B981' }}>Tutor Created Successfully!</h2>
              <button onClick={() => setCreatedTutor(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <p style={{ color: '#D1FAE5', marginBottom: '1rem' }}>Copy and send this email to the tutor:</p>
            <textarea 
              readOnly
              rows="8"
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: 'none', fontFamily: 'monospace', fontSize: '0.85rem', color: '#000' }}
              value={`Subject: Welcome to Nova earlyElimu - Your Tutor Account Details

Hello ${createdTutor.name},

You have been added as a Tutor at Nova earlyElimu Code Club.

Here are your login details:
Email: ${createdTutor.email}
Temporary Password: ${createdTutor.password}

Please log in here: ${window.location.origin}/login
Once you log in, please change your password immediately on your dashboard.

Welcome to the team!

Best regards,
Mickowen Khaseke
Nova earlyElimu`}
            />
          </div>
        )}

        {/* TUTORS LIST */}
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
