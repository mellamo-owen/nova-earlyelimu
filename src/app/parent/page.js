'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function ParentChat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [parentId, setParentId] = useState(null);
  const [tutorId, setTutorId] = useState(null);
  const [tutorName, setTutorName] = useState('Teacher');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setParentId(user.id);

      // Find the child's assigned tutor
      const { data: student } = await supabase.from('students').select('tutor_id').eq('parent_id', user.id).single();
      
      if (student && student.tutor_id) {
        setTutorId(student.tutor_id);
        
        // Get the tutor's name
        const { data: tutorData } = await supabase.from('tutors').select('name').eq('id', student.tutor_id).single();
        if (tutorData) setTutorName(tutorData.name);

        // Fetch only private messages between this parent and this tutor
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .or(`and(parent_id.eq.${user.id},tutor_id.eq.${student.tutor_id}),and(sender_role.eq.tutor,parent_id.eq.${user.id})`)
          .order('created_at', { ascending: true });
          
        if (msgs) setMessages(msgs);

        // Listen for new messages
        const subscription = supabase.channel('private-parent-chat')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
            if (payload.new.parent_id === user.id && payload.new.tutor_id === student.tutor_id) {
              setMessages(prev => [...prev, payload.new]);
            }
          }).subscribe();

        return () => supabase.removeChannel(subscription);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !tutorId) return;

    const newMsg = {
      sender_name: 'Parent',
      sender_role: 'parent',
      text_content: text,
      parent_id: parentId,
      tutor_id: tutorId
    };

    setMessages(prev => [...prev, newMsg]);
    setText('');
    
    await supabase.from('messages').insert([newMsg]);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '12px 12px 0 0', borderBottom: '1px solid #334155' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>Chat with {tutorName}</h1>
        <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>This is a private chat. Only you and the teacher can see this.</p>
      </div>

      <div style={{ flex: 1, background: '#F9FAFB', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ alignSelf: msg.sender_role === 'parent' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.2rem', textAlign: msg.sender_role === 'parent' ? 'right' : 'left' }}>
              {msg.sender_name}
            </p>
            <div style={{ background: msg.sender_role === 'parent' ? '#1E3A8A' : '#E5E7EB', padding: '0.8rem', borderRadius: '12px', color: msg.sender_role === 'parent' ? 'white' : 'black' }}>
              <p style={{ fontSize: '0.95rem' }}>{msg.text_content}</p>
            </div>
          </div>
        ))}
        {messages.length === 0 && <p style={{ textAlign: 'center', color: '#6B7280', marginTop: '2rem' }}>No messages yet. Say hello to your teacher!</p>}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ background: '#E5E7EB', padding: '1rem', borderRadius: '0 0 12px 12px', borderTop: '1px solid #D1D5DB' }}>
        {!tutorId ? (
          <p style={{ color: '#EF4444', textAlign: 'center', fontWeight: 'bold' }}>No tutor assigned to your child yet.</p>
        ) : (
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Type a message to the teacher..." style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white', color: 'black' }} />
            <button type="submit" style={{ background: '#1E3A8A', color: 'white', padding: '0 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>
          </form>
        )}
      </div>
    </div>
  );
}
