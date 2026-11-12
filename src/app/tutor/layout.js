'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function TutorLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tutor, setTutor] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      setPasswordMessage('Password updated!');
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
    { name: 'Schedule Class', path: '/tutor/schedule' },
    { name: 'Class Group Chat', path: '/tutor/group' },
    { name: 'Parent Messages', path: '/tutor/parent-chat' },
    { name: 'Assignments & Grading', path: '/tutor/grading' },
    { name: '1-on-1 Calls', path: '/tutor/calls' },
    { name: 'Group Projects', path: '/tutor/projects' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111827', color: '#F8FAFC', fontFamily: 'sans-serif', flexDirection: 'column' }}>
      
      <div style={{ display: 'none', background: '#1F2937', padding: '1rem', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151' }} className="mobile-header-tutor">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '30px', height: '30px', background: '#1E3A8A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>S</div>
          <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Smart Tutor</span>
        </div>
        
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.8rem', cursor: 'pointer', lineHeight: 1 }}>
          &#9776;
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        
        <aside className={`sidebar-tutor ${isMobileMenuOpen ? 'open' : ''}`} style={{ width: '260px', background: '#1F2937', padding: '1.5rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid #374151', flexShrink: 0 }}>
          
          <div className="desktop-logo-tutor" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            <div style={{ width: '35px', height: '35px', background: '#1E3A8A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>S</div>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Smart Tutor</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.name} href={item.path} onClick={() => setIsMobileMenuOpen(false)} style={{ 
                  display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', 
                  background: isActive ? '#1E3A8A' : 'transparent', 
                  borderRadius: '8px', color: isActive ? 'white' : '#9CA3AF', 
                  textDecoration: 'none', fontWeight: isActive ? 'bold' : 'normal', transition: 'all 0.2s'
                }}>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div style={{ borderTop: '1px solid #374151', paddingTop: '1rem', marginTop: 'auto' }}>
            <button onClick={() => setShowPasswordForm(!showPasswordForm)} style={{ width: '100%', background: 'transparent', border: '1px solid #374151', color: '#3B82F6', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '0.5rem' }}>Change Password</button>
            <button onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: 'none', color: '#EF4444', padding: '0.75rem', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' }}>Log Out</button>
          </div>
        </aside>

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', width: '100%' }}>
          {showPasswordForm && (
            <div style={{ background: '#1F2937', padding: '1.5rem', borderRadius: '16px', border: '1px solid #374151', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#3B82F6' }}>Update Your Password</h2>
              {passwordMessage && <p style={{ marginBottom: '1rem', color: passwordMessage.includes('Error') ? '#EF4444' : '#10B981' }}>{passwordMessage}</p>}
              <form onSubmit={handleChangePassword} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input type="password" placeholder="New Password" required minLength="6" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ flex: 1, minWidth: '200px', padding: '0.8rem', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: 'white' }} />
                <button type="submit" style={{ background: '#3B82F6', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Update</button>
              </form>
            </div>
          )}
          {children}
        </main>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-header-tutor { display: flex !important; }
          .sidebar-tutor { display: none !important; position: absolute; top: 60px; left: 0; right: 0; width: 100%; z-index: 50; height: calc(100vh - 60px); }
          .sidebar-tutor.open { display: flex !important; }
          .desktop-logo-tutor { display: none !important; }
          main { padding: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
