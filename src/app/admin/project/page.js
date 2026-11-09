'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  
  const [studentId, setStudentId] = useState('');
  const [partTitle, setPartTitle] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').eq('status', 'APPROVED');
    if (data) setStudents(data);
    setLoading(false);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('project_parts').insert([{
      student_id: studentId,
      project_title: 'Nova earlyElimu Kids Shop',
      part_title: partTitle,
      github_repo_url: repoUrl,
      status: 'NOT_STARTED'
    }]);
    alert('Project part assigned!');
    setStudentId(''); setPartTitle(''); setRepoUrl('');
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '2rem', color: 'white', background: '#0A1931', minHeight: '100vh' }}>Loading...</div>;

  return (
    <main style={{ minHeight: '100vh', background: '#F5F7FA', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => router.push('/admin')} style={{ background: 'transparent', color: '#0A1931', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '2rem' }}>← Back to Admin</button>
        <h1 style={{ color: '#0A1931', fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Assign Project Parts</h1>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#0A1931' }}>Select Student</label>
              <select required value={studentId} onChange={e => setStudentId(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }}>
                <option value="">-- Choose Student --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.student_id_code})</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#0A1931' }}>Project Part (e.g., Build the Header)</label>
              <input type='text' required value={partTitle} onChange={e => setPartTitle(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#0A1931' }}>Shared GitHub Repository Link</label>
              <input type='url' required value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="https://github.com/..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
            </div>
            <button type='submit' disabled={saving} style={{ background: '#FF6B00', color: '#0A1931', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>{saving ? 'Saving...' : 'Assign Project Part'}</button>
          </form>
        </div>
      </div>
    </main>
  );
}
