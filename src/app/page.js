'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#000000', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      {/* NAVBAR */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* LOGO PLACEHOLDER: Make sure you have public/logo.png */}
          <img src="/logo.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} onError={(e) => e.target.style.display = 'none'} />
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Nova earlyElimu</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href='/login' style={{ padding: '0.6rem 1.2rem', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '0.9rem' }}>Login</Link>
          <Link href='/register' style={{ padding: '0.6rem 1.2rem', background: '#10B981', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Register</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ 
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '4rem 2rem', 
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url("/hero-bg.jpg")', 
        backgroundSize: 'cover', backgroundPosition: 'center'
      }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '1.5rem' }}>
          Same Teacher. <span style={{ color: '#10B981' }}>Max 20 Kids.</span><br />Real Fullstack Projects.
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#D1D5DB', maxWidth: '600px', marginBottom: '2.5rem' }}>
          Fullstack Development for Kids Age 8-12. Learn HTML, CSS, JavaScript, and build real websites together.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href='/register' style={{ padding: '1rem 2rem', background: '#10B981', color: 'white', borderRadius: '10px', fontWeight: '700', fontSize: '1rem' }}>Register My Child</Link>
          <a href='https://wa.me/254723510672' style={{ padding: '1rem 2rem', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '10px', fontWeight: '600', fontSize: '1rem' }}>WhatsApp Us</a>
        </div>
      </section>
    </main>
  );
}
