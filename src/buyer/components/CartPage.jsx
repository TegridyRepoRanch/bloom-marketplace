import { colors } from '../../shared/theme';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { OptimizedImage } from '../../shared/components/OptimizedImage';
import { getPriceUnitLabel } from '../lib/priceUnits';

// =============================================
// CART PAGE
// =============================================
export const CartPage = ({ cart, onUpdateQuantity, onRemove, onCheckout, onContinueShopping, t = (key) => key }) => {
  const isMobile = useIsMobile();
  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <section style={{ minHeight: '100vh', padding: isMobile ? '80px 16px 40px' : '120px 24px 80px', background: colors.cream }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontSize: isMobile ? 24 : 36, fontWeight: 800, color: colors.dark, marginBottom: isMobile ? 24 : 40, textAlign: 'center' }}>
          {t('cart_title')} 🛒
        </h2>

        {cart.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 80,
            background: colors.white, borderRadius: 24,
            boxShadow: '0 4px 20px rgba(45, 125, 70, 0.1)',
          }}>
            <span style={{ fontSize: 64 }}>🌿</span>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: colors.dark, marginTop: 20 }}>{t('cart_empty')}</h3>
            <p style={{ color: colors.gray, marginBottom: 32 }}>{t('cart_empty_sub')}</p>
            <button onClick={onContinueShopping} style={{
              padding: '14px 32px', borderRadius: 30, minHeight: 44,
              border: 'none', background: colors.gradient1,
              color: colors.white, fontWeight: 600, fontSize: 16,
              cursor: 'pointer', fontFamily: 'Plus Jakarta Sans',
            }}>
              {t('cart_browse')}
            </button>
          </div>
        ) : (
          <>
            <div style={{
              background: colors.white, borderRadius: 24,
              boxShadow: '0 4px 20px rgba(45, 125, 70, 0.1)',
              overflow: 'hidden',
            }}>
              {cart.map((item, index) => (
                <div key={index} style={{
                  display: isMobile ? 'grid' : 'flex', gridTemplateColumns: isMobile ? '60px 1fr 60px' : undefined, alignItems: isMobile ? 'start' : 'center', gap: isMobile ? 12 : 20,
                  padding: isMobile ? 16 : 24,
                  borderBottom: index < cart.length - 1 ? `1px solid ${colors.blush}` : 'none',
                }}>
                  {/* Image */}
                  <div style={{
                    width: isMobile ? 60 : 80, height: isMobile ? 60 : 80, borderRadius: 12,
                    overflow: 'hidden', flexShrink: 0,
                  }}>
                    <OptimizedImage
                      src={item.product.images?.[0]}
                      alt={item.product.title}
                      width={160}
                      style={{
                        width: isMobile ? 60 : 80,
                        height: isMobile ? 60 : 80,
                        background: colors.gradient1,
                      }}
                    />
                  </div>

                  {/* Details - on mobile, spans full width below image */}
                  <div style={{ gridColumn: isMobile ? '1 / -1' : undefined }}>
                    <h4 style={{ fontSize: isMobile ? 14 : 18, fontWeight: 600, color: colors.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.title}</h4>
                    <p style={{ fontSize: isMobile ? 12 : 14, color: colors.gray, marginTop: 4 }}>฿{parseFloat(item.product.price).toFixed(0)} {getPriceUnitLabel(item.product.price_unit, t, item.product.category)}</p>
                  </div>

                  {/* Quantity - right side on mobile */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, justifySelf: isMobile ? 'end' : undefined }}>
                    <button onClick={() => onUpdateQuantity(index, item.quantity - 1)} style={{
                      width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, minHeight: 44, borderRadius: '50%',
                      border: `1px solid ${colors.blush}`, background: colors.white,
                      cursor: 'pointer', fontSize: isMobile ? 14 : 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>-</button>
                    <span style={{ fontWeight: 600, minWidth: 20, textAlign: 'center', fontSize: isMobile ? 12 : 14 }}>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(index, item.quantity + 1)} style={{
                      width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, minHeight: 44, borderRadius: '50%',
                      border: `1px solid ${colors.blush}`, background: colors.white,
                      cursor: 'pointer', fontSize: isMobile ? 14 : 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>+</button>
                  </div>

                  {/* Price - spans full width on mobile, below quantity */}
                  <div style={{ gridColumn: isMobile ? '1 / -1' : undefined, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: isMobile ? 8 : 0 }}>
                    <p style={{ fontSize: isMobile ? 14 : 20, fontWeight: 700, color: colors.primary }}>
                      ฿{(item.product.price * item.quantity).toFixed(0)}
                    </p>
                    {/* Remove */}
                    <button onClick={() => onRemove(index)} style={{
                      width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, minHeight: 44, borderRadius: '50%',
                      border: 'none', background: colors.blush,
                      color: colors.primary, cursor: 'pointer', fontSize: isMobile ? 16 : 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>×</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Checkout */}
            <div style={{
              background: colors.white, borderRadius: 24, padding: isMobile ? 20 : 32, marginTop: isMobile ? 16 : 24,
              boxShadow: '0 4px 20px rgba(45, 125, 70, 0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? 16 : 24 }}>
                <span style={{ fontSize: isMobile ? 16 : 20, color: colors.dark }}>{t('checkout_total')}</span>
                <span style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800, color: colors.primary }}>฿{total.toFixed(0)}</span>
              </div>

              <button onClick={onCheckout} style={{
                width: '100%', padding: isMobile ? '14px 24px' : '20px 40px', borderRadius: 30, minHeight: 44,
                border: 'none', background: colors.gradient1,
                color: colors.white, fontWeight: 700, fontSize: isMobile ? 16 : 18,
                cursor: 'pointer', boxShadow: '0 8px 30px rgba(45, 125, 70, 0.4)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                {t('cart_checkout')} 🚀
              </button>

              <p style={{ textAlign: 'center', marginTop: 12, color: colors.gray, fontSize: isMobile ? 12 : 14 }}>
                📱 {t('cart_promptpay')}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
