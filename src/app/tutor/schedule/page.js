'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TutorSchedule() {
  const [lessons, setLessons] = useState([]);
  
  // Form State
  const [week, setWeek] = useState('1');
  const [title, setTitle] = useState('');
  const [classDate, setClassDate] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [assignmentTask, setAssignmentTask] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    // Fetch in the background
    const { data } = await supabase.from('lessons').select('*').order('class_date', { ascending: true });
    if (data) setLessons(data);
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const isoDate = new Date(classDate).toISOString();

    // 1. INSTANT UI UPDATE (Optimistic)
    const newLesson = {
      id: Date.now().toString(), // Temporary ID
      week: parseInt(week),
      title,
      class_date: isoDate,
      meet_link: meetLink,
      assignment_task: assignmentTask
    };
    
    setLessons(prev => [...prev, newLesson].sort((a, b) => new Date(a.class_date) - new Date(b.class_date)));
    
    // Clear form instantly
    setTitle(''); setClassDate(''); setMeetLink(''); setAssignmentTask('');
    
    // 2. Send to Supabase in the background
    await supabase.from('lessons').insert([{
      week: parseInt(week), 
      title, 
      class_date: isoDate,
      meet_link: meetLink, 
      assignment_task: assignmentTask
    }]);
    
    setLoading(false);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'No date set';
    return new Date(isoString).toLocaleString([], { 
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      
      {/* SCHEDULE FORM */}
      <div style={{ flex: 1, minWidth: '300px', background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#3B82F6' }}>Schedule a Class</h2>
        <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <select value={week} onChange={e => setWeek(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }}>
            {[1,2,3,4,5,6,7,8].map(w => <option key={w} value={w}>Week {w}</option>)}
          </select>

          <input type="text" placeholder="Lesson Topic (e.g. HTML Basics)" required value={title} onChange={e => setTitle(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94A3B8' }}>Date & Time</label>
            <input type="datetime-local" required value={classDate} onChange={e => setClassDate(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
          </div>

          <input type="url" placeholder="Google Meet Link" required value={meetLink} onChange={e => setMeetLink(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
          
          <textarea placeholder="Assignment Task (Optional)" value={assignmentTask} onChange={e => setAssignmentTask(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: '1px solid #334155' }} />
          
          <button type="submit" disabled={loading} style={{ background: '#3B82F6', color: 'white', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : 'Schedule & Notify Students'}
          </button>
        </form>
      </div>

      {/* UPCOMING CLASSES LIST */}
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Your Schedule</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {lessons.map(l => (
            <div key={l.id} style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', borderLeft: '4px solid #3B82F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <p style={{ color: '#3B82F6', fontWeight: 'bold', fontSize: '0.8rem' }}>WEEK {l.week}</p>
                <span style={{ fontSize: '0.8rem', color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  {formatDate(l.class_date)}
                </span>
              </div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{l.title}</h3>
              <a href={l.meet_link} target="_blank" rel="noopener noreferrer" style={{ color: '#94A3B8', fontSize: '0.85rem', textDecoration: 'underline' }}>Join Google Meet</a>
            </div>
          ))}
          {lessons.length === 0 && <p style={{ color: '#94A3B8' }}>No classes scheduled yet.</p>}
        </div>
      </div>
    </div>
  );
}
