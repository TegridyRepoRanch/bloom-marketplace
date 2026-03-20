import { colors } from '../../shared/theme';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { Accordion } from './Accordion';
import { RestockAlert } from './RestockAlert';

// =============================================
// HOW IT WORKS
// =============================================
export const HowItWorksPage = ({ t = (key) => key }) => {
  const isMobile = useIsMobile();
  return (
  <section style={{ minHeight: '100vh', padding: isMobile ? '80px 16px 40px' : '120px 24px 80px', background: colors.white }}>
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Steps */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 80 }}>
        <h2 style={{ fontSize: isMobile ? 28 : 48, fontWeight: 800, color: colors.dark, marginBottom: 16 }}>{t('how_title')} <span aria-hidden="true">✨</span></h2>
        <p style={{ fontSize: 18, color: colors.gray }}>{t('hero_subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: isMobile ? 48 : 80 }}>
        {[
          { icon: '🔍', title: t('delivery_how_1').split('.')[0] || 'Browse', desc: t('products_subtitle') },
          { icon: '🛒', title: t('delivery_how_2').split('.')[0] || 'Order', desc: t('delivery_how_2') },
          { icon: '📱', title: t('promptpay_option'), desc: t('promptpay_desc') },
          { icon: '🌱', title: t('delivery_how_3').split('\u2014')[0] || 'Receive', desc: t('delivery_how_3') },
        ].map((step, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: colors.gradient1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 30px rgba(45, 125, 70, 0.3)' }}>
              <span style={{ fontSize: 48 }}>{step.icon}</span>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: colors.dark, color: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 700 }}>{i + 1}</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: colors.dark, marginBottom: 12 }}>{step.title}</h3>
            <p style={{ fontSize: 15, color: colors.gray }}>{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Delivery Coverage */}
      <div style={{
        background: 'linear-gradient(135deg, #E8F5E9, #FFF8E1)', borderRadius: 24,
        padding: isMobile ? 24 : 40, textAlign: 'center', marginBottom: isMobile ? 48 : 80,
      }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🚛</span>
        <h3 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: colors.dark, marginBottom: 8 }}>{t('delivery_how_title')}</h3>
        <p style={{ fontSize: 16, color: colors.gray }}>{t('landing_coverage')}</p>
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: isMobile ? 48 : 80 }}>
        <h3 style={{ fontSize: isMobile ? 22 : 32, fontWeight: 800, color: colors.dark, marginBottom: 24, textAlign: 'center' }}>{t('faq_title')}</h3>
        <Accordion items={[
          { q: t('faq_q1'), a: t('faq_a1') },
          { q: t('faq_q2'), a: t('faq_a2') },
          { q: t('faq_q3'), a: t('faq_a3') },
          { q: t('faq_q4'), a: t('faq_a4') },
        ]} t={t} />
      </div>

      {/* Returns */}
      <div style={{
        background: colors.cream, borderRadius: 20, padding: isMobile ? 24 : 32,
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: isMobile ? 48 : 80,
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 40 }}>🔄</span>
        <div>
          <h4 style={{ fontSize: 18, fontWeight: 700, color: colors.dark, marginBottom: 4 }}>{t('returns_title')}</h4>
          <p style={{ fontSize: 14, color: colors.gray }}>{t('returns_desc')}</p>
        </div>
      </div>

      {/* Lead Capture */}
      <RestockAlert t={t} />
    </div>
  </section>
); };
