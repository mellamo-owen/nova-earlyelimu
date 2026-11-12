'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function StudentLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [student, setStudent] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getStudent = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data } = await supabase.from('students').select('*').eq('auth_user_id', user.id).single();
      if (data) setStudent(data);
    };
    getStudent();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/student' },
    { name: 'Class Chat', path: '/student/group' }, // RENAMED
    { name: 'Assignments', path: '/student/assignments' },
    { name: 'My ID Card', path: '/student/id-card' }, // FIXED LINK
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F3F4F6', fontFamily: 'sans-serif', flexDirection: 'column' }}>
      
      {/* MOBILE HEADER */}
      <div className="mobile-header-student" style={{ display: 'none', background: '#1E293B', padding: '1rem', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '30px', height: '30px', background: '#EF4444', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>N</div>
          <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'white' }}>Nova Student</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>☰</button>
      </div>

      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        
        {/* SIDEBAR */}
        <aside className={`sidebar-student ${isMobileMenuOpen ? 'open' : ''}`} style={{ width: '250px', background: '#1E293B', color: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div className="desktop-logo-student" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{ width: '35px', height: '35px', background: '#EF4444', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>N</div>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Nova Student</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.name} href={item.path} onClick={() => setIsMobileMenuOpen(false)} style={{ 
                  display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', 
                  background: isActive ? '#EF4444' : 'transparent', 
                  borderRadius: '8px', color: isActive ? 'white' : '#94A3B8', 
                  textDecoration: 'none', fontWeight: isActive ? 'bold' : 'normal', transition: 'all 0.2s'
                }}>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem' }}>{student?.name || 'Student'}</p>
            <button onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Log Out</button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', width: '100%' }}>
          {children}
        </main>
      </div>

      {/* MOBILE RESPONSIVE CSS */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-header-student { display: flex !important; }
          .sidebar-student { 
            display: none !important; 
            position: absolute; 
            top: 60px; 
            left: 0; 
            right: 0; 
            width: 100%; 
            z-index: 50;
            height: calc(100vh - 60px);
          }
          .sidebar-student.open { display: flex !important; }
          .desktop-logo-student { display: none !important; }
          main { padding: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
