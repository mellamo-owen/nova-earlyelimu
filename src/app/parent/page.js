'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ParentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [parentData, setParentData] = useState(null);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: parent } = await supabase.from('parents').select('*').eq('id', user.id).single();
      if (parent) setParentData(parent);

      const { data: student } = await supabase.from('students').select('*').eq('parent_id', user.id).single();
      if (student) setStudentData(student);
      
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  const isPaid = studentData?.status === 'APPROVED';

  return (
    <main style={{ minHeight: '100vh', background: '#F9FAFB', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: '#000000', fontSize: '1.8rem', fontWeight: 'bold' }}>Parent Dashboard</h1>
            <p style={{ color: '#6B7280' }}>Welcome, {parentData?.name}</p>
          </div>
          <button onClick={handleLogout} style={{ background: '#1E3A8A', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Logout</button>
        </div>

        {/* EXCLUSIVITY NOTICE */}
        <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '8px', border: '1px solid #10B981', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ background: '#10B981', color: 'white', padding: '0.5rem', borderRadius: '50%', fontWeight: 'bold', width: '25px', height: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>✓</div>
          <div>
            <p style={{ color: '#065F46', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.2rem' }}>You have secured one of the exclusive 20 student slots per teacher.</p>
            <p style={{ color: '#047857', fontSize: '0.9rem' }}>Guarantee: The teacher who starts with your child will stay with them to the very end.</p>
          </div>
        </div>

        {/* PAYWALL BANNER FOR PARENTS */}
        {!isPaid && studentData?.status === 'WEEK1_FREE' && (
          <div style={{ background: '#FEF2F2', border: '2px solid #EF4444', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#B91C1C', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Action Required: Week 1 is Over</h2>
            <p style={{ color: '#7F1D1D', marginBottom: '1.5rem' }}>To unlock Weeks 2-8, the Class Group Chat, and 1-on-1 calls for {studentData.name}, please make a payment.</p>
            <button onClick={() => router.push('/payment')} style={{ background: '#EF4444', color: 'white', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)' }}>
              Pay KES 1,000 Weekly (or KES 8,000 Full)
            </button>
          </div>
        )}

        {studentData ? (
          <>
            <div style={{ background: '#1E3A8A', padding: '2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Student Profile</p>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{studentData.name}</h2>
                <p style={{ fontSize: '1rem', color: '#10B981', fontWeight: 'bold' }}>{studentData.student_id_code || 'ID Pending'}</p>
                <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.5rem' }}>Age: {studentData.age} | Mode: {studentData.mode}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Payment Status</p>
                <span style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', background: isPaid ? '#D1FAE5' : '#FEF3C7', color: isPaid ? '#065F46' : '#D97706' }}>
                  {isPaid ? 'APPROVED' : 'PENDING PAYMENT'}
                </span>
              </div>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: '#000000', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem' }}>Payment Options</h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px', background: '#F9FAFB', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Weekly Fee</p>
                  <p style={{ color: '#000000', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>KES 1,000 <span style={{fontSize: '1rem', fontWeight: 'normal', color: '#6B7280'}}>/ week</span></p>
                  <button onClick={() => router.push('/payment')} style={{ width: '100%', background: '#10B981', color: 'white', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Pay Weekly</button>
                </div>
                <div style={{ flex: 1, minWidth: '250px', background: '#F9FAFB', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Full Course</p>
                  <p style={{ color: '#000000', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>KES 8,000 <span style={{fontSize: '1rem', fontWeight: 'normal', color: '#6B7280'}}> / once</span></p>
                  <button onClick={() => router.push('/payment')} style={{ width: '100%', background: '#1E3A8A', color: 'white', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Pay Full 8 Weeks</button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ color: '#6B7280' }}>No student found for this account.</p>
          </div>
        )}
      </div>
    </main>
  );
}
