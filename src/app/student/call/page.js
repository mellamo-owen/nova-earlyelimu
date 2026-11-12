'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function StudentCall() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, ringing, in-call
  const [countdown, setCountdown] = useState(40);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    let interval;
    let subscription;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      
      const { data: studentData } = await supabase.from('students').select('*').eq('auth_user_id', user.id).single();
      if (!studentData) return;
      setStudent(studentData);

      // 1. Check if there is an active call right now
      const { data: callData } = await supabase.from('active_calls').select('*').eq('student_id', studentData.id).single();
      if (callData && callData.status === 'RINGING') {
        setCountdown(40);
        setCallStatus('ringing');
        setRoomName(`nova-call-${studentData.student_id_code}-${Date.now()}`);
      }

      // 2. Listen for real-time changes (when tutor clicks call)
      subscription = supabase.channel('custom-all-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'active_calls', filter: `student_id=eq.${studentData.id}` }, (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setCountdown(40);
            setCallStatus('ringing');
            setRoomName(`nova-call-${studentData.student_id_code}-${Date.now()}`);
          } else if (payload.eventType === 'DELETE') {
            setCallStatus('idle');
          }
        }).subscribe();
    };

    setup();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
      clearInterval(interval);
    };
  }, [router]);

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

  if (callStatus === 'in-call') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0F172A' }}>
        <div style={{ background: '#1E293B', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontWeight: 'bold', color: 'white' }}>1-on-1 with Tutor</h2>
          <button onClick={() => router.push('/student')} style={{ background: '#EF4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Leave Call</button>
        </div>
        <iframe src={`https://meet.jit.si/${roomName}`} style={{ flex: 1, border: 'none', width: '100%' }} allow="camera; microphone; fullscreen; display-capture"></iframe>
      </div>
    );
  }

  if (callStatus === 'ringing') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0F172A', textAlign: 'center', padding: '2rem' }}>
        <div style={{ background: 'rgba(59,130,246,0.2)', padding: '1rem 2rem', borderRadius: '20px', border: '2px solid #3B82F6', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3B82F6' }}>Incoming Call! 📞</h1>
          <p style={{ color: 'white', marginTop: '0.5rem' }}>Your Tutor is ready to talk.</p>
        </div>
        
        <div style={{ fontSize: '6rem', fontWeight: 'bold', color: '#F8FAFC', marginBottom: '1rem', lineHeight: '1' }}>{countdown}</div>
        <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>Connecting you automatically...</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0F172A', color: 'white' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Waiting for Tutor...</h1>
      <p style={{ color: '#94A3B8' }}>Please wait, your teacher will call you soon.</p>
      <button onClick={() => router.push('/student')} style={{ marginTop: '2rem', background: '#334155', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Back to Dashboard</button>
    </div>
  );
}

