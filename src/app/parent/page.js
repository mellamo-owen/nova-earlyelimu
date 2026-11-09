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

        {/* EXCLUSIVITY & TEACHER GUARANTEE NOTICE */}
        <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '8px', border: '1px solid #10B981', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ background: '#10B981', color: 'white', padding: '0.5rem', borderRadius: '50%', fontWeight: 'bold', width: '25px', height: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>✓</div>
          <div>
            <p style={{ color: '#065F46', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
              You have secured one of the exclusive 20 student slots per teacher.
            </p>
            <p style={{ color: '#047857', fontSize: '0.9rem' }}>
              Guarantee: The teacher who starts with your child will stay with them to the very end.
            </p>
          </div>
        </div>

        {!studentData ? (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ color: '#6B7280' }}>No student found for this account.</p>
          </div>
        ) : (
          <>
            <div style={{ background: '#1E3A8A', padding: '2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Student Profile</p>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{studentData.name}</h2>
                <p style={{ fontSize: '1rem', color: '#10B981', fontWeight: 'bold' }}>{studentData.student_id_code || 'ID Pending'}</p>
                <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.5rem' }}>Age: {studentData.age} | Mode: {studentData.mode}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Current Status</p>
                <span style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', background: studentData.status === 'PENDING' ? '#FEF3C7' : '#D1FAE5', color: studentData.status === 'PENDING' ? '#D97706' : '#065F46' }}>
                  {studentData.status}
                </span>
              </div>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '2px solid #10B981', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: '#1E3A8A', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>What Your Child Will Achieve</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.95rem' }}>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold' }}>1.</span> 
                  <span style={{ color: '#000000' }}>A real GitHub account & LinkedIn profile.</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold' }}>2.</span> 
                  <span style={{ color: '#000000' }}>Real personal & group fullstack projects.</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold' }}>3.</span> 
                  <span style={{ color: '#000000' }}>A NovaNest verified skills badge.</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold' }}>4.</span> 
                  <span style={{ color: '#000000' }}>A chance to join Nova Labs to build real company projects and earn.</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold' }}>5.</span> 
                  <span style={{ color: '#000000' }}>Financial guidance from NovaFinance on how to handle and invest earnings early.</span>
                </li>
              </ul>
            </div>

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

            {studentData.status === 'WEEK1_FREE' && (
              <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '2px solid #10B981', marginBottom: '2rem' }}>
                <h2 style={{ color: '#000000', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem' }}>Week 1 - Free Onboarding</h2>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#F9FAFB', padding: '1rem', borderRadius: '8px' }}><input type="checkbox" style={{ width: '20px', height: '20px' }} /><span style={{ color: '#000000', fontWeight: 'bold' }}>Install VS Code on your laptop</span></li>
                  <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#F9FAFB', padding: '1rem', borderRadius: '8px' }}><input type="checkbox" style={{ width: '20px', height: '20px' }} /><span style={{ color: '#000000', fontWeight: 'bold' }}>Create a GitHub Account</span></li>
                  <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#F9FAFB', padding: '1rem', borderRadius: '8px' }}><input type="checkbox" style={{ width: '20px', height: '20px' }} /><span style={{ color: '#000000', fontWeight: 'bold' }}>Prepare a Notebook and Pen</span></li>
                </ul>
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
