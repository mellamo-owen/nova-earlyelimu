export default function Loading() {
  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, height: '4px', 
      background: '#3B82F6', zIndex: 9999, 
      animation: 'loadingBar 2s infinite ease-in-out' 
    }}>
      <style>{`
        @keyframes loadingBar {
          0% { width: 0%; opacity: 1; }
          50% { width: 80%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

