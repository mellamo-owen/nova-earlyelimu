'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ParentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [parentData, setParentData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [latestCall, setLatestCall] = useState(null);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: parent } = await supabase.from('parents').select('*').eq('id', user.id).single();
    if (parent) setParentData(parent);

    const { data: student } = await supabase.from('students').select('*').eq('parent_id', user.id).single();
    
    if (student) {
      setStudentData(student);
      const { data: callData } = await supabase.from('calls').select('*').eq('student_id', student.id).order('created_at', { ascending: false }).limit(1).single();
      if (callData) setLatestCall(callData);
      const { data: assignmentData } = await supabase.from('assignments').select('*, lessons(title, week)').eq('student_id', student.id).order('created_at', { ascending: false });
      if (assignmentData) setAssignments(assignmentData);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div style={{ padding: '2rem', color: '#000000', background: '#F9FAFB', minHeight: '100vh' }}>Loading Parent Data...</div>;

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

        {/* PLACEHOLDER 3: BACKGROUND BANNER (Parent Dashboard) */}
        <div style={{ 
          width: '100%', height: '160px', background: '#1E3A8A', borderRadius: '16px', marginBottom: '2rem',
          backgroundImage: 'url("/parent-banner.jpg")', backgroundSize: 'cover', backgroundPosition: 'center',
          display: 'flex', alignItems: 'center', padding: '0 2rem', position: 'relative', overflow: 'hidden'
        }}>
          {/* Fallback if no image is uploaded */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(30,58,138,0.8)', zIndex: 0 }}></div>
          
          <div style={{ position: 'relative', zIndex: 1, color: 'white' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Parent Portal</h2>
            <p style={{ color: '#10B981', fontWeight: 'bold' }}>Guarantee: The teacher who starts with your child stays to the end.</p>
          </div>
        </div>

        {!studentData ? (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ color: '#6B7280' }}>No student found for this account.</p>
          </div>
        ) : (
          <>
            {/* STUDENT ID CARD (From the last step) */}
            {studentData?.status !== 'PENDING' && (
              <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #000000 100%)', borderRadius: '16px', padding: '1.5rem', color: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', position: 'relative', overflow: 'hidden', marginBottom: '2rem' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(16,185,129,0.2)', borderRadius: '50%' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* PLACEHOLDER 4: LOGO (ID Card) */}
                    <img src="/logo.png" alt="Nova" style={{ width: '30px', height: '30px', borderRadius: '6px', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    <div style={{ display: 'none', width: '30px', height: '30px', background: '#10B981', borderRadius: '6px', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>N</div>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Nova earlyElimu</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 'bold', letterSpacing: '1px' }}>STUDENT</span>
                </div>
                <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                  <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Name</p>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', textTransform: 'capitalize' }}>{studentData.name}</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', position: 'relative', zIndex: 1 }}>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Student ID</p>
                    <p style={{ fontWeight: 'bold', color: '#10B981' }}>{studentData.student_id_code}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Age</p>
                    <p style={{ fontWeight: 'bold' }}>{studentData.age} Years</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Course</p>
                    <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Fullstack Development</p>
                  </div>
                </div>
              </div>
            )}

            {/* ... Keep the rest of the parent dashboard items (grades, achievements, payment) ... */}
            {assignments.length > 0 && (
              <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#000000', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Assignment Grades</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {assignments.map(a => (
                    <div key={a.id} style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                      <p style={{ fontWeight: 'bold', color: '#000000' }}>Week {a.lessons?.week}: {a.lessons?.title}</p>
                      {a.status === 'GRADED' ? (
                        <div style={{ marginTop: '0.5rem' }}>
                          <p style={{ color: '#10B981', fontWeight: 'bold' }}>Mark: {a.mark}</p>
                          <p style={{ color: '#6B7280', fontSize: '0.9rem', fontStyle: 'italic' }}>"{a.teacher_comment}"</p>
                        </div>
                      ) : (
                        <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>Status: Awaiting Grading</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {latestCall && (
              <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', borderLeft: '5px solid #10B981', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#000000', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Latest 1-on-1 Call Feedback</h2>
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Understanding Score</p>
                    <p style={{ color: '#1E3A8A', fontSize: '1.5rem', fontWeight: 'bold' }}>{latestCall.understanding_score} / 5</p>
                  </div>
                </div>
                <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '8px' }}>
                  <p style={{ color: '#000000', fontSize: '0.95rem', fontStyle: 'italic' }}>"{latestCall.feedback}"</p>
                </div>
              </div>
            )}

            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: '#000000', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem' }}>Payment Options</h2>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Pay KES 1,000 weekly to unlock the next class, or pay KES 8,000 once to unlock all 8 weeks immediately.</p>
              
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
        )}
      </div>
    </main>
  );
}
