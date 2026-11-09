'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [score, setScore] = useState(3);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    checkAdmin();
    fetchStudents();
    fetchPayments();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: profile } = await supabase.from('parents').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') { router.push('/login'); } else { setLoading(false); }
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*, parents (name, email, whatsapp)').order('created_at', { ascending: false });
    if (data) setStudents(data);
  };

  const fetchPayments = async () => {
    const { data } = await supabase.from('payments').select('*, students(name, student_id_code)').order('created_at', { ascending: false });
    if (data) setPayments(data);
  };

  const approveStudent = async (id) => {
    const nextIdNum = students.length + 1;
    const studentCode = 'NEE-' + String(nextIdNum).padStart(3, '0');
    await supabase.from('students').update({ status: 'WEEK1_FREE', student_id_code: studentCode }).eq('id', id);
    fetchStudents();
  };

  const approvePayment = async (paymentId, studentId) => {
    await supabase.from('payments').update({ status: 'APPROVED' }).eq('id', paymentId);
    await supabase.from('students').update({ status: 'APPROVED', payment_status: 'APPROVED' }).eq('id', studentId);
    alert('Payment approved! Student is now unlocked for Weeks 2-8.');
    fetchPayments();
    fetchStudents();
  };

  const submitCallFeedback = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    await supabase.from('calls').insert([{ student_id: selectedStudent.id, understanding_score: score, feedback: feedback }]);
    alert('Feedback saved successfully!');
    setSelectedStudent(null);
    setFeedback('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div style={{ padding: '2rem', color: '#000000', background: '#F9FAFB', minHeight: '100vh' }}>Loading Admin Data...</div>;

  return (
    <main style={{ minHeight: '100vh', background: '#F9FAFB', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: '#000000', fontSize: '2rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('students')} style={{ background: activeTab === 'students' ? '#1E3A8A' : 'transparent', color: activeTab === 'students' ? 'white' : '#000000', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: '1px solid #1E3A8A', cursor: 'pointer' }}>Students</button>
              <button onClick={() => setActiveTab('payments')} style={{ background: activeTab === 'payments' ? '#1E3A8A' : 'transparent', color: activeTab === 'payments' ? 'white' : '#000000', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: '1px solid #1E3A8A', cursor: 'pointer' }}>Payments</button>
              <button onClick={() => setActiveTab('calls')} style={{ background: activeTab === 'calls' ? '#1E3A8A' : 'transparent', color: activeTab === 'calls' ? 'white' : '#000000', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: '1px solid #1E3A8A', cursor: 'pointer' }}>1-on-1 Calls</button>
              <Link href="/admin/lessons" style={{ background: '#10B981', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: '1px solid #10B981', cursor: 'pointer', textDecoration: 'none' }}>Lessons</Link>
              <Link href="/admin/grading" style={{ background: '#1E3A8A', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: '1px solid #1E3A8A', cursor: 'pointer', textDecoration: 'none' }}>Grading</Link>
              <Link href="/admin/announcements" style={{ background: '#1E3A8A', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: '1px solid #1E3A8A', cursor: 'pointer', textDecoration: 'none' }}>Announcements</Link>
              <Link href="/admin/project" style={{ background: '#1E3A8A', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: '1px solid #1E3A8A', cursor: 'pointer', textDecoration: 'none' }}>Project Manager</Link>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: '#000000', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', height: 'fit-content' }}>Logout</button>
        </div>

        {activeTab === 'students' && (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#F9FAFB', color: '#6B7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Student</th>
                  <th style={{ padding: '1rem' }}>Parent</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 'bold', color: '#000000' }}>{student.name} (Age {student.age})</p>
                      <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>ID: {student.student_id_code || 'Not Assigned'}</p>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ color: '#000000' }}>{student.parents?.name}</p>
                      <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{student.parents?.whatsapp}</p>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: student.status === 'PENDING' ? '#FEF3C7' : '#D1FAE5', color: student.status === 'PENDING' ? '#D97706' : '#065F46' }}>
                        {student.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {student.status === 'PENDING' ? (
                        <button onClick={() => approveStudent(student.id)} style={{ background: '#10B981', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Approve</button>
                      ) : (
                        <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#F9FAFB', color: '#6B7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Student</th>
                  <th style={{ padding: '1rem' }}>M-Pesa Code</th>
                  <th style={{ padding: '1rem' }}>SMS Details</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 'bold', color: '#000000' }}>{payment.students?.name}</p>
                      <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{payment.students?.student_id_code}</p>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#000000' }}>{payment.student_id_entered}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#6B7280', maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
                      {payment.receipt_url || 'No SMS pasted'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: payment.status === 'PENDING' ? '#FEF3C7' : '#D1FAE5', color: payment.status === 'PENDING' ? '#D97706' : '#065F46' }}>
                        {payment.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {payment.status === 'PENDING' ? (
                        <button onClick={() => approvePayment(payment.id, payment.student_id)} style={{ background: '#10B981', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Approve</button>
                      ) : (
                        <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'calls' && (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: '#000000', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Call Queue</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {students.filter(s => s.status !== 'PENDING' && s.status !== 'WAITLIST').map(student => (
                  <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#000000' }}>{student.name}</p>
                      <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{student.student_id_code}</p>
                    </div>
                    <button onClick={() => setSelectedStudent(student)} style={{ background: '#10B981', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Start Call</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: '#000000', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Call Feedback</h2>
              {selectedStudent ? (
                <form onSubmit={submitCallFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Writing feedback for: <strong>{selectedStudent.name}</strong></p>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#000000' }}>Understanding Score (1-5)</label>
                    <input type="number" min="1" max="5" value={score} onChange={(e) => setScore(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#000000' }}>Feedback Notes</label>
                    <textarea rows="4" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What did the student understand?" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }}></textarea>
                  </div>
                  <button type="submit" style={{ background: '#1E3A8A', color: 'white', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Save Feedback</button>
                </form>
              ) : (
                <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Click "Start Call" on a student to write feedback after the session.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
