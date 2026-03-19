// =============================================
// 404 NOT FOUND PAGE
// =============================================
export const NotFoundPage = ({ onNavigate, t }) => (
  <section style={{
    minHeight: '70vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    padding: '60px 24px', fontFamily: 'Plus Jakarta Sans, sans-serif',
  }}>
    <span style={{ fontSize: 80, marginBottom: 16 }}>🌿</span>
    <h1 style={{ fontSize: 48, fontWeight: 800, color: '#1A2E1A', marginBottom: 8 }}>404</h1>
    <h2 style={{ fontSize: 24, fontWeight: 600, color: '#2D7D46', marginBottom: 16 }}>
      {t('page_not_found') || 'Page Not Found'}
    </h2>
    <p style={{ fontSize: 16, color: '#666', maxWidth: 400, marginBottom: 32, lineHeight: 1.6 }}>
      {t('page_not_found_desc') || "The page you're looking for doesn't exist or has been moved."}
    </p>
    <button
      onClick={() => onNavigate('home')}
      style={{
        padding: '14px 32px', borderRadius: 30, border: 'none',
        background: 'linear-gradient(135deg, #2D7D46, #4CAF50)', color: '#fff',
        fontWeight: 700, fontSize: 16, cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(45,125,70,0.3)',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}
    >
      {t('back_home') || 'Back to Home'}
    </button>
  </section>
);
