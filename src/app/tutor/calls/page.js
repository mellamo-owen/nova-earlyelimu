'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TutorCalls() {
  const [students, setStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [score, setScore] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Call State
  const [callStatus, setCallStatus] = useState('idle'); // idle, ringing, in-call
  const [countdown, setCountdown] = useState(40);
  const [roomName, setRoomName] = useState('');

  useEffect(() => { fetchMyStudents(); }, []);

  // COUNTDOWN TIMER
  useEffect(() => {
    let timer;
    if (callStatus === 'ringing' && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (callStatus === 'ringing' && countdown === 0) {
      setCallStatus('in-call');
    }
    return () => clearInterval(timer);
  }, [callStatus, countdown]);

  const fetchMyStudents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('students').select('*').eq('tutor_id', user.id).neq('status', 'PENDING');
    if (data) setStudents(data);
  };

  const startCall = async (student) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const room = `nova-call-${student.student_id_code}-${Date.now()}`;
    setRoomName(room);
    setActiveStudent(student);
    setCountdown(40);
    setCallStatus('ringing');

    // Save to database so the student's screen triggers
    await supabase.from('active_calls').upsert([{ 
      student_id: student.id, 
      tutor_id: user.id, 
      status: 'RINGING' 
    }], { onConflict: 'student_id' });
  };

  const endCall = async () => {
    if (activeStudent) {
      await supabase.from('active_calls').delete().eq('student_id', activeStudent.id);
    }
    setCallStatus('idle');
    setActiveStudent(null);
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('calls').insert([{ student_id: activeStudent.id, understanding_score: score, feedback }]);
    alert('Call feedback saved!');
    setFeedback('');
    setLoading(false);
  };

  // 1. IN-CALL SCREEN
  if (callStatus === 'in-call') {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', background: '#0F172A', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ background: '#1E293B', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontWeight: 'bold' }}>In Call with {activeStudent?.name}</h2>
          <button onClick={endCall} style={{ background: '#EF4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>End Call</button>
        </div>
        <iframe 
          src={`https://meet.jit.si/${roomName}`}
          style={{ flex: 1, border: 'none', width: '100%' }}
          allow="camera; microphone; fullscreen; display-capture"
        ></iframe>
      </div>
    );
  }

  // 2. RINGING SCREEN
  if (callStatus === 'ringing') {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#1E293B', borderRadius: '16px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Calling {activeStudent?.name}...</h1>
        <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>Waiting for them to join</p>
        <div style={{ fontSize: '5rem', fontWeight: 'bold', color: '#3B82F6', marginBottom: '2rem' }}>{countdown}</div>
        <button onClick={endCall} style={{ background: '#EF4444', color: 'white', padding: '1rem 2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Cancel Call</button>
      </div>
    );
  }

  // 3. IDLE SCREEN (LIST)
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
              <button onClick={() => startCall(s)} style={{ background: '#10B981', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Start Call</button>
            </div>
          ))}
        </div>
      </div>

      {activeStudent && callStatus === 'idle' && (
        <div style={{ flex: 1, minWidth: '300px', background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Call Feedback for {activeStudent.name}</h2>
          <form onSubmit={handleFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="number" min="1" max="5" value={score} onChange={e => setScore(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
            <textarea placeholder="What did they understand?" required value={feedback} onChange={e => setFeedback(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
            <button type="submit" disabled={loading} style={{ background: '#3B82F6', color: 'white', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Save Feedback</button>
          </form>
        </div>
      )}
    </div>
  );
}

