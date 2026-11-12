'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CallPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(30);
  const [student, setStudent] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch the student info to get their ID code
    const fetchStudent = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      // Fetching the first student for this demo
      const { data } = await supabase.from('students').select('*').limit(1).single();
      if (data) setStudent(data);
      setLoading(false);
    };
    
    fetchStudent();

    // 2. Start the 30-second countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  if (loading) return <div style={{ minHeight: '100vh', background: '#0A1931', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

  // If the student clicks join, load the Jitsi iframe
  if (inCall) {
    return (
      <main style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0A1931' }}>
        <div style={{ background: '#0A1931', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontWeight: 'bold' }}>1-on-1 with Teacher Mickowen</h1>
          <button onClick={() => router.push('/student')} style={{ background: '#FF6B00', color: '#0A1931', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            End Call
          </button>
        </div>
        <iframe 
          src={`https://meet.jit.si/novaearlyelimu-kid-${student?.student_id_code || '001'}`}
          style={{ flex: 1, border: 'none', width: '100%' }}
          allow="camera; microphone; fullscreen; display-capture"
        ></iframe>
      </main>
    );
  }

  // The 30-second countdown screen
  return (
    <main style={{ minHeight: '100vh', background: '#0A1931', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center' }}>
      
      <div style={{ background: 'rgba(255, 107, 0, 0.1)', border: '2px solid #FF6B00', padding: '3rem', borderRadius: '24px', maxWidth: '500px', width: '100%' }}>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Get Ready! 🚀</h1>
        <p style={{ color: '#9CA3AF', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Teacher Mickowen is ready for your 1-on-1 session. 
          Make sure your microphone is working!
        </p>

        <div style={{ fontSize: '6rem', fontWeight: 'bold', color: '#FF6B00', marginBottom: '2rem', lineHeight: '1' }}>
          {countdown}
        </div>

        <button 
          onClick={() => setInCall(true)}
          disabled={countdown > 0}
          style={{ 
            background: countdown > 0 ? '#4B5563' : '#FF6B00', 
            color: countdown > 0 ? '#9CA3AF' : '#0A1931', 
            padding: '1.2rem 2rem', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            fontSize: '1.2rem', 
            border: 'none', 
            width: '100%',
            cursor: countdown > 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {countdown > 0 ? 'Please wait...' : 'TAP TO JOIN CALL'}
        </button>

      </div>

    </main>
  );
}
