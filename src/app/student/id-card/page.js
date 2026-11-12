'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function StudentIdCard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      
      const { data } = await supabase.from('students').select('*').eq('auth_user_id', user.id).single();
      if (data) setStudent(data);
      setLoading(false);
    };
    fetchStudent();
  }, [router]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading ID Card...</div>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>My Student ID</h1>
      <p style={{ color: '#6B7280', marginBottom: '2rem' }}>This is your official Nova earlyElimu digital ID card.</p>

      {/* DIGITAL ID CARD */}
      <div style={{ 
        background: '#1E3A8A', 
        backgroundImage: 'url("/id-card-bg.jpg")', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        borderRadius: '20px', 
        padding: '2rem', 
        color: 'white', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'left'
      }}>
        {/* Dark Overlay so text is readable */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(30,58,138,0.9) 0%, rgba(0,0,0,0.9) 100%)', zIndex: 0 }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '30px', height: '30px', borderRadius: '6px', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
              <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Nova earlyElimu</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 'bold', letterSpacing: '1px', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>STUDENT</span>
          </div>

          {/* NAME */}
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#D1D5DB', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Student Name</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', textTransform: 'capitalize' }}>{student?.name}</h2>
          </div>

          {/* DETAILS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#D1D5DB', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Student ID</p>
              <p style={{ fontWeight: 'bold', color: '#10B981', fontSize: '1.1rem' }}>{student?.student_id_code || 'Pending'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#D1D5DB', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Age</p>
              <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{student?.age} Years</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ fontSize: '0.75rem', color: '#D1D5DB', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Course</p>
              <p style={{ fontWeight: 'bold', fontSize: '1rem' }}>Fullstack Development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
