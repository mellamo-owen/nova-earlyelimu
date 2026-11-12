'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function TutorGroupChat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [tutorName, setTutorName] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    getTutor();

    const subscription = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        // Prevent duplicate messages if we already added it optimistically
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

  const getTutor = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('tutors').select('name').eq('id', user.id).single();
      if (data) setTutorName(data.name);
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
    const newMsg = { id: tempId, sender_name: tutorName, sender_role: 'tutor', text_content: text, created_at: new Date().toISOString() };
    
    // 1. Instantly add to UI (Optimistic)
    setMessages(prev => [...prev, newMsg]);
    setText('');
    
    // 2. Send to Database
    await supabase.from('messages').insert([{ sender_name: tutorName, sender_role: 'tutor', text_content: text }]);
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
          await supabase.from('messages').insert([{ sender_name: tutorName, sender_role: 'tutor', audio_url: urlData.publicUrl }]);
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
    <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '12px 12px 0 0', borderBottom: '1px solid #334155' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>Class Group Chat</h1>
      </div>

      <div style={{ flex: 1, background: '#0F172A', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
            <p style={{ color: '#94A3B8', fontWeight: 'bold' }}>No messages yet.</p>
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

      <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '0 0 12px 12px', borderTop: '1px solid #334155', paddingBottom: '2rem' }}>
        <form onSubmit={sendText} style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0F172A', color: 'white' }} />
          
          {!isRecording ? (
            <button type="button" onClick={startRecording} style={{ background: '#334155', color: 'white', padding: '0 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🎤 Voice Note
            </button>
          ) : (
            <button type="button" onClick={stopRecording} style={{ background: '#EF4444', color: 'white', padding: '0 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'pulse 1s infinite' }}>
              🛑 Stop ({recordTime}s)
            </button>
          )}
          
          <button type="submit" style={{ background: '#3B82F6', color: 'white', padding: '0 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>
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

