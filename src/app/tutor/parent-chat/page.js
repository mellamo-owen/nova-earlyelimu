'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function TutorParentChat() {
  const [parents, setParents] = useState([]);
  const [activeParent, setActiveParent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [tutorId, setTutorId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setTutorId(user.id);

      // Get all students assigned to this tutor, and their parents
      const { data: students } = await supabase
        .from('students')
        .select('parent_id, parents(name)')
        .eq('tutor_id', user.id);

      if (students) {
        // Filter unique parents
        const uniqueParents = Array.from(new Set(students.map(s => s.parent_id)))
          .map(id => {
            const student = students.find(s => s.parent_id === id);
            return { id, name: student.parents?.name || 'Parent' };
          });
        setParents(uniqueParents);
        if (uniqueParents.length > 0) setActiveParent(uniqueParents[0]);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!activeParent || !tutorId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('parent_id', activeParent.id)
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    
    fetchMessages();

    const subscription = supabase.channel('tutor-parent-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        if (payload.new.parent_id === activeParent.id && payload.new.tutor_id === tutorId) {
          setMessages(prev => [...prev, payload.new]);
        }
      }).subscribe();

    return () => supabase.removeChannel(subscription);
  }, [activeParent, tutorId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeParent) return;

    const newMsg = {
      sender_name: 'Tutor',
      sender_role: 'tutor',
      text_content: text,
      parent_id: activeParent.id,
      tutor_id: tutorId
    };

    setMessages(prev => [...prev, newMsg]);
    setText('');
    await supabase.from('messages').insert([newMsg]);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', background: '#1E293B', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' }}>
      
      {/* PARENT LIST SIDEBAR */}
      <div style={{ width: '250px', background: '#0F172A', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ padding: '1rem', fontWeight: 'bold', borderBottom: '1px solid #334155', color: 'white' }}>Parents</h2>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {parents.map(p => (
            <div 
              key={p.id} 
              onClick={() => setActiveParent(p)}
              style={{ padding: '1rem', cursor: 'pointer', borderBottom: '1px solid #1E293B', background: activeParent?.id === p.id ? '#3B82F6' : 'transparent', color: 'white' }}
            >
              {p.name}
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0F172A' }}>
        {activeParent ? (
          <>
            <div style={{ padding: '1rem', borderBottom: '1px solid #334155', background: '#1E293B' }}>
              <h2 style={{ fontWeight: 'bold', color: 'white' }}>Chat with {activeParent.name}</h2>
            </div>

            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ alignSelf: msg.sender_role === 'tutor' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.2rem', textAlign: msg.sender_role === 'tutor' ? 'right' : 'left' }}>{msg.sender_name}</p>
                  <div style={{ background: msg.sender_role === 'tutor' ? '#3B82F6' : '#334155', padding: '0.8rem', borderRadius: '12px', color: 'white' }}>
                    <p style={{ fontSize: '0.95rem' }}>{msg.text_content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid #334155', background: '#1E293B' }}>
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Reply to parent..." style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0F172A', color: 'white' }} />
                <button type="submit" style={{ background: '#3B82F6', color: 'white', padding: '0 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94A3B8' }}>Select a parent to chat</div>
        )}
      </div>
    </div>
  );
}
