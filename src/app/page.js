'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1E3A8A 100%)',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* NAVBAR */}
      <nav style={{
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px', height: '40px',
            background: '#10B981',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '1.2rem', color: '#000000',
          }}>N</div>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            Nova earlyElimu
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href='/login' style={{
            padding: '0.6rem 1.2rem',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            fontSize: '0.9rem',
          }}>Login</Link>
          <Link href='/register' style={{
            padding: '0.6rem 1.2rem',
            background: '#10B981',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.9rem',
            color: '#FFFFFF',
          }}>Register</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '4rem 2rem',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(16,185,129,0.15)',
          color: '#10B981',
          padding: '0.4rem 1rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          border: '1px solid rgba(16,185,129,0.3)',
        }}>
          Enrolling Now - Max 20 Kids Only
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: '800',
          lineHeight: '1.15',
          marginBottom: '1.5rem',
        }}>
          Same Teacher. <span style={{ color: '#10B981' }}>Max 20 Kids.</span>
          <br />
          Real Fullstack Projects.
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.15rem)',
          color: 'rgba(255,255,255,0.8)',
          maxWidth: '600px',
          marginBottom: '2.5rem',
        }}>
          Fullstack Development for Kids Age 8-12.
          Learn HTML, CSS, JavaScript, GitHub & build real websites together.
          Physical classes in Elburgon, Kenya — or join online.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href='/register' style={{
            padding: '1rem 2rem',
            background: '#10B981',
            color: '#FFFFFF',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '1rem',
          }}>Register My Child</Link>
          
          {/* UPDATED WHATSAPP LINK */}
          <a href='https://wa.me/254723510672' target="_blank" rel="noopener noreferrer" style={{
            padding: '1rem 2rem',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '1rem',
          }}>WhatsApp Us</a>
        </div>

        <div style={{
          marginTop: '3rem',
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.6)',
        }}>
          Week 1 is FREE · Then KES 1,000 for Weeks 2-8
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '1.5rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.5)',
      }}>
        © 2026 Nova earlyElimu · Elburgon, Kenya · Teacher: Mickowen Khaseke
      </footer>
    </main>
  );
}
