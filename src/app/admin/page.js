'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, pending: 0, revenue: 0 });
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { count: total } = await supabase.from('students').select('*', { count: 'exact', head: true });
    const { count: pending } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'PENDING');
    
    // Get approved payments for revenue
    const { data: payments } = await supabase.from('payments').select('*, students(name)').eq('status', 'APPROVED').order('created_at', { ascending: false });
    
    const revenue = payments ? payments.length * 1000 : 0;
    if (payments) setRecentPayments(payments.slice(0, 5));

    setStats({ students: total || 0, pending: pending || 0, revenue });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '2rem' }}>Revenue & Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#064E3B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #065F46' }}>
          <p style={{ color: '#A7F3D0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Revenue (Approved)</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10B981' }}>KES {stats.revenue.toLocaleString()}</h2>
        </div>
        <div style={{ background: '#1F2937', padding: '1.5rem', borderRadius: '16px', border: '1px solid #374151' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Enrolled Students</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F3F4F6' }}>{stats.students}</h2>
        </div>
        <div style={{ background: '#1F2937', padding: '1.5rem', borderRadius: '16px', border: '1px solid #374151' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pending Registrations</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F59E0B' }}>{stats.pending}</h2>
        </div>
      </div>

      <div style={{ background: '#1F2937', padding: '1.5rem', borderRadius: '16px', border: '1px solid #374151' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Recent Approved Payments</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recentPayments.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#111827', borderRadius: '8px', border: '1px solid #374151' }}>
              <p style={{ fontWeight: 'bold' }}>{p.students?.name}</p>
              <p style={{ color: '#10B981' }}>KES 1,000</p>
            </div>
          ))}
          {recentPayments.length === 0 && <p style={{ color: '#9CA3AF' }}>No approved payments yet.</p>}
        </div>
      </div>
    </div>
  );
}
