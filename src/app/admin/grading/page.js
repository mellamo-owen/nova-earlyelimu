'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminGrading() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [mark, setMark] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const { data } = await supabase.from('assignments').select('*, students(name, student_id_code), lessons(title, week)').order('created_at', { ascending: false });
    if (data) setSubmissions(data);
    setLoading(false);
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!activeSubmission) return;
    setSaving(true);

    await supabase.from('assignments').update({ mark: mark, teacher_comment: comment, status: 'GRADED' }).eq('id', activeSubmission.id);
    
    alert('Grade saved!');
    setActiveSubmission(null); setMark(''); setComment('');
    fetchSubmissions();
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '2rem', color: '#000000', background: '#F9FAFB', minHeight: '100vh' }}>Loading...</div>;

  return (
    <main style={{ minHeight: '100vh', background: '#F9FAFB', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button onClick={() => router.push('/admin')} style={{ background: 'transparent', color: '#1E3A8A', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '2rem' }}>← Back to Admin</button>
        <h1 style={{ color: '#000000', fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Grade Assignments</h1>

        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F9FAFB', color: '#6B7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Student</th>
                <th style={{ padding: '1rem' }}>Lesson</th>
                <th style={{ padding: '1rem' }}>Submission</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>
                    <p style={{ fontWeight: 'bold', color: '#000000' }}>{sub.students?.name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{sub.students?.student_id_code}</p>
                  </td>
                  <td style={{ padding: '1rem', color: '#000000', fontSize: '0.9rem' }}>Week {sub.lessons?.week}: {sub.lessons?.title}</td>
                  <td style={{ padding: '1rem' }}>
                    <a href={sub.submission_link} target="_blank" rel="noopener noreferrer" style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.9rem' }}>View Link</a>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.2rem' }}>{sub.submission_text?.substring(0, 30)}...</p>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: sub.status === 'SUBMITTED' ? '#FEF3C7' : '#D1FAE5', color: sub.status === 'SUBMITTED' ? '#D97706' : '#065F46' }}>
                      {sub.status} {sub.mark && `(${sub.mark})`}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => { setActiveSubmission(sub); setMark(sub.mark || ''); setComment(sub.teacher_comment || ''); }} style={{ background: '#1E3A8A', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Grade</button>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>No submissions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeSubmission && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ color: '#000000', fontWeight: 'bold', marginBottom: '1rem' }}>Grade Submission</h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1rem' }}>{activeSubmission.students?.name} - Week {activeSubmission.lessons?.week}</p>
            <form onSubmit={handleGrade} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type='text' placeholder='Mark (e.g. 8/10 or Excellent)' required value={mark} onChange={e => setMark(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
              <textarea rows="3" placeholder='Teacher comment...' required value={comment} onChange={e => setComment(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type='button' onClick={() => setActiveSubmission(null)} style={{ flex: 1, background: '#F3F4F6', color: '#6B7280', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type='submit' disabled={saving} style={{ flex: 1, background: '#10B981', color: 'white', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

