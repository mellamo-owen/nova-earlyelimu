'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function TutorLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tutor, setTutor] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data } = await supabase.from('tutors').select('*').eq('id', user.id).single();
      if (data) setTutor(data);
    };
    getUser();
  }, [router]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('Updating...');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPasswordMessage('Error: ' + error.message);
    else {
      setPasswordMessage('Password updated successfully!');
      setNewPassword('');
      setTimeout(() => { setShowPasswordForm(false); setPasswordMessage(''); }, 2000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/tutor' },
    { name: 'Lessons', path: '/tutor/lessons' },
    { name: 'Grading', path: '/tutor/grading' },
    { name: 'Calls', path: '/tutor/calls' },
    { name: 'Projects', path: '/tutor/projects' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A', color: '#F8FAFC', fontFamily: 'sans-serif' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '250px', background: '#1E293B', padding: '1.5rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <div style={{ width: '35px', height: '35px', background: '#3B82F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>S</div>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Smart Tutor</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.name} href={item.path} style={{ 
                display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', 
                background: isActive ? '#334155' : 'transparent', 
                borderRadius: '8px', color: isActive ? 'white' : '#94A3B8', 
                textDecoration: 'none', fontWeight: isActive ? 'bold' : 'normal' 
              }}>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button onClick={() => setShowPasswordForm(!showPasswordForm)} style={{ background: 'transparent', border: '1px solid #334155', color: '#3B82F6', textAlign: 'center', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
          Change Password
        </button>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#EF4444', textAlign: 'left', padding: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Log Out</button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {showPasswordForm && (
          <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#3B82F6' }}>Update Your Password</h2>
            {passwordMessage && <p style={{ marginBottom: '1rem', color: passwordMessage.includes('Error') ? '#EF4444' : '#10B981' }}>{passwordMessage}</p>}
            <form onSubmit={handleChangePassword} style={{ display: 'flex', gap: '1rem' }}>
              <input type="password" placeholder="New Password" required minLength="6" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0F172A', color: 'white' }} />
              <button type="submit" style={{ background: '#3B82F6', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Update Password</button>
            </form>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
