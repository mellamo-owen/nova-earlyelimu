'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLessons() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  
  const [week, setWeek] = useState('1');
  const [title, setTitle] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [assignmentTask, setAssignmentTask] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAdmin();
    fetchLessons();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: profile } = await supabase.from('parents').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') { router.push('/login'); } else { setLoading(false); }
  };

  const fetchLessons = async () => {
    const { data } = await supabase.from('lessons').select('*').order('week', { ascending: true });
    if (data) setLessons(data);
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from('lessons').insert([{
      week: parseInt(week),
      title: title,
      meet_link: meetLink,
      video_url: videoUrl,
      assignment_task: assignmentTask
    }]);

    if (error) {
      alert('Error adding lesson: ' + error.message);
    } else {
      alert('Lesson added successfully!');
      setTitle(''); setMeetLink(''); setVideoUrl(''); setAssignmentTask('');
      fetchLessons();
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '2rem', color: 'white', background: '#0A1931', minHeight: '100vh' }}>Loading...</div>;

  return (
    <main style={{ minHeight: '100vh', background: '#F5F7FA', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <button onClick={() => router.push('/admin')} style={{ background: 'transparent', color: '#0A1931', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '2rem' }}>
          ← Back to Admin Dashboard
        </button>

        <h1 style={{ color: '#0A1931', fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Manage Lessons</h1>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          
          <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#0A1931', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Add New Lesson</h2>
            <form onSubmit={handleAddLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#0A1931' }}>Week Number</label>
                <select value={week} onChange={e => setWeek(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }}>
                  {[1,2,3,4,5,6,7,8].map(w => <option key={w} value={w}>Week {w}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#0A1931' }}>Lesson Title</label>
                <input type='text' required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., HTML Basics - Build My First Page" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#0A1931' }}>Google Meet Link</label>
                <input type='url' value={meetLink} onChange={e => setMeetLink(e.target.value)} placeholder="https://meet.google.com/..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#0A1931' }}>Video URL (YouTube)</label>
                <input type='url' value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#0A1931' }}>Assignment Task</label>
                <textarea rows="3" value={assignmentTask} onChange={e => setAssignmentTask(e.target.value)} placeholder="What should the kids build this week?" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }}></textarea>
              </div>

              <button type='submit' disabled={saving} style={{ background: '#FF6B00', color: '#0A1931', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
                {saving ? 'Saving...' : 'Save Lesson'}
              </button>
            </form>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 style={{ color: '#0A1931', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Saved Lessons</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {lessons.map(lesson => (
                <div key={lesson.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #FF6B00' }}>
                  <p style={{ color: '#FF6B00', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.2rem' }}>WEEK {lesson.week}</p>
                  <h3 style={{ color: '#0A1931', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{lesson.title}</h3>
                  {lesson.meet_link && <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>Meet: {lesson.meet_link.substring(0, 30)}...</p>}
                  {lesson.assignment_task && <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.5rem' }}>Task: {lesson.assignment_task}</p>}
                </div>
              ))}
              {lessons.length === 0 && <p style={{ color: '#6B7280' }}>No lessons created yet.</p>}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}