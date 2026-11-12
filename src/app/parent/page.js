'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ParentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [parentData, setParentData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

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
      const now = new Date();
      const expiryDate = student.payment_expires_at ? new Date(student.payment_expires_at) : null;
      if (!expiryDate || expiryDate < now) setIsLocked(true);

      const { data: assignmentData } = await supabase.from('assignments').select('*, lessons(title, week)').eq('student_id', student.id).order('created_at', { ascending: false });
      if (assignmentData) setAssignments(assignmentData);

      const { data: chatData } = await supabase.from('messages').select('*').eq('parent_id', user.id).order('created_at', { ascending: true });
      if (chatData) setMessages(chatData);
    }
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !studentData?.tutor_id) return;
    
    const newMsg = {
      sender_name: parentData?.name,
      sender_role: 'parent',
      text_content: newMessage,
      parent_id: parentData?.id,
      tutor_id: studentData?.tutor_id
    };
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    await supabase.from('messages').insert([newMsg]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#1E3A8A' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB', fontFamily: 'Inter, sans-serif', flexDirection: 'column' }}>
      
      {/* MOBILE HEADER */}
      <div className="mobile-header-parent" style={{ display: 'none', background: 'white', padding: '1rem', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', background: '#1E3A8A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>N</div>
          <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#111827' }}>Nova Parent</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: '#F3F4F6', border: 'none', color: '#111827', fontSize: '1.2rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px' }}>☰</button>
      </div>

      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        
        {/* SIDEBAR */}
        <aside className={`sidebar-parent ${isMobileMenuOpen ? 'open' : ''}`} style={{ width: '260px', background: 'white', padding: '1.5rem', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          
          <div className="desktop-logo-parent" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            <div style={{ width: '40px', height: '40px', background: '#1E3A8A', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '1.2rem' }}>N</div>
            <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.5px', color: '#111827' }}>Nova Parent</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <button onClick={() => handleTabChange('overview')} style={{ textAlign: 'left', padding: '0.8rem 1rem', borderRadius: '10px', background: activeTab === 'overview' ? '#F3F4F6' : 'transparent', color: activeTab === 'overview' ? '#1E3A8A' : '#6B7280', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Overview</button>
            <button onClick={() => handleTabChange('results')} style={{ textAlign: 'left', padding: '0.8rem 1rem', borderRadius: '10px', background: activeTab === 'results' ? '#F3F4F6' : 'transparent', color: activeTab === 'results' ? '#1E3A8A' : '#6B7280', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Graded Results</button>
            <button onClick={() => handleTabChange('chat')} style={{ textAlign: 'left', padding: '0.8rem 1rem', borderRadius: '10px', background: activeTab === 'chat' ? '#F3F4F6' : 'transparent', color: activeTab === 'chat' ? '#1E3A8A' : '#6B7280', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Chat Tutor</button>
          </nav>

          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={{ background: '#FEF2F2', color: '#EF4444', padding: '0.8rem', borderRadius: '10px', fontWeight: '600', border: 'none', cursor: 'pointer', marginTop: 'auto' }}>Log Out</button>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', width: '100%' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            
            {activeTab === 'overview' && (
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', marginBottom: '1.5rem' }}>Welcome, {parentData?.name}</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  
                  {/* STATUS CARD */}
                  <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>Student Profile</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.5rem' }}>{studentData?.name}</p>
                    <p style={{ color: '#6B7280', fontWeight: '500' }}>ID: {studentData?.student_id_code}</p>
                    
                    <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: isLocked ? '#FEF2F2' : '#ECFDF5', border: `1px solid ${isLocked ? '#FCA5A5' : '#10B981'}` }}>
                      <p style={{ color: isLocked ? '#B91C1C' : '#047857', fontWeight: '700', fontSize: '0.95rem' }}>
                        {isLocked ? '🔒 Payment Required' : '✅ Account Active'}
                      </p>
                      <p style={{ color: isLocked ? '#7F1D1D' : '#065F46', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                        {isLocked ? 'Please pay to unlock the next week.' : 'Your child has full access to all classes.'}
                      </p>
                    </div>
                  </div>

                  {/* PAYMENT CARD */}
                  <div style={{ background: '#1E3A8A', padding: '2rem', borderRadius: '20px', color: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Payments</h3>
                    <p style={{ color: '#93C5FD', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Unlock the next week or the full 8 weeks.</p>
                    <button onClick={() => router.push('/payment')} style={{ background: '#10B981', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: '700', border: 'none', cursor: 'pointer', width: '100%' }}>Make Payment</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', marginBottom: '1.5rem' }}>Graded Results</h2>
                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  {assignments.map(a => (
                    <div key={a.id} style={{ padding: '1.5rem', borderBottom: '1px solid #E5E7EB' }}>
                      <p style={{ fontWeight: '700', color: '#111827', fontSize: '1.1rem' }}>Week {a.lessons?.week}: {a.lessons?.title}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <span style={{ background: '#ECFDF5', color: '#047857', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #10B981' }}>Mark: {a.mark || 'Pending'}</span>
                      </div>
                      <p style={{ color: '#6B7280', fontStyle: 'italic', marginTop: '0.5rem', fontSize: '0.95rem' }}>"{a.teacher_comment}"</p>
                    </div>
                  ))}
                  {assignments.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>No grades posted yet.</p>}
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', marginBottom: '1.5rem' }}>Chat with Tutor</h2>
                <div style={{ flex: 1, background: 'white', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.map(m => (
                    <div key={m.id} style={{ alignSelf: m.sender_role === 'parent' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.2rem', textAlign: m.sender_role === 'parent' ? 'right' : 'left' }}>{m.sender_name}</p>
                      <div style={{ background: m.sender_role === 'parent' ? '#1E3A8A' : '#F3F4F6', color: m.sender_role === 'parent' ? 'white' : '#111827', padding: '0.8rem 1rem', borderRadius: '12px' }}>
                        <p>{m.text_content}</p>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && <p style={{ textAlign: 'center', color: '#6B7280', marginTop: '2rem' }}>No messages yet. Say hello to your child's tutor!</p>}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #E5E7EB', outline: 'none' }} />
                  <button type="submit" style={{ background: '#1E3A8A', color: 'white', padding: '0 2rem', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Send</button>
                </form>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* MOBILE RESPONSIVE CSS */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-header-parent { display: flex !important; }
          .sidebar-parent { 
            display: none !important; 
            position: absolute; 
            top: 64px; 
            left: 0; 
            right: 0; 
            width: 100%; 
            z-index: 50;
            height: calc(100vh - 64px);
          }
          .sidebar-parent.open { display: flex !important; }
          .desktop-logo-parent { display: none !important; }
          main { padding: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
