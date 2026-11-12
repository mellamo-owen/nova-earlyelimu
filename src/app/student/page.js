'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: student } = await supabase.from('students').select('*').eq('auth_user_id', user.id).single();
      if (student) setStudentData(student);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <main style={{ minHeight: '100vh', background: '#F9FAFB', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: '#000000', fontSize: '1.8rem', fontWeight: 'bold' }}>Hi {studentData?.name}</h1>
            <p style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.1rem' }}>{studentData?.student_id_code}</p>
          </div>
          <button onClick={handleLogout} style={{ background: '#1E3A8A', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Logout</button>
        </div>

        {/* CALL ROOM LINK */}
        <Link href="/student/call" style={{ display: 'block', background: '#1E3A8A', padding: '1.5rem', borderRadius: '16px', color: 'white', textDecoration: 'none', marginBottom: '2rem', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🎥 Enter 1-on-1 Call Room</h2>
          <p style={{ fontSize: '0.9rem', color: '#93C5FD' }}>Click here to wait for your teacher's call.</p>
        </Link>

        {/* CLASS GROUP LINK */}
        <Link href="/student/group" style={{ display: 'block', background: '#10B981', padding: '1.5rem', borderRadius: '16px', color: 'white', textDecoration: 'none', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(16,185,129,0.3)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>💬 Join Class Group Chat</h2>
          <p style={{ fontSize: '0.9rem' }}>Discuss assignments, ask questions, and send voice notes.</p>
        </Link>

      </div>
    </main>
  );
}
