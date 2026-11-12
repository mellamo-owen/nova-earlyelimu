'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projectPart, setProjectPart] = useState(null);

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: student } = await supabase.from('students').select('*').eq('auth_user_id', user.id).single();
    
    if (student) {
      const { data: part } = await supabase.from('project_parts').select('*').eq('student_id', student.id).single();
      if (part) setProjectPart(part);
    }
    setLoading(false);
  };

  if (loading) return <div style={{ minHeight: '100vh', background: '#0A1931', color: 'white', padding: '2rem' }}>Loading Project...</div>;

  return (
    <main style={{ minHeight: '100vh', background: '#0A1931', padding: '2rem', color: 'white' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => router.push('/student')} style={{ background: 'transparent', color: '#FF6B00', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '2rem' }}>← Back to Dashboard</button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Group Project 🚀</h1>
        <p style={{ color: '#9CA3AF', marginBottom: '3rem' }}>Nova earlyElimu Kids Shop Website</p>

        {!projectPart ? (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p>No project part assigned yet. Keep learning!</p>
          </div>
        ) : (
          <div style={{ background: 'white', color: '#0A1931', padding: '2rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem' }}>Your Assignment</h2>
            <div style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Project Part</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0A1931', marginBottom: '1rem' }}>{projectPart.part_title}</p>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>GitHub Repository</h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1rem' }}>Click the link below to view the code for our class project.</p>
            <a href={projectPart.github_repo_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#0A1931', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>Open GitHub Repo</a>
          </div>
        )}
      </div>
    </main>
  );
}

