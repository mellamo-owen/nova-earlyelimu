'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TutorGrading() {
  const [submissions, setSubmissions] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [mark, setMark] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchSubmissions(); }, []);

  const fetchSubmissions = async () => {
    const { data } = await supabase.from('assignments').select('*, students(name, student_id_code), lessons(title, week)').order('created_at', { ascending: false });
    if (data) setSubmissions(data);
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('assignments').update({ mark, teacher_comment: comment, status: 'GRADED' }).eq('id', activeSub.id);
    setActiveSub(null); setMark(''); setComment('');
    fetchSubmissions();
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Student Submissions</h2>
      <div style={{ background: '#1E293B', borderRadius: '12px', overflowX: 'auto', border: '1px solid #334155' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead style={{ background: '#0F172A', color: '#94A3B8', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Student</th>
              <th style={{ padding: '1rem' }}>Lesson</th>
              <th style={{ padding: '1rem' }}>Link</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => (
              <tr key={sub.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '1rem' }}><p style={{ fontWeight: 'bold' }}>{sub.students?.name}</p></td>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>Week {sub.lessons?.week}: {sub.lessons?.title}</td>
                <td style={{ padding: '1rem' }}><a href={sub.submission_link} target="_blank" style={{ color: '#3B82F6' }}>View Work</a></td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ color: sub.status === 'GRADED' ? '#10B981' : '#F59E0B', fontWeight: 'bold' }}>{sub.status} {sub.mark && `(${sub.mark})`}</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => { setActiveSub(sub); setMark(sub.mark || ''); setComment(sub.teacher_comment || ''); }} style={{ background: '#3B82F6', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Grade</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeSub && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ background: '#1E293B', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Grade Submission</h2>
            <p style={{ color: '#94A3B8', marginBottom: '1rem' }}>{activeSub.students?.name}</p>
            <form onSubmit={handleGrade} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Mark (e.g. 8/10)" required value={mark} onChange={e => setMark(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
              <textarea placeholder="Teacher Comment" required value={comment} onChange={e => setComment(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setActiveSub(null)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: '#334155', color: 'white', border: 'none' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: '#10B981', color: 'white', border: 'none', fontWeight: 'bold' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
