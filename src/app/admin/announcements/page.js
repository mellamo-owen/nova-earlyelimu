'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminAnnouncements() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
    setLoading(false);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('announcements').insert([{ title, message }]);
    setTitle(''); setMessage('');
    fetchAnnouncements();
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '2rem', color: '#000000', background: '#F9FAFB', minHeight: '100vh' }}>Loading...</div>;

  return (
    <main style={{ minHeight: '100vh', background: '#F9FAFB', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => router.push('/admin')} style={{ background: 'transparent', color: '#1E3A8A', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '2rem' }}>← Back to Admin</button>
        <h1 style={{ color: '#000000', fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Announcements</h1>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type='text' placeholder='Announcement Title' required value={title} onChange={e => setTitle(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
            <textarea rows="3" placeholder='Write your message to parents and students...' required value={message} onChange={e => setMessage(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
            <button type='submit' disabled={saving} style={{ background: '#10B981', color: 'white', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>{saving ? 'Posting...' : 'Post Announcement'}</button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {announcements.map(a => (
            <div key={a.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #10B981', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ color: '#000000', fontWeight: 'bold', marginBottom: '0.5rem' }}>{a.title}</h3>
              <p style={{ color: '#6B7280', whiteSpace: 'pre-wrap' }}>{a.message}</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.8rem', marginTop: '1rem' }}>{new Date(a.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

