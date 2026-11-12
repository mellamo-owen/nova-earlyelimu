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

  const navItems = [
    { name: 'Dashboard', path: '/student' },
    { name: 'Class Chat', path: '/student/group' },
    { name: 'Assignments', path: '/student/assignments' },
    { name: 'My ID Card', path: '/student/id-card' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111827', fontFamily: 'Inter, sans-serif', flexDirection: 'column' }}>
      
      <div className="mobile-header-student" style={{ display: 'none', background: '#1F2937', padding: '1rem', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', background: '#1E3A8A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>N</div>
          <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'white' }}>Nova</span>
        </div>
        
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.8rem', cursor: 'pointer', lineHeight: 1 }}>
          &#9776;
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        
        <aside className={`sidebar-student ${isMobileMenuOpen ? 'open' : ''}`} style={{ width: '260px', background: '#1F2937', color: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid #374151', flexShrink: 0 }}>
          <div className="desktop-logo-student" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            <div style={{ width: '40px', height: '40px', background: '#1E3A8A', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '1.2rem' }}>N</div>
            <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>Nova Student</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.name} href={item.path} onClick={() => setIsMobileMenuOpen(false)} style={{ 
                  display: 'flex', alignItems: 'center', padding: '0.8rem 1rem', 
                  background: isActive ? '#1E3A8A' : 'transparent', 
                  borderRadius: '10px', color: isActive ? 'white' : '#9CA3AF', 
                  textDecoration: 'none', fontWeight: isActive ? '600' : '500', transition: 'all 0.2s'
                }}>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div style={{ borderTop: '1px solid #374151', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', background: '#374151', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                {student?.name?.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'white' }}>{student?.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{student?.student_id_code}</p>
              </div>
            </div>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '0.75rem', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>Log Out</button>
          </div>
        </aside>

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', width: '100%' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-header-student { display: flex !important; }
          .sidebar-student { display: none !important; position: absolute; top: 64px; left: 0; right: 0; width: 100%; z-index: 50; height: calc(100vh - 64px); }
          .sidebar-student.open { display: flex !important; }
          .desktop-logo-student { display: none !important; }
          main { padding: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
