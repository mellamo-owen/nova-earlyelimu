'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminProject() {
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
    // Fetch ALL students except those who are PENDING
    const { data, error } = await supabase
      .from('students')
      .select('id, name, status, student_id_code')
      .neq('status', 'PENDING'); // Gets WEEK1_FREE and APPROVED
      
    if (error) {
      console.error('Error fetching students:', error);
    } else if (data) {
      setStudents(data);
    }
    setLoading(false);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase.from('project_parts').insert([{
      student_id: studentId,
      project_title: 'Nova earlyElimu Kids Shop',
      part_title: partTitle,
      github_repo_url: repoUrl,
      status: 'NOT_STARTED'
    }]);

    if (error) {
      alert('Error assigning project: ' + error.message);
    } else {
      alert('Project part assigned successfully!');
      setStudentId(''); setPartTitle(''); setRepoUrl('');
    }
    
    setSaving(false);
  };

  if (loading) return <div style={{ color: '#9CA3AF' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Assign Project Parts</h1>
        <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Assign specific tasks to students for the group project.</p>
      </div>

      <div style={{ background: '#1F2937', padding: '2rem', borderRadius: '12px', border: '1px solid #374151' }}>
        <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#F3F4F6' }}>Select Student</label>
            <select required value={studentId} onChange={e => setStudentId(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: 'white' }}>
              <option value="">-- Choose Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.student_id_code || s.status}
                </option>
              ))}
            </select>
            
            {students.length === 0 && (
              <p style={{ color: '#F59E0B', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                No active students found. Make sure you have approved a student in the Students tab.
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#F3F4F6' }}>Project Part</label>
            <input type="text" required value={partTitle} onChange={e => setPartTitle(e.target.value)} placeholder="e.g., Build the Home Page" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#F3F4F6' }}>Shared GitHub Repository Link</label>
            <input type="url" required value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="https://github.com/..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: 'white' }} />
          </div>

          <button type="submit" disabled={saving} style={{ background: '#10B981', color: '#000', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Assigning...' : 'Assign Project Part'}
          </button>
        </form>
      </div>
    </div>
  );
}
