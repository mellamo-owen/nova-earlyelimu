'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TutorProjects() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [partTitle, setPartTitle] = useState('');
  const [repoUrl, setRepoUrl] = useState('');

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').eq('status', 'APPROVED');
    if (data) setStudents(data);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    await supabase.from('project_parts').insert([{
      student_id: studentId, project_title: 'Nova Kids Shop', part_title: partTitle, github_repo_url: repoUrl, status: 'NOT_STARTED'
    }]);
    alert('Project Assigned!');
    setStudentId(''); setPartTitle(''); setRepoUrl('');
  };

  return (
    <div style={{ maxWidth: '600px', background: '#1E293B', padding: '2rem', borderRadius: '16px', border: '1px solid #334155' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Assign Group Project</h2>
      <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <select required value={studentId} onChange={e => setStudentId(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }}>
          <option value="">-- Select Student --</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="text" placeholder="Project Part (e.g. Build Navbar)" required value={partTitle} onChange={e => setPartTitle(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
        <input type="url" placeholder="GitHub Repo URL" required value={repoUrl} onChange={e => setRepoUrl(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
        <button type="submit" style={{ background: '#3B82F6', color: 'white', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Assign Project</button>
      </form>
    </div>
  );
}
