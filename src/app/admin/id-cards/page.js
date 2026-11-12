'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminIdCards() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    // Only fetch students who are not pending (they need an ID code first)
    const { data } = await supabase.from('students').select('*').neq('status', 'PENDING').order('student_id_code', { ascending: true });
    if (data) setStudents(data);
    setLoading(false);
  };

  if (loading) return <div style={{ color: '#9CA3AF' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Student ID Cards</h1>
        <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Official ID cards for approved students. These are visible on their dashboards.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {students.map((student) => (
          <div key={student.id} style={{ 
            background: 'linear-gradient(135deg, #1E3A8A 0%, #000000 100%)', 
            borderRadius: '16px', 
            padding: '1.5rem', 
            color: 'white',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Design Element */}
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(16,185,129,0.2)', borderRadius: '50%' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '30px', height: '30px', background: '#10B981', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>N</div>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Nova earlyElimu</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 'bold', letterSpacing: '1px' }}>STUDENT</span>
            </div>

            <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Name</p>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', textTransform: 'capitalize' }}>{student.name}</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Student ID</p>
                <p style={{ fontWeight: 'bold', color: '#10B981' }}>{student.student_id_code || 'Pending'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Age</p>
                <p style={{ fontWeight: 'bold' }}>{student.age} Years</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Course</p>
                <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Fullstack Development</p>
              </div>
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <p style={{ color: '#9CA3AF' }}>No approved students found.</p>
        )}
      </div>
    </div>
  );
}

