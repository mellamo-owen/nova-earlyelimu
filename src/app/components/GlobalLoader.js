'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function GlobalLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500); // Hide after 500ms
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '3px',
      background: '#10B981', zIndex: 9999,
      animation: 'loadingBar 0.5s ease-in-out forwards'
    }}>
      <style>{`
        @keyframes loadingBar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

