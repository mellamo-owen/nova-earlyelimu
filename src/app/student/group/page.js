'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function StudentGroupChat() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [studentName, setStudentName] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    getStudent();

    const subscription = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      }).subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    
    const tempId = Date.now().toString();
    const newMsg = { id: tempId, sender_name: studentName, sender_role: 'student', text_content: text, created_at: new Date().toISOString() };
    
    setMessages(prev => [...prev, newMsg]);
    setText('');
    
    await supabase.from('messages').insert([{ sender_name: studentName, sender_role: 'student', text_content: text }]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const fileExt = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const fileName = `voice-${Date.now()}.${fileExt}`;
        
        const { error } = await supabase.storage.from('chat-audio').upload(fileName, audioBlob);
        
        if (!error) {
          const { data: urlData } = supabase.storage.from('chat-audio').getPublicUrl(fileName);
          await supabase.from('messages').insert([{ sender_name: studentName, sender_role: 'student', audio_url: urlData.publicUrl }]);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      alert('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '12px 12px 0 0', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>Class Group Chat</h1>
        </div>
        <button onClick={() => router.push('/student')} style={{ background: '#334155', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Back</button>
      </div>

      <div style={{ flex: 1, background: '#F9FAFB', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6B7280', marginTop: '2rem' }}>
            <p>No messages yet. Say hello to your class!</p>
          </div>
        )}
        
        {messages.map(msg => (
          <div key={msg.id} style={{ alignSelf: msg.sender_role === 'student' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.2rem', textAlign: msg.sender_role === 'student' ? 'right' : 'left' }}>
              {msg.sender_name} {msg.sender_role === 'tutor' && '(Teacher)'} • {formatTime(msg.created_at)}
            </p>
            <div style={{ 
              background: msg.sender_role === 'student' ? '#10B981' : '#E5E7EB', 
              padding: '0.8rem', borderRadius: '12px', color: msg.sender_role === 'student' ? 'white' : 'black',
              borderBottomRightRadius: msg.sender_role === 'student' ? '0' : '12px',
              borderBottomLeftRadius: msg.sender_role !== 'student' ? '0' : '12px',
            }}>
              {msg.text_content && <p style={{ fontSize: '0.95rem' }}>{msg.text_content}</p>}
              {msg.audio_url && <audio controls src={msg.audio_url} style={{ width: '220px', height: '40px', marginTop: '0.5rem' }} />}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ background: '#E5E7EB', padding: '1rem', borderRadius: '0 0 12px 12px', borderTop: '1px solid #D1D5DB', paddingBottom: '2rem' }}>
        <form onSubmit={sendText} style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white', color: 'black' }} />
          
          {!isRecording ? (
            <button type="button" onClick={startRecording} style={{ background: '#1E3A8A', color: 'white', padding: '0 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🎤 Voice Note
            </button>
          ) : (
            <button type="button" onClick={stopRecording} style={{ background: '#EF4444', color: 'white', padding: '0 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'pulse 1s infinite' }}>
              🛑 Stop ({recordTime}s)
            </button>
          )}
          
          <button type="submit" style={{ background: '#10B981', color: 'white', padding: '0 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>
        </form>
        <style>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
