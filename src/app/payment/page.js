'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  
  // Form State
  const [mpesaCode, setMpesaCode] = useState('');
  const [smsText, setSmsText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStudent();
  }, []);

  const fetchStudent = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data } = await supabase.from('students').select('*').eq('parent_id', user.id).single();
    if (data) setStudent(data);
    setLoading(false);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!student) {
      setMessage('No student profile found.');
      return;
    }
    if (!mpesaCode) {
      setMessage('Please enter the M-Pesa transaction code.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      // Save payment info to the database
      const { error: dbError } = await supabase
        .from('payments')
        .insert([{
          student_id: student.id,
          receipt_url: smsText, // Using the receipt_url column for the SMS text
          student_id_entered: mpesaCode,
          status: 'PENDING'
        }]);

      if (dbError) throw new Error('Database save failed: ' + dbError.message);

      // Update student payment status
      await supabase.from('students').update({ payment_status: 'PENDING' }).eq('id', student.id);

      setMessage('Payment submitted successfully! Teacher Mickowen will verify it soon.');
      setMpesaCode('');
      setSmsText('');

    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: 'white', background: '#0A1931', minHeight: '100vh' }}>Loading...</div>;

  return (
    <main style={{ minHeight: '100vh', background: '#F5F7FA', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <button onClick={() => router.push('/parent')} style={{ background: 'transparent', color: '#0A1931', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '2rem' }}>
          ← Back to Dashboard
        </button>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h1 style={{ color: '#0A1931', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Confirm Payment</h1>
          <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Enter your M-Pesa transaction details below.</p>

          {/* PAYMENT INSTRUCTIONS */}
          <div style={{ background: '#0A1931', padding: '1.5rem', borderRadius: '12px', color: 'white', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#FF6B00' }}>Payment Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
              <p><strong>Paybill:</strong> 200999</p>
              <p><strong>Account Number:</strong> 0025060062865</p>
              <p><strong>Account Name:</strong> Mickowen Khaseke</p>
              <p><strong>Amount:</strong> KES 1,000 (Weekly) or KES 8,000 (Full)</p>
            </div>
          </div>

          {message && (
            <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1rem', background: message.includes('success') ? '#D1FAE5' : '#FEE2E2', color: message.includes('success') ? '#065F46' : '#B91C1C' }}>
              {message}
            </div>
          )}

          <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#0A1931' }}>M-Pesa Transaction Code (e.g., QK47XXXXXX)</label>
              <input type='text' value={mpesaCode} onChange={(e) => setMpesaCode(e.target.value.toUpperCase())} required placeholder="Enter the 10-character code" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black', textTransform: 'uppercase' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#0A1931' }}>Paste M-Pesa SMS (Optional but recommended)</label>
              <textarea rows="4" value={smsText} onChange={(e) => setSmsText(e.target.value)} placeholder="Paste the full M-Pesa message here for faster verification..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', color: 'black' }}></textarea>
            </div>

            <button type='submit' disabled={submitting} style={{ background: '#FF6B00', color: '#0A1931', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', marginTop: '1rem', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Submitting...' : 'Submit Payment Details'}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}