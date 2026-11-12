'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function TutorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    
    const { data: tutorData } = await supabase.from('tutors').select('*').eq('id', user.id).single();
    if (tutorData) setTutor(tutorData);
    
    const { data: studentData } = await supabase.from('students').select('*, parents(name)').eq('tutor_id', user.id).order('created_at', { ascending: false });
    if (studentData) setStudents(studentData);
    
    setLoading(false);
  };

  if (loading) return <div style={{ color: '#94A3B8' }}>Loading Dashboard...</div>;

  return (
    <div>
      {/* HERO GREETING */}
      <div style={{ 
        background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', 
        padding: '2rem', borderRadius: '20px', marginBottom: '2rem',
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)'
      }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Hello {tutor?.name.split(' ')[0]}!
        </h1>
        <p style={{ color: '#E2E8F0', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
          You have {students.length} students assigned to you. Let's build something great today.
        </p>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={{ 
          background: 'linear-gradient(145deg, #1E293B, #0F172A)', 
          padding: '1.5rem', borderRadius: '20px', border: '1px solid #334155',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), inset 0 2px 4px 0 rgba(255,255,255,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontWeight: '500' }}>My Students</p>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>
              <div style={{ width: '20px', height: '20px', background: '#3B82F6', borderRadius: '50%' }}></div>
            </div>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3B82F6' }}>{students.length}</h2>
        </div>

        <div style={{ 
          background: 'linear-gradient(145deg, #1E293B, #0F172A)', 
          padding: '1.5rem', borderRadius: '20px', border: '1px solid #334155',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), inset 0 2px 4px 0 rgba(255,255,255,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontWeight: '500' }}>Classes Today</p>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>
              <div style={{ width: '20px', height: '20px', background: '#10B981', borderRadius: '50%' }}></div>
            </div>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10B981' }}>0</h2>
        </div>

        <div style={{ 
          background: 'linear-gradient(145deg, #1E293B, #0F172A)', 
          padding: '1.5rem', borderRadius: '20px', border: '1px solid #334155',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), inset 0 2px 4px 0 rgba(255,255,255,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontWeight: '500' }}>Pending Grading</p>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>
              <div style={{ width: '20px', height: '20px', background: '#F59E0B', borderRadius: '50%' }}></div>
            </div>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F59E0B' }}>0</h2>
        </div>
      </div>

      {/* STUDENT LIST CARD */}
      <div style={{ 
        background: 'linear-gradient(145deg, #1E293B, #0F172A)', 
        padding: '1.5rem', borderRadius: '20px', border: '1px solid #334155',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), inset 0 2px 4px 0 rgba(255,255,255,0.05)'
      }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>My Assigned Students</h2>
        
        {students.length === 0 ? (
          <p style={{ color: '#94A3B8', textAlign: 'center', padding: '2rem 0' }}>
            You have no students assigned yet. Admin will allocate them to you soon.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {students.map(student => (
              <div key={student.id} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                background: '#0F172A', padding: '1rem', borderRadius: '12px', 
                border: '1px solid #334155', flexWrap: 'wrap', gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '45px', height: '45px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', 
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontWeight: 'bold', fontSize: '1.2rem' 
                  }}>
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '1rem' }}>{student.name}</p>
                    <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{student.student_id_code} | Age: {student.age}</p>
                  </div>
                </div>
                
                <span style={{ 
                  padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', 
                  background: student.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
                  color: student.status === 'APPROVED' ? '#10B981' : '#F59E0B' 
                }}>
                  {student.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
