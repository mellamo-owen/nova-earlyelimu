'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function TutorDashboard() {
  const router = useRouter();
  const [tutor, setTutor] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      
      // Fetch tutor and students in parallel
      const [tutorRes, studentRes] = await Promise.all([
        supabase.from('tutors').select('*').eq('id', user.id).single(),
        supabase.from('students').select('*, parents(name)').eq('tutor_id', user.id).order('created_at', { ascending: false })
      ]);

      if (tutorRes.data) setTutor(tutorRes.data);
      if (studentRes.data) setStudents(studentRes.data);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', padding: '2rem', borderRadius: '20px', marginBottom: '2rem' }}>
        {loading ? (
          <div style={{ height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
        ) : (
          <>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Hello {tutor?.name.split(' ')[0]}!</h1>
            <p style={{ color: '#E2E8F0' }}>You have {students.length} students assigned to you.</p>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '20px', border: '1px solid #334155' }}>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>My Students</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3B82F6' }}>{loading ? '-' : students.length}</h2>
        </div>
      </div>

      <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '20px', border: '1px solid #334155' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>My Assigned Students</h2>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1,2,3].map(i => <div key={i} style={{ height: '60px', background: '#0F172A', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>)}
          </div>
        ) : students.length === 0 ? (
          <p style={{ color: '#94A3B8' }}>No students assigned yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {students.map(student => (
              <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0F172A', padding: '1rem', borderRadius: '12px', border: '1px solid #334155', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '45px', height: '45px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold' }}>{student.name}</p>
                    <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{student.student_id_code}</p>
                  </div>
                </div>
                <span style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: student.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: student.status === 'APPROVED' ? '#10B981' : '#F59E0B' }}>
                  {student.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
    </div>
  );
}

