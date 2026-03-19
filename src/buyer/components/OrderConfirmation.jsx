import { colors } from '../../shared/theme';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { Confetti } from '../../shared/components/Confetti';
import { ShareButtons } from './ShareButtons';

// =============================================
// ORDER CONFIRMATION
// =============================================
export const OrderConfirmationPage = ({ order, onContinueShopping, t = (key) => key }) => { const isMobile = useIsMobile(); return (
  <section style={{ minHeight: '100vh', padding: '120px 24px 80px', background: colors.cream }}>
    <Confetti active={true} />
    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        background: colors.white, borderRadius: isMobile ? 20 : 32, padding: isMobile ? 28 : 60,
        boxShadow: '0 10px 40px rgba(45, 125, 70, 0.15)',
      }}>
        <div className="animate-scale-in" style={{
          width: 120, height: 120, borderRadius: '50%',
          background: colors.mint, margin: '0 auto 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 60 }}>✓</span>
        </div>

        <h2 style={{ fontSize: 36, fontWeight: 800, color: colors.dark, marginBottom: 16 }}>
          {t('order_confirmed')} 🎉
        </h2>

        <p style={{ fontSize: 18, color: colors.gray, marginBottom: 32 }}>
          {t('order_thanks', { name: order.name })}
        </p>

        <div style={{
          background: colors.cream, borderRadius: 16, padding: 24, marginBottom: 32,
          textAlign: 'left',
        }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: colors.dark, marginBottom: 16 }}>{t('order_delivery')}</h4>
          <p style={{ color: colors.gray, lineHeight: 1.8 }}>
            📍 {order.address}, {order.district}, {order.province} {order.postalCode}<br />
            📱 {order.phone}
          </p>
        </div>

        <div style={{
          background: '#E8F5E9', borderRadius: 16, padding: 24, marginBottom: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 28 }}>✅</span>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontWeight: 700, color: colors.dark, display: 'block' }}>{t('payment_proof_received')}</span>
            <span style={{ fontSize: 13, color: colors.gray }}>{t('payment_proof_processing')}</span>
          </div>
        </div>

        <p style={{ color: colors.gray, marginBottom: 24, fontSize: 14 }}>
          {t('order_vendor_contact')} 🌿
        </p>

        {/* Share your order */}
        <div style={{ marginBottom: 32 }}>
          <ShareButtons
            url="https://siamclones.com/"
            text={t('share_order_text')}
            t={t}
          />
        </div>

        <button onClick={onContinueShopping} style={{
          padding: '18px 36px', borderRadius: 30,
          border: 'none', background: colors.gradient1,
          color: colors.white, fontWeight: 700, fontSize: 18,
          cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
          boxShadow: '0 8px 30px rgba(45, 125, 70, 0.4)',
        }}>
          {t('order_continue')} 🌿
        </button>
      </div>
    </div>
  </section>
); };
