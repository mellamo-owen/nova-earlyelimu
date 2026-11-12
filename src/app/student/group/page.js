'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function StudentGroupChat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    fetchMessages();
    getStudent();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStudent = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('students').select('name').eq('auth_user_id', user.id).single();
      if (data) setStudentName(data.name);
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const sendText = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await supabase.from('messages').insert([{ sender_name: studentName, sender_role: 'student', text_content: text }]);
    setText('');
    fetchMessages();
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
          await supabase.from('messages').insert([{ sender_name: studentName, sender_role: 'student', audio_url: urlData.publicUrl }]);
          fetchMessages();
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '12px 12px 0 0', borderBottom: '1px solid #334155' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Class Group Chat</h1>
      </div>

      <div style={{ flex: 1, background: '#F9FAFB', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ alignSelf: msg.sender_role === 'student' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.2rem', textAlign: msg.sender_role === 'student' ? 'right' : 'left' }}>{msg.sender_name}</p>
            <div style={{ background: msg.sender_role === 'student' ? '#10B981' : '#E5E7EB', padding: '0.8rem', borderRadius: '12px', color: msg.sender_role === 'student' ? 'white' : 'black' }}>
              {msg.text_content && <p style={{ fontSize: '0.9rem' }}>{msg.text_content}</p>}
              {msg.audio_url && <audio controls src={msg.audio_url} style={{ width: '200px', height: '40px' }} />}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#E5E7EB', padding: '1rem', borderRadius: '0 0 12px 12px', borderTop: '1px solid #D1D5DB' }}>
        <form onSubmit={sendText} style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white', color: 'black' }} />
          
          <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} style={{ background: isRecording ? '#EF4444' : '#1E3A8A', color: 'white', padding: '0 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            {isRecording ? 'Recording...' : '🎤 Hold'}
          </button>
          
          <button type="submit" style={{ background: '#10B981', color: 'white', padding: '0 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>
        </form>
      </div>
    </div>
  );
}
