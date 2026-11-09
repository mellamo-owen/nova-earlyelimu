'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    const { data } = await supabase.from('payments').select('*, students(name, student_id_code)').order('created_at', { ascending: false });
    if (data) setPayments(data);
    setLoading(false);
  };

  const approvePayment = async (paymentId, studentId) => {
    await supabase.from('payments').update({ status: 'APPROVED' }).eq('id', paymentId);
    await supabase.from('students').update({ status: 'APPROVED', payment_status: 'APPROVED' }).eq('id', studentId);
    alert('Payment approved!');
    fetchPayments();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '2rem' }}>Payments</h1>
      <div style={{ background: '#1F2937', borderRadius: '12px', overflowX: 'auto', border: '1px solid #374151' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead style={{ background: '#111827', color: '#9CA3AF', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Student</th>
              <th style={{ padding: '1rem' }}>M-Pesa Code</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '1rem' }}>
                  <p style={{ fontWeight: 'bold' }}>{payment.students?.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{payment.students?.student_id_code}</p>
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{payment.student_id_entered}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: payment.status === 'PENDING' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', color: payment.status === 'PENDING' ? '#F59E0B' : '#10B981' }}>
                    {payment.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {payment.status === 'PENDING' ? (
                    <button onClick={() => approvePayment(payment.id, payment.student_id)} style={{ background: '#10B981', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Approve</button>
                  ) : (
                    <span style={{ color: '#9CA3AF' }}>Approved</span>
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
