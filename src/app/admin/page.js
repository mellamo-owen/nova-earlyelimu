'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, pending: 0, revenue: 0 });
  const [recentStudents, setRecentStudents] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentStudents();
  }, []);

  const fetchStats = async () => {
    // Get total students
    const { count: total } = await supabase.from('students').select('*', { count: 'exact', head: true });
    
    // Get pending approvals
    const { count: pending } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'PENDING');
    
    // Get approved payments (Revenue calculation)
    const { data: payments } = await supabase.from('payments').select('*').eq('status', 'APPROVED');
    const revenue = payments ? payments.length * 1000 : 0; // Rough estimate based on KES 1,000 per payment

    setStats({ students: total || 0, pending: pending || 0, revenue });
  };

  const fetchRecentStudents = async () => {
    const { data } = await supabase.from('students').select('*, parents(name)').order('created_at', { ascending: false }).limit(5);
    if (data) setRecentStudents(data);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>Dashboard</h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Welcome back, Mickowen. Here is your daily overview.</p>
        </div>
      </div>

      {/* TOP STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* TOTAL STUDENTS CARD (DARK GREEN) */}
        <div style={{ background: '#064E3B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #065F46' }}>
          <p style={{ color: '#A7F3D0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Students</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10B981' }}>{stats.students}</h2>
          <p style={{ color: '#A7F3D0', fontSize: '0.8rem', marginTop: '0.5rem' }}>Enrolled in the program</p>
        </div>

        {/* PENDING CARD */}
        <div style={{ background: '#1F2937', padding: '1.5rem', borderRadius: '16px', border: '1px solid #374151' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pending Approvals</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F59E0B' }}>{stats.pending}</h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.8rem', marginTop: '0.5rem' }}>Waiting for your review</p>
        </div>

        {/* REVENUE CARD */}
        <div style={{ background: '#1F2937', padding: '1.5rem', borderRadius: '16px', border: '1px solid #374151' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Est. Revenue</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F3F4F6' }}>KES {stats.revenue.toLocaleString()}</h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.8rem', marginTop: '0.5rem' }}>Based on approved payments</p>
        </div>

      </div>

      {/* BOTTOM SECTION GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* RECENT STUDENTS LIST */}
        <div style={{ background: '#1F2937', padding: '1.5rem', borderRadius: '16px', border: '1px solid #374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Recent Registrations</h2>
            <span style={{ fontSize: '0.8rem', color: '#10B981', cursor: 'pointer' }}>View All</span>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#9CA3AF', fontSize: '0.85rem', borderBottom: '1px solid #374151' }}>
                <th style={{ paddingBottom: '1rem' }}>Student Name</th>
                <th style={{ paddingBottom: '1rem' }}>Parent</th>
                <th style={{ paddingBottom: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.map((student) => (
                <tr key={student.id} style={{ borderBottom: '1px solid #374151' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>{student.name}</td>
                  <td style={{ padding: '1rem 0', color: '#9CA3AF' }}>{student.parents?.name}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ background: student.status === 'PENDING' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', color: student.status === 'PENDING' ? '#F59E0B' : '#10B981', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* QUICK ACTIONS CARD */}
        <div style={{ background: '#064E3B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #065F46' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10B981', marginBottom: '1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontWeight: 'bold', color: '#F3F4F6' }}>Approve Payments</p>
              <p style={{ fontSize: '0.8rem', color: '#A7F3D0' }}>Review M-Pesa codes</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontWeight: 'bold', color: '#F3F4F6' }}>Post Announcement</p>
              <p style={{ fontSize: '0.8rem', color: '#A7F3D0' }}>Notify parents & students</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
