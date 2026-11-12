'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [toast, setToast] = useState('');

  const [activeLesson, setActiveLesson] = useState(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    
    const { data: student } = await supabase.from('students').select('*').eq('auth_user_id', user.id).single();
    if (student) {
      setStudentData(student);
      const { data: lessonData } = await supabase.from('lessons').select('*').order('week', { ascending: true });
      if (lessonData) setLessons(lessonData);
      const { data: subData } = await supabase.from('assignments').select('*').eq('student_id', student.id);
      if (subData) setSubmissions(subData);
    }
    setLoading(false);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const existing = submissions.find(s => s.lesson_id === activeLesson.id);

    if (existing) {
      await supabase.from('assignments').update({ submission_link: submissionLink, submission_text: submissionText, status: 'SUBMITTED' }).eq('id', existing.id);
    } else {
      await supabase.from('assignments').insert([{ student_id: studentData.id, lesson_id: activeLesson.id, submission_link: submissionLink, submission_text: submissionText, status: 'SUBMITTED' }]);
    }

    setToast('Assignment submitted successfully!');
    setActiveLesson(null); setSubmissionLink(''); setSubmissionText('');
    setSubmitting(false);
    fetchData(); 
    setTimeout(() => setToast(''), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  // 👑 THE PAYWALL CHECK
  const isPaid = studentData?.status === 'APPROVED';

  return (
    <main style={{ minHeight: '100vh', background: '#F9FAFB', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {toast && (
          <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#10B981', color: 'white', padding: '1rem 2rem', borderRadius: '8px', zIndex: 100, fontWeight: 'bold' }}>
            {toast}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: '#000000', fontSize: '1.8rem', fontWeight: 'bold' }}>Hi {studentData?.name}</h1>
            <p style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.1rem' }}>{studentData?.student_id_code || 'ID Pending'}</p>
          </div>
          <button onClick={handleLogout} style={{ background: '#1E3A8A', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Logout</button>
        </div>

        {/* IF NOT PAID, SHOW BLOCKER. IF PAID, SHOW LINKS. */}
        {!isPaid ? (
          <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', padding: '2rem', borderRadius: '16px', textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: '#D97706', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem' }}>Access Locked 🔒</h2>
            <p style={{ color: '#B45309', marginBottom: '1.5rem' }}>You have completed your free week! To unlock the Class Chat, 1-on-1 Calls, and Weeks 2-8, please ask your parent to make a payment.</p>
          </div>
        ) : (
          <>
            <Link href="/student/call" style={{ display: 'block', background: '#1E3A8A', padding: '1.5rem', borderRadius: '16px', color: 'white', textDecoration: 'none', marginBottom: '1rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>🎥 Enter 1-on-1 Call Room</h2>
            </Link>

            <Link href="/student/group" style={{ display: 'block', background: '#10B981', padding: '1.5rem', borderRadius: '16px', color: 'white', textDecoration: 'none', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>💬 Join Class Group Chat</h2>
            </Link>
          </>
        )}

        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#000000', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>My Lessons & Assignments</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lessons.map((lesson) => {
              // If they are not paid, lock EVERYTHING except Week 1
              const isLocked = !isPaid && lesson.week > 1;
              const hasSubmitted = submissions.some(s => s.lesson_id === lesson.id);
              
              return (
                <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: isLocked ? '#F3F4F6' : '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', opacity: isLocked ? 0.6 : 1 }}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#000000' }}>Week {lesson.week}: {lesson.title}</p>
                  </div>
                  
                  {isLocked ? (
                    <span style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 'bold' }}>🔒 Locked</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {lesson.video_url && (
                        <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" style={{ background: '#1E3A8A', color: 'white', padding: '0.5rem', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.8rem' }}>Video</a>
                      )}
                      
                      {hasSubmitted ? (
                        <span style={{ background: '#D1FAE5', color: '#065F46', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', border: '1px solid #10B981' }}>
                          ✓ Submitted
                        </span>
                      ) : lesson.assignment_task && (
                        <button onClick={() => setActiveLesson(lesson)} style={{ background: '#10B981', color: 'white', padding: '0.5rem', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Submit Work</button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {activeLesson && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ color: '#000000', fontWeight: 'bold', marginBottom: '1rem' }}>Submit Assignment</h2>
            <form onSubmit={handleSubmitAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type='url' placeholder='Paste your GitHub / Live Link here' required value={submissionLink} onChange={e => setSubmissionLink(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
              <textarea rows="3" placeholder='Explain what you built...' required value={submissionText} onChange={e => setSubmissionText(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type='button' onClick={() => setActiveLesson(null)} style={{ flex: 1, background: '#F3F4F6', color: '#6B7280', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type='submit' disabled={submitting} style={{ flex: 1, background: '#10B981', color: 'white', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>{submitting ? 'Sending...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
