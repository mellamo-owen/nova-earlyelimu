'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TutorCalls() {
  const [students, setStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [score, setScore] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').neq('status', 'PENDING');
    if (data) setStudents(data);
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('calls').insert([{ student_id: activeStudent.id, understanding_score: score, feedback }]);
    alert('Call feedback saved!');
    setActiveStudent(null); setFeedback('');
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '300px', background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Start 1-on-1 Call</h2>
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
        </div>
      </div>

      {activeStudent && (
        <div style={{ flex: 1, minWidth: '300px', background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Feedback for {activeStudent.name}</h2>
          <form onSubmit={handleFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="number" min="1" max="5" value={score} onChange={e => setScore(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
            <textarea placeholder="What did they understand?" required value={feedback} onChange={e => setFeedback(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
            <button type="submit" disabled={loading} style={{ background: '#10B981', color: 'white', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Save Feedback</button>
          </form>
        </div>
      )}
    </div>
  );
}
