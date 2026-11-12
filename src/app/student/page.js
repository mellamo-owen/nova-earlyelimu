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

      // Get student profile
      const { data: studentData } = await supabase.from('students').select('*').eq('auth_user_id', user.id).single();
      
      if (studentData) {
        setStudent(studentData);
        
        const now = new Date();
        const expiryDate = studentData.payment_expires_at ? new Date(studentData.payment_expires_at) : null;
        if (!expiryDate || expiryDate < now) setIsLocked(true);

        // 🛑 CRITICAL FIX: Fetch ALL lessons without ANY filters
        const { data: lessonData, error } = await supabase.from('lessons').select('*');

        console.log("LESSONS FETCHED FROM DATABASE:", lessonData);
        console.log("ERROR (if any):", error);

        if (lessonData && lessonData.length > 0) {
          // Sort them by week number in JavaScript, not SQL
          const sortedLessons = lessonData.sort((a, b) => a.week - b.week);
          setLessons(sortedLessons);
          setNextClass(sortedLessons[0]); // Just grab the first week for the card
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const formatDate = (isoString) => {
    if (!isoString) return 'Schedule TBD';
    return new Date(isoString).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#10B981' }}>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
          Welcome back, {student?.name.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: '#9CA3AF', marginTop: '0.2rem' }}>Here is your learning overview for today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#1F2937', padding: '1.5rem', borderRadius: '16px', border: '1px solid #374151', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Lessons</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#3B82F6', marginTop: '0.5rem' }}>{lessons.length}</h2>
        </div>
        <div style={{ background: '#1F2937', padding: '1.5rem', borderRadius: '16px', border: '1px solid #374151', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Status</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: isLocked ? '#374151' : 'rgba(16, 185, 129, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '20px', marginTop: '0.8rem', border: `1px solid ${isLocked ? '#4B5563' : '#10B981'}` }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLocked ? '#9CA3AF' : '#10B981' }}></div>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: isLocked ? 'white' : '#10B981' }}>{isLocked ? 'Locked' : 'Active'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* NEXT CLASS CARD */}
        <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #111827 100%)', padding: '2rem', borderRadius: '20px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: '#93C5FD', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Next Class</p>
            {nextClass ? (
              <>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Week {nextClass.week}: {nextClass.title}</h2>
                <p style={{ color: '#10B981', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: '500' }}>🗓️ {formatDate(nextClass.class_date)}</p>
                {nextClass.assignment_task && (
                  <p style={{ color: '#D1D5DB', fontSize: '0.9rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '6px' }}>
                    <strong>Task:</strong> {nextClass.assignment_task}
                  </p>
                )}
                {!isLocked ? (
                  <a href={nextClass.meet_link || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#10B981', color: 'white', padding: '0.8rem 2rem', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '0.95rem', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}>Join Class</a>
                ) : (
                  <span style={{ display: 'inline-block', background: 'rgba(255, 255, 255, 0.1)', color: '#9CA3AF', padding: '0.8rem 2rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.95rem' }}>Payment Required</span>
                )}
              </>
            ) : <p style={{ color: '#9CA3AF' }}>No classes posted yet.</p>}
          </div>
        </div>

        {/* ID CARD */}
        <div style={{ background: '#1F2937', padding: '1.5rem', borderRadius: '20px', border: '1px solid #374151', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <img src="/logo.png" alt="Nova" style={{ width: '30px', height: '30px', borderRadius: '8px' }} />
            <span style={{ fontWeight: '800', fontSize: '1rem', color: 'white' }}>Nova earlyElimu</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' }}>Student Name</p>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white', marginBottom: '1.5rem' }}>{student?.name}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#111827', padding: '1rem', borderRadius: '12px', border: '1px solid #374151' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' }}>Student ID</p>
              <p style={{ fontWeight: '800', color: '#10B981', fontSize: '1.1rem' }}>{student?.student_id_code}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' }}>Age</p>
              <p style={{ fontWeight: '800', color: 'white', fontSize: '1.1rem' }}>{student?.age}</p>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ background: '#1F2937', padding: '1.5rem', borderRadius: '20px', border: '1px solid #374151', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', marginBottom: '1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link href="/student/group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#111827', padding: '1rem', borderRadius: '12px', color: 'white', textDecoration: 'none', fontWeight: '600', border: '1px solid #374151', transition: 'all 0.2s' }}>
              <div style={{ background: '#1E3A8A', padding: '0.5rem', borderRadius: '8px', color: 'white' }}>💬</div> Class Chat
            </Link>
            <Link href="/student/call" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#111827', padding: '1rem', borderRadius: '12px', color: 'white', textDecoration: 'none', fontWeight: '600', border: '1px solid #374151', transition: 'all 0.2s' }}>
              <div style={{ background: '#065F46', padding: '0.5rem', borderRadius: '8px', color: '#10B981' }}>🎥</div> 1-on-1 Call
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

