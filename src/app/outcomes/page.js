'use client';

import { useRouter } from 'next/navigation';

export default function Outcomes() {
  const router = useRouter();

  return (
    <main style={{ minHeight: '100vh', background: '#F9FAFB', color: '#000000', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '700px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '0.5rem' }}>
            What Your Child Will Achieve
          </h1>
          <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
            By the end of the Nova earlyElimu Fullstack Course, your child will walk away with real, tangible assets.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* ITEM 1 */}
          <div style={{ display: 'flex', gap: '1rem', background: '#F9FAFB', padding: '1.5rem', borderRadius: '12px', borderLeft: '5px solid #1E3A8A' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1E3A8A' }}>1</div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#000000', marginBottom: '0.5rem' }}>A Real GitHub & LinkedIn Profile</h2>
              <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
                Your child will set up a professional GitHub account to host their code and a LinkedIn profile to showcase their early tech journey to the world.
              </p>
            </div>
          </div>

          {/* ITEM 2 */}
          <div style={{ display: 'flex', gap: '1rem', background: '#F9FAFB', padding: '1.5rem', borderRadius: '12px', borderLeft: '5px solid #10B981' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981' }}>2</div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#000000', marginBottom: '0.5rem' }}>Real Group & Personal Projects</h2>
              <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
                They won't just watch videos. They will build a personal portfolio website and collaborate on a real group e-commerce project.
              </p>
            </div>
          </div>

          {/* ITEM 3 */}
          <div style={{ display: 'flex', gap: '1rem', background: '#F9FAFB', padding: '1.5rem', borderRadius: '12px', borderLeft: '5px solid #000000' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000000' }}>3</div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#000000', marginBottom: '0.5rem' }}>NovaNest Verified Badge</h2>
              <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
                Upon completion, they receive a verified skills badge from NovaNest, proving their capability in HTML, CSS, and JavaScript.
              </p>
            </div>
          </div>

          {/* ITEM 4 */}
          <div style={{ display: 'flex', gap: '1rem', background: '#F9FAFB', padding: '1.5rem', borderRadius: '12px', borderLeft: '5px solid #1E3A8A' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1E3A8A' }}>4</div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#000000', marginBottom: '0.5rem' }}>Nova Labs Internship Opportunity</h2>
              <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
                Top performers get a chance to land an entry-level spot at Nova Labs to help develop real company projects, earn small compensations, and be mentored by industry pros.
              </p>
            </div>
          </div>

          {/* ITEM 5 */}
          <div style={{ display: 'flex', gap: '1rem', background: '#F9FAFB', padding: '1.5rem', borderRadius: '12px', borderLeft: '5px solid #10B981' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981' }}>5</div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#000000', marginBottom: '0.5rem' }}>NovaFinance Early Wealth Guidance</h2>
              <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
                Our NovaFinance sector will guide your child on how to handle and invest their earnings from an early age, building a foundation of financial intelligence.
              </p>
            </div>
          </div>

        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <button 
            onClick={() => router.push('/login')}
            style={{ background: '#1E3A8A', color: 'white', padding: '1rem 2.5rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', cursor: 'pointer', width: '100%' }}
          >
            Proceed to Login
          </button>
        </div>

      </div>
    </main>
  );
}

