'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

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
    setProcessingId(id);
    const approvedCount = students.filter(s => s.status !== 'PENDING' && s.student_id_code).length;
    const studentCode = 'NEE-' + String(approvedCount + 1).padStart(3, '0');
    
    const { error } = await supabase.from('students').update({ status: 'WEEK1_FREE', student_id_code: studentCode }).eq('id', id);
    
    if (error) {
      if (error.message.includes('unique constraint')) {
        const randomId = 'NEE-' + Math.floor(100 + Math.random() * 900);
        await supabase.from('students').update({ status: 'WEEK1_FREE', student_id_code: randomId }).eq('id', id);
      }
    }
    await fetchStudents();
    setProcessingId(null);
  };

  const assignTutor = async (studentId, tutorId) => {
    setProcessingId(studentId);
    // If tutorId is empty string, it sets it to null (Unassigns)
    await supabase.from('students').update({ tutor_id: tutorId || null }).eq('id', studentId);
    await fetchStudents();
    setProcessingId(null);
  };

  const deregisterStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to completely deregister ${name}? This will delete their profile, their parent link, and their login access.`)) return;
    
    setProcessingId(id);
    // Delete from students table
    const { error } = await supabase.from('students').delete().eq('id', id);
    
    if (error) {
      alert('Error deregistering student: ' + error.message);
    } else {
      await fetchStudents();
    }
    setProcessingId(null);
  };

  if (loading) return <div style={{ color: '#9CA3AF' }}>Loading students...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Manage Students</h1>
        <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Approve students, assign them to tutors, or deregister them.</p>
      </div>

      <div style={{ background: '#1F2937', borderRadius: '12px', overflowX: 'auto', border: '1px solid #374151' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
          <thead style={{ background: '#111827', color: '#9CA3AF', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Student</th>
              <th style={{ padding: '1rem' }}>Parent Contact</th>
              <th style={{ padding: '1rem' }}>Assigned Tutor</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '1rem' }}>
                  <p style={{ fontWeight: 'bold' }}>{student.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{student.student_id_code || 'No ID'} | Age: {student.age}</p>
                </td>
                <td style={{ padding: '1rem' }}>
                  <p style={{ color: '#10B981', fontWeight: 'bold' }}>{student.parents?.email}</p>
                  <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{student.parents?.whatsapp}</p>
                </td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    value={student.tutor_id || ''} 
                    onChange={(e) => assignTutor(student.id, e.target.value)}
                    disabled={processingId === student.id}
                    style={{ padding: '0.5rem', borderRadius: '6px', background: '#111827', color: 'white', border: '1px solid #374151', cursor: 'pointer' }}
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
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {student.status === 'PENDING' && (
                    <button 
                      onClick={() => approveStudent(student.id)} 
                      disabled={processingId === student.id}
                      style={{ background: '#10B981', color: '#000', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', opacity: processingId === student.id ? 0.5 : 1 }}
                    >
                      {processingId === student.id ? '...' : 'Approve'}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => deregisterStudent(student.id, student.name)}
                    disabled={processingId === student.id}
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid #EF4444', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: processingId === student.id ? 0.5 : 1 }}
                  >
                    Deregister
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
