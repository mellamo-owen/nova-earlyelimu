'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ParentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview'); // overview, results, chat
  const [loading, setLoading] = useState(true);
  const [parentData, setParentData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: parent } = await supabase.from('parents').select('*').eq('id', user.id).single();
    if (parent) setParentData(parent);

    const { data: student } = await supabase.from('students').select('*').eq('parent_id', user.id).single();
    if (student) {
      setStudentData(student);
      
      // Fetch grades
      const { data: assignmentData } = await supabase.from('assignments').select('*, lessons(title, week)').eq('student_id', student.id).order('created_at', { ascending: false });
      if (assignmentData) setAssignments(assignmentData);

      // Fetch chat messages
      const { data: chatData } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (chatData) setMessages(chatData);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '250px', background: 'white', padding: '1.5rem', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '2rem' }}>Nova Parent</h1>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button onClick={() => setActiveTab('overview')} style={{ textAlign: 'left', padding: '0.75rem', borderRadius: '8px', background: activeTab === 'overview' ? '#1E3A8A' : 'transparent', color: activeTab === 'overview' ? 'white' : '#6B7280', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Overview</button>
          <button onClick={() => setActiveTab('results')} style={{ textAlign: 'left', padding: '0.75rem', borderRadius: '8px', background: activeTab === 'results' ? '#1E3A8A' : 'transparent', color: activeTab === 'results' ? 'white' : '#6B7280', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Graded Results</button>
          <button onClick={() => setActiveTab('chat')} style={{ textAlign: 'left', padding: '0.75rem', borderRadius: '8px', background: activeTab === 'chat' ? '#1E3A8A' : 'transparent', color: activeTab === 'chat' ? 'white' : '#6B7280', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Chat with Teacher</button>
        </nav>
        <button onClick={handleLogout} style={{ background: '#EF4444', color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: 'auto' }}>Logout</button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '2rem' }}>
        
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>Welcome, {parentData?.name}</h2>
            <div style={{ background: '#1E3A8A', padding: '2rem', borderRadius: '16px', color: 'white' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Student: {studentData?.name}</h3>
              <p>ID: {studentData?.student_id_code}</p>
              <p>Status: {studentData?.status}</p>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Graded Results</h2>
              <button style={{ background: '#10B981', color: 'white', padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Download PDF Report</button>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              {assignments.map(a => (
                <div key={a.id} style={{ padding: '1rem', borderBottom: '1px solid #E5E7EB' }}>
                  <p style={{ fontWeight: 'bold' }}>Week {a.lessons?.week}: {a.lessons?.title}</p>
                  <p style={{ color: '#10B981' }}>Mark: {a.mark || 'Pending'}</p>
                  <p style={{ color: '#6B7280', fontStyle: 'italic' }}>"{a.teacher_comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>Chat with Teacher</h2>
            <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', height: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map(m => (
                <div key={m.id} style={{ alignSelf: m.sender_role === 'parent' ? 'flex-end' : 'flex-start', background: m.sender_role === 'parent' ? '#1E3A8A' : '#E5E7EB', color: m.sender_role === 'parent' ? 'white' : 'black', padding: '0.8rem', borderRadius: '12px', maxWidth: '80%' }}>
                  <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{m.sender_name}</p>
                  <p>{m.text_content}</p>
                </div>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setNewMessage(''); }} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message to teacher..." style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
              <button type="submit" style={{ background: '#10B981', color: 'white', padding: '0 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
