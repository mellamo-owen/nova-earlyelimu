'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TutorCalls() {
  const [students, setStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [score, setScore] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => { fetchMyStudents(); }, []);

  const fetchMyStudents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Strictly fetch only THIS tutor's students
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('tutor_id', user.id)
      .neq('status', 'PENDING');
      
    if (data) setStudents(data);
    setPageLoading(false);
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('calls').insert([{ student_id: activeStudent.id, understanding_score: score, feedback }]);
    alert('Call feedback saved! The parent and student can now see it.');
    setActiveStudent(null); setFeedback('');
    setLoading(false);
  };

  if (pageLoading) return <div style={{ color: '#94A3B8' }}>Loading your students...</div>;

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '300px', background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Your Students (Call Queue)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {students.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0F172A', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>{s.name}</p>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{s.student_id_code}</p>
              </div>
              <button onClick={() => setActiveStudent(s)} style={{ background: '#3B82F6', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Start Call</button>
            </div>
          ))}
          {students.length === 0 && <p style={{ color: '#94A3B8' }}>No students assigned to you yet.</p>}
        </div>
      </div>

      {activeStudent && (
        <div style={{ flex: 1, minWidth: '300px', background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Feedback for {activeStudent.name}</h2>
          <form onSubmit={handleFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94A3B8', fontSize: '0.9rem' }}>Understanding Score (1-5)</label>
              <input type="number" min="1" max="5" value={score} onChange={e => setScore(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94A3B8', fontSize: '0.9rem' }}>Feedback Notes</label>
              <textarea placeholder="What did they understand?" required value={feedback} onChange={e => setFeedback(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
            </div>
            <button type="submit" disabled={loading} style={{ background: '#10B981', color: 'white', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Save Feedback</button>
          </form>
        </div>
      )}
    </div>
  );
}
