'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function StudentAssignments() {
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [link, setLink] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: studentData } = await supabase.from('students').select('*').eq('auth_user_id', user.id).single();
      if (studentData) setStudent(studentData);

      const { data: lessonData } = await supabase.from('lessons').select('*').order('week', { ascending: true });
      if (lessonData) setLessons(lessonData);

      if (studentData) {
        const { data: subData } = await supabase.from('assignments').select('*').eq('student_id', studentData.id);
        if (subData) setSubmissions(subData);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const existing = submissions.find(s => s.lesson_id === activeLesson.id);

    if (existing) {
      await supabase.from('assignments').update({ submission_link: link, submission_text: text, status: 'SUBMITTED' }).eq('id', existing.id);
    } else {
      await supabase.from('assignments').insert([{ student_id: student.id, lesson_id: activeLesson.id, submission_link: link, submission_text: text, status: 'SUBMITTED' }]);
    }

    alert('Assignment submitted successfully! Your tutor can now grade it.');
    setActiveLesson(null);
    setLink('');
    setText('');
    setSubmitting(false);
    
    // Refresh submissions
    const { data: subData } = await supabase.from('assignments').select('*').eq('student_id', student.id);
    if (subData) setSubmissions(subData);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>My Assignments</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {lessons.filter(l => l.assignment_task).map((lesson) => {
          const submission = submissions.find(a => a.lesson_id === lesson.id);
          return (
            <div key={lesson.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.85rem' }}>WEEK {lesson.week}</p>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{lesson.title}</h2>
                  <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '1rem' }}>Task: {lesson.assignment_task}</p>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem', display: 'inline-block', marginBottom: '0.5rem',
                    background: submission ? (submission.status === 'GRADED' ? '#D1FAE5' : '#FEF3C7') : '#F3F4F6',
                    color: submission ? (submission.status === 'GRADED' ? '#065F46' : '#D97706') : '#6B7280'
                  }}>
                    {submission ? submission.status : 'NOT SUBMITTED'}
                  </span>
                  
                  {!submission && (
                    <button onClick={() => setActiveLesson(lesson)} style={{ display: 'block', background: '#EF4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                      Submit Work
                    </button>
                  )}
                </div>
              </div>

              {submission && submission.status === 'GRADED' && (
                <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '8px', marginTop: '1rem', borderLeft: '4px solid #10B981' }}>
                  <p style={{ fontWeight: 'bold', color: '#10B981' }}>Mark: {submission.mark}</p>
                  <p style={{ color: '#6B7280', fontStyle: 'italic' }}>"{submission.teacher_comment}"</p>
                </div>
              )}
            </div>
          );
        })}
        {lessons.filter(l => l.assignment_task).length === 0 && (
          <p style={{ color: '#6B7280', textAlign: 'center', marginTop: '2rem' }}>No assignments posted by your tutor yet.</p>
        )}
      </div>

      {/* SUBMISSION MODAL */}
      {activeLesson && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ color: '#111827', fontWeight: 'bold', marginBottom: '1rem' }}>Submit Assignment</h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1rem' }}>Week {activeLesson.week}: {activeLesson.assignment_task}</p>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type='url' placeholder='Paste your GitHub / Live Link here' required value={link} onChange={e => setLink(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
              <textarea rows="3" placeholder='Explain what you built...' required value={text} onChange={e => setText(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type='button' onClick={() => setActiveLesson(null)} style={{ flex: 1, background: '#F3F4F6', color: '#6B7280', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type='submit' disabled={submitting} style={{ flex: 1, background: '#10B981', color: 'white', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>{submitting ? 'Uploading...' : 'Submit Work'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

