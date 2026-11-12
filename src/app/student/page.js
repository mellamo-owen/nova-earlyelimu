'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      
      const { data: student } = await supabase.from('students').select('*').eq('auth_user_id', user.id).single();
      
      if (student) {
        setStudentData(student);
        
        // 🛑 THE PERFECT LOCK LOGIC
        const now = new Date();
        const expiryDate = student.payment_expires_at ? new Date(student.payment_expires_at) : null;
        
        // If they have an expiry date AND it's in the future, they are unlocked.
        if (expiryDate && expiryDate > now) {
          setIsLocked(false);
          // Calculate days left
          const diffTime = Math.abs(expiryDate - now);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysLeft(diffDays);
        } else {
          // If the date is past, or they don't have one, they are locked.
          setIsLocked(true);
        }

        // Fetch next class
        const { data: lesson } = await supabase.from('lessons').select('*').not('class_date', 'is', null).order('class_date', { ascending: true }).limit(1).single();
        if (lesson) setNextClass(lesson);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString([], { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <main style={{ minHeight: '100vh', background: '#F9FAFB', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: '#000000', fontSize: '1.8rem', fontWeight: 'bold' }}>Hi {studentData?.name}</h1>
            <p style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.1rem' }}>{studentData?.student_id_code || 'ID Pending'}</p>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={{ background: '#1E3A8A', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Logout</button>
        </div>

        {/* NEXT CLASS CARD */}
        {nextClass && (
          <div style={{ background: '#1E3A8A', padding: '2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem' }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Next Class</p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Week {nextClass.week}: {nextClass.title}</h2>
            <p style={{ color: '#93C5FD', fontWeight: 'bold', marginBottom: '1.5rem', fontSize: '1.1rem' }}>🗓️ {formatDate(nextClass.class_date)}</p>
            {!isLocked ? (
              <a href={nextClass.meet_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#10B981', color: 'white', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', textDecoration: 'none' }}>🎥 JOIN GOOGLE MEET</a>
            ) : (
              <p style={{ color: '#FCA5A5', fontWeight: 'bold' }}>🔒 Locked - Please pay to join the meet.</p>
            )}
          </div>
        )}

        {/* PAYWALL */}
        {isLocked ? (
          <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', padding: '2rem', borderRadius: '16px', textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: '#D97706', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem' }}>Your Payment is Overdue 🔒</h2>
            <p style={{ color: '#B45309', marginBottom: '1.5rem' }}>Ask your parent to make a payment to unlock Weeks 2-8, Chat, and Calls.</p>
          </div>
        ) : (
          <div style={{ background: '#F0FDF4', border: '1px solid #10B981', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center', color: '#065F46', fontWeight: 'bold' }}>
            ✅ Account Unlocked! You have {daysLeft} days of access remaining.
          </div>
        )}

        {!isLocked && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <Link href="/student/call" style={{ flex: 1, minWidth: '200px', background: '#0F172A', padding: '1.5rem', borderRadius: '16px', color: 'white', textDecoration: 'none', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>🎥 1-on-1 Call Room</h2>
            </Link>
            <Link href="/student/group" style={{ flex: 1, minWidth: '200px', background: '#10B981', padding: '1.5rem', borderRadius: '16px', color: 'white', textDecoration: 'none', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>💬 Class Group Chat</h2>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
