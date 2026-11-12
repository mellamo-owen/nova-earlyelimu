'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#000000', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      {/* NAVBAR */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* 🔥 TEST LOGO */}
          <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ width: '80px', height: '80px', objectFit: 'contain' }} 
            />
          </div>
          
          <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Nova earlyElimu</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href='/login' style={{ padding: '0.6rem 1.2rem', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '0.9rem', color: 'white', textDecoration: 'none' }}>Login</Link>
          <Link href='/register' style={{ padding: '0.6rem 1.2rem', background: '#10B981', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', color: 'white', textDecoration: 'none' }}>Register</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ 
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '4rem 2rem', 
        backgroundImage: 'url("/hero-bg.jpg")', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '1.5rem' }}>
            Same Teacher. <span style={{ color: '#10B981' }}>Max 20 Kids.</span><br />Real Fullstack Projects.
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#D1D5DB', maxWidth: '600px', marginBottom: '2.5rem' }}>
            Fullstack Development for Kids Age 8-12. Learn HTML, CSS, JavaScript, and build real websites together.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href='/register' style={{ padding: '1rem 2rem', background: '#10B981', color: 'white', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', textDecoration: 'none' }}>Register My Child</Link>
            <a href='https://wa.me/254723510672' style={{ padding: '1rem 2rem', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '10px', fontWeight: '600', fontSize: '1rem', color: 'white', textDecoration: 'none' }}>WhatsApp Us</a>
          </div>
        </div>
      </section>
    </main>
  );
}
