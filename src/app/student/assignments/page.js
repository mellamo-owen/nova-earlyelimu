'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: studentData } = await supabase.from('students').select('*').eq('auth_user_id', user.id).single();
      if (studentData) setStudent(studentData);

      const { data: lessonData } = await supabase.from('lessons').select('*').order('week', { ascending: true });
      if (lessonData) setLessons(lessonData);

      const { data: assignmentData } = await supabase.from('assignments').select('*').eq('student_id', studentData.id);
      if (assignmentData) setAssignments(assignmentData);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>My Assignments</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {lessons.filter(l => l.assignment_task).map((lesson) => {
          const submission = assignments.find(a => a.lesson_id === lesson.id);
          return (
            <div key={lesson.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.85rem' }}>WEEK {lesson.week}</p>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{lesson.title}</h2>
                  <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '1rem' }}>{lesson.assignment_task}</p>
                </div>
                <span style={{ 
                  padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem',
                  background: submission ? (submission.status === 'GRADED' ? '#D1FAE5' : '#FEF3C7') : '#F3F4F6',
                  color: submission ? (submission.status === 'GRADED' ? '#065F46' : '#D97706') : '#6B7280'
                }}>
                  {submission ? submission.status : 'NOT SUBMITTED'}
                </span>
              </div>
              {submission && submission.status === 'GRADED' && (
                <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                  <p style={{ fontWeight: 'bold', color: '#10B981' }}>Mark: {submission.mark}</p>
                  <p style={{ color: '#6B7280', fontStyle: 'italic' }}>"{submission.teacher_comment}"</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
