'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TutorGrading() {
  const [submissions, setSubmissions] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [mark, setMark] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => { 
    fetchMySubmissions(); 
  }, []);

  const fetchMySubmissions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Get only students assigned to THIS tutor
    const { data: myStudents } = await supabase
      .from('students')
      .select('id')
      .eq('tutor_id', user.id);

    if (myStudents && myStudents.length > 0) {
      const studentIds = myStudents.map(s => s.id);

      // 2. Get assignments ONLY for those students
      const { data } = await supabase
        .from('assignments')
        .select('*, students(name, student_id_code), lessons(title, week)')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false });

      if (data) setSubmissions(data);
    }
    
    setPageLoading(false);
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('assignments').update({ mark, teacher_comment: comment, status: 'GRADED' }).eq('id', activeSub.id);
    setActiveSub(null); setMark(''); setComment('');
    fetchMySubmissions();
    setLoading(false);
  };

  if (pageLoading) return <div style={{ color: '#94A3B8' }}>Loading submissions...</div>;

  return (
    <div>
      <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3B82F6' }}>Student Submissions</h2>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Click "View Work" to open their GitHub repo, then click "Grade" to mark it.</p>
      </div>

      <div style={{ background: '#1E293B', borderRadius: '12px', overflowX: 'auto', border: '1px solid #334155' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead style={{ background: '#0F172A', color: '#94A3B8', fontSize: '0.85rem', textTransform: 'uppercase' }}>
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
              <tr key={sub.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '1rem' }}>
                  <p style={{ fontWeight: 'bold' }}>{sub.students?.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{sub.students?.student_id_code}</p>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>Week {sub.lessons?.week}: {sub.lessons?.title}</td>
                <td style={{ padding: '1rem' }}>
                  <a href={sub.submission_link} target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', fontWeight: 'bold', textDecoration: 'none' }}>View Work</a>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ color: sub.status === 'GRADED' ? '#10B981' : '#F59E0B', fontWeight: 'bold' }}>
                    {sub.status} {sub.mark && `(${sub.mark})`}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => { setActiveSub(sub); setMark(sub.mark || ''); setComment(sub.teacher_comment || ''); }} style={{ background: '#3B82F6', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Grade</button>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>No submissions from your students yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* GRADING MODAL */}
      {activeSub && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#1E293B', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Grade Submission</h2>
            <p style={{ color: '#94A3B8', marginBottom: '0.2rem' }}>{activeSub.students?.name}</p>
            <p style={{ color: '#94A3B8', fontSize: '0.8rem', marginBottom: '1.5rem' }}>{activeSub.lessons?.title}</p>
            
            <form onSubmit={handleGrade} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Mark (e.g. 8/10 or Excellent)" required value={mark} onChange={e => setMark(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
              <textarea placeholder="Teacher Comment" required value={comment} onChange={e => setComment(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setActiveSub(null)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: '#334155', color: 'white', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: '#10B981', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
