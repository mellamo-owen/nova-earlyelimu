'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [nextClass, setNextClass] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: studentData } = await supabase.from('students').select('*').eq('auth_user_id', user.id).single();
      
      if (studentData) {
        setStudent(studentData);
        const now = new Date();
        const expiryDate = studentData.payment_expires_at ? new Date(studentData.payment_expires_at) : null;
        if (!expiryDate || expiryDate < now) setIsLocked(true);

        const { data: lessonData } = await supabase.from('lessons').select('*').order('week', { ascending: true });
        if (lessonData) {
          setLessons(lessonData);
          const upcoming = lessonData.filter(l => l.class_date && new Date(l.class_date) > now).sort((a,b) => new Date(a.class_date) - new Date(b.class_date));
          if (upcoming.length > 0) setNextClass(upcoming[0]);
          else if (lessonData.length > 0) setNextClass(lessonData[0]);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const formatDate = (isoString) => {
    if (!isoString) return 'Date TBD';
    return new Date(isoString).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading...</div>;

  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
          Welcome back, {student?.name.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: '#64748B', marginTop: '0.2rem' }}>Here is your learning overview for today.</p>
      </div>

      {/* TOP STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Lessons</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#3B82F6', marginTop: '0.5rem' }}>{lessons.length}</h2>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Status</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: isLocked ? '#FEF2F2' : '#ECFDF5', padding: '0.4rem 0.8rem', borderRadius: '20px', marginTop: '0.8rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLocked ? '#EF4444' : '#10B981' }}></div>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: isLocked ? '#B91C1C' : '#047857' }}>{isLocked ? 'Locked' : 'Active'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* NEXT CLASS CARD */}
        <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', padding: '2rem', borderRadius: '20px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Next Class</p>
            {nextClass ? (
              <>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>{nextClass.title}</h2>
                <p style={{ color: '#93C5FD', fontSize: '0.95rem', marginBottom: '2rem', fontWeight: '500' }}>🗓️ {formatDate(nextClass.class_date)}</p>
                {!isLocked ? (
                  <a href={nextClass.meet_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#3B82F6', color: 'white', padding: '0.8rem 2rem', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '0.95rem', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)' }}>Join Class</a>
                ) : (
                  <span style={{ display: 'inline-block', background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', padding: '0.8rem 2rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.95rem' }}>Payment Required</span>
                )}
              </>
            ) : <p style={{ color: '#94A3B8' }}>No upcoming classes.</p>}
          </div>
        </div>

        {/* ID CARD */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <img src="/logo.png" alt="Nova" style={{ width: '30px', height: '30px', borderRadius: '8px' }} />
            <span style={{ fontWeight: '800', fontSize: '1rem', color: '#0F172A' }}>Nova earlyElimu</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Student Name</p>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.5rem' }}>{student?.name}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '1rem', borderRadius: '12px' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Student ID</p>
              <p style={{ fontWeight: '800', color: '#10B981', fontSize: '1.1rem' }}>{student?.student_id_code}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Age</p>
              <p style={{ fontWeight: '800', color: '#0F172A', fontSize: '1.1rem' }}>{student?.age}</p>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link href="/student/group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', color: '#0F172A', textDecoration: 'none', fontWeight: '600', transition: 'all 0.2s' }}>
              <div style={{ background: '#DBEAFE', padding: '0.5rem', borderRadius: '8px', color: '#2563EB' }}>💬</div> Class Chat
            </Link>
            <Link href="/student/call" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', color: '#0F172A', textDecoration: 'none', fontWeight: '600', transition: 'all 0.2s' }}>
              <div style={{ background: '#FCE7F3', padding: '0.5rem', borderRadius: '8px', color: '#DB2777' }}>🎥</div> 1-on-1 Call
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
