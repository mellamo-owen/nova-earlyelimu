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

        // 1. Lock Logic
        const now = new Date();
        const expiryDate = studentData.payment_expires_at ? new Date(studentData.payment_expires_at) : null;
        if (!expiryDate || expiryDate < now) setIsLocked(true);

        // 2. Fetch ALL lessons
        const { data: lessonData } = await supabase.from('lessons').select('*').order('week', { ascending: true });
        if (lessonData) {
          setLessons(lessonData);
          
          // Find the next upcoming class (with a date)
          const upcoming = lessonData.filter(l => l.class_date && new Date(l.class_date) > now).sort((a,b) => new Date(a.class_date) - new Date(b.class_date));
          if (upcoming.length > 0) setNextClass(upcoming[0]);
          else if (lessonData.length > 0) setNextClass(lessonData[0]); // Fallback to the first lesson
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 'bold', color: '#111827' }}>
            {getGreeting()}, {student?.name.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: '#6B7280', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Here's your learning journey for today. Keep going!</p>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 'bold' }}>Total Lessons</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3B82F6' }}>{lessons.length}</h2>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 'bold' }}>Status</p>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isLocked ? '#EF4444' : '#10B981', marginTop: '0.5rem' }}>
            {isLocked ? '🔒 Locked' : '✅ Active'}
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '100%' }}>
          
          {/* NEXT CLASS CARD */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Next Class</h2>
            {nextClass ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <p style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.85rem' }}>WEEK {nextClass.week}</p>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111827' }}>{nextClass.title}</h3>
                  <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>🗓️ {formatDate(nextClass.class_date)}</p>
                </div>
                {!isLocked && nextClass.meet_link ? (
                  <a href={nextClass.meet_link} target="_blank" rel="noopener noreferrer" style={{ background: '#EF4444', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' }}>Join Google Meet</a>
                ) : (
                  <span style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center' }}>Locked / No Link</span>
                )}
              </div>
            ) : (
              <p style={{ color: '#6B7280' }}>No classes scheduled yet.</p>
            )}
          </div>

          {/* ASSIGNMENTS CARD */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>My Assignments</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {lessons.filter(l => l.assignment_task).map(lesson => (
                <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '0.95rem' }}>Week {lesson.week}: {lesson.title}</p>
                    <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>{lesson.assignment_task}</p>
                  </div>
                  <Link href="/student/assignments" style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.85rem', textDecoration: 'none' }}>View →</Link>
                </div>
              ))}
              {lessons.filter(l => l.assignment_task).length === 0 && <p style={{ color: '#6B7280' }}>No assignments posted yet.</p>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '100%' }}>
          <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #000000 100%)', padding: '1.5rem', borderRadius: '16px', color: 'white' }}>
            <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase' }}>Student Name</p>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>{student?.name}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase' }}>ID</p>
                <p style={{ fontWeight: 'bold', color: '#10B981' }}>{student?.student_id_code}</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Quick Links</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <Link href="/student/group" style={{ background: '#F3F4F6', padding: '0.8rem', borderRadius: '8px', color: '#111827', textDecoration: 'none', fontWeight: 'bold' }}>💬 Class Chat</Link>
              <Link href="/student/call" style={{ background: '#F3F4F6', padding: '0.8rem', borderRadius: '8px', color: '#111827', textDecoration: 'none', fontWeight: 'bold' }}>🎥 1-on-1 Call</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
