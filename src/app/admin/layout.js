'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Students', path: '/admin/students' },
    { name: 'Payments', path: '/admin/payments' },
    { name: 'Lessons', path: '/admin/lessons' },
    { name: 'Grading', path: '/admin/grading' },
    { name: 'Calls', path: '/admin/calls' },
    { name: 'Announcements', path: '/admin/announcements' },
    { name: 'Project', path: '/admin/project' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111827', color: '#F3F4F6', fontFamily: 'sans-serif', flexDirection: 'column' }}>
      
      {/* MOBILE HEADER */}
      <div className="mobile-header" style={{ display: 'none', background: '#1F2937', padding: '1rem', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '30px', height: '30px', background: '#10B981', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>N</div>
          <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Nova Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>
          ☰
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        
        {/* SIDEBAR */}
        <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{ width: '260px', background: '#1F2937', padding: '1.5rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid #374151', flexShrink: 0 }}>
          
          {/* LOGO (Desktop) */}
          <div className="desktop-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{ width: '35px', height: '35px', background: '#10B981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>N</div>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Nova Admin</span>
          </div>

          {/* NAVIGATION */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.name} href={item.path} onClick={() => setIsMobileMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '8px',
                  background: isActive ? '#10B981' : 'transparent',
                  color: isActive ? '#000000' : '#9CA3AF',
                  fontWeight: isActive ? 'bold' : 'normal',
                  textDecoration: 'none', transition: 'all 0.2s'
                }}>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* USER PROFILE */}
          <div style={{ borderTop: '1px solid #374151', paddingTop: '1rem', marginTop: 'auto' }}>
            <p style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>Logged in as</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem', wordBreak: 'break-all' }}>{user?.email || 'Admin'}</p>
            <button onClick={handleLogout} style={{ width: '100%', background: '#EF4444', color: 'white', padding: '0.6rem', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Logout</button>
          </div>

        </aside>

        {/* MAIN CONTENT AREA */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', width: '100%' }}>
          {children}
        </main>

      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
          .sidebar { 
            display: none !important; 
            position: absolute; 
            top: 60px; 
            left: 0; 
            right: 0; 
            width: 100%; 
            z-index: 50;
            height: calc(100vh - 60px);
          }
          .sidebar.open { display: flex !important; }
          .desktop-logo { display: none !important; }
          main { padding: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
