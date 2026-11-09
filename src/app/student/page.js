'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  
  const [activeLesson, setActiveLesson] = useState(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: student } = await supabase.from('students').select('*').eq('auth_user_id', user.id).single();
    if (student) {
      setStudentData(student);
      const { data: lessonData } = await supabase.from('lessons').select('*').order('week', { ascending: true });
      if (lessonData) setLessons(lessonData);
      const { data: annData } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3);
      if (annData) setAnnouncements(annData);
    }
    setLoading(false);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!activeLesson) return;
    setSubmitting(true);

    const { data: existing } = await supabase.from('assignments').select('id').eq('student_id', studentData.id).eq('lesson_id', activeLesson.id).single();

    if (existing) {
      await supabase.from('assignments').update({ submission_link: submissionLink, submission_text: submissionText, status: 'SUBMITTED' }).eq('id', existing.id);
    } else {
      await supabase.from('assignments').insert([{
        student_id: studentData.id, lesson_id: activeLesson.id, submission_link: submissionLink, submission_text: submissionText, status: 'SUBMITTED'
      }]);
    }

    alert('Assignment submitted successfully!');
    setActiveLesson(null); setSubmissionLink(''); setSubmissionText('');
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div style={{ padding: '2rem', color: '#000000', background: '#F9FAFB', minHeight: '100vh' }}>Loading...</div>;

  return (
    <main style={{ minHeight: '100vh', background: '#F9FAFB', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: '#000000', fontSize: '1.8rem', fontWeight: 'bold' }}>Hi {studentData?.name}</h1>
            <p style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.1rem' }}>{studentData?.student_id_code || 'ID Pending'}</p>
          </div>
          <button onClick={handleLogout} style={{ background: '#1E3A8A', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Logout</button>
        </div>

        {/* STUDENT ID CARD */}
        {studentData?.status !== 'PENDING' && (
          <div style={{ 
            background: 'linear-gradient(135deg, #1E3A8A 0%, #000000 100%)', 
            borderRadius: '16px', 
            padding: '1.5rem', 
            color: 'white',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '2rem'
          }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(16,185,129,0.2)', borderRadius: '50%' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '30px', height: '30px', background: '#10B981', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>N</div>
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

        {/* WHAT YOU WILL ACHIEVE CARD */}
        <div style={{ background: '#1E3A8A', padding: '2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem', color: '#10B981' }}>What You Will Achieve By Week 8</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.95rem' }}>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>1.</span> 
              <span>A real GitHub account & LinkedIn profile.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>2.</span> 
              <span>Real personal & group fullstack projects.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>3.</span> 
              <span>A NovaNest verified skills badge.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>4.</span> 
              <span>A chance to join Nova Labs to build real company projects and earn.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>5.</span> 
              <span>Financial guidance from NovaFinance on how to handle and invest your earnings early.</span>
            </li>
          </ul>
        </div>

        {announcements.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#000000', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Announcements</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map(a => (
                <div key={a.id} style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '8px', border: '1px solid #D1FAE5' }}>
                  <p style={{ fontWeight: 'bold', color: '#065F46' }}>{a.title}</p>
                  <p style={{ color: '#047857', fontSize: '0.9rem', marginTop: '0.2rem' }}>{a.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: '#000000', padding: '2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Next Class</p>
          {lessons.length > 0 ? (
            <>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Week {lessons[0].week}: {lessons[0].title}
              </h2>
              <a href={lessons[0].meet_link || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#10B981', color: 'white', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', textDecoration: 'none', marginTop: '1rem' }}>
                JOIN GOOGLE MEET
              </a>
            </>
          ) : (
            <p style={{ color: '#9CA3AF' }}>Your teacher will post the next class soon.</p>
          )}
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#000000', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>My Lessons & Assignments</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lessons.map((lesson) => {
              const isLocked = lesson.week > 1 && studentData?.status !== 'APPROVED';
              return (
                <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: isLocked ? '#F3F4F6' : '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', opacity: isLocked ? 0.6 : 1 }}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#000000' }}>Week {lesson.week}: {lesson.title}</p>
                    {lesson.assignment_task && !isLocked && <p style={{ fontSize: '0.85rem', color: '#10B981', marginTop: '0.2rem' }}>Task: {lesson.assignment_task}</p>}
                  </div>
                  {isLocked ? <span style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 'bold' }}>Locked</span> : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {lesson.video_url && (
                        <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" style={{ background: '#1E3A8A', color: 'white', padding: '0.5rem', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.8rem' }}>Video</a>
                      )}
                      {lesson.assignment_task && (
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
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1rem' }}>Week {activeLesson.week}: {activeLesson.assignment_task}</p>
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
