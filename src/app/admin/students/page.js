'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    fetchStudents(); 
    fetchTutors();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*, parents (name, email, whatsapp)').order('created_at', { ascending: false });
    if (data) setStudents(data);
    setLoading(false);
  };

  const fetchTutors = async () => {
    const { data } = await supabase.from('tutors').select('*');
    if (data) setTutors(data);
  };

  const approveStudent = async (id) => {
    const approvedCount = students.filter(s => s.status !== 'PENDING' && s.student_id_code).length;
    const studentCode = 'NEE-' + String(approvedCount + 1).padStart(3, '0');
    await supabase.from('students').update({ status: 'WEEK1_FREE', student_id_code: studentCode }).eq('id', id);
    fetchStudents();
  };

  const assignTutor = async (studentId, tutorId) => {
    await supabase.from('students').update({ tutor_id: tutorId || null }).eq('id', studentId);
    fetchStudents();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '2rem' }}>Students</h1>
      <div style={{ background: '#1F2937', borderRadius: '12px', overflowX: 'auto', border: '1px solid #374151' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead style={{ background: '#111827', color: '#9CA3AF', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Student</th>
              <th style={{ padding: '1rem' }}>Parent</th>
              <th style={{ padding: '1rem' }}>Assign Tutor</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '1rem' }}>
                  <p style={{ fontWeight: 'bold' }}>{student.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>ID: {student.student_id_code || 'Not Assigned'}</p>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{student.parents?.email}</td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    value={student.tutor_id || ''} 
                    onChange={(e) => assignTutor(student.id, e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', background: '#111827', color: 'white', border: '1px solid #374151' }}
                  >
                    <option value="">-- Unassigned --</option>
                    {tutors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: student.status === 'PENDING' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', color: student.status === 'PENDING' ? '#F59E0B' : '#10B981' }}>
                    {student.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {student.status === 'PENDING' && (
                    <button onClick={() => approveStudent(student.id)} style={{ background: '#10B981', color: '#000', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Approve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
