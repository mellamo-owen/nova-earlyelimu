'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function TutorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState(null);
  const [students, setStudents] = useState([]);
  
  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('Updating...');
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      setPasswordMessage('Error: ' + error.message);
    } else {
      setPasswordMessage('Password updated successfully!');
      setNewPassword('');
      setTimeout(() => setShowPasswordForm(false), 2000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div style={{ background: '#0F172A', color: 'white', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading Dashboard...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A', color: '#F8FAFC', fontFamily: 'sans-serif' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '250px', background: '#1E293B', padding: '1.5rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <div style={{ width: '35px', height: '35px', background: '#3B82F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>S</div>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Smart Tutor</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', background: '#334155', borderRadius: '8px', color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', color: '#94A3B8', textDecoration: 'none' }}>My Students</a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', color: '#94A3B8', textDecoration: 'none' }}>Lessons</a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', color: '#94A3B8', textDecoration: 'none' }}>Schedule</a>
        </nav>

        <button onClick={() => setShowPasswordForm(!showPasswordForm)} style={{ background: 'transparent', border: '1px solid #334155', color: '#3B82F6', textAlign: 'center', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
          Change Password
        </button>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#EF4444', textAlign: 'left', padding: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Log Out</button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {/* CHANGE PASSWORD MODAL/FORM */}
        {showPasswordForm && (
          <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#3B82F6' }}>Update Your Password</h2>
            {passwordMessage && <p style={{ marginBottom: '1rem', color: passwordMessage.includes('Error') ? '#EF4444' : '#10B981' }}>{passwordMessage}</p>}
            <form onSubmit={handleChangePassword} style={{ display: 'flex', gap: '1rem' }}>
              <input type="password" placeholder="New Password" required minLength="6" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0F172A', color: 'white' }} />
              <button type="submit" style={{ background: '#3B82F6', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Update Password</button>
            </form>
          </div>
        )}

        {/* TOP HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ background: '#1E293B', padding: '0.5rem 1rem', borderRadius: '8px', width: '300px', color: '#94A3B8' }}>Search...</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1E293B', padding: '0.5rem 1rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{tutor?.name}</span>
          </div>
        </div>

        {/* HERO GREETING */}
        <div style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Hello {tutor?.name.split(' ')[0]}!</h1>
          <p style={{ color: '#E2E8F0' }}>You have {students.length} students assigned to you. Let's build something great today.</p>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>My Students</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3B82F6' }}>{students.length}</h2>
          </div>
          <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Classes Today</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>0</h2>
          </div>
        </div>

        {/* ASSIGNED STUDENTS LIST */}
        <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>My Assigned Students</h2>
          
          {students.length === 0 ? (
            <p style={{ color: '#94A3B8' }}>You have no students assigned yet. Admin will allocate them to you soon.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {students.map(student => (
                <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0F172A', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: '#3B82F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{student.name.charAt(0)}</div>
                    <div>
                      <p style={{ fontWeight: 'bold' }}>{student.name}</p>
                      <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{student.student_id_code} | Age: {student.age}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', background: student.status === 'APPROVED' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: student.status === 'APPROVED' ? '#10B981' : '#F59E0B' }}>
                      {student.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
