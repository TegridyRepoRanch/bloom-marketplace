import { colors } from '../../shared/theme';
import { useIsMobile } from '../../shared/hooks/useIsMobile';

// =============================================
// ABOUT PAGE
// =============================================
export const AboutPage = ({ t = (key) => key }) => { const isMobile = useIsMobile(); return (
  <section style={{ minHeight: '100vh', padding: '120px 24px 80px', background: `linear-gradient(180deg, ${colors.peach} 0%, ${colors.cream} 100%)` }}>
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <h2 style={{ fontSize: 48, fontWeight: 800, color: colors.dark }}>{t('about_title')} 🌿</h2>
      </div>
      <div style={{ background: colors.white, borderRadius: isMobile ? 20 : 32, padding: isMobile ? 28 : 60, boxShadow: '0 10px 40px rgba(45, 125, 70, 0.15)', textAlign: 'center' }}>
        <span style={{ fontSize: 80 }}>🌿</span>
        <p style={{ fontSize: 20, color: colors.dark, lineHeight: 1.8, marginTop: 32 }}>
          {t('about_p1')}
        </p>
        <p style={{ fontSize: 17, color: colors.gray, lineHeight: 1.8, marginTop: 24 }}>
          {t('about_p2')}
        </p>
      </div>
    </div>
  </section>
); };
