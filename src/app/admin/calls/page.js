'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminCalls() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [score, setScore] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').neq('status', 'PENDING');
    if (data) setStudents(data);
    setLoading(false);
  };

  const submitCallFeedback = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    await supabase.from('calls').insert([{ student_id: selectedStudent.id, understanding_score: score, feedback: feedback }]);
    alert('Feedback saved successfully!');
    setSelectedStudent(null); setFeedback('');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '2rem' }}>1-on-1 Calls</h1>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Call Queue */}
        <div style={{ flex: 1, minWidth: '300px', background: '#1F2937', padding: '1.5rem', borderRadius: '12px', border: '1px solid #374151' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Call Queue</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {students.map(student => (
              <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827', padding: '1rem', borderRadius: '8px', border: '1px solid #374151' }}>
                <div>
                  <p style={{ fontWeight: 'bold' }}>{student.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{student.student_id_code}</p>
                </div>
                <button onClick={() => setSelectedStudent(student)} style={{ background: '#10B981', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Start Call</button>
              </div>
            ))}
          </div>
        </div>

        {/* Call Feedback Form */}
        <div style={{ flex: 1, minWidth: '300px', background: '#1F2937', padding: '1.5rem', borderRadius: '12px', border: '1px solid #374151' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Call Feedback</h2>
          {selectedStudent ? (
            <form onSubmit={submitCallFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Writing feedback for: <strong>{selectedStudent.name}</strong></p>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Understanding Score (1-5)</label>
                <input type="number" min="1" max="5" value={score} onChange={(e) => setScore(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Feedback Notes</label>
                <textarea rows="4" value={feedback} onChange={(e) => setFeedback(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: 'white' }}></textarea>
              </div>
              <button type="submit" style={{ background: '#10B981', color: 'white', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Save Feedback</button>
            </form>
          ) : (
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Select a student to write feedback.</p>
          )}
        </div>
      </div>
    </div>
  );
}

