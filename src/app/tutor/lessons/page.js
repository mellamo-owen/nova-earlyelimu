'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TutorLessons() {
  const [lessons, setLessons] = useState([]);
  const [week, setWeek] = useState('1');
  const [title, setTitle] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [assignmentTask, setAssignmentTask] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchLessons(); }, []);

  const fetchLessons = async () => {
    const { data } = await supabase.from('lessons').select('*').order('week', { ascending: true });
    if (data) setLessons(data);
  };

  const handlePostLesson = async (e) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('lessons').insert([{
      week: parseInt(week), title, meet_link: meetLink, video_url: videoUrl, assignment_task: assignmentTask
    }]);
    setTitle(''); setMeetLink(''); setVideoUrl(''); setAssignmentTask('');
    fetchLessons();
    setLoading(false);
    alert('Lesson posted successfully! Students can now see it.');
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      {/* POST LESSON FORM */}
      <div style={{ flex: 1, minWidth: '300px', background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#3B82F6' }}>Post New Lesson</h2>
        <form onSubmit={handlePostLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <select value={week} onChange={e => setWeek(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }}>
            {[1,2,3,4,5,6,7,8].map(w => <option key={w} value={w}>Week {w}</option>)}
          </select>
          <input type="text" placeholder="Lesson Title" required value={title} onChange={e => setTitle(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
          <input type="url" placeholder="Google Meet Link" required value={meetLink} onChange={e => setMeetLink(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
          <input type="url" placeholder="YouTube Video URL (Optional)" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
          <textarea placeholder="Assignment Task" required value={assignmentTask} onChange={e => setAssignmentTask(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
          <button type="submit" disabled={loading} style={{ background: '#3B82F6', color: 'white', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Posting...' : 'Post Lesson to Students'}
          </button>
        </form>
      </div>

      {/* EXISTING LESSONS LIST */}
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Active Lessons</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {lessons.map(l => (
            <div key={l.id} style={{ background: '#1E293B', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <p style={{ color: '#3B82F6', fontWeight: 'bold', fontSize: '0.8rem' }}>WEEK {l.week}</p>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{l.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Task: {l.assignment_task}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
