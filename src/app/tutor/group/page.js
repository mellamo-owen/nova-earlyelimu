'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function TutorGroupChat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    getTutor();

    const subscription = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => [...prev, payload.new]);
      }).subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getTutor = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('tutors').select('name').eq('id', user.id).single();
      if (data) setTutorName(data.name);
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const sendText = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newMsg = { sender_name: tutorName, sender_role: 'tutor', text_content: text };
    setText('');
    await supabase.from('messages').insert([newMsg]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const fileName = `voice-${Date.now()}.webm`;
        const { error } = await supabase.storage.from('chat-audio').upload(fileName, audioBlob);
        
        if (!error) {
          const { data: urlData } = supabase.storage.from('chat-audio').getPublicUrl(fileName);
          await supabase.from('messages').insert([{ sender_name: tutorName, sender_role: 'tutor', audio_url: urlData.publicUrl }]);
        }
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied. Please check your browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div style={{ color: '#94A3B8', padding: '2rem' }}>Loading chat...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '12px 12px 0 0', borderBottom: '1px solid #334155' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Class Group Chat</h1>
        <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Discuss assignments and send voice notes to your students.</p>
      </div>

      <div style={{ flex: 1, background: '#0F172A', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* HUMAN TOUCH: EMPTY STATE */}
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
            <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>💬</div>
            <p style={{ color: '#94A3B8', fontWeight: 'bold' }}>No messages yet.</p>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Say hello to your students to start the conversation!</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} style={{ alignSelf: msg.sender_role === 'tutor' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.2rem', textAlign: msg.sender_role === 'tutor' ? 'right' : 'left' }}>
              {msg.sender_name} {msg.sender_role === 'tutor' && '(Teacher)'} • {formatTime(msg.created_at)}
            </p>
            <div style={{ 
              background: msg.sender_role === 'tutor' ? '#3B82F6' : '#1E293B', 
              padding: '0.8rem', borderRadius: '12px', color: 'white',
              borderBottomRightRadius: msg.sender_role === 'tutor' ? '0' : '12px',
              borderBottomLeftRadius: msg.sender_role !== 'tutor' ? '0' : '12px',
            }}>
              {msg.text_content && <p style={{ fontSize: '0.95rem' }}>{msg.text_content}</p>}
              {msg.audio_url && <audio controls src={msg.audio_url} style={{ width: '220px', height: '40px', marginTop: '0.5rem' }} />}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '0 0 12px 12px', borderTop: '1px solid #334155' }}>
        <form onSubmit={sendText} style={{ display: 'flex', gap: '0.5rem', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <input 
            type="text" 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="Type a message..." 
            style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0F172A', color: 'white' }} 
          />
          <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} style={{ background: isRecording ? '#EF4444' : '#334155', color: 'white', padding: '0 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isRecording ? 'Recording...' : '🎤 Hold'}
          </button>
          <button type="submit" style={{ background: '#3B82F6', color: 'white', padding: '0 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>
        </form>
      </div>

    </div>
  );
}
