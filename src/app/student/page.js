'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

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

        // 2. Fetch Next Class
        const { data: lesson } = await supabase.from('lessons').select('*').not('class_date', 'is', null).order('class_date', { ascending: true }).limit(1).single();
        if (lesson) setNextClass(lesson);

        // 3. Fetch Assignments
        const { data: assignmentData } = await supabase.from('assignments').select('*, lessons(title, week)').eq('student_id', studentData.id).order('created_at', { ascending: false });
        if (assignmentData) setAssignments(assignmentData);
      }
    };
    fetchData();
  }, [router]);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!student) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>Good Morning, {student.name.split(' ')[0]}!</h1>
          <p style={{ color: '#6B7280' }}>Here's your learning journey for today. Keep going!</p>
        </div>
        <div style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #E5E7EB', fontSize: '0.9rem', fontWeight: 'bold' }}>
          📅 {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* TOP STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 'bold' }}>Upcoming Classes</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>{nextClass ? 1 : 0}</h2>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 'bold' }}>Assignments</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B' }}>{assignments.length}</h2>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 'bold' }}>Account Status</p>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isLocked ? '#EF4444' : '#10B981', marginTop: '0.5rem' }}>
            {isLocked ? '🔒 Locked' : '✅ Active'}
          </h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN: Next Class & Assignments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* NEXT CLASS CARD */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Next Class</h2>
            {nextClass ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.85rem' }}>WEEK {nextClass.week}</p>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111827' }}>{nextClass.title}</h3>
                  <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>🗓️ {formatDate(nextClass.class_date)}</p>
                </div>
                {!isLocked ? (
                  <a href={nextClass.meet_link} target="_blank" rel="noopener noreferrer" style={{ background: '#EF4444', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>Join Meet</a>
                ) : (
                  <span style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold' }}>Locked</span>
                )}
              </div>
            ) : (
              <p style={{ color: '#6B7280' }}>No upcoming classes scheduled.</p>
            )}
          </div>

          {/* RECENT ASSIGNMENTS */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>My Assignments</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {assignments.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.8rem' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#111827' }}>Week {a.lessons?.week}: {a.lessons?.title}</p>
                    <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>Status: {a.status}</p>
                  </div>
                  {a.status === 'GRADED' ? (
                    <span style={{ background: '#D1FAE5', color: '#065F46', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>Mark: {a.mark}</span>
                  ) : (
                    <Link href="/student/assignments" style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'none' }}>Submit →</Link>
                  )}
                </div>
              ))}
              {assignments.length === 0 && <p style={{ color: '#6B7280' }}>No assignments yet.</p>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ID Card & Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* ID CARD */}
          <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #000000 100%)', padding: '1.5rem', borderRadius: '16px', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(16,185,129,0.2)', borderRadius: '50%' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
              <img src="/logo.png" alt="Nova" style={{ width: '25px', height: '25px', borderRadius: '4px' }} onError={(e) => { e.target.style.display = 'none'; }} />
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Nova earlyElimu</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase' }}>Student Name</p>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>{student.name}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase' }}>ID</p>
                <p style={{ fontWeight: 'bold', color: '#10B981' }}>{student.student_id_code}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase' }}>Age</p>
                <p style={{ fontWeight: 'bold' }}>{student.age}</p>
              </div>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Quick Links</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <Link href="/student/group" style={{ background: '#F3F4F6', padding: '0.8rem', borderRadius: '8px', color: '#111827', textDecoration: 'none', fontWeight: 'bold' }}>💬 Group Chat</Link>
              <Link href="/student/call" style={{ background: '#F3F4F6', padding: '0.8rem', borderRadius: '8px', color: '#111827', textDecoration: 'none', fontWeight: 'bold' }}>🎥 1-on-1 Call</Link>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM BANNER */}
      <div style={{ background: '#EF4444', padding: '1.5rem', borderRadius: '12px', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Upcoming Assignment Deadline</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Don't forget to submit your work!</p>
        </div>
        <Link href="/student/assignments" style={{ background: 'white', color: '#EF4444', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>View Assignments</Link>
      </div>
    </div>
  );
}
