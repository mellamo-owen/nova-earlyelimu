'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => { 
    fetchPayments(); 
    fetchSettings();
  }, []);

  const fetchPayments = async () => {
    const { data } = await supabase.from('payments').select('*, students(name, student_id_code)').order('created_at', { ascending: false });
    if (data) setPayments(data);
    setLoading(false);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').single();
    if (data) setSettings(data);
  };

  const handleApprove = async (paymentId, studentId, type) => {
    setProcessingId(paymentId);
    
    // Calculate the new expiry date
    const now = new Date();
    let expiry = new Date();
    
    if (type === 'weekly') {
      expiry.setDate(now.getDate() + 7); // 1 Week
    } else {
      expiry.setDate(now.getDate() + 56); // 8 Weeks
    }

    // 1. Update payment record
    await supabase.from('payments').update({ status: 'APPROVED' }).eq('id', paymentId);

    // 2. Unlock the student and set the exact expiry date
    await supabase.from('students').update({ 
      status: 'APPROVED', 
      payment_status: 'APPROVED',
      payment_expires_at: expiry.toISOString()
    }).eq('id', studentId);
    
    alert(`Payment approved! Unlocked for ${type === 'weekly' ? '1 Week' : '8 Weeks'}.`);
    fetchPayments();
    setProcessingId(null);
  };

  if (loading) return <div style={{ color: '#9CA3AF' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Payments</h1>
      <p style={{ color: '#9CA3AF', marginBottom: '2rem' }}>Approve payments to unlock student access.</p>

      <div style={{ background: '#1F2937', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #374151', marginBottom: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <p style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Paybill</p>
          <p style={{ fontWeight: 'bold', color: '#10B981' }}>{settings?.paybill_number || 'Loading...'}</p>
        </div>
        <div>
          <p style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Expected Weekly</p>
          <p style={{ fontWeight: 'bold', color: '#10B981' }}>KES 1,000</p>
        </div>
        <div>
          <p style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Expected Full</p>
          <p style={{ fontWeight: 'bold', color: '#10B981' }}>KES 8,000</p>
        </div>
      </div>

      <div style={{ background: '#1F2937', borderRadius: '12px', overflowX: 'auto', border: '1px solid #374151' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
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
                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#10B981' }}>{payment.student_id_entered}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: payment.status === 'PENDING' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', color: payment.status === 'PENDING' ? '#F59E0B' : '#10B981' }}>
                    {payment.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {payment.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleApprove(payment.id, payment.student_id, 'weekly')} 
                        disabled={processingId === payment.id}
                        style={{ background: '#3B82F6', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                      >
                        Unlock 1 Week
                      </button>
                      <button 
                        onClick={() => handleApprove(payment.id, payment.student_id, 'full')} 
                        disabled={processingId === payment.id}
                        style={{ background: '#10B981', color: 'black', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                      >
                        Unlock 8 Weeks
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Approved</span>
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
