'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111827', color: '#F3F4F6', fontFamily: 'sans-serif' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '260px', background: '#1F2937', padding: '1.5rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid #374151' }}>
        
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <div style={{ width: '35px', height: '35px', background: '#10B981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>N</div>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Nova Admin</span>
        </div>

        {/* NAVIGATION */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.name} href={item.path} style={{
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
          <p style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem' }}>{user?.email || 'Admin'}</p>
          <button onClick={handleLogout} style={{ width: '100%', background: '#EF4444', color: 'white', padding: '0.6rem', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Logout</button>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>

    </div>
  );
}
